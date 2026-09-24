import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { validateGuideManifest, radialPosition } from '../src/density-state.js';
import { validateSymmetryPublication, validateSymmetryRaster } from '../../assets/symmetry-publication.js';
import { validateBodySupportPublication } from '../../assets/body-support-publication.js';
import { printCatalog, selectedPrintCase } from '../../assets/print-catalog-data.js';

const root = new URL('../../', import.meta.url);
const json = async path => JSON.parse(await readFile(new URL(path.replace(/^\//, ''), root)));
const pointer = await json('archive/density-study.json');
const catalog = await json(pointer.catalog.path);
const receipt = await json('archive/copilot-symmetry-revision.json');
const symmetry = await json(receipt.revision_catalog.path);
const ready = symmetry.cases.filter(item => item.state === 'READY');

test('all existing actual raster receipts remain bound to their unchanged source measurements', async () => {
  for (const item of ready) {
    const visual = await json(item.symmetry_visual.path);
    if (!item.symmetry_raster_verification) {
      assert.deepEqual([visual.left_vs_reflected_right_eye_xor_pixels,
        visual.whole_silhouette_xor_pixels, visual.whole_material_xor_pixels], [0, 0, 0]);
      continue;
    }
    assert.equal(validateSymmetryRaster(item.symmetry_raster_verification, item.symmetry_visual.sha256, visual),
      item.symmetry_raster_verification);
  }
});

function boundedEyeFixture() {
  const raster = {
    source_visual_sha256: 'a'.repeat(64), native_geometry_mirror_pairs_verified: true,
    boundary_distance_tolerance_pixels: 1, render_samples: 32,
    left_eye_pixels: 10181, right_eye_pixels: 10180, eye_mask_xor: 2,
    left_vs_reflected_right_eye_xor_pixels: 1, maximum_eye_boundary_distance_pixels: 1,
    silhouette_xor: 64, maximum_silhouette_boundary_distance_pixels: 1, whole_material_xor: 214,
    per_material_boundary_measurements: Object.fromEntries(
      [['geometry', 64], ['c0', 276], ['c1', 214], ['c2', 2]].map(([name, count]) =>
        [name, { mirror_xor_pixels: count, maximum_mirrored_boundary_distance_pixels: 1 }])),
  };
  const visual = {
    raster_boundary_tolerance_pixels: 1, render_samples: 32,
    eyes: { left: { pixels: 10181 }, right: { pixels: 10180 } },
    left_vs_reflected_right_eye_xor_pixels: 1, maximum_eye_boundary_distance_pixels: 1,
    whole_silhouette_xor_pixels: 64, whole_material_xor_pixels: 214,
    per_material_boundary_measurements: structuredClone(raster.per_material_boundary_measurements),
  };
  return { raster, visual };
}

test('bounded raster unit fixture distinguishes one-sided eye XOR from full-image yellow XOR', () => {
  const { raster, visual } = boundedEyeFixture();
  assert.equal(validateSymmetryRaster(raster, raster.source_visual_sha256, visual), raster);
  assert.notEqual(raster.left_eye_pixels, raster.right_eye_pixels);
  assert.equal(raster.eye_mask_xor, 2 * visual.left_vs_reflected_right_eye_xor_pixels);
});

test('bounded eye pixels cannot replace exact native evidence, hide missing fields or relax boundary distance', () => {
  for (const mutate of [
    r => { r.native_geometry_mirror_pairs_verified = false; },
    r => { r.source_visual_sha256 = 'b'.repeat(64); },
    r => { r.eye_mask_xor = 1; },
    r => { r.eye_mask_xor = 0; },
    r => { delete r.left_vs_reflected_right_eye_xor_pixels; },
    r => { delete r.maximum_eye_boundary_distance_pixels; },
    r => { r.maximum_eye_boundary_distance_pixels = 1.01; },
    r => { r.right_eye_pixels = r.left_eye_pixels; },
    r => { r.right_eye_pixels = 0; },
    r => { r.render_samples = 1; },
    r => { delete r.per_material_boundary_measurements; },
    r => { r.per_material_boundary_measurements.c0.mirror_xor_pixels += 1; },
    r => { r.per_material_boundary_measurements.c2.mirror_xor_pixels = 0; },
    r => { r.per_material_boundary_measurements.c1.maximum_mirrored_boundary_distance_pixels = Math.SQRT2; },
    r => { r.per_material_boundary_measurements.geometry.maximum_mirrored_boundary_distance_pixels = Infinity; },
  ]) {
    const { raster, visual } = boundedEyeFixture();
    mutate(raster);
    assert.throws(() => validateSymmetryRaster(raster, 'a'.repeat(64), visual));
  }
  for (const mutate of [
    v => { v.left_vs_reflected_right_eye_xor_pixels = 0; },
    v => { v.maximum_eye_boundary_distance_pixels = 0; },
    v => { v.eyes.right.pixels += 1; },
    v => { v.render_samples = 1; },
    v => { delete v.per_material_boundary_measurements; },
    v => { v.per_material_boundary_measurements.c2.mirror_xor_pixels = 1; },
  ]) {
    const { raster, visual } = boundedEyeFixture();
    mutate(visual);
    assert.throws(() => validateSymmetryRaster(raster, raster.source_visual_sha256, visual));
  }
});

test('all accepted corrected guides bind exact physical pairs, colors, zero-aid loads and immutable native delivery', async () => {
  for (const item of ready) {
    const raw = await readFile(new URL(item.manifest.path.slice(1), root));
    const manifest = JSON.parse(gunzipSync(raw));
    const proof = JSON.parse(gunzipSync(await readFile(new URL(manifest.support_validation.path.slice(1), root))));
    assert.equal(validateGuideManifest(manifest, item.id, proof), manifest);
    assert.equal(manifest.aids.length, 0);
    for (const part of manifest.parts) {
      radialPosition(part, 1);
      assert.deepEqual(radialPosition(part, 0), part.position_mm);
    }
    assert.throws(() => validateGuideManifest(manifest, item.id, null));
    const badMap = structuredClone(manifest);
    badMap.parts[0].mirror_part_id = 'MISSING-ACTUAL-PART';
    assert.throws(() => validateGuideManifest(badMap, item.id, proof));
    for (const alter of [
      p => { p.source_occupied_cells_unchanged = true; },
      p => { p.source_visible_colors_unchanged = true; },
      p => { p.native_symmetry.type_rotation_pair_comparisons.pop(); },
      p => { p.native_symmetry.type_rotation_pair_comparisons[0].symmetric_difference_volume_mm3 = 100; },
      p => { p.actual_native_support_checks.modules[0].gravity_balance.assembly_prefix_checks.at(-1).minimum_support_margin_mm = 0.9; },
    ]) {
      const changed = structuredClone(proof); alter(changed);
      assert.throws(() => validateGuideManifest(manifest, item.id, changed));
    }
  }
});

test('prior complete scopes and explicit old URLs stay intact while only actual public-QA-ready symmetry cases replace choices', async () => {
  const oldReceipt = await json('archive/block-budget-matrix.json');
  const oldEvidence = await json(oldReceipt.verification_record.path);
  const bodyReceipt = await json('archive/copilot-support-free-revision.json');
  const body = validateBodySupportPublication(bodyReceipt, await json(bodyReceipt.revision_catalog.path), pointer);
  const input = structuredClone(receipt);
  for (const row of input.cases) if (row.status !== 'INPUT_WAIT') {
    row.status = 'PUBLIC_PENDING'; row.verification = { public_browser_passed: false, anonymous_downloads_passed: false };
  }
  input.state = 'PARTIAL'; input.published_verified_case_count = 0;
  input.verification = { public_browser_passed: false, anonymous_downloads_passed: false };
  const waiting = validateSymmetryPublication(input, symmetry, pointer);
  const original = printCatalog(catalog, pointer, oldReceipt, oldEvidence, body, waiting);
  const first = ready[0];
  assert.equal(original[1].cases.find(item => item.percentage === first.count_percentage).id, first.previous_case_id);
  const approved = structuredClone(input);
  const row = approved.cases.find(item => item.requested_case_id === first.id);
  row.status = 'READY'; row.verification = { public_browser_passed: true, anonymous_downloads_passed: true };
  approved.published_verified_case_count = 1;
  const published = validateSymmetryPublication(approved, symmetry, pointer);
  const current = printCatalog(catalog, pointer, oldReceipt, oldEvidence, body, published);
  assert.equal(current[1].cases.find(item => item.percentage === first.count_percentage).id, first.id);
  assert.equal(selectedPrintCase(current[1], first.previous_case_id).beforeSymmetry, true);
  assert.equal(catalog.cases.length, 15);
  const premature = structuredClone(approved); premature.state = 'READY';
  assert.throws(() => validateSymmetryPublication(premature, symmetry, pointer));
});
