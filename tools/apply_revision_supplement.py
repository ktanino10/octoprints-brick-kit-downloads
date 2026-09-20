"""Add the explicitly authorized layout supplement before the new revision is committed."""

import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import zipfile

from revision_import import PRIVATE

ROOT = Path(__file__).resolve().parents[1]
REVISION = "r3-8mm-20260920"
PREFIX = f"artifacts/revisions/{REVISION}/"
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--supplement", type=Path, required=True)
parser.add_argument("--source-root", type=Path, required=True)
args = parser.parse_args()
supplement = json.loads(args.supplement.read_text())
if (supplement.get("state") != "SUPPLEMENTAL_ALLOWLIST" or supplement.get("operation") != "ADD_ONLY"
        or supplement.get("revision") != REVISION or supplement.get("source_commit") != "125ecacc0deb8c74819e4c1934ff3729d1a99791"
        or supplement.get("base_ready_receipt_sha256") != "7b26031d2f9d8e978ee35ac729400aceceb8293c46758e2074fe963cf724bee1"):
    raise ValueError("Unexpected supplemental authorization")
expected = {"path": "cad/trial/layout.json", "bytes": 2098384,
            "sha256": "2f4f5a7d085556c1f13eb027c2b9f3a002f8bd0bbf8c1c89c9642c11749e2736"}
if supplement["files"] != [expected]:
    raise ValueError("This supplement authorizes exactly one specified file")
source = args.source_root.resolve() / expected["path"]
if source.is_symlink() or not source.resolve().is_relative_to(args.source_root.resolve()):
    raise ValueError("Unsafe supplemental source")
data = source.read_bytes()
if len(data) != expected["bytes"] or hashlib.sha256(data).hexdigest() != expected["sha256"] or PRIVATE.search(data):
    raise ValueError("Supplemental source hash/size/privacy mismatch")
destination = ROOT / PREFIX / expected["path"]
if destination.exists():
    raise ValueError("Refusing to overwrite a supplemental artifact")
index_path = ROOT / "archive/releases" / f"{REVISION}.json"
index = json.loads(index_path.read_text())
for entry in index["bundles"]:
    if entry["filename"].endswith("-media.zip"):
        continue
    path = ROOT / PREFIX / entry["filename"]
    if subprocess.check_output(["git", "-C", str(ROOT), "ls-files", "--", str(path)], text=True).strip():
        raise ValueError("A committed revision ZIP cannot be amended")
    with zipfile.ZipFile(path) as package:
        if expected["path"] in package.namelist():
            raise ValueError("The bundle already contains this supplement")
destination.parent.mkdir(parents=True, exist_ok=True)
destination.write_bytes(data)
inventory_path = ROOT / "archive/sources" / f"{REVISION}-supplement-001.json"
inventory_path.write_text(json.dumps({
    "schema_version": 1, "revision": REVISION, "source_revision": supplement["source_commit"],
    "base_ready_receipt_sha256": supplement["base_ready_receipt_sha256"],
    "reason": supplement["reason"], "operation": "ADD_ONLY",
    "files": [{**expected, "path": PREFIX + expected["path"]}],
}, indent=2) + "\n")
portability_path = ROOT / "archive/portability" / f"{REVISION}.json"
portability = json.loads(portability_path.read_text())
for entry in index["bundles"]:
    if entry["filename"].endswith("-media.zip"):
        continue
    path = ROOT / PREFIX / entry["filename"]
    if subprocess.check_output(["git", "-C", str(ROOT), "ls-files", "--", str(path)], text=True).strip():
        raise ValueError("A committed revision ZIP cannot be amended")
    with zipfile.ZipFile(path) as package:
        if expected["path"] in package.namelist():
            raise ValueError("The bundle already contains this supplement")
        existing = [(member, package.read(member)) for member in package.infolist()]
    with zipfile.ZipFile(path, "w") as package:
        for member, content in existing:
            package.writestr(member, content)
        member = zipfile.ZipInfo(expected["path"], date_time=(2026, 9, 20, 0, 0, 0))
        member.compress_type = zipfile.ZIP_DEFLATED
        member.external_attr = 0o100644 << 16
        package.writestr(member, data, compresslevel=6)
    entry["file_count"] += 1
    entry["bytes"] = path.stat().st_size
    entry["sha256"] = hashlib.sha256(path.read_bytes()).hexdigest()
    shutil.copyfile(path, ROOT / ".archive-work" / f"release-{REVISION}" / entry["filename"])
    artifact = next(item for item in portability["files"] if item["path"] == PREFIX + entry["filename"])
    artifact.update(bytes=entry["bytes"], sha256=entry["sha256"], relation="PUBLIC_METADATA_AND_AUTHORIZED_SUPPLEMENT_DERIVATIVE")
    artifact["supplement"] = "cad/trial/layout.json, explicitly authorized add-only supplement 001"
portability["files"].append({"path": PREFIX + expected["path"], "bytes": len(data), "sha256": expected["sha256"],
                             "source_bytes": len(data), "source_sha256": expected["sha256"], "relation": "BYTE_IDENTICAL"})
portability["supplement_001"] = {"source_revision": supplement["source_commit"], "reason": supplement["reason"],
                                "existing_source_files_modified": False, "total_approved_files": 585}
portability_path.write_text(json.dumps(portability, ensure_ascii=False, indent=2) + "\n")
index_path.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n")
(ROOT / ".archive-work" / f"release-{REVISION}" / "SHA256SUMS.txt").write_text(
    "".join(f"{entry['sha256']}  {entry['filename']}\n" for entry in index["bundles"]))
print("Added the one approved layout file and included it in both uncommitted native/trial packages; original source and prior releases unchanged.")
