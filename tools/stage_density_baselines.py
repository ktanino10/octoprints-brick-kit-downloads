"""Stage the three fixed 1x references without counting them as multiplier cases."""

import argparse
import gzip
import hashlib
import json
from pathlib import Path
import subprocess
import zipfile

from stage_density_case import committed_bytes, safe_relative, verify_release_persistence
from validate_archive import privacy

ROOT = Path(__file__).resolve().parents[1]
STUDY = "part-count-matrix-20260921"


def sha(data):
    return hashlib.sha256(data).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--receipt", type=Path, required=True)
    parser.add_argument("--receipt-sha256", required=True)
    args = parser.parse_args()
    receipt_bytes = args.receipt.read_bytes()
    if sha(receipt_bytes) != args.receipt_sha256:
        raise ValueError("Fixed baseline receipt hash mismatch")
    receipt = json.loads(receipt_bytes)
    expected = {f"{character}-fine8-base" for character in ["mona", "copilot", "ducky"]}
    if (receipt["state"] != "READY_THREE_BASELINE_REFERENCES_NOT_MULTIPLIER_CASES"
            or receipt["study_id"] != STUDY or set(receipt["case_ids"]) != expected
            or receipt["multiplier_cases_newly_ready"] != 0):
        raise ValueError("This receipt does not authorize three separate 1x references")
    source_root = Path(receipt["source_root"])
    repo = source_root.parents[3]
    commit = receipt["source_commit"]
    entries = {entry["path"]: entry for entry in receipt["files"]}
    if len(entries) != len(receipt["files"]):
        raise ValueError("Duplicate baseline allowlist paths")
    payload = {}
    for name, entry in entries.items():
        safe_relative(name)
        data = committed_bytes(repo, source_root / name, commit, entry)
        privacy(data, name)
        payload[name] = data
    proof_entries = receipt["read_only_verification_files"]
    for entry in proof_entries:
        if entry.get("permission") != "READ_ONLY_VERIFICATION_NOT_PUBLICATION":
            raise ValueError("Unexpected private baseline proof scope")
        committed_bytes(repo, Path(entry["path"]), commit, entry)
    verify_release_persistence(repo, commit, receipt.get("zip_persistence", []))
    package_entries = {entry["case_id"]: entry for entry in receipt["release_files"]}
    if set(package_entries) != expected:
        raise ValueError("Every baseline needs an actual complete package")
    for baseline in sorted(expected):
        stage = ROOT / ".archive-work" / ("density-" + baseline)
        if stage.exists():
            raise ValueError("Refusing to overwrite staged baseline: " + baseline)
        summary_name = f"cases/{baseline}-summary.json"
        summary = json.loads(payload[summary_name])
        case_name = summary["manifest"]["path"]
        model = json.loads(gzip.decompress(payload[case_name]))
        if model["case_id"] != baseline:
            raise ValueError("Wrong baseline model identity")
        names = {summary_name, case_name, "matrix.json", "references.json", "LICENSE", "ATTRIBUTION.md", "README.txt"}
        names.update(image["path"] for image in summary["images"])
        names.update(descriptor["path"] for descriptor in {**model["geometry"], **model["assembly_aid_geometry"]}.values())
        references = json.loads(payload["references.json"])
        names.update(image["path"] for row in references["rows"] for image in row["images"])
        if not names <= set(payload):
            raise ValueError("A baseline depends on a file outside the explicit compact allowlist")
        package_entry = package_entries[baseline]
        package_path = Path(package_entry["path"])
        if not package_path.resolve().is_relative_to(source_root.parent.resolve()) or package_path.is_symlink():
            raise ValueError("Release ZIP escapes its explicitly authorized study")
        with package_path.open("rb") as file:
            digest = hashlib.file_digest(file, "sha256").hexdigest()
        if package_path.stat().st_size != package_entry["bytes"] or digest != package_entry["sha256"]:
            raise ValueError("Whole baseline ZIP differs from its fixed hash")
        with zipfile.ZipFile(package_path) as package:
            for member in package.infolist():
                safe_relative(member.filename.rstrip("/"))
                if (member.external_attr >> 16) & 0o170000 == 0o120000:
                    raise ValueError("Native package contains a symbolic link")
            if package.testzip() is not None:
                raise ValueError("Corrupt baseline package")
            native = stage / "native/artifacts/studies" / STUDY
            native.mkdir(parents=True)
            package.extractall(native)
        for name in sorted(names):
            output = stage / "light" / name
            output.parent.mkdir(parents=True, exist_ok=True)
            output.write_bytes(payload[name])
        proof_count = sum(f"/{baseline}/" in entry["path"] for entry in proof_entries)
        (stage / "source-review.json").write_text(json.dumps({
            "study_id": STUDY, "case_id": baseline, "kind": "BASELINE_REFERENCE_NOT_MULTIPLIER_CASE",
            "source_commit": commit, "source_light_files": [entries[name] for name in sorted(names)],
            "private_verification_inputs_read": proof_count, "private_inputs_copied": 0,
            "source_release_files": [{"filename": package_path.name, "bytes": package_entry["bytes"],
                                      "sha256": package_entry["sha256"]}],
            "publication_state": "STAGED_PENDING_PORTABILITY_AND_BROWSER",
        }, indent=2) + "\n")
        print(baseline, "staged", len(names), "light files and its actual ZIP; contributes zero to the 15-case count", flush=True)


if __name__ == "__main__":
    main()
