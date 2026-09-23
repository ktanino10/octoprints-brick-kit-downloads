"""Protect historical publications and enforce the compact matrix site budget."""

import json
import hashlib
from pathlib import Path
from validate_mona_study import checked_file

ROOT = Path(__file__).resolve().parents[1]
STUDY = "part-count-matrix-20260921"


def body_support_budget(planned_files=None):
    baseline_path = ROOT / "archive/body-support-baseline.json"
    if not baseline_path.exists():
        return None
    baseline = json.loads(baseline_path.read_text())
    if (baseline.get("study_id") != STUDY or baseline.get("geometry_revision") != "body-support-v2"
            or baseline.get("base_matrix_budget_bytes") != 140_000_000
            or baseline.get("body_revision_increment_budget_bytes") != 30_000_000
            or baseline.get("whole_site_budget_bytes") != 1_000_000_000):
        raise ValueError("The approved body-support budget scope changed")
    locked = {entry["path"]: entry for entry in baseline["immutable_base_files"]}
    if len(locked) != len(baseline["immutable_base_files"]):
        raise ValueError("Duplicate immutable baseline path")
    for entry in locked.values():
        checked_file(entry["path"], entry["sha256"], entry["bytes"])
    prefix = f"artifacts/studies/{STUDY}/"
    base_bytes = sum(entry["bytes"] for entry in locked.values() if entry["path"].startswith(prefix))
    if base_bytes > 140_000_000:
        raise ValueError("Original immutable matrix exceeds its unchanged 140MB budget")
    def scope(path):
        if any(marker in path for marker in ["-symmetric-v3", "bilateral-symmetry-v3", "copilot-symmetry-20260923"]):
            return False
        return ((path.startswith(prefix) and path not in locked)
                or (path.startswith((f"archive/sources/{STUDY}-", f"archive/releases/{STUDY}-"))
                    and ("body-support-v2" in path or "-support-free-v2" in path))
                or path in {"archive/body-support-baseline.json", "archive/copilot-support-free-revision.json"})
    paths = [p for folder in [ROOT / prefix, ROOT / "archive/sources", ROOT / "archive/releases"] for p in folder.rglob("*") if p.is_file()]
    paths += [baseline_path, ROOT / "archive/copilot-support-free-revision.json"]
    sizes = {path.relative_to(ROOT).as_posix(): path.stat().st_size for path in paths
             if scope(path.relative_to(ROOT).as_posix())}
    for name, data in (planned_files or {}).items():
        if name in locked and (len(data) != locked[name]["bytes"] or hashlib.sha256(data).hexdigest() != locked[name]["sha256"]):
            raise ValueError("A planned body-support write would change an immutable previous artifact")
        if scope(name):
            sizes[name] = len(data)
    added = sum(sizes.values())
    if added > 30_000_000:
        raise ValueError("New body-support data exceeds its approved additional 30MB budget")
    inventory = json.loads((ROOT / "archive/inventory.json").read_text())
    served = {entry["path"]: (ROOT / entry["path"]).stat().st_size for entry in inventory["files"]}
    served.update(sizes)
    served.update({name: len(data) for name, data in (planned_files or {}).items()})
    whole = sum(served.values())
    if whole >= 1_000_000_000:
        raise ValueError("Planned complete Pages payload exceeds its unchanged 1GB limit")
    return {"baseline_public_commit": baseline["baseline_public_commit"], "base_immutable_matrix_bytes": base_bytes,
            "new_body_revision_served_bytes": added, "projected_whole_site_bytes": whole,
            "new_scope_served_paths": len(sizes), "counting": "EACH_ACTUAL_SERVED_PATH_ONCE_NOT_HASH_DEDUPLICATION"}


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
    revision_budget = body_support_budget()
    if revision_budget is None and total > 140_000_000:
        raise ValueError("Matrix content exceeds its reserved 140MB Pages budget")
    for name in ("archive/inventory.json", "archive/block-budget-matrix.json"):
        record = json.loads((ROOT / name).read_text())
        if name.endswith("inventory.json") and record["totals"]["bytes"] >= 1_000_000_000:
            raise ValueError("Total Pages site exceeds 1GB")
    print(f"Matrix site payload: {total} bytes; native downloads remain release-only.")
    if revision_budget:
        print("Body-support budget:", json.dumps(revision_budget))


if __name__ == "__main__":
    main()
