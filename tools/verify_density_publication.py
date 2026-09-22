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
from density_requirements import validate_copilot_support_receipt
from verify_publication import BASE, HEADERS, get_json, verify_bytes

ROOT = Path(__file__).resolve().parents[1]
STUDY = "part-count-matrix-20260921"


def browser_coverage(catalog, browser, previous_catalog):
    chapters = {"turntable", "radial_explode", "bottom_up"}
    current = {case["id"]: case for case in catalog["cases"] if case["state"] == "READY"}
    previous = {case["id"]: case for case in previous_catalog.get("cases", [])}
    required_cases = {identifier for identifier, case in current.items() if previous.get(identifier) != case}
    baselines = {name: catalog.get("reference_revisions", {}).get(name, row)
                 for name, row in catalog["baselines"].items() if row["state"] == "READY"}
    required_baselines = {name for name, row in baselines.items()
                          if previous_catalog.get("reference_revisions", {}).get(
                              name, previous_catalog.get("baselines", {}).get(name)) != row}
    tested = set(browser.get("cases", []))
    if (browser.get("base") != BASE or browser.get("input_wait") is not False
            or browser.get("errors") or browser.get("failure")
            or not required_cases <= tested <= current.keys()):
        raise ValueError("Public browser checks do not cover every new or changed actual case")
    actual, baseline_actual = set(), set()
    for field, key, records, result in [
        ("media", "case_id", current, actual),
        ("baseline_media", "character", baselines, baseline_actual),
    ]:
        for entry in browser.get(field, []):
            identifier, chapter = entry.get(key), entry.get("chapter")
            if (identifier not in records or chapter not in chapters or entry.get("played") is not True
                    or entry.get("url") != records[identifier]["assets"]["animations"][chapter]["url"]):
                raise ValueError("Public browser media evidence does not match the actual published animation")
            result.add((identifier, chapter))
    if (actual != {(identifier, chapter) for identifier in tested for chapter in chapters}
            or not {(name, chapter) for name in required_baselines for chapter in chapters} <= baseline_actual):
        raise ValueError("Public media checks omit a changed case or baseline chapter")
    references = {row["id"]: row for row in catalog.get("reference_revisions", {}).values()}
    tested_references = set(browser.get("reference_guides", []))
    if not tested_references <= references.keys():
        raise ValueError("Public reference-guide checks include an unknown actual reference")
    reference_media = set()
    for entry in browser.get("reference_media", []):
        identifier, chapter = entry.get("case_id"), entry.get("chapter")
        if (identifier not in tested_references or chapter not in chapters or entry.get("played") is not True
                or entry.get("url") != references[identifier]["assets"]["animations"][chapter]["url"]):
            raise ValueError("Reference guide media does not match its actual public assets")
        reference_media.add((identifier, chapter))
    if reference_media != {(identifier, chapter) for identifier in tested_references for chapter in chapters}:
        raise ValueError("Reference-guide movie coverage is incomplete")
    complete = tested == current.keys() and baseline_actual == {(name, chapter) for name in baselines for chapter in chapters}
    return {
        "browser_media_delivery": "PASS" if complete else "PASS_CHANGED_CASES_AND_BASELINES",
        "browser_cases_verified": sorted(tested),
        "browser_reference_guides_verified": sorted(tested_references),
        "unchanged_cases_not_retested": sorted(current.keys() - tested),
        "browser_baseline_chapters_verified": sorted([name, chapter] for name, chapter in baseline_actual),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--expected-commit", required=True)
    parser.add_argument("--before", required=True)
    parser.add_argument("--body-support", action="store_true", help="Verify only the separate new Copilot support-free publication")
    parser.add_argument("--report", type=Path, required=True)
    parser.add_argument("--browser-report", type=Path, help="Actual public browser/media acceptance report")
    parser.add_argument("--previous-report", type=Path, action="append", default=[],
                        help="Reuse exact already-verified immutable asset digests after a fresh anonymous availability check")
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
    body_receipt = None
    if args.body_support:
        body_receipt = validate_copilot_support_receipt(get_json(BASE + "archive/copilot-support-free-revision.json"))
        if body_receipt != json.loads((ROOT / "archive/copilot-support-free-revision.json").read_text()):
            raise ValueError("The separate Copilot revision receipt is stale")
        if body_receipt.get("base_catalog_sha256") != pointer["catalog"]["sha256"]:
            raise ValueError("The new revision is not bound to the unchanged original matrix")
    catalog_file = body_receipt["revision_catalog"] if args.body_support else pointer["catalog"]
    catalog_path = catalog_file["path"].lstrip("/")
    data = (ROOT / catalog_path).read_bytes()
    if hashlib.sha256(data).hexdigest() != catalog_file["sha256"]:
        raise ValueError("Local matrix catalog hash mismatch")
    catalog = json.loads(data)
    if get_json(BASE + catalog_path) != catalog:
        raise ValueError("Actual public catalog differs from the checked local one")
    delivery_catalog = {**catalog, "baselines": {}} if args.body_support else catalog
    inventory = get_json(BASE + "archive/inventory.json")
    if inventory != json.loads((ROOT / "archive/inventory.json").read_text()):
        raise ValueError("Actual public inventory is stale")
    before = json.loads(subprocess.check_output(["git", "-C", str(ROOT), "show", args.before + ":archive/inventory.json"]))
    previous = {entry["path"]: entry["sha256"] for entry in before["files"]}
    changed = [entry for entry in inventory["files"] if entry["sha256"] != previous.get(entry["path"])]
    with ThreadPoolExecutor(max_workers=4) as pool:
        site = list(pool.map(lambda entry: verify_bytes(entry["url"], entry["bytes"], entry["sha256"]), changed))
    prior_assets = {}
    for path in args.previous_report:
        if not path.resolve().is_relative_to(ROOT / ".archive-work"):
            raise ValueError("Reuse only explicit owned verification reports")
        prior = json.loads(path.read_text())
        if prior.get("study_id") != STUDY:
            raise ValueError("Prior download report belongs to another study")
        for entry in prior.get("assets", []):
            if entry.get("authentication") == "none":
                prior_assets[entry["url"]] = entry
    assets = []
    for entry in public_asset_records(delivery_catalog):
        prior = prior_assets.get(entry["url"])
        if prior and all(prior.get(key) == entry[key] for key in ["bytes", "sha256"]):
            with urlopen(Request(entry["url"], method="HEAD", headers=HEADERS), timeout=60) as response:
                if response.status != 200 or int(response.headers.get("Content-Length", "-1")) != entry["bytes"]:
                    raise ValueError("An earlier verified immutable download is missing or changed in size")
            assets.append({**prior, "availability_rechecked": True, "digest_reused_from_owned_prior_verification": True})
        else:
            assets.append(verify_bytes(entry["url"], entry["bytes"], entry["sha256"]))
        print("Verified actual download:", entry["url"].rsplit("/", 1)[-1], flush=True)
    video_ranges = []
    for address in sorted({file["url"] for file in public_asset_records(delivery_catalog) if file["url"].endswith(".mp4")}):
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
    if args.body_support:
        report.update(geometry_revision="body-support-v2", request_id=body_receipt["request_id"],
                      base_catalog_sha256=pointer["catalog"]["sha256"])
    if args.browser_report:
        if not args.browser_report.resolve().is_relative_to(ROOT / ".archive-work"):
            raise ValueError("Use the current owned public browser report")
        browser = json.loads(args.browser_report.read_text())
        exists = subprocess.run(["git", "-C", str(ROOT), "cat-file", "-e", args.before + ":" + catalog_path],
                                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0
        if args.body_support:
            if browser.get("geometry_revision") != "body-support-v2":
                raise ValueError("Old public browser checks cannot complete the new support-free request")
            previous_catalog = json.loads(subprocess.check_output([
                "git", "-C", str(ROOT), "show", args.before + ":" + catalog_path])) if exists else {"cases": []}
            report.update(browser_coverage(delivery_catalog,
                {**browser, "baseline_media": [], "reference_guides": [], "reference_media": []},
                {**previous_catalog, "baselines": {}}))
        else:
            previous_catalog = json.loads(subprocess.check_output([
                "git", "-C", str(ROOT), "show", args.before + ":" + catalog_path]))
            report.update(browser_coverage(catalog, browser, previous_catalog))
    else:
        report["browser_media_delivery"] = "NOT_CHECKED"
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, indent=2) + "\n")
    print(f"Verified {len(site)} changed site files and {len(assets)} matrix assets anonymously.")


if __name__ == "__main__":
    main()
