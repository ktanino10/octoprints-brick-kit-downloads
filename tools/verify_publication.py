"""Verify a deployed revision anonymously, fetching changed files rather than old binary history."""

import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
import re
import subprocess
import time
from urllib.error import HTTPError
from urllib.parse import quote, urlsplit, urlunsplit
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://ktanino10.github.io/octoprints-brick-kit-downloads/"
RELEASE_BASE = "https://github.com/ktanino10/octoprints-brick-kit-downloads/releases/download/"
HEADERS = {"User-Agent": "Octoprints-public-revision-verifier/1.0",
           "Accept-Encoding": "identity", "Cache-Control": "no-cache"}
STUDY_PUBLICATIONS = {
    "shape-study-20260920": {
        "filename": "shape-study.json", "baseline_field": "baseline_revision", "selection": "UNSELECTED",
    },
    "mona-likeness-360-20260921": {
        "filename": "mona-study.json", "baseline_field": "current_revision_unchanged", "selection": "NOT_SELECTED",
        "visual_approval": "PENDING",
    },
    "mona-fine-c-refinement-20260921": {
        "filename": "mona-refinement.json", "baseline_field": "current_revision_unchanged", "selection": "NOT_SELECTED",
        "visual_approval": "PENDING", "previous_study_unchanged": "mona-likeness-360-20260921",
    },
}

def request_url(url):
    parsed = urlsplit(url)
    return urlunsplit((parsed.scheme, parsed.netloc, quote(parsed.path, safe="/%"), parsed.query, parsed.fragment))


def get_json(url):
    with urlopen(Request(request_url(url), headers=HEADERS), timeout=60) as response:
        if response.status != 200:
            raise ValueError(f"Unexpected status {response.status}: {url}")
        return json.load(response)


def verify_bytes(url, size, digest):
    if not url.startswith((BASE, RELEASE_BASE)) or urlsplit(url).username:
        raise ValueError("Anonymous validation must stay within the authorized public project")
    count = 0
    actual = hashlib.sha256()
    with urlopen(Request(request_url(url), headers=HEADERS), timeout=120) as response:
        if response.status != 200:
            raise ValueError(f"Anonymous GET failed: {url}: {response.status}")
        while block := response.read(1024 * 1024):
            actual.update(block)
            count += len(block)
    if count != size or actual.hexdigest() != digest:
        raise ValueError(f"Public bytes/hash differ from the verified local file: {url}")
    return {"url": url, "bytes": count, "sha256": actual.hexdigest(), "status": 200, "authentication": "none"}


def require_unchanged_catalog(previous, inventory, path):
    entry = next((entry for entry in inventory["files"] if entry["path"] == path), None)
    if not entry or not previous.get(path) or previous[path] != entry["sha256"]:
        raise ValueError("A shape-only publication must preserve the existing release catalog")


def validate_live_study(study_id, revision, study, expected_study):
    profile = STUDY_PUBLICATIONS[study_id]
    if study != expected_study or study.get("study_id") != study_id or study.get(profile["baseline_field"]) != revision:
        raise ValueError("The live study record is stale or differs from its checked inputs")
    flags = {"state": "READY", "selection": profile["selection"], "physical_fit": "UNKNOWN",
             "retention_strength": "UNKNOWN", "slicer_status": "NOT_SLICED", "full_print": "ON_HOLD"}
    for key in ["visual_approval", "previous_study_unchanged"]:
        if key in profile:
            flags[key] = profile[key]
    for key, value in flags.items():
        if study.get(key) != value:
            raise ValueError(f"Incorrect study publication or physical gate: {key}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--revision", required=True)
    parser.add_argument("--expected-commit", required=True)
    parser.add_argument("--before", required=True, help="Exact public commit before this publication")
    parser.add_argument("--study", choices=sorted(STUDY_PUBLICATIONS),
                        help="Verify a lightweight study while requiring existing releases to remain unchanged")
    parser.add_argument("--report", type=Path, required=True)
    args = parser.parse_args()
    if not re.fullmatch(r"r3-[a-zA-Z0-9._-]+", args.revision):
        raise ValueError("Invalid revision")
    if not all(re.fullmatch(r"[0-9a-f]{40}", commit) for commit in [args.expected_commit, args.before]):
        raise ValueError("Explicit public commit hashes are required")
    if not args.report.resolve().is_relative_to(ROOT / ".archive-work"):
        raise ValueError("Keep verification output in owned staging")
    deployment = None
    for attempt in range(7):
        try:
            deployment = get_json(BASE + "archive/deployment.json")
            if deployment.get("commit") == args.expected_commit:
                break
        except HTTPError as error:
            if error.code not in {404, 502, 503}:
                raise
        if attempt == 6:
            raise ValueError(f"Pages did not serve the expected commit within the bounded propagation wait: {deployment}")
        print("Waiting for the already completed Pages deployment to propagate.", flush=True)
        time.sleep(10)
    publication = get_json(BASE + "archive/revisions.json")
    expected_publication = json.loads((ROOT / "archive/revisions.json").read_text())
    if publication != expected_publication or publication["current_revision"] != args.revision:
        raise ValueError("The live current revision does not match the checked registry")
    current = next(entry for entry in publication["revisions"] if entry["id"] == args.revision)
    if current["availability"] != "AVAILABLE" or current["status"]["physical_trial"] != "NOT_TESTED":
        raise ValueError("Incorrect current digital availability/physical gate")
    inventory = get_json(BASE + "archive/inventory.json")
    local_inventory = json.loads((ROOT / "archive/inventory.json").read_text())
    if inventory != local_inventory:
        raise ValueError("Public inventory is stale or differs from the checked local inventory")
    original = json.loads(subprocess.check_output(
        ["git", "-C", str(ROOT), "show", f"{args.before}:archive/inventory.json"], text=True))
    previous = {entry["path"]: entry["sha256"] for entry in original["files"]}
    study = None
    if args.study:
        if original["current_revision"] != args.revision:
            raise ValueError("A comparison must retain the previously adopted current revision")
        require_unchanged_catalog(previous, inventory, current["bundle_index_url"].lstrip("/"))
        path = "archive/" + STUDY_PUBLICATIONS[args.study]["filename"]
        study = get_json(BASE + path)
        expected_study = json.loads((ROOT / path).read_text())
        validate_live_study(args.study, args.revision, study, expected_study)
    changed = [entry for entry in inventory["files"] if previous.get(entry["path"]) != entry["sha256"]]
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = [pool.submit(verify_bytes, entry["url"], entry["bytes"], entry["sha256"]) for entry in changed]
        files = [future.result() for future in futures]
    print(f"Anonymous changed/new file checks: {len(files)} exact hashes.", flush=True)
    releases = get_json(BASE + current["bundle_index_url"].lstrip("/"))
    local_releases = json.loads((ROOT / current["bundle_index_url"].lstrip("/")).read_text())
    if releases != local_releases or releases["revision"] != args.revision:
        raise ValueError("Stale or wrong-revision release catalog")
    bundles = [] if args.study else [verify_bytes(entry["url"], entry["bytes"], entry["sha256"]) for entry in releases["bundles"]]
    routes = []
    definitions = json.loads((ROOT / "site/routes.json").read_text())
    for locale in ["ja", "en"]:
        for definition in definitions.values():
            relative = f"{locale}/{definition['localized']}"
            with urlopen(Request(BASE + relative, headers=HEADERS), timeout=45) as response:
                text = response.read().decode("utf-8")
                if response.status != 200 or f'<html lang="{locale}"' not in text:
                    raise ValueError(f"Wrong route language/status: {relative}")
            routes.append(relative)
    catalog = get_json(BASE + current["catalog_url"].lstrip("/"))
    movie = catalog["candidates"][0]["video_url"]
    if not movie.startswith(("/", "artifacts/")):
        movie = f"artifacts/revisions/{args.revision}/{movie}"
    with urlopen(Request(BASE + movie.lstrip("/"), headers={**HEADERS, "Range": "bytes=0-1023"}), timeout=45) as response:
        if response.status != 206 or response.headers.get_content_type() != "video/mp4" or len(response.read()) != 1024:
            raise ValueError("The actual new video does not support anonymous MP4 byte-range delivery")
        video_range = {"status": 206, "mime": "video/mp4", "content_range": response.headers.get("Content-Range")}
    args.report.parent.mkdir(parents=True, exist_ok=True)
    report = {"revision": args.revision, "deployment": deployment, "anonymous_routes": routes,
              "changed_files": files, "new_bundles": bundles, "video_range": video_range,
              "study": study,
              "unchanged_release_catalog_checked_without_redownloading_assets": bool(args.study),
              "old_binary_history_not_redownloaded": True, "physical_fit": "UNKNOWN",
              "slicing": "NOT_SLICED", "full_kit_printing": "ON_HOLD"}
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(f"Public HTTPS verified: {args.revision}, {len(routes)} language routes, {len(files)} changed files, {len(bundles)} new packages.")


if __name__ == "__main__":
    main()
