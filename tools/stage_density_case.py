"""Stage one explicitly READY matrix case, never the producer's growing public tree."""

import argparse
import gzip
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import subprocess
import zipfile
from density_requirements import case_identity

from validate_archive import privacy

ROOT = Path(__file__).resolve().parents[1]
STUDY = "part-count-matrix-20260921"


def sha(data):
    return hashlib.sha256(data).hexdigest()


def safe_relative(value):
    if not isinstance(value, str):
        raise ValueError("Invalid allowed file path")
    path = PurePosixPath(value)
    if path.is_absolute() or ".." in path.parts or "\\" in value or value != path.as_posix():
        raise ValueError("Invalid allowed file path")
    return path


def committed_bytes(repo, path, commit, entry):
    relative = path.relative_to(repo).as_posix()
    data = subprocess.check_output(["git", "-C", str(repo), "cat-file", "blob", f"{commit}:{relative}"])
    if len(data) != entry["bytes"] or sha(data) != entry["sha256"]:
        raise ValueError("Pinned input differs from the explicit READY receipt: " + path.name)
    return data


def verify_release_persistence(repo, commit, records):
    for item in records:
        if "reconstruction_path" in item:
            path, digest, expected = item["reconstruction_path"], item["reconstruction_sha256"], item["recipe"]
        else:
            path, digest, expected = item["path"], item["sha256"], item["data"]
        relative = Path(path).relative_to(repo).as_posix()
        raw = subprocess.check_output(["git", "-C", str(repo), "cat-file", "blob", f"{commit}:{relative}"])
        if sha(raw) != digest or json.loads(raw) != expected:
            raise ValueError("Fixed ZIP reconstruction record changed")
        combined = hashlib.sha256()
        length = 0
        for chunk in expected["chunks"]:
            safe_relative(chunk["path"])
            data = committed_bytes(repo, repo / chunk["path"], commit, chunk)
            combined.update(data)
            length += len(data)
        if length != expected["bytes"] or combined.hexdigest() != expected["sha256"]:
            raise ValueError("Fixed chunks do not reconstruct the authorized whole ZIP")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--receipt", type=Path, required=True)
    parser.add_argument("--receipt-sha256", required=True)
    parser.add_argument("--case", help="Select one exact case from a multi-case READY packet")
    args = parser.parse_args()
    receipt_bytes = args.receipt.read_bytes()
    if sha(receipt_bytes) != args.receipt_sha256:
        raise ValueError("Private READY receipt hash mismatch")
    receipt = json.loads(receipt_bytes)
    if receipt["study_id"] != STUDY or receipt["state"] not in {
        "READY_SINGLE_REPRESENTATIVE_CASE_NOT_ALL15", "READY_SINGLE_CASE_NOT_ALL15",
        "READY_FIXED_INCREMENTAL_CASES_NOT_AUTOMATIC_ALL15",
    }:
        raise ValueError("Only an explicitly finalized individual case may be staged")
    case_ids = receipt.get("case_ids", [receipt.get("case_id")])
    case = args.case or (case_ids[0] if len(case_ids) == 1 else None)
    if case is None or case not in case_ids:
        raise ValueError("Select an explicitly authorized case from this READY packet")
    case_identity(case)
    commit = receipt["source_commit"]
    if not re.fullmatch(r"[0-9a-f]{40}", commit):
        raise ValueError("A fixed source commit is required")
    public = Path(receipt["source_root"])
    if public.name != "public" or public.parent.name != STUDY:
        raise ValueError("Source root is not the explicitly authorized study")
    repo = public.parents[3]
    stage = ROOT / ".archive-work" / ("density-" + case)
    if stage.exists():
        raise ValueError("Refusing to overwrite a reviewed case staging directory")
    files = receipt["files"]
    if len({entry["path"] for entry in files}) != len(files):
        raise ValueError("Duplicate publication allowlist entries")
    payload = {}
    for entry in files:
        name = entry["path"]
        safe_relative(name)
        data = committed_bytes(repo, public / name, commit, entry)
        privacy(data, name)
        payload[name] = data
    summary_name = receipt.get("case_summary_path", f"cases/{case}-summary.json")
    summary = json.loads(payload[summary_name])
    model_name = summary["manifest"]["path"]
    model = json.loads(gzip.decompress(payload[model_name]))
    if model["case_id"] != case:
        raise ValueError("Lightweight model differs from the selected actual case")
    selected_names = {summary_name, model_name, "matrix.json", "references.json", "LICENSE", "ATTRIBUTION.md", "README.txt"}
    selected_names.update(image["path"] for image in summary["images"])
    selected_names.update(item["path"] for item in {**model["geometry"], **model["assembly_aid_geometry"]}.values())
    selected_names.update(image["path"] for row in json.loads(payload["references.json"])["rows"] for image in row["images"])
    if not selected_names <= set(payload):
        raise ValueError("The actual case needs a file outside this explicit allowlist")
    files = [entry for entry in files if entry["path"] in selected_names]
    payload = {name: data for name, data in payload.items() if name in selected_names}
    proof = {}
    for entry in receipt["read_only_verification_files"]:
        if entry["permission"] != "READ_ONLY_VERIFICATION_NOT_PUBLICATION":
            raise ValueError("Unexpected private verification scope")
        path = Path(entry["path"])
        if not path.resolve().is_relative_to(repo.resolve()):
            raise ValueError("Read-only verification path escapes the authorized project")
        data = committed_bytes(repo, path, commit, entry)
        proof[entry["path"]] = {"bytes": len(data), "sha256": sha(data)}
    verify_release_persistence(repo, commit, receipt.get("zip_persistence", []))
    releases = [entry for entry in receipt["release_files"] if entry.get("case_id", case) == case]
    if not releases:
        raise ValueError("No actual full native/media package was authorized")
    for entry in releases:
        path = Path(entry["path"])
        if not path.resolve().is_relative_to(public.parent.resolve()) or path.is_symlink():
            raise ValueError("The authorized Release package escapes the source study")
        with path.open("rb") as file:
            digest = hashlib.file_digest(file, "sha256").hexdigest()
        if path.stat().st_size != entry["bytes"] or digest != entry["sha256"]:
            raise ValueError("Source Release package changed after READY")
        with zipfile.ZipFile(path) as package:
            for member in package.infolist():
                safe_relative(member.filename.rstrip("/"))
                if (member.external_attr >> 16) & 0o170000 == 0o120000:
                    raise ValueError("Release package contains a symlink")
            if package.testzip() is not None:
                raise ValueError("Corrupt source Release package")
    stage.mkdir(parents=True)
    light = stage / "light"
    for name, data in payload.items():
        path = light / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
    native_root = stage / "native/artifacts/studies" / STUDY
    native_root.mkdir(parents=True)
    for entry in releases:
        with zipfile.ZipFile(entry["path"]) as package:
            package.extractall(native_root)
    (stage / "source-review.json").write_text(json.dumps({
        "study_id": STUDY, "case_id": case, "source_commit": commit, "source_light_files": files,
        "private_verification_inputs_read": len(proof), "private_inputs_copied": 0,
        "source_release_files": [{key: item[key] for key in ["bytes", "sha256"]} | {"filename": Path(item["path"]).name}
                                 for item in releases],
        "publication_state": "STAGED_PENDING_PORTABILITY_AND_BROWSER",
    }, indent=2) + "\n")
    print(json.dumps({"case": case, "light_files": len(files), "light_bytes": sum(item["bytes"] for item in files),
                      "read_only_proof_files": len(proof), "native_bundle_files": len(list(native_root.rglob("*"))),
                      "stage": str(stage)}, indent=2))


if __name__ == "__main__":
    main()
