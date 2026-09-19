"""Compare approved inputs with public copies and publish a path-free audit record."""

import argparse
import hashlib
import json
from pathlib import Path
import struct
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]


def sha(data):
    return hashlib.sha256(data).hexdigest()


def png_pixels(data):
    pos = 8
    chunks = []
    while pos < len(data):
        size = struct.unpack_from(">I", data, pos)[0]
        if data[pos + 4:pos + 8] == b"IDAT":
            chunks.append(data[pos + 8:pos + 8 + size])
        pos += size + 12
    return sha(b"".join(chunks))


def document_without_publishing_fields(data):
    tree = ET.fromstring(data)
    for prop in tree.findall("./Properties/Property"):
        if prop.get("name") in {"CreatedBy", "LastModifiedBy", "Company", "License", "LicenseURL"}:
            tree.find("Properties").remove(prop)
    return ET.tostring(tree)


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--source", type=Path, required=True)
args = parser.parse_args()
source = args.source.resolve()
inventory = json.loads((ROOT / "archive/source-inventory.json").read_text())
native = []
images = []
geometry = []
for entry in inventory["files"]:
    name = entry["path"]
    original_path = source / name
    if original_path.is_symlink() or not original_path.resolve().is_relative_to(source):
        raise ValueError(f"Input outside approved root: {name}")
    original = original_path.read_bytes()
    public = (ROOT / name).read_bytes()
    if sha(original) != entry["sha256"]:
        raise ValueError(f"Approved input changed since inventory: {name}")
    if name.endswith(".FCStd"):
        with zipfile.ZipFile(original_path) as old, zipfile.ZipFile(ROOT / name) as new:
            if old.namelist() != new.namelist():
                raise ValueError(f"Native members changed: {name}")
            unchanged = 0
            for member in old.namelist():
                left, right = old.read(member), new.read(member)
                if member == "Document.xml":
                    if document_without_publishing_fields(left) != document_without_publishing_fields(right):
                        raise ValueError(f"Native geometry properties changed: {name}")
                elif left != right:
                    raise ValueError(f"Native shape stream changed: {name}: {member}")
                else:
                    unchanged += 1
            native.append({"path": name, "source_sha256": sha(original), "public_sha256": sha(public),
                           "unchanged_shape_and_gui_members": unchanged,
                           "document_changes": ["document license properties only"],
                           "relative_native_links_preserved": True})
    if name.endswith("/preview.png"):
        if png_pixels(original) != png_pixels(public):
            raise ValueError(f"Rendered pixels changed: {name}")
        images.append({"path": name, "compressed_pixels_sha256": png_pixels(public),
                       "pixel_stream_byte_identical": True, "exif_and_text_metadata_removed": True})
    if Path(name).name in {"manifest.json", "prototypes.json"}:
        left, right = json.loads(original), json.loads(public)
        for field in ("parts", "types", "metrics", "palette", "frame", "position_origin"):
            if left.get(field) != right.get(field):
                raise ValueError(f"Geometry/data changed: {name}: {field}")
        geometry.append({"path": name, "geometry_and_ids_unchanged": True})
report = {
    "schema_version": 1, "date": "2026-09-19",
    "scope": "Public-copy portability and data integrity, not physical fit, retention or manufacturing approval.",
    "source_revision": inventory["source_revision"],
    "source_files_checked_unchanged": len(inventory["files"]),
    "blender": json.loads((ROOT / ".archive-work/blender-portability.json").read_text()),
    "freecad_shape_streams": native,
    "freecad_relocated_reopen": json.loads((ROOT / ".archive-work/freecad-reopen.json").read_text()),
    "rendered_images": images, "data_geometry": geometry,
    "excluded": ["production repository/history", "execution harnesses and runtime environments",
                 "internal conversations and command logs", "machine paths and file-browser history",
                 "original personal photo/video attachments, EXIF, audio and sensor tracks",
                 "temporary render frames, caches and autosave backups"],
    "manufacturing": "PROTOTYPE_NOT_SLICED_PHYSICAL_ISSUES_REPORTED_PRODUCTION_BLOCKED",
}
(ROOT / "archive/portability.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print("Portability:", len(native), "FreeCAD;", len(images), "images;", len(geometry), "geometry datasets")
