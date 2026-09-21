export const DENSITY_ID = 'part-count-matrix-20260921';
export const DENSITY_POINTER = '/archive/density-study.json';
export const DENSITY_CHARACTERS = Object.freeze(['mona', 'copilot', 'ducky']);
export const COUNT_PERCENTAGES = Object.freeze([120, 150, 200, 300, 400]);
export const DENSITY_FLAGS = Object.freeze({
  current_revision_unchanged: 'r3-8mm-20260920',
  baseline_choice: 'COMPARISON_ASSUMPTION_NOT_USER_SELECTION',
  selection: 'NOT_SELECTED', visual_approval: 'PENDING', physical_fit: 'UNKNOWN',
  retention_strength: 'UNKNOWN', whole_figure_stability: 'UNKNOWN',
  slicer_status: 'NOT_SLICED', full_print: 'ON_HOLD',
});
export const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
export const isHash = (value) => typeof value === 'string' && /^[0-9a-f]{64}$/.test(value);
export const isCount = (value) => Number.isSafeInteger(value) && value >= 0;
export const isVector = (value) => Array.isArray(value) && value.length === 3 && value.every(Number.isFinite);
export function densityAssert(condition, message) { if (!condition) throw new Error(message); }

export function densityPath(value) {
  densityAssert(typeof value === 'string' && !value.includes('\\') && !/%(?:2e|2f|5c)/i.test(value),
    '個数倍率比較のファイル参照が不正です。');
  const path = value.startsWith('artifacts/') ? '/' + value : value;
  const prefix = `/artifacts/studies/${DENSITY_ID}/`;
  const url = new URL(path, 'https://archive.invalid');
  densityAssert(url.origin === 'https://archive.invalid' && !url.search && !url.hash
    && path.startsWith(prefix) && url.pathname.startsWith(prefix),
  '個数倍率比較の参照先が今回の公開範囲外です。');
  return url.pathname;
}

export function validateDensityFile(file, { download = false } = {}) {
  densityAssert(isObject(file) && isHash(file.sha256) && isCount(file.bytes) && file.bytes > 0,
    '公開ファイルのサイズ・SHA-256がありません。');
  if (download && typeof file.url === 'string' && file.url.startsWith('https://')) {
    const url = new URL(file.url);
    const prefix = `/ktanino10/octoprints-brick-kit-downloads/releases/download/${DENSITY_ID}`;
    densityAssert(url.origin === 'https://github.com' && !url.username && !url.password && !url.search && !url.hash
      && (url.pathname.startsWith(prefix + '/') || url.pathname.startsWith(prefix + '-')),
    '大容量ファイルの配布先が公開プロジェクトの版別Releaseと一致しません。');
  } else densityPath(file.path ?? file.url);
  return file;
}

export function targetPartCount(baseline, percentage) {
  densityAssert(isCount(baseline) && baseline > 0 && COUNT_PERCENTAGES.includes(percentage)
    && Number.isSafeInteger(baseline * percentage + 50), '個数倍率の基準または倍率が不正です。');
  return Math.floor((baseline * percentage + 50) / 100);
}

export function countTargetResult(baseline, percentage, actual) {
  const target = targetPartCount(baseline, percentage);
  densityAssert(isCount(actual) && actual > 0, '実際の個別部品数が不正です。');
  const difference = actual - target;
  return { target, actual, difference, actual_ratio: actual / baseline,
    within_tolerance: Math.abs(difference) <= Math.max(1, target * 0.01) };
}

export function validateDensityPointer(pointer) {
  densityAssert(isObject(pointer) && pointer.schema_version === 1 && pointer.study_id === DENSITY_ID
    && ['INPUT_WAIT', 'PARTIAL', 'READY'].includes(pointer.state)
    && Object.entries(DENSITY_FLAGS).every(([key, value]) => pointer[key] === value),
  '個数倍率比較の公開状態・比較前提・物理ゲートが不正です。');
  if (pointer.state === 'INPUT_WAIT') {
    densityAssert(pointer.catalog === undefined, '未受領の15案に、実データが存在するような参照先を付けられません。');
  } else validateDensityFile(pointer.catalog);
  return pointer;
}

function validateMetrics(metrics) {
  densityAssert(isObject(metrics) && isCount(metrics.part_count) && metrics.part_count > 0
    && isCount(metrics.unique_types) && metrics.unique_types > 0 && metrics.unique_types <= metrics.part_count
    && isCount(metrics.one_by_one_exceptions) && metrics.one_by_one_exceptions <= metrics.part_count
    && isCount(metrics.grip_long_ge_15_8_count) && metrics.grip_long_ge_15_8_count <= metrics.part_count
    && isVector(metrics.dimensions_mm) && metrics.dimensions_mm.every((value) => value > 0)
    && isVector(metrics.minimum_part_mm) && metrics.minimum_part_mm.every((value) => value > 0),
  '実部品数・型数・小部品・寸法の記録が不正です。');
}

export function validateDensityCatalog(catalog, pointer) {
  validateDensityPointer(pointer);
  densityAssert(pointer.state !== 'INPUT_WAIT' && isObject(catalog) && catalog.schema_version === 1
    && catalog.study_id === DENSITY_ID && catalog.kind === 'ACTUAL_PART_COUNT_MATRIX'
    && Object.entries(DENSITY_FLAGS).every(([key, value]) => catalog[key] === value)
    && isObject(catalog.baselines) && Array.isArray(catalog.cases),
  '15案のカタログと公開状態が一致しません。');
  for (const character of DENSITY_CHARACTERS) {
    const baseline = catalog.baselines[character];
    densityAssert(isObject(baseline) && ['INPUT_WAIT', 'READY'].includes(baseline.state),
      '3体の同じ方針による1倍基準が必要です。');
    if (baseline.state === 'READY') {
      validateMetrics(baseline.metrics);
      densityAssert(typeof baseline.candidate_id === 'string' && isHash(baseline.manifest_sha256)
        && baseline.pitch_mm === 8 && baseline.basis === 'INITIAL_FINE_C_ADAPTED_8MM',
      '1倍基準は初期細密Cに近い8 mm共通ブロック版に固定する必要があります。');
      if (character === 'mona') densityAssert(baseline.metrics.part_count === 12435
        && baseline.manifest_sha256 === '5556e329521b5706a366c5dad2aa6c7b13eca9d7d74323338773d5e2b20b2b4c',
      'Monaの1倍基準が前回の最終12,435部品から変わっています。');
      for (const view of ['front', 'three_quarter']) validateDensityFile(baseline.images[view]);
    } else {
      densityAssert(baseline.metrics === undefined && baseline.images === undefined,
        '未確定のCopilot・Ducky基準に旧r3の個数や画像を代用できません。');
    }
  }
  const combinations = new Set();
  for (const item of catalog.cases) {
    densityAssert(isObject(item) && DENSITY_CHARACTERS.includes(item.character)
      && COUNT_PERCENTAGES.includes(item.count_percentage)
      && item.id === `${item.character}-p${item.count_percentage}`
      && !combinations.has(item.id) && ['INPUT_WAIT', 'READY', 'TARGET_MISSED'].includes(item.state),
    '比較案のキャラクター・個数倍率・IDが不正です。');
    combinations.add(item.id);
    const baseline = catalog.baselines[item.character];
    if (item.state === 'INPUT_WAIT') {
      densityAssert(item.metrics === undefined && item.manifest === undefined && item.images === undefined,
        '制作中の案を実際の画像・部品数がある完成案として表示できません。');
      continue;
    }
    densityAssert(baseline.state === 'READY', '1倍基準を固定する前に倍率案を公開できません。');
    validateMetrics(item.metrics);
    const actual = countTargetResult(baseline.metrics.part_count, item.count_percentage, item.metrics.part_count);
    densityAssert(item.target_count === actual.target && item.target_difference === actual.difference
      && Math.abs(item.actual_ratio - actual.actual_ratio) < 1e-10
      && (item.state === 'READY') === actual.within_tolerance,
    '目標・実数・実倍率・許容差の記録が一致しません。');
    validateDensityFile(item.manifest);
    for (const view of ['front', 'three_quarter']) {
      validateDensityFile(item.images[view]);
      densityAssert(item.images[view].framing_rule === 'MATCHED_SCREEN_HEIGHT'
        && typeof item.images[view].condition_id === 'string'
        && item.images[view].condition_id === baseline.images[view].condition_id,
      '比較画像の同方向・同画面高さの条件が一致しません。');
    }
    densityAssert(typeof item.tradeoff === 'string' && item.tradeoff.length > 0
      && isObject(item.assets) && isHash(item.source_manifest_sha256)
      && isHash(item.source_bom_sha256) && /^[0-9a-f]{40}$/.test(item.source_commit),
    '実案の出典・作業負担・配布記録がありません。');
    for (const key of ['cg', 'native_cad', 'assembly']) {
      densityAssert(Array.isArray(item.assets[key]) && item.assets[key].length > 0,
        '全案にCG・ネイティブCAD・組立データの公開配布が必要です。');
      item.assets[key].forEach((file) => validateDensityFile(file, { download: true }));
      const required = { cg: ['still', 'blender'], native_cad: ['freecad_assembly', 'linked_libraries', 'stl', 'step'],
        assembly: ['bom', 'ordered_ids', 'instructions'] }[key];
      const contents = new Set(item.assets[key].flatMap((file) => Array.isArray(file.contents) ? file.contents : []));
      densityAssert(required.every((kind) => contents.has(kind)),
        '公開パッケージに必要な実CG・CAD形式・組立記録がそろっていません。');
    }
    densityAssert(isObject(item.assets.animations), '旋回・放射分解・底から組立の実動画が必要です。');
    for (const key of ['turntable', 'radial_explode', 'bottom_up']) {
      const animation = validateDensityFile(item.assets.animations[key], { download: true });
      densityAssert(Number.isFinite(animation.start_seconds) && animation.start_seconds >= 0
        && Number.isFinite(animation.end_seconds) && animation.end_seconds > animation.start_seconds,
      '動画の章・実時間範囲がありません。');
    }
  }
  densityAssert(combinations.size === 15, '3体×5倍率の15枠をすべて明示する必要があります。');
  if (pointer.state === 'READY') densityAssert(catalog.cases.every((item) => item.state === 'READY'),
    '未完成・目標未達の案が残るため、15案すべて完了とは表示できません。');
  return catalog;
}
