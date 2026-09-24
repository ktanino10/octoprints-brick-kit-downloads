from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from audit_symmetry_source import raster_rgba


class NativeRasterTests(unittest.TestCase):
    def image(self):
        image = bytearray(20 * 14 * 4)
        self.rectangle(image, [2, 1, 17, 12], (255, 0, 0, 255))
        self.rectangle(image, [5, 5, 6, 8], (0, 0, 255, 255))
        self.rectangle(image, [13, 5, 14, 8], (0, 0, 255, 255))
        return image

    def rectangle(self, image, box, color):
        for y in range(box[1], box[3] + 1):
            for x in range(box[0], box[2] + 1):
                index = (y * 20 + x) * 4
                image[index:index + 4] = bytes(color)

    def measure(self, image):
        return raster_rgba(20, 14, image)

    def test_exact_native_material_labels_have_equal_eyes_and_zero_boundary_difference(self):
        result = self.measure(self.image())
        self.assertEqual(result["left_eye_pixels"], 8)
        self.assertEqual(result["right_eye_pixels"], 8)
        self.assertEqual(result["eye_mask_xor"], 0)
        self.assertEqual(result["silhouette_xor"], 0)
        self.assertEqual(result["whole_material_xor"], 0)

    def test_a_single_raster_edge_pixel_is_reported_as_two_mirrored_disagreements_not_zero(self):
        image = self.image()
        self.rectangle(image, [2, 1, 2, 1], (0, 0, 0, 0))
        result = self.measure(image)
        self.assertEqual(result["silhouette_xor"], 2)
        self.assertEqual(result["all_label_xor_including_silhouette"], 2)
        self.assertEqual(result["maximum_silhouette_boundary_distance_pixels"], 1)
        self.assertEqual(result["eye_mask_xor"], 0)
        self.assertEqual(result["whole_material_xor"], 0)

    def test_a_real_large_missing_region_cannot_be_hidden_as_raster_tolerance(self):
        image = self.image()
        self.rectangle(image, [2, 2, 7, 10], (0, 0, 0, 0))
        with self.assertRaisesRegex(ValueError, "boundary tolerance"):
            self.measure(image)

    def test_color_boundary_differences_are_measured_separately_not_reported_as_zero(self):
        image = self.image()
        self.rectangle(image, [2, 2, 4, 10], (0, 255, 0, 255))
        self.rectangle(image, [15, 2, 17, 10], (0, 255, 0, 255))
        self.rectangle(image, [5, 2, 5, 3], (0, 255, 0, 255))
        result = self.measure(image)
        self.assertEqual(result["silhouette_xor"], 0)
        self.assertEqual(result["whole_material_xor"], 4)
        self.assertEqual(result["eye_mask_xor"], 0)
        self.assertEqual(result["per_material_boundary_measurements"]["c1"],
                         {"mirror_xor_pixels": 4, "maximum_mirrored_boundary_distance_pixels": 1.0})

    def test_diagonal_only_neighbor_is_not_misreported_as_one_pixel_euclidean_distance(self):
        image = bytearray(20 * 14 * 4)
        self.rectangle(image, [4, 4, 4, 4], (255, 0, 0, 255))
        self.rectangle(image, [14, 5, 14, 5], (255, 0, 0, 255))
        with self.assertRaisesRegex(ValueError, "boundary tolerance"):
            self.measure(image)


if __name__ == "__main__":
    unittest.main()
