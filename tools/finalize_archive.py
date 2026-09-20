"""Generate public thumbnails, portable download bundles and exact file inventory."""

import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import struct
import zipfile
import zlib

ROOT = Path(__file__).resolve().parents[1]
REVISION = "r2-20260919"
TAG = "archive-2026-09-19-r2"
PAGE = "https://ktanino10.github.io/octoprints-brick-kit-downloads/"
RELEASE = f"https://github.com/ktanino10/octoprints-brick-kit-downloads/releases/download/{TAG}/"
SELECTED_ROOT = f"artifacts/selected/{REVISION}"


def digest(data):
    return hashlib.sha256(data).hexdigest()


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def clean_png(path):
    original = path.read_bytes()
    if original[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"Not a PNG: {path}")
    chunks = [original[:8]]
    pos = 8
    removed = []
    idat = []
    while pos < len(original):
        size = struct.unpack_from(">I", original, pos)[0]
        kind = original[pos + 4:pos + 8]
        data = original[pos + 8:pos + 8 + size]
        crc = struct.unpack_from(">I", original, pos + 8 + size)[0]
        if zlib.crc32(kind + data) != crc:
            raise ValueError(f"Bad PNG CRC: {path}")
        if kind in {b"eXIf", b"tEXt", b"zTXt", b"iTXt", b"tIME"}:
            removed.append(kind.decode())
        else:
            chunks.append(original[pos:pos + 12 + size])
        if kind == b"IDAT":
            idat.append(data)
        pos += size + 12
    if removed:
        path.write_bytes(b"".join(chunks))
    return {"path": path.relative_to(ROOT).as_posix(), "removed_chunks": sorted(set(removed)),
            "compressed_pixels_sha256": digest(b"".join(idat)), "pixels_reencoded": False}


def prepare_media():
    from PIL import Image

    report = []
    for path in sorted((ROOT / "artifacts").rglob("preview.png")):
        report.append(clean_png(path))
        group = "selected" if "selected" in path.parts else "phase1"
        target = ROOT / "assets/thumbs" / f"{group}-{path.parent.name}.webp"
        target.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(path) as image:
            thumbnail = image.convert("RGB").resize((640, 640), Image.Resampling.LANCZOS)
            thumbnail.save(target, "WEBP", quality=85, method=6)
    write_json(ROOT / ".archive-work/png-portability.json", report)


def curate_engineering():
    retained = {
        "schema_version", "units", "origin", "up", "revision", "stage", "scope", "result",
        "started_at", "finished_at", "status", "counts", "reference_minima_mm",
        "minimum_material_by_pitch", "coupon_guide", "native_reopen_report", "mesh_validation_report",
        "editing", "limitations", "measured_1x1_reference", "trial_index", "assembly_index",
        "native_certificates", "fresh_native_verification", "mesh_validation",
        "assembly_instruction_metadata", "manifest_metadata_mismatch",
    }
    for name in ("artifacts/cad/evidence.json", f"{SELECTED_ROOT}/cad/evidence.json",
                 f"{SELECTED_ROOT}/cad/aids/evidence.json"):
        path = ROOT / name
        data = json.loads(path.read_text())
        data = {key: value for key, value in data.items() if key in retained}
        data["archive_scope"] = "Historical native geometry checks, not physical fit, retention, or production approval."
        data["public_copy_note"] = "Execution receipts, machine paths and runtime details excluded; use archive/inventory.json for public hashes."
        write_json(path, data)


def add_zip(z, name, content):
    entry = zipfile.ZipInfo(name, date_time=(2026, 9, 19, 0, 0, 0))
    entry.compress_type = zipfile.ZIP_DEFLATED
    entry.external_attr = 0o100644 << 16
    z.writestr(entry, content, compresslevel=6)


def bundle(path, files, label):
    readme = (
        f"{label}\n\n"
        "試作 / NOT_SLICED / 全数印刷は保留。4 mm初回試作で小ささと穴詰まりの報告あり。\n"
        "物理嵌合・保持力・全体組立は未確認。新案の採用・印刷指示ではありません。\n\n"
        "ZIPを全て展開してください。FreeCADのassemblies/*.FCStdは隣のlibraries/を相対参照します。\n"
        "artifacts/selected/r2-20260919/cad/assemblies/ を開き、libraries/は移動・改名しないでください。\n"
        "Blenderは自己完結したメッシュを含みます。画像・動画・BOMの版を混同しないでください。\n"
        "公開用に付随メタデータを整理しています。形状の再生成は行っていません。\n"
        "当時の資料内のハッシュは当時の入力に対する記録です。現在のファイルはSHA256SUMS.txtで照合します。\n\n"
        f"公開記録: {PAGE}\n"
        f"全ファイル目録: {PAGE}archive/inventory.json\n"
        "モデルはCC BY-NC 4.0。帰属・改変表示・ライセンスを維持してください。\n"
        "GitHub / LEGOによる推奨・認証・互換性を示すものではありません。\n"
    ).encode()
    payload = {name: (ROOT / name).read_bytes() for name in sorted(set(files))}
    payload.update({
        "LICENSE": (ROOT / "LICENSE").read_bytes(),
        "ATTRIBUTION.md": (ROOT / "ATTRIBUTION.md").read_bytes(),
        "README.txt": readme,
        "STATUS.json": (ROOT / "archive/status.json").read_bytes(),
    })
    payload["SHA256SUMS.txt"] = "".join(f"{digest(data)}  {name}\n" for name, data in sorted(payload.items())).encode()
    path.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(path, "w") as z:
        for name, data in sorted(payload.items()):
            add_zip(z, name, data)
    return len(payload)


def all_files(base):
    return [p.relative_to(ROOT).as_posix() for p in sorted((ROOT / base).rglob("*"))
            if p.is_file() and p.suffix != ".blend1"]


def make_bundles():
    review = [name for name in all_files("artifacts/phase1")
              if Path(name).name in {"manifest.json", "bom.csv", "bom-summary.csv", "preview.png"}]
    bundle(ROOT / "artifacts/phase1/review-data.zip", review, "Phase1 / 候補9種レビュー用の公開派生パッケージ")
    packages = [
        ("phase1-candidates.zip", "Phase1・候補9種", "9つのBlenderシーン、画像・Balanced動画・BOM・配置。", "phase1",
         [name for name in all_files("artifacts/phase1") if not name.endswith("review-data.zip")]),
        ("phase1-cad.zip", "Phase1・旧CAD一式", "21基本型と6 mm嵌合クーポン5個、ネイティブCAD・STEP/STL。旧版の検討用です。", "phase1",
         all_files("artifacts/cad")),
        ("selected-r2-scenes.zip", "選定r2・シーンと記録", "選定3種のBlender、実画像・動画、個別/集計BOM、配置・組立候補。", REVISION,
         [name for name in all_files(SELECTED_ROOT) if "/cad/" not in name] + all_files("design")),
        ("selected-r2-cad.zip", "選定r2・CAD一式", "236型、共有ライブラリー、相対リンク付き組立3体、4/8 mm各11部品の試験、左右受け台。", REVISION,
         all_files(f"{SELECTED_ROOT}/cad") + [f"{SELECTED_ROOT}/TRIAL-GUIDE.md", f"{SELECTED_ROOT}/fit-results-blank.csv"]),
    ]
    entries = []
    for filename, label, description, revision, files in packages:
        path = ROOT / ".archive-work/releases" / filename
        count = bundle(path, files, label)
        entry = {"filename": filename, "label": label, "description": description, "revision": revision,
                 "status": "PROTOTYPE_NOT_SLICED", "file_count": count, "bytes": path.stat().st_size,
                 "sha256": digest(path.read_bytes()), "url": RELEASE + filename}
        entries.append(entry)
        print(label, count, path.stat().st_size, flush=True)
    write_json(ROOT / "archive/bundles.json", {"schema_version": 1, "tag": TAG, "bundles": entries})
    (ROOT / ".archive-work/releases/SHA256SUMS.txt").write_text(
        "".join(f"{entry['sha256']}  {entry['filename']}\n" for entry in entries))


def classify(name):
    if name.startswith("artifacts/revisions/"):
        revision = Path(name).parts[2]
        group = "common-trial" if {"trial", "trials"} & set(Path(name).parts[3:]) else "common"
        return group, revision
    if name.startswith("assets/thumbs/revisions/"):
        return "common", Path(name).parts[3]
    if Path(name).name.startswith("COMMON-BLOCKS"):
        return "design", "r3-8mm-20260920"
    if name.startswith("feedback/"):
        return "feedback", "physical-feedback-2026-09-19"
    if name.startswith("p4-trial") or "/cad/trial/" in name or "/cad/aids/" in name or Path(name).name in {"TRIAL-GUIDE.md", "fit-results-blank.csv"}:
        return "trial", REVISION
    if name.startswith(("artifacts/phase1/", "artifacts/cad/", "assets/thumbs/phase1-")):
        return "phase1", "phase1"
    if name.startswith(("artifacts/selected/", "assets/thumbs/selected-")):
        return "selected", REVISION
    if name.startswith("viewer/"):
        return "viewer", "public-viewer-2026-09-19"
    if name.startswith(("design/", "archive/", "docs/")):
        return "design", REVISION
    return "site", "public-archive-2026-09-19"


def make_inventory():
    source = {entry["path"]: entry for entry in json.loads((ROOT / "archive/source-inventory.json").read_text())["files"]}
    for inventory in sorted((ROOT / "archive/sources").glob("*.json")):
        for entry in json.loads(inventory.read_text())["files"]:
            if entry["path"] in source:
                raise ValueError(f"Duplicate imported source artifact: {entry['path']}")
            source[entry["path"]] = entry
    publication = json.loads((ROOT / "archive/revisions.json").read_text())
    names = all_files("artifacts") + all_files("design") + all_files("feedback") + all_files("assets")
    names += all_files("viewer/assets") + ["viewer/index.html"]
    names += all_files("ja") + all_files("en") + all_files("docs")
    names += ["README.en.md", "ATTRIBUTION.en.md", "models.html", "assembly.html", "archive/revisions.json"]
    names += all_files("archive/releases") + all_files("archive/sources") + all_files("archive/portability")
    names += ["p4-trial-11-parts.3mf", "p4-trial-11-parts.stl", "index.html", "downloads.html",
              "feedback.html", "history.html", "LICENSE", "ATTRIBUTION.md", "README.md",
              "archive/status.json", "archive/portability.json", "archive/source-inventory.json",
              "archive/bundles.json"]
    entries = []
    for name in sorted(set(names)):
        path = ROOT / name
        if path.is_symlink() or not path.resolve().is_relative_to(ROOT):
            raise ValueError(f"Unsafe published path: {name}")
        data = path.read_bytes()
        group, revision = classify(name)
        entry = {"path": name, "group": group, "revision": revision,
                 "format": path.suffix.lstrip(".").upper() or "TEXT",
                 "bytes": len(data), "sha256": digest(data), "url": PAGE + name,
                 "status": "PROTOTYPE_NOT_SLICED" if group in {"selected", "trial", "phase1"} else "ARCHIVE_RECORD"}
        if name in source:
            entry["source_sha256"] = source[name]["sha256"]
            entry["source_bytes"] = source[name]["bytes"]
            entry["relation"] = "BYTE_IDENTICAL" if entry["sha256"] == entry["source_sha256"] else "PUBLIC_METADATA_OR_PRESENTATION_DERIVATIVE"
        if name.startswith("assets/thumbs/") and not name.startswith("assets/thumbs/revisions/"):
            prefix, candidate = path.stem.split("-", 1)
            entry["derived_from"] = f"{SELECTED_ROOT if prefix == 'selected' else 'artifacts/phase1'}/{candidate}/preview.png"
            entry["relation"] = "RESIZED_WEBP_FROM_ACTUAL_RENDER"
        entries.append(entry)
    write_json(ROOT / "archive/inventory.json", {
        "schema_version": 1, "archive_revision": TAG if publication["current_revision"] == REVISION else publication["current_revision"], "units": "bytes",
        "scope": "All approved deliverables, feedback, served viewer and portal assets. Inventory/checksum files exclude themselves.",
        "physical_status": "REVISION_SPECIFIC_PHYSICAL_VALIDATION_PENDING_PRODUCTION_BLOCKED",
        "current_revision": publication["current_revision"],
        "revision_status": {entry["id"]: entry["status"] for entry in publication["revisions"]},
        "files": entries, "totals": {"files": len(entries), "bytes": sum(f["bytes"] for f in entries),
                                    "groups": dict(Counter(f["group"] for f in entries))},
    })
    (ROOT / "archive/SHA256SUMS.txt").write_text("".join(f"{entry['sha256']}  {entry['path']}\n" for entry in entries))
    print("Inventory", len(entries), sum(entry["bytes"] for entry in entries), flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("operation", choices=("prepare", "bundles", "inventory"))
    args = parser.parse_args()
    if args.operation != "inventory" and (ROOT / "site/immutable-artifacts.json").exists():
        parser.error("Historical artifacts are immutable. Import/package a new revision instead of preparing or rebundling Phase1/r2.")
    if args.operation == "prepare":
        prepare_media()
        curate_engineering()
    elif args.operation == "bundles":
        make_bundles()
    else:
        make_inventory()


if __name__ == "__main__":
    main()
