export const SHAPE_STUDY_URL = '/archive/shape-study.json';
export const SHAPE_STUDY_ID = 'shape-study-20260920';
export const SHAPE_VARIANTS = Object.freeze(['baseline-r3', 'plate-refined', 'contour-refined']);
export const SHAPE_CHARACTERS = Object.freeze(['mona', 'copilot', 'ducky']);
export const BASELINE_COUNTS = Object.freeze({ mona: 519, copilot: 695, ducky: 413 });
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const hash = (value) => typeof value === 'string' && /^[0-9a-f]{64}$/.test(value);
const count = (value) => Number.isSafeInteger(value) && value >= 0;
const dimensions = (value) => Array.isArray(value) && value.length === 3 && value.every((n) => Number.isFinite(n) && n > 0);
const requireThat = (condition, message) => { if (!condition) throw new Error(message); };

export function studyPath(value, { baseline = false } = {}) {
  requireThat(typeof value === 'string' && !value.includes('\\') && !/%(?:2e|2f|5c)/i.test(value),
    '比較画像または資料のパスが不正です。');
  const path = value.startsWith('artifacts/') ? `/${value}` : value;
  const prefixes = [`/artifacts/studies/${SHAPE_STUDY_ID}/`];
  if (baseline) prefixes.push('/artifacts/revisions/r3-8mm-20260920/');
  const url = new URL(path, 'https://archive.invalid');
  requireThat(url.origin === 'https://archive.invalid' && !url.search && !url.hash
    && prefixes.some((prefix) => path.startsWith(prefix) && url.pathname.startsWith(prefix)),
  '比較資料の参照先が、許可されたスタディの範囲外です。');
  return url.pathname;
}

export function validateStudyPointer(pointer) {
  requireThat(object(pointer) && pointer.schema_version === 1 && pointer.study_id === SHAPE_STUDY_ID
    && pointer.baseline_revision === 'r3-8mm-20260920'
    && ['INPUT_WAIT', 'READY'].includes(pointer.state)
    && pointer.selection === 'UNSELECTED' && pointer.physical_fit === 'UNKNOWN'
    && pointer.retention_strength === 'UNKNOWN' && pointer.slicer_status === 'NOT_SLICED'
    && pointer.full_print === 'ON_HOLD', '形状比較の公開状態・未採用・未検証の記録が不正です。');
  if (pointer.state === 'READY') {
    studyPath(pointer.data_url);
    requireThat(hash(pointer.data_sha256) && /^[0-9a-f]{40}$/.test(pointer.source_commit),
      '実比較データの固定コミットまたは照合ハッシュがありません。');
  } else {
    requireThat(pointer.data_url === undefined && pointer.data_sha256 === undefined,
      '入力待ちの比較案を、画像や数量が存在するように表示できません。');
  }
  return pointer;
}

export function countDelta(actual, baseline) {
  requireThat(count(actual) && actual > 0 && count(baseline) && baseline > 0,
    '比較する個別部品数が不正です。');
  return { parts: actual - baseline, percent: (actual - baseline) / baseline * 100 };
}

export function validateShapeStudy(study, pointer) {
  validateStudyPointer(pointer);
  requireThat(pointer.state === 'READY' && object(study) && study.schema_version === 1
    && study.kind === 'SHAPE_AND_PIECE_COUNT_STUDY' && study.study_id === pointer.study_id
    && study.baseline_revision === pointer.baseline_revision && study.source_commit === pointer.source_commit
    && study.selection === 'UNSELECTED' && study.physical_fit === 'UNKNOWN'
    && study.retention_strength === 'UNKNOWN' && study.slicer_status === 'NOT_SLICED'
    && Array.isArray(study.rows) && study.rows.length === 9, '実画像と部品数の比較データが公開記録と一致しません。');
  const identities = new Set();
  const cameras = new Map();
  const images = new Set();
  for (const row of study.rows) {
    requireThat(object(row) && SHAPE_CHARACTERS.includes(row.character) && SHAPE_VARIANTS.includes(row.variant)
      && typeof row.candidate_id === 'string' && row.candidate_id.length > 0,
    '比較案のキャラクター・方式・候補IDが不正です。');
    const identity = `${row.character}/${row.variant}`;
    requireThat(!identities.has(identity), '比較案の行が重複しています。');
    identities.add(identity);
    const metrics = row.metrics;
    requireThat(object(metrics) && count(metrics.part_count) && metrics.part_count > 0
      && count(metrics.unique_types) && metrics.unique_types > 0 && metrics.unique_types <= metrics.part_count
      && count(metrics.small_part_count) && metrics.small_part_count <= metrics.part_count
      && dimensions(metrics.minimum_part_mm) && dimensions(metrics.dimensions_mm)
      && typeof metrics.small_part_definition === 'string' && metrics.small_part_definition.length > 0
      && row.pitch_mm === 8 && row.stud_diameter_mm === 4.8,
    '実部品数・型数・小部品・寸法または固定ブロック規格が不正です。');
    if (row.variant === 'baseline-r3') {
      requireThat(metrics.part_count === BASELINE_COUNTS[row.character]
        && row.baseline_candidate_id === `${row.character}-practical8`
        && row.evidence?.baseline_identity_verified === true, '現行r3の基準ID・部品数が変更されています。');
    }
    requireThat(object(row.evidence) && hash(row.evidence.manifest_sha256) && hash(row.evidence.bom_sha256)
      && hash(row.evidence.native_geometry_sha256)
      && row.evidence.counted_instances === metrics.part_count
      && typeof row.evidence.count_method === 'string' && row.evidence.count_method.length > 0,
    '部品数が実マニフェスト・BOMの個別ID数に結び付いていません。');
    requireThat(Array.isArray(row.appearance_changes) && row.appearance_changes.length > 0
      && row.appearance_changes.every((item) => typeof item === 'string')
      && Array.isArray(row.assembly_tradeoffs) && row.assembly_tradeoffs.length > 0
      && row.assembly_tradeoffs.every((item) => typeof item === 'string'),
    '見た目の変更と組立上の比較条件がありません。');
    for (const view of ['perspective', 'front']) {
      const image = row.images?.[view];
      requireThat(object(image) && hash(image.sha256) && Number.isSafeInteger(image.bytes) && image.bytes > 0
        && typeof image.comparison_group === 'string' && image.comparison_group.length > 0,
      '同条件の比較画像・ハッシュ・撮影条件がありません。');
      const imagePath = studyPath(image.path, { baseline: row.variant === 'baseline-r3' });
      const cameraKey = `${row.character}/${view}`;
      if (cameras.has(cameraKey)) requireThat(cameras.get(cameraKey) === image.comparison_group,
        '同じキャラクターの比較画像で、カメラ・縮尺・色の条件が一致しません。');
      else cameras.set(cameraKey, image.comparison_group);
      requireThat(!images.has(imagePath), '別の比較案に同じ画像を代用することはできません。');
      images.add(imagePath);
    }
  }
  requireThat(identities.size === 9, '3キャラクターそれぞれの現行版と2つの実比較案が必要です。');
  return study;
}
