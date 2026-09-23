from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from symmetry_cells import nominal_material_cells, nominal_reflection_metrics


class NominalSymmetryCellsTests(unittest.TestCase):
    def fixture(self):
        return {"palette": {"blue": {}, "eye": {}},
                "types": {"block": {"pitch_mm": 8, "vertical_unit_mm": 1.6, "cells": [1, 1],
                                     "body_height_mm": 4.8, "footprint_cells": [[0, 0]]}},
                "parts": [
                    {"id": "L", "type_id": "block", "color_id": "eye", "position_mm": [-8, -8, 0], "rotation_z_deg": 0},
                    {"id": "R", "type_id": "block", "color_id": "eye", "position_mm": [8, -8, 0], "rotation_z_deg": 0},
                ]}

    def test_nominal_pairs_have_matching_shape_color_and_depth_without_claiming_native_pass(self):
        cells = nominal_material_cells(self.fixture())
        self.assertEqual(len(cells), 6)
        result = nominal_reflection_metrics(cells, feature_color="eye")
        self.assertEqual(result["material_occupancy_xor"], 0)
        self.assertEqual(result["paired_material_color_differences"], 0)
        self.assertEqual(result["paired_front_depth_differences"], 0)
        self.assertEqual(result["feature"]["front_mask_xor"], 0)
        self.assertFalse(result["native_geometry_or_physical_validation"])

    def test_same_projected_shape_does_not_hide_depth_asymmetry(self):
        model = self.fixture()
        model["parts"][1]["position_mm"][1] = 0
        result = nominal_reflection_metrics(nominal_material_cells(model), feature_color="eye")
        self.assertEqual(result["front_shape_xor"], 0)
        self.assertEqual(result["paired_front_depth_differences"], 6)
        self.assertGreater(result["material_occupancy_xor"], 0)

    def test_color_mask_asymmetry_remains_even_when_material_volume_matches(self):
        model = self.fixture()
        model["parts"][1]["color_id"] = "blue"
        result = nominal_reflection_metrics(nominal_material_cells(model), feature_color="eye")
        self.assertEqual(result["material_occupancy_xor"], 0)
        self.assertEqual(result["paired_material_color_differences"], 6)
        self.assertEqual(result["feature"]["front_mask_xor"], 6)

    def test_body_slices_and_actual_quarter_turns_preserve_only_real_occupied_cells(self):
        model = self.fixture()
        model["types"]["block"].update(cells=[2, 2], body_height_mm=3.2, body_slices=[
            {"bottom_unit": 0, "height_units": 1, "footprint_cells": [[0, 0]]},
            {"bottom_unit": 1, "height_units": 1, "footprint_cells": [[0, 0], [1, 0]]},
        ])
        model["parts"] = [model["parts"][0]]
        model["parts"][0].update(position_mm=[0, 0, 0], rotation_z_deg=90)
        cells = nominal_material_cells(model)
        self.assertEqual(set(cells), {(4, -4, 0.8), (4, -4, 2.4), (4, 4, 2.4)})

    def test_nominal_overlaps_are_rejected_not_deduplicated_to_match_the_target(self):
        model = self.fixture()
        model["parts"][1]["position_mm"] = model["parts"][0]["position_mm"]
        with self.assertRaisesRegex(ValueError, "overlap"):
            nominal_material_cells(model)


if __name__ == "__main__":
    unittest.main()
