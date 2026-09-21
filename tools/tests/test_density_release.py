import hashlib
import json
from pathlib import Path
import sys
import tempfile
import unittest
import zipfile

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tools"))
from density_release import create_release_zip, reviewed_files, safe_member


class DensityReleaseTests(unittest.TestCase):
    def setUp(self):
        (ROOT / ".archive-work").mkdir(exist_ok=True)
        self.temp = tempfile.TemporaryDirectory(prefix="density-release-test-", dir=ROOT / ".archive-work")
        self.root = Path(self.temp.name)
        self.stage = self.root / "staged"
        self.stage.mkdir()

    def tearDown(self):
        self.temp.cleanup()

    def entry(self, name, data):
        path = self.stage / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        return {"path": name, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}

    def native(self, name, link=None):
        path = self.stage / name
        path.parent.mkdir(parents=True, exist_ok=True)
        xml = f'<Document><XLink file="{link}"/></Document>' if link else '<Document/>'
        with zipfile.ZipFile(path, "w") as archive:
            archive.writestr("Document.xml", xml)
            archive.writestr("Shape.brp", b"unit-native-data")
        data = path.read_bytes()
        return {"path": name, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}

    def native_report(self, entries):
        return {"documents": [{"path": entry["path"], "sha256": entry["sha256"],
                               "opened": True, "proxy_free": True, "saved": False, "recomputed": False}
                              for entry in entries]}

    def test_relative_native_links_are_preserved_and_dependencies_must_be_in_bundle(self):
        assembly = self.native("cases/mona-p120/assembly.FCStd", "../../shared/masters/unit.FCStd")
        library = self.native("shared/masters/unit.FCStd")
        entries = [assembly, library]
        result = reviewed_files(self.stage, {"files": entries}, [], self.native_report(entries))
        self.assertEqual(result, entries)
        with self.assertRaisesRegex(ValueError, "same allowlisted"):
            reviewed_files(self.stage, {"files": [assembly]}, [], self.native_report([assembly]))
        output = self.root / "case.zip"
        receipt = create_release_zip(self.stage, output, entries, notes="Unit-test package only.")
        self.assertEqual(receipt["storage"], "GITHUB_RELEASE_ONLY")
        with zipfile.ZipFile(output) as package:
            self.assertEqual(package.read(assembly["path"]), (self.stage / assembly["path"]).read_bytes())
            self.assertEqual(package.read(library["path"]), (self.stage / library["path"]).read_bytes())
            self.assertIn(library["sha256"], package.read("PUBLIC-SHA256SUMS.txt").decode())
        with self.assertRaisesRegex(ValueError, "overwrite"):
            create_release_zip(self.stage, output, entries, notes="same")

    def test_unreviewed_native_private_metadata_or_byte_drift_is_rejected(self):
        item = self.entry("cases/mona-p120/bom.csv", b"part_id,type_id\nUNIT-1,TYPE-1\n")
        self.assertEqual(reviewed_files(self.stage, {"files": [item]}, [], {"documents": []}), [item])
        (self.stage / item["path"]).write_bytes(b"different")
        with self.assertRaisesRegex(ValueError, "changed after review"):
            reviewed_files(self.stage, {"files": [item]}, [], {"documents": []})
        private = self.entry("case.json", b'{"path":"/Users/unit-person/private"}')
        with self.assertRaisesRegex(ValueError, "Private metadata"):
            reviewed_files(self.stage, {"files": [private]}, [], {"documents": []})
        native = self.native("assembly.FCStd")
        with self.assertRaisesRegex(ValueError, "Every FreeCAD"):
            reviewed_files(self.stage, {"files": [native]}, [], {"documents": []})

    def test_path_escape_and_private_internal_members_are_rejected(self):
        for path in [None, "../outside", "/absolute", "cases\\windows", ".private/key", "cases/../old"]:
            with self.assertRaises(ValueError):
                safe_member(path)
        self.assertEqual(str(safe_member("cases/mona-p120/assembly.FCStd")), "cases/mona-p120/assembly.FCStd")


if __name__ == "__main__":
    unittest.main()
