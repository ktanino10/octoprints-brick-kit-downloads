export const CHARACTERS = Object.freeze({
  mona: { name: 'Mona', subtitle: 'Curious by nature', accent: '#6441ac', short: 'MON' },
  copilot: { name: 'Copilot', subtitle: 'Ready to explore', accent: '#28797e', short: 'COP' },
  ducky: { name: 'Ducky', subtitle: 'A little sunshine', accent: '#a47a13', short: 'DUC' },
});
export const STYLES = Object.freeze({
  chunky: { name: 'ざっくり', english: 'Chunky' },
  balanced: { name: 'バランス', english: 'Balanced' },
  fine: { name: 'こまかく', english: 'Fine' },
  practical8: { name: '8 mm共通ブロック', english: 'Common blocks' },
});
export const SELECTED_STAGE = 'SELECTED_PROTOTYPE';
export const SELECTION_URL = '/design/selected-designs.json';
export const SUPPORT_CLASSES = Object.freeze({
  GROUND: '基底面に配置・実機未確認',
  SEATED_NOMINAL: '公称着座・保持力未確認',
  RETENTION_REQUIRED: '保持対策が必要',
  CRADLE_AND_RETENTION_REQUIRED: '受け台と保持対策が必要',
  CRADLE_SUPPORTED_RETENTION_REQUIRED: '仮支持台が必要・保持力未確認',
});
const RETENTION_RISK_LABELS = Object.freeze({
  SELF_WEIGHT_CANTILEVER_REQUIRES_RETENTION_OR_TEMPORARY_SUPPORT: '単体自重の片持ち条件・保持対策または仮支持が必要',
  SINGLE_ROUND_STUD_ROTATIONAL_RETENTION_UNKNOWN: '丸スタッド1本・回転保持は未確認',
  HANGING_WHISKER_AFTER_CRADLE_REMOVAL: '仮支持台を外した後のひげ先端の保持は未確認',
});
export const retentionRiskText = (code) => Object.hasOwn(RETENTION_RISK_LABELS, code) ? RETENTION_RISK_LABELS[code] : code;
const VISUAL_BASELINE_SCOPES = new Set([
  'Phase1 exterior baseline only',
  'Visual baseline only: character, source palette, approximately 180 mm scale and chosen grid feel',
]);

const partIdCollator = new Intl.Collator('en', { numeric: true });

export function artifactPath(value) {
  requireThat(text(value), 'ファイルの参照先がありません。');
  const path = value.startsWith('artifacts/') ? `/${value}` : value;
  requireThat(path.startsWith('/artifacts/') && !path.includes('\\'), 'ローカルの artifacts 以外は読み込めません。');
  const parsed = new URL(path, 'http://local.invalid');
  requireThat(parsed.origin === 'http://local.invalid' && parsed.pathname.startsWith('/artifacts/'), 'ファイルの参照先が不正です。');
  requireThat(!parsed.username && !parsed.password, '認証情報を含む参照先は使えません。');
  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

export function revisionPath(value, revision) {
  requireThat(typeof revision === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(revision), '試作版の識別子が不正です。');
  const path = artifactPath(value);
  requireThat(new URL(path, 'http://local.invalid').pathname.startsWith(`/artifacts/selected/${revision}/`), '選択版のデータに別の版のファイルが混在しています。');
  return path;
}

function validateWarnings(warnings) {
  requireThat(warnings === undefined || (Array.isArray(warnings) && warnings.every(text)), '注意事項の形式が不正です。');
}

function validateStatus(status, visualSelection = 'PENDING') {
  requireThat(record(status), '検証範囲の宣言がありません。');
  requireThat(status.visual_selection === visualSelection
    && status.physical_fit === 'UNKNOWN'
    && status.production_export === 'BLOCKED', 'PHASE 1外観基準の選択範囲・嵌合未確認・出力ブロックの宣言と一致しません。');
}

export function validateCatalog(catalog) {
  if (catalog?.schema_version === 3) return validateCommonCatalog(catalog);
  requireThat(record(catalog) && catalog.schema_version === 1, 'カタログの形式に対応していません（schema_version: 1 が必要です）。');
  const selected = catalog.stage === SELECTED_STAGE;
  const pathFor = selected ? (value) => revisionPath(value, catalog.revision) : artifactPath;
  pathFor(catalog.prototypes_url);
  if (selected) {
    requireThat(catalog.selection_url === SELECTION_URL, '選択記録の参照先が不正です。');
    requireThat(Array.isArray(catalog.candidates) && catalog.candidates.length === 3, '選択版には3キャラクターの案が必要です。');
  }
  if (catalog.contact_sheet_url) pathFor(catalog.contact_sheet_url);
  requireThat(Array.isArray(catalog.candidates) && catalog.candidates.length > 0, '比較できる案がカタログにありません。');
  const ids = new Set();
  const combinations = new Set();
  for (const candidate of catalog.candidates) {
    requireThat(record(candidate) && text(candidate.id), '案のIDがありません。');
    requireThat(!ids.has(candidate.id), `案のIDが重複しています: ${candidate.id}`);
    requireThat(owns(CHARACTERS, candidate.character) && ['chunky', 'balanced', 'fine'].includes(candidate.style), '未対応のキャラクターまたは解像度です。');
    const combination = `${candidate.character}/${candidate.style}`;
    requireThat(!combinations.has(combination), `キャラクターと解像度が重複しています: ${combination}`);
    requireThat(text(candidate.label) && positive(candidate.pitch_mm) && positive(candidate.layer_mm), `${candidate.id} の表示情報が不正です。`);
    pathFor(candidate.manifest_url);
    for (const key of ['render_url', 'blend_url', 'video_url', 'bom_url', 'evidence_url', 'summary_bom_url', 'assembly_steps_url', 'native_assembly_url']) {
      if (candidate[key]) pathFor(candidate[key]);
    }
    validateMetrics(candidate.metrics, candidate.id);
    validateStatus(candidate.status, selected ? 'BASELINE_APPROVED' : 'PENDING');
    if (selected) requireThat(nonnegativeInteger(candidate.metrics.baseline_part_count)
      && candidate.metrics.baseline_part_count > 0, `${candidate.id} の外観基準部品数がありません。`);
    validateWarnings(candidate.warnings);
    ids.add(candidate.id);
    combinations.add(combination);
  }
  if (catalog.evidence_url) pathFor(catalog.evidence_url);
  if (catalog.source_history_url) requireThat(artifactPath(catalog.source_history_url).startsWith('/artifacts/phase1/'), '履歴リンクはPhase1の記録を参照する必要があります。');
  if (selected && catalog.trial_sets !== undefined) validateTrialSets(catalog.trial_sets, catalog);
  return catalog;
}

export function validateManifest(manifest, candidateId) {
  if (manifest?.schema_version === 3) return validateCommonManifest(manifest, candidateId);
  requireThat(record(manifest) && [1, 2].includes(manifest.schema_version) && manifest.units === 'mm', '配置データの形式または単位が未対応です。mm / schema_version: 1 または 2 が必要です。');
  const selected = manifest.schema_version === 2;
  requireThat(manifest.candidate_id === candidateId, '選択した案と配置データのIDが一致しません。');
  requireThat(record(manifest.frame) && manifest.frame.up === '+Z'
    && manifest.frame.front === '-Y' && manifest.frame.handedness === 'right', '配置の座標系が契約と異なります（+Z上・−Y前・右手系）。');
  requireThat(record(manifest.palette) && record(manifest.types), '色または部品型の定義がありません。');
  for (const [id, color] of Object.entries(manifest.palette)) {
    requireThat(record(color) && /^#[0-9a-fA-F]{6}$/.test(color.hex)
      && text(color.name), `色 ${id} の定義が不正です。`);
  }
  for (const [id, type] of Object.entries(manifest.types)) {
    requireThat(record(type) && vector(type.cells, 2) && type.cells.every((v) => nonnegativeInteger(v) && v > 0)
      && positive(type.pitch_mm) && positive(type.layer_mm), `部品型 ${id} の定義が不正です。`);
    validateFootprint(type, id, selected);
  }
  requireThat(Array.isArray(manifest.parts) && manifest.parts.length > 0, '配置データに部品がありません。');
  const ids = new Set();
  const types = new Set();
  const colors = new Set();
  const layers = new Set();
  for (const part of manifest.parts) {
    requireThat(record(part) && text(part.id) && !ids.has(part.id), '部品IDが欠けているか、重複しています。');
    requireThat(owns(manifest.types, part.type_id) && owns(manifest.palette, part.color_id), `${part.id} の型または色が見つかりません。`);
    requireThat(vector(part.position_mm, 3)
      && (selected ? [0, 90, 180, 270] : [0, 90]).includes(part.rotation_z_deg)
      && nonnegativeInteger(part.layer)
      && nonnegativeInteger(part.step) && part.step > 0, `${part.id} の位置・回転・層・手順が不正です。`);
    requireThat(part.print_rotation_deg === undefined || vector(part.print_rotation_deg, 3), `${part.id} の出力姿勢が不正です。`);
    if (selected) {
      requireThat(Array.isArray(part.baseline_part_ids) && part.baseline_part_ids.length > 0
        && part.baseline_part_ids.every(text) && new Set(part.baseline_part_ids).size === part.baseline_part_ids.length, `${part.id} の基準部品IDが不正です。`);
      requireThat(typeof part.changed_grouping === 'boolean'
        && owns(SUPPORT_CLASSES, part.support_class), `${part.id} の組み替え・支持区分が不正です。`);
      requireThat(part.feature_tags === undefined || (Array.isArray(part.feature_tags) && part.feature_tags.every(text)), `${part.id} の特徴タグが不正です。`);
      requireThat(part.required_aids === undefined || (Array.isArray(part.required_aids)
        && part.required_aids.every(text) && new Set(part.required_aids).size === part.required_aids.length), `${part.id} の補助具参照が不正です。`);
      requireThat(part.retention_risks === undefined || (Array.isArray(part.retention_risks)
        && part.retention_risks.every(text) && new Set(part.retention_risks).size === part.retention_risks.length), `${part.id} の保持リスク記録が不正です。`);
      requireThat(part.self_weight_bearing_margin_mm === undefined || part.self_weight_bearing_margin_mm === null
        || finite(part.self_weight_bearing_margin_mm), `${part.id} の自重投影余裕が不正です。`);
    }
    ids.add(part.id);
    types.add(part.type_id);
    colors.add(part.color_id);
    layers.add(part.layer);
  }
  validateMetrics(manifest.metrics, manifest.candidate_id);
  const actual = { part_count: ids.size, unique_types: types.size, color_count: colors.size, layer_count: layers.size };
  for (const [key, value] of Object.entries(actual)) {
    requireThat(manifest.metrics[key] === value, `部品から集計した ${key}（${value}）が指標（${manifest.metrics[key]}）と一致しません。`);
  }
  validateStatus(manifest.status, selected ? 'BASELINE_APPROVED' : 'PENDING');
  if (selected) {
    const approval = manifest.visual_approval;
    requireThat(record(approval) && VISUAL_BASELINE_SCOPES.has(approval.scope)
      && approval.selected_candidate_id === candidateId
      && /^[0-9a-f]{64}$/i.test(approval.baseline_manifest_sha256)
      && approval.derivative_joint_review === 'PENDING_PHYSICAL_TEST', '外観基準の選択範囲、基準ハッシュ、または接合部の実機試験待ち宣言が不正です。');
    requireThat(nonnegativeInteger(manifest.metrics.baseline_part_count)
      && manifest.metrics.baseline_part_count > 0, '外観基準の部品数がありません。');
  }
  validateWarnings(manifest.warnings);
  const assembly = manifest.assembly;
  requireThat(record(assembly), '接触グラフの assembly 定義がありません。');
  requireThat(nonnegativeInteger(assembly.graph_components) && assembly.graph_components > 0, '接触グラフの連結成分数が不正です。');
  requireThat(Array.isArray(assembly.contact_edges), 'contact_edges は [下側部品ID, 上側部品ID, 接触スタッド数] の配列が必要です。');
  requireThat(nonnegativeInteger(assembly.contact_edge_count)
    && assembly.contact_edge_count === assembly.contact_edges.length, 'contact_edge_count が contact_edges の件数と一致しません。');
  requireThat(nonnegativeInteger(assembly.contact_stud_sites), 'contact_stud_sites は接触スタッド総数の整数が必要です。');
  requireThat(assembly.mechanical_validation === 'UNKNOWN', '実機嵌合は未検証です。mechanical_validation は UNKNOWN が必要です。');
  const contacts = new Set();
  let studSites = 0;
  for (const edge of assembly.contact_edges) {
    requireThat(Array.isArray(edge) && edge.length === 3
      && ids.has(edge[0]) && ids.has(edge[1]) && edge[0] !== edge[1]
      && nonnegativeInteger(edge[2]) && edge[2] > 0, '接触辺の部品IDまたはスタッド数が不正です。');
    const key = JSON.stringify(edge.slice(0, 2));
    requireThat(!contacts.has(key), '接触辺が重複しています。');
    contacts.add(key);
    studSites += edge[2];
  }
  requireThat(studSites === assembly.contact_stud_sites, '接触スタッド数の集計が宣言と一致しません。');
  requireThat(assembly.insertion_sweep_validation === undefined
    || assembly.insertion_sweep_validation === 'UNKNOWN'
    || (selected && ['PASS_CONSERVATIVE_VERTICAL', 'PASS_OCCUPANCY_PENDING_NATIVE_PROFILE'].includes(assembly.insertion_sweep_validation)),
  selected ? '差込経路の限定検証範囲が不正です。' : '差込経路の未検証宣言が不正です。');
  let underside = 0;
  for (const part of manifest.parts) {
    requireThat(part.attach_to === undefined || part.attach_to === null
      || (ids.has(part.attach_to) && part.attach_to !== part.id), `${part.id} の接続先候補が不正です。`);
    requireThat(part.insertion_axis === undefined || ['+Z', '-Z'].includes(part.insertion_axis), `${part.id} の差込方向候補が不正です。`);
    if (part.insertion_axis === '+Z') underside += 1;
  }
  requireThat(assembly.underside_attachment_count === undefined
    || assembly.underside_attachment_count === underside, '下側からの後付け候補数が個別部品と一致しません。');
  if (selected) {
    const aids = assembly.aids ?? [];
    requireThat(Array.isArray(aids), '補助具の定義が不正です。');
    const aidIds = new Set();
    for (const aid of aids) {
      requireThat(record(aid) && text(aid.id) && !aidIds.has(aid.id), '補助具IDが欠けているか、重複しています。');
      requireThat(aid.physical_strength === undefined || aid.physical_strength === 'UNKNOWN', '補助具の実機強度は未確認です。');
      requireThat(aid.part_ids === undefined || (Array.isArray(aid.part_ids) && aid.part_ids.every((id) => ids.has(id))), '補助具に不明な部品IDが含まれています。');
      aidIds.add(aid.id);
    }
    for (const part of manifest.parts) {
      requireThat((part.required_aids ?? []).every((id) => aidIds.has(id)), `${part.id} の必要な補助具が定義されていません。`);
    }
    const preparation = assembly.preparation_steps ?? [];
    requireThat(Array.isArray(preparation), '仮支持の準備条件が不正です。');
    const stepIds = new Set(manifest.parts.map((part) => part.step));
    const preparationIds = new Set();
    for (const step of preparation) {
      requireThat(record(step) && text(step.id) && !preparationIds.has(step.id)
        && aidIds.has(step.aid_id) && nonnegativeInteger(step.before_part_step)
        && stepIds.has(step.before_part_step) && text(step.instruction), '仮支持の準備条件に不明な補助具・順序候補・記述が含まれています。');
      preparationIds.add(step.id);
    }
    const fixtureParts = manifest.parts.filter((part) => part.required_aids?.length).length;
    requireThat(assembly.fixture_supported_parts === undefined || assembly.fixture_supported_parts === fixtureParts, '補助具が必要な部品数が個別部品と一致しません。');
    if (assembly.support_risk !== undefined) {
      const risk = assembly.support_risk;
      requireThat(record(risk) && record(risk.counts) && Object.values(risk.counts).every(nonnegativeInteger), '保持リスクの集計が不正です。');
      for (const field of ['strength', 'retention', 'physical_tipping']) {
        requireThat(risk[field] === undefined || risk[field] === 'UNKNOWN', '保持リスクの幾何評価を実機検証の完了と解釈できません。');
      }
      for (const [key, code] of [
        ['self_weight_cantilever', 'SELF_WEIGHT_CANTILEVER_REQUIRES_RETENTION_OR_TEMPORARY_SUPPORT'],
        ['single_stud', 'SINGLE_ROUND_STUD_ROTATIONAL_RETENTION_UNKNOWN'],
        ['cradle_retention_required', 'HANGING_WHISKER_AFTER_CRADLE_REMOVAL'],
      ]) {
        if (risk.counts[key] !== undefined) requireThat(risk.counts[key] === manifest.parts.filter((part) => part.retention_risks?.includes(code)).length, '保持リスクの件数が個別部品と一致しません。');
      }
    }
  }
  return manifest;
}

export function validatePrototypes(prototypes) {
  if (prototypes?.schema_version === 3) return validateCommonPrototypes(prototypes);
  requireThat(record(prototypes) && [1, 2].includes(prototypes.schema_version)
    && prototypes.units === 'mm' && ['body-bottom-center', 'body-bottom-bbox-center', 'body-bottom-BBOX-center'].includes(prototypes.origin)
    && record(prototypes.types), '部品形状の形式が不正です（mm・本体底面中心原点が必要です）。');
  for (const [id, type] of Object.entries(prototypes.types)) {
    requireThat(record(type) && vector(type.cells, 2)
      && type.cells.every((n) => nonnegativeInteger(n) && n > 0)
      && positive(type.pitch_mm) && positive(type.layer_mm)
      && vector(type.body_mm, 3) && type.body_mm.every(positive), `${id} の部品寸法が不正です。`);
    validateFootprint(type, id, prototypes.schema_version === 2);
    for (const key of ['stud_diameter_mm', 'stud_height_mm', 'socket_depth_mm']) {
      requireThat(positive(type[key]), `${id} の ${key} が不正です。`);
    }
    requireThat(Array.isArray(type.vertices) && type.vertices.length >= 3
      && type.vertices.every((v) => vector(v, 3)), `${id} の頂点データが不正です。`);
    requireThat(Array.isArray(type.faces) && type.faces.length > 0
      && type.faces.every((face) => Array.isArray(face) && face.length === 3
        && face.every((index) => nonnegativeInteger(index) && index < type.vertices.length)
        && new Set(face).size === 3), `${id} の三角形データが不正です。`);
    if (type.stl) artifactPath(type.stl);
  }
  return prototypes;
}

export function validateGeometryMatch(manifest, prototypes) {
  if (manifest.schema_version === 3) return validateCommonMatch(manifest, prototypes);
  for (const typeId of new Set(manifest.parts.map((part) => part.type_id))) {
    const source = manifest.types[typeId];
    const prototype = prototypes.types[typeId];
    requireThat(prototype, `${typeId} の実部品形状がありません。代替形状は作成しません。`);
    requireThat(source.cells.every((n, index) => n === prototype.cells[index])
      && source.pitch_mm === prototype.pitch_mm
      && source.layer_mm === prototype.layer_mm, `${typeId} の配置定義と実部品寸法が一致しません。`);
    if (source.footprint_cells) {
      requireThat(Array.isArray(prototype.footprint_cells), `${typeId} の実形状に占有セル定義がありません。`);
      const key = (cells) => cells.map((cell) => cell.join(',')).sort().join(';');
      requireThat(key(source.footprint_cells) === key(prototype.footprint_cells), `${typeId} の占有セルと実形状が一致しません。`);
    }
  }
}

export function makeIndex(manifest) {
  const partsById = new Map();
  const groups = new Map();
  const colors = new Map();
  const types = new Map();
  const layers = [...new Set(manifest.parts.map((p) => p.layer))].sort((a, b) => a - b);
  const steps = [...new Set(manifest.parts.map((p) => p.step))].sort((a, b) => a - b);
  for (const part of manifest.parts) {
    partsById.set(part.id, part);
    const key = `${part.type_id}\u0000${part.color_id}`;
    if (!groups.has(key)) groups.set(key, { typeId: part.type_id, colorId: part.color_id, parts: [] });
    groups.get(key).parts.push(part);
    colors.set(part.color_id, (colors.get(part.color_id) ?? 0) + 1);
    types.set(part.type_id, (types.get(part.type_id) ?? 0) + 1);
  }
  const sortedParts = [...manifest.parts].sort((a, b) => partIdCollator.compare(a.id, b.id));
  return { partsById, groups, colors, types, layers, steps, sortedParts,
    verticalGridMm: manifest.schema_version === 3 ? 3.2 : null };
}

export function isPartVisible(part, index, layerProgress, stepProgress) {
  if (layerProgress <= 0 || stepProgress <= 0) return false;
  return part.layer <= index.layers[Math.min(layerProgress, index.layers.length) - 1]
    && part.step <= index.steps[Math.min(stepProgress, index.steps.length) - 1];
}

export function displayPosition(part, explosion, center, layerMm) {
  const amount = Math.max(0, Math.min(1, explosion));
  const height = layerMm === null ? part.position_mm[2] : part.layer * layerMm;
  return [
    part.position_mm[0] + (part.position_mm[0] - center[0]) * amount * 0.36,
    part.position_mm[1] + (part.position_mm[1] - center[1]) * amount * 0.36,
    part.position_mm[2] + height * amount * 1.75,
  ];
}

export function findParts(index, manifest, query, visibleOnly, layerProgress, stepProgress, undersideOnly = false, supportClass = '') {
  const needle = query.trim().toLocaleLowerCase('ja');
  return index.sortedParts.filter((part) => {
    if (visibleOnly && !isPartVisible(part, index, layerProgress, stepProgress)) return false;
    if (undersideOnly && part.insertion_axis !== '+Z') return false;
    if (supportClass && part.support_class !== supportClass) return false;
    if (!needle) return true;
    const color = manifest.palette[part.color_id];
    return `${part.id} ${part.type_id} ${part.color_id} ${color.name} ${color.hex} ${part.baseline_part_ids?.join(' ') ?? ''} ${part.feature_tags?.join(' ') ?? ''} ${part.retention_risks?.join(' ') ?? ''} ${part.retention_risks?.map(retentionRiskText).join(' ') ?? ''}`.toLocaleLowerCase('ja').includes(needle);
  });
}

export function parseEvidenceStatus(value, revision = null) {
  if (!record(value) || !['CURRENT', 'STALE', 'MISSING'].includes(value.state)
    || !Array.isArray(value.details) || !value.details.every((detail) => typeof detail === 'string')
    || value.physical_fit !== 'UNKNOWN' || value.production_export !== 'BLOCKED') {
    throw new DataError('検証APIの応答を確認できません。最新性は不明です。');
  }
  if (revision && value.revision !== undefined && value.revision !== revision) throw new DataError('別の版の検証状態を受信しました。選択版の最新性は不明です。');
  return { state: value.state, details: [...value.details], physical_fit: 'UNKNOWN', production_export: 'BLOCKED' };
}

export function downloadEntries(catalog, candidate, { baselineOnly = false } = {}) {
  if (catalog.schema_version === 3) {
    const entries = [
      ['配置マニフェスト', 'JSON', candidate.manifest_url],
      ['部品表', 'CSV', candidate.bom_url],
      ['集計部品表', 'CSV', candidate.summary_bom_url],
      ['組立候補の記録', 'CSV', candidate.assembly_steps_url],
      ['この案のネイティブ組立CAD', 'FCSTD', candidate.native_assembly_url],
      ['組立ガイド・未検証の順序候補', 'MD', candidate.assembly_guide_url],
      ['完成形の実生成画像', 'PNG', candidate.render_url],
      ['同じ版の実生成分解画像', 'PNG', candidate.exploded_url],
      ['Blenderシーン', 'BLEND', candidate.blend_url],
      ['360°ターンテーブル', 'MP4', candidate.video_url],
    ];
    return entries.filter(([, , url]) => Boolean(url)).map(([label, extension, url]) => ({
      label, extension, url: commonFile(url, catalog.revision),
    }));
  }
  const entries = [
    ['配置マニフェスト', 'JSON', candidate.manifest_url],
    ['部品表', 'CSV', candidate.bom_url],
    ['集計部品表', 'CSV', candidate.summary_bom_url],
    ['組立候補の記録', 'CSV', candidate.assembly_steps_url],
    ['この案のネイティブ組立CAD', 'FCSTD', baselineOnly ? null : candidate.native_assembly_url],
    ['比較用レンダー', 'PNG', candidate.render_url],
    ['Blenderシーン', 'BLEND', candidate.blend_url],
    ['360°ターンテーブル', 'MP4', baselineOnly ? null : candidate.video_url],
  ];
  const native = baselineOnly ? null : candidate.native_cad ?? catalog.native_cad;
  if (record(native)) {
    const shared = catalog.stage === SELECTED_STAGE && !candidate.native_cad;
    const label = (name, url) => shared && url
      ? `${name}・共通資料（${new URL(artifactPath(url), 'http://local.invalid').pathname.split('/').slice(-2).join('/')}）` : name;
    entries.push([label('ネイティブ部品CAD', native.fcstd_url), 'FCSTD', native.fcstd_url]);
    entries.push([label('嵌合試験片CAD', native.coupon_fcstd_url), 'FCSTD', native.coupon_fcstd_url]);
    entries.push([label('部品CAD交換形式', native.step_url), 'STEP', native.step_url]);
    if (Array.isArray(native.coupon_stl_urls)) {
      native.coupon_stl_urls.forEach((url, index) => entries.push([label(`嵌合試験片 ${index + 1}`, url), 'STL', url]));
    }
    entries.push(['ネイティブCADの証跡', 'JSON', native.evidence_url]);
    entries.push(['嵌合試験片の検討ガイド', 'JSON', native.guide_url]);
  }
  entries.push(['この案の検証証跡', 'JSON', candidate.evidence_url]);
  if (!baselineOnly && catalog.evidence_url !== candidate.evidence_url) entries.push(['全体の検証証跡', 'JSON', catalog.evidence_url]);
  if (!baselineOnly && record(catalog.comparison_urls)) entries.push(['このキャラクターの3案比較', 'JPG', catalog.comparison_urls[candidate.character]]);
  if (!baselineOnly) entries.push(['外観レビュー用データ一式', 'ZIP', catalog.review_data_url]);
  const pathFor = catalog.stage === SELECTED_STAGE ? (url) => revisionPath(url, catalog.revision) : artifactPath;
  return entries.filter(([, , url]) => Boolean(url)).map(([label, extension, url]) => ({
    label, extension, url: pathFor(url),
  }));
}

export function validateTrialSets(sets, catalog) {
  requireThat(Array.isArray(sets), '試験片セットの形式が不正です。');
  const pitches = new Set();
  for (const set of sets) {
    requireThat(record(set) && positive(set.pitch_mm) && !pitches.has(set.pitch_mm)
      && catalog.candidates.some((candidate) => candidate.pitch_mm === set.pitch_mm), '試験片のピッチが選択版と一致しません。');
    pitches.add(set.pitch_mm);
    requireThat(positive(set.nozzle_recommendation_mm) && Array.isArray(set.parts) && set.parts.length > 0, '試験片またはノズル仮定の定義が不正です。');
    requireThat(set.optional_parts === undefined || Array.isArray(set.optional_parts), '任意の試験片の形式が不正です。');
    for (const key of ['diametral_clearances_mm', 'clearances_mm']) {
      if (set[key] !== undefined) requireThat(Array.isArray(set[key]) && set[key].length > 0 && set[key].every(finite), '試験片の直径差条件が不正です。');
    }
    for (const part of [...set.parts, ...(set.optional_parts ?? [])]) {
      requireThat(record(part) && text(part.label) && nonnegativeInteger(part.quantity) && part.quantity > 0, '試験片の名称または数量が不正です。');
      requireThat(part.optional === undefined || typeof part.optional === 'boolean', '任意の試験片の区分が不正です。');
      revisionPath(part.url, catalog.revision);
    }
    const count = set.parts.filter((part) => !part.optional).reduce((sum, part) => sum + part.quantity, 0);
    requireThat(set.piece_count === undefined || set.piece_count === count, '試験片の個数と数量内訳が一致しません。');
    for (const field of ['instructions_url', 'plate_url', 'native_url', 'layout_url', 'plate_stl_url', 'plate_step_url', 'csv_url', 'parts_csv_url']) {
      if (set[field]) revisionPath(set[field], catalog.revision);
    }
  }
  return sets;
}

export function assemblyScope(assembly) {
  const sourceDetails = [
    assembly?.insertion_scope,
    assembly?.insertion_sweep_scope,
    ...(Array.isArray(assembly?.insertion_sweep_assumptions) ? assembly.insertion_sweep_assumptions : []),
    assembly?.independent_order_check?.scope,
  ].filter((value) => typeof value === 'string' && value.length > 0);
  if (assembly?.insertion_sweep_validation === 'PASS_OCCUPANCY_PENDING_NATIVE_PROFILE') {
    return {
      label: '格子経路のみ確認・実形状照合待ち',
      detail: '占有セルの経路チェックまでの暫定結果です。ネイティブ接合断面の照合は未完了で、実機の嵌合・保持力・工具アクセスも未確認です。',
      sourceDetails,
    };
  }

  return assembly?.insertion_sweep_validation === 'PASS_CONSERVATIVE_VERTICAL'
    ? { label: '公称・純上下経路のみ検査済み', detail: '公称寸法での純上下移動と接合断面だけの検査です。実機の嵌合・保持力・強度・工具アクセスを保証しません。', sourceDetails }
    : { label: '未検証 / UNKNOWN', detail: '差込経路・工具アクセスは未検証です。実機で確認済みの組立説明書ではありません。', sourceDetails };
}

export function assemblySetup(manifest) {
  const parts = manifest.parts.filter((part) => part.required_aids?.length);
  const steps = manifest.assembly.preparation_steps ?? [];
  const aids = manifest.assembly.aids ?? [];
  return {
    fixtureParts: parts.length,
    steps,
    firstPartStep: steps.length ? Math.min(...steps.map((step) => step.before_part_step)) : null,
    aidCount: new Set(steps.map((step) => step.aid_id)).size,
    allFixturePartsDownward: parts.length > 0 && parts.every((part) => part.insertion_axis === '-Z'),
    retentionRequiredBeforeRemoval: aids.some((aid) => aid.removal_gate === 'DO_NOT_REMOVE_UNTIL_PHYSICAL_RETENTION_CONFIRMED'),
  };
}
import {
  DataError, requireThat, record, finite, nonnegativeInteger, positive, vector, text, owns,
  validateFootprint, validateMetrics,
} from '../../assets/data-contracts.js';
import { commonFile, validateCommonCatalog, validateCommonManifest, validateCommonPrototypes, validateCommonMatch } from '../../assets/common-blocks.js';
export { DataError, validateFootprint, validateMetrics } from '../../assets/data-contracts.js';
