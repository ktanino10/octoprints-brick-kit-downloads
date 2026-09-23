import copy
import gzip
import hashlib
import json
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from symmetry_evidence import (
    LOAD_MODE, NATIVE_SYMMETRY_PASS, SEQUENCE_MODE,
    decode_support_transport, geometry_sequence_identity, validate_native_pair_volumes, validate_part_pairs,
)


class SymmetryEvidenceTests(unittest.TestCase):
    def test_compressed_support_proof_preserves_exact_raw_identity_and_rejects_wrong_case_or_bytes(self):
        case = "copilot-p300-symmetric-v3"
        proof = {"case_id": case, "geometry_revision": "bilateral-symmetry-v3", "unit_only": True}
        raw = (json.dumps(proof) + "\n").encode()
        data = gzip.compress(raw, mtime=0)
        reference = {"path": f"validation/{case}-symmetry-support.json", "sha256": hashlib.sha256(raw).hexdigest()}
        transport = {"path": reference["path"] + ".gz", "encoding": "gzip", "bytes": len(data),
                     "sha256": hashlib.sha256(data).hexdigest(), "decoded_bytes": len(raw),
                     "decoded_sha256": reference["sha256"]}
        self.assertEqual(decode_support_transport(case, transport, reference, data), (proof, raw))
        for changes in [
            {"decoded_bytes": len(raw) - 1}, {"decoded_bytes": len(raw) + 1},
            {"decoded_sha256": "a" * 64}, {"path": reference["path"]},
            {"encoding": "identity"}, {"sha256": "b" * 64},
        ]:
            with self.assertRaises(ValueError):
                decode_support_transport(case, {**transport, **changes}, reference, data)
        with self.assertRaises(ValueError):
            decode_support_transport("copilot-p200-symmetric-v3", transport, reference, data)

    def parts(self):
        return [
            {"id": "L", "type_id": "LEFT", "color_id": "eye", "position_mm": [-8, -24, 16.0], "rotation_z_deg": 0},
            {"id": "R", "type_id": "RIGHT", "color_id": "eye", "position_mm": [8, -24, 16.0], "rotation_z_deg": 180},
            {"id": "C", "type_id": "CENTER", "color_id": "purple", "position_mm": [0, 0, 0], "rotation_z_deg": 0},
        ]

    def native(self, pairing):
        return {
            "result": NATIVE_SYMMETRY_PASS, "actual_part_count": pairing["actual_part_count"],
            "reflection_plane_x_mm": 0, "part_pairing_is_involution": True,
            "pose_pair_tolerance_mm": 0.00002, "physical_validation": "UNKNOWN",
            "type_rotation_pair_comparisons": [
                {"type_rotation_pair": list(pair), "whole_part_color_same": True,
                 "reflected_native_volume_mm3": 1000, "paired_native_volume_mm3": 1000,
                 "symmetric_difference_volume_mm3": 0, "tolerance_mm3": 0.0001}
                for pair in pairing["required_type_rotation_pairs"]
            ],
        }

    def test_complete_color_pose_bijection_requires_real_shape_measurements_separately(self):
        pairing = validate_part_pairs(self.parts(), {"L": "R", "R": "L", "C": "C"})
        self.assertEqual(pairing["distinct_nonself_part_pairs"], 1)
        self.assertEqual(pairing["self_mirror_parts"], 1)
        self.assertFalse(pairing["native_shape_or_contact_approval"])
        proof = validate_native_pair_volumes(self.native(pairing), pairing)
        self.assertEqual(proof["actual_native_type_rotation_pairs"], 2)
        self.assertEqual(proof["physical_validation"], "UNKNOWN")

    def test_missing_non_involutive_wrong_depth_or_recolored_parts_fail(self):
        for mapping in [{"L": "R", "R": "L"}, {"L": "R", "R": "C", "C": "L"}, {"L": "R", "R": "R", "C": "C"}]:
            with self.assertRaises(ValueError):
                validate_part_pairs(self.parts(), mapping)
        for change in [
            lambda rows: rows[1]["position_mm"].__setitem__(1, -16),
            lambda rows: rows[1]["position_mm"].__setitem__(2, 20.8),
            lambda rows: rows[1].update(color_id="blue"),
            lambda rows: rows[2]["position_mm"].__setitem__(0, 1),
        ]:
            parts = self.parts(); change(parts)
            with self.assertRaises(ValueError):
                validate_part_pairs(parts, {"L": "R", "R": "L", "C": "C"})

    def test_native_evidence_cannot_raise_tolerance_omit_pairs_or_invent_volumes(self):
        pairing = validate_part_pairs(self.parts(), {"L": "R", "R": "L", "C": "C"})
        for change in [
            lambda record: record["type_rotation_pair_comparisons"].pop(),
            lambda record: record["type_rotation_pair_comparisons"][0].update(tolerance_mm3=1),
            lambda record: record["type_rotation_pair_comparisons"][0].update(symmetric_difference_volume_mm3=0.01),
            lambda record: record["type_rotation_pair_comparisons"][0].update(reflected_native_volume_mm3=0),
            lambda record: record["type_rotation_pair_comparisons"][0].update(whole_part_color_same=False),
            lambda record: record["type_rotation_pair_comparisons"].append(copy.deepcopy(record["type_rotation_pair_comparisons"][0])),
        ]:
            record = self.native(pairing); change(record)
            with self.assertRaises(ValueError):
                validate_native_pair_volumes(record, pairing)

    def test_new_canonical_context_and_load_modes_cannot_reuse_old_unchanged_claims(self):
        parts = self.parts()
        for step, part in enumerate(parts, 1):
            part.update(step=step, support_ids=[], required_aids=[], assembly_stage_z_mm=step * 1.6,
                        assembly_course=step, insertion_predecessor_ids=[], radial_offset_mm=[1, 1, 1], role="UNIT_ONLY")
        parts[0]["mechanically_checked_support"] = True
        manifest = {
            "candidate_id": "copilot-p300-symmetric-v3", "logical_case_id": "copilot-p300",
            "geometry_revision": "bilateral-symmetry-v3", "support_load_mode": LOAD_MODE,
            "parts": parts, "types": {"unit_only": True}, "palette": {"unit_only": True},
            "motion": {"sequence_mode": SEQUENCE_MODE, "stages": []},
            "mechanically_checked_support_ids": ["L"],
            "assembly_support_load_cases": [{"support_part_id": "L", "payload_part_ids": ["R", "C"]}],
            "symmetry_context": {"unit_only": True, "intentional_changes_from_published_case": True},
        }
        before = geometry_sequence_identity(manifest)
        changed = copy.deepcopy(manifest)
        changed["symmetry_context"]["intentional_changes_from_published_case"] = False
        self.assertNotEqual(geometry_sequence_identity(changed), before)
        changed = copy.deepcopy(manifest); changed["parts"][0]["position_mm"][2] = 16
        self.assertNotEqual(geometry_sequence_identity(changed), before)
        changed = copy.deepcopy(manifest); changed["parts"][0]["source_part_ids"] = ["L"]
        self.assertEqual(geometry_sequence_identity(changed), before)
        changed["assembly_support_load_cases"][0]["payload_part_ids"].reverse()
        with self.assertRaises(ValueError):
            geometry_sequence_identity(changed)


if __name__ == "__main__":
    unittest.main()
