const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const hash = (value) => typeof value === 'string' && /^[0-9a-f]{64}$/.test(value);
const region = (value) => Array.isArray(value) && value.length === 4
  && value.every(Number.isFinite) && value[2] > value[0] && value[3] > value[1];
const requireThat = (condition, message) => { if (!condition) throw new Error(message); };

export function validateStudyImage(image, validatePath) {
  requireThat(object(image) && hash(image.sha256) && Number.isSafeInteger(image.bytes) && image.bytes > 0
    && Number.isSafeInteger(image.width) && image.width > 0
    && Number.isSafeInteger(image.height) && image.height > 0,
  'Monaの実比較画像の寸法・サイズ・ハッシュがありません。');
  validatePath(image.path);
}

export function validateStudyComparisons(comparisons, { roles, validatePath, physicalReferenceRoles = [], requireScale = false }) {
  requireThat(Array.isArray(comparisons) && comparisons.length >= (requireScale ? 4 : 3),
    '正面・斜め・顔の実比較画像が不足しています。');
  const ids = new Set(), images = new Set();
  for (const group of comparisons) {
    requireThat(object(group) && /^[a-z][a-z0-9-]+$/.test(group.id) && !ids.has(group.id)
      && ['shape', 'face', 'scale'].includes(group.kind)
      && ['front', 'three-quarter'].includes(group.view) && hash(group.conditions_sha256)
      && typeof group.method_note === 'string' && group.method_note.trim().length > 0,
    'Mona比較画像の視点・正規化・実寸比の条件が不正です。');
    ids.add(group.id);
    if (group.kind === 'scale') {
      requireThat(group.framing_rule === 'SHARED_PIXELS_PER_MM'
        && Number.isFinite(group.pixels_per_mm) && group.pixels_per_mm > 0
        && Array.isArray(group.row_roles) && group.row_roles.length >= 2
        && new Set(group.row_roles).size === group.row_roles.length
        && physicalReferenceRoles.every((role) => group.row_roles.includes(role))
        && group.row_roles.every((role) => roles.includes(role))
        && object(group.row_pixels_per_mm)
        && group.row_roles.every((role) => Number.isFinite(group.row_pixels_per_mm[role])
          && Math.abs(group.row_pixels_per_mm[role] - group.pixels_per_mm) < 1e-8),
      '実寸比は比較モデルを同じpx/mmで示す必要があります。');
      validateStudyImage(group.sheet, validatePath);
      requireThat(!images.has(group.sheet.path), '別の比較条件に同じMona画像を流用できません。');
      images.add(group.sheet.path);
      continue;
    }
    requireThat(group.framing_rule === (group.kind === 'shape' ? 'MATCHED_SCREEN_HEIGHT' : 'MATCHED_NORMALIZED_FACE_REGION')
      && Array.isArray(group.images) && group.images.length === roles.length
      && group.images.every((image) => object(image) && roles.includes(image.role))
      && new Set(group.images.map((image) => image.role)).size === roles.length,
    '比較するすべてのモデルを、同じ画面上高さまたは同じ顔領域で示す必要があります。');
    for (const image of group.images) {
      validateStudyImage(image, validatePath);
      requireThat(image.conditions_sha256 === group.conditions_sha256
        && image.width === group.images[0].width && image.height === group.images[0].height,
      'Mona比較の画像と同方向・同じ表示条件の記録が一致しません。');
      requireThat(!images.has(image.path), '別の比較条件に同じMona画像を流用できません。');
      images.add(image.path);
    }
    if (group.kind === 'shape') {
      requireThat(group.images.every((image) => Number.isFinite(image.projected_subject_height_px)
        && image.projected_subject_height_px > 0 && image.projected_subject_height_px <= image.height),
      '同じ画面上高さを確認する、各モデルの投影範囲がありません。');
      const heights = group.images.map((image) => image.projected_subject_height_px);
      requireThat(Math.max(...heights) - Math.min(...heights) <= 1, '形の比較でモデルの画面上高さが揃っていません。');
    } else {
      requireThat(region(group.normalized_face_region)
        && group.images.every((image) => Array.isArray(image.normalized_face_region)
          && image.normalized_face_region.length === 4
          && image.normalized_face_region.every((value, index) => value === group.normalized_face_region[index])),
      '顔の拡大で、同じ正規化領域を使った記録が一致しません。');
    }
  }
  requireThat(comparisons.some((group) => group.kind === 'shape' && group.view === 'front')
    && comparisons.some((group) => group.kind === 'shape' && group.view === 'three-quarter')
    && comparisons.some((group) => group.kind === 'face')
    && (!requireScale || comparisons.some((group) => group.kind === 'scale')),
  '正面・斜め・顔の実比較画像が不足しています。');
  return comparisons;
}

export function chooseStudyComparison(study, requested, defaultKind = 'shape') {
  return study.comparisons.find((group) => group.id === requested)
    ?? study.comparisons.find((group) => group.kind === defaultKind && group.view === 'front')
    ?? study.comparisons.find((group) => group.kind === 'shape' && group.view === 'front');
}
