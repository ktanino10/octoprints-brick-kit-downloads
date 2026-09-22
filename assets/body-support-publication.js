import {
  DENSITY_ID, DENSITY_FLAGS, COPILOT_SUPPORT_REVISION, densityArtifactIdentity, densityAssert as check,
  countTargetResult, validateDensityFile, validateMetrics, validateAssetGroups, isHash, isObject,
} from './density-data.js';

export const BODY_SUPPORT_RECEIPT = '/archive/copilot-support-free-revision.json';
const percentages = [120, 150, 200, 300];
const message = 'Copilot支台なし改訂の実データ・旧版との関係・公開検証記録が一致しません。';

export async function loadBodySupportPublication(readRecord, readFile, pointer) {
  const receipt = await readRecord(BODY_SUPPORT_RECEIPT);
  const overlay = receipt.revision_catalog ? await readFile(receipt.revision_catalog) : null;
  return validateBodySupportPublication(receipt, overlay, pointer);
}

export function validateBodySupportPublication(receipt, overlay, pointer) {
  check(isObject(receipt) && receipt.schema_version === 1 && receipt.study_id === DENSITY_ID
    && receipt.request_id === 'copilot-support-free-20260922' && ['PARTIAL', 'READY'].includes(receipt.state)
    && receipt.baseline_count === 17873 && receipt.expected_case_count === 4
    && Array.isArray(receipt.cases) && receipt.cases.length === 4
    && receipt.previous_completed_delivery?.satisfies_this_new_request === false
    && receipt.preserved_existing_four_x?.case_id === 'copilot-p400'
    && receipt.preserved_existing_four_x.actual_count === 71261
    && receipt.preserved_existing_four_x.counts_toward_the_four_new_revisions === false, message);
  if (receipt.revision_catalog !== undefined) {
    validateDensityFile(receipt.revision_catalog);
    check(overlay?.schema_version === 1 && overlay.study_id === DENSITY_ID
      && overlay.kind === 'COPILOT_BODY_SUPPORT_REVISION' && overlay.geometry_revision === COPILOT_SUPPORT_REVISION
      && overlay.base_catalog_sha256 === pointer.catalog.sha256 && receipt.base_catalog_sha256 === pointer.catalog.sha256
      && overlay.baseline_count === 17873 && overlay.expected_case_count === 4
      && Array.isArray(overlay.cases) && overlay.cases.length === 4
      && Object.entries(DENSITY_FLAGS).every(([key, value]) => overlay[key] === value), message);
    if (overlay.display_catalog !== undefined) validateDensityFile(overlay.display_catalog);
  } else check(overlay === null && receipt.cases.every(item => item.status === 'INPUT_WAIT'), message);
  const all = [], published = [], seen = new Set();
  for (const record of receipt.cases) {
    const identity = densityArtifactIdentity(record.actual_case_id);
    check(identity?.supportFree && identity.revision === COPILOT_SUPPORT_REVISION
      && percentages.includes(identity.percentage) && !seen.has(identity.logicalId)
      && record.logical_case_id === identity.logicalId && record.geometry_revision === identity.revision
      && record.multiplier === identity.percentage / 100
      && record.target_count === Math.floor((17873 * identity.percentage + 50) / 100), message);
    seen.add(identity.logicalId);
    const item = overlay?.cases.find(entry => entry.id === record.actual_case_id);
    if (record.status === 'INPUT_WAIT') {
      check(record.actual_count === null && record.source_commit === null && record.external_aid_count === null
        && record.assembly_aid_count === null && record.geometry_sequence_evidence === null
        && record.verification?.public_browser_passed === false && record.verification.anonymous_downloads_passed === false
        && (!item || (item.state === 'INPUT_WAIT' && item.metrics === undefined && item.manifest === undefined)), message);
      if (item) all.push(item);
      continue;
    }
    check(['SOURCE_READY', 'PUBLIC_PENDING', 'READY'].includes(record.status)
      && item?.state === 'READY' && item.logical_case_id === identity.logicalId
      && item.geometry_revision === identity.revision && item.character === 'copilot'
      && item.count_percentage === identity.percentage && record.actual_count === item.metrics?.part_count
      && record.source_commit === item.source_commit && /^[0-9a-f]{40}$/.test(item.source_commit)
      && record.external_aid_count === 0 && record.assembly_aid_count === 0, message);
    validateMetrics(item.metrics);
    const target = countTargetResult(17873, identity.percentage, item.metrics.part_count);
    check(target.within_tolerance && item.target_count === target.target && item.target_difference === target.difference
      && Math.abs(item.actual_ratio - target.actual_ratio) < 1e-10 && isHash(item.source_manifest_sha256)
      && isHash(item.source_bom_sha256) && typeof item.tradeoff === 'string' && item.tradeoff.length > 0, message);
    validateDensityFile(item.manifest);
    for (const view of ['front', 'three_quarter']) validateDensityFile(item.images[view]);
    validateAssetGroups(item.assets);
    const support = item.assembly_support, proof = record.geometry_sequence_evidence;
    validateDensityFile(proof);
    check(support?.status === 'DIGITAL_SELF_SUPPORTING_UNTESTED' && support.geometry_revision === identity.revision
      && support.physical_validation === 'UNKNOWN' && support.external_aid_count === 0 && support.assembly_aid_count === 0
      && support.all_categories_geometry_match === true && support.manifest_sha256 === item.source_manifest_sha256
      && isHash(support.attachment_evidence_sha256) && isHash(support.geometry_sequence_identity_sha256)
      && support.sequence_evidence_sha256 === proof.sha256
      && support.assembly_validation_ref?.path === proof.path && support.assembly_validation_ref.bytes === proof.bytes
      && support.assembly_validation_ref.sha256 === proof.sha256
      && proof.path === `/artifacts/studies/${DENSITY_ID}/validation/${item.id}-assembly-support.json`
      && support.gravity_balance_result === 'PASS_ALL_NOMINAL_CAD_STATIC_MOMENT_BOUNDS'
      && support.physical_mass_measured === false, message);
    all.push(item);
    if (record.status === 'READY') {
      check(record.verification?.public_browser_passed === true && record.verification.anonymous_downloads_passed === true
        && record.cad_url === item.assets.native_cad[0].url && record.cg_url === item.assets.cg[0].url
        && record.animation_url === item.assets.animations.turntable.url && record.assembly_url === item.assets.assembly[0].url
        && record.viewer_url === `https://ktanino10.github.io/octoprints-brick-kit-downloads/ja/density-guide.html?case=${item.id}`,
      message);
      published.push(item);
    } else check(record.verification?.public_browser_passed === false && record.verification.anonymous_downloads_passed === false, message);
  }
  const complete = published.length === 4;
  check(receipt.published_verified_case_count === published.length && (receipt.state === 'READY') === complete
    && receipt.verification?.public_browser_passed === complete && receipt.verification.anonymous_downloads_passed === complete, message);
  return { receipt, catalog: overlay, cases: all, published };
}
