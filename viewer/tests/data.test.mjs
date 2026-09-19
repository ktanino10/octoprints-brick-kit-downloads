import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  artifactPath, DataError, displayPosition, downloadEntries, findParts, isPartVisible, makeIndex,
  parseEvidenceStatus, validateCatalog, validateGeometryMatch, validateManifest, validatePrototypes,
} from '../src/data.js';

// Synthetic data is confined to unit tests and never emitted into the served bundle.
const status = { visual_selection: 'PENDING', physical_fit: 'UNKNOWN', production_export: 'BLOCKED' };
const metrics = { part_count: 3, height_mm: 8.4, width_mm: 12, depth_mm: 6, unique_types: 2, color_count: 2, layer_count: 2, approx_build_hours: [0.1, 0.2] };
const manifestFixture = () => ({
  schema_version: 1, units: 'mm', candidate_id: 'mona-balanced',
  frame: { up: '+Z', front: '-Y', handedness: 'right' },
  palette: { violet: { hex: '#5e43b7', name: 'Purple', source: 'test-only' }, white: { hex: '#ffffff', name: 'White' } },
  types: {
    'p6-2x1': { cells: [2, 1], pitch_mm: 6, layer_mm: 3.6 },
    'p6-1x1': { cells: [1, 1], pitch_mm: 6, layer_mm: 3.6 },
  },
  parts: [
    { id: 'TEST-00002', type_id: 'p6-2x1', color_id: 'violet', position_mm: [3, -4, 0], rotation_z_deg: 90, layer: 0, step: 1, print_rotation_deg: [0, 0, 0] },
    { id: 'TEST-00001', type_id: 'p6-1x1', color_id: 'white', position_mm: [0, 0, 3.6], rotation_z_deg: 0, layer: 1, step: 3, print_rotation_deg: [0, 0, 0] },
    { id: 'TEST-00003', type_id: 'p6-1x1', color_id: 'violet', position_mm: [6, 0, 3.6], rotation_z_deg: 0, layer: 1, step: 3, print_rotation_deg: [0, 0, 0] },
  ],
  metrics: { ...metrics }, status: { ...status },
  assembly: {
    graph_components: 1, contact_edge_count: 2, contact_stud_sites: 2,
    contact_edges: [['TEST-00002', 'TEST-00001', 1], ['TEST-00002', 'TEST-00003', 1]],
    mechanical_validation: 'UNKNOWN',
  },
  warnings: ['Test only'],
});
const prototypeFixture = () => ({
  schema_version: 1, units: 'mm', origin: 'body-bottom-center',
  types: Object.fromEntries(['p6-2x1', 'p6-1x1'].map((id) => [id, {
    cells: id === 'p6-2x1' ? [2, 1] : [1, 1], pitch_mm: 6, layer_mm: 3.6,
    body_mm: [id === 'p6-2x1' ? 11.82 : 5.82, 5.82, 3.48],
    stud_diameter_mm: 2.8, stud_height_mm: 1.25, socket_depth_mm: 1.45,
    vertices: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
    faces: [[0, 1, 2]], stl: `artifacts/cad/${id}.stl`,
  }])),
});
const candidateFixture = () => ({
  id: 'mona-balanced', character: 'mona', style: 'balanced', label: 'Mona バランス',
  pitch_mm: 6, layer_mm: 3.6, manifest_url: '/artifacts/phase1/mona-balanced/manifest.json',
  render_url: '/artifacts/phase1/mona-balanced/preview.png',
  blend_url: '/artifacts/phase1/mona-balanced/scene.blend',
  video_url: null, bom_url: '/artifacts/phase1/mona-balanced/bom.csv',
  metrics: { ...metrics }, warnings: [], status: { ...status },
});
const catalogFixture = () => ({
  schema_version: 1, prototypes_url: '/artifacts/cad/prototypes.json',
  contact_sheet_url: '/artifacts/phase1/contact-sheet.jpg', candidates: [candidateFixture()],
});

test('accepts the documented catalog, manifest and exact geometry contracts', () => {
  assert.equal(validateCatalog(catalogFixture()).candidates.length, 1);
  const manifest = validateManifest(manifestFixture(), 'mona-balanced');
  const prototypes = validatePrototypes(prototypeFixture());
  assert.doesNotThrow(() => validateGeometryMatch(manifest, prototypes));
});

test('accepts the real generated manifest contact array without a numeric surrogate', async () => {
  const manifest = JSON.parse(await readFile(
    new URL('../../artifacts/phase1/mona-balanced/manifest.json', import.meta.url), 'utf8',
  ));
  assert.equal(validateManifest(manifest, 'mona-balanced'), manifest);
  assert.equal(manifest.assembly.contact_edges.length, manifest.assembly.contact_edge_count);
});

test('rejects malformed, duplicate and falsely counted contact records', () => {
  for (const mutate of [
    (m) => { m.assembly.contact_edges = 2; },
    (m) => { m.assembly.contact_edge_count = 3; },
    (m) => { m.assembly.contact_stud_sites = 5; },
    (m) => { m.assembly.contact_edges[0][0] = 'missing'; },
    (m) => { m.assembly.contact_edges[0][2] = 0; },
    (m) => { m.assembly.contact_edges[1] = [...m.assembly.contact_edges[0]]; },
  ]) {
    const manifest = manifestFixture();
    mutate(manifest);
    assert.throws(() => validateManifest(manifest, 'mona-balanced'), DataError);
  }
});

test('only local artifact references are accepted; traversal and external URLs are rejected', () => {
  assert.equal(artifactPath('artifacts/cad/part.stl'), '/artifacts/cad/part.stl');
  assert.equal(artifactPath('/artifacts/phase1/a.json'), '/artifacts/phase1/a.json');
  for (const invalid of ['https://example.com/a', '//example.com/a', 'data:text/html,hi', '/api/status', '/artifacts/../../secret', '/artifacts/%2e%2e/secret', '/artifacts/\\evil', 'javascript:alert(1)']) {
    assert.throws(() => artifactPath(invalid), DataError, invalid);
  }
});

test('missing, duplicate or mismatched catalog identities are explicit errors', () => {
  const catalog = catalogFixture();
  catalog.candidates.push(candidateFixture());
  assert.throws(() => validateCatalog(catalog), /重複/);
  assert.throws(() => validateManifest(manifestFixture(), 'ducky-fine'), /IDが一致/);
  const parts = manifestFixture();
  parts.parts[1].id = parts.parts[0].id;
  assert.throws(() => validateManifest(parts, 'mona-balanced'), /重複/);
});

test('invalid transforms, coordinate frames, references and counts cannot render as valid', () => {
  const cases = [
    [(manifest) => { manifest.frame.up = '+Y'; }, /座標系/],
    [(manifest) => { manifest.parts[0].rotation_z_deg = 180; }, /位置・回転/],
    [(manifest) => { manifest.parts[0].position_mm[0] = Infinity; }, /位置・回転/],
    [(manifest) => { manifest.parts[0].type_id = 'missing'; }, /型または色/],
    [(manifest) => { manifest.metrics.part_count = 4; }, /集計/],
    [(manifest) => { manifest.metrics.color_count = 3; }, /集計/],
    [(manifest) => { manifest.status.physical_fit = 'VALIDATED'; }, /PHASE 1/],
  ];
  for (const [mutate, expected] of cases) {
    const manifest = manifestFixture();
    mutate(manifest);
    assert.throws(() => validateManifest(manifest, 'mona-balanced'), expected);
  }
});

test('prototype topology and shared dimensional definitions are validated without approximations', () => {
  const prototypes = prototypeFixture();
  prototypes.types['p6-2x1'].faces = [[0, 1, 8]];
  assert.throws(() => validatePrototypes(prototypes), /三角形/);
  prototypes.types['p6-2x1'].faces = [[0, 0, 1]];
  assert.throws(() => validatePrototypes(prototypes), /三角形/);
  const mismatch = prototypeFixture();
  mismatch.types['p6-2x1'].pitch_mm = 8;
  assert.throws(() => validateGeometryMatch(manifestFixture(), mismatch), /寸法が一致/);
  delete mismatch.types['p6-2x1'];
  assert.throws(() => validateGeometryMatch(manifestFixture(), mismatch), /代替形状は作成しません/);
});

test('index and BOM counts are exact, retain unique IDs and do not reorder source parts', () => {
  const manifest = manifestFixture();
  const original = JSON.stringify(manifest);
  const index = makeIndex(manifest);
  assert.equal(index.partsById.size, 3);
  assert.equal(index.groups.size, 3);
  assert.equal([...index.colors.values()].reduce((a, b) => a + b), 3);
  assert.equal([...index.types.values()].reduce((a, b) => a + b), 3);
  assert.deepEqual(index.layers, [0, 1]);
  assert.deepEqual(index.steps, [1, 3]);
  assert.equal(index.sortedParts[0].id, 'TEST-00001');
  assert.equal(JSON.stringify(manifest), original);
});

test('layer and step progress intersect and work with noncontiguous step IDs', () => {
  const manifest = manifestFixture();
  const index = makeIndex(manifest);
  const count = (layers, steps) => manifest.parts.filter((part) => isPartVisible(part, index, layers, steps)).length;
  assert.equal(count(0, 2), 0);
  assert.equal(count(2, 0), 0);
  assert.equal(count(1, 2), 1);
  assert.equal(count(2, 1), 1);
  assert.equal(count(2, 2), 3);
  assert.equal(count(99, 99), 3);
});

test('explosion clamps to the display range and never mutates source placements', () => {
  const manifest = manifestFixture();
  const original = JSON.stringify(manifest);
  const part = manifest.parts[2];
  assert.deepEqual(displayPosition(part, 0, [0, 0, 0], 3.6), [6, 0, 3.6]);
  const exploded = displayPosition(part, 1, [0, 0, 0], 3.6);
  assert.equal(exploded[0], 8.16);
  assert.ok(Math.abs(exploded[2] - 9.9) < 1e-12);
  assert.deepEqual(displayPosition(part, 2, [0, 0, 0], 3.6), exploded);
  assert.deepEqual(displayPosition(part, -2, [0, 0, 0], 3.6), part.position_mm);
  assert.equal(JSON.stringify(manifest), original);
});

test('keyboard-accessible part search supports ID, type, color and visible-only filtering', () => {
  const manifest = manifestFixture();
  const index = makeIndex(manifest);
  assert.deepEqual(findParts(index, manifest, 'test-00001', false, 2, 2).map((part) => part.id), ['TEST-00001']);
  assert.equal(findParts(index, manifest, 'PURPLE', false, 2, 2).length, 2);
  assert.equal(findParts(index, manifest, 'p6-1x1', false, 2, 2).length, 2);
  assert.equal(findParts(index, manifest, '', true, 1, 2).length, 1);
  assert.equal(findParts(index, manifest, 'absent', false, 2, 2).length, 0);
});

test('CURRENT is accepted only from a well-formed fresh evidence response', () => {
  const current = { state: 'CURRENT', details: [], physical_fit: 'UNKNOWN', production_export: 'BLOCKED' };
  assert.equal(parseEvidenceStatus(current).state, 'CURRENT');
  assert.equal(parseEvidenceStatus({ ...current, state: 'STALE', details: ['source changed'] }).state, 'STALE');
  assert.equal(parseEvidenceStatus({ ...current, state: 'MISSING' }).state, 'MISSING');
  for (const value of [null, {}, { ...current, state: 'OK' }, { ...current, details: undefined }, { ...current, physical_fit: 'PASS' }, { ...current, production_export: 'READY' }]) {
    assert.throws(() => parseEvidenceStatus(value), DataError);
  }
});

test('native CAD links are optional and only declared local files are exposed', () => {
  const catalog = catalogFixture();
  assert.equal(downloadEntries(catalog, catalog.candidates[0]).length, 4);
  catalog.native_cad = {
    fcstd_url: '/artifacts/cad/parts.FCStd', coupon_fcstd_url: '/artifacts/cad/coupon.FCStd',
    coupon_stl_urls: ['/artifacts/cad/coupon-a.stl', '/artifacts/cad/coupon-b.stl'],
    step_url: '/artifacts/cad/parts.step', evidence_url: '/artifacts/cad/evidence.json',
  };
  const entries = downloadEntries(catalog, catalog.candidates[0]);
  assert.equal(entries.length, 10);
  assert.equal(entries.filter((entry) => entry.extension === 'STL').length, 2);
  catalog.native_cad.fcstd_url = 'https://outside.invalid/part.FCStd';
  assert.throws(() => downloadEntries(catalog, catalog.candidates[0]), DataError);
});

test('insertion metadata stays explicitly unverified and can filter underside candidates', () => {
  const manifest = manifestFixture();
  manifest.parts[0].insertion_axis = '-Z';
  manifest.parts[0].attach_to = null;
  manifest.parts[1].insertion_axis = '+Z';
  manifest.parts[1].attach_to = manifest.parts[0].id;
  manifest.parts[2].insertion_axis = '-Z';
  manifest.parts[2].attach_to = manifest.parts[0].id;
  manifest.assembly.underside_attachment_count = 1;
  manifest.assembly.insertion_sweep_validation = 'UNKNOWN';
  validateManifest(manifest, manifest.candidate_id);
  const index = makeIndex(manifest);
  assert.deepEqual(findParts(index, manifest, '', false, 2, 2, true).map((part) => part.id), ['TEST-00001']);
  manifest.assembly.insertion_sweep_validation = 'PASS';
  assert.throws(() => validateManifest(manifest, manifest.candidate_id), /未検証/);
  manifest.assembly.insertion_sweep_validation = 'UNKNOWN';
  manifest.parts[1].attach_to = 'MISSING';
  assert.throws(() => validateManifest(manifest, manifest.candidate_id), /接続先候補/);
  manifest.parts[1].attach_to = manifest.parts[0].id;
  manifest.assembly.underside_attachment_count = 2;
  assert.throws(() => validateManifest(manifest, manifest.candidate_id), /後付け候補数/);
});

test('canonical contact records retain independent edge and weighted stud counts', () => {
  const manifest = manifestFixture();
  manifest.assembly.contact_edges = [['TEST-00002', 'TEST-00001', 4], ['TEST-00002', 'TEST-00003', 2]];
  manifest.assembly.contact_edge_count = 2;
  manifest.assembly.contact_stud_sites = 6;
  const original = JSON.stringify(manifest);
  validateManifest(manifest, manifest.candidate_id);
  assert.equal(JSON.stringify(manifest), original);
  assert.equal(manifest.assembly.contact_edge_count, 2);
  assert.equal(manifest.assembly.contact_stud_sites, 6);
});

test('legacy scalar contacts and physical approval cannot masquerade as the canonical schema', () => {
  const manifest = manifestFixture();
  manifest.assembly.contact_edges = 2;
  assert.throws(() => validateManifest(manifest, manifest.candidate_id), /contact_edges.*配列/);
  manifest.assembly = manifestFixture().assembly;
  manifest.assembly.mechanical_validation = 'PASS';
  assert.throws(() => validateManifest(manifest, manifest.candidate_id), /mechanical_validation.*UNKNOWN/);
  manifest.assembly.mechanical_validation = 'UNKNOWN';
  delete manifest.assembly.contact_edge_count;
  assert.throws(() => validateManifest(manifest, manifest.candidate_id), /contact_edge_count/);
});
