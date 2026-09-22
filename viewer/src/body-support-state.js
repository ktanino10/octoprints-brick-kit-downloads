import { DENSITY_ID, COPILOT_SUPPORT_REVISION, densityArtifactIdentity,
  densityAssert as check, isObject, isHash, isVector, validateDensityFile } from '../../assets/density-data.js';

const finite = value => typeof value === 'number' && Number.isFinite(value);
const message = '本体支持改訂の実形状・全支持・断面・組立途中の重心証拠が一致しません。';
const equalSet = (left, right) => Array.isArray(left) && Array.isArray(right)
  && new Set(left).size === left.length && new Set(right).size === right.length
  && left.length === right.length && left.every(item => right.includes(item));
const closeVector = (left, right) => isVector(left) && isVector(right)
  && left.every((value, axis) => Math.abs(value - right[axis]) <= 1e-6);

export function validateBodySupportBinding(manifest, proof) {
  const identity = densityArtifactIdentity(manifest.candidate_id), support = manifest.assembly_support;
  check(identity?.supportFree === true && identity.revision === COPILOT_SUPPORT_REVISION
    && manifest.geometry_revision === identity.revision && manifest.logical_case_id === identity.logicalId
    && manifest.animation_contract?.sequence_mode === 'BODY_FIRST_INTERNAL_SUPPORT',
  '本体内部の支持段による順序は、証拠に結合した新Copilot改訂だけに限定します。');
  validateDensityFile(manifest.support_validation);
  check(isObject(proof) && isObject(support)
    && support.status === 'DIGITAL_SELF_SUPPORTING_UNTESTED' && support.physical_validation === 'UNKNOWN'
    && support.external_aid_count === 0 && support.assembly_aid_count === 0
    && support.geometry_revision === identity.revision && support.all_categories_geometry_match === true
    && isHash(manifest.source_manifest_sha256) && support.manifest_sha256 === manifest.source_manifest_sha256
    && manifest.support_validation.path === `/artifacts/studies/${DENSITY_ID}/validation/${manifest.candidate_id}-assembly-support.json`
    && manifest.support_validation.sha256 === support.sequence_evidence_sha256
    && support.assembly_validation_ref?.sha256 === manifest.support_validation.sha256
    && isHash(manifest.geometry_sequence_identity_sha256) && isHash(manifest.native_support_contact_evidence_sha256)
    && support.geometry_sequence_identity_sha256 === manifest.geometry_sequence_identity_sha256
    && support.attachment_evidence_sha256 === manifest.native_support_contact_evidence_sha256
    && proof.schema_version === 1 && proof.case_id === manifest.candidate_id
    && proof.logical_case_id === manifest.logical_case_id && proof.geometry_revision === identity.revision
    && proof.geometry_sequence_identity_sha256 === manifest.geometry_sequence_identity_sha256
    && proof.native_support_contact_evidence_sha256 === manifest.native_support_contact_evidence_sha256
    && proof.status === support.status && proof.physical_validation === 'UNKNOWN'
    && proof.external_aid_count === 0 && proof.assembly_aid_count === 0
    && proof.actual_parts === manifest.parts.length && proof.actual_types === manifest.metrics.unique_types
    && proof.floating_seed_steps === 0 && proof.blocked_vertical_body_columns === 0
    && proof.source_occupied_cells_unchanged === true && proof.source_visible_colors_unchanged === true
    && proof.body_first_all_steps_supported === true
    && proof.slicer_supports === 'UNKNOWN_SEPARATE_FROM_NO_ASSEMBLY_STANDS', message);
  const native = proof.actual_native_support_checks, gravity = proof.gravity_balance;
  check(native?.result === 'PASS_ACTUAL_BODY_SUPPORT_BREP_CONTACTS'
    && native.gravity_balance_result === 'PASS_ALL_NOMINAL_CAD_STATIC_MOMENT_BOUNDS'
    && native.external_aid_count === 0 && native.assembly_aid_count === 0
    && gravity?.result === native.gravity_balance_result && gravity.physical_mass_measured === false
    && Array.isArray(proof.modules) && proof.modules.length > 0
    && Array.isArray(native.modules) && Array.isArray(gravity.modules)
    && Array.isArray(proof.support_structural_sections), message);
  const ids = proof.modules.map(module => module.part_id);
  for (const rows of [native.modules, gravity.modules, proof.support_structural_sections]) {
    check(equalSet(ids, rows.map(item => item.part_id)), message);
  }
  const byId = new Map(manifest.parts.map(part => [part.id, part]));
  const actualModules = manifest.parts.filter(part => manifest.types[part.type_id]?.kind === 'stepped-root-module').map(part => part.id);
  check(equalSet(ids, actualModules), message);
  for (const part of manifest.parts) check(Array.isArray(part.source_part_ids) && part.source_part_ids.length > 0
    && new Set(part.source_part_ids).size === part.source_part_ids.length
    && part.source_part_ids.every(id => typeof id === 'string' && id.length > 0)
    && typeof part.role === 'string' && part.role.length > 0, message);
  for (const module of proof.modules) {
    const part = byId.get(module.part_id), body = native.modules.find(item => item.part_id === module.part_id);
    const section = proof.support_structural_sections.find(item => item.part_id === module.part_id);
    const balance = gravity.modules.find(item => item.part_id === module.part_id);
    check(part && part.type_id.startsWith('BS-') && module.type_id === part.type_id && module.step === part.step
      && module.physical_bottom_z_mm === part.position_mm[2] && module.receiving_body_stage_z_mm === part.assembly_stage_z_mm
      && body.anchor_role === 'BODY_INTEGRATED_SUPPORT_ROOT' && body.actual_single_solid === true
      && body.native_support_type === part.type_id && body.module_insertion_step === part.step
      && closeVector(body.module_position_mm, part.position_mm)
      && body.physical_bottom_z_mm === part.position_mm[2] && body.receiving_body_stage_z_mm === part.assembly_stage_z_mm
      && closeVector(body.body_mm, manifest.types[part.type_id].body_mm)
      && Array.isArray(body.body_supports) && body.body_supports.length > 0
      && equalSet(module.actual_body_support_ids, body.body_supports.map(item => item.lower_part_id))
      && module.actual_body_support_ids.every(id => part.support_ids.includes(id)), message);
    for (const receiver of body.body_supports) check(byId.get(receiver.lower_part_id)?.step < part.step
      && finite(receiver.native_bearing_mm2) && receiver.native_bearing_mm2 > 0
      && finite(receiver.nominal_volume_overlap_mm3) && receiver.nominal_volume_overlap_mm3 >= 0
      && receiver.nominal_volume_overlap_mm3 <= 1e-5
      && JSON.stringify(receiver.insertion_offsets_mm) === '[2.1,1,0.3,0]', message);
    check(section.type_id === part.type_id && section.native_single_solid === true
      && finite(section.minimum_true_root_roof_mm) && section.minimum_true_root_roof_mm >= 1.6 - 1e-6
      && section.material_strength_infill_layer_orientation === 'UNMEASURED'
      && Array.isArray(section.actual_brep_sections) && section.section_count === section.actual_brep_sections.length,
    message);
    const axes = new Set();
    const geometry = manifest.types[part.type_id], slices = geometry.body_slices, unit = geometry.vertical_unit_mm;
    check(Array.isArray(slices) && slices.length > 0 && finite(unit) && unit > 0
      && slices.every(item => Number.isSafeInteger(item.bottom_unit) && item.bottom_unit >= 0
        && Number.isSafeInteger(item.height_units) && item.height_units > 0)
      && Math.min(...slices.map(item => item.bottom_unit)) === 0, message);
    const expectedNecks = [...new Set(slices.filter(item => item.bottom_unit > 0).map(item => item.bottom_unit * unit))]
      .sort((left, right) => left - right);
    const measuredNecks = [];
    for (const slice of section.actual_brep_sections) {
      const field = { x: 'plane_x_mm', y: 'plane_y_mm', 'z-transition': 'plane_z_mm' }[slice.section_axis];
      check(field && finite(slice[field]) && finite(slice.finite_slice_width_mm) && slice.finite_slice_width_mm > 0
        && finite(slice.effective_solid_area_mm2) && slice.effective_solid_area_mm2 > 0
        && typeof slice.definition === 'string' && slice.definition.length > 0, message);
      axes.add(slice.section_axis);
      if (slice.section_axis === 'z-transition') measuredNecks.push(slice.plane_z_mm);
    }
    measuredNecks.sort((left, right) => left - right);
    check(axes.has('x') && axes.has('y') && measuredNecks.length === expectedNecks.length
      && measuredNecks.every((value, index) => Math.abs(value - expectedNecks[index]) < 1e-6)
      && finite(section.minimum_effective_section_area_mm2)
      && Math.abs(section.minimum_effective_section_area_mm2 - Math.min(...section.actual_brep_sections.map(item => item.effective_solid_area_mm2))) < 1e-6
      && balance.result === 'PASS_NOMINAL_CAD_STATIC_MOMENT_BOUND' && finite(balance.required_margin_mm)
      && balance.required_margin_mm >= 1 && finite(balance.minimum_support_margin_mm)
      && balance.minimum_support_margin_mm >= balance.required_margin_mm
      && Array.isArray(balance.downstream_payloads) && Array.isArray(balance.assembly_prefix_checks)
      && balance.assembly_prefix_checks.length === balance.downstream_payloads.length + 1, message);
    const expected = [part.id, ...balance.downstream_payloads.map(item => item.part_id)];
    check(new Set(expected).size === expected.length, message);
    for (const [index, identifier] of expected.entries()) {
      const payload = byId.get(identifier), sample = balance.assembly_prefix_checks[index];
      check(payload && sample.after_step === payload.step
        && (sample.added_part_id === identifier || (index === 0 && sample.added_part_id === null))
        && (index === 0 || payload.step > byId.get(expected[index - 1]).step)
        && finite(sample.minimum_support_margin_mm) && sample.minimum_support_margin_mm >= balance.required_margin_mm, message);
    }
    check(Math.abs(balance.minimum_support_margin_mm - Math.min(...balance.assembly_prefix_checks.map(item => item.minimum_support_margin_mm))) < 1e-6,
      message);
  }
  return manifest;
}
