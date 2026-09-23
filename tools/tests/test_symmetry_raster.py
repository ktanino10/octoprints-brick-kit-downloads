from pathlib import Path
import sys
import tempfile
import unittest

from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from audit_symmetry_source import raster


class NativeRasterTests(unittest.TestCase):
    def image(self):
        image = Image.new("RGBA", (20, 14), (0, 0, 0, 0))
        draw = ImageDraw.Draw(image)
        draw.rectangle([2, 1, 17, 12], fill=(255, 0, 0, 255))
        draw.rectangle([5, 5, 6, 8], fill=(0, 0, 255, 255))
        draw.rectangle([13, 5, 14, 8], fill=(0, 0, 255, 255))
        return image

    def measure(self, image):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "unit-only.png"
            image.save(path)
            return raster(path)

    def test_exact_native_material_labels_have_equal_eyes_and_zero_boundary_difference(self):
        result = self.measure(self.image())
        self.assertEqual(result["left_eye_pixels"], 8)
        self.assertEqual(result["right_eye_pixels"], 8)
        self.assertEqual(result["eye_mask_xor"], 0)
        self.assertEqual(result["silhouette_xor"], 0)
        self.assertEqual(result["whole_material_xor"], 0)

    def test_a_single_raster_edge_pixel_is_reported_as_two_mirrored_disagreements_not_zero(self):
        image = self.image()
        image.putpixel((2, 1), (0, 0, 0, 0))
        result = self.measure(image)
        self.assertEqual(result["silhouette_xor"], 2)
        self.assertEqual(result["all_label_xor_including_silhouette"], 2)
        self.assertEqual(result["maximum_silhouette_boundary_distance_pixels"], 1)
        self.assertEqual(result["eye_mask_xor"], 0)
        self.assertEqual(result["whole_material_xor"], 0)

    def test_a_real_large_missing_region_cannot_be_hidden_as_raster_tolerance(self):
        image = self.image()
        ImageDraw.Draw(image).rectangle([2, 2, 7, 10], fill=(0, 0, 0, 0))
        with self.assertRaisesRegex(ValueError, "boundary tolerance"):
            self.measure(image)


if __name__ == "__main__":
    unittest.main()
