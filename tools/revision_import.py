"""Allowlisted, revision-scoped import of READY native deliverables into owned staging."""

import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import shutil
import subprocess
import xml.etree.ElementTree as ET
import zipfile

from finalize_archive import clean_png
from import_archive import clean_json, sanitize_native

ROOT = Path(__file__).resolve().parents[1]
SUFFIXES = {".json", ".csv", ".md", ".txt", ".html", ".svg", ".png", ".jpg", ".jpeg",
            ".webp", ".mp4", ".blend", ".FCStd", ".step", ".stp", ".stl", ".3mf"}
PRIVATE = re.compile(rb"/Users/|/home/[^/ ]+/|/private/var/|/var/folders/|file:///|"
                     rb"session-state/|github_pat_[A-Za-z0-9_]{30,}|gh[pousr]_[A-Za-z0-9]{25,}")


def sha(data):
    return hashlib.sha256(data).hexdigest()


def safe_relative(value, prefix):
    if not isinstance(value, str) or "\\" in value or "\x00" in value:
        raise ValueError("Invalid artifact path")
    path = PurePosixPath(value)
    if path.is_absolute() or ".." in path.parts or value != path.as_posix() or not value.startswith(prefix):
        raise ValueError(f"Artifact path escapes its revision: {value}")
    if any(part.startswith(".") for part in path.parts):
        raise ValueError(f"Hidden/internal artifact path: {value}")
    if {"frames", "render-frames", "cache", "caches", "logs", "runs", "__pycache__", "node_modules", "venv"} & set(path.parts):
        raise ValueError(f"Runtime/cache path is not a deliverable: {value}")
    if path.suffix not in SUFFIXES:
        raise ValueError(f"Unapproved artifact format: {value}")
    return path


def validate_receipt(receipt):
    if not isinstance(receipt, dict) or receipt.get("schema_version") != 1:
        raise ValueError("Unsupported publication receipt")
    revision = receipt.get("revision", "")
    if not isinstance(revision, str) or not re.fullmatch(r"[a-zA-Z0-9][a-zA-Z0-9._-]*", revision):
        raise ValueError("Invalid revision ID")
    if receipt.get("readiness") != "READY_FOR_PUBLICATION":
        raise ValueError("Source is not READY_FOR_PUBLICATION; do not copy in-progress artifacts")
    if not re.fullmatch(r"[0-9a-f]{40}", str(receipt.get("source_commit", ""))):
        raise ValueError("A fixed source commit is required")
    prefix = f"artifacts/revisions/{revision}/"
    files = receipt.get("files")
    if not isinstance(files, list) or not files:
        raise ValueError("The explicit publication file allowlist is missing")
    paths = set()
    for entry in files:
        if not isinstance(entry, dict):
            raise ValueError("Invalid allowlist entry")
        safe_relative(entry.get("path"), prefix)
        if entry["path"] in paths:
            raise ValueError(f"Duplicate allowlisted path: {entry['path']}")
        if type(entry.get("bytes")) is not int or entry["bytes"] <= 0:
            raise ValueError(f"Invalid artifact byte count: {entry['path']}")
        if not re.fullmatch(r"[0-9a-f]{64}", str(entry.get("sha256", ""))):
            raise ValueError(f"Missing artifact hash: {entry['path']}")
        paths.add(entry["path"])
    if receipt.get("catalog_path") != prefix + "catalog.json" or receipt["catalog_path"] not in paths:
        raise ValueError("The catalog must be allowlisted in this revision")
    if receipt.get("physical_fit") != "UNKNOWN" or receipt.get("slicing") != "NOT_SLICED":
        raise ValueError("Digital readiness cannot imply physical approval or slicing")
    return receipt


def checked_input(source, entry):
    path = source / entry["path"]
    for relative in [PurePosixPath(entry["path"]), *PurePosixPath(entry["path"]).parents]:
        if (source / relative).is_symlink():
            raise ValueError(f"Symlink in source artifact path: {entry['path']}")
    if not path.is_file() or not path.resolve().is_relative_to(source):
        raise ValueError(f"Missing or escaping source artifact: {entry['path']}")
    data = path.read_bytes()
    if len(data) != entry["bytes"] or sha(data) != entry["sha256"]:
        raise ValueError(f"Source artifact changed after READY receipt: {entry['path']}")
    return data


def check_archive(path, scope, available):
    with zipfile.ZipFile(path) as archive:
        if archive.testzip() is not None:
            raise ValueError(f"Corrupt native archive: {path.name}")
        members = archive.infolist()
        for member in members:
            name = PurePosixPath(member.filename)
            if name.is_absolute() or ".." in name.parts or "\\" in member.filename:
                raise ValueError(f"Escaping native archive member: {path.name}: {member.filename}")
            if (member.external_attr >> 16) & 0o170000 == 0o120000:
                raise ValueError(f"Symlink in native archive: {path.name}")
            if name.suffix.lower() in {".py", ".pyc", ".fcmacro", ".sh"}:
                raise ValueError(f"Executable member in native archive: {path.name}")
            if path.suffix == ".3mf" and ("gcode" in member.filename.lower()
                    or member.filename.lower().endswith(("project_settings.config", "slice_info.config"))):
                raise ValueError(f"Geometry-only 3MF contains slicing or machine-profile data: {path.name}")
            data = archive.read(member)
            if PRIVATE.search(data):
                raise ValueError(f"Private metadata remains in native archive: {path.name}: {member.filename}")
        if path.suffix == ".FCStd":
            tree = ET.fromstring(archive.read("Document.xml"))
            if any(prop.get("type") == "App::PropertyPythonObject" for prop in tree.iter("Property")):
                raise ValueError(f"Python proxy in native document: {path.name}")
            for link in tree.iter("XLink"):
                filename = link.get("file")
                if not filename:
                    continue
                if Path(filename).is_absolute() or "\\" in filename:
                    raise ValueError(f"Absolute native dependency: {path.name}")
                target = (path.parent / filename).resolve()
                if not target.is_relative_to(scope) or target.relative_to(scope).as_posix() not in available:
                    raise ValueError(f"Native dependency is not in the same allowlisted bundle: {path.name}: {filename}")


def document_projection(data):
    tree = ET.fromstring(data)
    properties = tree.find("Properties")
    if properties is None:
        raise ValueError("Native document properties are missing")
    for prop in list(properties):
        if prop.get("name") in {"CreatedBy", "LastModifiedBy", "Company", "License", "LicenseURL"}:
            properties.remove(prop)
    return ET.tostring(tree)


def verify_native_streams(source, public):
    with zipfile.ZipFile(source) as before, zipfile.ZipFile(public) as after:
        if before.namelist() != after.namelist():
            raise ValueError(f"Native members changed: {public.name}")
        count = 0
        for name in before.namelist():
            left, right = before.read(name), after.read(name)
            if name == "Document.xml":
                if document_projection(left) != document_projection(right):
                    raise ValueError(f"Native model properties changed: {public.name}")
            elif left != right:
                raise ValueError(f"Native shape/GUI stream changed: {public.name}: {name}")
            else:
                count += 1
    return count


def sanitize_copy(source_root, source, target):
    changes = []
    if target.suffix == ".json":
        original = json.loads(target.read_text())
        sanitized = clean_json(original, source_root)
        if sanitized != original:
            if target.name in {"manifest.json", "prototypes.json"}:
                for field in ["parts", "types", "palette", "metrics", "frame", "origin", "position_origin"]:
                    if original.get(field) != sanitized.get(field):
                        raise ValueError(f"Sanitization would change model data: {target.name}: {field}")
            target.write_text(json.dumps(sanitized, ensure_ascii=False, separators=(",", ":")) + "\n")
            changes.append("Execution/local metadata removed from JSON; model fields unchanged.")
    if target.suffix == ".png":
        pixels = clean_png(target)
        if pixels["removed_chunks"]:
            changes.append("PNG metadata chunks removed; compressed pixels byte-identical.")
    if target.suffix == ".FCStd":
        sanitize_native(target)
        unchanged = verify_native_streams(source, target)
        changes.append(f"Native metadata-only sanitization; {unchanged} shape/GUI streams unchanged.")
    if target.suffix == ".svg":
        tree = ET.fromstring(target.read_bytes())
        for node in tree.iter():
            tag = node.tag.rsplit("}", 1)[-1].lower()
            if tag in {"script", "foreignobject", "iframe"} or any(name.lower().startswith("on") for name in node.attrib):
                raise ValueError(f"Executable SVG content requires review: {target.name}")
            for key, value in node.attrib.items():
                if key.rsplit("}", 1)[-1] in {"href", "src"} and not value.startswith("#"):
                    raise ValueError(f"External SVG reference requires review: {target.name}")
    if target.suffix != ".blend" and PRIVATE.search(target.read_bytes()):
        raise ValueError(f"Private metadata needs explicit format-aware review: {target.name}")
    return changes


def source_inventory(receipt):
    return {
        "schema_version": 1, "revision": receipt["revision"], "source_revision": receipt["source_commit"],
        "readiness": receipt["readiness"], "physical_fit": "UNKNOWN", "slicing": "NOT_SLICED",
        "scope": "Explicitly allowlisted publication deliverables only; no production history, runtime or unrelated works.",
        "files": [{key: entry[key] for key in ("path", "bytes", "sha256")} for entry in receipt["files"]],
    }


def stage_revision(receipt, source, stage):
    validate_receipt(receipt)
    if stage.exists():
        raise ValueError("The revision staging directory already exists; refusing to overwrite")
    available = {entry["path"] for entry in receipt["files"]}
    for entry in receipt["files"]:
        checked_input(source, entry)
    stage.mkdir(parents=True)
    changes = []
    for entry in receipt["files"]:
        data = checked_input(source, entry)
        target = stage / entry["path"]
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        notes = sanitize_copy(source, source / entry["path"], target)
        changes.append({"path": entry["path"], "source_sha256": entry["sha256"],
                        "public_sha256": sha(target.read_bytes()), "changes": notes,
                        "blender_metadata_check": "PENDING" if target.suffix == ".blend" else "NOT_APPLICABLE"})
    for entry in receipt["files"]:
        target = stage / entry["path"]
        if target.suffix in {".FCStd", ".3mf"}:
            check_archive(target, stage, available)
    return changes


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("operation", choices=("inventory", "stage"))
    parser.add_argument("--receipt", type=Path, required=True)
    parser.add_argument("--source", type=Path, required=True)
    args = parser.parse_args()
    receipt = validate_receipt(json.loads(args.receipt.read_text()))
    source = args.source.resolve()
    if source == ROOT or source.is_relative_to(ROOT):
        raise ValueError("The source and public output must be distinct")
    subprocess.run(["git", "-C", str(source), "cat-file", "-e", receipt["source_commit"] + "^{commit}"],
                   check=True, stdout=subprocess.DEVNULL)
    for entry in receipt["files"]:
        checked_input(source, entry)
    inventory = source_inventory(receipt)
    inventory_path = ROOT / "archive/sources" / f"{receipt['revision']}.json"
    if args.operation == "inventory":
        if inventory_path.exists() and json.loads(inventory_path.read_text()) != inventory:
            raise ValueError("An inventory already exists for different bytes; use a new revision")
        inventory_path.parent.mkdir(parents=True, exist_ok=True)
        inventory_path.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n")
        print(json.dumps({"files": len(receipt["files"]), "bytes": sum(entry["bytes"] for entry in receipt["files"]),
                          "formats": dict(Counter(Path(entry["path"]).suffix for entry in receipt["files"])),
                          "over_git_limit": [entry["path"] for entry in receipt["files"] if entry["bytes"] >= 100_000_000]}, indent=2))
        return
    if not inventory_path.exists() or json.loads(inventory_path.read_text()) != inventory:
        raise ValueError("Inventory must be recorded before staging; source bytes must be unchanged")
    stage = ROOT / ".archive-work" / f"import-{receipt['revision']}"
    changes = stage_revision(receipt, source, stage)
    report = ROOT / ".archive-work" / f"import-{receipt['revision']}.json"
    report.write_text(json.dumps({"revision": receipt["revision"], "source_commit": receipt["source_commit"],
                                 "files": changes, "publication_state": "STAGED_PENDING_NATIVE_AND_BROWSER_CHECKS"}, indent=2) + "\n")
    print(f"Staged {len(changes)} approved files. Current revision and public artifact folders were not changed.")


if __name__ == "__main__":
    main()
