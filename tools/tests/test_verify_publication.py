import hashlib
import io
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from verify_publication import BASE, STUDY_PUBLICATIONS, request_url, require_unchanged_catalog, validate_live_study, verify_bytes


class PublicVerificationTests(unittest.TestCase):
    def response(self, content):
        result = io.BytesIO(content)
        result.status = 200
        return result

    def test_anonymous_exact_download_uses_no_authentication_header(self):
        content = b"unit-test-only"
        digest = hashlib.sha256(content).hexdigest()
        with patch("verify_publication.urlopen", return_value=self.response(content)) as request:
            result = verify_bytes(BASE + "archive/unit.txt", len(content), digest)
        self.assertEqual(result["authentication"], "none")
        self.assertEqual(result["sha256"], digest)
        headers = dict(request.call_args.args[0].header_items())
        self.assertNotIn("Authorization", headers)
        self.assertNotIn("Cookie", headers)

    def test_wrong_hash_or_size_cannot_be_a_success(self):
        content = b"unit-test-only"
        for size, digest in [(1, hashlib.sha256(content).hexdigest()), (len(content), "0" * 64)]:
            with patch("verify_publication.urlopen", return_value=self.response(content)):
                with self.assertRaisesRegex(ValueError, "bytes/hash differ"):
                    verify_bytes(BASE + "archive/unit.txt", size, digest)

    def test_validation_does_not_fetch_unrelated_or_credentialed_origins(self):
        for url in ["https://example.test/file", "https://user:secret@ktanino10.github.io/file",
                    "file:///tmp/file", "https://github.com/unrelated/repository/releases/download/file"]:
            with patch("verify_publication.urlopen") as request:
                with self.assertRaisesRegex(ValueError, "authorized public project"):
                    verify_bytes(url, 1, "0" * 64)
                request.assert_not_called()

    def test_readable_unicode_paths_are_encoded_without_changing_the_origin(self):
        result = request_url(BASE + "artifacts/寸法 図.svg")
        self.assertTrue(result.startswith(BASE + "artifacts/"))
        self.assertNotIn(" ", result)
        self.assertIn("%E5%AF%B8", result)

    def test_study_can_avoid_large_release_downloads_only_for_an_unchanged_catalog(self):
        path = "archive/releases/unit-only.json"
        old = {path: "a" * 64}
        inventory = {"files": [{"path": path, "sha256": "a" * 64}]}
        require_unchanged_catalog(old, inventory, path)
        for previous, current in [
            ({}, inventory), (old, {"files": []}),
            (old, {"files": [{"path": path, "sha256": "b" * 64}]}),
        ]:
            with self.assertRaisesRegex(ValueError, "preserve the existing release catalog"):
                require_unchanged_catalog(previous, current, path)

    def test_each_study_keeps_its_own_baseline_and_unselected_gate(self):
        for study_id, profile in STUDY_PUBLICATIONS.items():
            data = {
                "study_id": study_id, profile["baseline_field"]: "r3-8mm-20260920",
                "state": "READY", "selection": profile["selection"],
                "physical_fit": "UNKNOWN", "retention_strength": "UNKNOWN", "slicer_status": "NOT_SLICED",
                "full_print": "ON_HOLD",
            }
            for key in ["visual_approval", "previous_study_unchanged"]:
                if key in profile:
                    data[key] = profile[key]
            validate_live_study(study_id, "r3-8mm-20260920", data, dict(data))
            for key, wrong in [
                ("state", "INPUT_WAIT"), ("selection", "SELECTED"), ("full_print", "APPROVED"),
                ("physical_fit", "PASS"), ("slicer_status", "SLICED"),
                (profile["baseline_field"], "another-revision"),
            ]:
                changed = {**data, key: wrong}
                with self.assertRaises(ValueError):
                    validate_live_study(study_id, "r3-8mm-20260920", changed, dict(changed))
            with self.assertRaisesRegex(ValueError, "stale"):
                validate_live_study(study_id, "r3-8mm-20260920", {**data, "source_commit": "stale"}, data)
            if "visual_approval" in profile:
                approved = {**data, "visual_approval": "APPROVED"}
                with self.assertRaisesRegex(ValueError, "visual_approval"):
                    validate_live_study(study_id, "r3-8mm-20260920", approved, dict(approved))
            if "previous_study_unchanged" in profile:
                changed = {**data, "previous_study_unchanged": "replaced"}
                with self.assertRaisesRegex(ValueError, "previous_study_unchanged"):
                    validate_live_study(study_id, "r3-8mm-20260920", changed, dict(changed))


if __name__ == "__main__":
    unittest.main()
