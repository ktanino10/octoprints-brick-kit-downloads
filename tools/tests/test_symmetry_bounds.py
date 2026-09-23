from pathlib import Path
import struct
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from symmetry_bounds import feature_bounds_symmetry, native_mesh_bounds, world_bounds


class NativeSymmetryBoundsTests(unittest.TestCase):
    def fixture(self):
        return {
            "candidate_id": "UNIT_ONLY_NOT_A_REAL_CORRECTED_MODEL",
            "palette": {"eye": {"hex": "#BECF00"}},
            "parts": [
                {"id": "L", "type_id": "eye-shape", "color_id": "eye", "rotation_z_deg": 0,
                 "position_mm": [-24, -100, 160]},
                {"id": "R", "type_id": "eye-shape", "color_id": "eye", "rotation_z_deg": 0,
                 "position_mm": [24, -100, 160]},
            ],
        }, {"eye-shape": ([-7.9, -7.9, 0], [7.9, 7.9, 6.6])}

    def test_matching_native_bounds_are_necessary_but_not_claimed_as_full_symmetry(self):
        manifest, shapes = self.fixture()
        result = feature_bounds_symmetry(manifest, shapes, "eye", 0)
        self.assertTrue(result["bounds_match"])
        self.assertFalse(result["full_geometry_color_or_visible_outline_pass"])
        self.assertEqual(result["mirrored_bounds_error_mm"], [[0, 0, 0], [0, 0, 0]])
        self.assertEqual(manifest["parts"][0]["position_mm"], [-24, -100, 160])

    def test_width_depth_height_and_position_errors_are_not_hidden_by_matching_counts(self):
        for change in [
            lambda model, geometry: model["parts"][1]["position_mm"].__setitem__(0, 32),
            lambda model, geometry: model["parts"][1]["position_mm"].__setitem__(1, -92),
            lambda model, geometry: model["parts"][1]["position_mm"].__setitem__(2, 164.8),
            lambda model, geometry: (
                geometry.update(other=([-3.9, -7.9, 0], [3.9, 7.9, 6.6])),
                model["parts"][1].update(type_id="other")),
        ]:
            manifest, shapes = self.fixture()
            change(manifest, shapes)
            self.assertFalse(feature_bounds_symmetry(manifest, shapes, "eye", 0)["bounds_match"])

    def test_center_crossing_missing_geometry_and_invalid_tolerances_are_explicit_errors(self):
        for change in [
            lambda model, shapes: model["parts"][0]["position_mm"].__setitem__(0, 0),
            lambda model, shapes: shapes.clear(),
            lambda model, shapes: model["parts"][1].update(id="L"),
        ]:
            manifest, shapes = self.fixture()
            change(manifest, shapes)
            with self.assertRaises(ValueError):
                feature_bounds_symmetry(manifest, shapes, "eye", 0)
        manifest, shapes = self.fixture()
        with self.assertRaises(ValueError):
            feature_bounds_symmetry(manifest, shapes, "eye", 0, 8)

    def test_native_vertices_and_actual_rotation_not_metadata_boxes_define_bounds(self):
        coordinates = [(-2, -1, 0), (3, -1, 0), (0, 4, 6)]
        raw = b"OBM1" + struct.pack("<II", 3, 1)
        raw += b"".join(struct.pack("<fff", *point) for point in coordinates) + struct.pack("<III", 0, 1, 2)
        native = native_mesh_bounds(raw)
        self.assertEqual(native, ([-2, -1, 0], [3, 4, 6]))
        self.assertEqual(world_bounds({"position_mm": [10, 20, 30], "rotation_z_deg": 90}, native),
                         [[6, 18, 30], [11, 23, 36]])
        with self.assertRaises(ValueError):
            native_mesh_bounds(raw[:-1])


if __name__ == "__main__":
    unittest.main()
