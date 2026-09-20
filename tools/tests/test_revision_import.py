import hashlib
import json
from pathlib import Path
import sys
import tempfile
import unittest
import zipfile

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tools"))
from revision_import import checked_input, check_archive, stage_revision, validate_receipt, verify_native_streams


class RevisionImportTests(unittest.TestCase):
    def setUp(self):
        (ROOT / ".archive-work").mkdir(exist_ok=True)
        self.temp = tempfile.TemporaryDirectory(prefix="import-unit-", dir=ROOT / ".archive-work")
        self.root = Path(self.temp.name)
        self.source = self.root / "source"
        self.source.mkdir()
        self.relative = "artifacts/revisions/r3-unit/catalog.json"
        path = self.source / self.relative
        path.parent.mkdir(parents=True)
        self.bytes = b'{"test_fixture_only":true}\n'
        path.write_bytes(self.bytes)
        self.receipt = {
            "schema_version": 1, "revision": "r3-unit", "readiness": "READY_FOR_PUBLICATION",
            "source_commit": "1" * 40, "catalog_path": self.relative,
            "physical_fit": "UNKNOWN", "slicing": "NOT_SLICED",
            "files": [{"path": self.relative, "bytes": len(self.bytes), "sha256": hashlib.sha256(self.bytes).hexdigest()}],
        }

    def tearDown(self):
        self.temp.cleanup()

    def test_not_ready_is_not_importable(self):
        for state in ["NOT_READY", "INPUT_WAIT", None]:
            self.receipt["readiness"] = state
            with self.assertRaisesRegex(ValueError, "not READY"):
                validate_receipt(self.receipt)

    def test_only_revision_allowlist_and_hashes_are_accepted(self):
        for path in ["README.md", "artifacts/revisions/r3-unit/../../secret.json",
                     "artifacts/revisions/r2-old/catalog.json",
                     "artifacts/revisions/r3-unit/.cache/data.json",
                     "artifacts/revisions/r3-unit/frames/frame-0001.png",
                     "artifacts/revisions/r3-unit/harness.py",
                     "artifacts/revisions/r3-unit/command.log"]:
            modified = json.loads(json.dumps(self.receipt))
            modified["files"][0]["path"] = path
            with self.assertRaises(ValueError):
                validate_receipt(modified)
        path = self.source / self.relative
        path.write_bytes(self.bytes + b" ")
        with self.assertRaisesRegex(ValueError, "changed after READY"):
            checked_input(self.source, self.receipt["files"][0])

    def test_no_unlisted_data_or_overwriting_existing_staging(self):
        private = self.source / "not-approved.txt"
        private.write_text("unrelated unit-test fixture")
        stage = self.root / "stage"
        stage_revision(self.receipt, self.source, stage)
        self.assertEqual([file.relative_to(stage).as_posix() for file in stage.rglob("*") if file.is_file()], [self.relative])
        self.assertEqual((stage / self.relative).read_bytes(), self.bytes)
        self.assertEqual((self.source / self.relative).read_bytes(), self.bytes)
        with self.assertRaisesRegex(ValueError, "refusing to overwrite"):
            stage_revision(self.receipt, self.source, stage)

    def test_symlinks_and_zipslip_are_rejected(self):
        path = self.source / self.relative
        path.unlink()
        path.symlink_to(self.source / "elsewhere")
        with self.assertRaisesRegex(ValueError, "Symlink"):
            checked_input(self.source, self.receipt["files"][0])
        archive = self.root / "bad.3mf"
        with zipfile.ZipFile(archive, "w") as package:
            package.writestr("../escape.xml", b"test-only")
        with self.assertRaisesRegex(ValueError, "Escaping native"):
            check_archive(archive, self.root, set())

    def test_native_metadata_edits_cannot_change_geometry(self):
        old = self.root / "old.FCStd"
        public = self.root / "public.FCStd"
        document = '<Document><Properties><Property name="License"><String value="old"/></Property><Property name="Label"><String value="UnitFixture"/></Property></Properties></Document>'
        for path, text in [(old, document), (public, document.replace('value="old"', 'value="CC BY-NC 4.0"'))]:
            with zipfile.ZipFile(path, "w") as package:
                package.writestr("Document.xml", text)
                package.writestr("Shape.brp", b"unit-test-shape-bytes")
        self.assertEqual(verify_native_streams(old, public), 1)
        with zipfile.ZipFile(public, "w") as package:
            package.writestr("Document.xml", document)
            package.writestr("Shape.brp", b"changed-shape")
        with self.assertRaisesRegex(ValueError, "shape/GUI stream changed"):
            verify_native_streams(old, public)

    def test_unsliced_geometry_cannot_include_machine_profiles_or_gcode(self):
        for filename in ["Metadata/plate_1.gcode", "Metadata/project_settings.config", "Metadata/slice_info.config"]:
            archive = self.root / "sliced.3mf"
            with zipfile.ZipFile(archive, "w") as package:
                package.writestr(filename, b"unit-test-only")
            with self.assertRaisesRegex(ValueError, "Geometry-only 3MF"):
                check_archive(archive, self.root, set())


if __name__ == "__main__":
    unittest.main()
