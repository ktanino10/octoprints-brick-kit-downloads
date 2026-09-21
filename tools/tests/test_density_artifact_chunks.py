import hashlib
import json
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from stage_density_case import STUDY, verify_artifact_persistence


class RawArtifactPersistenceTests(unittest.TestCase):
    def fixture(self):
        repo = Path("/unit-only/source")
        prefix = f"artifacts/studies/{STUDY}/"
        folder = prefix + "artifact-chunks/copilot-p400/unit/"
        chunks = [b"UNIT-ONLY-RAW-", b"SCENE"]
        digest = lambda data: hashlib.sha256(data).hexdigest()
        recipe = {"filename": "scene.blend", "bytes": sum(map(len, chunks)), "sha256": digest(b"".join(chunks)),
                  "chunks": [{"path": folder + str(index), "bytes": len(data), "sha256": digest(data)}
                             for index, data in enumerate(chunks)]}
        encoded = json.dumps(recipe).encode()
        item = {"path": prefix + "portable/cases/copilot-p400/scene.blend",
                "bytes": recipe["bytes"], "sha256": recipe["sha256"],
                "reconstruction_path": folder + "reconstruction.json", "reconstruction_sha256": digest(encoded)}
        index = {"schema_version": 1, "case_id": "copilot-p400",
                 "state": "EXACT_PRIVATE_LARGE_ARTIFACTS_PERSISTED", "files": [item]}
        index_bytes = json.dumps(index).encode()
        index_path = prefix + "artifact-chunks/copilot-p400/index.json"
        packet = {"case_id": "copilot-p400", "permission": "PRIVATE_EXACT_ARTIFACT_PERSISTENCE_NOT_PUBLICATION",
                  "index_path": str(repo / index_path), "index_sha256": digest(index_bytes), "record": index}
        blobs = {index_path: index_bytes, item["reconstruction_path"]: encoded}
        blobs.update({folder + str(index): data for index, data in enumerate(chunks)})
        return repo, packet, blobs

    def test_raw_artifact_is_reconstructed_exactly_without_publishing_private_indexes(self):
        repo, packet, blobs = self.fixture()
        with patch("stage_density_case.subprocess.check_output", side_effect=lambda args: blobs[args[-1].split(":", 1)[1]]):
            result = verify_artifact_persistence(repo, "a" * 40, [packet], "copilot-p400")
        self.assertEqual(len(result), 1)
        self.assertTrue(result[0]["path"].endswith("/scene.blend"))
        self.assertNotIn("index_path", result[0])

    def test_wrong_chunk_and_unapproved_case_are_rejected(self):
        repo, packet, blobs = self.fixture()
        key = next(name for name in blobs if name.endswith("/1"))
        blobs[key] = b"CHANGED"
        with patch("stage_density_case.subprocess.check_output", side_effect=lambda args: blobs[args[-1].split(":", 1)[1]]):
            with self.assertRaises(ValueError):
                verify_artifact_persistence(repo, "a" * 40, [packet], "copilot-p400")
        with self.assertRaises(ValueError):
            verify_artifact_persistence(repo, "a" * 40, [packet], "mona-p120-root-v2")


if __name__ == "__main__":
    unittest.main()
