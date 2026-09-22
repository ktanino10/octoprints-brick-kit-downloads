import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { printCatalog, selectedPrintCase } from '../../assets/print-catalog-data.js';

const root = new URL('../../', import.meta.url);
const load = async path => JSON.parse(await readFile(new URL(path.replace(/^\//, ''), root)));
const pointer = await load('archive/density-study.json');
const catalog = await load(pointer.catalog.path);
const receipt = await load('archive/block-budget-matrix.json');
const evidence = await load(receipt.verification_record.path);

test('first-time catalogue contains only the fifteen higher-part actual designs, not r3 or references', () => {
  const before = JSON.stringify(catalog);
  const groups = printCatalog(catalog, pointer, receipt, evidence);
  assert.deepEqual(groups.map(group => group.character), ['mona', 'copilot', 'ducky']);
  assert.equal(groups.flatMap(group => group.cases).length, 15);
  for (const group of groups) {
    assert.deepEqual(group.cases.map(item => item.percentage), [120, 150, 200, 300, 400]);
    assert.equal(selectedPrintCase(group, null), group.cases[0]);
    for (const item of group.cases) {
      assert.ok(item.partCount > 10000);
      assert.equal(item.physicalStatus, 'UNTESTED');
      assert.equal(item.slicerStatus, 'NOT_SLICED');
      assert.match(item.download.url, /^https:\/\/github.com\/ktanino10\/octoprints-brick-kit-downloads\/releases\/download\//);
      assert.match(item.image.path, /part-count-matrix-20260921\/images\//);
      assert.equal(selectedPrintCase(group, item.id), item);
    }
    assert.throws(() => selectedPrintCase(group, 'mona-common'));
    assert.throws(() => selectedPrintCase(group, 'mona-fine8-base-root-v2'));
  }
  assert.deepEqual(groups[2].cases.map(item => item.aids), [0, 0, 3, 0, 1]);
  assert.deepEqual(groups[0].cases.map(item => item.aids), [0, 0, 0, 0, 0]);
  assert.equal(JSON.stringify(catalog), before);
});

test('publication READY is not physical-print approval and unbound evidence fails explicitly', () => {
  for (const mutate of [
    state => { state.receipt.state = 'PARTIAL'; },
    state => { state.receipt.verification.public_browser_passed = false; },
    state => { state.evidence.catalog_sha256 = '0'.repeat(64); },
    state => { state.evidence.safety_and_scope.physical_validation = 'PASS'; },
    state => { state.evidence.actual_multiplier_cases[0].actual_parts = 519; },
    state => { state.evidence.actual_multiplier_cases[0].temporary_aids_excluded_from_figure_count = -1; },
    state => { state.evidence.actual_multiplier_cases[0].source_manifest_sha256 = '0'.repeat(64); },
    state => { state.evidence.actual_multiplier_cases.pop(); },
  ]) {
    const state = structuredClone({ catalog, pointer, receipt, evidence }); mutate(state);
    assert.throws(() => printCatalog(state.catalog, state.pointer, state.receipt, state.evidence));
  }
});
