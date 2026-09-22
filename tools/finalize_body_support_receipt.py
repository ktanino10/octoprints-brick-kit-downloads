"""Advance only actually browser- and anonymously-verified new Copilot cases."""

import argparse
import json
from pathlib import Path

from density_requirements import validate_copilot_support_receipt
from install_density_case import encoded, sha
from make_density_receipt import BASE, public_asset_records
from validate_archive import privacy

ROOT = Path(__file__).resolve().parents[1]


def verified_receipt(receipt, catalog, browser, downloads):
    validate_copilot_support_receipt(receipt)
    if (catalog.get("geometry_revision") != "body-support-v2"
            or browser.get("base") != BASE or browser.get("geometry_revision") != "body-support-v2"
            or browser.get("input_wait") is not False or browser.get("errors") or browser.get("failure")
            or downloads.get("geometry_revision") != "body-support-v2"
            or downloads.get("request_id") != receipt["request_id"]
            or downloads.get("catalog_sha256") != receipt["revision_catalog"]["sha256"]
            or downloads.get("base_catalog_sha256") != receipt["base_catalog_sha256"]):
        raise ValueError("Finalization requires exact new-revision public browser and download records")
    cases = {case["id"]: case for case in catalog["cases"] if case["state"] == "READY"}
    tested = browser.get("cases", [])
    if not tested or len(set(tested)) != len(tested) or not set(tested) <= cases.keys():
        raise ValueError("No exact newly verified actual case was supplied")
    asset_map = {item["url"]: item for item in downloads["assets"]}
    media = {(item["case_id"], item["chapter"]): item for item in browser["media"]}
    for identifier in tested:
        case = cases[identifier]
        for file in public_asset_records({"cases": [case], "baselines": {}}):
            entry = asset_map.get(file["url"])
            if not entry or any(entry[key] != file[key] for key in ["bytes", "sha256"]) or entry.get("authentication") != "none":
                raise ValueError("A complete actual package or video was not anonymously hash-verified")
        for chapter, file in case["assets"]["animations"].items():
            playback = media.get((identifier, chapter))
            if not playback or playback.get("played") is not True or playback.get("url") != file["url"]:
                raise ValueError("A new actual movie chapter was not played through the public browser")
        row = next(item for item in receipt["cases"] if item["actual_case_id"] == identifier)
        if row["source_commit"] != case["source_commit"] or row["actual_count"] != case["metrics"]["part_count"]:
            raise ValueError("The verified guide and receipt differ in actual source identity or count")
        row["status"] = "READY"
        row["verification"] = {"public_browser_passed": True, "anonymous_downloads_passed": True}
        row["verified_content_commit"] = downloads["deployment"]["commit"]
        row["verified_pages_run"] = downloads["deployment"]["workflow_run"]
    count = sum(item["status"] == "READY" for item in receipt["cases"])
    receipt["published_verified_case_count"] = count
    receipt["state"] = "READY" if count == 4 else "PARTIAL"
    receipt["verification"] = {"public_browser_passed": count == 4, "anonymous_downloads_passed": count == 4}
    validate_copilot_support_receipt(receipt)
    return receipt


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--browser-report", type=Path, required=True)
    parser.add_argument("--download-report", type=Path, required=True)
    args = parser.parse_args()
    for path in [args.browser_report, args.download_report]:
        if not path.resolve().is_relative_to(ROOT / ".archive-work"):
            raise ValueError("Use only the current owned public QA reports")
    path = ROOT / "archive/copilot-support-free-revision.json"
    receipt = json.loads(path.read_text())
    data = (ROOT / receipt["revision_catalog"]["path"].lstrip("/")).read_bytes()
    if len(data) != receipt["revision_catalog"]["bytes"] or sha(data) != receipt["revision_catalog"]["sha256"]:
        raise ValueError("The current new-revision catalog changed after verification")
    result = verified_receipt(receipt, json.loads(data),
                              json.loads(args.browser_report.read_text()), json.loads(args.download_report.read_text()))
    raw = encoded(result)
    privacy(raw, "new Copilot support-free receipt")
    path.write_bytes(raw)
    print(result["state"], result["published_verified_case_count"], "of 4 new actual Copilot cases publicly verified")


if __name__ == "__main__":
    main()
