import {
  DENSITY_ID, DENSITY_CHARACTERS, COUNT_PERCENTAGES, densityAssert as check,
  densityPath, densityDeliveryStatus, isHash, isObject, isVector, validateDensityFile,
} from './density-data.js';

export const DENSITY_COMPARISON_COLUMNS = Object.freeze([
  'case_id', 'logical_case_id', 'geometry_revision', 'character', 'target_ratio', 'baseline_count',
  'actual_reference_count', 'target_count', 'actual_count', 'actual_ratio', 'difference',
  'width_mm', 'depth_mm', 'height_mm', 'types', 'one_by_one', 'grip_long_ge_15_8_fraction',
]);

export function comparisonFile(file) {
  const path = file.path?.startsWith('/') ? file.path : `/artifacts/studies/${DENSITY_ID}/${file.path}`;
  return validateDensityFile({ ...file, path,
    ...(file.image_size_px ? { width: file.image_size_px[0], height: file.image_size_px[1] } : {}) });
}

export function comparisonEntries(catalog, character) {
  const reference = catalog.reference_revisions?.[character] ?? catalog.baselines[character];
  return [reference, ...COUNT_PERCENTAGES.map(percentage =>
    catalog.cases.find(item => item.character === character && item.count_percentage === percentage))];
}

function stable(value) {
  return JSON.stringify(value, function (key, item) {
    return isObject(item) ? Object.fromEntries(Object.keys(item).sort().map(name => [name, item[name]])) : item;
  });
}

export function validateDensityComparisons(data, catalog) {
  check(isObject(data) && data.schema_version === 1 && data.study_id === DENSITY_ID
    && data.state === 'COMPLETE_REAL_SIX_WAY_COMPARISONS' && Array.isArray(data.rows) && data.rows.length === 3
    && catalog.cases.length === 15 && catalog.cases.every(item => densityDeliveryStatus(item) === 'READY'),
  '最終比較には3体×5案すべての実制作物と検査記録が必要です。');
  check(data.status?.selection === 'NOT_SELECTED' && data.status.visual_approval === 'PENDING'
    && data.status.physical_fit === 'UNKNOWN' && data.status.slicer_status === 'NOT_SLICED',
  '最終比較を美観・実物・印刷の合格へ読み替えることはできません。');
  check(new Set(data.rows.map(row => row.character)).size === 3
    && DENSITY_CHARACTERS.every(character => data.rows.some(row => row.character === character)),
  '最終比較の3キャラクターが不足または重複しています。');
  const seenPaths = new Set();
  for (const row of data.rows) {
    const baseline = catalog.baselines[row.character];
    const entries = comparisonEntries(catalog, row.character);
    const ids = entries.map(item => item?.id ?? item?.candidate_id);
    const actualReferenceCount = entries[0]?.metrics?.part_count;
    check(entries.every(item => item?.state === 'READY')
      && row.fixed_count_denominator === baseline.metrics.part_count
      && row.fixed_count_reference_manifest_sha256 === baseline.manifest_sha256
      && row.actual_reference_count === actualReferenceCount
      && JSON.stringify(row.complete_case_ids) === JSON.stringify(ids)
      && Array.isArray(row.columns) && row.columns.length === 6,
    '固定分母・追加参照の実数・6つの実モデルが比較記録と一致しません。');
    for (const [index, column] of row.columns.entries()) {
      const item = entries[index], ratio = index === 0 ? 1 : COUNT_PERCENTAGES[index - 1] / 100;
      const manifest = item.source_manifest_sha256 ?? item.native_manifest_sha256;
      const bom = item.source_bom_sha256 ?? item.native_bom_sha256;
      const target = Math.floor((baseline.metrics.part_count * Math.round(ratio * 100) + 50) / 100);
      check(column.column_index === index && column.case_id === ids[index]
        && column.logical_case_id === (item.logical_case_id ?? ids[index])
        && column.geometry_revision === (item.geometry_revision ?? 'original-matrix')
        && column.role === (index === 0 ? 'ONE_X_ACTUAL_GEOMETRY_REFERENCE' : 'MULTIPLIER_CASE')
        && column.fixed_count_denominator === baseline.metrics.part_count
        && column.actual_reference_count === actualReferenceCount && column.target_ratio === ratio
        && column.target_count === target && column.actual_count === item.metrics.part_count
        && Math.abs(column.actual_ratio - item.metrics.part_count / baseline.metrics.part_count) < 1e-10
        && column.used_types === item.metrics.unique_types && isVector(column.actual_size_mm)
        && column.actual_size_mm.every((value, axis) => Math.abs(value - item.metrics.dimensions_mm[axis]) < 1e-6)
        && column.manifest_sha256 === manifest && column.bom_sha256 === bom && isHash(column.source_render_stats_sha256),
      '6列比較の数量・実寸・元manifest/BOMの記録が実モデルと一致しません。');
    }
    check(Array.isArray(row.images) && row.images.length === 3,
      '最終比較には同じ画面上高さの正面・斜めと、別の実寸比画像が必要です。');
    const modes = new Set();
    for (const image of row.images) {
      const file = comparisonFile(image);
      densityPath(file.path);
      check(!seenPaths.has(file.path) && Array.isArray(image.image_size_px) && image.image_size_px.length === 2
        && image.image_size_px.every(value => Number.isSafeInteger(value) && value > 0)
        && JSON.stringify(image.source_cases) === JSON.stringify(ids),
      '最終比較画像の寸法・6モデルの出典・ファイル参照が不正です。');
      seenPaths.add(file.path);
      const key = `${image.mode}/${image.view}`;
      check(!modes.has(key), '最終比較の画像条件が重複しています。');
      modes.add(key);
      if (image.mode === 'ACTUAL_CG_EQUAL_PROJECTED_SCREEN_HEIGHT_NOT_SIZE_RATIO') {
        check(['front', 'three_quarter'].includes(image.view) && Array.isArray(image.conditions)
          && image.conditions.length === 6, '同じ画面上高さの比較条件が不足しています。');
        for (const [index, condition] of image.conditions.entries()) {
          const camera = condition.camera;
          check(condition.case_id === ids[index] && isHash(condition.source_image_sha256)
            && JSON.stringify(condition.panel_size_px) === '[580,580]'
            && Math.abs(condition.panel_model_height_px - 417.6) < 1e-6
            && camera?.projection === 'ORTHOGRAPHIC' && JSON.stringify(camera.image_size_px) === '[1200,1200]'
            && Math.abs(camera.rendered_model_height_px - 864) < 1e-6
            && Number.isFinite(camera.pixels_per_mm) && camera.pixels_per_mm > 0
            && Number.isFinite(camera.actual_projected_height_mm) && camera.actual_projected_height_mm > 0
            && Math.abs(camera.pixels_per_mm * camera.actual_projected_height_mm - 864) < 1e-5,
          '同じ画面上高さの比較は元の実cameraと417.6 pxの投影高さへ結び付ける必要があります。');
        }
      } else {
        check(image.mode === 'ACTUAL_CG_FIXED_PHYSICAL_PX_PER_MM' && image.view === 'front'
          && image.pixels_per_mm === 0.9 && typeof image.method === 'string' && image.method.length > 0
          && Array.isArray(image.conditions) && image.conditions.length === 6,
        '実寸比の比較は正面の実CGを共通0.9 px/mmで表示する必要があります。');
        const front = row.images.find(item => item.mode === 'ACTUAL_CG_EQUAL_PROJECTED_SCREEN_HEIGHT_NOT_SIZE_RATIO'
          && item.view === 'front');
        for (const [index, condition] of image.conditions.entries()) {
          const camera = condition.camera, affine = condition.source_to_sheet_affine, box = condition.panel_box_px;
          const normalized = front?.conditions?.[index];
          const scale = 0.9 / camera?.pixels_per_mm;
          check(condition.case_id === ids[index] && condition.pixels_per_mm === 0.9
            && condition.source_image_sha256 === normalized?.source_image_sha256
            && stable(camera) === stable(normalized?.camera)
            && JSON.stringify(condition.source_image_size_px) === '[1200,1200]'
            && Number.isFinite(scale) && scale > 0 && Math.abs(condition.scale_factor - scale) < 1e-10
            && Array.isArray(affine) && affine.length === 6 && affine.every(Number.isFinite)
            && Math.abs(affine[0] - scale) < 1e-10 && Math.abs(affine[4] - scale) < 1e-10
            && affine[1] === 0 && affine[3] === 0
            && Array.isArray(box) && box.length === 4 && box.every(Number.isFinite)
            && box[2] - box[0] === 800 && box[1] === 140 && box[3] === 750
            && box[0] >= 0 && box[2] <= image.image_size_px[0] && box[3] <= image.image_size_px[1]
            && (index === 0 || box[0] === image.conditions[index - 1].panel_box_px[2])
            && Number.isFinite(condition.source_ground_y_px) && condition.sheet_ground_y_px === 750
            && Math.abs(scale * condition.source_ground_y_px + affine[5] - 750) < 1e-6
            && Math.abs(condition.source_model_height_px - camera.rendered_model_height_px) < 1e-6
            && Math.abs(condition.sheet_model_height_px - entries[index].metrics.dimensions_mm[2] * 0.9) < 1e-6
            && Math.abs(condition.source_model_height_px * scale - condition.sheet_model_height_px) < 1e-6
            && condition.resampling === 'BICUBIC_UNIFORM_AFFINE_NOT_PER_MODEL_HEIGHT_NORMALIZATION',
          '実寸比画像の実camera・同一元画像・等方変換・共通地面の記録が一致しません。');
        }
      }
    }
    check(modes.has('ACTUAL_CG_EQUAL_PROJECTED_SCREEN_HEIGHT_NOT_SIZE_RATIO/front')
      && modes.has('ACTUAL_CG_EQUAL_PROJECTED_SCREEN_HEIGHT_NOT_SIZE_RATIO/three_quarter')
      && modes.has('ACTUAL_CG_FIXED_PHYSICAL_PX_PER_MM/front'),
    '最終比較には同じ画面上高さの正面・斜めと、別の実寸比画像が必要です。');
  }
  comparisonFile(data.comparison_csv);
  check(data.comparison_csv.path === 'comparison.csv' && data.comparison_csv.row_count === 15
    && JSON.stringify(data.comparison_csv.columns) === JSON.stringify(DENSITY_COMPARISON_COLUMNS),
  '比較CSVは追加参照を含めず、15個の実倍率案を記録する必要があります。');
  return data;
}
