"""Protect historical publications and enforce the compact matrix site budget."""

import json
from pathlib import Path
from validate_mona_study import checked_file

ROOT = Path(__file__).resolve().parents[1]
STUDY = "part-count-matrix-20260921"


def main():
    locked = json.loads((ROOT / "site/density-baseline.json").read_text())
    previous = json.loads((ROOT / "archive/sources/mona-fine-c-refinement-20260921.json").read_text())
    for entry in locked["files"] + previous["files"]:
        checked_file(entry["path"], entry["sha256"], entry["bytes"])
    registry = json.loads((ROOT / "archive/revisions.json").read_text())
    if registry["current_revision"] != "r3-8mm-20260920":
        raise ValueError("An unselected matrix cannot replace current r3")
    pointer = json.loads((ROOT / "archive/density-study.json").read_text())
    folder = ROOT / "artifacts/studies" / STUDY
    if pointer["state"] == "INPUT_WAIT":
        if folder.exists():
            raise ValueError("Unready matrix has unapproved candidate artifacts")
        print("Matrix awaits READY artifacts; earlier publications remain unchanged.")
        return
    total = 0
    for path in folder.rglob("*"):
        if path.is_symlink():
            raise ValueError("Matrix Pages data contains a symlink")
        if path.is_file():
            if path.suffix.lower() in {".blend", ".fcstd", ".step", ".stl", ".3mf", ".zip"}:
                raise ValueError("Large native/download packages belong in versioned Releases, not Pages")
            if path.stat().st_size >= 90_000_000:
                raise ValueError("A matrix site file exceeds its normal Git size budget")
            total += path.stat().st_size
    if total > 140_000_000:
        raise ValueError("Matrix content exceeds its reserved 140MB Pages budget")
    for name in ("archive/inventory.json", "archive/block-budget-matrix.json"):
        record = json.loads((ROOT / name).read_text())
        if name.endswith("inventory.json") and record["totals"]["bytes"] >= 1_000_000_000:
            raise ValueError("Total Pages site exceeds 1GB")
    print(f"Matrix site payload: {total} bytes; native downloads remain release-only.")


if __name__ == "__main__":
    main()
