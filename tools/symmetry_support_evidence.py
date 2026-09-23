"""Bind corrected geometry to actual material-support contacts and conserved per-root loads."""

import math

from density_root_evidence import BALANCE_PASS, canonical_sha, finite, require, validate_balance, vector
from symmetry_evidence import LOAD_MODE, SEQUENCE_MODE, geometry_sequence_identity
from symmetry_loads import nonreset_support_loads
from symmetry_requirements import SYMMETRY_REVISION


def verify_bilateral_supports(proof, manifest, native_complete):
    identity = geometry_sequence_identity(manifest)
    require(proof.get("case_id") == manifest["candidate_id"]
            and proof.get("logical_case_id") == manifest["logical_case_id"]
            and proof.get("geometry_revision") == SYMMETRY_REVISION
            and proof.get("geometry_sequence_identity_sha256") == identity
            and proof.get("support_load_mode") == LOAD_MODE and manifest["motion"]["sequence_mode"] == SEQUENCE_MODE,
            "Symmetry support evidence does not bind the exact new geometry, colors and sequence")
    require(proof.get("source_occupied_cells_unchanged") is False and proof.get("source_visible_colors_unchanged") is False
            and proof.get("mechanical_baseline_occupied_cells_unchanged") is True
            and proof.get("mechanical_baseline_colors_unchanged") is True
            and isinstance(proof.get("unchanged_flags_scope"), str) and bool(proof["unchanged_flags_scope"]),
            "Intentional symmetry changes cannot reuse the previous unchanged-source claim")
    require(proof.get("status") == "DIGITAL_SELF_SUPPORTING_UNTESTED"
            and proof.get("physical_validation") == "UNKNOWN"
            and proof.get("slicer_supports") == "UNKNOWN_SEPARATE_FROM_NO_ASSEMBLY_STANDS"
            and all(type(proof.get(key)) is int and proof[key] == 0
                    for key in ["external_aid_count", "assembly_aid_count", "floating_seed_steps", "blocked_vertical_body_columns"])
            and proof.get("body_first_all_steps_supported") is True,
            "The corrected design still has aids, floating/blocked steps or unqualified physical claims")
    parts = {part["id"]: part for part in manifest["parts"]}
    require(proof.get("actual_parts") == len(parts)
            and proof.get("actual_types") == len({part["type_id"] for part in parts.values()}),
            "Symmetry support evidence uses incorrect actual quantities")
    assembly = manifest.get("assembly", {})
    require(assembly.get("assembly_aids") == [] and assembly.get("temporary_support_part_ids") == []
            and assembly.get("temporary_support_part_count") == 0
            and native_complete.get("temporary_aids") == []
            and all(part.get("required_aids") == [] for part in parts.values()),
            "Actual source or portable native assembly still requires an aid")
    prior, previous = set(), None
    for part in manifest["parts"]:
        require(finite(part.get("assembly_stage_z_mm")) and type(part.get("assembly_course")) is int
                and part["assembly_course"] >= 0
                and (previous is None or (part["assembly_stage_z_mm"] >= previous["assembly_stage_z_mm"] - 1e-7
                                         and part["assembly_course"] >= previous["assembly_course"])),
                "The actual receiving-body stages are not nondecreasing")
        for key in ["support_ids", "insertion_predecessor_ids"]:
            dependencies = part.get(key)
            require(isinstance(dependencies, list) and len(set(dependencies)) == len(dependencies)
                    and set(dependencies) <= prior, "A required receiver or insertion predecessor appears too late")
        prior.add(part["id"]); previous = part
    native = native_complete.get("assembly_support_native_validation")
    require(isinstance(native, dict) and native.get("result") == "PASS_ACTUAL_BILATERAL_SUPPORT_BREP_CONTACTS"
            and native.get("gravity_balance_result") == BALANCE_PASS
            and native.get("external_aid_count") == 0 and native.get("assembly_aid_count") == 0
            and proof.get("actual_native_support_checks") == native
            and proof.get("native_support_contact_evidence_sha256") == canonical_sha(native),
            "The actual bilateral native contact/load report is missing or not exactly bound")
    checked = sorted(part["id"] for part in parts.values() if part.get("mechanically_checked_support") is True)
    collections = {"native": native.get("modules"), "public": proof.get("modules"),
                   "sections": proof.get("support_structural_sections"),
                   "gravity": proof.get("gravity_balance", {}).get("modules")}
    maps = {}
    for name, rows in collections.items():
        require(isinstance(rows, list) and len(rows) == len(checked), "A required material support has no complete evidence")
        mapping = {row["part_id"]: row for row in rows}
        require(len(mapping) == len(rows) and set(mapping) == set(checked),
                "Native, public, material-section and load records must cover exactly the actual checked supports")
        maps[name] = mapping
    loads = nonreset_support_loads(manifest["parts"], checked)
    source_loads = {row["support_part_id"]: row["payload_part_ids"] for row in manifest["assembly_support_load_cases"]}
    require(loads["payload_ids_in_actual_step_order"] == source_loads,
            "A root load was lost, duplicated or reordered across another support or shared receiver")
    require(proof.get("support_token_ledger_sha256") == canonical_sha(manifest["support_token_ledger"]),
            "The source token ledger differs from the sealed public proof")
    require(proof["gravity_balance"].get("result") == BALANCE_PASS
            and proof["gravity_balance"].get("physical_mass_measured") is False,
            "Nominal CAD balance is not measured printed mass or material strength")
    section_count, prefix_count = 0, 0
    margins = []
    for identifier in checked:
        part, body = parts[identifier], maps["native"][identifier]
        public, section, balance = (maps[name][identifier] for name in ["public", "sections", "gravity"])
        spec = manifest["types"][part["type_id"]]
        require(body.get("anchor_role") == "BILATERAL_MATERIAL_SUPPORT"
                and body.get("actual_single_solid") is True and body.get("native_support_type") == part["type_id"]
                and body.get("module_insertion_step") == part["step"]
                and body.get("module_position_mm") == part["position_mm"]
                and body.get("body_mm") == spec["body_mm"]
                and body.get("physical_bottom_z_mm") == part["position_mm"][2]
                and body.get("receiving_body_stage_z_mm") == part["assembly_stage_z_mm"]
                and public.get("type_id") == part["type_id"] and public.get("step") == part["step"]
                and public.get("physical_bottom_z_mm") == part["position_mm"][2]
                and public.get("receiving_body_stage_z_mm") == part["assembly_stage_z_mm"]
                and type(body.get("root_stud_count")) is int and body["root_stud_count"] >= 4
                and vector(body.get("root_xy_span_mm"), 2) and all(n > 0 for n in body["root_xy_span_mm"]),
                "Actual support type, pose, receiving stage, insertion step or noncollinear contact span differs")
        supports = body.get("body_supports")
        require(isinstance(supports, list) and bool(supports), "A checked support has no actual native receivers")
        lower_ids = []
        for contact in supports:
            lower = contact.get("lower_part_id")
            require(lower in parts and parts[lower]["step"] < part["step"]
                    and finite(contact.get("native_bearing_mm2")) and contact["native_bearing_mm2"] > 0
                    and finite(contact.get("nominal_volume_overlap_mm3"))
                    and 0 <= contact["nominal_volume_overlap_mm3"] <= 1e-5
                    and contact.get("insertion_offsets_mm") == [2.1, 1, 0.3, 0],
                    "A real receiver has no positive bearing, has overlap, or lacks the required insertion samples")
            lower_ids.append(lower)
        require(len(set(lower_ids)) == len(lower_ids)
                and set(lower_ids) == set(public.get("actual_body_support_ids", []))
                and set(lower_ids) <= set(part["support_ids"]),
                "The actual receiver contacts disagree with the source support graph")
        measurement = body.get("actual_structural_measurement")
        expected = ("PASS_ACTUAL_CONTINUOUS_ROOT_GEOMETRY" if spec["kind"] == "stepped-root-module"
                    else "PASS_ACTUAL_STOCK_BODY_SUPPORT_GEOMETRY")
        require(isinstance(measurement, dict) and measurement.get("result") == expected
                and measurement.get("shape", {}).get("valid") is True
                and measurement["shape"].get("solid_count") == 1
                and finite(measurement["shape"].get("volume_mm3")) and measurement["shape"]["volume_mm3"] > 0,
                "The actual structural measurement is missing or reclassifies a stock part as a different shape")
        if expected == "PASS_ACTUAL_STOCK_BODY_SUPPORT_GEOMETRY":
            require(measurement.get("source_geometry_unchanged") is True,
                    "Stock native geometry must not be rewritten by its case-specific measurement")
        roofs = measurement.get("roof_checks")
        require(isinstance(roofs, list) and bool(roofs) and all(finite(row.get("roof_mm")) and row["roof_mm"] >= 1.6 - 1e-6 for row in roofs),
                "An actual support lacks its nominal 1.6mm material roof")
        samples = measurement.get("cross_sections")
        require(isinstance(samples, list) and bool(samples), "Actual X/Y and applicable neck sections are missing")
        axes, necks = set(), []
        for row in samples:
            axis = row.get("section_axis")
            plane = {"x": "plane_x_mm", "y": "plane_y_mm", "z-transition": "plane_z_mm"}.get(axis)
            require(plane is not None and finite(row.get(plane))
                    and finite(row.get("finite_slice_width_mm")) and row["finite_slice_width_mm"] > 0
                    and finite(row.get("effective_solid_area_mm2")) and row["effective_solid_area_mm2"] > 0,
                    "An actual material section or step neck is empty or unmeasured")
            axes.add(axis)
            if axis == "z-transition":
                necks.append(row["plane_z_mm"])
        slices = spec.get("body_slices", [{"bottom_unit": 0}])
        expected_necks = sorted({row["bottom_unit"] * spec["vertical_unit_mm"] for row in slices if row["bottom_unit"] > 0})
        require({"x", "y"} <= axes and len(necks) == len(expected_necks)
                and all(abs(left - right) <= 1e-6 for left, right in zip(sorted(necks), expected_necks, strict=True)),
                "Every real internal transition must be measured; flat stock parts must not acquire invented necks")
        require(section.get("type_id") == part["type_id"] and section.get("native_single_solid") is True
                and section.get("section_count") == len(samples) and section.get("actual_brep_sections") == samples
                and section.get("material_strength_infill_layer_orientation") == "UNMEASURED"
                and math.isclose(section["minimum_effective_section_area_mm2"],
                                 min(row["effective_solid_area_mm2"] for row in samples), abs_tol=1e-6, rel_tol=0),
                "Published material-section evidence differs from the actual native measurement")
        validate_balance(body["gravity_balance"], part, parts)
        require(balance == {"part_id": identifier, **body["gravity_balance"]}
                and [row["part_id"] for row in balance["downstream_payloads"]] == source_loads[identifier],
                "The public native mass/prefix record does not match the independent nonreset load ledger")
        margins.append(balance["minimum_support_margin_mm"])
        prefix_count += len(balance["assembly_prefix_checks"])
        section_count += len(samples)
    lineage = proof.get("support_target_lineage", {})
    targets = lineage.get("mandatory_baseline_part_ids", [])
    mapping = lineage.get("required_source_to_checked_part", {})
    require(lineage.get("state") == "PASS_COMPLETE_REQUIRED_SUPPORT_LINEAGE"
            and len(targets) == len(set(targets)) == lineage.get("mandatory_baseline_part_count")
            and set(mapping) == set(targets) and set(mapping.values()) == set(checked)
            and set(lineage.get("actual_checked_support_ids", [])) == set(checked)
            and lineage.get("actual_checked_support_count") == len(checked)
            and lineage.get("all_required_targets_covered") is True,
            "Required mechanical targets were dropped rather than covered by real integrated support parts")
    for target, identifier in mapping.items():
        require(target in parts[identifier].get("source_part_ids", [identifier]),
                "A reduced support count lost its actual source-part lineage")
    return {
        "geometry_sequence_identity_sha256": identity,
        "native_support_contact_evidence_sha256": canonical_sha(native),
        "checked_material_supports": len(checked), "actual_native_load_prefixes": prefix_count,
        "actual_native_material_sections": section_count, "minimum_nominal_support_margin_mm": min(margins),
        "required_nominal_support_margin_mm": 1, "required_baseline_targets_covered": len(targets),
        "nonreset_token_loads_match_actual_support_graph": True,
        "external_aid_count": 0, "assembly_aid_count": 0, "physical_validation": "UNKNOWN",
    }
