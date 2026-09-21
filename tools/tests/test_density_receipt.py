import copy
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tools"))
from make_density_receipt import BASE, STUDY, public_asset_records, receipt_for
from verify_density_publication import browser_coverage


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
                              "source_manifest_sha256": "e" * 64,
                              **({"whisker_support": {
                                  "external_aid_count": 0, "assembly_aid_count": 0,
                                  "status": "DIGITAL_SELF_SUPPORTING_UNTESTED", "physical_validation": "UNKNOWN",
                                  "geometry_revision": "unit-only-support-free", "manifest_sha256": "e" * 64,
                                  "attachment_evidence_sha256": "f" * 64, "sequence_evidence_sha256": "1" * 64,
                                  "all_categories_geometry_match": True,
                              }} if character == "mona" else {}),
                              "assets": {"cg": [asset], "native_cad": [asset], "assembly": [asset],
                                         "animations": {key: asset for key in ["turntable", "radial_explode", "bottom_up"]}}})
        return {"study_id": STUDY, "baselines": {key: {"state": "READY", "metrics": {"part_count": value},
                                                       "assets": copy.deepcopy(cases[0]["assets"])}
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
        self.assertEqual(len(result["baseline_references"]), 3)
        self.assertTrue(all(not entry["counts_toward_multiplier_cases"] for entry in result["baseline_references"].values()))

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

    def test_supported_mona_history_does_not_count_as_new_requirement_completion(self):
        catalog = self.fixture()
        for case in catalog["cases"]:
            if case["character"] == "mona":
                del case["whisker_support"]
        result = receipt_for(catalog)
        self.assertEqual(result["state"], "PARTIAL")
        self.assertEqual(result["requested_delivery"]["data_ready_case_count"], 15)
        self.assertEqual(result["requested_delivery"]["requirement_ready_case_count"], 10)
        for case in result["cases"][:5]:
            self.assertEqual(case["source_status"], "READY")
            self.assertEqual(case["status"], "REQUIRES_WHISKER_REVISION")
        browser, downloads = self.reports(catalog)
        with self.assertRaises(ValueError):
            receipt_for(catalog, browser=browser, downloads=downloads, catalog_sha256="b" * 64)

    def test_incremental_browser_scope_requires_every_changed_case_and_baseline(self):
        previous = self.fixture()
        catalog = copy.deepcopy(previous)
        catalog["cases"][0]["source_commit"] = "c" * 40
        catalog["baselines"]["mona"]["source_commit"] = "c" * 40
        case = catalog["cases"][0]
        browser = {"base": BASE, "input_wait": False, "errors": [], "cases": [case["id"]],
                   "media": [{"case_id": case["id"], "chapter": chapter, "played": True, "url": file["url"]}
                             for chapter, file in case["assets"]["animations"].items()],
                   "baseline_media": [{"character": "mona", "chapter": chapter, "played": True, "url": file["url"]}
                                      for chapter, file in catalog["baselines"]["mona"]["assets"]["animations"].items()]}
        result = browser_coverage(catalog, browser, previous)
        self.assertEqual(result["browser_media_delivery"], "PASS_CHANGED_CASES_AND_BASELINES")
        self.assertEqual(len(result["unchanged_cases_not_retested"]), 14)
        for key in ["cases", "media", "baseline_media"]:
            missing = copy.deepcopy(browser)
            missing[key] = missing[key][:-1]
            with self.assertRaises(ValueError):
                browser_coverage(catalog, missing, previous)
        wrong = copy.deepcopy(browser)
        wrong["media"][0]["url"] = "https://example.invalid/another.mp4"
        with self.assertRaises(ValueError):
            browser_coverage(catalog, wrong, previous)

    def test_historical_geometry_keeps_downloads_but_does_not_add_comparison_slots(self):
        catalog = self.fixture()
        original = copy.deepcopy(catalog["cases"][0])
        catalog["cases"][0].update(id="mona-p120-root-v2", logical_case_id="mona-p120",
                                   geometry_revision="whisker-root-v2")
        catalog["cases"][0]["whisker_support"]["geometry_revision"] = "whisker-root-v2"
        catalog["historical_cases"] = [original]
        result = receipt_for(catalog)
        self.assertEqual(len(result["cases"]), 15)
        self.assertEqual(result["cases"][0]["logical_case_id"], "mona-p120")
        self.assertEqual(result["cases"][0]["case_id"], "mona-p120-root-v2")
        self.assertEqual(result["requested_delivery"]["data_ready_case_count"], 15)
        self.assertFalse(result["historical_cases"][0]["counts_toward_requested_delivery"])
        self.assertTrue(result["historical_cases"][0]["viewer_url"].endswith("?case=mona-p120"))

    def test_reference_actual_count_never_replaces_the_frozen_denominator(self):
        catalog = self.fixture()
        reference = copy.deepcopy(catalog["cases"][0])
        reference.update(id="mona-fine8-base-root-v2", kind="BASELINE_REFERENCE_NOT_MULTIPLIER_CASE",
                         counts_toward_multiplier_cases=False, fixed_count_baseline=12435,
                         actual_count_difference_from_fixed=-24, metrics={"part_count": 12411})
        catalog["reference_revisions"] = {"mona": reference}
        result = receipt_for(catalog)
        self.assertEqual(result["baseline_counts"]["mona"], 12435)
        self.assertEqual(result["reference_revisions"]["mona"]["actual_count"], 12411)
        self.assertEqual(result["reference_revisions"]["mona"]["difference_from_fixed"], -24)
        self.assertEqual(len(result["cases"]), 15)
        self.assertEqual(result["requested_delivery"]["requirement_ready_case_count"], 15)
        reference["fixed_count_baseline"] = 12411
        with self.assertRaises(ValueError):
            receipt_for(catalog)


if __name__ == "__main__":
    unittest.main()
