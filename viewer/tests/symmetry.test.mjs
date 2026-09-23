import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { validateGuideManifest, radialPosition } from '../src/density-state.js';
import { validateSymmetryPublication } from '../../assets/symmetry-publication.js';
import { validateBodySupportPublication } from '../../assets/body-support-publication.js';
import { printCatalog, selectedPrintCase } from '../../assets/print-catalog-data.js';

const root = new URL('../../', import.meta.url);
const json = async path => JSON.parse(await readFile(new URL(path.replace(/^\//, ''), root)));
const pointer = await json('archive/density-study.json');
const catalog = await json(pointer.catalog.path);
const receipt = await json('archive/copilot-symmetry-revision.json');
const symmetry = await json(receipt.revision_catalog.path);
const ready = symmetry.cases.filter(item => item.state === 'READY');

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
