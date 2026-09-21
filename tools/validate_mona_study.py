"""Check lightweight Mona evidence without modifying current r3 or earlier comparisons."""

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STUDY = "mona-likeness-360-20260921"
STUDY_ROOT = ROOT / "artifacts/studies" / STUDY
ALLOWED_SUFFIXES = {".json", ".csv", ".jpg", ".jpeg", ".png", ".webp", ".svg", ".html", ".md", ".txt"}


def checked_file(name, expected_hash, expected_size=None, *, study=False):
    path = ROOT / name.lstrip("/")
    limit = STUDY_ROOT if study else ROOT
    if path.is_symlink() or not path.resolve().is_relative_to(limit) or not path.is_file():
        raise ValueError(f"Missing or out-of-scope comparison file: {name}")
    if expected_size is not None and path.stat().st_size != expected_size:
        raise ValueError(f"Changed comparison size: {name}")
    with path.open("rb") as file:
        if hashlib.file_digest(file, "sha256").hexdigest() != expected_hash:
            raise ValueError(f"Changed comparison hash: {name}")
    return path


def main():
    frozen = json.loads((ROOT / "site/mona-study-baseline.json").read_text())
    for entry in frozen["files"]:
        checked_file(entry["path"], entry["sha256"], entry["bytes"])
    earlier = json.loads((ROOT / "archive/sources/shape-study-20260920.json").read_text())
    for entry in earlier["files"]:
        checked_file(entry["path"], entry["sha256"], entry["bytes"])
    publication = json.loads((ROOT / "archive/revisions.json").read_text())
    if publication["current_revision"] != "r3-8mm-20260920":
        raise ValueError("A Mona study cannot replace the current kit")
    pointer = json.loads((ROOT / "archive/mona-study.json").read_text())
    if pointer["state"] == "INPUT_WAIT":
        if "data_url" in pointer or "data_sha256" in pointer or STUDY_ROOT.exists():
            raise ValueError("Pending Mona study contains unapproved candidate inputs")
        print("Mona INPUT_WAIT: no new count/image inputs; all prior study bytes unchanged.")
        return
    summary = checked_file(pointer["data_url"], pointer["data_sha256"], study=True)
    data = json.loads(summary.read_text())
    source_index = json.loads((ROOT / f"archive/sources/{STUDY}.json").read_text())
    for entry in source_index["files"]:
        checked_file(entry["path"], entry["sha256"], entry["bytes"], study=True)
    images = [data["fixed_interface_image"]]
    for group in data["comparisons"]:
        images.extend([group["sheet"]] if group["kind"] == "scale" else group["images"])
    for image in images:
        checked_file(image["path"], image["sha256"], image["bytes"], study=True)
    size = 0
    for path in STUDY_ROOT.rglob("*"):
        if path.is_symlink():
            raise ValueError("Mona study contains a symlink")
        if path.is_file():
            if path.suffix.lower() not in ALLOWED_SUFFIXES and path.name != "LICENSE":
                raise ValueError(f"Native/large payload is outside the Mona comparison scope: {path.name}")
            size += path.stat().st_size
    if size > 80_000_000:
        raise ValueError("Mona study exceeds its reserved lightweight Pages budget")
    print(f"Mona comparison: {len(images)} verified images, {size} bytes; current r3 and earlier study unchanged.")


if __name__ == "__main__":
    main()
