import copy
import hashlib
import json
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from density_root_evidence import (
    BALANCE_PASS, MODULE_BALANCE_PASS, NATIVE_PASS, canonical_bytes, canonical_sha,
    geometry_sequence_identity, validate_root_evidence,
)
from stage_density_case import root_validation_path


class RootEvidenceTests(unittest.TestCase):
    def fixture(self):
        case = "mona-p120-root-v2"
        parts = []
        for index, (name, z, stage, supports) in enumerate([
            ("UNIT-BODY", 0, 0, []), ("UNIT-ROOT", -2, 4.8, ["UNIT-BODY"]),
            ("UNIT-PAYLOAD", 4.8, 9.6, ["UNIT-ROOT"]),
        ], start=1):
            parts.append({
                "id": name, "type_id": "UNIT-TYPE", "color_id": "unit", "position_mm": [0, 0, z],
                "rotation_z_deg": 0, "step": index, "support_ids": supports, "required_aids": [],
                "assembly_stage_z_mm": stage, "assembly_course": index - 1,
                "insertion_predecessor_ids": supports, "radial_offset_mm": [index, index, 1],
            })
        manifest = {
            "candidate_id": case, "case_id": case, "logical_case_id": "mona-p120",
            "geometry_revision": "whisker-root-v2", "assembly_aids": [], "parts": parts,
            "assembly": {"assembly_aids": [], "temporary_support_part_ids": [], "temporary_support_part_count": 0},
            "types": {"UNIT-TYPE": {"unit_only": True}}, "palette": {"unit": {"name": "試験専用"}},
            "motion": {"sequence_mode": "BODY_FIRST_ROOT_ANCHORED", "temporary_supports": "NONE", "stages": [
                {"stage_id": "unit-base", "start_step": 1, "end_step": 3, "support_z_mm": 0}]},
            "whisker_load_cases": {"UNIT-ROOT": ["UNIT-PAYLOAD"]},
        }
        balance = {
            "result": MODULE_BALANCE_PASS, "minimum_support_margin_mm": 2.0, "required_margin_mm": 1.0,
            "actual_bearing_hull_xy_mm": [[-2, -2], [2, -2], [2, 2], [-2, 2]],
            "root_cad_volume_mm3": 100.0, "root_cad_centroid_mm": [0, 0, 1],
            "downstream_payloads": [{"part_id": "UNIT-PAYLOAD", "cad_volume_mm3": 10.0, "cad_centroid_mm": [0, 0, 5]}],
            "assembly_prefix_checks": [
                {"after_step": 2, "added_part_id": "UNIT-ROOT", "minimum_support_margin_mm": 2.0},
                {"after_step": 3, "added_part_id": "UNIT-PAYLOAD", "minimum_support_margin_mm": 2.0},
            ],
            "assumptions": "UNIT ONLY. Uniform nominal CAD density.",
            "not_validated": "UNIT ONLY. No measured printed mass or retention force.",
        }
        native = {
            "result": NATIVE_PASS, "gravity_balance_result": BALANCE_PASS,
            "external_aid_count": 0, "assembly_aid_count": 0, "modules": [{
                "part_id": "UNIT-ROOT", "native_root_type": "UNIT-TYPE", "actual_single_solid": True,
                "root_stud_count": 4, "root_xy_span_mm": [8, 8], "module_insertion_step": 2,
                "body_supports": [{"lower_part_id": "UNIT-BODY", "native_bearing_mm2": 20.0,
                                   "nominal_volume_overlap_mm3": 0.0, "insertion_offsets_mm": [0, 1, 3]}],
                "gravity_balance": balance,
            }],
        }
        proof = {
            "schema_version": 1, "case_id": case, "logical_case_id": "mona-p120", "geometry_revision": "whisker-root-v2",
            "status": "DIGITAL_SELF_SUPPORTING_UNTESTED", "external_aid_count": 0, "assembly_aid_count": 0,
            "actual_parts": 3, "actual_types": 1, "physical_validation": "UNKNOWN",
            "slicer_supports": "UNKNOWN_SEPARATE_FROM_NO_ASSEMBLY_STANDS",
            "source_occupied_cells_unchanged": True, "source_visible_colors_unchanged": True,
            "body_first_all_steps_supported": True, "floating_seed_steps": 0, "blocked_vertical_body_columns": 0,
            "modules": [{"part_id": "UNIT-ROOT", "type_id": "UNIT-TYPE", "step": 2,
                         "physical_bottom_z_mm": -2, "receiving_body_stage_z_mm": 4.8,
                         "actual_body_support_ids": ["UNIT-BODY"], "root_contact_sites": [[0, 0]]}],
            "gravity_balance": {"result": BALANCE_PASS, "physical_mass_measured": False,
                                "modules": [{"part_id": "UNIT-ROOT", **copy.deepcopy(balance)}]},
            "root_structural_sections": [{
                "part_id": "UNIT-ROOT", "type_id": "UNIT-TYPE", "native_single_solid": True,
                "minimum_true_root_roof_mm": 1.6, "section_count": 1, "minimum_effective_section_area_mm2": 5,
                "actual_brep_sections": [{"plane_x_mm": 0, "finite_slice_width_mm": 0.1, "effective_solid_area_mm2": 5}],
                "material_strength_infill_layer_orientation": "UNMEASURED", "note": "UNIT ONLY. No physical strength claim.",
            }],
            "geometry_sequence_identity_sha256": geometry_sequence_identity(manifest),
            "native_root_contact_evidence_sha256": canonical_sha(native),
            "actual_native_root_checks": copy.deepcopy(native),
        }
        return manifest, {"whisker_root_native_validation": native}, proof

    def test_canonical_serialization_is_ascii_escaped_and_preserves_source_numeric_types(self):
        self.assertEqual(canonical_bytes({"日本語": 1.0, "a": [1, 2]}),
                         b'{"a":[1,2],"\\u65e5\\u672c\\u8a9e":1.0}')
        self.assertNotEqual(canonical_sha({"number": 1}), canonical_sha({"number": 1.0}))
        with self.assertRaises(ValueError):
            canonical_bytes({"number": float("nan")})
        manifest, _, _ = self.fixture()
        changed = copy.deepcopy(manifest)
        changed["parts"].reverse()
        self.assertNotEqual(geometry_sequence_identity(manifest), geometry_sequence_identity(changed))

    def test_only_exact_source_geometry_sequence_and_native_balance_can_validate(self):
        manifest, native, proof = self.fixture()
        result = validate_root_evidence(proof, manifest, native)
        self.assertEqual(result["checked_root_modules"], 1)
        self.assertEqual(result["checked_actual_brep_sections"], 1)
        self.assertEqual(result["physical_validation"], "UNKNOWN")
        self.assertFalse(result["physical_mass_measured"])
        for field in ["position_mm", "radial_offset_mm"]:
            changed = copy.deepcopy(manifest)
            changed["parts"][1][field][0] += 1
            with self.assertRaisesRegex(ValueError, "geometry"):
                validate_root_evidence(proof, changed, native)
        changed = copy.deepcopy(native)
        changed["whisker_root_native_validation"]["modules"][0]["actual_single_solid"] = False
        with self.assertRaisesRegex(ValueError, "native check report"):
            validate_root_evidence(proof, manifest, changed)

    def test_failed_or_missing_balance_cannot_be_relabelled_as_digital_self_supporting(self):
        for change in [
            lambda row: row.update(result="PENDING"),
            lambda row: row.update(required_margin_mm=0),
            lambda row: row.update(root_cad_centroid_mm=[3, 0, 1]),
            lambda row: row.update(actual_bearing_hull_xy_mm=[[0, 0], [1, 0], [2, 0]]),
            lambda row: row["assembly_prefix_checks"].pop(),
            lambda row: row["assembly_prefix_checks"][1].update(minimum_support_margin_mm=0.9),
            lambda row: row.update(minimum_support_margin_mm=1.5),
            lambda row: row.update(not_validated=""),
        ]:
            manifest, native, proof = self.fixture()
            report = native["whisker_root_native_validation"]
            change(report["modules"][0]["gravity_balance"])
            proof["native_root_contact_evidence_sha256"] = canonical_sha(report)
            proof["actual_native_root_checks"] = copy.deepcopy(report)
            proof["gravity_balance"]["modules"] = [{"part_id": "UNIT-ROOT", **copy.deepcopy(report["modules"][0]["gravity_balance"])}]
            with self.assertRaises(ValueError):
                validate_root_evidence(proof, manifest, native)

    def test_public_validation_is_selected_only_from_the_exact_authorized_light_bytes(self):
        manifest, _, proof = self.fixture()
        path = "validation/mona-p120-root-v2-whisker-support.json"
        raw = json.dumps(proof).encode()
        summary = {key: manifest[key] for key in ["logical_case_id", "geometry_revision"]}
        summary["whisker_support"] = {"assembly_validation_ref": {
            "path": path, "sha256": hashlib.sha256(raw).hexdigest()}}
        self.assertEqual(root_validation_path(manifest["candidate_id"], summary, manifest, {path: raw}), path)
        with self.assertRaises(ValueError):
            root_validation_path(manifest["candidate_id"], summary, manifest, {})
        with self.assertRaises(ValueError):
            root_validation_path(manifest["candidate_id"], summary, manifest, {path: raw + b" "})
        changed = copy.deepcopy(manifest)
        changed["parts"][1]["required_aids"] = ["hidden-support"]
        with self.assertRaises(ValueError):
            root_validation_path(manifest["candidate_id"], summary, changed, {path: raw})

    def test_actual_sections_and_native_clearance_cannot_be_replaced_by_a_status_flag(self):
        for change in [
            lambda native, proof: proof["root_structural_sections"].clear(),
            lambda native, proof: proof["root_structural_sections"][0].update(minimum_effective_section_area_mm2=10),
            lambda native, proof: proof["root_structural_sections"][0]["actual_brep_sections"][0].update(effective_solid_area_mm2=0),
            lambda native, proof: native["whisker_root_native_validation"]["modules"][0]["body_supports"][0].update(nominal_volume_overlap_mm3=1),
        ]:
            manifest, native, proof = self.fixture()
            change(native, proof)
            proof["native_root_contact_evidence_sha256"] = canonical_sha(native["whisker_root_native_validation"])
            proof["actual_native_root_checks"] = copy.deepcopy(native["whisker_root_native_validation"])
            with self.assertRaises(ValueError):
                validate_root_evidence(proof, manifest, native)

    def test_a_third_failed_root_is_not_hidden_by_two_passing_whisker_modules(self):
        manifest, native, proof = self.fixture()
        body_template, root_template, payload_template = copy.deepcopy(manifest["parts"])
        native_template = copy.deepcopy(native["whisker_root_native_validation"]["modules"][0])
        public_template = copy.deepcopy(proof["modules"][0])
        section_template = copy.deepcopy(proof["root_structural_sections"][0])
        bodies, roots, payloads = [], [], []
        native_modules, public_modules, sections, gravity_modules = [], [], [], []
        manifest["whisker_load_cases"] = {}
        for index in range(3):
            body_id, root_id, payload_id = f"UNIT-BODY-{index}", f"UNIT-ROOT-{index}", f"UNIT-PAYLOAD-{index}"
            bodies.append({**copy.deepcopy(body_template), "id": body_id, "step": index + 1})
            roots.append({**copy.deepcopy(root_template), "id": root_id, "step": index + 4,
                          "support_ids": [body_id], "insertion_predecessor_ids": [body_id]})
            payloads.append({**copy.deepcopy(payload_template), "id": payload_id, "step": index + 7,
                             "support_ids": [root_id], "insertion_predecessor_ids": [root_id]})
            manifest["whisker_load_cases"][root_id] = [payload_id]
            module = copy.deepcopy(native_template)
            module.update(part_id=root_id, module_insertion_step=index + 4)
            module["body_supports"][0]["lower_part_id"] = body_id
            module["gravity_balance"]["downstream_payloads"][0]["part_id"] = payload_id
            module["gravity_balance"]["assembly_prefix_checks"][0].update(after_step=index + 4, added_part_id=root_id)
            module["gravity_balance"]["assembly_prefix_checks"][1].update(after_step=index + 7, added_part_id=payload_id)
            native_modules.append(module)
            public_modules.append({**copy.deepcopy(public_template), "part_id": root_id, "step": index + 4,
                                   "actual_body_support_ids": [body_id]})
            sections.append({**copy.deepcopy(section_template), "part_id": root_id})
            gravity_modules.append({"part_id": root_id, **copy.deepcopy(module["gravity_balance"])})
        manifest["parts"] = bodies + roots + payloads
        manifest["motion"]["stages"][0]["end_step"] = 9
        native["whisker_root_native_validation"]["modules"] = native_modules
        proof.update(actual_parts=9, modules=public_modules, root_structural_sections=sections,
                     geometry_sequence_identity_sha256=geometry_sequence_identity(manifest),
                     native_root_contact_evidence_sha256=canonical_sha(native["whisker_root_native_validation"]),
                     actual_native_root_checks=copy.deepcopy(native["whisker_root_native_validation"]))
        proof["gravity_balance"]["modules"] = gravity_modules
        self.assertEqual(validate_root_evidence(proof, manifest, native)["checked_root_modules"], 3)
        native_modules[2]["gravity_balance"]["assembly_prefix_checks"][-1]["minimum_support_margin_mm"] = -5.13
        proof["native_root_contact_evidence_sha256"] = canonical_sha(native["whisker_root_native_validation"])
        proof["actual_native_root_checks"] = copy.deepcopy(native["whisker_root_native_validation"])
        proof["gravity_balance"]["modules"][2] = {"part_id": "UNIT-ROOT-2", **copy.deepcopy(native_modules[2]["gravity_balance"])}
        with self.assertRaisesRegex(ValueError, "assembly prefix"):
            validate_root_evidence(proof, manifest, native)


if __name__ == "__main__":
    unittest.main()
