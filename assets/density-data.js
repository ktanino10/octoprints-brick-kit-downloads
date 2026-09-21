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
export const MONA_WHISKER_REQUIREMENT = 'NO_EXTERNAL_OR_ASSEMBLY_AIDS';
export const MONA_GEOMETRY_REVISION = 'whisker-root-v2';
export const MONA_ROOT_REFERENCE_ID = 'mona-fine8-base-root-v2';
export const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
export const isHash = (value) => typeof value === 'string' && /^[0-9a-f]{64}$/.test(value);
export const isCount = (value) => Number.isSafeInteger(value) && value >= 0;
export const isVector = (value) => Array.isArray(value) && value.length === 3 && value.every(Number.isFinite);
export function densityAssert(condition, message) { if (!condition) throw new Error(message); }

export function densityCaseIdentity(id) {
  if (typeof id !== 'string') return null;
  const match = /^((mona|copilot|ducky)-p(120|150|200|300|400))(-root-v2)?$/.exec(id);
  if (!match || (match[4] && match[2] !== 'mona')) return null;
  return { logicalId: match[1], character: match[2], percentage: Number(match[3]),
    revision: match[4] ? MONA_GEOMETRY_REVISION : null };
}

export function allDensityCases(catalog) {
  return [...catalog.cases, ...(catalog.historical_cases ?? [])];
}

export function densityArtifactIdentity(id) {
  return id === MONA_ROOT_REFERENCE_ID
    ? { logicalId: 'mona-fine8-base', character: 'mona', percentage: 100, revision: MONA_GEOMETRY_REVISION, reference: true }
    : densityCaseIdentity(id);
}

export function densityGuideEntries(catalog) {
  return [...allDensityCases(catalog), ...Object.values(catalog.reference_revisions ?? {})];
}

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

export function densityDeliveryStatus(item) {
  if (item.state !== 'READY') return item.state;
  if (item.character !== 'mona') return 'READY';
  const support = item.whisker_support;
  return isObject(support) && support.external_aid_count === 0 && support.assembly_aid_count === 0
    && support.status === 'DIGITAL_SELF_SUPPORTING_UNTESTED' && support.physical_validation === 'UNKNOWN'
    && typeof support.geometry_revision === 'string' && support.geometry_revision.length > 0
    && (item.geometry_revision === undefined || support.geometry_revision === item.geometry_revision)
    && isHash(support.manifest_sha256) && support.manifest_sha256 === item.source_manifest_sha256
    && isHash(support.attachment_evidence_sha256) && isHash(support.sequence_evidence_sha256)
    && support.all_categories_geometry_match === true
    ? 'READY' : 'REQUIRES_WHISKER_REVISION';
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

function validateAssetGroups(assets) {
  densityAssert(isObject(assets), '全案にCG・ネイティブCAD・組立データの公開配布が必要です。');
  for (const key of ['cg', 'native_cad', 'assembly']) {
    densityAssert(Array.isArray(assets[key]) && assets[key].length > 0,
      '全案にCG・ネイティブCAD・組立データの公開配布が必要です。');
    assets[key].forEach((file) => validateDensityFile(file, { download: true }));
    const required = { cg: ['still', 'blender'], native_cad: ['freecad_assembly', 'linked_libraries', 'stl', 'step'],
      assembly: ['bom', 'ordered_ids', 'instructions'] }[key];
    const contents = new Set(assets[key].flatMap((file) => Array.isArray(file.contents) ? file.contents : []));
    densityAssert(required.every((kind) => contents.has(kind)),
      '公開パッケージに必要な実CG・CAD形式・組立記録がそろっていません。');
  }
  densityAssert(isObject(assets.animations), '旋回・放射分解・底から組立の実動画が必要です。');
  for (const key of ['turntable', 'radial_explode', 'bottom_up']) {
    const animation = validateDensityFile(assets.animations[key], { download: true });
    densityAssert(Number.isFinite(animation.start_seconds) && animation.start_seconds >= 0
      && Number.isFinite(animation.end_seconds) && animation.end_seconds > animation.start_seconds,
    '動画の章・実時間範囲がありません。');
  }
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
    densityAssert(isObject(baseline) && ['INPUT_WAIT', 'COUNTED', 'READY'].includes(baseline.state),
      '3体の同じ方針による1倍基準が必要です。');
    if (baseline.state !== 'INPUT_WAIT') {
      validateMetrics(baseline.metrics);
      densityAssert(typeof baseline.candidate_id === 'string' && isHash(baseline.manifest_sha256)
        && baseline.pitch_mm === 8 && baseline.basis === 'INITIAL_FINE_C_ADAPTED_8MM',
      '1倍基準は初期細密Cに近い8 mm共通ブロック版に固定する必要があります。');
      if (character === 'mona') densityAssert(baseline.metrics.part_count === 12435
        && baseline.manifest_sha256 === '5556e329521b5706a366c5dad2aa6c7b13eca9d7d74323338773d5e2b20b2b4c',
      'Monaの1倍基準が前回の最終12,435部品から変わっています。');
      if (baseline.state === 'READY') {
        for (const view of ['front', 'three_quarter']) validateDensityFile(baseline.images[view]);
        validateAssetGroups(baseline.assets);
      } else densityAssert(baseline.images === undefined && baseline.native_media_status === 'PENDING',
        '個数だけが確定した基準を、CG・CAD完成として扱うことはできません。');
    } else {
      densityAssert(baseline.metrics === undefined && baseline.images === undefined,
        '未確定のCopilot・Ducky基準に旧r3の個数や画像を代用できません。');
    }
  }
  densityAssert(catalog.historical_cases === undefined || Array.isArray(catalog.historical_cases),
    '旧版の記録は比較の15枠と分けて保持する必要があります。');
  const combinations = new Set(), actualIds = new Set();
  for (const [index, item] of allDensityCases(catalog).entries()) {
    const identity = densityCaseIdentity(item?.id), historical = index >= catalog.cases.length;
    densityAssert(isObject(item) && DENSITY_CHARACTERS.includes(item.character)
      && COUNT_PERCENTAGES.includes(item.count_percentage)
      && identity?.logicalId === `${item.character}-p${item.count_percentage}`
      && (item.logical_case_id === undefined || item.logical_case_id === identity.logicalId)
      && (!identity.revision || (item.logical_case_id === identity.logicalId && item.geometry_revision === identity.revision))
      && !actualIds.has(item.id) && (historical || !combinations.has(identity.logicalId))
      && ['INPUT_WAIT', 'READY', 'TARGET_MISSED'].includes(item.state)
      && (!historical || item.state !== 'INPUT_WAIT'),
    '比較案のキャラクター・個数倍率・IDが不正です。');
    actualIds.add(item.id);
    if (!historical) combinations.add(identity.logicalId);
    const baseline = catalog.baselines[item.character];
    if (item.state === 'INPUT_WAIT') {
      densityAssert(item.metrics === undefined && item.manifest === undefined && item.images === undefined,
        '制作中の案を実際の画像・部品数がある完成案として表示できません。');
      continue;
    }
    densityAssert(baseline.state !== 'INPUT_WAIT', '1倍基準を固定する前に倍率案を公開できません。');
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
        && (baseline.state !== 'READY' || item.images[view].condition_id === baseline.images[view].condition_id),
      '比較画像の同方向・同画面高さの条件が一致しません。');
    }
    densityAssert(typeof item.tradeoff === 'string' && item.tradeoff.length > 0
      && isObject(item.assets) && isHash(item.source_manifest_sha256)
      && isHash(item.source_bom_sha256) && /^[0-9a-f]{40}$/.test(item.source_commit),
    '実案の出典・作業負担・配布記録がありません。');
    validateAssetGroups(item.assets);
  }
  densityAssert(combinations.size === 15, '3体×5倍率の15枠をすべて明示する必要があります。');
  if (catalog.display_catalog !== undefined) validateDensityFile(catalog.display_catalog);
  densityAssert(catalog.reference_revisions === undefined || isObject(catalog.reference_revisions),
    '改訂参照は固定された倍率計算基準と分けて記録する必要があります。');
  for (const [character, reference] of Object.entries(catalog.reference_revisions ?? {})) {
    const baseline = catalog.baselines[character];
    densityAssert(character === 'mona' && reference.id === MONA_ROOT_REFERENCE_ID
      && reference.character === character && reference.logical_case_id === 'mona-fine8-base'
      && reference.geometry_revision === MONA_GEOMETRY_REVISION && reference.state === 'READY'
      && reference.kind === 'BASELINE_REFERENCE_NOT_MULTIPLIER_CASE' && reference.counts_toward_multiplier_cases === false
      && reference.fixed_count_baseline === baseline.metrics.part_count
      && reference.target_count === baseline.metrics.part_count,
    '改訂参照が倍率の分母や15案の完成件数を変更しています。');
    validateMetrics(reference.metrics);
    const difference = reference.metrics.part_count - baseline.metrics.part_count;
    densityAssert(reference.actual_count_difference_from_fixed === difference && reference.target_difference === difference
      && Math.abs(reference.actual_ratio - reference.metrics.part_count / baseline.metrics.part_count) < 1e-10
      && densityDeliveryStatus(reference) === 'READY' && isHash(reference.source_manifest_sha256)
      && isHash(reference.source_bom_sha256) && /^[0-9a-f]{40}$/.test(reference.source_commit),
    '改訂参照の実個数・元基準との差・支台検査記録が一致しません。');
    validateDensityFile(reference.manifest);
    validateAssetGroups(reference.assets);
    for (const view of ['front', 'three_quarter']) {
      validateDensityFile(reference.images[view]);
      densityAssert(reference.images[view].framing_rule === 'MATCHED_SCREEN_HEIGHT'
        && reference.images[view].condition_id === baseline.images[view].condition_id,
      '比較画像の同方向・同画面高さの条件が一致しません。');
    }
  }
  if (pointer.state === 'READY') densityAssert(catalog.cases.every((item) => densityDeliveryStatus(item) === 'READY')
    && Object.values(catalog.baselines).every((baseline) => baseline.state === 'READY'),
    '未完成・目標未達の案が残るため、15案すべて完了とは表示できません。');
  return catalog;
}
