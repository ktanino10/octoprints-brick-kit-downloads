import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import {
  SHAPE_STUDY_ID, SHAPE_CHARACTERS, SHAPE_VARIANTS, BASELINE_COUNTS,
  validateStudyPointer, validateShapeStudy, countDelta, studyPath,
} from '../../assets/shape-options-data.js';

const flags = { baseline_revision: 'r3-8mm-20260920', selection: 'UNSELECTED',
  physical_fit: 'UNKNOWN', retention_strength: 'UNKNOWN', slicer_status: 'NOT_SLICED', full_print: 'ON_HOLD' };
const pending = { schema_version: 1, study_id: SHAPE_STUDY_ID, state: 'INPUT_WAIT', ...flags };
const pointer = { ...pending, state: 'READY', data_url: `/artifacts/studies/${SHAPE_STUDY_ID}/public-study.json`,
  data_sha256: 'a'.repeat(64), source_commit: 'b'.repeat(40) };

function fixture() {
  return { schema_version: 1, study_id: SHAPE_STUDY_ID, kind: 'SHAPE_AND_PIECE_COUNT_STUDY',
    source_commit: pointer.source_commit, ...flags,
    rows: SHAPE_CHARACTERS.flatMap((character) => SHAPE_VARIANTS.map((variant, index) => ({
      character, variant, candidate_id: index ? `unit-test-only-${character}-${variant}` : `${character}-practical8`,
      baseline_candidate_id: `${character}-practical8`,
      pitch_mm: 8, stud_diameter_mm: 4.8,
      metrics: { part_count: BASELINE_COUNTS[character] + index, unique_types: 2, small_part_count: 0,
        small_part_definition: 'Synthetic unit-test definition; never published',
        minimum_part_mm: [15.8, 15.8, 3.2], dimensions_mm: [100, 100, 181] },
      evidence: { manifest_sha256: '1'.repeat(64), bom_sha256: '2'.repeat(64), native_geometry_sha256: '4'.repeat(64),
        counted_instances: BASELINE_COUNTS[character] + index, count_method: 'unit-test-only actual-ID contract fixture',
        baseline_identity_verified: index === 0 },
      appearance_changes: ['Unit fixture, not a production image.'], assembly_tradeoffs: ['Unit fixture.'],
      images: Object.fromEntries(['perspective', 'front'].map((view) => [view, {
        path: `/artifacts/studies/${SHAPE_STUDY_ID}/unit-only-${character}-${variant}-${view}.png`,
        sha256: '3'.repeat(64), bytes: 1, comparison_group: `unit-only-${character}-${view}`,
      }])),
    }))) };
}

test('pending shape studies contain no image/count publication pointer', () => {
  assert.equal(validateStudyPointer(pending).state, 'INPUT_WAIT');
  assert.throws(() => validateStudyPointer({ ...pending, data_url: pointer.data_url }));
  assert.throws(() => validateShapeStudy(fixture(), pending));
});

test('actual counts drive deltas; no locale parsing or estimated shape counts', () => {
  assert.deepEqual(countDelta(519, 519), { parts: 0, percent: 0 });
  assert.deepEqual(countDelta(100, 50), { parts: 50, percent: 100 });
  assert.deepEqual(countDelta(25, 50), { parts: -25, percent: -50 });
  for (const value of ['519', 0, NaN, Infinity, -1, 1.5]) assert.throws(() => countDelta(value, 519));
});

test('all nine actual identity/metrics/image records share the declared view conditions', () => {
  const data = fixture();
  const original = JSON.stringify(data);
  assert.equal(validateShapeStudy(data, pointer), data);
  assert.equal(JSON.stringify(data), original);
  for (const modify of [
    (value) => { value.rows[1].images.front.path = value.rows[0].images.front.path; },
    (value) => { value.rows[1].images.front.comparison_group = 'a-different-scale'; },
    (value) => { value.rows[0].metrics.part_count = 520; },
    (value) => { value.rows[1].evidence.counted_instances += 1; },
    (value) => { value.rows[1].metrics.small_part_count = 100000; },
    (value) => { value.rows[1].pitch_mm = 4; },
    (value) => { value.selection = 'APPROVED'; },
    (value) => { value.physical_fit = 'PASS'; },
    (value) => { value.rows.pop(); },
  ]) {
    const changed = fixture();
    modify(changed);
    assert.throws(() => validateShapeStudy(changed, pointer));
  }
});

test('comparison resources never escape the study; only baseline can reuse current r3 images', () => {
  for (const path of ['https://example.test/image.png', '/artifacts/phase1/mona-fine/preview.png',
    `/artifacts/studies/${SHAPE_STUDY_ID}/../other.png`,
    `/artifacts/studies/${SHAPE_STUDY_ID}/%2e%2e/private.png`]) assert.throws(() => studyPath(path));
  const baseline = '/artifacts/revisions/r3-8mm-20260920/mona-practical8/assembled.png';
  assert.throws(() => studyPath(baseline));
  assert.equal(studyPath(baseline, { baseline: true }), baseline);
});

test('the adopted r3 baseline and all its native/media/release metadata stay byte-identical', async () => {
  const root = new URL('../../', import.meta.url);
  const inventory = JSON.parse(await readFile(new URL('site/shape-study-baseline.json', root), 'utf8'));
  for (const entry of inventory.files) {
    const bytes = await readFile(new URL(entry.path, root));
    assert.equal(bytes.length, entry.bytes, entry.path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256, entry.path);
  }
  for (const [character, expected] of Object.entries(BASELINE_COUNTS)) {
    const manifest = JSON.parse(await readFile(new URL(`artifacts/revisions/r3-8mm-20260920/${character}-practical8/manifest.json`, root), 'utf8'));
    assert.equal(manifest.parts.length, expected);
  }
});
