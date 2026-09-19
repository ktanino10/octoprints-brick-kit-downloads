import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  assemblyScope, assemblySetup, DataError, downloadEntries, findParts, makeIndex, parseEvidenceStatus, revisionPath,
  validateCatalog, validateGeometryMatch, validateManifest, validatePrototypes,
} from '../src/data.js';
import {
  contextFromCatalog, resolveViewContext, validateManifestChoice, validatePublishedPointer, validateSelection,
} from '../src/revisions.js';
import { getJSON } from '../src/network.js';
import { partMatrix } from '../src/geometry.js';
import {
  historyCatalog, selectedCatalog, selectedManifest, selectedPointer, selectedPrototypes, selectedRevision, selectedSelection,
} from './selected-fixtures.mjs';

test('schema 2 accepts connected polyominoes, four rotations and scoped visual approval', () => {
  const manifest = selectedManifest();
  const original = JSON.stringify(manifest);
  validateCatalog(selectedCatalog());
  validateManifest(manifest, 'mona-fine');
  const prototypes = validatePrototypes(selectedPrototypes());
  validateGeometryMatch(manifest, prototypes);
  assert.equal(JSON.stringify(manifest), original);
  assert.equal(manifest.types.poly.footprint_cells.length, 3);
  assert.equal(manifest.types.poly.cells[0] * manifest.types.poly.cells[1], 4);
  const p180 = manifest.parts[2];
  const p270 = manifest.parts[3];
  const a = new THREE.Vector3(1, 0, 0).applyMatrix4(partMatrix(p180, 0, [0, 0, 0], 2.4));
  const b = new THREE.Vector3(1, 0, 0).applyMatrix4(partMatrix(p270, 0, [0, 0, 0], 2.4));
  assert.ok(Math.abs(a.x - (p180.position_mm[0] - 1)) < 1e-12);
  assert.ok(Math.abs(b.y - (p270.position_mm[1] - 1)) < 1e-12);
});

test('schema 2 rejects malformed footprints and mismatched actual native footprint metadata', () => {
  for (const footprint of [undefined, [], [[0, 0], [1, 1]], [[0, 0], [0, 0]], [[0, 0], [2, 0]]]) {
    const manifest = selectedManifest();
    manifest.types.poly.footprint_cells = footprint;
    assert.throws(() => validateManifest(manifest, 'mona-fine'), DataError);
  }
  const prototypes = selectedPrototypes();
  prototypes.types.poly.footprint_cells = [[0, 0], [1, 0], [1, 1]];
  assert.throws(() => validateGeometryMatch(selectedManifest(), prototypes), /占有セル/);
});

test('limited vertical checks never become physical, retention or production approval', () => {
  const manifest = selectedManifest();
  const scope = assemblyScope(manifest.assembly);
  assert.ok(scope.label.includes('公称'));
  assert.ok(scope.detail.includes('保証しません'));
  for (const mutate of [
    (m) => { m.status.physical_fit = 'PASS'; },
    (m) => { m.status.production_export = 'READY'; },
    (m) => { m.assembly.mechanical_validation = 'PASS'; },
    (m) => { m.assembly.insertion_sweep_validation = 'PASS'; },
    (m) => { m.visual_approval.scope = 'All geometry approved'; },
    (m) => { m.visual_approval.derivative_joint_review = 'APPROVED'; },
  ]) {
    const copy = selectedManifest();
    mutate(copy);
    assert.throws(() => validateManifest(copy, 'mona-fine'), DataError);
  }
});

test('source support classes, baseline IDs, grouping and underside filtering stay exact', () => {
  const manifest = selectedManifest();
  const index = makeIndex(manifest);
  assert.equal(findParts(index, manifest, 'TEST-BASE-3', false, 2, 4)[0].id, 'TEST-R2-3');
  assert.equal(findParts(index, manifest, 'whisker-tip', false, 2, 4)[0].id, 'TEST-R2-3');
  assert.equal(findParts(index, manifest, '', false, 2, 4, true).length, 1);
  assert.equal(findParts(index, manifest, '', false, 2, 4, false, 'RETENTION_REQUIRED').length, 1);
  manifest.parts[0].support_class = 'PHYSICALLY_APPROVED';
  assert.throws(() => validateManifest(manifest, 'mona-fine'), /支持区分/);
});

test('pointer and catalog can reference only the exact selection file and their own revision', () => {
  validatePublishedPointer(selectedPointer());
  assert.throws(() => validatePublishedPointer({ ...selectedPointer(), selection_url: '/design/selected-connectors-v2.json' }), DataError);
  assert.throws(() => revisionPath('/artifacts/phase1/mona-fine/preview.png', selectedRevision), DataError);
  const catalog = selectedCatalog();
  catalog.candidates[0].video_url = '/artifacts/phase1/mona-balanced/turntable.mp4';
  assert.throws(() => validateCatalog(catalog), /別の版/);
  const oldSheet = selectedCatalog();
  oldSheet.contact_sheet_url = '/artifacts/phase1/contact-sheet.jpg';
  assert.throws(() => validateCatalog(oldSheet), /別の版/);
});

test('a published selected context matches all three approved baselines and their hashes', () => {
  const selection = validateSelection(selectedSelection());
  const context = contextFromCatalog(selection, selectedCatalog(), selectedPointer());
  assert.equal(context.kind, 'selected');
  assert.equal(context.statusURL, '/archive/status.json');
  assert.deepEqual(context.catalog.candidates.map((candidate) => candidate.id), ['mona-fine', 'copilot-chunky', 'ducky-fine']);
  const manifest = selectedManifest();
  validateManifestChoice(manifest, context);
  manifest.visual_approval.baseline_manifest_sha256 = 'f'.repeat(64);
  assert.throws(() => validateManifestChoice(manifest, context), /ハッシュ/);
  const wrong = selectedCatalog();
  wrong.candidates[0].metrics.baseline_part_count += 1;
  assert.throws(() => contextFromCatalog(selection, wrong, selectedPointer()), /基準の部品数/);
});

test('absent publication shows only actual selected Phase1 baselines without forging approval on old files', async () => {
  const history = historyCatalog();
  const original = JSON.stringify(history);
  const calls = [];
  const context = await resolveViewContext({
    mode: 'selected',
    readJSON: async (url) => {
      calls.push(url);
      return url === '/design/selected-designs.json' ? selectedSelection() : history;
    },
    readOptionalJSON: async () => null,
  });
  assert.equal(context.kind, 'baseline');
  assert.equal(context.statusURL, null);
  assert.equal(context.catalog.candidates.length, 3);
  assert.ok(context.catalog.candidates.every((candidate) => candidate.status.visual_selection === 'PENDING'));
  assert.equal(JSON.stringify(history), original);
  assert.deepEqual(calls, ['/design/selected-designs.json', '/artifacts/phase1/catalog.json']);
});

test('explicit Phase1 mode never requests current pointer or selection file', async () => {
  const calls = [];
  const context = await resolveViewContext({
    mode: 'phase1',
    readJSON: async (url) => { calls.push(url); return historyCatalog(); },
    readOptionalJSON: async () => { throw new Error('Historical mode must not fetch the pointer'); },
  });
  assert.equal(context.kind, 'phase1');
  assert.equal(context.catalog.candidates.length, 9);
  assert.equal(context.statusURL, '/archive/status.json');
  assert.deepEqual(calls, ['/artifacts/phase1/catalog.json']);
});

test('invalid or unavailable selected catalog never silently falls back to old geometry', async () => {
  const calls = [];
  await assert.rejects(resolveViewContext({
    mode: 'selected',
    readJSON: async (url) => {
      calls.push(url);
      if (url === '/design/selected-designs.json') return selectedSelection();
      throw new DataError('Published catalog missing');
    },
    readOptionalJSON: async () => selectedPointer(),
  }), /Published catalog missing/);
  assert.ok(!calls.includes('/artifacts/phase1/catalog.json'));
});

test('only a real 404 is optional absence; server failure or invalid JSON remains an explicit error', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response('', { status: 404 });
    assert.equal(await getJSON('/artifacts/selected/current.json', undefined, { optional: true }), null);
    globalThis.fetch = async () => new Response('', { status: 503 });
    await assert.rejects(getJSON('/artifacts/selected/current.json', undefined, { optional: true }), /503/);
    globalThis.fetch = async () => new Response('not json', { status: 200 });
    await assert.rejects(getJSON('/artifacts/selected/current.json', undefined, { optional: true }), /JSON/);
  } finally {
    globalThis.fetch = original;
  }
});

test('revision status never accepts a different revision as CURRENT', () => {
  const status = { state: 'CURRENT', details: [], revision: selectedRevision, physical_fit: 'UNKNOWN', production_export: 'BLOCKED' };
  assert.equal(parseEvidenceStatus(status, selectedRevision).state, 'CURRENT');
  assert.throws(() => parseEvidenceStatus({ ...status, revision: 'phase1' }, selectedRevision), /別の版/);
});

test('trial references and quantities are pitch-specific, revision-specific and never old 6 mm coupons', () => {
  const catalog = selectedCatalog();
  validateCatalog(catalog);
  assert.equal(catalog.trial_sets.reduce((sum, set) => sum + set.parts.reduce((n, part) => n + part.quantity, 0), 0), 22);
  assert.deepEqual(catalog.trial_sets.map((set) => set.pitch_mm), [4, 8]);
  catalog.trial_sets[1].parts[0].url = '/artifacts/cad/coupon.FCStd';
  assert.throws(() => validateCatalog(catalog), /別の版/);
  const wrongPitch = selectedCatalog();
  wrongPitch.trial_sets[1].pitch_mm = 6;
  assert.throws(() => validateCatalog(wrongPitch), /ピッチ/);
});

test('baseline-only downloads omit old native trial sets and aggregate data', () => {
  const catalog = historyCatalog();
  catalog.native_cad = { coupon_fcstd_url: '/artifacts/cad/coupon.FCStd' };
  catalog.review_data_url = '/artifacts/phase1/review-data.zip';
  catalog.candidates[0].video_url = '/artifacts/phase1/mona-balanced/turntable.mp4';
  const entries = downloadEntries(catalog, catalog.candidates[0], { baselineOnly: true });
  assert.ok(entries.every((entry) => !entry.url.startsWith('/artifacts/cad/')));
  assert.ok(!entries.some((entry) => entry.extension === 'ZIP'));
  assert.ok(!entries.some((entry) => entry.extension === 'MP4'));
});

test('actual draft approval scope, ground and temporary-cradle classes remain unverified', () => {
  const manifest = selectedManifest();
  manifest.visual_approval.scope = 'Visual baseline only: character, source palette, approximately 180 mm scale and chosen grid feel';
  manifest.parts[0].support_class = 'GROUND';
  manifest.parts[3].support_class = 'CRADLE_SUPPORTED_RETENTION_REQUIRED';
  manifest.parts[3].insertion_axis = '-Z';
  manifest.parts[3].required_aids = ['TEST-CRADLE'];
  manifest.assembly.underside_attachment_count = 0;
  manifest.assembly.fixture_supported_parts = 1;
  manifest.assembly.aids = [{
    id: 'TEST-CRADLE', part_ids: ['TEST-R2-3'], physical_strength: 'UNKNOWN',
    withdrawal_axis: '-X', nominal_clearance_check: 'PASS_CONSERVATIVE_EMPTY_COLUMNS',
    removal_gate: 'DO_NOT_REMOVE_UNTIL_PHYSICAL_RETENTION_CONFIRMED',
  }];
  manifest.assembly.insertion_sweep_validation = 'PASS_OCCUPANCY_PENDING_NATIVE_PROFILE';
  manifest.assembly.insertion_scope = 'Lattice only, native profile pending; no physical retention certification';
  manifest.assembly.independent_order_check = { status: 'PASS_CONSERVATIVE_VERTICAL', scope: 'Occupied columns and declared aids only' };
  validateManifest(manifest, manifest.candidate_id);
  const scope = assemblyScope(manifest.assembly);
  assert.ok(scope.label.includes('照合待ち'));
  assert.ok(scope.detail.includes('未完了'));
  assert.ok(scope.sourceDetails.includes(manifest.assembly.insertion_scope));
  assert.ok(!scope.label.includes('検査済み'));
  const index = makeIndex(manifest);
  assert.equal(findParts(index, manifest, '', false, 2, 4, true).length, 0);
  assert.equal(findParts(index, manifest, '', false, 2, 4, false, 'CRADLE_SUPPORTED_RETENTION_REQUIRED').length, 1);
  assert.equal(manifest.status.physical_fit, 'UNKNOWN');
});

test('required aid references and physical-strength claims are validated rather than invented', () => {
  const manifest = selectedManifest();
  manifest.parts[3].required_aids = ['missing-aid'];
  assert.throws(() => validateManifest(manifest, manifest.candidate_id), /補助具が定義/);
  manifest.assembly.aids = [{ id: 'missing-aid', part_ids: ['TEST-R2-3'], physical_strength: 'PASS' }];
  assert.throws(() => validateManifest(manifest, manifest.candidate_id), /実機強度/);
  manifest.assembly.aids[0].physical_strength = 'UNKNOWN';
  manifest.assembly.fixture_supported_parts = 2;
  assert.throws(() => validateManifest(manifest, manifest.candidate_id), /補助具が必要な部品数/);
});

test('mandatory preparation stays before part step1 and conditional retention never becomes a completed task', () => {
  const manifest = selectedManifest();
  manifest.parts[3].insertion_axis = '-Z';
  manifest.parts[3].support_class = 'CRADLE_SUPPORTED_RETENTION_REQUIRED';
  manifest.parts[3].required_aids = ['TEST-CRADLE'];
  manifest.assembly.underside_attachment_count = 0;
  manifest.assembly.alternative_upward_tip_count = 1;
  manifest.assembly.baseline_underside_attachment_count = 99;
  manifest.assembly.fixture_supported_parts = 1;
  manifest.assembly.aids = [{ id: 'TEST-CRADLE', physical_strength: 'UNKNOWN', removal_gate: 'DO_NOT_REMOVE_UNTIL_PHYSICAL_RETENTION_CONFIRMED' }];
  manifest.assembly.preparation_steps = [{ id: 'TEST-SETUP', aid_id: 'TEST-CRADLE', before_part_step: 1, instruction: 'TEST ONLY: place support before the model parts' }];
  const original = JSON.stringify(manifest);
  validateManifest(manifest, manifest.candidate_id);
  const setup = assemblySetup(manifest);
  assert.equal(setup.firstPartStep, 1);
  assert.equal(setup.aidCount, 1);
  assert.equal(setup.fixtureParts, 1);
  assert.equal(setup.allFixturePartsDownward, true);
  assert.equal(setup.retentionRequiredBeforeRemoval, true);
  assert.equal(makeIndex(manifest).steps.length, 4);
  assert.equal(JSON.stringify(manifest), original);
  manifest.assembly.preparation_steps[0].aid_id = 'MISSING';
  assert.throws(() => validateManifest(manifest, manifest.candidate_id), /準備条件/);
});

test('explicit revision preview reads actual revision URLs without inventing a current pointer', async () => {
  const calls = [];
  const context = await resolveViewContext({
    mode: 'selected', previewRevision: selectedRevision,
    readJSON: async (url) => { calls.push(url); return url === '/design/selected-designs.json' ? selectedSelection() : selectedCatalog(); },
    readOptionalJSON: async () => { throw new Error('Preview must not query publication'); },
  });
  assert.equal(context.kind, 'preview');
  assert.equal(context.statusURL, '/archive/status.json');
  assert.deepEqual(calls, ['/design/selected-designs.json', `/artifacts/selected/${selectedRevision}/catalog.json`]);
  await assert.rejects(resolveViewContext({
    mode: 'selected', previewRevision: 'wrong-revision',
    readJSON: async () => selectedSelection(), readOptionalJSON: async () => null,
  }), /revision/);
});

test('nominal seating does not erase part retention risks or certify aggregate strength', () => {
  const manifest = selectedManifest();
  manifest.parts[0].retention_risks = ['SELF_WEIGHT_CANTILEVER_REQUIRES_RETENTION_OR_TEMPORARY_SUPPORT'];
  manifest.parts[0].self_weight_bearing_margin_mm = -2.6;
  manifest.assembly.support_risk = {
    counts: { self_weight_cantilever: 1, single_stud: 0 },
    strength: 'UNKNOWN', retention: 'UNKNOWN', physical_tipping: 'UNKNOWN',
  };
  validateManifest(manifest, manifest.candidate_id);
  const index = makeIndex(manifest);
  assert.equal(findParts(index, manifest, '片持ち', false, 2, 4).length, 1);
  assert.equal(manifest.parts[0].support_class, 'SEATED_NOMINAL');
  manifest.assembly.support_risk.strength = 'PASS';
  assert.throws(() => validateManifest(manifest, manifest.candidate_id), /実機検証/);
  manifest.assembly.support_risk.strength = 'UNKNOWN';
  manifest.assembly.support_risk.counts.self_weight_cantilever = 2;
  assert.throws(() => validateManifest(manifest, manifest.candidate_id), /個別部品/);
});
