import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import {
  MONA_STUDY_ID, MONA_ROLES, validateMonaPointer, validateMonaStudy, monaStudyPath,
  chooseMonaComparison, countDelta,
} from '../../assets/mona-study-data.js';
import { translate, interpolate } from '../../assets/i18n.js';

const flags = {
  current_revision_unchanged: 'r3-8mm-20260920', selection: 'NOT_SELECTED', visual_approval: 'PENDING',
  physical_fit: 'UNKNOWN', retention_strength: 'UNKNOWN', slicer_status: 'NOT_SLICED', full_print: 'ON_HOLD',
};
const pending = { schema_version: 1, study_id: MONA_STUDY_ID, state: 'INPUT_WAIT', ...flags };
const pointer = { ...pending, state: 'READY', data_url: `/artifacts/studies/${MONA_STUDY_ID}/public-study.json`,
  data_sha256: 'a'.repeat(64), source_commit: 'b'.repeat(40) };

function fixture() {
  const image = (name) => ({
    path: `/artifacts/studies/${MONA_STUDY_ID}/unit-only-${name}.jpg`, bytes: 1,
    sha256: 'c'.repeat(64), width: 1000, height: 1000, conditions_sha256: 'd'.repeat(64),
  });
  return {
    schema_version: 1, study_id: MONA_STUDY_ID, kind: 'MONA_LIKENESS_AND_SCALE_STUDY',
    source_commit: pointer.source_commit, source_study_sha256: 'e'.repeat(64), ...flags,
    prior_visual_feedback: 'USERREJECTS_LIKENESS', appearance_limit: 'Unit test only; no real candidate.',
    assembly_tradeoff: 'Synthetic contract fixture, never published.',
    assembly_layer_note: 'Unit-only placement layer definition.', visual_observations: ['Unit-only observation.'],
    fixed_interface_image: image('interface'),
    fidelity_sampling: { first_C_cell_count: 20, pilot_cell_count: 30, actual_cell_count: 30, occupied_cell_changes: 0 },
    pilot_metrics: { physical_piece_count: 13838, assembly_step_count: 13838, plate_count: 1,
      standard9_6mm_brick_count: 13837, common_rectangular_parts: 13837, orthogonal_backing_contour_parts: 1,
      foundation_parts: 1, temporary_aid_count: 2 },
    rows: MONA_ROLES.map((role, index) => {
      const original = role === 'original';
      const parts = [null, 13837, 519, 13838][index];
      return {
        role, candidate_id: `unit-test-only-${role}`, count_status: original ? 'NOT_APPLICABLE' : 'ACTUAL_INSTANCES',
        pitch_mm: original ? null : role === 'fine-c' ? 4 : 8, stud_diameter_mm: original ? null : 4.8,
        open_underside: true,
        metrics: { dimensions_mm: [100, 100, index === 3 ? 361.8 : 180],
          part_count: parts, unique_types: original ? null : 7, one_by_one_exceptions: original ? null : 1,
          layer_count: original ? null : 40, minimum_part_mm: original ? null : [7.8, 7.8, 3.2],
          grip_long_ge_15_8_count: original ? null : parts - 1 },
        evidence: { geometry_sha256: '1'.repeat(64), manifest_sha256: original ? null : '2'.repeat(64),
          bom_sha256: original ? null : '3'.repeat(64), counted_instances: parts, bom_ids_match: !original,
          reference_identity_verified: ['fine-c', 'current-r3'].includes(role),
          resampled_from_original: role === 'pilot-360', original_geometry_sha256: '1'.repeat(64) },
      };
    }),
    comparisons: [
      ...[['shape', 'front'], ['shape', 'three-quarter'], ['face', 'front']].map(([kind, view]) => ({
        id: `${kind}-${view}`, kind, view, conditions_sha256: 'd'.repeat(64), method_note: 'Unit-only conditions.',
        framing_rule: kind === 'shape' ? 'MATCHED_SCREEN_HEIGHT' : 'MATCHED_NORMALIZED_FACE_REGION',
        ...(kind === 'face' ? { normalized_face_region: [0.1, 0.1, 0.9, 0.5] } : {}),
        images: MONA_ROLES.map((role) => ({ ...image(`${kind}-${view}-${role}`), role,
          ...(kind === 'shape' ? { projected_subject_height_px: 800 }
            : { normalized_face_region: [0.1, 0.1, 0.9, 0.5] }) })),
      })),
      { id: 'scale-front', kind: 'scale', view: 'front', conditions_sha256: 'd'.repeat(64),
        method_note: 'Unit-only physical scale.', framing_rule: 'SHARED_PIXELS_PER_MM',
        pixels_per_mm: 2, row_roles: ['fine-c', 'current-r3', 'pilot-360'],
        row_pixels_per_mm: { 'fine-c': 2, 'current-r3': 2, 'pilot-360': 2 }, sheet: image('scale-front') },
    ],
  };
}

test('Mona pending state cannot imply actual new media or counts', () => {
  assert.equal(validateMonaPointer(pending).state, 'INPUT_WAIT');
  for (const changed of [
    { ...pending, data_url: pointer.data_url }, { ...pending, data_sha256: pointer.data_sha256 },
    { ...pending, selection: 'SELECTED' }, { ...pending, visual_approval: 'APPROVED' },
    { ...pending, physical_fit: 'PASS' }, { ...pending, current_revision_unchanged: MONA_STUDY_ID },
  ]) assert.throws(() => validateMonaPointer(changed));
  assert.throws(() => validateMonaStudy(fixture(), pending));
});

test('Mona original is not assigned a fabricated zero brick count', () => {
  const data = fixture(), before = JSON.stringify(data);
  assert.equal(validateMonaStudy(data, pointer), data);
  assert.equal(JSON.stringify(data), before);
  for (const key of ['part_count', 'unique_types', 'one_by_one_exceptions', 'layer_count', 'minimum_part_mm', 'grip_long_ge_15_8_count']) {
    const changed = fixture();
    changed.rows[0].metrics[key] = key === 'minimum_part_mm' ? [1, 1, 1] : 0;
    assert.throws(() => validateMonaStudy(changed, pointer));
  }
});

test('Mona shape normalization, face crops and physical scale remain different contracts', () => {
  for (const modify of [
    (data) => { data.comparisons[0].framing_rule = 'SHARED_PIXELS_PER_MM'; },
    (data) => { data.comparisons[2].framing_rule = 'MATCHED_SCREEN_HEIGHT'; },
    (data) => { data.comparisons[3].framing_rule = 'MATCHED_SCREEN_HEIGHT'; },
    (data) => { data.comparisons[3].pixels_per_mm = NaN; },
    (data) => { data.comparisons[3].row_roles = ['pilot-360']; },
    (data) => { data.comparisons[3].row_pixels_per_mm['pilot-360'] = 1; },
    (data) => { data.comparisons[0].images[1].conditions_sha256 = 'f'.repeat(64); },
    (data) => { data.comparisons[0].images[1].role = 'original'; },
    (data) => { data.comparisons[0].images[1].width = 999; },
    (data) => { data.comparisons[0].images[1].projected_subject_height_px = 850; },
    (data) => { delete data.comparisons[0].images[1].projected_subject_height_px; },
    (data) => { data.comparisons[2].images[1].normalized_face_region = [0.1, 0.1, 0.8, 0.5]; },
    (data) => { data.comparisons[2].normalized_face_region = [0, 0, 2, 2]; },
    (data) => { data.comparisons[0].images[1].path = data.comparisons[0].images[0].path; },
    (data) => { data.comparisons.splice(1, 1); },
    (data) => { data.comparisons[1].view = 'front'; },
    (data) => { data.comparisons[2].kind = 'scale'; },
  ]) {
    const data = fixture();
    modify(data);
    assert.throws(() => validateMonaStudy(data, pointer));
  }
});

test('Mona actual counts are uncapped, preserve both reference identities and never parse locale strings', () => {
  const data = fixture();
  data.rows[3].metrics.part_count = 1_000_000;
  data.rows[3].evidence.counted_instances = 1_000_000;
  Object.assign(data.pilot_metrics, { physical_piece_count: 1_000_000, assembly_step_count: 1_000_000,
    standard9_6mm_brick_count: 999999, common_rectangular_parts: 999999 });
  assert.equal(validateMonaStudy(data, pointer).rows[3].metrics.part_count, 1_000_000);
  assert.deepEqual(countDelta(13838, 13837).parts, 1);
  assert.deepEqual(countDelta(13838, 519).parts, 13319);
  for (const modify of [
    (value) => { value.rows[1].metrics.part_count = 13434; },
    (value) => { value.rows[2].evidence.reference_identity_verified = false; },
    (value) => { value.rows[3].evidence.resampled_from_original = false; },
    (value) => { value.rows[3].evidence.original_geometry_sha256 = 'f'.repeat(64); },
    (value) => { value.rows[3].metrics.part_count = '13,838'; },
    (value) => { value.rows[3].pitch_mm = 16; },
    (value) => { value.rows[3].evidence.counted_instances += 1; },
    (value) => { value.rows[3].evidence.bom_ids_match = false; },
    (value) => { value.pilot_metrics.plate_count += 1; },
    (value) => { value.fidelity_sampling.occupied_cell_changes = 1; },
    (value) => { value.full_print = 'APPROVED'; },
  ]) {
    const changed = fixture();
    modify(changed);
    assert.throws(() => validateMonaStudy(changed, pointer));
  }
});

test('Mona resources and comparison state cannot escape their independent study', () => {
  const data = fixture();
  assert.equal(chooseMonaComparison(data, 'scale-front').kind, 'scale');
  assert.equal(chooseMonaComparison(data, 'unknown').id, 'shape-front');
  assert.equal(chooseMonaComparison(data, null).id, 'shape-front');
  for (const path of ['https://example.test/fake.jpg', '/artifacts/revisions/r3-8mm-20260920/mona-practical8/assembled.png',
    `/artifacts/studies/${MONA_STUDY_ID}/../other.jpg`, `/artifacts/studies/${MONA_STUDY_ID}/%2e%2e/other.jpg`]) {
    assert.throws(() => monaStudyPath(path));
  }
});

test('Mona translation preserves the meaning and numbers of both baselines', () => {
  assert.equal(translate('対象外（無分割）', 'en'), 'Not applicable (unsubdivided)');
  assert.equal(translate('初期細密C（4 mm）との差：+1部品（0%）', 'en'),
    'Compared with Initial Fine C (4 mm): +1 parts (0%)');
  assert.equal(translate('目標は約360 mm。実データの高さは361.8 mmです。', 'en'),
    'The target is approximately 360 mm. The actual data has a height of 361.8 mm.');
  assert.throws(() => translate('形の比較', 'invalid'));
  assert.equal(interpolate('value {0}', { 0: '<img onerror="not executable">' }), 'value <img onerror="not executable">');
});

test('Mona work preserves the exact earlier-study records and immutable snapshot definitions', async () => {
  const root = new URL('../../', import.meta.url);
  const baseline = JSON.parse(await readFile(new URL('site/mona-study-baseline.json', root), 'utf8'));
  for (const entry of baseline.files) {
    const bytes = await readFile(new URL(entry.path, root));
    assert.equal(bytes.length, entry.bytes, entry.path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256, entry.path);
  }
  const publication = validateMonaPointer(JSON.parse(await readFile(new URL('archive/mona-study.json', root), 'utf8')));
  if (publication.state === 'READY') {
    const bytes = await readFile(new URL(monaStudyPath(publication.data_url).slice(1), root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), publication.data_sha256);
    const study = validateMonaStudy(JSON.parse(bytes), publication);
    const rawBytes = await readFile(new URL(`artifacts/studies/${MONA_STUDY_ID}/study.json`, root));
    assert.equal(createHash('sha256').update(rawBytes).digest('hex'), study.source_study_sha256);
    const raw = JSON.parse(rawBytes);
    assert.deepEqual(study.fidelity_sampling, raw.fidelity_sampling);
    assert.deepEqual(study.pilot_metrics, raw.rows.find((row) => row.role === 'dense360-pilot').metrics);
    for (const row of study.rows) {
      const source = raw.rows.find((entry) => entry.role === row.source_role);
      assert.equal(row.candidate_id, source.candidate_id);
      assert.equal(row.metrics.part_count, source.metrics.physical_piece_count);
      assert.equal(row.metrics.unique_types, source.metrics.unique_types);
      assert.deepEqual(row.metrics.dimensions_mm, source.metrics.actual_size_mm);
      for (const [view, sourceView] of [['front', 'front'], ['three-quarter', 'three_quarter']]) {
        const image = study.comparisons.find((group) => group.kind === 'shape' && group.view === view).images.find((entry) => entry.role === row.role);
        assert.equal(image.sha256, source.images[sourceView].sha256);
        assert.deepEqual(image.source_camera, source.images[sourceView].normalization);
        assert.equal(image.projected_subject_height_px, 864);
      }
    }
  }
});
