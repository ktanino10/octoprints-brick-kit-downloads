import { DENSITY_ID, DENSITY_CHARACTERS, COUNT_PERCENTAGES, densityAssert as check,
  densityDeliveryStatus, validateDensityCatalog } from './density-data.js';

export function printCatalog(catalog, pointer, receipt, evidence, bodyPublication = null) {
  validateDensityCatalog(catalog, pointer);
  check(receipt.study_id === DENSITY_ID && receipt.state === 'READY'
    && receipt.catalog_sha256 === pointer.catalog.sha256
    && receipt.verification?.public_browser_passed === true && receipt.verification?.anonymous_downloads_passed === true
    && evidence.study_id === DENSITY_ID && evidence.state === 'READY'
    && evidence.catalog_sha256 === pointer.catalog.sha256,
  '公開検証の済んだモデル一覧と照合できません。');
  check(evidence.safety_and_scope?.physical_validation === 'UNKNOWN'
    && evidence.safety_and_scope.slicer_status === 'NOT_SLICED'
    && evidence.safety_and_scope.full_print === 'ON_HOLD',
  '印刷確認の状態がこのカタログの表示条件と一致しません。');
  check(Array.isArray(evidence.actual_multiplier_cases), '15案の実データ検証記録が不足しています。');
  const verified = new Map(evidence.actual_multiplier_cases.map(item => [item.case_id, item]));
  check(verified.size === 15 && evidence.actual_multiplier_cases.length === 15,
    '15案の実データ検証記録が不足しています。');
  const groups = DENSITY_CHARACTERS.map(character => ({
    character,
    cases: COUNT_PERCENTAGES.map(percentage => {
      const item = catalog.cases.find(row => row.character === character && row.count_percentage === percentage);
      const proof = verified.get(item?.id);
      check(item && densityDeliveryStatus(item) === 'READY' && proof
        && proof.actual_parts === item.metrics.part_count && proof.actual_types === item.metrics.unique_types
        && proof.source_manifest_sha256 === item.source_manifest_sha256
        && JSON.stringify(proof.dimensions_mm) === JSON.stringify(item.metrics.dimensions_mm)
        && Number.isSafeInteger(proof.temporary_aids_excluded_from_figure_count)
        && proof.temporary_aids_excluded_from_figure_count >= 0,
      'モデルの実部品数・寸法・組立支台の検証記録が一致しません。');
      return {
        id: item.id, character, percentage, partCount: item.metrics.part_count,
        typeCount: item.metrics.unique_types, dimensions: item.metrics.dimensions_mm,
        aids: proof.temporary_aids_excluded_from_figure_count,
        image: item.images.three_quarter, download: item.assets.native_cad[0],
        physicalStatus: 'UNTESTED', slicerStatus: 'NOT_SLICED',
      };
    }),
  }));
  if (bodyPublication?.published.length) {
    const copilot = groups.find(group => group.character === 'copilot');
    copilot.historicalCases = [];
    for (const entry of bodyPublication.published) {
      const position = copilot.cases.findIndex(item => item.percentage === entry.count_percentage);
      check(position >= 0, 'Copilot支台なし改訂の実データ・旧版との関係・公開検証記録が一致しません。');
      copilot.historicalCases.push({ ...copilot.cases[position], historical: true });
      copilot.cases[position] = {
        id: entry.id, character: 'copilot', percentage: entry.count_percentage, partCount: entry.metrics.part_count,
        typeCount: entry.metrics.unique_types, dimensions: entry.metrics.dimensions_mm, aids: 0,
        image: entry.images.three_quarter, download: entry.assets.native_cad[0],
        physicalStatus: 'UNTESTED', slicerStatus: 'NOT_SLICED', supportFreeRevision: true,
      };
    }
  }
  return groups;
}

export function selectedPrintCase(group, requested) {
  const item = requested === null ? group.cases[0]
    : [...group.cases, ...(group.historicalCases ?? [])].find(row => row.id === requested);
  check(item, '指定されたモデルは印刷用データのカタログにありません。');
  return item;
}
