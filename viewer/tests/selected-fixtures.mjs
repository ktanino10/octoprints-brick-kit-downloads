// Test-only contract records. These are never served or bundled as model artifacts.
export const selectedRevision = 'r2-test';
const selectedStatus = () => ({ visual_selection: 'BASELINE_APPROVED', physical_fit: 'UNKNOWN', production_export: 'BLOCKED' });
const definitions = [
  ['mona', 'fine', 4, 2.4, 6, 'a'],
  ['copilot', 'chunky', 8, 4.8, 8, 'b'],
  ['ducky', 'fine', 4, 2.4, 6, 'c'],
];
export const selectedSelection = () => ({
  schema_version: 1, selection_id: 'TEST ONLY', revision: selectedRevision,
  selections: definitions.map(([character, style, pitch_mm, layer_mm, baseline_part_count, hash]) => ({
    character, style, pitch_mm, layer_mm, baseline_part_count, candidate_id: `${character}-${style}`,
    baseline_manifest: `artifacts/phase1/${character}-${style}/manifest.json`,
    baseline_sha256: hash.repeat(64), visual_decision: 'APPROVED',
  })),
  gates: { visual_baseline: 'APPROVED', revised_joint_fit: 'UNKNOWN', retention_strength: 'UNKNOWN', physical_assembly: 'UNKNOWN', production_export: 'BLOCKED' },
});
export const selectedPointer = () => ({
  revision: selectedRevision, selection_url: '/design/selected-designs.json',
  catalog_url: `/artifacts/selected/${selectedRevision}/catalog.json`,
});
export const selectedMetrics = (baseline = 6) => ({
  part_count: 4, baseline_part_count: baseline, height_mm: 8, width_mm: 16, depth_mm: 12,
  unique_types: 2, color_count: 2, layer_count: 2, approx_build_hours: [0.1, 0.2],
});
export const selectedCatalog = () => ({
  schema_version: 1, stage: 'SELECTED_PROTOTYPE', revision: selectedRevision,
  selection_url: '/design/selected-designs.json',
  source_history_url: '/artifacts/phase1/gallery.html',
  prototypes_url: `/artifacts/selected/${selectedRevision}/cad/prototypes.json`,
  candidates: definitions.map(([character, style, pitch_mm, layer_mm, baseline]) => {
    const id = `${character}-${style}`;
    const base = `/artifacts/selected/${selectedRevision}/${id}`;
    return {
      id, character, style, label: `TEST ONLY ${id}`, pitch_mm, layer_mm,
      manifest_url: `${base}/manifest.json`, bom_url: `${base}/bom.csv`,
      render_url: `${base}/preview.png`, blend_url: `${base}/scene.blend`, video_url: `${base}/turntable.mp4`,
      status: selectedStatus(), metrics: selectedMetrics(baseline), warnings: [],
    };
  }),
  trial_sets: [4, 8].map((pitch_mm) => ({
    pitch_mm, nozzle_recommendation_mm: pitch_mm === 4 ? 0.2 : 0.4,
    material: 'PLA', orientation: 'TEST ONLY orientation',
    diametral_clearances_mm: [-0.05, 0, 0.1, 0.2],
    parts: [{ label: 'TEST ONLY trial group', url: `/artifacts/selected/${selectedRevision}/trials/p${pitch_mm}/part.stl`, quantity: 11 }],
    instructions_url: `/artifacts/selected/${selectedRevision}/trials/p${pitch_mm}/instructions.json`,
    plate_url: `/artifacts/selected/${selectedRevision}/trials/p${pitch_mm}/plate.FCStd`,
  })),
});
export const selectedManifest = () => ({
  schema_version: 2, units: 'mm', candidate_id: 'mona-fine', revision: selectedRevision,
  frame: { up: '+Z', front: '-Y', handedness: 'right' },
  palette: { c0: { hex: '#5e43b7', name: 'TEST Purple' }, c1: { hex: '#ffffff', name: 'TEST White' } },
  types: {
    poly: { cells: [2, 2], footprint_cells: [[0, 0], [1, 0], [0, 1]], pitch_mm: 4, layer_mm: 2.4 },
    single: { cells: [1, 1], footprint_cells: [[0, 0]], pitch_mm: 4, layer_mm: 2.4 },
  },
  parts: [0, 90, 180, 270].map((rotation_z_deg, index) => ({
    id: `TEST-R2-${index}`, type_id: index < 2 ? 'poly' : 'single', color_id: index % 2 ? 'c1' : 'c0',
    position_mm: [index * 4, 0, index < 2 ? 0 : 2.4], rotation_z_deg, layer: index < 2 ? 0 : 1, step: index + 1,
    print_rotation_deg: [0, 0, 0], baseline_part_ids: [`TEST-BASE-${index}`], changed_grouping: index < 2,
    support_class: index === 3 ? 'CRADLE_AND_RETENTION_REQUIRED' : index === 2 ? 'RETENTION_REQUIRED' : 'SEATED_NOMINAL',
    insertion_axis: index === 3 ? '+Z' : '-Z', attach_to: index ? `TEST-R2-${index - 1}` : null,
    feature_tags: index === 3 ? ['TEST-whisker-tip'] : [],
  })),
  metrics: selectedMetrics(), status: selectedStatus(), warnings: [],
  visual_approval: {
    scope: 'Phase1 exterior baseline only', selected_candidate_id: 'mona-fine',
    baseline_manifest_sha256: 'a'.repeat(64), derivative_joint_review: 'PENDING_PHYSICAL_TEST',
  },
  assembly: {
    graph_components: 1, contact_edges: [['TEST-R2-0', 'TEST-R2-1', 2], ['TEST-R2-1', 'TEST-R2-2', 1], ['TEST-R2-2', 'TEST-R2-3', 1]],
    contact_edge_count: 3, contact_stud_sites: 4, underside_attachment_count: 1,
    mechanical_validation: 'UNKNOWN', insertion_sweep_validation: 'PASS_CONSERVATIVE_VERTICAL',
    insertion_sweep_scope: 'Nominal pure-vertical column and joint-profile check only',
  },
});
export const selectedPrototypes = () => ({
  schema_version: 2, units: 'mm', origin: 'body-bottom-bbox-center',
  types: Object.fromEntries(Object.entries(selectedManifest().types).map(([id, type]) => [id, {
    ...type, body_mm: [type.cells[0] * 4 - 0.18, type.cells[1] * 4 - 0.18, 2.28],
    stud_diameter_mm: 1.1, stud_height_mm: 0.6, socket_depth_mm: 0.8,
    vertices: [[0, 0, 0], [1, 0, 0], [0, 1, 0]], faces: [[0, 1, 2]],
  }])),
});
export const historyCatalog = () => {
  const choices = selectedSelection().selections;
  return {
    schema_version: 1, prototypes_url: '/artifacts/cad/prototypes.json',
    candidates: ['mona', 'copilot', 'ducky'].flatMap((character) => ['chunky', 'balanced', 'fine'].map((style) => {
      const choice = choices.find((item) => item.candidate_id === `${character}-${style}`);
      const pitch = { chunky: 8, balanced: 6, fine: 4 }[style];
      return {
        id: `${character}-${style}`, character, style, label: `TEST ONLY history ${character}-${style}`,
        pitch_mm: pitch, layer_mm: pitch * 0.6,
        manifest_url: `/artifacts/phase1/${character}-${style}/manifest.json`,
        metrics: { ...selectedMetrics(), part_count: choice?.baseline_part_count ?? 4 },
        status: { ...selectedStatus(), visual_selection: 'PENDING' }, warnings: [],
      };
    })),
  };
};
