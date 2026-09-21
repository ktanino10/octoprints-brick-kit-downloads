import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import {
  REFINEMENT_ID, REFINEMENT_ROLES, refinementPath, validateRefinementPointer, validateRefinementStudy,
  chooseRefinementComparison, countDelta,
} from '../../assets/mona-refinement-data.js';
import { translate } from '../../assets/i18n.js';

const gates = { current_revision_unchanged: 'r3-8mm-20260920',
  previous_study_unchanged: 'mona-likeness-360-20260921', selection: 'NOT_SELECTED', visual_approval: 'PENDING',
  physical_fit: 'UNKNOWN', retention_strength: 'UNKNOWN', slicer_status: 'NOT_SLICED', full_print: 'ON_HOLD' };
const pending = { schema_version: 1, study_id: REFINEMENT_ID, state: 'INPUT_WAIT', ...gates };
const pointer = { ...pending, state: 'READY', data_url: `/artifacts/studies/${REFINEMENT_ID}/public-study.json`,
  data_sha256: 'a'.repeat(64), source_commit: 'b'.repeat(40) };

function fixture() {
  return {
    schema_version: 1, kind: 'MONA_FINE_C_REFINEMENT_COMPARISON', study_id: REFINEMENT_ID,
    source_commit: pointer.source_commit, source_study_sha256: 'c'.repeat(64), ...gates,
    appearance_limit: 'Unit fixture only; no actual improvement claimed.',
    assembly_tradeoff: 'Synthetic test fixture, not a published candidate.',
    assembly_layer_note: 'Synthetic body families are not FDM layers.',
    changes: ['Unit-only change.'], remaining_differences: ['Unit-only remaining difference.'],
    detail_comparisons: ['forehead', 'eye_rims', 'mouth'].map((region) => ({
      region, path: `/artifacts/studies/${REFINEMENT_ID}/unit-only-${region}.jpg`,
      sha256: 'c'.repeat(64), bytes: 1, width: 1200, height: 300,
    })),
    metric_caution: 'Unit-only descriptive metrics, not approval.', original_source_tradeoff: 'Unit-only separate target.',
    quality_comparison: [{ id: 'original-front-outline', label: 'Unit-only original comparison', unit: 'IoU', before: 0.5, after: 0.4 }],
    small_part_exceptions: [{ part_id: 'unit-only-part', position_mm: [-8, 0, 0], body_mm: [7.8, 7.8, 4.8],
      extended_grip: false, reason_ja: 'Synthetic exception only.' }],
    rows: REFINEMENT_ROLES.map((role, index) => ({
      role, source_role: ['phase1-fine-c', 'dense360-pilot', 'fine-c-refined360'][index],
      candidate_id: ['mona-fine', 'mona-dense360', 'mona-fine-c360'][index],
      pitch_mm: index ? 8 : 4, stud_diameter_mm: index ? 4.8 : 1.8666666666666667, open_underside: true,
      color_mode: 'WHOLE_PART_SINGLE_COLOR',
      metrics: {
        part_count: [13837, 10908, 20000][index], unique_types: 2, one_by_one_exceptions: 1,
        layer_count: 75, minimum_part_mm: [7.8, 7.8, index ? 4.8 : 2.28], dimensions_mm: [100, 100, 180],
        grip_long_ge_15_8_count: [13836, 10907, 19999][index],
        body_height_families: [
          { body_height_mm: index ? 4.8 : 2.28, part_count: 1, unique_types: 1 },
          { body_height_mm: 9.6, part_count: [13836, 10907, 19999][index], unique_types: 1 },
        ],
      },
      evidence: { manifest_sha256: String(index + 1).repeat(64), bom_sha256: 'd'.repeat(64),
        geometry_sha256: 'e'.repeat(64), identity_projection_sha256: String(index + 4).repeat(64),
        counted_instances: [13837, 10908, 20000][index], bom_ids_match: true,
        bom_types_colors_poses_steps_match: true, reference_identity_verified: index < 2,
        whole_part_colors_verified: true, render_instances_match_manifest: true },
    })),
    comparisons: [['shape', 'front'], ['shape', 'three-quarter'], ['face', 'front']].map(([kind, view]) => ({
      id: `${kind}-${view}`, kind, view, conditions_sha256: 'f'.repeat(64), method_note: 'Unit-only shared conditions.',
      framing_rule: kind === 'shape' ? 'MATCHED_SCREEN_HEIGHT' : 'MATCHED_NORMALIZED_FACE_REGION',
      ...(kind === 'face' ? { normalized_face_region: [-0.4, 0.15, 0.4, 1.015] } : {}),
      images: REFINEMENT_ROLES.map((role, index) => ({
        role, path: `/artifacts/studies/${REFINEMENT_ID}/unit-only-${role}-${kind}-${view}.jpg`,
        sha256: String(index + 7).repeat(64), bytes: 1, width: 1200, height: 1200, conditions_sha256: 'f'.repeat(64),
        ...(kind === 'shape' ? { projected_subject_height_px: 864 }
          : { normalized_face_region: [-0.4, 0.15, 0.4, 1.015] }),
      })),
    })),
  };
}

test('refinement waits for real evidence without publishing a candidate pointer', () => {
  assert.equal(validateRefinementPointer(pending).state, 'INPUT_WAIT');
  assert.throws(() => validateRefinementPointer({ ...pending, data_url: pointer.data_url }));
  assert.throws(() => validateRefinementStudy(fixture(), pending));
  for (const [key, value] of [['visual_approval', 'APPROVED'], ['selection', 'SELECTED'], ['physical_fit', 'PASS'],
    ['previous_study_unchanged', 'another-study'], ['current_revision_unchanged', REFINEMENT_ID]]) {
    assert.throws(() => validateRefinementPointer({ ...pending, [key]: value }));
  }
});

test('body-height families accept actual new heights, preserve data and sum to actual counts', () => {
  const data = fixture(), before = JSON.stringify(data);
  assert.equal(validateRefinementStudy(data, pointer), data);
  assert.equal(JSON.stringify(data), before);
  assert.equal(data.rows[2].metrics.body_height_families[0].body_height_mm, 4.8);
  for (const change of [
    (row) => { row.metrics.body_height_families[0].body_height_mm = 0; },
    (row) => { row.metrics.body_height_families[0].part_count += 1; },
    (row) => { row.metrics.body_height_families[1].unique_types += 1; },
    (row) => { row.metrics.body_height_families[1].body_height_mm = 4.8; },
    (row) => { row.metrics.minimum_part_mm[2] = 3.2; },
    (row) => { row.metrics.body_height_families = []; },
  ]) {
    const changed = fixture();
    change(changed.rows[2]);
    assert.throws(() => validateRefinementStudy(changed, pointer));
  }
});

test('whole-part colors and actual render identity are required, not texture-only changes', () => {
  for (const change of [
    (data) => { data.rows[2].color_mode = 'RENDER_TEXTURE'; },
    (data) => { data.rows[2].evidence.whole_part_colors_verified = false; },
    (data) => { data.rows[2].evidence.render_instances_match_manifest = false; },
    (data) => { data.rows[2].evidence.bom_types_colors_poses_steps_match = false; },
    (data) => { data.rows[2].evidence.identity_projection_sha256 = data.rows[1].evidence.identity_projection_sha256; },
    (data) => { data.rows[2].pitch_mm = 4; },
    (data) => { data.rows[1].metrics.part_count = 10909; },
    (data) => { data.rows[0].evidence.reference_identity_verified = false; },
    (data) => { data.rows[2].source_role = 'dense360-pilot'; },
    (data) => { data.comparisons[0].images[2].sha256 = data.comparisons[0].images[1].sha256; },
  ]) {
    const data = fixture();
    change(data);
    assert.throws(() => validateRefinementStudy(data, pointer));
  }
});

test('refinement has separate previous-pilot and Fine-C deltas without imposing a count cap', () => {
  assert.equal(countDelta(20000, 10908).parts, 9092);
  assert.equal(countDelta(20000, 13837).parts, 6163);
  const data = fixture(), row = data.rows[2];
  row.metrics.part_count = row.evidence.counted_instances = 1_000_000;
  row.metrics.body_height_families[1].part_count = 999999;
  assert.equal(validateRefinementStudy(data, pointer).rows[2].metrics.part_count, 1_000_000);
});

test('face comparison defaults and paths stay within the new immutable study', () => {
  const study = fixture();
  assert.equal(chooseRefinementComparison(study, null).id, 'face-front');
  assert.equal(chooseRefinementComparison(study, 'unknown').id, 'face-front');
  assert.equal(chooseRefinementComparison(study, 'shape-three-quarter').id, 'shape-three-quarter');
  for (const value of ['https://example.test/fake.jpg',
    '/artifacts/studies/mona-likeness-360-20260921/dense360-pilot-face-crop.jpg',
    `/artifacts/studies/${REFINEMENT_ID}/../old.jpg`, `/artifacts/studies/${REFINEMENT_ID}/%2e%2e/old.jpg`]) {
    assert.throws(() => refinementPath(value));
  }
});

test('refinement localization distinguishes actual body heights and both count baselines', () => {
  assert.equal(translate('本体高 4.8 mm：20,000部品 / 2型', 'en'), 'Body height 4.8 mm: 20,000 parts / 2 types');
  assert.equal(translate('前の36 cm案（10,908部品）との差：+9,092部品（83.4%）', 'en'),
    'Compared with Previous 36 cm study (10,908 parts): +9,092 parts (83.4%)');
});

test('the first pilot source files, pointer, summary and source proofs stay byte-identical', async () => {
  const root = new URL('../../', import.meta.url);
  const frozen = JSON.parse(await readFile(new URL('site/mona-refinement-baseline.json', root), 'utf8'));
  const index = JSON.parse(await readFile(new URL('archive/sources/mona-likeness-360-20260921.json', root), 'utf8'));
  for (const entry of [...frozen.files, ...index.files]) {
    const bytes = await readFile(new URL(entry.path, root));
    assert.equal(bytes.length, entry.bytes, entry.path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256, entry.path);
  }
  const publication = validateRefinementPointer(JSON.parse(await readFile(new URL('archive/mona-refinement.json', root), 'utf8')));
  if (publication.state === 'READY') {
    const bytes = await readFile(new URL(refinementPath(publication.data_url).slice(1), root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), publication.data_sha256);
    const actual = validateRefinementStudy(JSON.parse(bytes), publication);
    const sourceBytes = await readFile(new URL(`artifacts/studies/${REFINEMENT_ID}/study.json`, root));
    assert.equal(createHash('sha256').update(sourceBytes).digest('hex'), actual.source_study_sha256);
    const source = JSON.parse(sourceBytes);
    for (const row of actual.rows) {
      const original = source.rows.find((item) => item.role === row.source_role);
      assert.equal(row.candidate_id, original.candidate_id);
      assert.equal(row.metrics.part_count, original.metrics.physical_piece_count);
      assert.equal(row.metrics.unique_types, original.metrics.unique_types);
      assert.deepEqual(row.metrics.dimensions_mm, original.metrics.actual_size_mm);
      assert.deepEqual(row.metrics.body_height_families, original.metrics.body_height_families);
      assert.equal(row.evidence.manifest_sha256, original.provenance.manifest_sha256);
      assert.equal(row.evidence.bom_sha256, original.provenance.bom_sha256);
      for (const [view, key] of [['front', 'front'], ['three-quarter', 'three_quarter']]) {
        const image = actual.comparisons.find((item) => item.kind === 'shape' && item.view === view).images.find((item) => item.role === row.role);
        assert.equal(image.sha256, original.images[key].sha256);
        assert.deepEqual(image.source_camera, original.images[key].normalization);
        assert.equal(image.projected_subject_height_px, 864);
      }
    }
    assert.deepEqual(actual.pattern_provenance, source.pattern_provenance);
    assert.deepEqual(actual.surface_edge_treatment, source.surface_edge_treatment);
    assert.deepEqual(actual.small_part_exceptions, source.small_part_exceptions);
    const metric = actual.quality_comparison.find((item) => item.id === 'original-front-outline');
    assert.equal(metric.before, source.c_target_metrics.secondary_original_source_comparison.previous_360.silhouette.front.intersection_over_union);
    assert.equal(metric.after, source.c_target_metrics.secondary_original_source_comparison.refined.silhouette.front.intersection_over_union);
  }
});
