import { DENSITY_ID, DENSITY_FLAGS, COPILOT_SYMMETRY_REVISION, COUNT_PERCENTAGES,
  densityArtifactIdentity, densityAssert as check, countTargetResult,
  validateDensityFile, validateMetrics, validateAssetGroups, isHash, isObject } from './density-data.js';

export const SYMMETRY_RECEIPT = '/archive/copilot-symmetry-revision.json';
const message = '対称化改訂の公開記録が、実モデル・固定分母・検査記録と一致しません。';

export async function loadSymmetryPublication(readRecord, readFile, pointer) {
  const receipt = await readRecord(SYMMETRY_RECEIPT);
  const catalog = receipt.revision_catalog ? await readFile(receipt.revision_catalog) : null;
  return validateSymmetryPublication(receipt, catalog, pointer);
}

export function validateSymmetryPublication(receipt, catalog, pointer) {
  check(isObject(receipt) && receipt.schema_version === 1 && receipt.request_id === 'copilot-symmetry-20260923'
    && receipt.geometry_revision === COPILOT_SYMMETRY_REVISION && receipt.baseline_count === 17873
    && receipt.expected_case_count === 5 && Array.isArray(receipt.cases) && receipt.cases.length === 5
    && ['PARTIAL', 'READY'].includes(receipt.state)
    && receipt.previous_completed_delivery?.satisfies_this_new_request === false, message);
  if (receipt.revision_catalog) {
    validateDensityFile(receipt.revision_catalog);
    check(catalog?.schema_version === 1 && catalog.study_id === DENSITY_ID
      && catalog.kind === 'COPILOT_BILATERAL_SYMMETRY_REVISION'
      && catalog.geometry_revision === COPILOT_SYMMETRY_REVISION && catalog.expected_case_count === 5
      && catalog.baseline_count === 17873 && catalog.base_catalog_sha256 === pointer.catalog.sha256
      && receipt.base_catalog_sha256 === pointer.catalog.sha256
      && Object.entries(DENSITY_FLAGS).every(([key, value]) => catalog[key] === value)
      && Array.isArray(catalog.cases) && catalog.cases.length === 5, message);
    if (catalog.display_catalog) validateDensityFile(catalog.display_catalog);
  } else check(catalog === null && receipt.cases.every(row => row.status === 'INPUT_WAIT'), message);
  const cases = [], published = [], slots = new Set();
  for (const row of receipt.cases) {
    const identity = densityArtifactIdentity(row.requested_case_id);
    check(identity?.symmetry && identity.revision === COPILOT_SYMMETRY_REVISION
      && row.logical_case_id === identity.logicalId && !slots.has(identity.logicalId)
      && COUNT_PERCENTAGES.includes(identity.percentage) && row.multiplier === identity.percentage / 100
      && row.target_count === Math.floor((17873 * identity.percentage + 50) / 100), message);
    slots.add(identity.logicalId);
    const item = catalog?.cases.find(entry => entry.id === row.requested_case_id);
    if (row.status === 'INPUT_WAIT') {
      check(row.actual_case_id === null && row.actual_count === null && row.source_commit === null
        && row.symmetry_evidence === null && row.mechanical_evidence === null && row.downloads === null
        && row.verification?.public_browser_passed === false && row.verification.anonymous_downloads_passed === false
        && (!item || (item.state === 'INPUT_WAIT' && item.metrics === undefined && item.manifest === undefined)), message);
      if (item) cases.push(item);
      continue;
    }
    check(['PUBLIC_PENDING', 'READY'].includes(row.status) && item?.state === 'READY'
      && item.id === row.actual_case_id && item.logical_case_id === row.logical_case_id
      && item.geometry_revision === COPILOT_SYMMETRY_REVISION && item.character === 'copilot'
      && item.count_percentage === identity.percentage && item.metrics?.part_count === row.actual_count
      && item.source_commit === row.source_commit && /^[0-9a-f]{40}$/.test(item.source_commit)
      && row.external_aid_count === 0 && row.assembly_aid_count === 0, message);
    validateMetrics(item.metrics);
    const actual = countTargetResult(17873, identity.percentage, item.metrics.part_count);
    check(actual.within_tolerance && actual.target === item.target_count && actual.difference === item.target_difference
      && Math.abs(actual.actual_ratio - item.actual_ratio) < 1e-10
      && isHash(item.source_manifest_sha256) && isHash(item.source_bom_sha256), message);
    validateDensityFile(item.manifest);
    validateAssetGroups(item.assets);
    for (const view of ['front', 'three_quarter']) validateDensityFile(item.images[view]);
    validateDensityFile(row.symmetry_evidence);
    validateDensityFile(row.mechanical_evidence);
    if (item.symmetry_raster_verification) {
      const raster = item.symmetry_raster_verification;
      check(raster.source_visual_sha256 === row.symmetry_evidence.sha256
        && raster.native_geometry_mirror_pairs_verified === true
        && raster.eye_mask_xor === 0 && Number.isSafeInteger(raster.whole_material_xor) && raster.whole_material_xor >= 0
        && raster.left_eye_pixels === raster.right_eye_pixels && raster.left_eye_pixels > 0
        && Number.isSafeInteger(raster.silhouette_xor) && raster.silhouette_xor >= 0
        && Number.isSafeInteger(raster.maximum_silhouette_boundary_distance_pixels)
        && raster.maximum_silhouette_boundary_distance_pixels >= 0
        && raster.maximum_silhouette_boundary_distance_pixels <= 1
        && raster.boundary_distance_tolerance_pixels === 1, message);
      if (raster.whole_material_xor > 0) check(Number.isSafeInteger(raster.render_samples) && raster.render_samples >= 32
        && ['geometry', 'c0', 'c1', 'c2'].every(name => {
          const row = raster.per_material_boundary_measurements?.[name];
          return row && Number.isSafeInteger(row.mirror_xor_pixels) && row.mirror_xor_pixels >= 0
            && Number.isFinite(row.maximum_mirrored_boundary_distance_pixels)
            && row.maximum_mirrored_boundary_distance_pixels >= 0 && row.maximum_mirrored_boundary_distance_pixels <= 1;
        }) && raster.per_material_boundary_measurements.c2.mirror_xor_pixels === 0, message);
    }
    const support = item.assembly_support;
    check(support?.geometry_revision === COPILOT_SYMMETRY_REVISION
      && support.status === 'DIGITAL_SELF_SUPPORTING_UNTESTED' && support.physical_validation === 'UNKNOWN'
      && support.external_aid_count === 0 && support.assembly_aid_count === 0 && support.all_categories_geometry_match === true
      && support.manifest_sha256 === item.source_manifest_sha256
      && isHash(support.attachment_evidence_sha256) && isHash(support.geometry_sequence_identity_sha256)
      && row.symmetry_evidence.path === `/artifacts/studies/${DENSITY_ID}/validation/${item.id}-native-visual-symmetry.json`
      && item.symmetry_visual?.sha256 === row.symmetry_evidence.sha256
      && item.symmetry_visual.path === row.symmetry_evidence.path
      && row.mechanical_evidence.encoding === 'gzip'
      && row.mechanical_evidence.path === `/artifacts/studies/${DENSITY_ID}/validation/${item.id}-symmetry-support.json.gz`
      && support.assembly_validation_transport_ref?.sha256 === row.mechanical_evidence.sha256
      && support.sequence_evidence_sha256 === row.mechanical_evidence.decoded_sha256
      && support.assembly_validation_ref?.sha256 === row.mechanical_evidence.decoded_sha256
      && item.symmetry_context?.intentional_changes_from_published_case === true
      && item.symmetry_context.old_occupied_and_color_unchanged_assertion === false, message);
    check(row.downloads?.cad === item.assets.native_cad[0].url && row.downloads.cg === item.assets.cg[0].url
      && row.downloads.animation === item.assets.animations.turntable.url && row.downloads.assembly === item.assets.assembly[0].url
      && row.downloads.viewer === `https://ktanino10.github.io/octoprints-brick-kit-downloads/ja/density-guide.html?case=${item.id}`,
    message);
    const completeCase = row.status === 'READY';
    check(row.verification?.public_browser_passed === completeCase && row.verification.anonymous_downloads_passed === completeCase, message);
    cases.push(item);
    if (completeCase) published.push(item);
  }
  const complete = published.length === 5 && receipt.comparisons?.state === 'READY';
  check(receipt.published_verified_case_count === published.length && (receipt.state === 'READY') === complete
    && receipt.verification?.public_browser_passed === complete && receipt.verification.anonymous_downloads_passed === complete, message);
  return { receipt, catalog, cases, published };
}
