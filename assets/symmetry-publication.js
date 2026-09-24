import { DENSITY_ID, DENSITY_FLAGS, COPILOT_SYMMETRY_REVISION, COUNT_PERCENTAGES,
  densityArtifactIdentity, densityAssert as check, countTargetResult,
  validateDensityFile, validateMetrics, validateAssetGroups, isHash, isObject } from './density-data.js';

export const SYMMETRY_RECEIPT = '/archive/copilot-symmetry-revision.json';
const message = '対称化改訂の公開記録が、実モデル・固定分母・検査記録と一致しません。';

export function validateSymmetryRaster(raster, visualSHA, visual = null) {
  const count = value => Number.isSafeInteger(value) && value >= 0;
  const distance = value => Number.isFinite(value) && value >= 0 && value <= 1;
  check(isObject(raster) && isHash(visualSHA) && raster.source_visual_sha256 === visualSHA
    && raster.native_geometry_mirror_pairs_verified === true && raster.boundary_distance_tolerance_pixels === 1
    && count(raster.eye_mask_xor) && raster.eye_mask_xor % 2 === 0
    && count(raster.left_eye_pixels) && raster.left_eye_pixels > 0
    && count(raster.right_eye_pixels) && raster.right_eye_pixels > 0
    && count(raster.whole_material_xor) && count(raster.silhouette_xor)
    && distance(raster.maximum_silhouette_boundary_distance_pixels)
    && (raster.silhouette_xor === 0) === (raster.maximum_silhouette_boundary_distance_pixels === 0), message);
  // Earlier zero-eye-error receipts predate explicit half-mask measurements.
  const halfEyeXor = raster.left_vs_reflected_right_eye_xor_pixels ?? (raster.eye_mask_xor === 0 ? 0 : undefined);
  const eyeDistance = raster.maximum_eye_boundary_distance_pixels ?? (raster.eye_mask_xor === 0 ? 0 : undefined);
  check(count(halfEyeXor) && raster.eye_mask_xor === 2 * halfEyeXor && distance(eyeDistance)
    && (halfEyeXor === 0) === (eyeDistance === 0)
    && Math.abs(raster.left_eye_pixels - raster.right_eye_pixels) <= halfEyeXor
    && halfEyeXor <= raster.left_eye_pixels + raster.right_eye_pixels
    && (raster.left_eye_pixels + raster.right_eye_pixels - halfEyeXor) % 2 === 0, message);
  const boundaries = raster.per_material_boundary_measurements;
  if (raster.whole_material_xor > 0 || halfEyeXor > 0) {
    check(Number.isSafeInteger(raster.render_samples) && raster.render_samples >= 32 && isObject(boundaries), message);
  }
  if (boundaries !== undefined) {
    check(isObject(boundaries) && ['geometry', 'c0', 'c1', 'c2'].every(name => {
      const row = boundaries[name];
      return row && count(row.mirror_xor_pixels) && distance(row.maximum_mirrored_boundary_distance_pixels)
        && (row.mirror_xor_pixels === 0) === (row.maximum_mirrored_boundary_distance_pixels === 0);
    }) && boundaries.geometry.mirror_xor_pixels === raster.silhouette_xor
      && boundaries.geometry.maximum_mirrored_boundary_distance_pixels === raster.maximum_silhouette_boundary_distance_pixels
      && boundaries.c2.mirror_xor_pixels === raster.eye_mask_xor
      && boundaries.c2.maximum_mirrored_boundary_distance_pixels === eyeDistance
      && ['c0', 'c1', 'c2'].reduce((sum, name) => sum + boundaries[name].mirror_xor_pixels, 0)
        === raster.silhouette_xor + 2 * raster.whole_material_xor, message);
  }
  if (visual !== null) {
    check(isObject(visual) && visual.raster_boundary_tolerance_pixels === 1
      && visual.left_vs_reflected_right_eye_xor_pixels === halfEyeXor
      && visual.maximum_eye_boundary_distance_pixels === eyeDistance
      && visual.eyes?.left?.pixels === raster.left_eye_pixels && visual.eyes?.right?.pixels === raster.right_eye_pixels
      && visual.whole_silhouette_xor_pixels === raster.silhouette_xor
      && visual.whole_material_xor_pixels === raster.whole_material_xor, message);
    if (boundaries !== undefined) {
      check(raster.render_samples === visual.render_samples && ['geometry', 'c0', 'c1', 'c2'].every(name => {
        const source = visual.per_material_boundary_measurements?.[name];
        return source && boundaries[name].mirror_xor_pixels === source.mirror_xor_pixels
          && boundaries[name].maximum_mirrored_boundary_distance_pixels === source.maximum_mirrored_boundary_distance_pixels;
      }), message);
    }
  }
  return raster;
}

export async function loadSymmetryPublication(readRecord, readFile, pointer) {
  const receipt = await readRecord(SYMMETRY_RECEIPT);
  const catalog = receipt.revision_catalog ? await readFile(receipt.revision_catalog) : null;
  return validateSymmetryPublication(receipt, catalog, pointer);
}

export function effectiveSymmetryCatalog(base, overlay) {
  check(overlay?.geometry_revision === COPILOT_SYMMETRY_REVISION && overlay.cases?.length === 5
    && COUNT_PERCENTAGES.every(percentage => overlay.cases.some(item => item.state === 'READY'
      && item.logical_case_id === `copilot-p${percentage}` && item.id === `copilot-p${percentage}-symmetric-v3`)), message);
  const bySlot = new Map(overlay.cases.map(item => [item.logical_case_id, item]));
  return { ...base, cases: base.cases.map(item => bySlot.get(item.logical_case_id ?? item.id) ?? item),
    historical_cases: [...(base.historical_cases ?? []), ...base.cases.filter(item => bySlot.has(item.logical_case_id ?? item.id))] };
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
    if (catalog.comparison_sheets) validateDensityFile(catalog.comparison_sheets);
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
      validateSymmetryRaster(item.symmetry_raster_verification, row.symmetry_evidence.sha256);
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
  let comparisonsReady = false;
  if (receipt.comparisons !== undefined && receipt.comparisons !== null) {
    const comparisons = receipt.comparisons;
    const prefix = `/artifacts/studies/${DENSITY_ID}/revisions/${COPILOT_SYMMETRY_REVISION}/`;
    check(isObject(comparisons) && ['PUBLIC_PENDING', 'READY'].includes(comparisons.state)
      && comparisons.one_x_reference_symmetry === 'KNOWN_ASYMMETRY_READ_ONLY_NOT_REVISED'
      && Array.isArray(comparisons.assets) && comparisons.assets.length === 6
      && new Set(comparisons.assets.map(file => file.path)).size === 6, message);
    comparisons.assets.forEach(file => validateDensityFile(file));
    check(comparisons.assets.every(file => file.path.startsWith(prefix))
      && ['comparison-sheets.json', 'comparison.csv', 'matrix.json'].every(name =>
        comparisons.assets.some(file => file.path === prefix + name))
      && comparisons.assets.filter(file => file.path.startsWith(prefix + 'comparisons/') && file.path.endsWith('.jpg')).length === 3
      && comparisons.descriptor?.sha256 === catalog?.comparison_sheets?.sha256
      && comparisons.descriptor.path === catalog.comparison_sheets.path
      && comparisons.assets.some(file => file.path === comparisons.descriptor.path && file.sha256 === comparisons.descriptor.sha256), message);
    comparisonsReady = comparisons.state === 'READY';
    check(comparisons.verification?.public_browser_passed === comparisonsReady
      && comparisons.verification.anonymous_downloads_passed === comparisonsReady
      && (!comparisonsReady || published.length === 5), message);
  }
  const complete = published.length === 5 && comparisonsReady;
  check(receipt.published_verified_case_count === published.length && (receipt.state === 'READY') === complete
    && receipt.verification?.public_browser_passed === complete && receipt.verification.anonymous_downloads_passed === complete, message);
  return { receipt, catalog, cases, published };
}
