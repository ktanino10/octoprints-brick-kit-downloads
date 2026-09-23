"""Copy only sealed, repository-permitted native meshes; no Pages or model readiness changes."""

import argparse
import gzip
import hashlib
import json
from pathlib import Path

from repository_meshes import PREFIX, repository_mesh_path, validate_native_payload
from symmetry_requirements import symmetry_identity

ROOT = Path(__file__).resolve().parents[1]
NAMESPACE = Path("viewer-data/copilot-symmetry-20260923")


def encoded(record):
    return (json.dumps(record, indent=2) + "\n").encode()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", type=Path, required=True)
    args = parser.parse_args()
    stage = args.stage.resolve()
    if not stage.is_relative_to(ROOT / ".archive-work"):
        raise ValueError("Repository mesh installation requires owned sealed-case staging")
    review = json.loads((stage / "source-review.json").read_text())
    case = review["case_id"]
    symmetry_identity(case)
    if review.get("kind") != "COPILOT_SYMMETRY_REVISION":
        raise ValueError("Only a explicitly separated symmetry revision may install repository-native geometry")
    files = review["source_repository_mesh_files"]
    if len({row["path"] for row in files}) != len(files) or len({row["type_id"] for row in files}) != len(files):
        raise ValueError("Repeated native geometry path or type in the authorized case")
    compact = stage / "normalization-input/cases" / (case + ".json.gz")
    source_input = next(row for row in review["source_normalization_files"] if row["path"] == f"cases/{case}.json.gz")
    raw = compact.read_bytes()
    if len(raw) != source_input["bytes"] or hashlib.sha256(raw).hexdigest() != source_input["sha256"]:
        raise ValueError("The sealed native-geometry source descriptor changed")
    model = json.loads(gzip.decompress(raw))
    record_path = ROOT / NAMESPACE / "source-manifest.json"
    existing = json.loads(record_path.read_text()) if record_path.exists() else {
        "schema_version": 1, "namespace": NAMESPACE.as_posix(),
        "storage": "PUBLIC_GIT_REPOSITORY_NOT_PAGES", "format": "EXACT_SOURCE_OBM1_GZIP",
        "geometry_and_arrays_modified": False,
        "model_readiness": "NOT_IMPLIED_BY_MESH_STORAGE",
        "source_license": "CC BY-NC 4.0", "files": [],
    }
    rows = {row["path"]: row for row in existing["files"]}
    pending = []
    for item in files:
        source = stage / "repository-native" / item["path"]
        data = source.read_bytes()
        descriptor = model["geometry"][item["type_id"]]
        validate_native_payload(item, data, descriptor["float32_mesh_sha256"])
        target = repository_mesh_path(item["type_id"])
        if not target.startswith(PREFIX):
            raise ValueError("Unexpected repository-native output namespace")
        old_path = ROOT / "artifacts/studies/part-count-matrix-20260921" / item["path"]
        if old_path.exists():
            raise ValueError("An existing Pages-native type must be reused rather than moved or republished")
        destination = ROOT / target
        record = {"path": target, "type_id": item["type_id"], "bytes": len(data), "sha256": item["sha256"],
                  "geometry_sha256": descriptor["float32_mesh_sha256"], "source_relative_path": item["path"],
                  "source_commit": review["source_commit"], "first_case_id": case}
        if destination.exists():
            if destination.is_symlink() or destination.read_bytes() != data or target not in rows:
                raise ValueError("A fixed repository-native geometry path would change")
            old = rows[target]
            if any(old[key] != record[key] for key in ["type_id", "bytes", "sha256", "geometry_sha256"]):
                raise ValueError("A shared native type differs across sealed cases")
        else:
            pending.append((destination, data))
            rows[target] = record
    for destination, data in pending:
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(data)
    existing["files"] = sorted(rows.values(), key=lambda row: row["path"])
    record_path.parent.mkdir(parents=True, exist_ok=True)
    record_path.write_bytes(encoded(existing))
    installed = {"case_id": case, "new_mesh_files": len(pending), "new_bytes": sum(len(data) for _, data in pending),
                 "model_ready": False, "public_commit": None, "files": [row for row in rows.values() if row["type_id"] in model["geometry"]]}
    (stage / "repository-mesh-install.json").write_bytes(encoded(installed))
    print(json.dumps({key: value for key, value in installed.items() if key != "files"}, indent=2))


if __name__ == "__main__":
    main()
