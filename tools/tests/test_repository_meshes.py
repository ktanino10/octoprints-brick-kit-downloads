import gzip
import hashlib
from pathlib import Path
import struct
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from repository_meshes import (
    PERMISSION, pinned_mesh_descriptor, repository_mesh_path, validate_native_payload, verify_pinned_descriptor,
)


class RepositoryNativeMeshTests(unittest.TestCase):
    def fixture(self):
        body = struct.pack("<9f3I", 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 2)
        raw = b"OBM1" + struct.pack("<II", 3, 1) + body
        data = gzip.compress(raw, mtime=0)
        file = {"path": "/artifacts/studies/part-count-matrix-20260921/geometry/UNIT.mesh.gz",
                "type_id": "UNIT", "format": "OBM1_GZIP", "bytes": len(data),
                "sha256": hashlib.sha256(data).hexdigest(), "geometry_sha256": hashlib.sha256(body).hexdigest()}
        entry = {"path": "geometry/UNIT.mesh.gz", "type_id": "UNIT", "permission": PERMISSION,
                 "bytes": len(data), "sha256": file["sha256"]}
        return entry, data, file

    def test_same_approved_native_bytes_are_bound_to_one_exact_public_commit_path(self):
        entry, data, file = self.fixture()
        self.assertEqual(validate_native_payload(entry, data, file["geometry_sha256"]),
                         ([0, 0, 0], [1, 1, 0]))
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            path = root / repository_mesh_path("UNIT")
            path.parent.mkdir(parents=True); path.write_bytes(data)
            with patch("repository_meshes.subprocess.check_output", return_value=data) as read:
                descriptor = pinned_mesh_descriptor(root, "UNIT", "a" * 40, file)
                self.assertNotIn("path", descriptor)
                self.assertEqual(descriptor["storage"], "PUBLIC_REPO_COMMIT")
                self.assertEqual(verify_pinned_descriptor(root, descriptor), descriptor)
                self.assertIn("a" * 40 + ":" + repository_mesh_path("UNIT"), read.call_args.args[0])
            with patch("repository_meshes.subprocess.check_output", return_value=data + b"tampered"):
                with self.assertRaises(ValueError):
                    pinned_mesh_descriptor(root, "UNIT", "a" * 40, file)

    def test_unapproved_paths_permissions_bytes_or_decoded_geometry_are_rejected(self):
        entry, data, file = self.fixture()
        for change in [
            {"permission": "PUBLIC_PAGES"},
            {"path": "../private/scene.blend"},
            {"type_id": "../UNIT"},
            {"bytes": len(data) + 1},
            {"sha256": "0" * 64},
        ]:
            with self.assertRaises(ValueError):
                validate_native_payload({**entry, **change}, data, file["geometry_sha256"])
        with self.assertRaises(ValueError):
            validate_native_payload(entry, data, "0" * 64)
        for identifier in ["../UNIT", "UNIT/OTHER", "UNIT.mesh.gz", "", "UNIT%2fOTHER"]:
            with self.assertRaises(ValueError):
                repository_mesh_path(identifier)


if __name__ == "__main__":
    unittest.main()
