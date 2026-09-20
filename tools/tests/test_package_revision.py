import hashlib
import json
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tools"))
from package_revision import verified_files


class PackageRevisionTests(unittest.TestCase):
    def setUp(self):
        (ROOT / ".archive-work").mkdir(exist_ok=True)
        self.temp = tempfile.TemporaryDirectory(prefix="package-unit-", dir=ROOT / ".archive-work")
        self.stage = Path(self.temp.name)
        self.name = "artifacts/revisions/r3-unit/catalog.json"
        self.data = b'{"fixture_only":true}\n'
        target = self.stage / self.name
        target.parent.mkdir(parents=True)
        target.write_bytes(self.data)
        digest = hashlib.sha256(self.data).hexdigest()
        self.inventory = {"revision": "r3-unit", "source_revision": "1" * 40,
                          "files": [{"path": self.name, "bytes": len(self.data), "sha256": digest}]}
        self.imported = {"revision": "r3-unit", "source_commit": "1" * 40,
                         "files": [{"path": self.name, "source_sha256": digest, "public_sha256": digest}]}

    def tearDown(self):
        self.temp.cleanup()

    def test_exact_reviewed_staging_bytes_are_required(self):
        result = verified_files(self.stage, self.inventory, self.imported, [], {"documents": []})
        self.assertEqual(result[0]["relation"], "BYTE_IDENTICAL")
        (self.stage / self.name).write_bytes(self.data + b" ")
        with self.assertRaisesRegex(ValueError, "changed after metadata review"):
            verified_files(self.stage, self.inventory, self.imported, [], {"documents": []})

    def test_mismatched_commits_or_added_files_cannot_be_packaged(self):
        self.imported["source_commit"] = "2" * 40
        with self.assertRaisesRegex(ValueError, "Source revision/commit"):
            verified_files(self.stage, self.inventory, self.imported, [], {"documents": []})
        self.imported["source_commit"] = "1" * 40
        self.imported["files"].append({"path": "artifacts/revisions/r3-unit/unreviewed.json"})
        with self.assertRaisesRegex(ValueError, "inventory and staging receipt"):
            verified_files(self.stage, self.inventory, self.imported, [], {"documents": []})

    def test_native_reopen_evidence_must_cover_exactly_the_native_inputs(self):
        for blender, native in [
            ([{"path": "artifacts/revisions/r3-unit/unlisted.blend"}], {"documents": []}),
            ([], {"documents": [{"path": "artifacts/revisions/r3-unit/unlisted.FCStd"}]}),
        ]:
            with self.assertRaisesRegex(ValueError, "Every native"):
                verified_files(self.stage, self.inventory, self.imported, blender, native)


if __name__ == "__main__":
    unittest.main()
