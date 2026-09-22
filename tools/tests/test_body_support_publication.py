import copy
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tools"))
from finalize_body_support_receipt import verified_receipt
from make_density_receipt import BASE, public_asset_records
from validate_density import body_support_budget


class BodySupportPublicationTests(unittest.TestCase):
    def fixture(self):
        receipt = json.loads((ROOT / "archive/copilot-support-free-revision.json").read_text())
        catalog = json.loads((ROOT / receipt["revision_catalog"]["path"].lstrip("/")).read_text())
        for record in receipt["cases"]:
            if record["status"] != "INPUT_WAIT":
                record["status"] = "PUBLIC_PENDING"
                record["verification"] = {"public_browser_passed": False, "anonymous_downloads_passed": False}
        receipt.update(state="PARTIAL", published_verified_case_count=0,
                       verification={"public_browser_passed": False, "anonymous_downloads_passed": False})
        case = next(item for item in catalog["cases"] if item["state"] == "READY")
        browser = {"base": BASE, "geometry_revision": "body-support-v2", "input_wait": False,
                   "errors": [], "cases": [case["id"]],
                   "media": [{"case_id": case["id"], "chapter": name, "url": file["url"], "played": True}
                             for name, file in case["assets"]["animations"].items()]}
        downloads = {"geometry_revision": "body-support-v2", "request_id": receipt["request_id"],
                     "catalog_sha256": receipt["revision_catalog"]["sha256"],
                     "base_catalog_sha256": receipt["base_catalog_sha256"],
                     "deployment": {"commit": "a" * 40, "workflow_run": "UNIT_ONLY"},
                     "assets": [{**file, "authentication": "none"}
                                for file in public_asset_records({"cases": [case], "baselines": {}})]}
        return receipt, catalog, browser, downloads

    def test_one_verified_new_case_is_not_four_complete(self):
        receipt, catalog, browser, downloads = self.fixture()
        result = verified_receipt(receipt, catalog, browser, downloads)
        self.assertEqual(result["state"], "PARTIAL")
        self.assertEqual(result["published_verified_case_count"], 1)
        self.assertFalse(any(result["verification"].values()))

    def test_old_or_incomplete_qa_cannot_promote_a_new_revision(self):
        for change in [
            lambda b, d: b.update(geometry_revision=None),
            lambda b, d: b.update(base="http://localhost/"),
            lambda b, d: b["media"].pop(),
            lambda b, d: b["media"][0].update(played=False),
            lambda b, d: d.update(catalog_sha256="0" * 64),
            lambda b, d: d["assets"][0].update(authentication="token"),
            lambda b, d: d["assets"].clear(),
        ]:
            receipt, catalog, browser, downloads = self.fixture()
            change(browser, downloads)
            with self.assertRaises(ValueError):
                verified_receipt(receipt, catalog, browser, downloads)

    def test_budget_counts_actual_new_paths_even_with_identical_bytes(self):
        before = body_support_budget()
        prefix = "artifacts/studies/part-count-matrix-20260921/revisions/body-support-v2/"
        paths = {prefix + "UNIT-ONLY-ONE.json": b"same", prefix + "UNIT-ONLY-TWO.json": b"same"}
        self.assertTrue(all(not (ROOT / name).exists() for name in paths))
        after = body_support_budget(paths)
        self.assertEqual(after["new_body_revision_served_bytes"] - before["new_body_revision_served_bytes"], 8)
        self.assertEqual(after["projected_whole_site_bytes"] - before["projected_whole_site_bytes"], 8)
        old = "artifacts/studies/part-count-matrix-20260921/catalog.json"
        reused = body_support_budget({old: (ROOT / old).read_bytes()})
        self.assertEqual(reused, before)
        with self.assertRaises(ValueError):
            body_support_budget({old: b"changed"})


if __name__ == "__main__":
    unittest.main()
