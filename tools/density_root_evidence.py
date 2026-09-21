"""Bind root-revision claims to the exact source geometry, sequence and nominal CAD checks."""

import hashlib
import json
import math

from density_requirements import MONA_GEOMETRY_REVISION, artifact_identity

SEQUENCE_MODE = "BODY_FIRST_ROOT_ANCHORED"
NATIVE_PASS = "PASS_ACTUAL_BODY_ROOT_BREP_CONTACTS"
BALANCE_PASS = "PASS_ALL_NOMINAL_CAD_STATIC_MOMENT_BOUNDS"
MODULE_BALANCE_PASS = "PASS_NOMINAL_CAD_STATIC_MOMENT_BOUND"
IDENTITY_PART_FIELDS = (
    "id", "type_id", "color_id", "position_mm", "rotation_z_deg", "step",
    "support_ids", "required_aids", "assembly_stage_z_mm", "assembly_course",
    "insertion_predecessor_ids", "radial_offset_mm",
)


def require(condition, message):
    if not condition:
        raise ValueError(message)


def canonical_bytes(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True,
                      allow_nan=False).encode("utf-8")


def canonical_sha(value):
    return hashlib.sha256(canonical_bytes(value)).hexdigest()


def geometry_sequence_identity(manifest):
    require(manifest.get("geometry_revision") == MONA_GEOMETRY_REVISION
            and manifest["motion"].get("sequence_mode") == SEQUENCE_MODE,
            "The root geometry/sequence identity uses an unsupported revision or mode")
    return canonical_sha({
        "geometry_revision": manifest["geometry_revision"],
        "parts": [[part[key] for key in IDENTITY_PART_FIELDS] for part in manifest["parts"]],
        "types": manifest["types"],
        "palette": manifest["palette"],
        "motion_stages": manifest["motion"]["stages"],
        "sequence_mode": SEQUENCE_MODE,
        "whisker_load_cases": manifest["whisker_load_cases"],
    })


def finite(value):
    return type(value) in {int, float} and math.isfinite(value)


def vector(value, length):
    return isinstance(value, list) and len(value) == length and all(finite(number) for number in value)


def validate_balance(balance, root, parts):
    require(isinstance(balance, dict) and balance.get("result") == MODULE_BALANCE_PASS,
            "A module has not passed the nominal CAD static-moment check")
    threshold = balance.get("required_margin_mm")
    minimum = balance.get("minimum_support_margin_mm")
    require(finite(threshold) and threshold >= 1 and finite(minimum) and minimum >= threshold,
            "The nominal CAD support margin is missing or below its required bound")
    for key in ["assumptions", "not_validated"]:
        require(isinstance(balance.get(key), str) and bool(balance[key].strip()),
                "CAD balance must state its assumptions and unvalidated physical conditions")
    volume, centroid = balance.get("root_cad_volume_mm3"), balance.get("root_cad_centroid_mm")
    hull = balance.get("actual_bearing_hull_xy_mm")
    require(finite(volume) and volume > 0 and vector(centroid, 3)
            and isinstance(hull, list) and len(hull) >= 3 and all(vector(point, 2) for point in hull),
            "Actual root CAD volume, centroid or bearing hull is missing")
    area = sum(left[0] * right[1] - right[0] * left[1] for left, right in zip(hull, hull[1:] + hull[:1]))
    require(abs(area) > 1e-9, "The actual bearing hull has no area")
    sign = 1 if area > 0 else -1
    for left, right in zip(hull, hull[1:] + hull[:1]):
        dx, dy = right[0] - left[0], right[1] - left[1]
        length = math.hypot(dx, dy)
        require(length > 1e-9, "The actual bearing hull has duplicate neighboring vertices")
        require(all(sign * (dx * (point[1] - left[1]) - dy * (point[0] - left[0])) >= -1e-7 for point in hull),
                "The supplied actual bearing hull is not a convex ordered polygon")
        distance = sign * (dx * (centroid[1] - left[1]) - dy * (centroid[0] - left[0])) / length
        require(distance + 1e-6 >= threshold, "The module alone has insufficient nominal CAD support margin")
    payloads = balance.get("downstream_payloads")
    prefixes = balance.get("assembly_prefix_checks")
    require(isinstance(payloads, list) and isinstance(prefixes, list) and len(prefixes) == len(payloads) + 1,
            "CAD balance does not cover the module alone and every downstream load prefix")
    expected = [(root["step"], root["id"])]
    seen = {root["id"]}
    previous_step = root["step"]
    for payload in payloads:
        identifier = payload.get("part_id")
        require(identifier in parts and identifier not in seen and parts[identifier]["step"] > previous_step
                and finite(payload.get("cad_volume_mm3")) and payload["cad_volume_mm3"] > 0
                and vector(payload.get("cad_centroid_mm"), 3),
                "A downstream CAD load is missing, duplicated, or out of actual assembly order")
        previous_step = parts[identifier]["step"]
        expected.append((previous_step, identifier))
        seen.add(identifier)
    margins = []
    for index, (check, (step, identifier)) in enumerate(zip(prefixes, expected, strict=True)):
        require(check.get("after_step") == step
                and (check.get("added_part_id") == identifier or (index == 0 and check.get("added_part_id") is None))
                and finite(check.get("minimum_support_margin_mm")) and check["minimum_support_margin_mm"] >= threshold,
                "An actual assembly prefix lacks a passing nominal CAD static-moment bound")
        margins.append(check["minimum_support_margin_mm"])
    require(math.isclose(minimum, min(margins), rel_tol=0, abs_tol=1e-6),
            "The reported worst CAD margin differs from its assembly-prefix records")


def validate_root_evidence(proof, manifest, native_complete):
    identifier = manifest["candidate_id"]
    logical, revision = artifact_identity(identifier)
    require(revision == MONA_GEOMETRY_REVISION and manifest.get("logical_case_id") == logical,
            "Root evidence must belong to its exact revised geometry and logical slot")
    parts = {part["id"]: part for part in manifest["parts"]}
    require(len(parts) == len(manifest["parts"]) and bool(parts)
            and sorted(part["step"] for part in manifest["parts"]) == list(range(1, len(parts) + 1)),
            "The source identity must preserve actual source order and cover every ID once")
    require(proof.get("schema_version") == 1 and proof.get("case_id") == identifier
            and proof.get("logical_case_id") == logical and proof.get("geometry_revision") == revision
            and proof.get("status") == "DIGITAL_SELF_SUPPORTING_UNTESTED"
            and proof.get("physical_validation") == "UNKNOWN"
            and proof.get("slicer_supports") == "UNKNOWN_SEPARATE_FROM_NO_ASSEMBLY_STANDS"
            and proof.get("actual_parts") == len(parts)
            and proof.get("actual_types") == len({part["type_id"] for part in parts.values()}),
            "Public root evidence is incomplete or describes a different actual case")
    require(all(type(proof.get(key)) is int and proof[key] == 0 for key in [
        "external_aid_count", "assembly_aid_count", "floating_seed_steps", "blocked_vertical_body_columns"]),
        "The root revision still needs aids or contains floating/blocked assembly steps")
    require(all(proof.get(key) is True for key in [
        "source_occupied_cells_unchanged", "source_visible_colors_unchanged", "body_first_all_steps_supported"]),
        "The root revision has not preserved its source occupancy, colors and supported sequence")
    assembly = manifest.get("assembly", {})
    require(assembly.get("assembly_aids") == [] and assembly.get("temporary_support_part_ids") == []
            and type(assembly.get("temporary_support_part_count")) is int and assembly["temporary_support_part_count"] == 0
            and manifest["motion"].get("temporary_supports") == "NONE"
            and all(part.get("required_aids") == [] for part in parts.values()),
            "The actual source manifest still requires assembly aids")
    identity = geometry_sequence_identity(manifest)
    require(proof.get("geometry_sequence_identity_sha256") == identity,
            "Public root evidence does not bind the exact full geometry and source sequence")
    native = native_complete.get("whisker_root_native_validation")
    require(isinstance(native, dict) and native.get("result") == NATIVE_PASS
            and native.get("gravity_balance_result") == BALANCE_PASS
            and all(type(native.get(key)) is int and native[key] == 0 for key in ["external_aid_count", "assembly_aid_count"]),
            "The actual native root-contact or CAD static-balance checks have not passed")
    require(proof.get("native_root_contact_evidence_sha256") == canonical_sha(native),
            "Public root evidence differs from its fixed actual native check report")
    require(proof.get("actual_native_root_checks") == native,
            "Public actual-root checks differ from the canonical native report")
    modules = native.get("modules")
    public_modules = proof.get("modules")
    require(isinstance(modules, list) and bool(modules) and isinstance(public_modules, list),
            "Actual root module evidence is missing")
    by_id = {module["part_id"]: module for module in public_modules}
    require(len(by_id) == len(public_modules) == len(modules)
            and len({module["part_id"] for module in modules}) == len(modules),
            "Actual root module evidence is incomplete or duplicated")
    gravity = proof.get("gravity_balance")
    require(isinstance(gravity, dict) and gravity.get("result") == BALANCE_PASS
            and gravity.get("physical_mass_measured") is False and isinstance(gravity.get("modules"), list),
            "Public CAD balance must remain distinct from measured physical mass")
    gravity_by_id = {item["part_id"]: item for item in gravity["modules"]}
    require(len(gravity_by_id) == len(gravity["modules"]) == len(modules),
            "The public gravity record omits or duplicates a root module")
    sections = proof.get("root_structural_sections")
    require(isinstance(sections, list), "Actual BRep root-section evidence is missing")
    sections_by_id = {item["part_id"]: item for item in sections}
    require(len(sections_by_id) == len(sections) == len(modules),
            "Actual root-section evidence omits or duplicates a module")
    for module in modules:
        part_id = module["part_id"]
        require(part_id in parts and part_id in by_id and part_id in gravity_by_id and part_id in sections_by_id,
                "Native root evidence names an unknown actual part")
        part, public = parts[part_id], by_id[part_id]
        section = sections_by_id[part_id]
        slices = section.get("actual_brep_sections")
        require(section.get("type_id") == part["type_id"] and section.get("native_single_solid") is True
                and finite(section.get("minimum_true_root_roof_mm")) and section["minimum_true_root_roof_mm"] > 0
                and isinstance(slices, list) and bool(slices) and section.get("section_count") == len(slices)
                and section.get("material_strength_infill_layer_orientation") == "UNMEASURED"
                and isinstance(section.get("note"), str) and bool(section["note"].strip()),
                "A root lacks actual continuous BRep sections or overstates physical strength")
        for sample in slices:
            require(finite(sample.get("plane_x_mm")) and finite(sample.get("finite_slice_width_mm"))
                    and sample["finite_slice_width_mm"] > 0 and finite(sample.get("effective_solid_area_mm2"))
                    and sample["effective_solid_area_mm2"] > 0,
                    "An actual BRep root section is empty or invalid")
        require(finite(section.get("minimum_effective_section_area_mm2"))
                and math.isclose(section["minimum_effective_section_area_mm2"],
                                 min(sample["effective_solid_area_mm2"] for sample in slices), abs_tol=1e-6, rel_tol=0),
                "The reported minimum root section differs from the actual slice records")
        require(module.get("actual_single_solid") is True and module.get("native_root_type") == part["type_id"]
                and module.get("module_insertion_step") == part["step"]
                and public.get("type_id") == part["type_id"] and public.get("step") == part["step"]
                and public.get("physical_bottom_z_mm") == part["position_mm"][2]
                and public.get("receiving_body_stage_z_mm") == part["assembly_stage_z_mm"]
                and type(module.get("root_stud_count")) is int and module["root_stud_count"] > 0
                and vector(module.get("root_xy_span_mm"), 2) and all(value > 0 for value in module["root_xy_span_mm"]),
                "The actual root solid, type, placement, insertion step or contact span differs")
        supports = module.get("body_supports")
        require(isinstance(supports, list) and bool(supports), "A root module has no actual native body supports")
        supporting_ids = []
        for support in supports:
            lower = support.get("lower_part_id")
            offsets = support.get("insertion_offsets_mm")
            require(lower in parts and parts[lower]["step"] < part["step"]
                    and finite(support.get("native_bearing_mm2")) and support["native_bearing_mm2"] > 0
                    and finite(support.get("nominal_volume_overlap_mm3")) and 0 <= support["nominal_volume_overlap_mm3"] <= 1e-5
                    and isinstance(offsets, list) and bool(offsets) and all(finite(offset) and offset >= 0 for offset in offsets)
                    and any(offset > 0 for offset in offsets),
                    "A root support lacks actual positive bearing or upward-clearance samples")
            supporting_ids.append(lower)
        require(len(set(supporting_ids)) == len(supporting_ids)
                and set(supporting_ids) == set(public.get("actual_body_support_ids", []))
                and set(supporting_ids) <= set(part["support_ids"])
                and isinstance(public.get("root_contact_sites"), list) and bool(public["root_contact_sites"]),
                "Native and public actual root support IDs differ from the source assembly")
        balance = module["gravity_balance"]
        validate_balance(balance, part, parts)
        require(gravity_by_id[part_id] == {"part_id": part_id, **balance},
                "Public CAD balance differs from the actual fixed native report")
    return {
        "geometry_sequence_identity_sha256": identity,
        "native_root_contact_evidence_sha256": canonical_sha(native),
        "checked_root_modules": len(modules),
        "checked_actual_brep_sections": sum(len(item["actual_brep_sections"]) for item in sections),
        "nominal_body_overlap_tolerance_mm3": 1e-5,
        "gravity_balance_result": BALANCE_PASS,
        "physical_validation": "UNKNOWN",
        "physical_mass_measured": False,
    }
