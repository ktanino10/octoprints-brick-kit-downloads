"""Fail closed on inventory drift, missing deliverables, broken links or private payload data."""

import argparse
from collections import Counter
import csv
import hashlib
from html.parser import HTMLParser
import io
import json
from pathlib import Path
import re
import struct
import subprocess
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
PRIVATE = re.compile(rb"/Users/|/home/[^/ ]+/|/private/var/|/var/folders/|file:///|127\.0\.0\.1|localhost:\d|"
                     rb"(?:creator|parent) session|session-state/|gh[pousr]_[A-Za-z0-9]{25,}|github_pat_[A-Za-z0-9_]{30,}")
LEGACY = {
    "p4-trial-11-parts.3mf": "ce054bdae89885e9dfc0fe8dfdf5871f1b573ba1fdc25f09f24fe503ee11c69f",
    "p4-trial-11-parts.stl": "76fbc0193ab8956fa484dd2d36585993daf1375f5e528bfc080f40849fbbdadb",
    "feedback/2026-09-19/media/trial-feedback-combined.mp4": "e44c57632d5c7760d6e4618a61eb008257f1f1dc4bee8a12cb3831cd7e9092e6",
}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def ensure(condition, message):
    if not condition:
        raise ValueError(message)


def privacy(data, label):
    ensure(PRIVATE.search(data) is None, f"Private metadata in {label}")


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.ids = set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.add(attrs["id"])
        for name in ("href", "src", "poster"):
            value = attrs.get(name)
            if value:
                self.links.append((tag, name, value))


def audit_links(paths):
    parsed = {}
    for path in paths:
        if path.suffix != ".html":
            continue
        parser = Links()
        parser.feed(path.read_text())
        parsed[path] = parser
    for path, parser in parsed.items():
        for tag, attribute, value in parser.links:
            url = urlsplit(value)
            ensure(not value.startswith("/"), f"Root-absolute browser asset breaks project base: {path.name}: {value}")
            if url.scheme or url.netloc:
                ensure(url.scheme == "https", f"Unexpected URL scheme: {path.name}: {value}")
                ensure(tag == "a", f"Third-party runtime request: {path.name}: {value}")
                continue
            target = (path.parent / unquote(url.path)).resolve() if url.path else path
            if target.is_dir():
                target /= "index.html"
            ensure(target.is_relative_to(ROOT), f"Escaping local link: {path.name}: {value}")
            ensure(target.is_file(), f"Missing linked resource: {path.relative_to(ROOT)}: {value}")
            if url.fragment and target in parsed:
                ensure(unquote(url.fragment) in parsed[target].ids, f"Missing section: {path.name}: {value}")


def inspect_zip(path, full):
    with zipfile.ZipFile(path) as z:
        ensure(z.testzip() is None, f"Corrupt archive: {path.name}")
        for item in z.infolist():
            ensure(not item.filename.startswith(("/", "\\")) and ".." not in Path(item.filename).parts,
                   f"Unsafe archive member: {path.name}: {item.filename}")
            ensure((item.external_attr >> 16) & 0o170000 != 0o120000, f"Symlink inside ZIP: {path.name}")
            data = z.read(item)
            privacy(data, f"{path.name}/{item.filename}")
        if path.suffix == ".FCStd":
            tree = ET.fromstring(z.read("Document.xml"))
            for link in tree.iter("XLink"):
                filename = link.get("file")
                if filename:
                    ensure(not Path(filename).is_absolute(), f"Absolute native reference: {path.name}")
                    target = (path.parent / filename).resolve()
                    ensure(target.is_relative_to(ROOT) and target.is_file(), f"Unresolved native link: {path.name}")
            ensure(not any(prop.get("type") == "App::PropertyPythonObject"
                           for prop in tree.iter("Property")), f"Python proxy in native data: {path.name}")


def validate(full):
    inventory = json.loads((ROOT / "archive/inventory.json").read_text())
    files = inventory["files"]
    names = [entry["path"] for entry in files]
    ensure(len(names) == len(set(names)), "Duplicate inventory paths")
    ensure(len(files) == inventory["totals"]["files"], "Inventory total mismatch")
    ensure(sum(entry["bytes"] for entry in files) == inventory["totals"]["bytes"], "Inventory size mismatch")
    ensure(inventory["totals"]["bytes"] < 1_000_000_000, "Pages exceeds 1 GB budget")
    paths = []
    for entry in files:
        path = ROOT / entry["path"]
        ensure(path.resolve().is_relative_to(ROOT) and not path.is_symlink(), f"Unsafe file: {entry['path']}")
        ensure(path.is_file(), f"Missing inventory entry: {entry['path']}")
        data = path.read_bytes()
        ensure(len(data) == entry["bytes"] and sha(data) == entry["sha256"], f"Inventory drift: {entry['path']}")
        ensure(len(data) < 100_000_000, f"GitHub per-file limit: {entry['path']}")
        ensure(entry["url"] == "https://ktanino10.github.io/octoprints-brick-kit-downloads/" + entry["path"], "Download URL mismatch")
        privacy(data, entry["path"])
        if path.suffix in {".FCStd", ".3mf", ".zip"}:
            inspect_zip(path, full)
        if full and path.suffix == ".blend":
            import zstandard
            with zstandard.ZstdDecompressor().stream_reader(io.BytesIO(data)) as reader:
                privacy(reader.read(), entry["path"] + " (decompressed)")
        if full and path.suffix in {".png", ".jpg", ".webp"}:
            from PIL import Image
            with Image.open(path) as image:
                ensure(not image.getexif(), f"EXIF in {entry['path']}")
                if path.suffix == ".png":
                    ensure(not any(key in image.info for key in ["File", "Date", "Time"]), f"PNG metadata in {entry['path']}")
        paths.append(path)
    for name, expected in LEGACY.items():
        ensure(sha((ROOT / name).read_bytes()) == expected, f"Legacy public file changed: {name}")
    feedback = json.loads((ROOT / "feedback/2026-09-19/media-manifest.json").read_text())
    for file in feedback["files"]:
        path = ROOT / "feedback/2026-09-19" / file["path"]
        ensure(path.stat().st_size == file["bytes"] and sha(path.read_bytes()) == file["sha256"], f"Feedback media changed: {file['path']}")
    r2 = ROOT / "artifacts/selected/r2-20260919"
    ensure(len(list((ROOT / "artifacts/phase1").glob("*/scene.blend"))) == 9, "Expected nine Phase1 scenes")
    ensure(len(list((ROOT / "artifacts/phase1").glob("*/preview.png"))) == 9, "Expected nine Phase1 images")
    ensure(len(list((ROOT / "artifacts/phase1").glob("*/turntable.mp4"))) == 3, "Expected three Balanced videos")
    ensure(len(list(r2.glob("*/scene.blend"))) == 3, "Expected three selected scenes")
    ensure(len(list(r2.glob("*/turntable.mp4"))) == 3, "Expected three selected videos")
    ensure(len(list((r2 / "cad/bricks").glob("*.stl"))) == 236, "Expected 236 selected STL types")
    ensure(len(list((r2 / "cad/bricks").glob("*.step"))) == 236, "Expected 236 selected STEP types")
    ensure(len(list((ROOT / "artifacts/cad/bricks").glob("*.stl"))) == 21, "Expected 21 Phase1 basic types")
    ensure(len(list((ROOT / "artifacts/cad/coupons").glob("*.stl"))) == 5, "Expected five historical coupons")
    ensure(len(list((r2 / "cad/aids/parts").glob("*.stl"))) == 2, "Expected two cradle STLs")
    manifests = list((ROOT / "artifacts/phase1").glob("*/manifest.json")) + list(r2.glob("*/manifest.json"))
    for path in manifests:
        manifest = json.loads(path.read_text())
        parts = {part["id"]: part for part in manifest["parts"]}
        with (path.parent / "bom.csv").open(newline="") as file:
            rows = list(csv.DictReader(file))
        ensure(len(rows) == len(parts) and {row["part_id"] for row in rows} == set(parts),
               f"CSV BOM IDs/count differ from manifest: {path.parent.name}")
        expected_summary = Counter()
        for row in rows:
            part = parts[row["part_id"]]
            color = manifest["palette"][part["color_id"]]
            ensure(row["type_id"] == part["type_id"] and row["color"] == color["name"]
                   and row["hex"] == color["hex"], f"CSV BOM type/color drift: {row['part_id']}")
            ensure([float(row[key]) for key in ("x_mm", "y_mm", "z_mm")] == part["position_mm"]
                   and float(row["rotation_z_deg"]) == part["rotation_z_deg"],
                   f"CSV placement drift: {row['part_id']}")
            expected_summary[(part["type_id"], color["name"], color["hex"])] += 1
        with (path.parent / "bom-summary.csv").open(newline="") as file:
            summary = list(csv.DictReader(file))
        count_column = "count" if manifest["schema_version"] == 1 else "quantity"
        ensure(all(count_column in row for row in summary), f"Unexpected summary CSV schema: {path.parent.name}")
        actual_summary = {(row["type_id"], row["color"], row["hex"]): int(row[count_column]) for row in summary}
        ensure(len(summary) == len(actual_summary) and actual_summary == expected_summary,
               f"Summary CSV BOM differs from actual IDs: {path.parent.name}")
    for pitch in ("p4", "p8"):
        trial = r2 / "cad/trial" / pitch
        layout = json.loads((trial / "layout.json").read_text())
        ensure(layout["piece_count"] == 11 and layout["unique_printable_types"] == 7, f"Trial count mismatch: {pitch}")
        for filename in (f"Trial-{pitch}.FCStd", "plate.3mf", "plate.stl", "plate.step"):
            ensure((trial / filename).is_file(), f"Missing native trial deliverable: {pitch}/{filename}")
        with zipfile.ZipFile(trial / "plate.3mf") as z:
            model = ET.fromstring(z.read("3D/3dmodel.model"))
            namespace = {"m": "http://schemas.microsoft.com/3dmanufacturing/core/2015/02"}
            ensure(len(model.findall("m:build/m:item", namespace)) == 11, f"3MF build is not eleven instances: {pitch}")
    audit_links(paths)
    preview_bundle = "viewer/assets/catalog-preview.js"
    ensure(preview_bundle in names, "Missing lazy catalogue rotation bundle")
    ensure(sum(entry["bytes"] for entry in files if entry["group"] == "viewer" and entry["path"] != preview_bundle) < 4_000_000,
           "Existing viewer bundles unexpectedly large")
    ensure(all(entry["bytes"] < 750_000 for entry in files if entry["path"] == preview_bundle),
           "The lazy rotation preview exceeds its separate bundle budget")
    ensure(all(entry["bytes"] < 2_000_000 for entry in files if entry["path"] in
               {"viewer/assets/studio.js", "viewer/assets/density-guide.js", "viewer/assets/catalog-preview.js"}), "A viewer entry bundle exceeds its individual budget")
    if full:
        for path in [p for p in paths if p.suffix == ".mp4"]:
            probe = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", str(path)]))
            ensure(len(probe["streams"]) == 1 and probe["streams"][0]["codec_type"] == "video", f"Non-video track: {path.name}")
            ensure(probe["streams"][0]["codec_name"] == "h264", f"Unexpected browser codec: {path.name}")
            for forbidden in ("creation_time", "location", "com.apple.quicktime.location.ISO6709"):
                ensure(forbidden not in probe["format"].get("tags", {}), f"Private media tag: {path.name}")
    print(json.dumps({"files": len(files), "bytes": inventory["totals"]["bytes"], "groups": dict(Counter(entry["group"] for entry in files)),
                      "local_links": "PASS", "legacy_files": "UNCHANGED", "privacy": "PASS",
                      "physical_status": inventory["physical_status"]}, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--full", action="store_true", help="Also inspect compressed Blender, images and video streams.")
    validate(parser.parse_args().full)
