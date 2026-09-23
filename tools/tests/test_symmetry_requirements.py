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
        return json.loads((ROOT / "archive/copilot-symmetry-revision.json").read_text())

    def test_unreceived_corrections_remain_separate_from_prior_complete_work(self):
        record = self.fixture()
        self.assertEqual(validate_symmetry_receipt(record), record)
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
        ]:
            record = copy.deepcopy(self.fixture()); change(record)
            with self.assertRaises(ValueError):
                validate_symmetry_receipt(record)


if __name__ == "__main__":
    unittest.main()
