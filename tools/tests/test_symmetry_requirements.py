import copy
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tools"))
from symmetry_requirements import symmetry_identity, validate_symmetry_receipt
from density_requirements import artifact_identity, case_identity


class SymmetryReceiptTests(unittest.TestCase):
    def fixture(self):
        record = json.loads((ROOT / "archive/copilot-symmetry-revision.json").read_text())
        record.update(state="PARTIAL", published_verified_case_count=0,
                      verification={"public_browser_passed": False, "anonymous_downloads_passed": False})
        record.pop("comparisons", None)
        for row in record["cases"]:
            row["status"] = "INPUT_WAIT"
            for key in ["actual_case_id", "source_commit", "actual_count", "symmetry_evidence", "mechanical_evidence", "downloads"]:
                row[key] = None
            row["verification"] = {"public_browser_passed": False, "anonymous_downloads_passed": False}
        return record

    def test_unreceived_corrections_remain_separate_from_prior_complete_work(self):
        record = self.fixture()
        self.assertEqual(validate_symmetry_receipt(record), record)
        validate_symmetry_receipt(json.loads((ROOT / "archive/copilot-symmetry-revision.json").read_text()))
        self.assertEqual(len(record["cases"]), 5)
        self.assertEqual(symmetry_identity("copilot-p400-symmetric-v3"), ("copilot-p400", 400))
        self.assertEqual(artifact_identity("copilot-p400-symmetric-v3"), ("copilot-p400", "bilateral-symmetry-v3"))
        with self.assertRaises(ValueError):
            case_identity("copilot-p400-symmetric-v3")
        with self.assertRaises(ValueError):
            artifact_identity("mona-p400-symmetric-v3")
        for identifier in ["copilot-p400", "copilot-p300-support-free-v2", "mona-p300-symmetric-v3"]:
            with self.assertRaises(ValueError):
                symmetry_identity(identifier)

    def test_counts_mock_images_or_success_flags_cannot_stand_in_for_real_symmetry_evidence(self):
        for change in [
            lambda record: record.update(state="READY"),
            lambda record: record.update(published_verified_case_count=1),
            lambda record: record["cases"][0].update(actual_count=21382),
            lambda record: record["cases"][0].update(status="READY"),
            lambda record: record["cases"][0].update(source_commit="a" * 40),
            lambda record: record["verification"].update(public_browser_passed=True),
            lambda record: record["requirements"].update(minimum_nominal_cad_support_margin_mm=0),
            lambda record: record["previous_completed_delivery"].update(satisfies_this_new_request=True),
            lambda record: record["cases"][-1].update(previous_case_id="copilot-p300-support-free-v2"),
            lambda record: record.update(comparisons={"state": "READY"}),
        ]:
            record = copy.deepcopy(self.fixture()); change(record)
            with self.assertRaises(ValueError):
                validate_symmetry_receipt(record)

    def complete_schema_fixture(self):
        record = self.fixture()
        prefix = "/artifacts/studies/part-count-matrix-20260921/"
        file = lambda path: {"path": prefix + path, "bytes": 10, "sha256": "a" * 64}
        for row in record["cases"]:
            identifier = row["requested_case_id"]
            release = ("https://github.com/ktanino10/octoprints-brick-kit-downloads/releases/download/"
                       f"part-count-matrix-20260921-{identifier}/")
            row.update(status="READY", actual_case_id=identifier, source_commit="b" * 40,
                       actual_count=row["target_count"], external_aid_count=0, assembly_aid_count=0,
                       symmetry_evidence=file(f"validation/{identifier}-native-visual-symmetry.json"),
                       mechanical_evidence={**file(f"validation/{identifier}-symmetry-support.json.gz"),
                                            "encoding": "gzip", "decoded_bytes": 100, "decoded_sha256": "c" * 64},
                       downloads={**{key: release + "unit-fixture.zip" for key in ["cad", "cg", "animation", "assembly"]},
                                  "viewer": f"https://ktanino10.github.io/octoprints-brick-kit-downloads/ja/density-guide.html?case={identifier}"},
                       verification={"public_browser_passed": True, "anonymous_downloads_passed": True})
        record["published_verified_case_count"] = 5
        names = ["comparison-sheets.json", "comparison.csv", "matrix.json",
                 "comparisons/copilot-normalized-front.jpg", "comparisons/copilot-normalized-three_quarter.jpg",
                 "comparisons/copilot-physical-size.jpg"]
        assets = [file("revisions/bilateral-symmetry-v3/" + name) for name in names]
        record["comparisons"] = {"state": "PUBLIC_PENDING", "assets": assets, "descriptor": assets[0],
                                 "one_x_reference_symmetry": "KNOWN_ASYMMETRY_READ_ONLY_NOT_REVISED",
                                 "verification": {"public_browser_passed": False, "anonymous_downloads_passed": False}}
        return record

    def test_five_case_schema_fixture_stays_partial_until_six_exact_comparison_files_are_verified(self):
        record = self.complete_schema_fixture()
        self.assertEqual(validate_symmetry_receipt(record)["state"], "PARTIAL")
        record["comparisons"].update(state="READY", verification={"public_browser_passed": True, "anonymous_downloads_passed": True})
        record.update(state="READY", verification={"public_browser_passed": True, "anonymous_downloads_passed": True})
        self.assertEqual(validate_symmetry_receipt(record)["state"], "READY")
        for mutate in [
            lambda value: value["comparisons"]["assets"].pop(),
            lambda value: value["comparisons"].update(one_x_reference_symmetry="PASS"),
            lambda value: value["comparisons"]["assets"][2].update(path="/artifacts/studies/part-count-matrix-20260921/matrix.json"),
            lambda value: value["comparisons"]["assets"][1].update(sha256="not-a-hash"),
            lambda value: value["comparisons"]["verification"].update(anonymous_downloads_passed=False),
        ]:
            altered = copy.deepcopy(record); mutate(altered)
            with self.assertRaises(ValueError):
                validate_symmetry_receipt(altered)


if __name__ == "__main__":
    unittest.main()
