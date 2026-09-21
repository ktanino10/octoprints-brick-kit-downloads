import { validateStudyComparisons, chooseStudyComparison } from './study-comparisons.js';
export { countDelta } from './shape-options-data.js';

export const REFINEMENT_ID = 'mona-fine-c-refinement-20260921';
export const REFINEMENT_URL = '/archive/mona-refinement.json';
export const REFINEMENT_ROLES = Object.freeze(['fine-c', 'previous-360', 'refined-360']);
export const REFINEMENT_BASELINES = Object.freeze({ 'fine-c': 13837, 'previous-360': 10908 });
const sourceRoles = { 'fine-c': 'phase1-fine-c', 'previous-360': 'dense360-pilot', 'refined-360': 'fine-c-refined360' };
const gates = {
  current_revision_unchanged: 'r3-8mm-20260920', previous_study_unchanged: 'mona-likeness-360-20260921',
  selection: 'NOT_SELECTED', visual_approval: 'PENDING', physical_fit: 'UNKNOWN',
  retention_strength: 'UNKNOWN', slicer_status: 'NOT_SLICED', full_print: 'ON_HOLD',
};
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const count = (value) => Number.isSafeInteger(value) && value >= 0;
const positive = (value) => Number.isFinite(value) && value > 0;
const dimensions = (value) => Array.isArray(value) && value.length === 3 && value.every(positive);
const hash = (value) => typeof value === 'string' && /^[0-9a-f]{64}$/.test(value);
const text = (value) => typeof value === 'string' && value.trim().length > 0;
const requireThat = (condition, message) => { if (!condition) throw new Error(message); };

export function refinementPath(value) {
  requireThat(typeof value === 'string' && !value.includes('\\') && !/%(?:2e|2f|5c)/i.test(value),
    'Mona比較資料のパスが不正です。');
  const path = value.startsWith('artifacts/') ? `/${value}` : value;
  const prefix = `/artifacts/studies/${REFINEMENT_ID}/`;
  const url = new URL(path, 'https://archive.invalid');
  requireThat(url.origin === 'https://archive.invalid' && !url.search && !url.hash
    && path.startsWith(prefix) && url.pathname.startsWith(prefix),
  'Mona比較資料が今回の公開範囲外を参照しています。');
  return url.pathname;
}

export function validateRefinementPointer(pointer) {
  requireThat(object(pointer) && pointer.schema_version === 1 && pointer.study_id === REFINEMENT_ID
    && ['INPUT_WAIT', 'READY'].includes(pointer.state)
    && Object.entries(gates).every(([key, value]) => pointer[key] === value),
  'Mona改良比較の状態・前版不変・未採用の記録が不正です。');
  if (pointer.state === 'INPUT_WAIT') {
    requireThat(pointer.data_url === undefined && pointer.data_sha256 === undefined,
      '未受領のMona比較に、実画像や実数量の取得先を付けることはできません。');
  } else {
    refinementPath(pointer.data_url);
    requireThat(hash(pointer.data_sha256) && /^[0-9a-f]{40}$/.test(pointer.source_commit),
      'Mona比較の固定コミットまたは照合ハッシュがありません。');
  }
  return pointer;
}

export function validateRefinementStudy(study, pointer) {
  validateRefinementPointer(pointer);
  requireThat(pointer.state === 'READY' && object(study) && study.schema_version === 1
    && study.study_id === pointer.study_id && study.kind === 'MONA_FINE_C_REFINEMENT_COMPARISON'
    && study.source_commit === pointer.source_commit && hash(study.source_study_sha256)
    && Object.entries(gates).every(([key, value]) => study[key] === value)
    && Array.isArray(study.rows) && study.rows.length === 3,
  'Mona改良比較データと公開記録が一致しません。');
  const roles = new Set();
  for (const row of study.rows) {
    requireThat(object(row) && REFINEMENT_ROLES.includes(row.role) && !roles.has(row.role)
      && text(row.candidate_id) && row.source_role === sourceRoles[row.role], 'Mona改良の初期C・前36 cm・新案の対応が不正です。');
    roles.add(row.role);
    const metrics = row.metrics;
    requireThat(object(metrics) && count(metrics.part_count) && metrics.part_count > 0
      && count(metrics.unique_types) && metrics.unique_types > 0 && metrics.unique_types <= metrics.part_count
      && count(metrics.one_by_one_exceptions) && metrics.one_by_one_exceptions <= metrics.part_count
      && count(metrics.layer_count) && metrics.layer_count > 0
      && count(metrics.grip_long_ge_15_8_count) && metrics.grip_long_ge_15_8_count <= metrics.part_count
      && dimensions(metrics.minimum_part_mm) && dimensions(metrics.dimensions_mm),
    'Monaの実部品数・型数・小部品・層・寸法がマニフェストとBOMに結び付いていません。');
    const families = metrics.body_height_families;
    requireThat(Array.isArray(families) && families.length > 0
      && families.every((family) => object(family) && positive(family.body_height_mm)
        && count(family.part_count) && family.part_count > 0
        && count(family.unique_types) && family.unique_types > 0 && family.unique_types <= family.part_count)
      && new Set(families.map((family) => family.body_height_mm)).size === families.length
      && families.reduce((total, family) => total + family.part_count, 0) === metrics.part_count
      && families.reduce((total, family) => total + family.unique_types, 0) === metrics.unique_types
      && Math.abs(Math.min(...families.map((family) => family.body_height_mm)) - metrics.minimum_part_mm[2]) < 1e-8,
    '本体高さごとの実部品数・型数が、改良比較の合計と一致しません。');
    const evidence = row.evidence;
    requireThat(object(evidence) && hash(evidence.manifest_sha256) && hash(evidence.bom_sha256)
      && hash(evidence.geometry_sha256) && hash(evidence.identity_projection_sha256)
      && evidence.counted_instances === metrics.part_count && evidence.bom_ids_match === true
      && evidence.bom_types_colors_poses_steps_match === true,
    '改良案の実ID・色・配置・順序と画像の根拠が一致しません。');
    if (Object.hasOwn(REFINEMENT_BASELINES, row.role)) {
      requireThat(metrics.part_count === REFINEMENT_BASELINES[row.role]
        && evidence.reference_identity_verified === true
        && row.candidate_id === (row.role === 'fine-c' ? 'mona-fine' : 'mona-dense360')
        && row.pitch_mm === (row.role === 'fine-c' ? 4 : 8),
      '初期Cまたは前36 cm案の同一性・数量が変更されています。');
    } else {
      requireThat(row.candidate_id === 'mona-fine-c360' && row.pitch_mm === 8
        && row.stud_diameter_mm === 4.8 && row.open_underside === true
        && row.color_mode === 'WHOLE_PART_SINGLE_COLOR' && evidence.whole_part_colors_verified === true
        && evidence.render_instances_match_manifest === true,
      '改良案は実部品ごとの単色と実形状に対応し、8 mm接合規格を維持する必要があります。');
    }
  }
  const previous = study.rows.find((row) => row.role === 'previous-360');
  const improved = study.rows.find((row) => row.role === 'refined-360');
  requireThat(improved.candidate_id !== previous.candidate_id
    && improved.evidence.identity_projection_sha256 !== previous.evidence.identity_projection_sha256,
  '前のモデルと同じ実構成を、別の改良案として表示できません。');
  requireThat(text(study.appearance_limit) && text(study.assembly_tradeoff) && text(study.assembly_layer_note)
    && Array.isArray(study.changes) && study.changes.length > 0 && study.changes.every(text)
    && Array.isArray(study.remaining_differences) && study.remaining_differences.length > 0 && study.remaining_differences.every(text),
  '改良点・残る差・本体高さと配置層の説明がありません。');
  validateStudyComparisons(study.comparisons, { roles: REFINEMENT_ROLES, validatePath: refinementPath,
    physicalReferenceRoles: ['previous-360', 'refined-360'] });
  for (const group of study.comparisons.filter((group) => group.kind !== 'scale')) {
    const next = group.images.find((image) => image.role === 'refined-360');
    requireThat(group.images.filter((image) => image.role !== 'refined-360').every((image) => image.sha256 !== next.sha256),
      '初期Cや前36 cmの画像を、新改良の画像として代用できません。');
  }
  return study;
}

export function chooseRefinementComparison(study, requested) {
  return chooseStudyComparison(study, requested, 'face');
}
