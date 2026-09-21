"""Protect the first Mona pilot while checking the separate compact refinement payload."""

import json
from pathlib import Path

from validate_mona_study import checked_file, ALLOWED_SUFFIXES

ROOT = Path(__file__).resolve().parents[1]
STUDY = "mona-fine-c-refinement-20260921"
FOLDER = ROOT / "artifacts/studies" / STUDY


def main():
    baseline = json.loads((ROOT / "site/mona-refinement-baseline.json").read_text())
    for entry in baseline["files"]:
        checked_file(entry["path"], entry["sha256"], entry["bytes"])
    previous = json.loads((ROOT / "archive/sources/mona-likeness-360-20260921.json").read_text())
    for entry in previous["files"]:
        checked_file(entry["path"], entry["sha256"], entry["bytes"])
    if json.loads((ROOT / "archive/revisions.json").read_text())["current_revision"] != "r3-8mm-20260920":
        raise ValueError("A further comparison cannot adopt a new current kit")
    pointer = json.loads((ROOT / "archive/mona-refinement.json").read_text())
    if pointer["state"] == "INPUT_WAIT":
        if "data_url" in pointer or "data_sha256" in pointer or FOLDER.exists():
            raise ValueError("Unready refinement inputs must not be published")
        print("Mona refinement INPUT_WAIT: first-pilot inputs and current r3 unchanged.")
        return
    summary = checked_file(pointer["data_url"], pointer["data_sha256"])
    if not summary.resolve().is_relative_to(FOLDER):
        raise ValueError("Refinement summary escapes its independent study")
    data = json.loads(summary.read_text())
    images = []
    for group in data["comparisons"]:
        images.extend([group["sheet"]] if group["kind"] == "scale" else group["images"])
    for image in images:
        path = checked_file(image["path"], image["sha256"], image["bytes"])
        if not path.resolve().is_relative_to(FOLDER):
            raise ValueError("Refinement image escapes its approved study")
    inventory = json.loads((ROOT / f"archive/sources/{STUDY}.json").read_text())
    for entry in inventory["files"]:
        path = checked_file(entry["path"], entry["sha256"], entry["bytes"])
        if not path.resolve().is_relative_to(FOLDER):
            raise ValueError("Refinement allowlist escapes its independent study")
    size = 0
    for path in FOLDER.rglob("*"):
        if path.is_symlink():
            raise ValueError("Refinement contains a symlink")
        if path.is_file():
            if path.suffix.lower() not in ALLOWED_SUFFIXES and path.name != "LICENSE":
                raise ValueError("Native or executable files are outside the lightweight refinement scope")
            size += path.stat().st_size
    if size > 60_000_000:
        raise ValueError("Refinement exceeds its lightweight Pages budget")
    print(f"Mona refinement: {len(images)} checked comparison images, {size} bytes; previous pilot and r3 unchanged.")


if __name__ == "__main__":
    main()
