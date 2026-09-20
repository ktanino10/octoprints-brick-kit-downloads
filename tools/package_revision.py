"""Publish verified staged revision bytes and create new, immutable download packages."""

import argparse
import gzip
import hashlib
import io
import json
from pathlib import Path
import re
import shutil
import subprocess
import zipfile

from revision_import import PRIVATE, check_archive, safe_relative

ROOT = Path(__file__).resolve().parents[1]
MEDIA_FORMATS = {".blend", ".png", ".jpg", ".jpeg", ".webp", ".mp4", ".svg"}
PUBLIC_BASE = "https://ktanino10.github.io/octoprints-brick-kit-downloads/"


def sha(data):
    return hashlib.sha256(data).hexdigest()


def inspect_media(path):
    data = path.read_bytes()
    if path.suffix == ".blend":
        if data.startswith(b"BLENDER"):
            expanded = data
        elif data.startswith(b"\x1f\x8b"):
            expanded = gzip.decompress(data)
        else:
            import zstandard
            with zstandard.ZstdDecompressor().stream_reader(io.BytesIO(data)) as stream:
                expanded = stream.read()
        if PRIVATE.search(expanded):
            raise ValueError(f"Private Blender metadata remains: {path.name}")
    elif path.suffix in {".png", ".jpg", ".jpeg", ".webp"}:
        from PIL import Image
        with Image.open(path) as image:
            if image.getexif() or any(key in image.info for key in ("File", "Date", "Time", "XML:com.adobe.xmp")):
                raise ValueError(f"Private image metadata remains: {path.name}")
    elif path.suffix == ".mp4":
        probe = json.loads(subprocess.check_output(
            ["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(path)]))
        if len(probe["streams"]) != 1 or probe["streams"][0]["codec_type"] != "video":
            raise ValueError(f"Unexpected audio/sensor track: {path.name}")
        if probe["streams"][0]["codec_name"] != "h264":
            raise ValueError(f"Unexpected browser video codec: {path.name}")
        for item in [probe["format"], *probe["streams"]]:
            if any(name in item.get("tags", {}) for name in ["creation_time", "location", "com.apple.quicktime.location.ISO6709"]):
                raise ValueError(f"Private video metadata remains: {path.name}")


def verified_files(stage, inventory, imported, blender, native):
    scope = f"artifacts/revisions/{inventory['revision']}/"
    entries = {entry["path"]: entry for entry in inventory["files"]}
    imports = {entry["path"]: entry for entry in imported["files"]}
    scenes = {entry["path"]: entry for entry in blender}
    documents = {entry["path"]: entry for entry in native["documents"]}
    if set(entries) != set(imports):
        raise ValueError("Source inventory and staging receipt differ")
    if inventory["source_revision"] != imported["source_commit"] or imported["revision"] != inventory["revision"]:
        raise ValueError("Source revision/commit does not match the staged import")
    expected_scenes = {name for name in entries if name.endswith(".blend")}
    expected_native = {name for name in entries if name.endswith(".FCStd")}
    if set(scenes) != expected_scenes or set(documents) != expected_native:
        raise ValueError("Every native Blender/FreeCAD file must have a successful reopen record")
    checked = []
    for name, original in sorted(entries.items()):
        safe_relative(name, scope)
        path = stage / name
        if path.is_symlink() or not path.is_file() or not path.resolve().is_relative_to(stage):
            raise ValueError(f"Unsafe staged file: {name}")
        data = path.read_bytes()
        digest = sha(data)
        if len(data) >= 100_000_000:
            raise ValueError(f"Requires release-only storage before publication, not a normal Git blob: {name}")
        if PRIVATE.search(data):
            raise ValueError(f"Private metadata remains: {name}")
        entry = imports[name]
        if entry["source_sha256"] != original["sha256"]:
            raise ValueError(f"Source hash provenance changed: {name}")
        if path.suffix == ".blend":
            report = scenes[name]
            if not (report["geometry_unchanged"] and report["native_reopened"] and report["material_parameters_unchanged"]
                    and report["geometry_sha256_before"] == report["geometry_sha256_after"]
                    and report["appearance_sha256_before"] == report["appearance_sha256_after"]
                    and report["input_sha256"] == entry["public_sha256"] and report["public_sha256"] == digest):
                raise ValueError(f"Blender geometry/appearance or final bytes do not match the checked scene: {name}")
        elif digest != entry["public_sha256"]:
            raise ValueError(f"Staged file changed after metadata review: {name}")
        if path.suffix == ".FCStd":
            report = documents[name]
            if not (report["opened"] and report["proxy_free"] and not report["saved"] and not report["recomputed"]
                    and report["sha256"] == digest):
                raise ValueError(f"Native reopened bytes do not match: {name}")
        if path.suffix in {".FCStd", ".3mf"}:
            check_archive(path, stage, set(entries))
        if path.suffix in MEDIA_FORMATS:
            inspect_media(path)
        checked.append({"path": name, "bytes": len(data), "sha256": digest,
                        "source_bytes": original["bytes"], "source_sha256": original["sha256"],
                        "relation": "BYTE_IDENTICAL" if digest == original["sha256"] else "PUBLIC_METADATA_DERIVATIVE"})
    return checked


def create_package(path, names, stage, revision, stamp):
    if path.exists():
        raise ValueError(f"Refusing to overwrite a versioned package: {path.name}")
    note = (
        f"Octoprints / {revision}\n\n"
        "DIGITAL PROTOTYPE / NOT_SLICED / PHYSICAL FIT UNKNOWN / FULL-KIT PRINTING ON_HOLD\n"
        "Extract the entire archive. Preserve all relative directories between native assemblies and shared libraries.\n"
        "Do not print every internal CAD construction object. Use the revision's BOM and trial guide.\n"
        "Geometry 3MF is not a configured Bambu Studio project or G-code. No monolithic print mode is implied.\n"
        "Physical feedback from 2026-09-19 belongs to the earlier r2 4 mm trial, not this revision.\n"
        f"Current model/status: {PUBLIC_BASE}en/models.html\n"
        f"Japanese: {PUBLIC_BASE}ja/models.html\n"
        f"Public file checksums: {PUBLIC_BASE}archive/inventory.json\n"
        "Model derivatives: CC BY-NC 4.0. Preserve attribution and modification notices.\n"
        "No LEGO/GitHub endorsement, official manufacturing tolerances, compatibility or physical success is claimed.\n"
        "Feedback photos/videos are separately contributor-owned; their publication permission is not blanket CC licensing.\n"
    )
    extra = {name: (ROOT / name).read_bytes() for name in
             ["LICENSE", "ATTRIBUTION.md", "ATTRIBUTION.en.md", "docs/COMMON-BLOCKS.ja.md", "docs/COMMON-BLOCKS.en.md"]}
    extra["README.txt"] = note.encode()
    payload = {name: (stage / name).read_bytes() for name in sorted(set(names))}
    payload.update(extra)
    payload["SHA256SUMS.txt"] = "".join(f"{sha(data)}  {name}\n" for name, data in sorted(payload.items())).encode()
    path.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(path, "w") as archive:
        for name, data in sorted(payload.items()):
            member = zipfile.ZipInfo(name, date_time=stamp)
            member.compress_type = zipfile.ZIP_DEFLATED
            member.external_attr = 0o100644 << 16
            archive.writestr(member, data, compresslevel=6)
    return len(payload)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--revision", required=True)
    parser.add_argument("--stage-root", type=Path, required=True)
    parser.add_argument("--import-report", type=Path, required=True)
    parser.add_argument("--blender-report", type=Path, required=True)
    parser.add_argument("--native-report", type=Path, required=True)
    parser.add_argument("--release-tag", required=True)
    parser.add_argument("--date", required=True, help="YYYY-MM-DD for deterministic ZIP timestamps")
    args = parser.parse_args()
    if not re.fullmatch(r"r3-[a-zA-Z0-9._-]+", args.revision) or not re.fullmatch(r"archive-[a-zA-Z0-9._-]+", args.release_tag):
        raise ValueError("Invalid revision or release tag")
    stage = args.stage_root.resolve()
    if not stage.is_relative_to(ROOT / ".archive-work") or stage == ROOT / ".archive-work":
        raise ValueError("Package only from an owned staged revision")
    for report_path in [args.import_report, args.blender_report, args.native_report]:
        if not report_path.resolve().is_relative_to(ROOT / ".archive-work"):
            raise ValueError("Reopen reports must come from owned staging")
    target = ROOT / "artifacts/revisions" / args.revision
    release_index = ROOT / "archive/releases" / f"{args.revision}.json"
    portability = ROOT / "archive/portability" / f"{args.revision}.json"
    if target.exists() or release_index.exists() or portability.exists():
        raise ValueError("This revision already has persistent artifacts; never overwrite it")
    inventory = json.loads((ROOT / "archive/sources" / f"{args.revision}.json").read_text())
    imported = json.loads(args.import_report.read_text())
    blender = json.loads(args.blender_report.read_text())
    native = json.loads(args.native_report.read_text())
    verified = verified_files(stage, inventory, imported, blender, native)
    data_contract = json.loads(subprocess.check_output(
        ["node", str(ROOT / "tools/check_revision.mjs"), "--root", str(stage), "--revision", args.revision], text=True))
    native_by_path = {entry["path"]: entry for entry in native["documents"]}
    for candidate in data_contract["candidates"]:
        assembly = native_by_path.get(candidate["native_assembly"].lstrip("/"))
        if assembly is None or assembly["link_instances"] != candidate["part_count"]:
            raise ValueError(f"Native assembly instances do not match manifest IDs: {candidate['id']}")
    names = [entry["path"] for entry in verified]
    common = [name for name in names if Path(name).suffix not in MEDIA_FORMATS]
    media = [name for name in names if Path(name).suffix in MEDIA_FORMATS]
    stamp = (*map(int, args.date.split("-")), 0, 0, 0)
    if len(stamp) != 6:
        raise ValueError("Invalid package date")
    directory = ROOT / ".archive-work" / f"release-{args.revision}"
    definitions = [
        ("native", "共通ブロック・CADと試験データ一式",
         "この版の共有ライブラリー・組立CAD・型別形状・色別配置・BOM・組立候補・少数試験。", common),
        ("media", "共通ブロック・Blenderと画像・動画",
         "同じ版のBlenderシーン、完成形・分解画像、3体のターンテーブルと寸法図。", media),
    ]
    bundles = []
    for suffix, label, description, members in definitions:
        if not members:
            raise ValueError(f"Missing required artifact category: {suffix}")
        filename = f"{args.revision}-{suffix}.zip"
        path = directory / filename
        count = create_package(path, members, stage, args.revision, stamp)
        bundles.append({"filename": filename, "label": label, "description": description,
                        "revision": args.revision, "status": "PROTOTYPE_NOT_SLICED", "file_count": count,
                        "bytes": path.stat().st_size, "sha256": sha(path.read_bytes()),
                        "url": f"https://github.com/ktanino10/octoprints-brick-kit-downloads/releases/download/{args.release_tag}/{filename}"})
    for entry in verified:
        output = ROOT / entry["path"]
        output.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(stage / entry["path"], output)
    release_index.parent.mkdir(parents=True, exist_ok=True)
    release_index.write_text(json.dumps({"schema_version": 1, "revision": args.revision,
                                       "tag": args.release_tag, "bundles": bundles}, ensure_ascii=False, indent=2) + "\n")
    portability.parent.mkdir(parents=True, exist_ok=True)
    portability.write_text(json.dumps({"schema_version": 1, "revision": args.revision,
                                      "source_revision": inventory["source_revision"],
                                      "scope": "Metadata sanitization and native portability, not physical manufacturing approval.",
                                      "blender": blender, "freecad_relocated_reopen": native,
                                      "data_contract": data_contract,
                                      "files": verified}, ensure_ascii=False, indent=2) + "\n")
    (directory / "SHA256SUMS.txt").write_text("".join(f"{entry['sha256']}  {entry['filename']}\n" for entry in bundles))
    print(f"Prepared {len(verified)} verified files and {len(bundles)} immutable bundles. Current pointer is unchanged.")


if __name__ == "__main__":
    main()
