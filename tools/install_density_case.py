"""Install one reviewed case's lightweight bytes; merge prior cases without replacing them."""

import argparse
import hashlib
import json
from pathlib import Path

from make_density_receipt import receipt_for
from validate_archive import privacy

ROOT = Path(__file__).resolve().parents[1]
STUDY = "part-count-matrix-20260921"
PREFIX = f"artifacts/studies/{STUDY}/"


def encoded(data):
    return json.dumps(data, ensure_ascii=False, indent=2).encode() + b"\n"


def sha(data):
    return hashlib.sha256(data).hexdigest()


def immutable_write(path, data):
    if path.exists() and path.read_bytes() != data:
        raise ValueError("Refusing to overwrite a fixed case or shared type: " + path.name)
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        path.write_bytes(data)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", type=Path, required=True)
    args = parser.parse_args()
    stage = args.stage.resolve()
    if not stage.is_relative_to(ROOT / ".archive-work"):
        raise ValueError("Install only a reviewed case from owned staging")
    review = json.loads((stage / "source-review.json").read_text())
    case = review["case_id"]
    native = json.loads((stage / "native-pose-verification.json").read_text())
    if native["case_id"] != case or native["all_ids_types_colors_poses_steps"] != "MATCH":
        raise ValueError("Actual relocated native ID/pose verification is missing")
    incoming = json.loads((stage / "derived/catalog.json").read_text())
    next_case = next(item for item in incoming["cases"] if item["id"] == case)
    if native["actual_instances"] != next_case["metrics"]["part_count"]:
        raise ValueError("Installed guide count differs from reopened CAD")
    catalog_path = ROOT / PREFIX / "catalog.json"
    if catalog_path.exists():
        previous = json.loads(catalog_path.read_text())
        for item in previous["cases"]:
            if item["state"] == "INPUT_WAIT":
                continue
            if item["id"] == case and item != next_case:
                raise ValueError("A previously installed case changed")
            if item["id"] != case:
                position = next(index for index, entry in enumerate(incoming["cases"]) if entry["id"] == item["id"])
                incoming["cases"][position] = item
        for name, baseline in previous["baselines"].items():
            if baseline["state"] == "READY":
                incoming["baselines"][name] = baseline
            elif baseline.get("manifest_sha256") != incoming["baselines"][name].get("manifest_sha256"):
                raise ValueError("Fixed baseline changed between case handoffs")
    source_path = ROOT / "archive/sources" / f"{STUDY}.json"
    source_index = json.loads(source_path.read_text()) if source_path.exists() else {
        "schema_version": 1, "revision": STUDY, "files": [],
    }
    entries = {entry["path"]: entry for entry in source_index["files"]}
    for entry in review["source_light_files"]:
        name = entry["path"]
        data = (stage / "light" / name).read_bytes()
        if len(data) != entry["bytes"] or sha(data) != entry["sha256"]:
            raise ValueError("Approved lightweight source bytes drifted")
        privacy(data, name)
        destination = f"source-records/{review['source_commit']}-{name}" if name in {"matrix.json", "references.json"} else name
        full = PREFIX + destination
        immutable_write(ROOT / full, data)
        record = {**entry, "path": full, "source_relative_path": name, "source_commit": review["source_commit"]}
        if full not in entries:
            entries[full] = record
        elif entries[full]["sha256"] != record["sha256"]:
            raise ValueError("A shared source type changed across cases")
    source_index["files"] = sorted(entries.values(), key=lambda entry: entry["path"])
    source_index["source_revision"] = review["source_commit"]
    source_path.write_bytes(encoded(source_index))
    guide = stage / "derived" / f"{case}-guide.json.gz"
    immutable_write(ROOT / PREFIX / "cases" / guide.name, guide.read_bytes())
    evidence = json.loads((stage / "derived/evidence.json").read_text())
    evidence["public_native_id_pose_check"] = native
    evidence["files"] = []
    evidence_bytes = encoded(evidence)
    privacy(evidence_bytes, "public case evidence")
    immutable_write(ROOT / "archive/sources" / f"{STUDY}-{case}-verification.json", evidence_bytes)
    translations = json.loads((stage / "derived/translations.json").read_text())
    translation_file = ROOT / "site/i18n/density-source.en.json"
    old = json.loads(translation_file.read_text()) if translation_file.exists() else {}
    for source, target in translations.items():
        if source in old and old[source] != target:
            raise ValueError("Conflicting source translation between cases")
        old[source] = target
    translation_file.write_bytes(encoded(old))
    catalog_bytes = encoded(incoming)
    privacy(catalog_bytes, "normalized public matrix")
    catalog_path.write_bytes(catalog_bytes)
    pointer = json.loads((ROOT / "archive/density-study.json").read_text())
    complete = all(item["state"] == "READY" for item in incoming["cases"]) and all(
        item["state"] == "READY" for item in incoming["baselines"].values())
    pointer["state"] = "READY" if complete else "PARTIAL"
    pointer["catalog"] = {"path": "/" + PREFIX + "catalog.json", "bytes": len(catalog_bytes), "sha256": sha(catalog_bytes)}
    (ROOT / "archive/density-study.json").write_bytes(encoded(pointer))
    (ROOT / "archive/block-budget-matrix.json").write_bytes(encoded(receipt_for(incoming, catalog_sha256=sha(catalog_bytes))))
    bundle = next_case["assets"]["native_cad"][0]
    movie = next_case["assets"]["animations"]["turntable"]
    release = {
        "schema_version": 1, "study_id": STUDY, "case_id": case,
        "tag": f"{STUDY}-{case}", "source_commit": review["source_commit"],
        "status": "UNSELECTED_DIGITAL_CASE_NOT_SLICED",
        "assets": [{key: file[key] for key in ["url", "bytes", "sha256"]} for file in [bundle, movie]],
        "case_categories": ["cg", "animation", "native_cad", "assembly"],
        "physical_fit": "UNKNOWN", "full_print": "ON_HOLD",
    }
    immutable_write(ROOT / "archive/releases" / f"{STUDY}-{case}.json", encoded(release))
    print(json.dumps({"installed_case": case, "actual_ready_cases": sum(item["state"] == "READY" for item in incoming["cases"]),
                      "expected_cases": 15, "state": pointer["state"]}, indent=2))


if __name__ == "__main__":
    main()
