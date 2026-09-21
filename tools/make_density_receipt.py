"""Create the small public matrix receipt without inventing a self-referential commit."""

import argparse
import hashlib
import json
from pathlib import Path

from density_requirements import MONA_WHISKER_REQUIREMENT, all_cases, delivery_status, logical_case_id
ROOT = Path(__file__).resolve().parents[1]
STUDY = "part-count-matrix-20260921"
BASE = "https://ktanino10.github.io/octoprints-brick-kit-downloads/"


def file_url(file):
    value = file.get("url") or file["path"]
    return value if value.startswith("https://") else BASE + value.lstrip("/")


def public_asset_records(catalog):
    files = {}
    entries = [case for case in all_cases(catalog) if case["state"] != "INPUT_WAIT"]
    entries.extend(baseline for baseline in catalog["baselines"].values() if baseline["state"] == "READY")
    for case in entries:
        if "assets" not in case:
            raise ValueError("A READY case or baseline has no actual public downloads")
        for group in ["cg", "native_cad", "assembly"]:
            for file in case["assets"][group]:
                url = file_url(file)
                identity = {"url": url, "bytes": file["bytes"], "sha256": file["sha256"]}
                if url in files and files[url] != identity:
                    raise ValueError("Shared download URL has conflicting byte identities")
                files[url] = identity
        for file in case["assets"]["animations"].values():
            url = file_url(file)
            identity = {"url": url, "bytes": file["bytes"], "sha256": file["sha256"]}
            if url in files and files[url] != identity:
                raise ValueError("Shared animation URL has conflicting byte identities")
            files[url] = identity
    return list(files.values())


def receipt_for(catalog, *, browser=None, downloads=None, catalog_sha256=None):
    if catalog["study_id"] != STUDY:
        raise ValueError("Wrong study for matrix receipt")
    cases = []
    expected_combinations = {(character, percentage) for character in ["mona", "copilot", "ducky"]
                             for percentage in [120, 150, 200, 300, 400]}
    combinations = {(case["character"], case["count_percentage"]) for case in catalog["cases"]}
    if len(catalog["cases"]) != 15 or combinations != expected_combinations:
        raise ValueError("A receipt must cover exactly three characters and five count multipliers")
    for case in catalog["cases"]:
        ready = case["state"] != "INPUT_WAIT"
        if ready:
            baseline = catalog["baselines"][case["character"]]
            target = (baseline["metrics"]["part_count"] * case["count_percentage"] + 50) // 100
            actual = case["metrics"]["part_count"]
            if baseline["state"] not in {"COUNTED", "READY"} or target != case["target_count"] or actual <= 0:
                raise ValueError("Receipt contains a missing baseline or incorrect actual count target")
            within = abs(actual - target) <= max(1, target * 0.01)
            if (case["state"] == "READY") != within:
                raise ValueError("A missed target cannot become a completed receipt case")
        cases.append({
            "case_id": case["id"], "logical_case_id": logical_case_id(case), "character": case["character"],
            "multiplier": case["count_percentage"] / 100,
            "target_count": case.get("target_count"),
            "actual_count": case["metrics"]["part_count"] if ready else None,
            "actual_ratio": case.get("actual_ratio"), "status": delivery_status(case),
            "source_status": case["state"], "whisker_support": case.get("whisker_support"),
            "cg_url": file_url(case["assets"]["cg"][0]) if ready else None,
            "animation_url": file_url(case["assets"]["animations"]["turntable"]) if ready else None,
            "animation_urls": {key: file_url(file) for key, file in case["assets"]["animations"].items()} if ready else {},
            "cad_url": file_url(case["assets"]["native_cad"][0]) if ready else None,
            "assembly_url": file_url(case["assets"]["assembly"][0]) if ready else None,
            "viewer_url": BASE + "ja/density-guide.html?case=" + case["id"] if ready else None,
            "viewer_url_en": BASE + "en/density-guide.html?case=" + case["id"] if ready else None,
        })
    all_ready = (len(cases) == 15 and len({case["case_id"] for case in cases}) == 15
                 and all(case["status"] == "READY" for case in cases)
                 and all(row["state"] == "READY" for row in catalog["baselines"].values()))
    browser_passed = downloads_passed = False
    if browser is not None or downloads is not None:
        if browser is None or downloads is None or not all_ready:
            raise ValueError("Final verification needs all fifteen real cases and both public reports")
        expected = {case["case_id"] for case in cases}
        if (browser.get("base") != BASE or browser.get("input_wait") is not False or browser.get("errors") or browser.get("failure")
                or set(browser.get("cases", [])) != expected or len(browser["cases"]) != 15):
            raise ValueError("Actual public browser report does not cover all fifteen cases")
        if downloads.get("catalog_sha256") != catalog_sha256 or downloads.get("study_id") != STUDY:
            raise ValueError("Public download report is not bound to the exact final catalog")
        live = {entry["url"]: entry for entry in downloads.get("assets", [])}
        for file in public_asset_records(catalog):
            evidence = live.get(file["url"])
            if not evidence or any(evidence.get(key) != file[key] for key in ["bytes", "sha256"]) or evidence.get("authentication") != "none":
                raise ValueError("Not every actual category asset was verified anonymously")
        if downloads.get("browser_media_delivery") != "PASS":
            raise ValueError("Final receipt requires actual browser video delivery checks")
        browser_passed = downloads_passed = True
    return {
        "schema_version": 1, "study_id": STUDY,
        "state": "READY" if all_ready and browser_passed and downloads_passed else "PARTIAL",
        "baseline_counts": {name: row["metrics"]["part_count"] if row["state"] != "INPUT_WAIT" else None
                            for name, row in catalog["baselines"].items()},
        "baseline_assumption": "INITIAL_FINE_C_ADAPTED_8MM_COMPARISON_ASSUMPTION_NOT_USER_SELECTION",
        "baseline_references": {name: {
            "status": baseline["state"],
            "cad_url": file_url(baseline["assets"]["native_cad"][0]) if baseline["state"] == "READY" else None,
            "animation_url": file_url(baseline["assets"]["animations"]["turntable"]) if baseline["state"] == "READY" else None,
            "counts_toward_multiplier_cases": False,
        } for name, baseline in catalog["baselines"].items()},
        "public_commit": {"record": "archive/deployment.json", "field": "commit"},
        "verified_content_commit": downloads.get("deployment", {}).get("commit") if downloads else None,
        "catalog_sha256": catalog_sha256, "cases": cases,
        "historical_cases": [{
            "case_id": case["id"], "logical_case_id": logical_case_id(case),
            "counts_toward_requested_delivery": False,
            "viewer_url": BASE + "ja/density-guide.html?case=" + case["id"],
            "viewer_url_en": BASE + "en/density-guide.html?case=" + case["id"],
            "cad_url": file_url(case["assets"]["native_cad"][0]),
        } for case in catalog.get("historical_cases", [])],
        "verification": {"public_browser_passed": browser_passed, "anonymous_downloads_passed": downloads_passed},
        "requested_delivery": {
            "mona_whisker_requirement": MONA_WHISKER_REQUIREMENT,
            "physical_validation": "UNKNOWN",
            "slicer_print_supports": "SEPARATE_UNVALIDATED_CONDITION",
            "data_ready_case_count": sum(case["source_status"] == "READY" for case in cases),
            "requirement_ready_case_count": sum(case["status"] == "READY" for case in cases),
        },
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--browser-report", type=Path)
    parser.add_argument("--download-report", type=Path)
    args = parser.parse_args()
    pointer = json.loads((ROOT / "archive/density-study.json").read_text())
    if pointer["state"] == "INPUT_WAIT":
        raise ValueError("No actual catalog is available; keep the existing INPUT_WAIT receipt")
    source = ROOT / pointer["catalog"]["path"].lstrip("/")
    data = source.read_bytes()
    if hashlib.sha256(data).hexdigest() != pointer["catalog"]["sha256"]:
        raise ValueError("Catalog hash mismatch")
    reports = []
    for path in [args.browser_report, args.download_report]:
        if path is None:
            reports.append(None)
        else:
            if not path.resolve().is_relative_to(ROOT / ".archive-work"):
                raise ValueError("Only current owned public QA reports may finalize the receipt")
            reports.append(json.loads(path.read_text()))
    result = receipt_for(json.loads(data), browser=reports[0], downloads=reports[1], catalog_sha256=pointer["catalog"]["sha256"])
    (ROOT / "archive/block-budget-matrix.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(result["state"], len(result["cases"]), "case receipts; commit resolves through the actual deployment record")


if __name__ == "__main__":
    main()
