"""Stage one explicitly READY matrix case, never the producer's growing public tree."""

import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import subprocess
import zipfile

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


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--receipt", type=Path, required=True)
    parser.add_argument("--receipt-sha256", required=True)
    args = parser.parse_args()
    receipt_bytes = args.receipt.read_bytes()
    if sha(receipt_bytes) != args.receipt_sha256:
        raise ValueError("Private READY receipt hash mismatch")
    receipt = json.loads(receipt_bytes)
    if receipt["study_id"] != STUDY or receipt["state"] not in {
        "READY_SINGLE_REPRESENTATIVE_CASE_NOT_ALL15", "READY_SINGLE_CASE_NOT_ALL15",
    }:
        raise ValueError("Only an explicitly finalized individual case may be staged")
    case = receipt["case_id"]
    if not re.fullmatch(r"(mona|copilot|ducky)-p(120|150|200|300|400)", case):
        raise ValueError("Invalid matrix case ID")
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
    proof = {}
    for entry in receipt["read_only_verification_files"]:
        if entry["permission"] != "READ_ONLY_VERIFICATION_NOT_PUBLICATION":
            raise ValueError("Unexpected private verification scope")
        path = Path(entry["path"])
        if not path.resolve().is_relative_to(repo.resolve()):
            raise ValueError("Read-only verification path escapes the authorized project")
        data = committed_bytes(repo, path, commit, entry)
        proof[entry["path"]] = {"bytes": len(data), "sha256": sha(data)}
    releases = receipt["release_files"]
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
