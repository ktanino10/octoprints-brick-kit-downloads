import copy
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from install_density_case import STUDY, merge_catalog
from density_requirements import case_identity, logical_case_id
from adapt_density_case import revision_fields


class IncrementalDensityTests(unittest.TestCase):
    def fixture(self):
        return {"study_id": STUDY,
                "baselines": {"mona": {"state": "COUNTED", "manifest_sha256": "a" * 64,
                                        "metrics": {"part_count": 12435}}},
                "cases": [{"id": "mona-p120", "character": "mona", "count_percentage": 120,
                           "state": "READY", "actual": 14936, "sha256": "b" * 64},
                          {"id": "mona-p150", "character": "mona", "count_percentage": 150, "state": "INPUT_WAIT"}]}

    def test_new_receipt_preserves_previous_real_case_and_does_not_mutate_inputs(self):
        previous = self.fixture()
        incoming = self.fixture()
        incoming["cases"][0] = {key: incoming["cases"][0][key] for key in ["id", "character", "count_percentage"]}
        incoming["cases"][0]["state"] = "INPUT_WAIT"
        incoming["cases"][1].update(state="READY", actual=18653)
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
        incoming["cases"][1].update(state="READY", actual=18653)
        with self.assertRaisesRegex(ValueError, "unreviewed"):
            merge_catalog(previous, incoming, "mona-p120")

    def test_revision_uses_one_comparison_slot_and_preserves_immutable_old_guide(self):
        previous = self.fixture()
        incoming = self.fixture()
        incoming["cases"][0].update(id="mona-p120-root-v2", logical_case_id="mona-p120",
                                    geometry_revision="whisker-root-v2", sha256="d" * 64)
        before = copy.deepcopy(previous)
        merged = merge_catalog(previous, incoming, "mona-p120-root-v2")
        self.assertEqual(previous, before)
        self.assertEqual(len(merged["cases"]), 2)
        self.assertEqual(merged["cases"][0], incoming["cases"][0])
        self.assertEqual(merged["historical_cases"], [previous["cases"][0]])
        next_packet = self.fixture()
        next_packet["cases"][0]["state"] = "INPUT_WAIT"
        next_packet["cases"][1].update(state="READY", actual=18675)
        retained = merge_catalog(merged, next_packet, "mona-p150")
        self.assertEqual(retained["cases"][0], merged["cases"][0])
        self.assertEqual(retained["historical_cases"], merged["historical_cases"])
        with self.assertRaisesRegex(ValueError, "reactivate"):
            merge_catalog(merged, self.fixture(), "mona-p120")
        tampered = copy.deepcopy(retained)
        tampered["historical_cases"][0]["sha256"] = "f" * 64
        with self.assertRaisesRegex(ValueError, "history"):
            merge_catalog(retained, tampered, "mona-p150")

    def test_revised_ids_cannot_cross_character_multiplier_or_geometry_identity(self):
        self.assertEqual(case_identity("mona-p120-root-v2"), ("mona-p120", "whisker-root-v2"))
        for identifier in ["copilot-p120-root-v2", "mona-p125-root-v2", "mona-p120-root-v3", "../mona-p120"]:
            with self.assertRaises(ValueError):
                case_identity(identifier)
        case = self.fixture()["cases"][0]
        case.update(id="mona-p120-root-v2", logical_case_id="mona-p120", geometry_revision="whisker-root-v2")
        for changes in [{"logical_case_id": "mona-p150"}, {"geometry_revision": "different"},
                        {"count_percentage": 150}, {"character": "copilot"}]:
            with self.assertRaises(ValueError):
                logical_case_id({**case, **changes})

    def test_source_revision_metadata_must_match_before_normalizing_a_new_guide(self):
        identity = {"logical_case_id": "mona-p120", "geometry_revision": "whisker-root-v2"}
        self.assertEqual(revision_fields("mona-p120-root-v2", identity, identity, identity), identity)
        self.assertEqual(revision_fields("mona-p120", {}), {})
        for wrong in [{}, {**identity, "logical_case_id": "mona-p150"},
                      {**identity, "geometry_revision": "old-supported"}]:
            with self.assertRaises(ValueError):
                revision_fields("mona-p120-root-v2", identity, wrong, identity)

    def test_changed_mona_requirement_retires_old_geometry_without_fabricating_a_ready_replacement(self):
        previous = self.fixture()
        previous["cases"][1].update(state="READY", actual=18675)
        previous["cases"].append({"id": "copilot-p120", "character": "copilot",
                                  "count_percentage": 120, "state": "INPUT_WAIT"})
        incoming = copy.deepcopy(previous)
        for case in incoming["cases"][:2]:
            logical = case["id"]
            case.clear()
            case.update(id=logical + "-root-v2", logical_case_id=logical, geometry_revision="whisker-root-v2",
                        character="mona", count_percentage=int(logical.split("p")[-1]), state="INPUT_WAIT")
        incoming["cases"][2].update(state="READY", actual=21388)
        merged = merge_catalog(previous, incoming, "copilot-p120")
        self.assertEqual(merged["cases"][:2], incoming["cases"][:2])
        self.assertEqual(merged["historical_cases"], previous["cases"][:2])
        self.assertEqual(sum(case["state"] == "READY" for case in merged["cases"]), 1)


if __name__ == "__main__":
    unittest.main()
