import csv
import io
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tools"))
from mona_study_evidence import actual_metrics, verify_manifest_bom, verify_reference_identity


class MonaEvidenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.references = {}
        for role, directory in [
            ("fine-c", ROOT / "artifacts/phase1/mona-fine"),
            ("current-r3", ROOT / "artifacts/revisions/r3-8mm-20260920/mona-practical8"),
        ]:
            cls.references[role] = ((directory / "manifest.json").read_bytes(), (directory / "bom.csv").read_bytes())

    def test_preserved_actual_manifests_and_boms_agree_across_both_schemas(self):
        for role, count, types, small, layers, minima in [
            ("fine-c", 13837, 7, 1766, 75, [3.82, 3.82, 2.28]),
            ("current-r3", 519, 68, 5, 20, [7.8, 7.8, 3.2]),
        ]:
            report = verify_manifest_bom(*self.references[role])
            self.assertEqual(report["metrics"]["part_count"], count)
            self.assertEqual(report["metrics"]["unique_types"], types)
            self.assertEqual(report["metrics"]["one_by_one_exceptions"], small)
            self.assertEqual(report["metrics"]["layer_count"], layers)
            self.assertEqual(report["metrics"]["minimum_part_mm"], minima)
            self.assertEqual(report["counted_instances"], count)
            self.assertTrue(report["bom_types_colors_poses_steps_match"])
            self.assertNotIn("/Users/", json.dumps(report))

    def test_reference_clone_can_rename_candidate_but_not_geometry_or_instance_identity(self):
        original = json.loads(self.references["fine-c"][0])
        clone = json.loads(self.references["fine-c"][0])
        clone["candidate_id"] = "unit-only-reference-alias"
        self.assertTrue(verify_reference_identity(clone, original))
        clone["parts"][0]["position_mm"][0] += 0.001
        with self.assertRaisesRegex(ValueError, "reference IDs"):
            verify_reference_identity(clone, original)
        clone = json.loads(self.references["fine-c"][0])
        clone["types"][clone["parts"][0]["type_id"]]["body_mm"][0] += 0.1
        with self.assertRaisesRegex(ValueError, "reference IDs"):
            verify_reference_identity(clone, original)

    def test_bom_changes_cannot_pass_as_matching_actual_evidence(self):
        manifest, csv_bytes = self.references["current-r3"]
        reader = csv.DictReader(io.StringIO(csv_bytes.decode()))
        columns = reader.fieldnames
        rows = list(reader)
        for field, value in [
            ("part_id", rows[1]["part_id"]), ("type_id", "unit-wrong-type"),
            ("color_id", "unit-wrong-color"), ("hex", "#123456"),
            ("bottom_z_mm", "12345"), ("body_height_mm", "9.6"), ("step", "12345"),
        ]:
            changed = [dict(row) for row in rows]
            changed[0][field] = value
            output = io.StringIO(newline="")
            writer = csv.DictWriter(output, fieldnames=columns)
            writer.writeheader()
            writer.writerows(changed)
            with self.assertRaises(ValueError, msg=field):
                verify_manifest_bom(manifest, output.getvalue().encode())

    def test_minimum_dimensions_are_independent_and_layers_are_counted_not_inferred_from_max_index(self):
        manifest = json.loads(self.references["current-r3"][0])
        actual = actual_metrics(manifest)
        self.assertEqual(actual["layer_count"], 20)
        self.assertNotEqual(actual["layer_count"], max(part["layer"] for part in manifest["parts"]) + 1)
        self.assertEqual(actual["grip_long_ge_15_8_count"], 514)
        duplicate = json.loads(self.references["current-r3"][0])
        duplicate["parts"].append(dict(duplicate["parts"][0]))
        with self.assertRaisesRegex(ValueError, "Duplicate"):
            actual_metrics(duplicate)
        bad = json.loads(self.references["current-r3"][0])
        bad["parts"][0]["position_mm"][2] = float("nan")
        with self.assertRaisesRegex(ValueError, "placement"):
            actual_metrics(bad)


if __name__ == "__main__":
    unittest.main()
