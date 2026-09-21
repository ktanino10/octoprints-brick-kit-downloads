"""Verify only new matrix site bytes and versioned downloads anonymously."""

import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
import re
import subprocess
from urllib.request import Request, urlopen

from make_density_receipt import public_asset_records
from verify_publication import BASE, HEADERS, get_json, verify_bytes

ROOT = Path(__file__).resolve().parents[1]
STUDY = "part-count-matrix-20260921"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--expected-commit", required=True)
    parser.add_argument("--before", required=True)
    parser.add_argument("--report", type=Path, required=True)
    parser.add_argument("--browser-report", type=Path, help="Actual public browser/media acceptance report")
    args = parser.parse_args()
    if not all(re.fullmatch(r"[0-9a-f]{40}", value) for value in [args.expected_commit, args.before]):
        raise ValueError("Exact public commits are required")
    if not args.report.resolve().is_relative_to(ROOT / ".archive-work"):
        raise ValueError("Keep QA reports in owned staging")
    deployment = get_json(BASE + "archive/deployment.json")
    if deployment["commit"] != args.expected_commit or deployment["current_revision"] != "r3-8mm-20260920":
        raise ValueError("Pages is stale or the current kit was replaced")
    pointer = get_json(BASE + "archive/density-study.json")
    if pointer != json.loads((ROOT / "archive/density-study.json").read_text()) or pointer["state"] == "INPUT_WAIT":
        raise ValueError("Actual matrix pointer is missing or stale")
    catalog_file = pointer["catalog"]
    catalog_path = catalog_file["path"].lstrip("/")
    data = (ROOT / catalog_path).read_bytes()
    if hashlib.sha256(data).hexdigest() != catalog_file["sha256"]:
        raise ValueError("Local matrix catalog hash mismatch")
    catalog = json.loads(data)
    if get_json(BASE + catalog_path) != catalog:
        raise ValueError("Actual public catalog differs from the checked local one")
    inventory = get_json(BASE + "archive/inventory.json")
    if inventory != json.loads((ROOT / "archive/inventory.json").read_text()):
        raise ValueError("Actual public inventory is stale")
    before = json.loads(subprocess.check_output(["git", "-C", str(ROOT), "show", args.before + ":archive/inventory.json"]))
    previous = {entry["path"]: entry["sha256"] for entry in before["files"]}
    changed = [entry for entry in inventory["files"] if entry["sha256"] != previous.get(entry["path"])]
    with ThreadPoolExecutor(max_workers=4) as pool:
        site = list(pool.map(lambda entry: verify_bytes(entry["url"], entry["bytes"], entry["sha256"]), changed))
    assets = []
    for entry in public_asset_records(catalog):
        assets.append(verify_bytes(entry["url"], entry["bytes"], entry["sha256"]))
        print("Verified actual download:", entry["url"].rsplit("/", 1)[-1], flush=True)
    video_ranges = []
    for address in sorted({file["url"] for file in public_asset_records(catalog) if file["url"].endswith(".mp4")}):
        with urlopen(Request(address, headers={**HEADERS, "Range": "bytes=0-1023"}), timeout=60) as response:
            sample = response.read()
            mime = response.headers.get_content_type()
            if response.status != 206 or mime not in {"video/mp4", "application/octet-stream"} or len(sample) != 1024 or sample[4:8] != b"ftyp":
                raise ValueError("Actual published animation does not provide MP4 byte ranges")
            video_ranges.append({"url": address, "status": 206, "content_range": response.headers.get("Content-Range"),
                                 "content_type": mime, "mp4_ftyp_verified": True,
                                 "final_host": response.url.split("/")[2]})
    report = {"study_id": STUDY, "deployment": deployment, "catalog_sha256": catalog_file["sha256"],
              "changed_site_files": site, "assets": assets, "animation_range_checks": video_ranges,
              "old_history_not_redownloaded": True, "physical_fit": "UNKNOWN", "slicer_status": "NOT_SLICED", "full_print": "ON_HOLD"}
    if args.browser_report:
        if not args.browser_report.resolve().is_relative_to(ROOT / ".archive-work"):
            raise ValueError("Use the current owned public browser report")
        browser = json.loads(args.browser_report.read_text())
        expected = {(case["id"], chapter) for case in catalog["cases"] if case["state"] == "READY"
                    for chapter in ["turntable", "radial_explode", "bottom_up"]}
        actual = {(entry["case_id"], entry["chapter"]) for entry in browser.get("media", []) if entry.get("played") is True}
        if browser.get("base") != BASE or browser.get("errors") or browser.get("failure") or actual != expected:
            raise ValueError("Public media delivery has not passed for every actual case and chapter")
        report["browser_media_delivery"] = "PASS"
    else:
        report["browser_media_delivery"] = "NOT_CHECKED"
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, indent=2) + "\n")
    print(f"Verified {len(site)} changed site files and {len(assets)} matrix assets anonymously.")


if __name__ == "__main__":
    main()
