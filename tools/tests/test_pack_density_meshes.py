import gzip
import hashlib
import json
from pathlib import Path
import struct
import sys
import unittest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tools"))
from pack_density_meshes import pack_meshes


class NativeMeshPackingTests(unittest.TestCase):
    def fixture(self):
        return {"units": "mm", "origin": "body-bottom-center", "types": {
            "unit-only": {"vertices": [[0, 0, 0], [8, 0, 0], [0, 8, 4.8]], "faces": [[0, 1, 2]]},
        }}

    def test_pack_preserves_float32_vertices_and_all_faces_deterministically(self):
        packed, evidence = pack_meshes(self.fixture())
        again, _ = pack_meshes(self.fixture())
        self.assertEqual(packed, again)
        self.assertEqual(packed[:8], b"OCBMESH1")
        length = struct.unpack("<I", packed[8:12])[0]
        header = json.loads(packed[12:12 + length])
        body = packed[(12 + length + 3) // 4 * 4:]
        vertices = struct.pack("<9f", 0, 0, 0, 8, 0, 0, 0, 8, 4.8)
        faces = struct.pack("<3I", 0, 1, 2)
        self.assertEqual(body, vertices + faces)
        self.assertEqual(header["types"][0]["geometry_sha256"], hashlib.sha256(body).hexdigest())
        self.assertFalse(evidence["geometry_generated"])
        self.assertLess(evidence["maximum_float32_coordinate_error_mm"], 0.000001)
        self.assertEqual(gzip.decompress(gzip.compress(packed, mtime=0)), packed)

    def test_invalid_or_proxy_inputs_cannot_be_packed_as_actual_geometry(self):
        for mutate in [
            lambda data: data.update(units="m"),
            lambda data: data.update(origin="center"),
            lambda data: data["types"]["unit-only"].update(vertices=[]),
            lambda data: data["types"]["unit-only"].update(faces=[[0, 1, 3]]),
            lambda data: data["types"]["unit-only"].update(faces=[[0, 0, 2]]),
            lambda data: data["types"]["unit-only"]["vertices"][0].__setitem__(0, float("nan")),
        ]:
            data = self.fixture(); mutate(data)
            with self.assertRaises(ValueError):
                pack_meshes(data)


if __name__ == "__main__":
    unittest.main()
