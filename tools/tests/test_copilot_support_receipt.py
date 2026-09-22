import copy
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tools"))
from density_requirements import validate_copilot_support_receipt


class CopilotSupportReceiptTests(unittest.TestCase):
    def fixture(self):
        return json.loads((ROOT / "archive/copilot-support-free-revision.json").read_text())

    def ready_fixture(self):
        record = self.fixture()
        for case in record["cases"]:
            identifier = case["actual_case_id"]
            case.update(status="READY", actual_count=case["target_count"], source_commit="a" * 40,
                        external_aid_count=0, assembly_aid_count=0,
                        geometry_sequence_evidence={
                            "path": f"/artifacts/studies/part-count-matrix-20260921/validation/{identifier}-assembly-support.json",
                            "bytes": 100, "sha256": "b" * 64},
                        verification={"public_browser_passed": True, "anonymous_downloads_passed": True})
            address = f"https://github.com/ktanino10/octoprints-brick-kit-downloads/releases/download/part-count-matrix-20260921-{identifier}/unit-only.zip"
            for field in ["cad_url", "cg_url", "animation_url", "assembly_url"]:
                case[field] = address
            case["viewer_url"] = f"https://ktanino10.github.io/octoprints-brick-kit-downloads/ja/density-guide.html?case={identifier}"
        record.update(state="READY", published_verified_case_count=4,
                      verification={"public_browser_passed": True, "anonymous_downloads_passed": True})
        return record

    def test_separate_request_does_not_inherit_the_previous_fifteen_ready_state(self):
        record = self.fixture()
        self.assertEqual(validate_copilot_support_receipt(record), record)
        if record["published_verified_case_count"] < 4:
            changed = copy.deepcopy(record)
            changed.update(state="READY", verification={"public_browser_passed": True, "anonymous_downloads_passed": True})
            with self.assertRaises(ValueError):
                validate_copilot_support_receipt(changed)

    def test_all_four_require_new_source_identity_zero_aids_evidence_and_public_qa(self):
        good = self.ready_fixture()
        self.assertEqual(validate_copilot_support_receipt(good), good)
        for mutate in [
            lambda record: record["cases"][0].update(actual_case_id="copilot-p120"),
            lambda record: record["cases"][0].update(assembly_aid_count=1),
            lambda record: record["cases"][0].update(external_aid_count=False),
            lambda record: record["cases"][0].update(source_commit=None),
            lambda record: record["cases"][0].update(geometry_sequence_evidence=None),
            lambda record: record["cases"][0].update(actual_count=21000),
            lambda record: record["cases"][0]["verification"].update(public_browser_passed=False),
            lambda record: record["cases"][0].update(cad_url="https://example.com/unit-only.zip"),
            lambda record: record["cases"][0].update(cad_url="https://github.com/ktanino10/octoprints-brick-kit-downloads/releases/download/old/data.zip#copilot-p120-support-free-v2"),
            lambda record: record["previous_completed_delivery"].update(satisfies_this_new_request=True),
            lambda record: record["preserved_existing_four_x"].update(counts_toward_the_four_new_revisions=True),
        ]:
            value = copy.deepcopy(good); mutate(value)
            with self.assertRaises(ValueError):
                validate_copilot_support_receipt(value)


if __name__ == "__main__":
    unittest.main()
