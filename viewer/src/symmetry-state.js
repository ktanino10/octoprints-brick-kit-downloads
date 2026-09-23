import { DENSITY_ID, densityAssert as check, isHash, isObject, validateDensityFile } from '../../assets/density-data.js';

const revision = 'bilateral-symmetry-v3';
const mode = 'PER_ROOT_EXCLUSIVE_TOKEN_INTERSECTION_TO_FIRST_SHARED_RECEIVER';
const error = '対称化した実部品・鏡像対応・色・支持・全荷重検査の証拠が一致しません。';
const finite = value => typeof value === 'number' && Number.isFinite(value);
const sameIds = (left, right) => Array.isArray(left) && Array.isArray(right)
  && new Set(left).size === left.length && new Set(right).size === right.length
  && left.length === right.length && left.every(id => right.includes(id));
const samePoint = (left, right, epsilon = 1e-7) => Array.isArray(left) && Array.isArray(right)
  && left.length === 3 && right.length === 3
  && left.every((value, axis) => finite(value) && finite(right[axis]) && Math.abs(value - right[axis]) <= epsilon);
function pairKey(a, ra, b, rb) {
  return JSON.stringify(a < b || (a === b && ra <= rb) ? [a, ra, b, rb] : [b, rb, a, ra]);
}

export function validateSymmetryBinding(manifest, proof) {
  const match = /^(copilot-p(?:120|150|200|300|400))-symmetric-v3$/.exec(manifest.candidate_id);
  const support = manifest.assembly_support, transport = manifest.support_validation, context = manifest.symmetry_context;
  check(match && manifest.logical_case_id === match[1] && manifest.geometry_revision === revision
    && manifest.animation_contract?.sequence_mode === 'BILATERAL_BODY_FIRST_SUPPORT'
    && manifest.support_load_mode === mode, error);
  validateDensityFile(transport);
  check(transport.encoding === 'gzip' && transport.path === `/artifacts/studies/${DENSITY_ID}/validation/${manifest.candidate_id}-symmetry-support.json.gz`
    && transport.decoded_sha256 === support?.sequence_evidence_sha256
    && support.assembly_validation_transport_ref?.sha256 === transport.sha256
    && support.assembly_validation_ref?.sha256 === transport.decoded_sha256
    && support.geometry_revision === revision && support.status === 'DIGITAL_SELF_SUPPORTING_UNTESTED'
    && support.physical_validation === 'UNKNOWN' && support.external_aid_count === 0 && support.assembly_aid_count === 0
    && support.all_categories_geometry_match === true && support.manifest_sha256 === manifest.source_manifest_sha256
    && isHash(manifest.geometry_sequence_identity_sha256) && isHash(manifest.native_support_contact_evidence_sha256)
    && support.geometry_sequence_identity_sha256 === manifest.geometry_sequence_identity_sha256
    && support.attachment_evidence_sha256 === manifest.native_support_contact_evidence_sha256
    && isObject(proof) && proof.case_id === manifest.candidate_id && proof.logical_case_id === manifest.logical_case_id
    && proof.geometry_revision === revision && proof.geometry_sequence_identity_sha256 === manifest.geometry_sequence_identity_sha256
    && proof.native_support_contact_evidence_sha256 === manifest.native_support_contact_evidence_sha256
    && proof.status === 'DIGITAL_SELF_SUPPORTING_UNTESTED' && proof.physical_validation === 'UNKNOWN'
    && proof.external_aid_count === 0 && proof.assembly_aid_count === 0
    && proof.actual_parts === manifest.parts.length && proof.actual_types === manifest.metrics.unique_types
    && proof.body_first_all_steps_supported === true && proof.floating_seed_steps === 0 && proof.blocked_vertical_body_columns === 0
    && proof.source_occupied_cells_unchanged === false && proof.source_visible_colors_unchanged === false
    && proof.mechanical_baseline_occupied_cells_unchanged === true && proof.mechanical_baseline_colors_unchanged === true
    && isHash(proof.mechanical_baseline_manifest_sha256) && proof.support_load_mode === mode
    && JSON.stringify(proof.nominal_geometry_color_mirror_xor) === '[0,0]'
    && context?.symmetry_plane_x_mm === 0 && context.support_load_mode === mode
    && context.intentional_changes_from_published_case === true && context.old_occupied_and_color_unchanged_assertion === false
    && context.native_part_pose_pair_tolerance_mm === 0.00002
    && context.source_current_case_id === proof.symmetry_context?.source_current_case_id
    && context.source_current_manifest_sha256 === proof.symmetry_context?.source_current_manifest_sha256
    && context.paired_target_cells_and_colors_sha256 === proof.symmetry_context?.paired_target_cells_and_colors_sha256,
  error);
  const byId = new Map(manifest.parts.map(part => [part.id, part])), needed = new Set();
  const checked = manifest.parts.filter(part => part.mechanically_checked_support === true).map(part => part.id).sort();
  check(checked.length > 0 && sameIds(checked, manifest.mechanically_checked_support_ids), error);
  const tokens = new Map(), loads = new Map(checked.map(id => [id, []]));
  for (const part of [...manifest.parts].sort((a, b) => a.step - b.step)) {
    const peer = byId.get(part.mirror_part_id);
    check(peer && peer.mirror_part_id === part.id && peer.color_id === part.color_id
      && samePoint(peer.position_mm, [-part.position_mm[0], part.position_mm[1], part.position_mm[2]], 0.00002)
      && part.support_ids.every(id => tokens.has(id)), error);
    needed.add(pairKey(part.type_id, part.rotation_z_deg, peer.type_id, peer.rotation_z_deg));
    const incoming = part.support_ids.map(id => tokens.get(id));
    const all = new Set(incoming.flatMap(set => [...set]));
    const continuing = new Set(incoming.length ? [...incoming[0]].filter(id => incoming.every(set => set.has(id))) : []);
    for (const root of all) loads.get(root).push(part.id);
    if (loads.has(part.id)) continuing.add(part.id);
    tokens.set(part.id, continuing);
  }
  const reflected = proof.native_symmetry, compared = new Set();
  check(reflected?.result === 'PASS_ALL_NATIVE_REFLECTED_SOLIDS_AND_WHOLE_PART_COLORS'
    && reflected.actual_part_count === manifest.parts.length && reflected.reflection_plane_x_mm === 0
    && reflected.part_pairing_is_involution === true && reflected.pose_pair_tolerance_mm === 0.00002
    && Array.isArray(reflected.type_rotation_pair_comparisons), error);
  for (const row of reflected.type_rotation_pair_comparisons) {
    check(Array.isArray(row.type_rotation_pair) && row.type_rotation_pair.length === 4, error);
    const key = pairKey(...row.type_rotation_pair);
    const a = row.reflected_native_volume_mm3, b = row.paired_native_volume_mm3;
    const tolerance = Math.max(0.00001, Math.max(a, b) * 0.0000001);
    check(needed.has(key) && !compared.has(key) && row.whole_part_color_same === true
      && finite(a) && a > 0 && finite(b) && b > 0 && finite(row.symmetric_difference_volume_mm3)
      && row.symmetric_difference_volume_mm3 >= 0 && row.symmetric_difference_volume_mm3 <= tolerance
      && finite(row.tolerance_mm3) && Math.abs(row.tolerance_mm3 - tolerance) <= 1e-12, error);
    compared.add(key);
  }
  check(compared.size === needed.size, error);
  const native = proof.actual_native_support_checks, gravity = proof.gravity_balance;
  check(native?.result === 'PASS_ACTUAL_BILATERAL_SUPPORT_BREP_CONTACTS'
    && native.gravity_balance_result === 'PASS_ALL_NOMINAL_CAD_STATIC_MOMENT_BOUNDS'
    && native.external_aid_count === 0 && native.assembly_aid_count === 0
    && gravity?.result === native.gravity_balance_result && gravity.physical_mass_measured === false, error);
  for (const rows of [native.modules, proof.modules, proof.support_structural_sections, gravity.modules]) {
    check(Array.isArray(rows) && sameIds(checked, rows.map(row => row.part_id)), error);
  }
  for (const row of native.modules) {
    const part = byId.get(row.part_id), structure = row.actual_structural_measurement;
    const details = manifest.types[part.type_id];
    check(row.anchor_role === 'BILATERAL_MATERIAL_SUPPORT' && row.native_support_type === part.type_id
      && row.actual_single_solid === true && row.module_insertion_step === part.step
      && samePoint(row.module_position_mm, part.position_mm) && samePoint(row.body_mm, details.body_mm)
      && row.physical_bottom_z_mm === part.position_mm[2] && row.receiving_body_stage_z_mm === part.assembly_stage_z_mm
      && Number.isSafeInteger(row.root_stud_count) && row.root_stud_count >= 4
      && Array.isArray(row.root_xy_span_mm) && row.root_xy_span_mm.length === 2 && row.root_xy_span_mm.every(n => finite(n) && n > 0)
      && structure?.result === (details.kind === 'stepped-root-module' ? 'PASS_ACTUAL_CONTINUOUS_ROOT_GEOMETRY' : 'PASS_ACTUAL_STOCK_BODY_SUPPORT_GEOMETRY')
      && structure.shape?.valid === true && structure.shape.solid_count === 1
      && Array.isArray(structure.roof_checks) && structure.roof_checks.length > 0
      && structure.roof_checks.every(item => finite(item.roof_mm) && item.roof_mm >= 1.6 - 1e-6)
      && Array.isArray(row.body_supports) && row.body_supports.length > 0, error);
    for (const contact of row.body_supports) check(byId.get(contact.lower_part_id)?.step < part.step
      && part.support_ids.includes(contact.lower_part_id)
      && finite(contact.native_bearing_mm2) && contact.native_bearing_mm2 > 0
      && finite(contact.nominal_volume_overlap_mm3) && contact.nominal_volume_overlap_mm3 >= 0
      && contact.nominal_volume_overlap_mm3 <= 1e-5
      && JSON.stringify(contact.insertion_offsets_mm) === '[2.1,1,0.3,0]', error);
    const material = proof.support_structural_sections.find(item => item.part_id === part.id);
    check(material.type_id === part.type_id && material.native_single_solid === true
      && Array.isArray(material.actual_brep_sections) && material.actual_brep_sections.length === material.section_count
      && material.actual_brep_sections.length > 0
      && material.actual_brep_sections.every(item => finite(item.effective_solid_area_mm2)
        && item.effective_solid_area_mm2 > 0 && finite(item.finite_slice_width_mm) && item.finite_slice_width_mm > 0), error);
    const balance = row.gravity_balance;
    check(balance?.result === 'PASS_NOMINAL_CAD_STATIC_MOMENT_BOUND'
      && finite(balance.required_margin_mm) && balance.required_margin_mm >= 1
      && finite(balance.minimum_support_margin_mm) && balance.minimum_support_margin_mm >= balance.required_margin_mm
      && Array.isArray(balance.downstream_payloads) && Array.isArray(balance.assembly_prefix_checks)
      && sameIds(loads.get(part.id), balance.downstream_payloads.map(item => item.part_id))
      && balance.assembly_prefix_checks.length === balance.downstream_payloads.length + 1, error);
    const expected = [part.id, ...balance.downstream_payloads.map(item => item.part_id)];
    for (const [index, id] of expected.entries()) {
      const prefix = balance.assembly_prefix_checks[index], actual = byId.get(id);
      check(actual && prefix.after_step === actual.step
        && (prefix.added_part_id === id || (index === 0 && prefix.added_part_id === null))
        && (index === 0 || actual.step > byId.get(expected[index - 1]).step)
        && finite(prefix.minimum_support_margin_mm) && prefix.minimum_support_margin_mm >= balance.required_margin_mm, error);
    }
  }
  return manifest;
}
