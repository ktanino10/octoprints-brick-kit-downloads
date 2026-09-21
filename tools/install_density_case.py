"""Install one reviewed case's lightweight bytes; merge prior cases without replacing them."""

import argparse
import copy
import hashlib
import json
from pathlib import Path

from make_density_receipt import receipt_for
from density_requirements import MONA_GEOMETRY_REVISION, all_cases, delivery_status, logical_case_id
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


def merge_catalog(previous, incoming, accepted_case):
    merged = copy.deepcopy(incoming)
    if previous["study_id"] != STUDY or merged["study_id"] != STUDY:
        raise ValueError("Cannot merge different matrix studies")
    old_slots = {logical_case_id(entry): entry for entry in previous["cases"]}
    new_slots = {logical_case_id(entry): entry for entry in merged["cases"]}
    old_by_id = {entry["id"]: entry for entry in all_cases(previous)}
    by_id = {entry["id"]: entry for entry in merged["cases"]}
    if (len(by_id) != len(merged["cases"]) or accepted_case not in by_id
            or len(old_slots) != len(previous["cases"]) or len(new_slots) != len(merged["cases"])
            or old_slots.keys() != new_slots.keys() or len(old_by_id) != len(all_cases(previous))):
        raise ValueError("Duplicate or missing case in incremental catalog")
    history = {entry["id"]: copy.deepcopy(entry) for entry in previous.get("historical_cases", [])}
    if accepted_case in history:
        raise ValueError("An incremental receipt cannot reactivate historical geometry")
    for item in incoming.get("historical_cases", []):
        if item["id"] not in old_by_id or item != old_by_id[item["id"]] or item["state"] == "INPUT_WAIT":
            raise ValueError("An incremental receipt cannot add or alter unreviewed history")
    for slot, item in new_slots.items():
        old = old_slots[slot]
        if item["id"] == accepted_case:
            if old["id"] == item["id"] and old["state"] != "INPUT_WAIT" and old != item:
                raise ValueError("A previously installed case changed")
            if item["state"] == "INPUT_WAIT":
                raise ValueError("The accepted case must contain actual reviewed data")
            if old["id"] != item["id"] and old["state"] != "INPUT_WAIT":
                history[old["id"]] = copy.deepcopy(old)
        else:
            if item["state"] != "INPUT_WAIT" and item != old:
                raise ValueError("An incremental receipt cannot promote other unreviewed cases")
            if old["state"] != "INPUT_WAIT":
                if (item["state"] == "INPUT_WAIT" and item["id"] != old["id"]
                        and item.get("geometry_revision") == MONA_GEOMETRY_REVISION
                        and old["id"] == slot and delivery_status(old) == "REQUIRES_WHISKER_REVISION"):
                    history[old["id"]] = copy.deepcopy(old)
                else:
                    new_slots[slot] = copy.deepcopy(old)
    merged["cases"] = [new_slots[logical_case_id(item)] for item in merged["cases"]]
    if history:
        merged["historical_cases"] = list(history.values())
    else:
        merged.pop("historical_cases", None)
    for name, old in previous["baselines"].items():
        new = merged["baselines"].get(name)
        if new is None or old.get("manifest_sha256") != new.get("manifest_sha256"):
            raise ValueError("Fixed baseline changed between case handoffs")
        if old.get("metrics") != new.get("metrics"):
            raise ValueError("Fixed baseline metrics changed between case handoffs")
        if old["state"] == "READY":
            if new["state"] == "READY" and new != old:
                raise ValueError("Published baseline media changed")
            merged["baselines"][name] = copy.deepcopy(old)
    return merged


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
        incoming = merge_catalog(previous, incoming, case)
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
    complete = all(delivery_status(item) == "READY" for item in incoming["cases"]) and all(
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
