import copy
import csv
import io
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from density_comparison_evidence import COLUMNS, verify_comparison_csv


class ComparisonCSVTests(unittest.TestCase):
    def fixture(self):
        baselines = {"mona": 12435, "copilot": 17873, "ducky": 9669}
        catalog = {"baselines": {name: {"metrics": {"part_count": count}} for name, count in baselines.items()},
                   "reference_revisions": {"mona": {"metrics": {"part_count": 12411}}}, "cases": []}
        rows = []
        for character, baseline in baselines.items():
            for percentage in [120, 150, 200, 300, 400]:
                target = (baseline * percentage + 50) // 100
                logical = f"{character}-p{percentage}"
                case = {
                    "id": logical + ("-root-v2" if character == "mona" else ""), "logical_case_id": logical,
                    "geometry_revision": "whisker-root-v2" if character == "mona" else "original-matrix",
                    "character": character, "count_percentage": percentage, "state": "READY",
                    "metrics": {"part_count": target, "unique_types": 100, "one_by_one_exceptions": 3,
                                "grip_long_ge_15_8_count": target - 3, "dimensions_mm": [400.2, 350.2, 370.2]},
                    "source_manifest_sha256": "a" * 64,
                }
                if character == "mona":
                    case["whisker_support"] = {
                        "external_aid_count": 0, "assembly_aid_count": 0, "status": "DIGITAL_SELF_SUPPORTING_UNTESTED",
                        "physical_validation": "UNKNOWN", "geometry_revision": "whisker-root-v2",
                        "manifest_sha256": "a" * 64, "attachment_evidence_sha256": "b" * 64,
                        "sequence_evidence_sha256": "c" * 64, "all_categories_geometry_match": True,
                    }
                catalog["cases"].append(case)
                rows.append(dict(zip(COLUMNS, [
                    case["id"], logical, case["geometry_revision"], character, percentage / 100,
                    baseline, 12411 if character == "mona" else baseline, target, target, target / baseline, 0,
                    400.2, 350.2, 370.2, 100, 3, (target - 3) / target,
                ], strict=True)))
        return catalog, rows

    def encode(self, rows):
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=COLUMNS)
        writer.writeheader(); writer.writerows(rows)
        return output.getvalue().encode()

    def test_final_csv_matches_all_actual_cases_and_separates_reference_from_fixed_denominator(self):
        catalog, rows = self.fixture()
        result = verify_comparison_csv(self.encode(rows), catalog)
        self.assertEqual(result["rows"], 15)
        self.assertFalse(result["references_counted_as_cases"])
        self.assertEqual(rows[0]["baseline_count"], 12435)
        self.assertEqual(rows[0]["actual_reference_count"], 12411)

    def test_final_csv_rejects_proxy_counts_dimensions_references_and_unready_cases(self):
        for change in [
            lambda rows: rows[0].update(baseline_count=12411),
            lambda rows: rows[0].update(actual_reference_count=12435),
            lambda rows: rows[0].update(actual_count=14936),
            lambda rows: rows[0].update(width_mm=800.4),
            lambda rows: rows[0].update(actual_ratio=float("nan")),
            lambda rows: rows.append(copy.deepcopy(rows[0])),
            lambda rows: rows[0].update(case_id="mona-fine8-base-root-v2"),
        ]:
            catalog, rows = self.fixture(); change(rows)
            with self.assertRaises(ValueError):
                verify_comparison_csv(self.encode(rows), catalog)
        catalog, rows = self.fixture()
        catalog["cases"][0]["state"] = "INPUT_WAIT"
        with self.assertRaises(ValueError):
            verify_comparison_csv(self.encode(rows), catalog)


if __name__ == "__main__":
    unittest.main()
