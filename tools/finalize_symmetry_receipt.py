"""Promote only corrected cases with actual public browser, native and anonymous-byte evidence."""

import argparse
import gzip
import json
from pathlib import Path

from install_density_case import encoded, sha
from make_density_receipt import BASE, public_asset_records
from symmetry_requirements import validate_symmetry_receipt
from validate_archive import privacy

ROOT = Path(__file__).resolve().parents[1]


def promote(receipt, catalog, browser, downloads):
    validate_symmetry_receipt(receipt)
    if (browser.get("base") != BASE or browser.get("geometry_revision") != "bilateral-symmetry-v3"
            or browser.get("input_wait") is not False or browser.get("errors") or browser.get("failure")
            or downloads.get("geometry_revision") != "bilateral-symmetry-v3"
            or downloads.get("request_id") != receipt["request_id"]
            or downloads.get("catalog_sha256") != receipt["revision_catalog"]["sha256"]
            or downloads.get("base_catalog_sha256") != receipt["base_catalog_sha256"]):
        raise ValueError("New symmetry cases require matching real public browser and download verification")
    accepted = {item["id"]: item for item in catalog["cases"] if item["state"] == "READY"}
    tested = browser.get("cases", [])
    if not tested or len(set(tested)) != len(tested) or not set(tested) <= accepted.keys():
        raise ValueError("No exact accepted symmetry case was tested")
    assets = {item["url"]: item for item in downloads["assets"]}
    meshes = downloads.get("repository_native_geometry", {})
    if meshes.get("all_anonymous_cors_sha_native_geometry") is not True:
        raise ValueError("The actual native repository geometry was not anonymously verified")
    mesh_files = {row["url"]: row for row in meshes["files"]}
    media = {(row["case_id"], row["chapter"]): row for row in browser["media"]}
    for identifier in tested:
        case = accepted[identifier]
        for file in public_asset_records({"cases": [case], "baselines": {}}):
            actual = assets.get(file["url"])
            if not actual or actual.get("authentication") != "none" or any(actual[key] != file[key] for key in ["bytes", "sha256"]):
                raise ValueError("A complete corrected package or movie has not been anonymously hash-checked")
        for chapter, file in case["assets"]["animations"].items():
            playback = media.get((identifier, chapter))
            if not playback or playback.get("played") is not True or playback.get("url") != file["url"]:
                raise ValueError("An actual corrected movie chapter was not played through public HTTPS")
        raw = (ROOT / case["manifest"]["path"].lstrip("/")).read_bytes()
        if len(raw) != case["manifest"]["bytes"] or sha(raw) != case["manifest"]["sha256"]:
            raise ValueError("The corrected guide changed after public verification")
        guide = json.loads(gzip.decompress(raw))
        for file in guide["geometry_files"]:
            if file.get("storage") != "PUBLIC_REPO_COMMIT":
                continue
            actual = mesh_files.get(file["url"])
            if (not actual or any(actual[key] != file[key] for key in ["bytes", "sha256", "geometry_sha256", "public_commit"])
                    or actual.get("authentication") != "none" or actual.get("decoded_native_geometry_verified") is not True):
                raise ValueError("A corrected native mesh lacks its exact public commit/CORS/decoded-geometry verification")
        row = next(item for item in receipt["cases"] if item["actual_case_id"] == identifier)
        if row["actual_count"] != case["metrics"]["part_count"] or row["source_commit"] != case["source_commit"]:
            raise ValueError("The corrected receipt and actual accepted source identity differ")
        row["status"] = "READY"
        row["verification"] = {"public_browser_passed": True, "anonymous_downloads_passed": True}
        row["verified_content_commit"] = downloads["deployment"]["commit"]
        row["verified_pages_run"] = downloads["deployment"]["workflow_run"]
    count = sum(item["status"] == "READY" for item in receipt["cases"])
    comparisons = receipt.get("comparisons")
    if comparisons and browser.get("symmetry_comparison_sheets"):
        expected_images = {BASE + file["path"].lstrip("/") for file in comparisons["assets"] if file["path"].endswith(".jpg")}
        actual_images = {item["url"] for item in browser["symmetry_comparison_sheets"] if item.get("decoded") is True}
        if (count != 5 or len(expected_images) != 3 or expected_images != actual_images
                or browser.get("symmetry_csv_rows") != 15 or browser.get("symmetry_one_x_unrevised_asymmetry_visible") is not True):
            raise ValueError("All five corrected cases and three real comparisons/CSV/known-asymmetric1x labels must be publicly checked")
        for file in comparisons["assets"]:
            actual = assets.get(BASE + file["path"].lstrip("/"))
            if (not actual or actual.get("authentication") != "none"
                    or any(actual[key] != file[key] for key in ["bytes", "sha256"])):
                raise ValueError("A final bilateral comparison or source snapshot lacks anonymous exact-byte verification")
        comparisons.update(state="READY", verification={"public_browser_passed": True, "anonymous_downloads_passed": True},
                           verified_content_commit=downloads["deployment"]["commit"],
                           verified_pages_run=downloads["deployment"]["workflow_run"])
    complete = count == 5 and comparisons is not None and comparisons.get("state") == "READY"
    receipt["published_verified_case_count"] = count
    receipt["state"] = "READY" if complete else "PARTIAL"
    receipt["verification"] = {"public_browser_passed": complete, "anonymous_downloads_passed": complete}
    validate_symmetry_receipt(receipt)
    return receipt


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--browser-report", type=Path, required=True)
    parser.add_argument("--download-report", type=Path, required=True)
    args = parser.parse_args()
    if any(not path.resolve().is_relative_to(ROOT / ".archive-work") for path in [args.browser_report, args.download_report]):
        raise ValueError("Use only owned actual public-verification records")
    path = ROOT / "archive/copilot-symmetry-revision.json"
    receipt = json.loads(path.read_text())
    raw = (ROOT / receipt["revision_catalog"]["path"].lstrip("/")).read_bytes()
    if len(raw) != receipt["revision_catalog"]["bytes"] or sha(raw) != receipt["revision_catalog"]["sha256"]:
        raise ValueError("Accepted corrected catalog changed")
    updated = promote(receipt, json.loads(raw), json.loads(args.browser_report.read_text()), json.loads(args.download_report.read_text()))
    result = encoded(updated)
    privacy(result, "symmetry publication receipt")
    path.write_bytes(result)
    print(updated["state"], updated["published_verified_case_count"], "of 5 corrected cases publicly verified")


if __name__ == "__main__":
    main()
