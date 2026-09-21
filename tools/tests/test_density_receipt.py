import copy
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tools"))
from make_density_receipt import BASE, STUDY, public_asset_records, receipt_for


class DensityReceiptTests(unittest.TestCase):
    def fixture(self):
        baselines = {"mona": 12435, "copilot": 17873, "ducky": 9669}
        asset = {"url": "https://github.com/ktanino10/octoprints-brick-kit-downloads/releases/download/"
                 + STUDY + "/unit-only.zip", "bytes": 10, "sha256": "a" * 64}
        cases = []
        for character, count in baselines.items():
            for percentage in [120, 150, 200, 300, 400]:
                target = (count * percentage + 50) // 100
                cases.append({"id": f"{character}-p{percentage}", "character": character,
                              "count_percentage": percentage, "state": "READY", "metrics": {"part_count": target},
                              "target_count": target, "actual_ratio": target / count,
                              "assets": {"cg": [asset], "native_cad": [asset], "assembly": [asset],
                                         "animations": {key: asset for key in ["turntable", "radial_explode", "bottom_up"]}}})
        return {"study_id": STUDY, "baselines": {key: {"state": "READY", "metrics": {"part_count": value}}
                                               for key, value in baselines.items()}, "cases": cases}

    def reports(self, catalog):
        browser = {"base": BASE, "input_wait": False, "errors": [], "cases": [case["id"] for case in catalog["cases"]]}
        downloads = {"study_id": STUDY, "catalog_sha256": "b" * 64, "deployment": {"commit": "c" * 40},
                     "assets": [{**entry, "authentication": "none"} for entry in public_asset_records(catalog)],
                     "browser_media_delivery": "PASS"}
        return browser, downloads

    def test_ready_requires_actual_public_browser_and_all_download_hashes(self):
        catalog = self.fixture()
        self.assertEqual(receipt_for(catalog)["state"], "PARTIAL")
        browser, downloads = self.reports(catalog)
        result = receipt_for(catalog, browser=browser, downloads=downloads, catalog_sha256="b" * 64)
        self.assertEqual(result["state"], "READY")
        self.assertEqual(result["public_commit"], {"record": "archive/deployment.json", "field": "commit"})
        self.assertEqual(result["verified_content_commit"], "c" * 40)
        self.assertEqual(len(result["cases"]), 15)

    def test_no_partial_missing_wrong_or_unaudited_case_can_mark_all_complete(self):
        catalog = self.fixture()
        browser, downloads = self.reports(catalog)
        for key in ["cases", "errors", "base"]:
            bad = copy.deepcopy(browser)
            bad[key] = bad[key][:-1] if key == "cases" else ["error"] if key == "errors" else "http://localhost/"
            with self.assertRaises(ValueError):
                receipt_for(catalog, browser=bad, downloads=downloads, catalog_sha256="b" * 64)
        for key in ["catalog_sha256", "browser_media_delivery", "assets"]:
            bad = copy.deepcopy(downloads); bad[key] = [] if key == "assets" else "unverified"
            with self.assertRaises(ValueError):
                receipt_for(catalog, browser=browser, downloads=bad, catalog_sha256="b" * 64)
        changed = self.fixture()
        changed["cases"][0]["metrics"]["part_count"] += 2000
        with self.assertRaises(ValueError):
            receipt_for(changed)

    def test_shared_immutable_downloads_are_checked_once_without_losing_case_links(self):
        catalog = self.fixture()
        self.assertEqual(len(public_asset_records(catalog)), 1)
        self.assertEqual(len(receipt_for(catalog)["cases"]), 15)
        changed = copy.deepcopy(catalog)
        changed["cases"][0]["assets"]["cg"][0] = {**changed["cases"][0]["assets"]["cg"][0], "sha256": "d" * 64}
        with self.assertRaises(ValueError):
            public_asset_records(changed)


if __name__ == "__main__":
    unittest.main()
