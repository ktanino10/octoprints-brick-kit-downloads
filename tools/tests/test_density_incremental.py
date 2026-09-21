import copy
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from install_density_case import STUDY, merge_catalog


class IncrementalDensityTests(unittest.TestCase):
    def fixture(self):
        return {"study_id": STUDY,
                "baselines": {"mona": {"state": "COUNTED", "manifest_sha256": "a" * 64,
                                        "metrics": {"part_count": 12435}}},
                "cases": [{"id": "mona-p120", "state": "READY", "actual": 14936, "sha256": "b" * 64},
                          {"id": "mona-p150", "state": "INPUT_WAIT"}]}

    def test_new_receipt_preserves_previous_real_case_and_does_not_mutate_inputs(self):
        previous = self.fixture()
        incoming = self.fixture()
        incoming["cases"][0] = {"id": "mona-p120", "state": "INPUT_WAIT"}
        incoming["cases"][1] = {"id": "mona-p150", "state": "READY", "actual": 18653}
        before = copy.deepcopy(incoming)
        merged = merge_catalog(previous, incoming, "mona-p150")
        self.assertEqual(merged["cases"][0], previous["cases"][0])
        self.assertEqual(merged["cases"][1], incoming["cases"][1])
        self.assertEqual(incoming, before)

    def test_published_case_and_baseline_changes_are_rejected_not_silently_ignored(self):
        previous = self.fixture()
        for change in [
            lambda data: data["cases"][0].update(actual=14937),
            lambda data: data["baselines"]["mona"].update(manifest_sha256="c" * 64),
            lambda data: data["baselines"]["mona"]["metrics"].update(part_count=12345),
            lambda data: data["cases"].pop(0),
        ]:
            incoming = self.fixture(); change(incoming)
            with self.assertRaises(ValueError):
                merge_catalog(previous, incoming, "mona-p120")

    def test_counted_baseline_can_gain_real_media_without_losing_its_fixed_identity(self):
        previous = self.fixture()
        incoming = self.fixture()
        incoming["baselines"]["mona"].update(state="READY", images={"front": {"sha256": "f" * 64}})
        merged = merge_catalog(previous, incoming, "mona-p120")
        self.assertEqual(merged["baselines"]["mona"]["state"], "READY")
        subsequent = self.fixture()
        retained = merge_catalog(merged, subsequent, "mona-p120")
        self.assertEqual(retained["baselines"]["mona"], merged["baselines"]["mona"])
        drifted = copy.deepcopy(merged)
        drifted["baselines"]["mona"]["images"]["front"]["sha256"] = "d" * 64
        with self.assertRaises(ValueError):
            merge_catalog(merged, drifted, "mona-p120")

    def test_one_ready_receipt_cannot_promote_a_different_unreviewed_case(self):
        previous = self.fixture()
        incoming = self.fixture()
        incoming["cases"][1] = {"id": "mona-p150", "state": "READY", "actual": 18653}
        with self.assertRaisesRegex(ValueError, "unreviewed"):
            merge_catalog(previous, incoming, "mona-p120")


if __name__ == "__main__":
    unittest.main()
