import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DENSITY_ID, COUNT_PERCENTAGES } from '../../assets/density-data.js';
import { DENSITY_COMPARISON_COLUMNS, comparisonEntries, comparisonFile, validateDensityComparisons } from '../../assets/density-comparisons.js';
import { effectiveSymmetryCatalog } from '../../assets/symmetry-publication.js';

const hash = 'a'.repeat(64);
const file = path => ({ path, bytes: 10, sha256: hash });
const metrics = count => ({ part_count: count, unique_types: 1, dimensions_mm: [120, 100, 180] });

function fixture() {
  const counts = { mona: 12435, copilot: 17873, ducky: 9669 };
  const catalog = {
    cases: [], baselines: Object.fromEntries(Object.entries(counts).map(([character, count]) => [character, {
      candidate_id: `${character}-fine8-base`, state: 'READY', metrics: metrics(count),
      manifest_sha256: hash, native_manifest_sha256: 'b'.repeat(64), native_bom_sha256: 'c'.repeat(64),
    }])),
    reference_revisions: { mona: {
      id: 'mona-fine8-base-root-v2', logical_case_id: 'mona-fine8-base', geometry_revision: 'whisker-root-v2',
      state: 'READY', metrics: metrics(12411), source_manifest_sha256: 'd'.repeat(64), source_bom_sha256: 'e'.repeat(64),
    } },
  };
  for (const [character, count] of Object.entries(counts)) for (const percentage of COUNT_PERCENTAGES) {
    const id = `${character}-p${percentage}` + (character === 'mona' ? '-root-v2' : '');
    catalog.cases.push({
      id, logical_case_id: `${character}-p${percentage}`, geometry_revision: character === 'mona' ? 'whisker-root-v2' : 'original-matrix',
      character, count_percentage: percentage, state: 'READY', metrics: metrics(Math.floor((count * percentage + 50) / 100)),
      source_manifest_sha256: 'f'.repeat(64), source_bom_sha256: '1'.repeat(64),
      ...(character === 'mona' ? { whisker_support: {
        external_aid_count: 0, assembly_aid_count: 0, status: 'DIGITAL_SELF_SUPPORTING_UNTESTED',
        physical_validation: 'UNKNOWN', geometry_revision: 'whisker-root-v2',
        manifest_sha256: 'f'.repeat(64), attachment_evidence_sha256: '2'.repeat(64),
        sequence_evidence_sha256: '3'.repeat(64), all_categories_geometry_match: true,
      } } : {}),
    });
  }
  const data = {
    schema_version: 1, study_id: DENSITY_ID, state: 'COMPLETE_REAL_SIX_WAY_COMPARISONS',
    status: { selection: 'NOT_SELECTED', visual_approval: 'PENDING', physical_fit: 'UNKNOWN', slicer_status: 'NOT_SLICED' },
    comparison_csv: { ...file('comparison.csv'), row_count: 15, columns: DENSITY_COMPARISON_COLUMNS }, rows: [],
  };
  for (const [character, count] of Object.entries(counts)) {
    const entries = comparisonEntries(catalog, character), ids = entries.map(item => item.id ?? item.candidate_id);
    const columns = entries.map((item, index) => {
      const ratio = index === 0 ? 1 : COUNT_PERCENTAGES[index - 1] / 100;
      return {
        column_index: index, case_id: ids[index], logical_case_id: item.logical_case_id ?? ids[index],
        geometry_revision: item.geometry_revision ?? 'original-matrix',
        role: index === 0 ? 'ONE_X_ACTUAL_GEOMETRY_REFERENCE' : 'MULTIPLIER_CASE',
        fixed_count_denominator: count, actual_reference_count: entries[0].metrics.part_count,
        target_ratio: ratio, target_count: Math.floor((count * Math.round(ratio * 100) + 50) / 100),
        actual_count: item.metrics.part_count, actual_ratio: item.metrics.part_count / count,
        actual_size_mm: item.metrics.dimensions_mm, used_types: item.metrics.unique_types,
        manifest_sha256: item.source_manifest_sha256 ?? item.native_manifest_sha256,
        bom_sha256: item.source_bom_sha256 ?? item.native_bom_sha256, source_render_stats_sha256: hash,
      };
    });
    const images = ['front', 'three_quarter'].map(view => ({
      ...file(`comparisons/${character}-normalized-${view}.jpg`),
      mode: 'ACTUAL_CG_EQUAL_PROJECTED_SCREEN_HEIGHT_NOT_SIZE_RATIO', view, image_size_px: [3480, 700], source_cases: ids,
      conditions: ids.map(case_id => ({ case_id, source_image_sha256: hash, panel_size_px: [580, 580],
        panel_model_height_px: 417.6, camera: { projection: 'ORTHOGRAPHIC', image_size_px: [1200, 1200],
          rendered_model_height_px: 864, actual_projected_height_mm: 180, pixels_per_mm: 4.8 } })),
    }));
    images.push({ ...file(`comparisons/${character}-physical-size.jpg`), mode: 'ACTUAL_CG_FIXED_PHYSICAL_PX_PER_MM',
      view: 'front', pixels_per_mm: 0.9, method: 'UNIT ONLY: source CG uniformly rescaled; not a real comparison.',
      image_size_px: [4800, 800], source_cases: ids,
      conditions: ids.map((case_id, index) => ({
        case_id, camera: structuredClone(images[0].conditions[index].camera), source_image_sha256: hash,
        source_image_size_px: [1200, 1200], scale_factor: 0.9 / 4.8,
        source_to_sheet_affine: [0.9 / 4.8, 0, index * 800 + 400 - 600 * 0.9 / 4.8, 0, 0.9 / 4.8, 750 - 1032 * 0.9 / 4.8],
        panel_box_px: [index * 800, 140, (index + 1) * 800, 750],
        source_model_height_px: 864, sheet_model_height_px: 162,
        source_ground_y_px: 1032, sheet_ground_y_px: 750, pixels_per_mm: 0.9,
        resampling: 'BICUBIC_UNIFORM_AFFINE_NOT_PER_MODEL_HEIGHT_NORMALIZATION',
      })) });
    data.rows.push({ character, complete_case_ids: ids, fixed_count_denominator: count,
      fixed_count_reference_manifest_sha256: hash, actual_reference_count: entries[0].metrics.part_count, columns, images });
  }
  return { catalog, data };
}

test('final six-way comparisons preserve frozen denominators, real references and all fifteen actual cases', () => {
  const { catalog, data } = fixture();
  assert.equal(validateDensityComparisons(data, catalog), data);
  assert.equal(data.rows[0].fixed_count_denominator, 12435);
  assert.equal(data.rows[0].columns[0].actual_count, 12411);
  assert.equal(data.comparison_csv.row_count, 15);
  const physical = comparisonFile(data.rows[0].images[2]);
  assert.equal(physical.width, 4800);
  assert.equal(physical.height, 800);
});

test('final sheets reject missing real cases, old-reference substitutions, inconsistent scales and extra CSV rows', () => {
  for (const mutate of [
    ({ catalog }) => { catalog.cases[0].state = 'INPUT_WAIT'; },
    ({ catalog }) => { delete catalog.cases[0].whisker_support; },
    ({ data }) => { data.status.physical_fit = 'PASS'; },
    ({ data }) => { data.rows[0].columns[0].actual_count = 12435; },
    ({ data }) => { data.rows[0].fixed_count_denominator = 12411; },
    ({ data }) => { data.rows[0].columns[1].manifest_sha256 = hash; },
    ({ data }) => { data.rows[0].images[0].conditions[1].panel_model_height_px = 500; },
    ({ data }) => { data.rows[0].images[1].conditions[0].camera.pixels_per_mm = 2; },
    ({ data }) => { data.rows[0].images[2].pixels_per_mm = 1; },
    ({ data }) => { data.rows[0].images[2].conditions[0].source_to_sheet_affine[4] *= 2; },
    ({ data }) => { data.rows[0].images[2].conditions[1].sheet_ground_y_px = 700; },
    ({ data }) => { data.rows[0].images[2].conditions[0].source_image_sha256 = 'f'.repeat(64); },
    ({ data }) => { data.rows[0].images[2].path = data.rows[0].images[0].path; },
    ({ data }) => { data.rows[0].images[0].path = '../unapproved.jpg'; },
    ({ data }) => { data.comparison_csv.row_count = 18; },
  ]) {
    const value = fixture(); mutate(value);
    assert.throws(() => validateDensityComparisons(value.data, value.catalog));
  }
});

function bilateralFixture() {
  const { catalog, data: previous } = fixture();
  const prefix = 'revisions/bilateral-symmetry-v3/';
  catalog.comparison_sheets = file(`/artifacts/studies/${DENSITY_ID}/comparison-sheets.json`);
  for (const item of catalog.cases.filter(item => item.character === 'copilot')) {
    item.id += '-symmetric-v3';
    item.geometry_revision = 'bilateral-symmetry-v3';
  }
  const row = structuredClone(previous.rows.find(item => item.character === 'copilot'));
  const ids = comparisonEntries(catalog, 'copilot').map(item => item.id ?? item.candidate_id);
  row.complete_case_ids = ids;
  for (const [index, column] of row.columns.entries()) {
    column.case_id = ids[index];
    if (index) column.geometry_revision = 'bilateral-symmetry-v3';
  }
  for (const image of row.images) {
    image.path = prefix + image.path;
    image.source_cases = ids;
    for (const [index, condition] of image.conditions.entries()) condition.case_id = ids[index];
  }
  return { catalog, previous, data: {
    ...structuredClone(previous), state: 'COMPLETE_REAL_COPILOT_BILATERAL_COMPARISONS',
    geometry_revision: 'bilateral-symmetry-v3', one_x_reference_symmetry: 'KNOWN_ASYMMETRY_READ_ONLY_NOT_REVISED',
    prior_comparison_descriptor: file('comparison-sheets.json'),
    prior_csv: structuredClone(previous.comparison_csv),
    comparison_csv: { ...previous.comparison_csv, path: prefix + 'comparison.csv' },
    unchanged_character_rows: structuredClone(previous.rows.filter(item => item.character !== 'copilot')),
    rows: [row],
  } };
}

test('bilateral comparison unit fixture needs five new actual IDs and preserves the known-asymmetric1x', () => {
  const { catalog, data, previous } = bilateralFixture();
  assert.equal(validateDensityComparisons(data, catalog, { symmetry: true, previous }), data);
  assert.equal(data.rows[0].columns[0].case_id, 'copilot-fine8-base');
  assert.deepEqual(data.unchanged_character_rows, previous.rows.filter(item => item.character !== 'copilot'));
});

test('bilateral comparison cannot reuse the four-case revision, alter other characters, or certify the1x reference', () => {
  for (const mutate of [
    ({ data }) => { delete data.one_x_reference_symmetry; },
    ({ data }) => { data.one_x_reference_symmetry = 'PASS'; },
    ({ data }) => { data.state = 'COMPLETE_REAL_COPILOT_SUPPORT_REVISION_COMPARISONS'; },
    ({ data }) => { data.geometry_revision = 'body-support-v2'; },
    ({ data }) => { data.unchanged_character_rows[1].columns[1].actual_count += 1; },
    ({ data }) => { data.prior_csv.sha256 = 'b'.repeat(64); },
    ({ data }) => { data.rows[0].images[0].path = 'comparisons/copilot-normalized-front.jpg'; },
    ({ data }) => { data.comparison_csv.path = 'comparison.csv'; },
    ({ data }) => { data.rows[0].columns[0].manifest_sha256 = '2'.repeat(64); },
    ({ catalog }) => { catalog.cases.find(item => item.id === 'copilot-p400-symmetric-v3').id = 'copilot-p400'; },
    ({ catalog }) => { catalog.cases.find(item => item.id === 'copilot-p400-symmetric-v3').state = 'INPUT_WAIT'; },
  ]) {
    const value = bilateralFixture(); mutate(value);
    assert.throws(() => validateDensityComparisons(value.data, value.catalog, { symmetry: true, previous: value.previous }));
  }
});

test('an installed actual bilateral supplement remains validated against the immutable original comparison', async () => {
  const json = async path => JSON.parse(await readFile(new URL('../../' + path.replace(/^\//, ''), import.meta.url)));
  const receipt = await json('archive/copilot-symmetry-revision.json');
  const overlay = await json(receipt.revision_catalog.path);
  if (!overlay.comparison_sheets) {
    assert.notEqual(receipt.comparisons?.state, 'READY');
    return;
  }
  const pointer = await json('archive/density-study.json'), base = await json(pointer.catalog.path);
  const previous = await json(base.comparison_sheets.path), data = await json(overlay.comparison_sheets.path);
  assert.equal(validateDensityComparisons(data, effectiveSymmetryCatalog(base, overlay), { symmetry: true, previous }), data);
});
