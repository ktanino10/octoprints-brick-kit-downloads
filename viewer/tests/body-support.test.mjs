import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { validateGuideManifest, guideIndex, radialPosition } from '../src/density-state.js';
import { validateBodySupportPublication } from '../../assets/body-support-publication.js';
import { printCatalog, selectedPrintCase } from '../../assets/print-catalog-data.js';

const root = new URL('../../', import.meta.url);
const load = async path => JSON.parse(await readFile(new URL(path.replace(/^\//, ''), root)));
const pointer = await load('archive/density-study.json');
const base = await load(pointer.catalog.path);
const receipt = await load('archive/copilot-support-free-revision.json');
const overlay = await load(receipt.revision_catalog.path);
const current = overlay.cases.find(item => item.state === 'READY');
const model = JSON.parse(gunzipSync(await readFile(new URL(current.manifest.path.slice(1), root))));
const proof = await load(model.support_validation.path);

test('actual generic Copilot body support is bound to its new ID and keeps true low part origins', async () => {
  assert.equal(validateGuideManifest(model, current.id, proof), model);
  assert.equal(model.parts.length, current.metrics.part_count);
  assert.equal(model.aids.length, 0);
  const index = guideIndex(model);
  for (const module of proof.modules) {
    const part = index.byId.get(module.part_id);
    assert.equal(part.position_mm[2], module.physical_bottom_z_mm);
    assert.equal(part.assembly_stage_z_mm, module.receiving_body_stage_z_mm);
    for (const id of part.support_ids) assert.ok(index.byId.get(id).step < part.step);
    const original = [...part.position_mm];
    radialPosition(part, 1);
    assert.deepEqual(radialPosition(part, 0), original);
  }
  assert.throws(() => validateGuideManifest(model, current.id, null));
  for (const mutate of [
    item => { item.modules[0].receiving_body_stage_z_mm += 1; },
    item => { item.actual_native_support_checks.modules[0].anchor_role = 'WHISKER_ROOT_MODULE'; },
    item => { item.actual_native_support_checks.modules[0].body_supports[0].native_bearing_mm2 = 0; },
    item => { item.support_structural_sections[0].actual_brep_sections.pop(); },
    item => { item.gravity_balance.modules[0].assembly_prefix_checks.at(-1).minimum_support_margin_mm = 0.9; },
  ]) {
    const changed = structuredClone(proof); mutate(changed);
    assert.throws(() => validateGuideManifest(model, current.id, changed));
  }
  const originalCase = base.cases.find(item => item.id === current.logical_case_id);
  const old = JSON.parse(gunzipSync(await readFile(new URL(originalCase.manifest.path.slice(1), root))));
  old.animation_contract.sequence_mode = 'BODY_FIRST_INTERNAL_SUPPORT';
  assert.throws(() => validateGuideManifest(old, old.candidate_id, proof));
});

test('the prior READY remains independent and a pending new case is not silently promoted in the print catalogue', async () => {
  const previousReceipt = await load('archive/block-budget-matrix.json');
  const previousEvidence = await load(previousReceipt.verification_record.path);
  const before = JSON.stringify(base);
  const originalCounts = base.cases.map(item => item.metrics.part_count);
  const publication = validateBodySupportPublication(receipt, overlay, pointer);
  const pending = structuredClone(receipt);
  for (const row of pending.cases) if (row.status !== 'INPUT_WAIT') {
    row.status = 'PUBLIC_PENDING';
    row.verification = { public_browser_passed: false, anonymous_downloads_passed: false };
  }
  pending.state = 'PARTIAL'; pending.published_verified_case_count = 0;
  pending.verification = { public_browser_passed: false, anonymous_downloads_passed: false };
  const waiting = validateBodySupportPublication(pending, overlay, pointer);
  const groups = printCatalog(base, pointer, previousReceipt, previousEvidence, waiting);
  assert.equal(groups[1].cases[0].id, 'copilot-p120');
  const approved = structuredClone(pending);
  const row = approved.cases.find(item => item.actual_case_id === current.id);
  row.status = 'READY'; row.verification = { public_browser_passed: true, anonymous_downloads_passed: true };
  approved.published_verified_case_count = 1;
  const available = validateBodySupportPublication(approved, overlay, pointer);
  const replaced = printCatalog(base, pointer, previousReceipt, previousEvidence, available);
  assert.equal(replaced[1].cases.find(item => item.percentage === current.count_percentage).id, current.id);
  assert.equal(replaced[1].cases.find(item => item.percentage === 400).id, 'copilot-p400');
  assert.equal(selectedPrintCase(replaced[1], current.logical_case_id).historical, true);
  assert.deepEqual(base.cases.map(item => item.metrics.part_count), originalCounts);
  assert.equal(JSON.stringify(base), before);
  assert.equal(publication.cases.length, 4);
  const fakeComplete = structuredClone(approved); fakeComplete.state = 'READY';
  assert.throws(() => validateBodySupportPublication(fakeComplete, overlay, pointer));
});
