"""Validate the new Copilot body-support contract without changing Mona's existing identity."""

import math
import re

from density_root_evidence import (
    BALANCE_PASS, canonical_sha, finite, require, validate_balance, vector,
)

REVISION = "body-support-v2"
SEQUENCE_MODE = "BODY_FIRST_INTERNAL_SUPPORT"
NATIVE_PASS = "PASS_ACTUAL_BODY_SUPPORT_BREP_CONTACTS"
PART_FIELDS = (
    "id", "type_id", "color_id", "position_mm", "rotation_z_deg", "step", "support_ids", "required_aids",
    "assembly_stage_z_mm", "assembly_course", "insertion_predecessor_ids", "radial_offset_mm",
    "source_part_ids", "role",
)


def support_identity(identifier):
    match = re.fullmatch(r"(copilot-p(?:120|150|200|300))-support-free-v2", str(identifier))
    require(match is not None, "Only the four explicit new Copilot revisions use the body-support contract")
    return match[1]


def geometry_sequence_identity(manifest):
    require(manifest.get("geometry_revision") == REVISION
            and manifest["motion"].get("sequence_mode") == SEQUENCE_MODE,
            "Unsupported body-support geometry or sequence mode")
    return canonical_sha({
        "geometry_revision": manifest["geometry_revision"],
        "parts": [[part.get(field, [part["id"]]) if field == "source_part_ids" else part[field]
                   for field in PART_FIELDS] for part in manifest["parts"]],
        "types": manifest["types"], "palette": manifest["palette"],
        "motion_stages": manifest["motion"]["stages"], "sequence_mode": SEQUENCE_MODE,
        "assembly_support_load_cases": manifest["assembly_support_load_cases"],
    })


def validate_sequence(manifest):
    parts = manifest["parts"]
    require(bool(parts), "The actual body-support manifest has no parts")
    seen, previous = set(), None
    for step, part in enumerate(parts, 1):
        require(part["id"] not in seen and part["step"] == step and vector(part["position_mm"], 3)
                and finite(part.get("assembly_stage_z_mm")) and type(part.get("assembly_course")) is int
                and part["assembly_course"] >= 0 and part.get("required_aids") == [],
                "Body-support source identities, actual positions or assembly ranks are invalid")
        if previous:
            require(part["assembly_stage_z_mm"] >= previous["assembly_stage_z_mm"] - 1e-7
                    and part["assembly_course"] >= previous["assembly_course"]
                    and (part["assembly_course"] != previous["assembly_course"]
                         or abs(part["assembly_stage_z_mm"] - previous["assembly_stage_z_mm"]) <= 1e-7),
                    "Actual support stages/courses are not ordered from the receiving body upwards")
        for field in ["support_ids", "insertion_predecessor_ids"]:
            dependencies = part.get(field)
            require(isinstance(dependencies, list) and len(set(dependencies)) == len(dependencies)
                    and set(dependencies) <= seen, "A real support or insertion predecessor occurs too late")
        lineage = part.get("source_part_ids", [part["id"]])
        require(isinstance(lineage, list) and bool(lineage)
                and len(set(lineage)) == len(lineage)
                and all(isinstance(identifier, str) and identifier for identifier in lineage)
                and isinstance(part.get("role"), str) and bool(part["role"]),
                "Source-part lineage and physical role must be explicit in the new canonical identity")
        seen.add(part["id"]); previous = part
    next_step = 1
    stages = manifest["motion"]["stages"]
    require(isinstance(stages, list) and bool(stages), "Actual body-first stages are missing")
    for stage in stages:
        require(type(stage.get("start_step")) is int and stage["start_step"] == next_step
                and type(stage.get("end_step")) is int and next_step <= stage["end_step"] <= len(parts)
                and finite(stage.get("support_z_mm"))
                and abs(stage["support_z_mm"] - parts[next_step - 1]["assembly_stage_z_mm"]) <= 1e-7,
                "Body-support stages do not bind the actual sequence and receiving heights")
        next_step = stage["end_step"] + 1
    require(next_step == len(parts) + 1, "Body-support stages omit actual IDs")


def support_load_sets(manifest):
    modules = {part["id"] for part in manifest["parts"]
               if manifest["types"][part["type_id"]].get("kind") == "stepped-root-module"}
    exclusive, payloads = {}, {identifier: [] for identifier in modules}
    for part in manifest["parts"]:
        inherited = [exclusive[identifier] for identifier in part["support_ids"]]
        contributors = set(inherited) - {None}
        if part["id"] in modules:
            require(not contributors, "A new root would reset another root's exclusive downstream load path")
            exclusive[part["id"]] = part["id"]
            continue
        for identifier in contributors:
            payloads[identifier].append(part["id"])
        exclusive[part["id"]] = inherited[0] if inherited and inherited[0] is not None and len(set(inherited)) == 1 else None
    return payloads


def validate_body_support_evidence(proof, manifest, native_complete):
    identifier = manifest["candidate_id"]
    logical = support_identity(identifier)
    require(manifest.get("logical_case_id") == logical and manifest.get("geometry_revision") == REVISION,
            "Body-support data belongs to a different actual or logical revision")
    validate_sequence(manifest)
    parts = {part["id"]: part for part in manifest["parts"]}
    require(proof.get("schema_version") == 1 and proof.get("case_id") == identifier
            and proof.get("logical_case_id") == logical and proof.get("geometry_revision") == REVISION
            and proof.get("status") == "DIGITAL_SELF_SUPPORTING_UNTESTED"
            and proof.get("physical_validation") == "UNKNOWN"
            and proof.get("slicer_supports") == "UNKNOWN_SEPARATE_FROM_NO_ASSEMBLY_STANDS"
            and proof.get("actual_parts") == len(parts)
            and proof.get("actual_types") == len({part["type_id"] for part in parts.values()}),
            "The new proof has missing actual quantities or overstated physical approval")
    for key in ["external_aid_count", "assembly_aid_count", "floating_seed_steps", "blocked_vertical_body_columns"]:
        require(type(proof.get(key)) is int and proof[key] == 0, "A new body-support revision still has aids or invalid assembly steps")
    require(all(proof.get(key) is True for key in [
        "source_occupied_cells_unchanged", "source_visible_colors_unchanged", "body_first_all_steps_supported"]),
        "Body-support source occupancy, visible colors or supported insertion order is not preserved")
    assembly = manifest.get("assembly", {})
    require(assembly.get("assembly_aids") == [] and assembly.get("temporary_support_part_ids") == []
            and type(assembly.get("temporary_support_part_count")) is int and assembly["temporary_support_part_count"] == 0
            and manifest["motion"].get("temporary_supports") == "NONE" and native_complete.get("temporary_aids") == [],
            "Actual source/native structures still contain temporary aids")
    identity = geometry_sequence_identity(manifest)
    require(proof.get("geometry_sequence_identity_sha256") == identity,
            "Body-support proof does not bind the full fourteen-field source identity")
    native = native_complete.get("assembly_support_native_validation")
    require(isinstance(native, dict) and native.get("result") == NATIVE_PASS
            and native.get("gravity_balance_result") == BALANCE_PASS
            and all(type(native.get(key)) is int and native[key] == 0 for key in ["external_aid_count", "assembly_aid_count"])
            and proof.get("native_support_contact_evidence_sha256") == canonical_sha(native)
            and proof.get("actual_native_support_checks") == native,
            "The generic body-support native contact/balance record is missing or not exactly bound")
    collections = {
        "native": native.get("modules"), "public": proof.get("modules"),
        "sections": proof.get("support_structural_sections"),
        "gravity": proof.get("gravity_balance", {}).get("modules"),
    }
    maps = {}
    for name, entries in collections.items():
        require(isinstance(entries, list) and bool(entries), "A body-support evidence category has no actual modules")
        mapping = {item["part_id"]: item for item in entries}
        require(len(mapping) == len(entries), "A body-support evidence category duplicates an actual module")
        maps[name] = mapping
    module_ids = maps["native"].keys()
    require(all(mapping.keys() == module_ids for mapping in maps.values()),
            "Native contacts, sections, public modules and gravity do not cover the exact same set")
    actual_module_ids = {part["id"] for part in parts.values()
                         if manifest["types"][part["type_id"]].get("kind") == "stepped-root-module"}
    require(actual_module_ids == module_ids, "The evidence omits or adds a real body-integrated support module")
    loads = manifest.get("assembly_support_load_cases")
    require(isinstance(loads, list) and len(loads) == len(module_ids)
            and len({item["support_part_id"] for item in loads}) == len(loads),
            "The body-support load cases must identify each actual support module once")
    load_map = {item["support_part_id"]: item for item in loads}
    require(load_map.keys() == module_ids, "Actual native load cases and source support identities differ")
    computed_loads = support_load_sets(manifest)
    require(proof["gravity_balance"].get("result") == BALANCE_PASS
            and proof["gravity_balance"].get("physical_mass_measured") is False,
            "Nominal CAD balance is not measured physical mass or retention")
    section_count = 0
    for part_id, module in maps["native"].items():
        require(part_id in parts, "Native body-support evidence names an unknown actual part")
        part, public, section = parts[part_id], maps["public"][part_id], maps["sections"][part_id]
        require(part["type_id"].startswith("BS-") and module.get("native_support_type") == part["type_id"]
                and isinstance(part.get("source_part_ids"), list) and len(part["source_part_ids"]) > 1
                and module.get("anchor_role") == "BODY_INTEGRATED_SUPPORT_ROOT"
                and module.get("actual_single_solid") is True
                and module.get("module_insertion_step") == part["step"] and module.get("module_position_mm") == part["position_mm"]
                and module.get("physical_bottom_z_mm") == part["position_mm"][2]
                and module.get("receiving_body_stage_z_mm") == part["assembly_stage_z_mm"]
                and public.get("type_id") == part["type_id"] and public.get("step") == part["step"]
                and public.get("physical_bottom_z_mm") == part["position_mm"][2]
                and public.get("receiving_body_stage_z_mm") == part["assembly_stage_z_mm"]
                and type(module.get("root_stud_count")) is int and module["root_stud_count"] > 0
                and vector(module.get("root_xy_span_mm"), 2) and all(value > 0 for value in module["root_xy_span_mm"])
                and module.get("body_mm") == manifest["types"][part["type_id"]]["body_mm"],
                "Actual BS geometry, original body-bottom position, receiving stage or native insertion differs")
        supports = module.get("body_supports")
        require(isinstance(supports, list) and bool(supports), "The actual body-integrated module has no receiver contacts")
        ids = []
        for support in supports:
            lower = support.get("lower_part_id")
            require(lower in parts and parts[lower]["step"] < part["step"]
                    and finite(support.get("native_bearing_mm2")) and support["native_bearing_mm2"] > 0
                    and finite(support.get("nominal_volume_overlap_mm3")) and 0 <= support["nominal_volume_overlap_mm3"] <= 1e-5
                    and support.get("insertion_offsets_mm") == [2.1, 1, 0.3, 0],
                    "A native receiver lacks positive actual bearing, clearance or exact insertion samples")
            ids.append(lower)
        require(len(set(ids)) == len(ids) and set(ids) == set(public.get("actual_body_support_ids", []))
                and set(ids) <= set(part["support_ids"])
                and isinstance(public.get("root_contact_sites"), list) and bool(public["root_contact_sites"]),
                "Native receiver IDs differ from the public proof or source predecessor graph")
        slices = section.get("actual_brep_sections")
        require(section.get("type_id") == part["type_id"] and section.get("native_single_solid") is True
                and finite(section.get("minimum_true_root_roof_mm")) and section["minimum_true_root_roof_mm"] >= 1.6 - 1e-6
                and isinstance(slices, list) and bool(slices) and section.get("section_count") == len(slices)
                and section.get("material_strength_infill_layer_orientation") == "UNMEASURED",
                "Actual BS material sections or the nominal 1.6 mm roof evidence is missing")
        axes = set()
        geometry = manifest["types"][part["type_id"]]
        body_slices, unit = geometry.get("body_slices"), geometry.get("vertical_unit_mm")
        require(isinstance(body_slices, list) and bool(body_slices) and finite(unit) and unit > 0
                and all(type(item.get("bottom_unit")) is int and item["bottom_unit"] >= 0
                        and type(item.get("height_units")) is int and item["height_units"] > 0 for item in body_slices)
                and min(item["bottom_unit"] for item in body_slices) == 0,
                "Actual BS body slices must bind module-local material transitions")
        expected_necks = sorted({item["bottom_unit"] * unit for item in body_slices if item["bottom_unit"] > 0})
        measured_necks = []
        for sample in slices:
            axis = sample.get("section_axis")
            require(axis in {"x", "y", "z-transition"}, "A generic body-support section must declare its real measurement axis")
            plane = {"x": "plane_x_mm", "y": "plane_y_mm", "z-transition": "plane_z_mm"}[axis]
            require(finite(sample.get(plane)) and finite(sample.get("finite_slice_width_mm"))
                    and sample["finite_slice_width_mm"] > 0 and finite(sample.get("effective_solid_area_mm2"))
                    and sample["effective_solid_area_mm2"] > 0
                    and isinstance(sample.get("definition"), str) and bool(sample["definition"].strip()),
                    "An actual BS material section or stepped connection is empty or undefined")
            axes.add(axis)
            if axis == "z-transition":
                measured_necks.append(sample["plane_z_mm"])
        require({"x", "y"} <= axes and len(measured_necks) == len(expected_necks)
                and all(math.isclose(actual, expected, abs_tol=1e-6, rel_tol=0)
                        for actual, expected in zip(sorted(measured_necks), expected_necks)),
                "Actual X/Y sections and every geometry-defined stepped neck must be checked; flat modules have no invented neck")
        require(finite(section.get("minimum_effective_section_area_mm2"))
                and math.isclose(section["minimum_effective_section_area_mm2"],
                                 min(item["effective_solid_area_mm2"] for item in slices), rel_tol=0, abs_tol=1e-6),
                "The body-support minimum section differs from its actual native samples")
        section_count += len(slices)
        balance = module["gravity_balance"]
        validate_balance(balance, part, parts)
        require(maps["gravity"][part_id] == {"part_id": part_id, **balance},
                "Public nominal body-support balance differs from the fixed native report")
        load = load_map[part_id]
        payload_ids = load.get("payload_part_ids")
        require(isinstance(payload_ids, list) and len(set(payload_ids)) == len(payload_ids)
                and set(payload_ids) == {item["part_id"] for item in balance["downstream_payloads"]}
                and set(payload_ids) == set(computed_loads[part_id])
                and isinstance(load.get("assumption"), str) and bool(load["assumption"].strip()),
                "The source identity omits or alters a downstream CAD load")
    return {
        "geometry_sequence_identity_sha256": identity,
        "native_support_contact_evidence_sha256": canonical_sha(native),
        "checked_support_modules": len(module_ids), "checked_actual_brep_sections": section_count,
        "sequence_mode": SEQUENCE_MODE, "native_result": NATIVE_PASS,
        "root_dependency_result": "PASS_NO_EXCLUSIVE_ROOT_RESET",
        "gravity_balance_result": BALANCE_PASS, "physical_validation": "UNKNOWN", "physical_mass_measured": False,
    }
