export { countDelta } from './shape-options-data.js';

export const MONA_STUDY_ID = 'mona-likeness-360-20260921';
export const MONA_STUDY_URL = '/archive/mona-study.json';
export const MONA_ROLES = Object.freeze(['original', 'fine-c', 'current-r3', 'pilot-360']);
export const MONA_REFERENCE_COUNTS = Object.freeze({ 'fine-c': 13837, 'current-r3': 519 });
const gates = Object.freeze({
  current_revision_unchanged: 'r3-8mm-20260920', selection: 'NOT_SELECTED', visual_approval: 'PENDING',
  physical_fit: 'UNKNOWN', retention_strength: 'UNKNOWN', slicer_status: 'NOT_SLICED', full_print: 'ON_HOLD',
});
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const hash = (value) => typeof value === 'string' && /^[0-9a-f]{64}$/.test(value);
const count = (value) => Number.isSafeInteger(value) && value >= 0;
const dimensions = (value) => Array.isArray(value) && value.length === 3 && value.every((n) => Number.isFinite(n) && n > 0);
const text = (value) => typeof value === 'string' && value.trim().length > 0;
const requireThat = (condition, message) => { if (!condition) throw new Error(message); };

export function monaStudyPath(value) {
  const prefix = `/artifacts/studies/${MONA_STUDY_ID}/`;
  requireThat(typeof value === 'string' && !value.includes('\\') && !/%(?:2e|2f|5c)/i.test(value),
    'Mona比較資料のパスが不正です。');
  const path = value.startsWith('artifacts/') ? `/${value}` : value;
  const url = new URL(path, 'https://archive.invalid');
  requireThat(url.origin === 'https://archive.invalid' && !url.search && !url.hash
    && path.startsWith(prefix) && url.pathname.startsWith(prefix),
  'Mona比較資料が今回の公開範囲外を参照しています。');
  return url.pathname;
}

export function validateMonaPointer(pointer) {
  requireThat(object(pointer) && pointer.schema_version === 1 && pointer.study_id === MONA_STUDY_ID
    && ['INPUT_WAIT', 'READY'].includes(pointer.state)
    && Object.entries(gates).every(([key, value]) => pointer[key] === value),
  'Mona比較の公開状態・現行版・未採用の記録が不正です。');
  if (pointer.state === 'INPUT_WAIT') {
    requireThat(pointer.data_url === undefined && pointer.data_sha256 === undefined,
      '未受領のMona比較に、実画像や実数量の取得先を付けることはできません。');
  } else {
    monaStudyPath(pointer.data_url);
    requireThat(hash(pointer.data_sha256) && /^[0-9a-f]{40}$/.test(pointer.source_commit),
      'Mona比較の固定コミットまたは照合ハッシュがありません。');
  }
  return pointer;
}

function validateImage(image) {
  requireThat(object(image) && hash(image.sha256) && count(image.bytes) && image.bytes > 0
    && Number.isSafeInteger(image.width) && image.width > 0
    && Number.isSafeInteger(image.height) && image.height > 0,
  'Monaの実比較画像の寸法・サイズ・ハッシュがありません。');
  monaStudyPath(image.path);
}

export function validateMonaStudy(study, pointer) {
  validateMonaPointer(pointer);
  requireThat(pointer.state === 'READY' && object(study) && study.schema_version === 1
    && study.study_id === pointer.study_id && study.kind === 'MONA_LIKENESS_AND_SCALE_STUDY'
    && study.source_commit === pointer.source_commit && hash(study.source_study_sha256)
    && Object.entries(gates).every(([key, value]) => study[key] === value)
    && Array.isArray(study.rows) && study.rows.length === 4,
  'Mona比較データと公開記録が一致しません。');
  const roles = new Set();
  for (const row of study.rows) {
    requireThat(object(row) && MONA_ROLES.includes(row.role) && !roles.has(row.role)
      && text(row.candidate_id) && dimensions(row.metrics?.dimensions_mm)
      && hash(row.evidence?.geometry_sha256), 'Mona比較の原型・初期C・現行r3・新案の対応が不正です。');
    roles.add(row.role);
    const metrics = row.metrics;
    if (row.role === 'original') {
      requireThat(row.count_status === 'NOT_APPLICABLE' && row.pitch_mm === null
        && ['part_count', 'unique_types', 'one_by_one_exceptions', 'layer_count', 'minimum_part_mm',
          'grip_long_ge_15_8_count'].every((key) => metrics[key] === null),
      '無分割の原型にブロック数・型数・組立層数を割り当てることはできません。');
      continue;
    }
    requireThat(row.count_status === 'ACTUAL_INSTANCES' && count(metrics.part_count) && metrics.part_count > 0
      && count(metrics.unique_types) && metrics.unique_types > 0 && metrics.unique_types <= metrics.part_count
      && count(metrics.one_by_one_exceptions) && metrics.one_by_one_exceptions <= metrics.part_count
      && count(metrics.layer_count) && metrics.layer_count > 0
      && count(metrics.grip_long_ge_15_8_count) && metrics.grip_long_ge_15_8_count <= metrics.part_count
      && dimensions(metrics.minimum_part_mm)
      && hash(row.evidence.manifest_sha256) && hash(row.evidence.bom_sha256)
      && row.evidence.counted_instances === metrics.part_count && row.evidence.bom_ids_match === true,
    'Monaの実部品数・型数・小部品・層・寸法がマニフェストとBOMに結び付いていません。');
    if (Object.hasOwn(MONA_REFERENCE_COUNTS, row.role)) {
      requireThat(metrics.part_count === MONA_REFERENCE_COUNTS[row.role]
        && row.evidence.reference_identity_verified === true
        && row.pitch_mm === (row.role === 'fine-c' ? 4 : 8),
      '比較基準の初期細密Cまたは現行r3が変更されています。');
    } else {
      requireThat(row.pitch_mm === 8 && row.stud_diameter_mm === 4.8
        && row.open_underside === true && row.evidence.resampled_from_original === true
        && hash(row.evidence.original_geometry_sha256),
      '新案は8 mm規格のまま原型から再構成した実データである必要があります。');
    }
  }
  requireThat(study.rows.find((row) => row.role === 'pilot-360').evidence.original_geometry_sha256
    === study.rows.find((row) => row.role === 'original').evidence.geometry_sha256,
  '新Monaの再サンプリング元が、比較に使う原型と一致しません。');
  requireThat(Array.isArray(study.comparisons) && study.comparisons.length >= 4
    && text(study.appearance_limit) && text(study.assembly_tradeoff)
    && study.prior_visual_feedback === 'USERREJECTS_LIKENESS',
  'Mona比較の表示条件・見た目の限界・組立上の注意がありません。');
  const ids = new Set(), images = new Set();
  for (const group of study.comparisons) {
    requireThat(object(group) && /^[a-z][a-z0-9-]+$/.test(group.id) && !ids.has(group.id)
      && ['shape', 'face', 'scale'].includes(group.kind)
      && ['front', 'three-quarter'].includes(group.view)
      && hash(group.conditions_sha256) && text(group.method_note),
    'Mona比較画像の視点・正規化・実寸比の条件が不正です。');
    ids.add(group.id);
    if (group.kind === 'scale') {
      requireThat(group.framing_rule === 'SHARED_PIXELS_PER_MM'
        && Number.isFinite(group.pixels_per_mm) && group.pixels_per_mm > 0
        && Array.isArray(group.row_roles) && ['fine-c', 'pilot-360'].every((role) => group.row_roles.includes(role))
        && group.row_roles.every((role) => MONA_ROLES.includes(role)),
      '実寸比は18 cm基準と新案を同じpx/mmで示す必要があります。');
      validateImage(group.sheet);
      requireThat(!images.has(group.sheet.path), '別の比較条件に同じMona画像を流用できません。');
      images.add(group.sheet.path);
    } else {
      requireThat(group.framing_rule === (group.kind === 'shape' ? 'MATCHED_SCREEN_HEIGHT' : 'MATCHED_NORMALIZED_FACE_REGION')
        && Array.isArray(group.images) && group.images.length === 4
        && new Set(group.images.map((image) => image.role)).size === 4
        && group.images.every((image) => MONA_ROLES.includes(image.role)),
      '形の比較は4案の画面上高さ、顔比較は同じ領域の条件をそろえる必要があります。');
      for (const image of group.images) {
        validateImage(image);
        requireThat(image.conditions_sha256 === group.conditions_sha256
          && image.width === group.images[0].width && image.height === group.images[0].height,
        'Mona比較の画像と同方向・同じ表示条件の記録が一致しません。');
        requireThat(!images.has(image.path), '別の比較条件に同じMona画像を流用できません。');
        images.add(image.path);
      }
    }
  }
  requireThat(study.comparisons.some((group) => group.kind === 'shape' && group.view === 'front')
    && study.comparisons.some((group) => group.kind === 'shape' && group.view === 'three-quarter')
    && study.comparisons.some((group) => group.kind === 'face')
    && study.comparisons.some((group) => group.kind === 'scale'),
  '正面・斜めの形比較、顔拡大、実寸比がすべて必要です。');
  return study;
}

export function chooseMonaComparison(study, requested) {
  return study.comparisons.find((group) => group.id === requested)
    ?? study.comparisons.find((group) => group.kind === 'shape' && group.view === 'front');
}
