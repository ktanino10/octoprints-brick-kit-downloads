import copy
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import test_density_root_evidence as root_fixtures
from density_root_evidence import canonical_sha, geometry_sequence_identity as mona_identity, validate_root_evidence
from density_body_support import (
    NATIVE_PASS, REVISION, SEQUENCE_MODE, geometry_sequence_identity, support_load_sets, validate_body_support_evidence,
)


class BodySupportEvidenceTests(unittest.TestCase):
    def fixture(self):
        manifest, old_native, proof = root_fixtures.RootEvidenceTests().fixture()
        case = "copilot-p120-support-free-v2"
        manifest.update(candidate_id=case, case_id=case, logical_case_id="copilot-p120", geometry_revision=REVISION)
        manifest["motion"]["sequence_mode"] = SEQUENCE_MODE
        root = manifest["parts"][1]
        root["type_id"] = "BS-UNIT-ONLY"
        root["position_mm"][2] = 1.6
        for part in manifest["parts"]:
            part.update(source_part_ids=[part["id"]], role="UNIT_ONLY_SOURCE_ROLE_NOT_A_REAL_MODEL")
        root["source_part_ids"] = ["UNIT-OLD-FRONT", "UNIT-OLD-INTERNAL"]
        manifest["types"] = {
            "UNIT-TYPE": {"kind": "brick", "body_mm": [8, 8, 4.8], "unit_only": True},
            "BS-UNIT-ONLY": {"kind": "stepped-root-module", "body_mm": [16, 16, 9.6], "unit_only": True,
                             "vertical_unit_mm": 1.6,
                             "body_slices": [{"bottom_unit": 0, "height_units": 3}, {"bottom_unit": 3, "height_units": 3}]},
        }
        manifest["assembly_support_load_cases"] = [{
            "support_part_id": root["id"], "payload_part_ids": ["UNIT-PAYLOAD"],
            "assumption": "UNIT ONLY. No actual native or physical qualification.",
        }]
        del manifest["whisker_load_cases"]
        report = old_native["whisker_root_native_validation"]
        report["result"] = NATIVE_PASS
        module = report["modules"][0]
        module.pop("native_root_type")
        module.update(native_support_type=root["type_id"], anchor_role="BODY_INTEGRATED_SUPPORT_ROOT",
                      module_position_mm=root["position_mm"], physical_bottom_z_mm=root["position_mm"][2],
                      receiving_body_stage_z_mm=root["assembly_stage_z_mm"], body_mm=[16, 16, 9.6])
        module["body_supports"][0]["insertion_offsets_mm"] = [2.1, 1, 0.3, 0]
        native = {"assembly_support_native_validation": report, "temporary_aids": []}
        proof.update(case_id=case, logical_case_id="copilot-p120", geometry_revision=REVISION, actual_types=2)
        proof["modules"][0].update(type_id=root["type_id"], physical_bottom_z_mm=root["position_mm"][2])
        proof["support_structural_sections"] = proof.pop("root_structural_sections")
        proof["support_structural_sections"][0]["type_id"] = root["type_id"]
        proof["support_structural_sections"][0].update(section_count=3, actual_brep_sections=[
            {"section_axis": "x", "plane_x_mm": 0, "finite_slice_width_mm": 0.1,
             "effective_solid_area_mm2": 5, "definition": "UNIT ONLY actual X material slice"},
            {"section_axis": "y", "plane_y_mm": 0, "finite_slice_width_mm": 0.1,
             "effective_solid_area_mm2": 6, "definition": "UNIT ONLY actual Y material slice"},
            {"section_axis": "z-transition", "plane_z_mm": 4.8, "finite_slice_width_mm": 0.1,
             "effective_solid_area_mm2": 7, "definition": "UNIT ONLY actual stepped connection neck"},
        ])
        proof.pop("native_root_contact_evidence_sha256")
        proof.pop("actual_native_root_checks")
        self.bind(manifest, native, proof)
        return manifest, native, proof

    def bind(self, manifest, native, proof):
        report = native["assembly_support_native_validation"]
        proof["geometry_sequence_identity_sha256"] = geometry_sequence_identity(manifest)
        proof["native_support_contact_evidence_sha256"] = canonical_sha(report)
        proof["actual_native_support_checks"] = copy.deepcopy(report)
        proof["gravity_balance"]["modules"] = [
            {"part_id": item["part_id"], **copy.deepcopy(item["gravity_balance"])} for item in report["modules"]]

    def test_generic_contract_uses_fourteen_field_identity_and_keeps_actual_low_bottom(self):
        manifest, native, proof = self.fixture()
        result = validate_body_support_evidence(proof, manifest, native)
        self.assertEqual(result["checked_support_modules"], 1)
        self.assertEqual(result["native_result"], NATIVE_PASS)
        self.assertEqual(result["physical_validation"], "UNKNOWN")
        self.assertEqual(manifest["parts"][1]["position_mm"][2], 1.6)
        self.assertEqual(manifest["parts"][1]["assembly_stage_z_mm"], 4.8)
        sparse = copy.deepcopy(manifest)
        del sparse["parts"][0]["source_part_ids"]
        del sparse["parts"][2]["source_part_ids"]
        self.assertEqual(geometry_sequence_identity(sparse), geometry_sequence_identity(manifest))
        for field in ["source_part_ids", "role"]:
            changed = copy.deepcopy(manifest)
            changed["parts"][1][field] = ["DIFFERENT"] if field == "source_part_ids" else "renamed-support"
            self.assertNotEqual(geometry_sequence_identity(changed), geometry_sequence_identity(manifest))
            with self.assertRaises(ValueError):
                validate_body_support_evidence(proof, changed, native)

    def test_mona_identity_and_native_contract_are_not_reinterpreted(self):
        manifest, native, proof = root_fixtures.RootEvidenceTests().fixture()
        before = mona_identity(manifest)
        self.fixture()
        self.assertEqual(mona_identity(manifest), before)
        self.assertEqual(validate_root_evidence(proof, manifest, native)["checked_root_modules"], 1)
        with self.assertRaises(ValueError):
            validate_body_support_evidence(proof, manifest, native)

    def test_flat_actual_module_has_xy_sections_without_an_invented_z_neck(self):
        manifest, native, proof = self.fixture()
        manifest["types"]["BS-UNIT-ONLY"]["body_slices"] = [{"bottom_unit": 0, "height_units": 3}]
        manifest["types"]["BS-UNIT-ONLY"]["body_mm"][2] = 4.8
        native["assembly_support_native_validation"]["modules"][0]["body_mm"][2] = 4.8
        section = proof["support_structural_sections"][0]
        section["actual_brep_sections"] = section["actual_brep_sections"][:2]
        section["section_count"] = 2
        self.bind(manifest, native, proof)
        result = validate_body_support_evidence(proof, manifest, native)
        self.assertEqual(result["checked_actual_brep_sections"], 2)
        section["actual_brep_sections"].append({"section_axis": "z-transition", "plane_z_mm": 4.8,
            "finite_slice_width_mm": 0.05, "effective_solid_area_mm2": 8, "definition": "Invented plane"})
        section["section_count"] = 3
        with self.assertRaises(ValueError):
            validate_body_support_evidence(proof, manifest, native)

    def test_exclusive_loads_stop_after_the_first_shared_receiver_but_never_reset_at_a_new_root(self):
        def part(identifier, root, supports):
            return {"id": identifier, "type_id": "BS" if root else "BR", "support_ids": supports}
        manifest = {"types": {"BS": {"kind": "stepped-root-module"}, "BR": {"kind": "brick"}}, "parts": [
            part("floor", False, []), part("root-a", True, ["floor"]),
            part("exclusive", False, ["root-a"]), part("shared", False, ["exclusive", "floor"]),
            part("root-b", True, ["shared"]), part("payload-b", False, ["root-b"]),
        ]}
        self.assertEqual(support_load_sets(manifest), {"root-a": ["exclusive", "shared"], "root-b": ["payload-b"]})
        manifest["parts"][4]["support_ids"] = ["exclusive"]
        with self.assertRaisesRegex(ValueError, "exclusive"):
            support_load_sets(manifest)

    def test_status_flags_cannot_replace_native_geometry_receiver_sections_or_all_load_prefixes(self):
        for change in [
            lambda m, n, p: n["assembly_support_native_validation"].update(result="PENDING"),
            lambda m, n, p: n["assembly_support_native_validation"]["modules"][0].update(actual_single_solid=False),
            lambda m, n, p: n["assembly_support_native_validation"]["modules"][0].update(module_position_mm=[0, 0, 16]),
            lambda m, n, p: n["assembly_support_native_validation"]["modules"][0].update(anchor_role="WHISKER_ROOT_MODULE"),
            lambda m, n, p: n["assembly_support_native_validation"]["modules"][0]["body_supports"][0].update(nominal_volume_overlap_mm3=1),
            lambda m, n, p: n["assembly_support_native_validation"]["modules"][0]["body_supports"][0].update(insertion_offsets_mm=[0]),
            lambda m, n, p: p["support_structural_sections"][0].update(minimum_true_root_roof_mm=0.8),
            lambda m, n, p: p["support_structural_sections"].clear(),
            lambda m, n, p: p["support_structural_sections"][0]["actual_brep_sections"][2].update(section_axis="x"),
            lambda m, n, p: p["support_structural_sections"][0]["actual_brep_sections"][2].update(effective_solid_area_mm2=0),
            lambda m, n, p: n["assembly_support_native_validation"]["modules"][0]["gravity_balance"]["assembly_prefix_checks"][-1].update(minimum_support_margin_mm=-12.5),
            lambda m, n, p: n["assembly_support_native_validation"]["modules"][0]["gravity_balance"].update(required_margin_mm=0.1),
            lambda m, n, p: m["assembly_support_load_cases"][0].update(payload_part_ids=[]),
            lambda m, n, p: m["parts"][1].update(insertion_predecessor_ids=["UNIT-PAYLOAD"]),
            lambda m, n, p: m["parts"][1].update(required_aids=["hidden-aid"]),
        ]:
            manifest, native, proof = self.fixture()
            change(manifest, native, proof)
            self.bind(manifest, native, proof)
            with self.assertRaises(ValueError):
                validate_body_support_evidence(proof, manifest, native)


if __name__ == "__main__":
    unittest.main()
