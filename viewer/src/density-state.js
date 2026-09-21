import {
  DENSITY_ID, densityCaseIdentity, densityAssert as check,
  isObject, isVector, isHash, isCount, validateDensityFile,
} from '../../assets/density-data.js';

const partCollator = new Intl.Collator('en', { numeric: true });
const finite = (value) => typeof value === 'number' && Number.isFinite(value);

export function radialPosition(part, amount, out = [0, 0, 0]) {
  check(finite(amount) && amount >= 0 && amount <= 1, '放射分解の量は0から1の範囲で指定してください。');
  for (let axis = 0; axis < 3; axis++) out[axis] = amount === 0
    ? part.position_mm[axis] : part.position_mm[axis] + part.radial_offset_mm[axis] * amount;
  return out;
}

export function validateRootAnchoredStructure(manifest) {
  const identity = densityCaseIdentity(manifest.candidate_id);
  const contract = manifest.animation_contract;
  check(identity?.revision === 'whisker-root-v2' && manifest.geometry_revision === identity.revision
    && manifest.logical_case_id === identity.logicalId && contract?.sequence_mode === 'BODY_FIRST_ROOT_ANCHORED',
  '支持段による取付順は、検証対象のMona根元改訂だけに限定します。');
  check(Array.isArray(manifest.aids) && manifest.aids.length === 0
    && manifest.parts.every((part) => Array.isArray(part.required_aids) && part.required_aids.length === 0),
  '支台なしの取付順に、外付け・組立仮支台が含まれています。');
  const ordered = [...manifest.parts].sort((a, b) => a.step - b.step);
  const prior = new Set();
  for (const [index, part] of ordered.entries()) {
    const before = ordered[index - 1];
    check(typeof part.id === 'string' && !prior.has(part.id) && part.step === index + 1
      && finite(part.assembly_stage_z_mm) && isCount(part.assembly_course)
      && (!before || (part.assembly_stage_z_mm >= before.assembly_stage_z_mm - 1e-7
        && part.assembly_course >= before.assembly_course
        && (part.assembly_course !== before.assembly_course
          || Math.abs(part.assembly_stage_z_mm - before.assembly_stage_z_mm) <= 1e-7))),
    '根元改訂の支持段・工程番号が底側からの順序と一致しません。');
    for (const dependencies of [part.support_ids, part.insertion_predecessor_ids]) {
      check(Array.isArray(dependencies) && new Set(dependencies).size === dependencies.length
        && dependencies.every((id) => prior.has(id)),
      '必要な支持・差込み先行部品より前に、部品を取り付ける順序になっています。');
    }
    prior.add(part.id);
  }
  let nextStep = 1;
  check(Array.isArray(contract.stages) && contract.stages.length > 0, '制作元の組立工程区分がありません。');
  for (const stage of contract.stages) {
    check(stage.start_step === nextStep && isCount(stage.end_step) && stage.end_step >= stage.start_step
      && stage.end_step <= ordered.length && finite(stage.support_z_mm)
      && Math.abs(stage.support_z_mm - ordered[stage.start_step - 1].assembly_stage_z_mm) <= 1e-7,
    '根元改訂の工程表示と実際の支持高さが一致しません。');
    nextStep = stage.end_step + 1;
  }
  check(nextStep === ordered.length + 1, '最後の組立工程に未収録の部品があります。');
  return manifest;
}

function validateRootEvidenceBinding(manifest, proof) {
  check(isObject(proof), '新版の取付順は、実形状に結び付いた工程検査記録を確認するまで表示できません。');
  validateDensityFile(manifest.root_validation);
  const support = manifest.whisker_support;
  check(isObject(support) && support.external_aid_count === 0 && support.assembly_aid_count === 0
    && support.status === 'DIGITAL_SELF_SUPPORTING_UNTESTED' && support.physical_validation === 'UNKNOWN'
    && support.geometry_revision === manifest.geometry_revision && support.all_categories_geometry_match === true
    && isHash(manifest.source_manifest_sha256) && support.manifest_sha256 === manifest.source_manifest_sha256
    && manifest.root_validation.path === `/artifacts/studies/${DENSITY_ID}/validation/${manifest.candidate_id}-whisker-support.json`
    && manifest.root_validation.sha256 === support.sequence_evidence_sha256
    && support.assembly_validation_ref?.sha256 === manifest.root_validation.sha256
    && isHash(manifest.geometry_sequence_identity_sha256) && isHash(manifest.native_root_contact_evidence_sha256)
    && support.geometry_sequence_identity_sha256 === manifest.geometry_sequence_identity_sha256
    && support.attachment_evidence_sha256 === manifest.native_root_contact_evidence_sha256
    && proof.schema_version === 1 && proof.case_id === manifest.candidate_id
    && proof.logical_case_id === manifest.logical_case_id && proof.geometry_revision === manifest.geometry_revision
    && proof.geometry_sequence_identity_sha256 === manifest.geometry_sequence_identity_sha256
    && proof.native_root_contact_evidence_sha256 === manifest.native_root_contact_evidence_sha256
    && proof.status === support.status && proof.physical_validation === 'UNKNOWN'
    && proof.external_aid_count === 0 && proof.assembly_aid_count === 0
    && proof.actual_parts === manifest.parts.length && proof.actual_types === manifest.metrics.unique_types
    && proof.floating_seed_steps === 0 && proof.blocked_vertical_body_columns === 0
    && proof.source_occupied_cells_unchanged === true && proof.source_visible_colors_unchanged === true
    && proof.body_first_all_steps_supported === true
    && proof.slicer_supports === 'UNKNOWN_SEPARATE_FROM_NO_ASSEMBLY_STANDS',
  '根元改訂の証拠が実ID・形状・組立順・支台数と一致しません。');
  const native = proof.actual_native_root_checks, gravity = proof.gravity_balance;
  check(native?.result === 'PASS_ACTUAL_BODY_ROOT_BREP_CONTACTS'
    && native.gravity_balance_result === 'PASS_ALL_NOMINAL_CAD_STATIC_MOMENT_BOUNDS'
    && native.external_aid_count === 0 && native.assembly_aid_count === 0
    && gravity?.result === native.gravity_balance_result && gravity.physical_mass_measured === false
    && Array.isArray(proof.modules) && proof.modules.length > 0
    && Array.isArray(native.modules) && native.modules.length === proof.modules.length
    && Array.isArray(gravity.modules) && gravity.modules.length === proof.modules.length
    && Array.isArray(proof.root_structural_sections) && proof.root_structural_sections.length === proof.modules.length,
  '根元の実CAD接触・断面・組立途中の重心検査が未完了です。');
  const byId = new Map(manifest.parts.map((part) => [part.id, part])), seen = new Set();
  for (const module of proof.modules) {
    const part = byId.get(module.part_id);
    const body = native.modules.find((item) => item.part_id === module.part_id);
    const balance = gravity.modules.find((item) => item.part_id === module.part_id);
    const section = proof.root_structural_sections.find((item) => item.part_id === module.part_id);
    check(part && !seen.has(part.id) && module.type_id === part.type_id && module.step === part.step
      && module.physical_bottom_z_mm === part.position_mm[2] && module.receiving_body_stage_z_mm === part.assembly_stage_z_mm
      && Array.isArray(module.actual_body_support_ids) && module.actual_body_support_ids.length > 0
      && module.actual_body_support_ids.every((id) => part.support_ids.includes(id))
      && body?.actual_single_solid === true && body.native_root_type === part.type_id && body.module_insertion_step === part.step
      && section?.native_single_solid === true && section.type_id === part.type_id
      && finite(section.minimum_effective_section_area_mm2) && section.minimum_effective_section_area_mm2 > 0
      && section.material_strength_infill_layer_orientation === 'UNMEASURED'
      && balance?.result === 'PASS_NOMINAL_CAD_STATIC_MOMENT_BOUND'
      && finite(balance.required_margin_mm) && balance.required_margin_mm >= 1
      && finite(balance.minimum_support_margin_mm) && balance.minimum_support_margin_mm >= balance.required_margin_mm
      && Array.isArray(balance.downstream_payloads) && Array.isArray(balance.assembly_prefix_checks)
      && balance.assembly_prefix_checks.length === balance.downstream_payloads.length + 1,
    '根元の実CAD接触・断面・組立途中の重心検査が未完了です。');
    const expected = [part.id, ...balance.downstream_payloads.map((item) => item.part_id)];
    check(new Set(expected).size === expected.length, '根元改訂の証拠が実ID・形状・組立順・支台数と一致しません。');
    for (const [index, id] of expected.entries()) {
      const item = balance.assembly_prefix_checks[index], payload = byId.get(id);
      check(payload && item.after_step === payload.step
        && (item.added_part_id === id || (index === 0 && item.added_part_id === null))
        && (index === 0 || payload.step > byId.get(expected[index - 1]).step)
        && finite(item.minimum_support_margin_mm) && item.minimum_support_margin_mm >= balance.required_margin_mm,
      '根元の実CAD接触・断面・組立途中の重心検査が未完了です。');
    }
    seen.add(part.id);
  }
}

export function validateGuideManifest(manifest, candidateId, rootEvidence = null) {
  const identity = densityCaseIdentity(candidateId);
  check(isObject(manifest) && manifest.schema_version === 1 && manifest.study_id === DENSITY_ID
    && manifest.candidate_id === candidateId
    && identity && (!identity.revision || (manifest.logical_case_id === identity.logicalId
      && manifest.geometry_revision === identity.revision))
    && manifest.units === 'mm' && manifest.position_origin === 'body-bottom-center'
    && manifest.frame?.up === '+Z' && manifest.frame.front === '-Y' && manifest.frame.handedness === 'right',
  '実組立ガイドの案・単位・原点・座標系が一致しません。');
  check(isObject(manifest.types) && isObject(manifest.palette) && Array.isArray(manifest.parts)
    && manifest.parts.length > 0 && manifest.metrics?.part_count === manifest.parts.length,
  '実型・色・個別部品の定義がありません。');
  check(manifest.status?.selection === 'NOT_SELECTED' && manifest.status.physical_fit === 'UNKNOWN'
    && manifest.status.retention_strength === 'UNKNOWN' && manifest.status.slicer_status === 'NOT_SLICED'
    && manifest.status.full_print === 'ON_HOLD', '実3Dの未採用・物理未検証・印刷保留の状態が不正です。');
  for (const [id, type] of Object.entries(manifest.types)) {
    check(isObject(type) && isVector(type.body_mm) && type.body_mm.every((n) => n > 0)
      && type.pitch_mm === 8 && (type.kind === 'temporary_support' ? type.stud_diameter_mm === null : type.stud_diameter_mm === 4.8)
      && finite(type.body_height_mm) && type.body_height_mm > 0
      && type.body_mm[2] === type.body_height_mm && isHash(type.geometry_sha256),
    `実部品型 ${id} の8 mm規格・高さ・メッシュ指紋が不正です。`);
    if (type.files !== undefined) {
      check(isObject(type.files), '型別ファイルの対応が不正です。');
      for (const file of Object.values(type.files)) validateDensityFile(file, { download: true });
    }
  }
  for (const color of Object.values(manifest.palette)) {
    check(isObject(color) && /^#[0-9a-fA-F]{6}$/.test(color.hex) && typeof color.name === 'string',
      '実部品の単色定義が不正です。');
  }
  check(Array.isArray(manifest.aids), '実際の仮支持台の一覧がありません。未生成の支持物は作成しません。');
  const aidIds = new Set();
  for (const aid of manifest.aids) {
    check(isObject(aid) && typeof aid.id === 'string' && !aidIds.has(aid.id)
      && Object.hasOwn(manifest.types, aid.type_id) && isVector(aid.position_mm)
      && [0, 90, 180, 270].includes(aid.rotation_z_deg)
      && isCount(aid.required_before_step) && aid.required_before_step > 0
      && aid.required_before_step <= manifest.parts.length && aid.retention_validation === 'UNKNOWN',
    '仮支持台の実形状・位置・必要な順序が不正です。');
    aidIds.add(aid.id);
  }
  const ids = new Map(), ranks = new Set(), typeIds = new Set();
  for (const part of manifest.parts) {
    check(isObject(part) && typeof part.id === 'string' && part.id.length > 0 && !ids.has(part.id)
      && Object.hasOwn(manifest.types, part.type_id) && Object.hasOwn(manifest.palette, part.color_id)
      && isVector(part.position_mm) && [0, 90, 180, 270].includes(part.rotation_z_deg)
      && isCount(part.step) && part.step > 0 && part.step <= manifest.parts.length && !ranks.has(part.step)
      && isCount(part.assembly_course) && isVector(part.radial_offset_mm)
      && Math.hypot(...part.radial_offset_mm) > 0
      && Array.isArray(part.support_ids) && part.support_ids.every((id) => typeof id === 'string'),
    '実部品のID・位置・順序・支持・放射方向が不正です。');
    ids.set(part.id, part);
    ranks.add(part.step);
    typeIds.add(part.type_id);
    check(Array.isArray(part.required_aids) && part.required_aids.every((id) => aidIds.has(id)),
      '必要な仮支持台が実データに含まれていません。');
    check(part.required_aids.every((id) => manifest.aids.find((aid) => aid.id === id).required_before_step <= part.step),
      '仮支持台の準備順序が、それを必要とする部品より後になっています。');
    if (part.print_map !== undefined) {
      check(isObject(part.print_map) && typeof part.print_map.plate_id === 'string'
        && typeof part.print_map.slot_id === 'string' && isHash(part.print_map.source_sha256),
      '印刷配置のplate・slot・出典を実ファイルへ結び付ける必要があります。');
      validateDensityFile(part.print_map.file, { download: true });
    }
  }
  check(typeIds.size === manifest.metrics.unique_types && ranks.size === manifest.parts.length,
    '実部品と使用型・組立順の合計が一致しません。');
  check(Array.isArray(manifest.geometry_files) && manifest.geometry_files.length > 0,
    '実ネイティブ形状の共有データがありません。箱や円柱で代用しません。');
  manifest.geometry_files.forEach((file) => validateDensityFile(file));
  const contract = manifest.animation_contract;
  check(isObject(contract) && contract.explosion === 'ABSOLUTE_RADIAL_OFFSETS'
    && contract.assembly === 'BOTTOM_UP_SOURCE_ORDER'
    && contract.disassembly_validation === 'NOT_SIMULATED'
    && contract.physical_assembly === 'UNKNOWN' && isVector(contract.radial_center_mm),
  '放射分解・底からの組立の表示契約がありません。');
  const rootAnchored = contract.sequence_mode === 'BODY_FIRST_ROOT_ANCHORED';
  if (identity.revision || rootAnchored) {
    check(rootAnchored, '新版の取付順は、実形状に結び付いた工程検査記録を確認するまで表示できません。');
    validateRootEvidenceBinding(manifest, rootEvidence);
    validateRootAnchoredStructure(manifest);
  } else check(contract.sequence_mode === undefined || contract.sequence_mode === 'BOTTOM_UP_SOURCE_ORDER',
    '放射分解・底からの組立の表示契約がありません。');
  const ordered = [...manifest.parts].sort((a, b) => a.step - b.step);
  for (let index = 0; index < ordered.length; index++) {
    const part = ordered[index], before = ordered[index - 1];
    check(part.step === index + 1 && (rootAnchored || !before || (part.position_mm[2] >= before.position_mm[2] - 1e-7
      && part.assembly_course >= before.assembly_course)), '組立順が底から順に並んでいません。');
    for (const support of part.support_ids) {
      check(ids.has(support) && ids.get(support).step < part.step, '必要な支持部品より先に組み立てる順序になっています。');
    }
  }
  const signs = { x: new Set(), y: new Set() };
  for (const part of ordered) {
    const type = manifest.types[part.type_id];
    const center = [part.position_mm[0], part.position_mm[1], part.position_mm[2] + type.body_height_mm / 2];
    const direction = center.map((value, axis) => value - contract.radial_center_mm[axis]);
    const length = Math.hypot(...direction);
    if (length > 1e-7) check(direction.reduce((dot, n, axis) => dot + n * part.radial_offset_mm[axis], 0) > 0,
      '放射分解の移動がモデル中心から外向きになっていません。');
    else check(part.radial_fallback === true, '中心部品には固定した放射方向が必要です。');
    if (Math.abs(part.radial_offset_mm[0]) > 1e-7) signs.x.add(Math.sign(part.radial_offset_mm[0]));
    if (Math.abs(part.radial_offset_mm[1]) > 1e-7) signs.y.add(Math.sign(part.radial_offset_mm[1]));
  }
  check(signs.x.size === 2 && signs.y.size === 2, '前後左右に広がる360度放射分解になっていません。');
  check(Array.isArray(contract.stages) && contract.stages.length > 0, '制作元の組立工程区分がありません。');
  let nextStep = 1;
  const stageIds = new Set();
  for (const stage of contract.stages) {
    check(typeof stage.id === 'string' && !stageIds.has(stage.id) && typeof stage.label === 'string'
      && isCount(stage.start_step) && stage.start_step === nextStep
      && isCount(stage.end_step) && stage.end_step >= stage.start_step && stage.end_step <= ordered.length,
    '組立工程区分が全IDを順番に覆っていません。');
    nextStep = stage.end_step + 1;
    stageIds.add(stage.id);
  }
  check(nextStep === ordered.length + 1, '最後の組立工程に未収録の部品があります。');
  return manifest;
}

export function guideIndex(manifest) {
  const ordered = [...manifest.parts].sort((a, b) => a.step - b.step);
  const byId = new Map(), groups = new Map(), courses = [];
  for (const part of ordered) {
    byId.set(part.id, part);
    const key = `${part.type_id}\0${part.color_id}`;
    if (!groups.has(key)) groups.set(key, { typeId: part.type_id, colorId: part.color_id, parts: [] });
    groups.get(key).parts.push(part);
    let course = courses.at(-1);
    if (!course || course.id !== part.assembly_course) {
      course = { id: part.assembly_course, bottom_z_mm: part.position_mm[2],
        support_z_mm: part.assembly_stage_z_mm ?? part.position_mm[2], start: part.step - 1, end: part.step };
      courses.push(course);
    }
    course.end = part.step;
  }
  return { ordered, byId, groups, courses, stages: manifest.animation_contract.stages };
}

export function courseBoundary(index, count, direction) {
  check(Number.isSafeInteger(count) && count >= 0 && count <= index.ordered.length
    && [-1, 1].includes(direction), '配置層の送り位置が不正です。');
  if (direction === 1) return index.courses.find((course) => course.end > count)?.end ?? index.ordered.length;
  return [...index.courses].reverse().find((course) => course.start < count)?.start ?? 0;
}

export function stageRange(index, id) {
  const stage = index.stages.find((item) => item.id === id);
  check(stage, '指定された実組立工程がありません。');
  return [stage.start_step - 1, stage.end_step];
}

export function samePartDestinations(index, part) {
  return index.groups.get(`${part.type_id}\0${part.color_id}`)?.parts ?? [];
}

export function searchGuideParts(index, text, { sameAs = null, page = 0, size = 30 } = {}) {
  const needle = text.trim().toLocaleLowerCase('en-US');
  const source = sameAs ? samePartDestinations(index, sameAs) : index.ordered;
  const results = needle ? source.filter((part) => [part.id, part.type_id, part.color_id].some((value) => value.toLowerCase().includes(needle))) : source;
  const pages = Math.max(1, Math.ceil(results.length / size));
  const current = Math.max(0, Math.min(page, pages - 1));
  return { total: results.length, page: current, pages, parts: results.slice(current * size, (current + 1) * size) };
}

export function sortedBOM(index) {
  return [...index.groups.values()].sort((a, b) => partCollator.compare(a.typeId, b.typeId) || partCollator.compare(a.colorId, b.colorId));
}

export class AssemblyPlayback {
  constructor(total, onChange, { rate = 8 } = {}) {
    check(isCount(total) && total > 0 && finite(rate) && rate > 0, '組立再生の件数・速度が不正です。');
    this.total = total;
    this.onChange = onChange;
    this.rate = rate;
    this.count = 0;
    this.end = total;
    this.playing = false;
    this.last = null;
    this.credit = 0;
  }
  seek(count) {
    check(isCount(count) && count <= this.total, '組立の進行は0から全個数までです。');
    this.count = count; this.credit = 0; this.last = null;
    this.onChange(count);
  }
  play(start = this.count, end = this.total) {
    check(isCount(start) && isCount(end) && start <= end && end <= this.total, '再生する実組立の範囲が不正です。');
    this.end = end; this.seek(start); this.playing = start < end;
  }
  pause() { this.playing = false; this.last = null; this.credit = 0; }
  tick(now) {
    if (!this.playing) return false;
    check(finite(now), '組立再生の時刻が不正です。');
    if (this.last === null) { this.last = now; return true; }
    const elapsed = Math.max(0, Math.min(now - this.last, 250));
    this.last = now;
    this.credit += elapsed * this.rate / 1000;
    const increment = Math.floor(this.credit);
    if (increment > 0) {
      this.credit -= increment;
      this.count = Math.min(this.end, this.count + increment);
      this.onChange(this.count);
    }
    if (this.count >= this.end) this.pause();
    return this.playing;
  }
}
