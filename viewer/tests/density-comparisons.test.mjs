import test from 'node:test';
import assert from 'node:assert/strict';
import { DENSITY_ID, COUNT_PERCENTAGES } from '../../assets/density-data.js';
import { DENSITY_COMPARISON_COLUMNS, comparisonEntries, validateDensityComparisons } from '../../assets/density-comparisons.js';

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
