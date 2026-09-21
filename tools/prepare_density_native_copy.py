"""Sanitize metadata on owned matrix native copies and preserve exact geometry/pixel streams."""

import argparse
import hashlib
import json
from pathlib import Path
import shutil

from finalize_archive import clean_png
from import_archive import sanitize_native
from revision_import import verify_native_streams

ROOT = Path(__file__).resolve().parents[1]
STUDY = "part-count-matrix-20260921"


def digest(path):
    with path.open("rb") as file:
        return hashlib.file_digest(file, "sha256").hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", type=Path, required=True)
    args = parser.parse_args()
    stage = args.stage.resolve()
    if stage.is_symlink() or not stage.is_relative_to(ROOT / ".archive-work"):
        raise ValueError("Metadata edits are allowed only on owned native staging")
    review = json.loads((stage / "source-review.json").read_text())
    case_id = review["case_id"]
    native = stage / "native"
    scope = native / "artifacts/studies" / STUDY
    reports = [stage / "native-metadata-review.json", stage / "image-metadata-review.json"]
    if any(path.exists() for path in reports):
        raise ValueError("Metadata review already exists; do not silently overwrite audited bytes")
    if any(path.is_symlink() for path in scope.rglob("*")):
        raise ValueError("Native staging contains symbolic links")
    scene = scope / "cases" / case_id / "scene.blend"
    original = stage / "original-scene.blend"
    if original.exists():
        raise ValueError("Original-scene snapshot already exists")
    shutil.copyfile(scene, original)
    backup = stage / "native-original-check"
    backup.mkdir()
    native_records = []
    for file in sorted(scope.rglob("*.FCStd")):
        before = backup / file.relative_to(scope)
        before.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(file, before)
        original_hash = digest(file)
        changed = sanitize_native(file)
        streams = verify_native_streams(before, file)
        native_records.append({"path": file.relative_to(native).as_posix(),
                               "source_sha256": original_hash, "public_sha256": digest(file),
                               "metadata_edits": changed, "geometry_streams_unchanged": streams})
    reports[0].write_text(json.dumps(native_records, indent=2) + "\n")
    image_records = []
    for file in sorted(scope.rglob("*.png")):
        original_hash = digest(file)
        evidence = clean_png(file)
        image_records.append({"path": file.relative_to(native).as_posix(), "source_sha256": original_hash,
                              "public_sha256": digest(file), "pixel_check": evidence})
    reports[1].write_text(json.dumps(image_records, indent=2) + "\n")
    for name in ["LICENSE", "ATTRIBUTION.md"]:
        shutil.copyfile(stage / "light" / name, native / name)
    shutil.copytree(native, stage / "relocated")
    print(case_id, len(native_records), "native metadata-only copies and", len(image_records), "pixel-preserved PNGs")


if __name__ == "__main__":
    main()
