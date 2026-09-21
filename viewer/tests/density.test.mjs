import test from 'node:test';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import {
  DENSITY_ID, DENSITY_FLAGS, COUNT_PERCENTAGES, targetPartCount, countTargetResult,
  validateDensityPointer, validateDensityCatalog, densityPath, densityDeliveryStatus, allDensityCases,
} from '../../assets/density-data.js';
import {
  validateGuideManifest, guideIndex, radialPosition, courseBoundary, stageRange,
  samePartDestinations, AssemblyPlayback, validateRootAnchoredStructure,
} from '../src/density-state.js';
import { densityMatrix } from '../src/density-studio.js';
import { readDensityView, writeDensityView } from '../src/density-view-state.js';
import { decodeMeshPack, decodeNativeType, inflateIfNeeded } from '../src/density-assets.js';
import { gzipSync } from 'node:zlib';

const file = (name) => ({ path: `/artifacts/studies/${DENSITY_ID}/unit-only-${name}`, sha256: 'a'.repeat(64), bytes: 1 });
const pending = { schema_version: 1, study_id: DENSITY_ID, state: 'INPUT_WAIT', ...DENSITY_FLAGS };
const pointer = { ...pending, state: 'READY', catalog: file('catalog.json') };
const metrics = (count) => ({ part_count: count, unique_types: 1, one_by_one_exceptions: 0,
  grip_long_ge_15_8_count: count, dimensions_mm: [100, 100, 180], minimum_part_mm: [15.8, 15.8, 3.2] });
const assetFixture = () => ({
  cg: [{ ...file('cg.zip'), contents: ['still', 'blender'] }],
  native_cad: [{ ...file('cad.zip'), contents: ['freecad_assembly', 'linked_libraries', 'stl', 'step'] }],
  assembly: [{ ...file('assembly.zip'), contents: ['bom', 'ordered_ids', 'instructions'] }],
  animations: Object.fromEntries(['turntable', 'radial_explode', 'bottom_up'].map((name, index) => [
    name, { ...file('movie.mp4'), start_seconds: index * 6, end_seconds: (index + 1) * 6 },
  ])),
});

function catalogFixture() {
  const baselines = { mona: 12435, copilot: 17873, ducky: 9669 };
  const images = (character, name) => Object.fromEntries(['front', 'three_quarter'].map((view) => [view,
    { ...file(`${name}-${view}.jpg`), framing_rule: 'MATCHED_SCREEN_HEIGHT', condition_id: `${character}-${view}` }]));
  return { schema_version: 1, study_id: DENSITY_ID, kind: 'ACTUAL_PART_COUNT_MATRIX', ...DENSITY_FLAGS,
    baselines: Object.fromEntries(Object.entries(baselines).map(([character, count]) => [character, {
      state: 'READY', candidate_id: `${character}-unit-baseline`, pitch_mm: 8, basis: 'INITIAL_FINE_C_ADAPTED_8MM',
      manifest_sha256: character === 'mona' ? '5556e329521b5706a366c5dad2aa6c7b13eca9d7d74323338773d5e2b20b2b4c' : 'b'.repeat(64),
      metrics: metrics(count), images: images(character, character + '-baseline'), assets: assetFixture(),
    }])),
    cases: Object.entries(baselines).flatMap(([character, baseline]) => COUNT_PERCENTAGES.map((percentage) => {
      const target = targetPartCount(baseline, percentage);
      const id = `${character}-p${percentage}`;
      return { id, character, count_percentage: percentage, state: 'READY', metrics: metrics(target),
        target_count: target, target_difference: 0, actual_ratio: target / baseline, manifest: file(id + '.json.gz'),
        images: images(character, id), tradeoff: 'Synthetic unit fixture; not a real case.',
        source_manifest_sha256: 'c'.repeat(64), source_bom_sha256: 'd'.repeat(64), source_commit: 'e'.repeat(40),
        ...(character === 'mona' ? { whisker_support: {
          external_aid_count: 0, assembly_aid_count: 0, status: 'DIGITAL_SELF_SUPPORTING_UNTESTED',
          physical_validation: 'UNKNOWN', geometry_revision: 'unit-only-no-aids',
          manifest_sha256: 'c'.repeat(64), attachment_evidence_sha256: '7'.repeat(64),
          sequence_evidence_sha256: '8'.repeat(64), all_categories_geometry_match: true,
        } } : {}),
        assets: assetFixture(),
      };
    })),
  };
}

export function guideFixture(count = 8) {
  const positions = [[-8, -8], [8, -8], [-8, 8], [8, 8]];
  return {
    schema_version: 1, study_id: DENSITY_ID, candidate_id: 'mona-p120', units: 'mm',
    status: { selection: 'NOT_SELECTED', physical_fit: 'UNKNOWN', retention_strength: 'UNKNOWN', slicer_status: 'NOT_SLICED', full_print: 'ON_HOLD' },
    position_origin: 'body-bottom-center', frame: { up: '+Z', front: '-Y', handedness: 'right' },
    palette: { pink: { name: 'Unit-test pink', hex: '#dd6688' } },
    types: { unit: { body_mm: [15.8, 15.8, 4.8], body_height_mm: 4.8, pitch_mm: 8,
      stud_diameter_mm: 4.8, geometry_sha256: 'a'.repeat(64) } },
    geometry_files: [file('geometry.bin.gz')], metrics: { part_count: count, unique_types: 1 },
    aids: [],
    parts: Array.from({ length: count }, (_, index) => {
      const course = Math.floor(index / 4), xy = positions[index % 4], z = course * 4.8;
      return { id: `UNIT-${index}`, type_id: 'unit', color_id: 'pink', step: index + 1, assembly_course: course,
        position_mm: [...xy, z], rotation_z_deg: index % 4 * 90, radial_offset_mm: [xy[0] * 3, xy[1] * 3, z + 2.4 - count / 4 * 2.4],
        support_ids: course > 0 ? [`UNIT-${index - 4}`] : [], required_aids: [] };
    }),
    animation_contract: { explosion: 'ABSOLUTE_RADIAL_OFFSETS', assembly: 'BOTTOM_UP_SOURCE_ORDER',
      disassembly_validation: 'NOT_SIMULATED', physical_assembly: 'UNKNOWN', radial_center_mm: [0, 0, count / 4 * 2.4],
      stages: [{ id: 'unit-foundation', label: 'Unit foundation', start_step: 1, end_step: 4 },
        { id: 'unit-body', label: 'Unit body', start_step: 5, end_step: count }] },
  };
}

test('round-half-up count targets use consistent actual baselines, never linear dimensions', () => {
  for (const [baseline, expected] of [
    [12435, [14922, 18653, 24870, 37305, 49740]],
    [17873, [21448, 26810, 35746, 53619, 71492]],
    [9669, [11603, 14504, 19338, 29007, 38676]],
  ]) assert.deepEqual(COUNT_PERCENTAGES.map((ratio) => targetPartCount(baseline, ratio)), expected);
  assert.equal(countTargetResult(12435, 120, 14922 + 149).within_tolerance, true);
  assert.equal(countTargetResult(12435, 120, 14922 + 150).within_tolerance, false);
  assert.equal(countTargetResult(1, 120, 2).within_tolerance, true);
  for (const value of ['12435', NaN, 0, Infinity, -1]) assert.throws(() => targetPartCount(value, 150));
});

test('historical supported Mona data remains viewable but cannot complete the support-free request', () => {
  const catalog = catalogFixture();
  const item = catalog.cases.find((entry) => entry.id === 'mona-p120');
  assert.equal(densityDeliveryStatus(item), 'READY');
  for (const mutate of [
    (entry) => { delete entry.whisker_support; },
    (entry) => { entry.whisker_support.assembly_aid_count = 1; },
    (entry) => { entry.whisker_support.external_aid_count = 3; },
    (entry) => { delete entry.whisker_support.sequence_evidence_sha256; },
    (entry) => { entry.whisker_support.manifest_sha256 = 'f'.repeat(64); },
    (entry) => { entry.whisker_support.all_categories_geometry_match = false; },
    (entry) => { entry.whisker_support.physical_validation = 'PASS'; },
  ]) {
    const changed = structuredClone(item); mutate(changed);
    assert.equal(densityDeliveryStatus(changed), 'REQUIRES_WHISKER_REVISION');
  }
  delete item.whisker_support;
  assert.equal(validateDensityCatalog(catalog, { ...pointer, state: 'PARTIAL' }), catalog);
  assert.throws(() => validateDensityCatalog(catalog, pointer));
  assert.equal(densityDeliveryStatus(catalog.cases.find((entry) => entry.character === 'copilot')), 'READY');
});

test('pending and partial cases cannot masquerade as all fifteen complete', () => {
  assert.equal(validateDensityPointer(pending).state, 'INPUT_WAIT');
  assert.throws(() => validateDensityPointer({ ...pending, catalog: pointer.catalog }));
  const catalog = catalogFixture();
  assert.equal(validateDensityCatalog(catalog, pointer), catalog);
  const before = JSON.stringify(catalog);
  validateDensityCatalog(catalog, pointer);
  assert.equal(JSON.stringify(catalog), before);
  catalog.cases[0] = { id: 'mona-p120', character: 'mona', count_percentage: 120, state: 'INPUT_WAIT' };
  assert.throws(() => validateDensityCatalog(catalog, pointer));
  assert.equal(validateDensityCatalog(catalog, { ...pointer, state: 'PARTIAL' }), catalog);
  const counted = catalogFixture();
  for (const baseline of Object.values(counted.baselines)) {
    baseline.state = 'COUNTED'; baseline.native_media_status = 'PENDING'; delete baseline.images;
  }
  assert.equal(validateDensityCatalog(counted, { ...pointer, state: 'PARTIAL' }), counted);
  assert.throws(() => validateDensityCatalog(counted, pointer));
  for (const change of [
    (c) => { c.cases.pop(); },
    (c) => { c.baselines.copilot.metrics.part_count = 695; },
    (c) => { c.cases[0].assets.native_cad = []; },
    (c) => { delete c.cases[0].assets.animations.bottom_up; },
    (c) => { c.cases[0].target_count -= 1; },
    (c) => { c.cases[0].images.front.condition_id = 'different-view'; },
    (c) => { c.cases[0].actual_ratio = 1.5; },
  ]) {
    const changed = catalogFixture(); change(changed);
    assert.throws(() => validateDensityCatalog(changed, pointer));
  }
});

test('revised geometry occupies one logical slot while old actual IDs remain explicitly addressable', () => {
  const catalog = catalogFixture(), original = structuredClone(catalog.cases[0]);
  const revised = catalog.cases[0];
  Object.assign(revised, { id: 'mona-p120-root-v2', logical_case_id: 'mona-p120', geometry_revision: 'whisker-root-v2' });
  revised.whisker_support.geometry_revision = 'whisker-root-v2';
  delete original.whisker_support;
  catalog.historical_cases = [original];
  assert.equal(validateDensityCatalog(catalog, pointer), catalog);
  assert.equal(catalog.cases.length, 15);
  assert.equal(allDensityCases(catalog).length, 16);
  assert.equal(allDensityCases(catalog).find((item) => item.id === 'mona-p120'), original);
  for (const mutate of [
    (data) => { data.cases[0].logical_case_id = 'mona-p150'; },
    (data) => { data.cases[0].geometry_revision = 'different'; },
    (data) => { data.cases[0].whisker_support.geometry_revision = 'different'; },
    (data) => { data.historical_cases.push(structuredClone(data.historical_cases[0])); },
    (data) => { data.historical_cases[0].state = 'INPUT_WAIT'; },
  ]) {
    const changed = structuredClone(catalog); mutate(changed);
    assert.throws(() => validateDensityCatalog(changed, pointer));
  }
  const guide = guideFixture();
  Object.assign(guide, { candidate_id: revised.id, logical_case_id: revised.logical_case_id,
    geometry_revision: revised.geometry_revision });
  assert.throws(() => validateGuideManifest(guide, revised.id), /工程検査記録/);
  assert.throws(() => validateGuideManifest(guide, original.id));
  guide.animation_contract.sequence_mode = 'BODY_FIRST_ROOT_ANCHORED';
  assert.throws(() => validateGuideManifest(guide, revised.id), /工程検査記録/);
});

test('root-anchored structural checks preserve real low origins and require actual dependency order', () => {
  const manifest = guideFixture();
  Object.assign(manifest, { candidate_id: 'mona-p120-root-v2', logical_case_id: 'mona-p120',
    geometry_revision: 'whisker-root-v2' });
  manifest.animation_contract.sequence_mode = 'BODY_FIRST_ROOT_ANCHORED';
  for (const part of manifest.parts) {
    part.assembly_stage_z_mm = part.position_mm[2];
    part.insertion_predecessor_ids = [...part.support_ids];
  }
  manifest.parts[4].position_mm[2] = -2;
  manifest.parts[5].position_mm[2] = 0;
  manifest.parts[5].insertion_predecessor_ids.push('UNIT-4');
  for (const stage of manifest.animation_contract.stages) {
    stage.support_z_mm = manifest.parts[stage.start_step - 1].assembly_stage_z_mm;
  }
  const before = structuredClone(manifest);
  assert.equal(validateRootAnchoredStructure(manifest), manifest);
  assert.deepEqual(manifest, before);
  assert.throws(() => validateGuideManifest(manifest, manifest.candidate_id), /工程検査記録/);
  for (const change of [
    (data) => { data.candidate_id = 'mona-p120'; },
    (data) => { data.geometry_revision = 'unverified-other'; },
    (data) => { data.aids.push({ id: 'hidden-support' }); },
    (data) => { data.parts[4].required_aids.push('hidden-support'); },
    (data) => { delete data.parts[0].insertion_predecessor_ids; },
    (data) => { data.parts[4].insertion_predecessor_ids = ['UNIT-7']; },
    (data) => { data.parts[4].support_ids = ['UNIT-4']; },
    (data) => { data.parts[4].assembly_stage_z_mm = -10; },
    (data) => { data.parts[7].assembly_course = 0; },
    (data) => { data.parts[6].assembly_stage_z_mm += 1; },
    (data) => { data.animation_contract.stages[1].support_z_mm = 1; },
    (data) => { data.animation_contract.stages[1].end_step = 7; },
  ]) {
    const changed = structuredClone(manifest); change(changed);
    assert.throws(() => validateRootAnchoredStructure(changed));
  }
});

test('only bound root evidence enables support-stage ordering; old Z-order guards stay strict', () => {
  const manifest = guideFixture();
  const id = 'mona-p120-root-v2', revision = 'whisker-root-v2';
  const reference = { ...file('proof.json'), path: `/artifacts/studies/${DENSITY_ID}/validation/${id}-whisker-support.json` };
  Object.assign(manifest, { candidate_id: id, logical_case_id: 'mona-p120', geometry_revision: revision,
    source_manifest_sha256: 'b'.repeat(64), geometry_sequence_identity_sha256: 'c'.repeat(64),
    native_root_contact_evidence_sha256: 'd'.repeat(64), root_validation: reference });
  manifest.whisker_support = {
    external_aid_count: 0, assembly_aid_count: 0, status: 'DIGITAL_SELF_SUPPORTING_UNTESTED',
    physical_validation: 'UNKNOWN', geometry_revision: revision, all_categories_geometry_match: true,
    manifest_sha256: manifest.source_manifest_sha256, sequence_evidence_sha256: reference.sha256,
    assembly_validation_ref: reference, geometry_sequence_identity_sha256: manifest.geometry_sequence_identity_sha256,
    attachment_evidence_sha256: manifest.native_root_contact_evidence_sha256,
  };
  manifest.animation_contract.sequence_mode = 'BODY_FIRST_ROOT_ANCHORED';
  for (const part of manifest.parts) {
    part.assembly_stage_z_mm = part.position_mm[2];
    part.insertion_predecessor_ids = [...part.support_ids];
  }
  manifest.parts[4].position_mm[2] = -2;
  for (const stage of manifest.animation_contract.stages) stage.support_z_mm = manifest.parts[stage.start_step - 1].assembly_stage_z_mm;
  const root = manifest.parts[4];
  const proof = {
    schema_version: 1, case_id: id, logical_case_id: manifest.logical_case_id, geometry_revision: revision,
    status: 'DIGITAL_SELF_SUPPORTING_UNTESTED', physical_validation: 'UNKNOWN',
    external_aid_count: 0, assembly_aid_count: 0, actual_parts: 8, actual_types: 1,
    floating_seed_steps: 0, blocked_vertical_body_columns: 0, source_occupied_cells_unchanged: true,
    source_visible_colors_unchanged: true, body_first_all_steps_supported: true,
    slicer_supports: 'UNKNOWN_SEPARATE_FROM_NO_ASSEMBLY_STANDS',
    geometry_sequence_identity_sha256: manifest.geometry_sequence_identity_sha256,
    native_root_contact_evidence_sha256: manifest.native_root_contact_evidence_sha256,
    modules: [{ part_id: root.id, type_id: root.type_id, step: root.step, physical_bottom_z_mm: -2,
      receiving_body_stage_z_mm: 4.8, actual_body_support_ids: root.support_ids }],
    actual_native_root_checks: {
      result: 'PASS_ACTUAL_BODY_ROOT_BREP_CONTACTS', gravity_balance_result: 'PASS_ALL_NOMINAL_CAD_STATIC_MOMENT_BOUNDS',
      external_aid_count: 0, assembly_aid_count: 0,
      modules: [{ part_id: root.id, actual_single_solid: true, native_root_type: root.type_id, module_insertion_step: root.step }],
    },
    root_structural_sections: [{ part_id: root.id, native_single_solid: true, type_id: root.type_id,
      minimum_effective_section_area_mm2: 5, material_strength_infill_layer_orientation: 'UNMEASURED' }],
    gravity_balance: {
      result: 'PASS_ALL_NOMINAL_CAD_STATIC_MOMENT_BOUNDS', physical_mass_measured: false,
      modules: [{ part_id: root.id, result: 'PASS_NOMINAL_CAD_STATIC_MOMENT_BOUND', required_margin_mm: 1,
        minimum_support_margin_mm: 2, downstream_payloads: [],
        assembly_prefix_checks: [{ added_part_id: root.id, after_step: root.step, minimum_support_margin_mm: 2 }] }],
    },
  };
  assert.equal(validateGuideManifest(manifest, id, proof), manifest);
  for (const change of [
    (data) => { data.actual_parts--; },
    (data) => { data.geometry_sequence_identity_sha256 = 'f'.repeat(64); },
    (data) => { data.modules[0].physical_bottom_z_mm = 4.8; },
    (data) => { data.modules[0].receiving_body_stage_z_mm = -2; },
    (data) => { data.actual_native_root_checks.result = 'PENDING'; },
    (data) => { data.gravity_balance.physical_mass_measured = true; },
    (data) => { data.gravity_balance.modules[0].assembly_prefix_checks[0].minimum_support_margin_mm = 0.9; },
  ]) {
    const changed = structuredClone(proof); change(changed);
    assert.throws(() => validateGuideManifest(manifest, id, changed));
  }
  const legacy = guideFixture();
  legacy.parts[4].position_mm[2] = -2;
  assert.throws(() => validateGuideManifest(legacy, 'mona-p120'), /底から順/);
  legacy.animation_contract.sequence_mode = 'BODY_FIRST_ROOT_ANCHORED';
  assert.throws(() => validateGuideManifest(legacy, 'mona-p120', proof));
});

test('radial explosion is absolute, all-directional and exactly reversible for every pose', () => {
  const manifest = validateGuideManifest(guideFixture(), 'mona-p120');
  const original = structuredClone(manifest.parts);
  for (let repetition = 0; repetition < 20; repetition++) for (const part of manifest.parts) {
    assert.deepEqual(radialPosition(part, 0), part.position_mm);
    const whole = radialPosition(part, 1);
    assert.deepEqual(whole, part.position_mm.map((value, axis) => value + part.radial_offset_mm[axis]));
    radialPosition(part, 0.25); radialPosition(part, 0.75);
    assert.deepEqual(radialPosition(part, 0), part.position_mm);
    assert.deepEqual(densityMatrix(part, 0).elements.slice(12, 15), part.position_mm);
    assert.equal(densityMatrix(part, 1).determinant(), 1);
  }
  assert.deepEqual(manifest.parts, original);
  const wrong = guideFixture(); wrong.parts[0].radial_offset_mm = [0, 0, 10];
  assert.throws(() => validateGuideManifest(wrong, 'mona-p120'));
  for (const value of [-0.1, 1.1, NaN]) assert.throws(() => radialPosition(manifest.parts[0], value));
});

test('bottom-up playback covers empty, partial, courses, stages and all source IDs once', () => {
  const manifest = validateGuideManifest(guideFixture(), 'mona-p120'), index = guideIndex(manifest);
  assert.deepEqual(index.ordered.map((part) => part.step), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(courseBoundary(index, 0, 1), 4);
  assert.equal(courseBoundary(index, 5, -1), 4);
  assert.deepEqual(stageRange(index, 'unit-body'), [4, 8]);
  const seen = [];
  const playback = new AssemblyPlayback(8, (count) => seen.push(count), { rate: 4 });
  playback.play(0); playback.tick(0); playback.tick(250);
  assert.equal(playback.count, 1);
  playback.pause(); playback.tick(500);
  assert.equal(playback.count, 1);
  playback.play(4, 8); playback.tick(1000);
  for (let now = 1250; now <= 2000; now += 250) playback.tick(now);
  assert.equal(playback.count, 8); assert.equal(playback.playing, false);
  playback.seek(0); assert.equal(playback.count, 0);
  assert.deepEqual(samePartDestinations(index, index.ordered[0]).map((part) => part.id), index.ordered.map((part) => part.id));
  for (const change of [
    (data) => { data.parts[0].step = 2; },
    (data) => { data.parts[0].position_mm[2] = 20; },
    (data) => { data.parts[4].support_ids = ['UNIT-7']; },
    (data) => { data.animation_contract.stages[1].end_step = 7; },
    (data) => { data.parts[0].id = data.parts[1].id; },
  ]) {
    const data = guideFixture(); change(data); assert.throws(() => validateGuideManifest(data, 'mona-p120'));
  }
});

test('large manifest indexing and absolute placement stay linear without per-instance meshes', () => {
  const count = 71492, manifest = guideFixture(count);
  const start = performance.now();
  validateGuideManifest(manifest, 'mona-p120');
  const index = guideIndex(manifest);
  const out = [0, 0, 0];
  for (const part of manifest.parts) radialPosition(part, 0.5, out);
  assert.equal(index.ordered.length, count);
  assert.equal(index.groups.size, 1);
  assert.equal(index.courses.at(-1).end, count);
  assert.ok(performance.now() - start < 5000, 'Native data indexing unexpectedly exceeds five seconds');
});

test('share URLs preserve actual case, selected part, progress and camera without locale parsing', () => {
  const index = guideIndex(guideFixture());
  const url = writeDensityView('https://example.test/project/en/density-guide.html', {
    candidate: 'mona-p120', mode: 'radial', steps: 4, explosion: 0.5, part: 'UNIT-4',
    query: 'unit', same: true, camera: [50, -60, 40, 0, 0, 4],
  });
  const state = readDensityView(url.searchParams, index);
  assert.equal(state.part, 'UNIT-4'); assert.equal(state.steps, 4);
  assert.deepEqual(state.camera, [50, -60, 40, 0, 0, 4]);
  for (const query of ['step=9', 'step=1,000', 'part=missing', 'mode=other', 'explode=2', 'camera=NaN,1,2,3,4,5']) {
    assert.throws(() => readDensityView(new URLSearchParams(query), index));
  }
  assert.throws(() => densityPath('/artifacts/studies/part-count-matrix-20260921/../private.json'));
});

test('packed native geometry retains vertices/faces and rejects corrupt per-type fingerprints', async () => {
  const positions = new Float32Array([0, 0, 0, 8, 0, 0, 0, 8, 4.8]);
  const indices = new Uint32Array([0, 1, 2]);
  const geometryHash = createHash('sha256').update(Buffer.from(positions.buffer)).update(Buffer.from(indices.buffer)).digest('hex');
  const header = Buffer.from(JSON.stringify({ schema_version: 1, units: 'mm', origin: 'body-bottom-center',
    mode: 'NATIVE_FLOAT32', types: [{ id: 'unit', vertex_count: 3, index_count: 3,
      positions_byte_offset: 0, indices_byte_offset: positions.byteLength, geometry_sha256: geometryHash }] }));
  const preamble = Buffer.alloc(12); preamble.write('OCBMESH1'); preamble.writeUInt32LE(header.length, 8);
  const pack = Buffer.concat([preamble, header, Buffer.alloc(-(12 + header.length) & 3), Buffer.from(positions.buffer), Buffer.from(indices.buffer)]);
  const uncompressed = await inflateIfNeeded(new Uint8Array(gzipSync(pack)));
  const decoded = await decodeMeshPack(uncompressed);
  assert.deepEqual([...decoded.types.unit.positions], [...positions]);
  assert.deepEqual([...decoded.types.unit.indices], [...indices]);
  const corrupted = uncompressed.slice(); corrupted[corrupted.length - 16] ^= 1;
  await assert.rejects(() => decodeMeshPack(corrupted));
  const nativeHeader = Buffer.alloc(12); nativeHeader.write('OBM1'); nativeHeader.writeUInt32LE(3, 4); nativeHeader.writeUInt32LE(1, 8);
  const native = Buffer.concat([nativeHeader, Buffer.from(positions.buffer), Buffer.from(indices.buffer)]);
  const type = await decodeNativeType(new Uint8Array(native), { type_id: 'unit', geometry_sha256: geometryHash });
  assert.deepEqual([...type.types.unit.positions], [...positions]);
  assert.deepEqual([...type.types.unit.indices], [...indices]);
  await assert.rejects(() => decodeNativeType(new Uint8Array(native), { type_id: 'unit', geometry_sha256: 'f'.repeat(64) }));
});

test('matrix work preserves the previous refinement archive and all pinned baseline records', async () => {
  const root = new URL('../../', import.meta.url);
  const frozen = JSON.parse(await readFile(new URL('site/density-baseline.json', root)));
  const previous = JSON.parse(await readFile(new URL('archive/sources/mona-fine-c-refinement-20260921.json', root)));
  for (const entry of [...frozen.files, ...previous.files]) {
    const bytes = await readFile(new URL(entry.path, root));
    assert.equal(bytes.length, entry.bytes, entry.path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256, entry.path);
  }
});

test('installed actual guide cases retain source fingerprint counts and absolute radial poses', async () => {
  const root = new URL('../../', import.meta.url);
  const publication = validateDensityPointer(JSON.parse(await readFile(new URL('archive/density-study.json', root))));
  if (publication.state === 'INPUT_WAIT') return;
  const bytes = await readFile(new URL(densityPath(publication.catalog.path).slice(1), root));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), publication.catalog.sha256);
  const catalog = validateDensityCatalog(JSON.parse(bytes), publication);
  for (const item of allDensityCases(catalog).filter((entry) => entry.state !== 'INPUT_WAIT')) {
    const source = await readFile(new URL(densityPath(item.manifest.path).slice(1), root));
    assert.equal(source.length, item.manifest.bytes);
    assert.equal(createHash('sha256').update(source).digest('hex'), item.manifest.sha256);
    const { gunzipSync } = await import('node:zlib');
    const data = JSON.parse(gunzipSync(source));
    let proof = null;
    if (data.root_validation) {
      const evidence = await readFile(new URL(densityPath(data.root_validation.path).slice(1), root));
      assert.equal(evidence.length, data.root_validation.bytes);
      assert.equal(createHash('sha256').update(evidence).digest('hex'), data.root_validation.sha256);
      proof = JSON.parse(evidence);
    }
    const guide = validateGuideManifest(data, item.id, proof);
    assert.equal(guide.parts.length, item.metrics.part_count);
    assert.equal(guide.metrics.unique_types, item.metrics.unique_types);
    assert.equal(guide.source_manifest_sha256, item.source_manifest_sha256);
    assert.equal(guide.source_bom_sha256, item.source_bom_sha256);
    const original = guide.parts.map((part) => [...part.position_mm]);
    guide.parts.forEach((part) => { radialPosition(part, 1); radialPosition(part, 0.5); });
    assert.deepEqual(guide.parts.map((part) => radialPosition(part, 0)), original);
  }
});
