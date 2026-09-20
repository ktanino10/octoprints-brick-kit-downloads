"""Check the small shape-study payload and keep adopted r3 immutable."""

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STUDY = "shape-study-20260920"


def sha(path):
    with path.open("rb") as file:
        return hashlib.file_digest(file, "sha256").hexdigest()


def main():
    baseline = json.loads((ROOT / "site/shape-study-baseline.json").read_text())
    for entry in baseline["files"]:
        path = ROOT / entry["path"]
        if path.stat().st_size != entry["bytes"] or sha(path) != entry["sha256"]:
            raise ValueError(f"The adopted r3 baseline was modified: {entry['path']}")
    publication = json.loads((ROOT / "archive/revisions.json").read_text())
    if publication["current_revision"] != "r3-8mm-20260920":
        raise ValueError("A comparison study must not replace the adopted current revision")
    pointer = json.loads((ROOT / "archive/shape-study.json").read_text())
    if pointer["state"] == "INPUT_WAIT":
        if "data_url" in pointer or "data_sha256" in pointer:
            raise ValueError("Pending study has a fabricated published input")
        print("Shape study is INPUT_WAIT; no candidate counts/images are published and adopted r3 is unchanged.")
        return
    path = ROOT / pointer["data_url"].lstrip("/")
    if sha(path) != pointer["data_sha256"]:
        raise ValueError("Shape-study data hash mismatch")
    data = json.loads(path.read_text())
    files = set()
    for row in data["rows"]:
        for image in row["images"].values():
            path = ROOT / image["path"].lstrip("/")
            if path.is_symlink() or not path.resolve().is_relative_to(ROOT):
                raise ValueError("Unsafe study image reference")
            if path.stat().st_size != image["bytes"] or sha(path) != image["sha256"]:
                raise ValueError(f"Actual comparison image hash/size mismatch: {image['path']}")
            files.add(path)
    folder = ROOT / "artifacts/studies" / STUDY
    for file in folder.rglob("*"):
        if file.is_symlink():
            raise ValueError("Study payload contains a symlink")
        if file.is_file() and file.suffix.lower() not in {".json", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".md", ".txt", ".csv"}:
            raise ValueError(f"Large native/interactive payload is outside this comparison scope: {file.name}")
    size = sum(file.stat().st_size for file in folder.rglob("*") if file.is_file())
    if size > 150_000_000:
        raise ValueError("Comparison exceeds its reserved lightweight Pages budget")
    print(f"Shape study image hashes verified: {len(files)} views, {size} new bytes; adopted r3 unchanged.")


if __name__ == "__main__":
    main()
