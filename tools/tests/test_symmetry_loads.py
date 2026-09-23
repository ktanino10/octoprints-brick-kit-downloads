from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from symmetry_loads import nonreset_support_loads
from density_body_support import support_load_sets


def sequence(rows):
    return [{"id": identifier, "step": step, "support_ids": supports}
            for step, (identifier, supports) in enumerate(rows, 1)]


class SymmetryLoadLedgerTests(unittest.TestCase):
    def test_new_root_retains_previous_root_mass_paths(self):
        parts = sequence([
            ("body", []), ("root-a", ["body"]), ("root-b", ["root-a"]), ("payload", ["root-b"]),
        ])
        result = nonreset_support_loads(parts, ["root-a", "root-b"])
        self.assertEqual(result["payload_ids_in_actual_step_order"],
                         {"root-a": ["root-b", "payload"], "root-b": ["payload"]})
        self.assertEqual(result["new_support_encounters"][0]["incoming_roots_counted_once"], ["root-a"])
        self.assertEqual(result["new_support_encounters"][0]["inherited_roots_continued"], ["root-a"])
        self.assertFalse(result["is_native_contact_or_stability_approval"])
        self.assertTrue(result["local_bounds_must_not_be_summed_as_global_mass"])

    def test_common_tokens_continue_per_root_not_per_entire_set(self):
        parts = sequence([
            ("body", []), ("root-a", ["body"]), ("root-b", ["root-a"]),
            ("left", ["root-a"]), ("right", ["root-b"]), ("shared", ["left", "right"]),
            ("above", ["shared"]),
        ])
        result = nonreset_support_loads(parts, ["root-a", "root-b"])["payload_ids_in_actual_step_order"]
        self.assertEqual(result["root-a"], ["root-b", "left", "right", "shared", "above"])
        self.assertEqual(result["root-b"], ["right", "shared"])

    def test_independent_body_support_stops_the_prior_root_after_counting_shared_receiver(self):
        parts = sequence([
            ("body", []), ("root-a", ["body"]), ("lower", ["root-a"]),
            ("root-b", ["lower", "body"]), ("above", ["root-b"]),
        ])
        result = nonreset_support_loads(parts, ["root-a", "root-b"])
        self.assertEqual(result["payload_ids_in_actual_step_order"], {"root-a": ["lower", "root-b"], "root-b": ["above"]})
        self.assertEqual(result["new_support_encounters"][0]["first_shared_receiver_roots"], ["root-a"])

    def test_converging_paths_add_the_shared_physical_part_once_in_each_local_bound(self):
        parts = sequence([
            ("body", []), ("root-a", ["body"]), ("root-b", ["root-a"]),
            ("left", ["root-b"]), ("right", ["root-b"]), ("top", ["left", "right"]),
        ])
        result = nonreset_support_loads(parts, ["root-a", "root-b"])["payload_ids_in_actual_step_order"]
        self.assertEqual(result["root-a"].count("top"), 1)
        self.assertEqual(result["root-b"].count("top"), 1)

    def test_older_body_support_guard_still_rejects_new_roots_on_exclusive_ancestors(self):
        parts = sequence([("body", []), ("root-a", ["body"]), ("root-b", ["root-a"])])
        model = {"parts": [{**part, "type_id": "BS" if part["id"].startswith("root") else "BR"} for part in parts],
                 "types": {"BR": {"kind": "brick"}, "BS": {"kind": "stepped-root-module"}}}
        with self.assertRaisesRegex(ValueError, "reset"):
            support_load_sets(model)
        self.assertEqual(nonreset_support_loads(parts, ["root-a", "root-b"])["payload_ids_in_actual_step_order"]["root-a"], ["root-b"])

    def test_missing_late_or_duplicated_supports_and_roots_are_not_silent_defaults(self):
        for rows, roots in [
            ([("body", []), ("root", ["missing"])], ["root"]),
            ([("root", ["later"]), ("later", [])], ["root"]),
            ([("body", []), ("root", ["body", "body"])], ["root"]),
            ([("body", []), ("root", ["body"])], ["root", "root"]),
            ([("body", []), ("root", ["body"])], ["unlisted"]),
            ([("body", []), ("root", ["root"])], ["root"]),
            ([("body", []), ("body", [])], ["body"]),
        ]:
            with self.assertRaises(ValueError):
                nonreset_support_loads(sequence(rows), roots)


if __name__ == "__main__":
    unittest.main()
