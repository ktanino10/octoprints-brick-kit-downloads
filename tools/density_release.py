"""Build versioned Release-only packages from exactly reviewed native/media staging files."""

import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import shutil
import zipfile

from package_revision import inspect_media
from revision_import import check_archive
from validate_archive import PRIVATE

ROOT = Path(__file__).resolve().parents[1]
STUDY = "part-count-matrix-20260921"
RELEASE_LIMIT = 2_000_000_000


def file_sha(path):
    with path.open("rb") as file:
        return hashlib.file_digest(file, "sha256").hexdigest()


def safe_member(name):
    if not isinstance(name, str):
        raise ValueError("Unsafe package member")
    path = PurePosixPath(name)
    if path.is_absolute() or ".." in path.parts or "\\" in name or path.as_posix() != name:
        raise ValueError("Unsafe package member")
    if any(part.startswith(".") for part in path.parts):
        raise ValueError("Hidden/internal files are not release deliverables")
    return path


def scan_stream(path):
    overlap = b""
    with path.open("rb") as file:
        while block := file.read(1024 * 1024):
            if PRIVATE.search(overlap + block):
                raise ValueError("Private metadata remains in a release file: " + path.name)
            overlap = block[-4096:]


def reviewed_files(stage, inventory, blender, native):
    entries = inventory.get("files")
    if not isinstance(entries, list) or not entries:
        raise ValueError("An explicit reviewed file inventory is required")
    names = {entry["path"] for entry in entries}
    if len(names) != len(entries):
        raise ValueError("Duplicate release paths")
    scenes = {entry["path"]: entry for entry in blender}
    documents = {entry["path"]: entry for entry in native["documents"]}
    if set(scenes) != {name for name in names if name.endswith(".blend")}:
        raise ValueError("Every Blender scene needs a matching metadata-only reopen report")
    if set(documents) != {name for name in names if name.endswith(".FCStd")}:
        raise ValueError("Every FreeCAD document needs a relocated reopen report")
    for entry in entries:
        name = entry["path"]
        safe_member(name)
        path = stage / name
        if path.is_symlink() or not path.resolve().is_relative_to(stage) or not path.is_file():
            raise ValueError("Missing or escaping reviewed package member")
        if path.stat().st_size != entry["bytes"] or file_sha(path) != entry["sha256"]:
            raise ValueError("Package input changed after review: " + name)
        scan_stream(path)
        if path.suffix == ".blend":
            record = scenes[name]
            if not all(record.get(flag) is True for flag in [
                "geometry_unchanged", "native_reopened", "material_parameters_unchanged", "animation_parameters_unchanged",
            ]) or record.get("public_sha256") != entry["sha256"]:
                raise ValueError("Blender geometry/material/animation preservation was not verified")
            for prefix in ["geometry", "appearance", "animation"]:
                if record[prefix + "_sha256_before"] != record[prefix + "_sha256_after"]:
                    raise ValueError("Native scene changed while sanitizing metadata")
            inspect_media(path)
        if path.suffix == ".FCStd":
            record = documents[name]
            if not record.get("opened") or not record.get("proxy_free") or record.get("saved") or record.get("recomputed"):
                raise ValueError("Native document was not reopened read-only without executable proxies")
            if record["sha256"] != entry["sha256"]:
                raise ValueError("Native reopened bytes differ from package input")
        if path.suffix in {".FCStd", ".3mf", ".zip"}:
            check_archive(path, stage, names)
        if path.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp", ".mp4"}:
            inspect_media(path)
    return entries


def create_release_zip(stage, destination, entries, *, notes, stamp=(2026, 9, 21, 0, 0, 0)):
    if destination.exists():
        raise ValueError("Never overwrite an existing immutable release package")
    names = [entry["path"] for entry in entries]
    if len(names) != len(set(names)) or any(name in {"README-PUBLIC.txt", "PUBLIC-SHA256SUMS.txt"} for name in names):
        raise ValueError("Duplicate or reserved package member names")
    destination.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(destination, "x", compression=zipfile.ZIP_DEFLATED, compresslevel=6, allowZip64=True) as archive:
        for entry in sorted(entries, key=lambda item: item["path"]):
            name = entry["path"]
            safe_member(name)
            file = stage / name
            if file_sha(file) != entry["sha256"] or file.stat().st_size != entry["bytes"]:
                raise ValueError("Release bytes changed after review")
            member = zipfile.ZipInfo(name, date_time=stamp)
            member.compress_type = zipfile.ZIP_DEFLATED
            member.external_attr = 0o100644 << 16
            with file.open("rb") as source, archive.open(member, "w", force_zip64=True) as output:
                shutil.copyfileobj(source, output, length=1024 * 1024)
        for name, text in [
            ("README-PUBLIC.txt", notes),
            ("PUBLIC-SHA256SUMS.txt", "".join(f"{entry['sha256']}  {entry['path']}\n" for entry in sorted(entries, key=lambda item: item["path"]))),
        ]:
            member = zipfile.ZipInfo(name, date_time=stamp)
            member.compress_type = zipfile.ZIP_DEFLATED
            member.external_attr = 0o100644 << 16
            archive.writestr(member, text.encode())
    if destination.stat().st_size >= RELEASE_LIMIT:
        raise ValueError("This release asset exceeds 2GB; split by case or shared libraries without removing dependencies")
    with zipfile.ZipFile(destination) as archive:
        if archive.testzip() is not None:
            raise ValueError("Generated release package failed CRC verification")
    return {"filename": destination.name, "bytes": destination.stat().st_size, "sha256": file_sha(destination),
            "files": len(entries) + 2, "storage": "GITHUB_RELEASE_ONLY"}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", type=Path, required=True)
    parser.add_argument("--inventory", type=Path, required=True, help="Explicit reviewed public hashes, not a private READY receipt")
    parser.add_argument("--blender-report", type=Path, required=True)
    parser.add_argument("--native-report", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--report", type=Path, required=True)
    parser.add_argument("--case", required=True)
    args = parser.parse_args()
    for path in [args.stage, args.inventory, args.blender_report, args.native_report, args.output, args.report]:
        if path.is_symlink() or not path.resolve().is_relative_to(ROOT / ".archive-work"):
            raise ValueError("Package only reviewed files and reports in owned staging")
    if not re.fullmatch(r"(mona|copilot|ducky)-p(120|150|200|300|400)", args.case):
        raise ValueError("Invalid actual case ID")
    inventory = json.loads(args.inventory.read_text())
    if inventory.get("study_id") != STUDY or inventory.get("case_id") != args.case or inventory.get("review_state") != "VERIFIED_PUBLIC_COPY":
        raise ValueError("The public-copy review is not for this actual case")
    entries = reviewed_files(args.stage.resolve(), inventory, json.loads(args.blender_report.read_text()),
                             json.loads(args.native_report.read_text()))
    if not {"LICENSE", "ATTRIBUTION.md"} <= {entry["path"] for entry in entries}:
        raise ValueError("Preserve the actual license and attribution in every standalone package")
    notes = (
        f"Octoprints / {STUDY} / {args.case}\n"
        "NOT_SELECTED / NOT_SLICED / physical fit, retention and stability UNKNOWN / full printing ON_HOLD.\n"
        "Extract ALL files. Preserve cases/... and shared/... relative paths; do not open an assembly in isolation.\n"
        "Radial and assembly animations explain placement; they are not collision or physical-strength simulations.\n"
        "Use actual BOM IDs. Temporary aids are separate from figure part count and require retention checks before removal.\n"
        "8mm block dimensions are not multiplied by the count ratio. No LEGO/GitHub endorsement or compatibility guarantee.\n"
        "Model derivatives: CC BY-NC 4.0. Preserve LICENSE and ATTRIBUTION.md.\n"
        "No printer connection, slicing profile or G-code is supplied.\n"
        "JA: https://ktanino10.github.io/octoprints-brick-kit-downloads/ja/density-guide.html?case=" + args.case + "\n"
        "EN: https://ktanino10.github.io/octoprints-brick-kit-downloads/en/density-guide.html?case=" + args.case + "\n"
    )
    result = create_release_zip(args.stage.resolve(), args.output, entries, notes=notes)
    args.report.write_text(json.dumps({"study_id": STUDY, "case_id": args.case, **result}, indent=2) + "\n")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
