import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCatalog, validateManifest, validatePrototypes, validateGeometryMatch, makeIndex, downloadEntries,
} from '../src/data.js';
import { COMMON_STAGE, commonFile } from '../../assets/common-blocks.js';

// Synthetic contract fixtures stay in tests and are never copied into a public catalog.
const revision = 'r3-contract-test';
const status = {
  visual_selection: 'PRACTICAL_8MM_REDESIGN_AUTHORIZED',
  physical_fit: 'UNKNOWN', retention_strength: 'UNKNOWN',
  slicer_status: 'NOT_SLICED', full_print: 'ON_HOLD', production_export: 'BLOCKED',
};

function type(kind) {
  const height = kind === 'plate' ? 3.2 : 9.6;
  return {
    kind, cells: [2, 2], footprint_cells: [[0, 0], [1, 0], [0, 1], [1, 1]],
    stud_cells: [[0, 0], [1, 0], [0, 1], [1, 1]], pitch_mm: 8,
    body_height_mm: height, layer_mm: height, plate_units: kind === 'plate' ? 1 : 3,
    body_mm: [15.8, 15.8, height], stud_diameter_mm: 4.8, stud_height_mm: 1.8,
    origin: 'body-bottom-center',
  };
}

function manifest() {
  return {
    schema_version: 3, revision, units: 'mm', candidate_id: 'mona-practical8',
    frame: { up: '+Z', front: '-Y', handedness: 'right' }, position_origin: 'body-bottom-center',
    status: { ...status }, palette: { c0: { name: 'Purple', hex: '#5E43B7' } },
    types: { 'unit-brick': type('brick'), 'unit-plate': type('plate') },
    parts: [
      { id: 'UNIT-BRICK', type_id: 'unit-brick', color_id: 'c0', position_mm: [0, 0, 0],
        rotation_z_deg: 0, layer: 0, course: 0, step: 1, print_rotation_deg: [0, 0, 0],
        role: 'foundation', small_part_exception: false, support_ids: [], attach_to: null,
        support_stud_sites: 0, insertion_axis: '-Z' },
      { id: 'UNIT-PLATE', type_id: 'unit-plate', color_id: 'c0', position_mm: [0, 0, 9.6],
        rotation_z_deg: 90, layer: 3, course: 1, step: 2, print_rotation_deg: [0, 0, 0],
        role: 'detail', small_part_exception: true, support_ids: ['UNIT-BRICK'], attach_to: 'UNIT-BRICK',
        support_stud_sites: 4, insertion_axis: '-Z' },
    ],
    metrics: { part_count: 2, unique_types: 2, color_count: 1, layer_count: 2,
      height_mm: 14.6, width_mm: 15.8, depth_mm: 15.8 },
    assembly: { graph_components: 1, contact_edges: [['UNIT-BRICK', 'UNIT-PLATE', 4]],
      contact_edge_count: 1, contact_stud_sites: 4, mechanical_validation: 'UNKNOWN', retention_strength: 'UNKNOWN' },
  };
}

function prototypes() {
  const types = structuredClone(manifest().types);
  for (const value of Object.values(types)) {
    value.vertices = [[-7.9, -7.9, 0], [7.9, -7.9, 0], [-7.9, 7.9, 0], [0, 0, value.body_height_mm + value.stud_height_mm]];
    value.faces = [[0, 2, 1], [0, 1, 3], [1, 2, 3], [2, 0, 3]];
  }
  return { schema_version: 3, revision, units: 'mm', origin: 'body-bottom-center', types };
}

function catalog() {
  return {
    schema_version: 3, revision, units: 'mm', stage: COMMON_STAGE, status: { ...status },
    prototypes_url: 'cad/prototypes.json',
    candidates: ['mona', 'copilot', 'ducky'].map((character) => {
      const id = `${character}-practical8`;
      return { id, character, style: 'practical8', pitch_mm: 8, metrics: manifest().metrics, status: { ...status },
        manifest_url: `${id}/manifest.json`, render_url: `${id}/assembled.png`,
        exploded_url: `${id}/exploded.png`, blend_url: `${id}/scene.blend`,
        video_url: `${id}/turntable.mp4`, bom_url: `${id}/bom.csv`,
        native_assembly_url: `cad/assemblies/${id}.FCStd`, assembly_guide_url: `${id}/ASSEMBLY.md` };
    }),
  };
}

test('schema3 relative paths normalize once without mutating the source catalog or adding old-style approvals', () => {
  const raw = catalog();
  const before = JSON.stringify(raw);
  const parsed = validateCatalog(raw);
  assert.equal(parsed.prototypes_url, `/artifacts/revisions/${revision}/cad/prototypes.json`);
  assert.equal(parsed.candidates[0].exploded_url, `/artifacts/revisions/${revision}/mona-practical8/exploded.png`);
  assert.equal(JSON.stringify(raw), before);
  assert.equal(parsed.candidates[0].style, 'practical8');
  assert.equal(parsed.candidates[0].metrics.approx_build_hours, undefined);
  assert.ok(downloadEntries(parsed, parsed.candidates[0]).every((entry) => entry.url.startsWith(`/artifacts/revisions/${revision}/`)));
  assert.ok(downloadEntries(parsed, parsed.candidates[0]).some((entry) => entry.extension === 'MD'));
});

test('schema3 retains real fields, mixed body heights, bottom-Z layer units and all individual IDs', () => {
  const raw = manifest();
  const before = JSON.stringify(raw);
  const parsed = validateManifest(raw, 'mona-practical8');
  const native = validatePrototypes(prototypes());
  validateGeometryMatch(parsed, native);
  assert.equal(native.types['unit-brick'].socket_depth_mm, undefined);
  const index = makeIndex(parsed);
  assert.deepEqual(index.layers, [0, 3]);
  assert.equal(index.verticalGridMm, 3.2);
  assert.deepEqual([...index.partsById.keys()], ['UNIT-BRICK', 'UNIT-PLATE']);
  assert.equal(parsed.types['unit-brick'].layer_mm, 9.6);
  assert.equal(parsed.types['unit-plate'].layer_mm, 3.2);
  assert.equal(JSON.stringify(raw), before);
});

test('schema3 rejects old micro-joints, false fit approval, incorrect origin and fabricated counts', () => {
  for (const modify of [
    (value) => { value.types['unit-brick'].stud_diameter_mm = 1.1; },
    (value) => { value.types['unit-brick'].pitch_mm = 4; },
    (value) => { value.parts[1].layer = 1; },
    (value) => { value.parts[1].position_mm[2] = 8; },
    (value) => { value.status.physical_fit = 'PASS'; },
    (value) => { value.status.retention_strength = 'VALIDATED'; },
    (value) => { value.status.slicer_status = 'SLICED'; },
    (value) => { value.metrics.part_count = 3; },
    (value) => { value.position_origin = 'world-center'; },
    (value) => { value.parts[1].id = 'UNIT-BRICK'; },
    (value) => { value.parts[1].support_ids = ['missing']; },
    (value) => { value.assembly.graph_components = 2; },
  ]) {
    const value = manifest();
    modify(value);
    assert.throws(() => validateManifest(value, 'mona-practical8'));
  }
});

test('native mesh/manifest matching requires exact pitch, height, footprint, studs and revision', () => {
  for (const modify of [
    (value) => { value.revision = 'r3-other'; },
    (value) => { value.types['unit-brick'].layer_mm = 3.2; },
    (value) => { value.types['unit-plate'].stud_cells = [[0, 0]]; },
    (value) => { value.types['unit-brick'].body_mm[0] = 16; },
    (value) => { delete value.types['unit-plate']; },
  ]) {
    const native = prototypes();
    modify(native);
    assert.throws(() => validateGeometryMatch(manifest(), native));
  }
});

test('actual vertex bounds must match body-bottom-center and full body-plus-stud height', () => {
  for (const [axis, offset] of [[0, 0.2], [1, 0.2], [2, -1.8]]) {
    const native = prototypes();
    native.types['unit-brick'].vertices = native.types['unit-brick'].vertices.map((point) =>
      point.map((value, index) => value + (axis === index ? offset : 0)));
    assert.throws(() => validatePrototypes(native), /実メッシュ外形/);
  }
});

test('relative input cannot reach another revision or import external file schemes', () => {
  for (const path of ['../../phase1/catalog.json', '../secret.json', 'https://example.test/model.json',
    'file:///private/model.json', '/artifacts/selected/r2-20260919/manifest.json', 'cad/%2e%2e/secret.json']) {
    assert.throws(() => commonFile(path, revision));
  }
});

test('schema1 cannot relabel a practical8 redesign as a historical candidate', () => {
  const value = catalog();
  value.schema_version = 1;
  assert.throws(() => validateCatalog(value));
});
