"""Install one validated Copilot revision without changing the original fifteen-case archive."""

import argparse
import copy
import json
from pathlib import Path

from density_requirements import COPILOT_SUPPORT_REVISION, artifact_identity, validate_copilot_support_receipt
from install_density_case import encoded, immutable_write, sha
from validate_archive import privacy
from validate_density import body_support_budget
from symmetry_requirements import SYMMETRY_REVISION, validate_symmetry_receipt

ROOT = Path(__file__).resolve().parents[1]
STUDY = "part-count-matrix-20260921"
PREFIX = f"artifacts/studies/{STUDY}/"
REVISION_PATH = PREFIX + f"revisions/{COPILOT_SUPPORT_REVISION}/"


def merge_overlay(previous, incoming, identifier):
    if (previous["base_catalog_sha256"] != incoming["base_catalog_sha256"]
            or previous["geometry_revision"] != incoming["geometry_revision"]):
        raise ValueError("A Copilot overlay changed its original immutable publication")
    old = {case["id"]: case for case in previous["cases"]}
    merged = copy.deepcopy(incoming)
    if set(old) != {case["id"] for case in incoming["cases"]}:
        raise ValueError("The four explicitly authorized revision slots changed")
    for index, case in enumerate(merged["cases"]):
        before = old[case["id"]]
        if case["id"] == identifier:
            if before["state"] != "INPUT_WAIT" and before != case:
                raise ValueError("A fixed accepted revision would be replaced")
        elif case["state"] != "INPUT_WAIT":
            if case != before:
                raise ValueError("A case receipt cannot promote a different unreviewed revision")
        elif before["state"] != "INPUT_WAIT":
            merged["cases"][index] = copy.deepcopy(before)
    if "display_catalog" in previous:
        merged["display_catalog"] = previous["display_catalog"]
    return merged


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", type=Path, required=True)
    parser.add_argument("--symmetry", action="store_true", help="Install the separate five-case bilateral revision")
    args = parser.parse_args()
    stage = args.stage.resolve()
    if not stage.is_relative_to(ROOT / ".archive-work"):
        raise ValueError("Use only owned reviewed staging")
    review = json.loads((stage / "source-review.json").read_text())
    identifier = review["case_id"]
    logical, revision = artifact_identity(identifier)
    expected_kind = "COPILOT_SYMMETRY_REVISION" if args.symmetry else "COPILOT_BODY_SUPPORT_REVISION"
    expected_revision = SYMMETRY_REVISION if args.symmetry else COPILOT_SUPPORT_REVISION
    revision_path = PREFIX + f"revisions/{expected_revision}/"
    if review.get("kind") != expected_kind or revision != expected_revision:
        raise ValueError("This installer is restricted to the four separately requested Copilot revisions")
    native = json.loads((stage / "native-pose-verification.json").read_text())
    evidence = json.loads((stage / "derived/evidence.json").read_text())
    if (native.get("case_id") != identifier or native.get("all_ids_types_colors_poses_steps") != "MATCH"
            or not native.get("relocated_reopen") or not evidence.get("symmetry_revision_evidence" if args.symmetry else "body_support_revision_evidence")
            or evidence["symmetry_revision_evidence" if args.symmetry else "body_support_revision_evidence"].get("physical_validation") != "UNKNOWN"):
        raise ValueError("Actual relocated CAD and generic body-support evidence are required")
    incoming = json.loads((stage / "derived/catalog.json").read_text())
    if incoming["base_catalog_sha256"] != sha((ROOT / PREFIX / "catalog.json").read_bytes()):
        raise ValueError("The original public catalog changed before installing its separate revision")
    catalog_path = ROOT / revision_path / "catalog.json"
    catalog = merge_overlay(json.loads(catalog_path.read_text()), incoming, identifier) if catalog_path.exists() else incoming
    entry = next(case for case in catalog["cases"] if case["id"] == identifier)
    if entry["metrics"]["part_count"] != native["actual_instances"] or entry["assembly_support"]["assembly_aid_count"] != 0:
        raise ValueError("Actual new figure counts/aids differ from the independent native check")
    source_path = ROOT / "archive/sources" / f"{STUDY}-{expected_revision}.json"
    source_index = json.loads(source_path.read_text()) if source_path.exists() else {
        "schema_version": 1, "study_id": STUDY, "geometry_revision": revision, "files": [],
    }
    source_rows = {item["path"]: item for item in source_index["files"]}
    base_sources = {item["path"]: item for item in json.loads((ROOT / "archive/sources" / f"{STUDY}.json").read_text())["files"]}
    planned = {}
    classifications = {"new_paths": [], "reused_immutable_paths": [], "mutable_indexes": []}
    for item in review["source_light_files"]:
        name = item["path"]
        raw = (stage / "light" / name).read_bytes()
        if len(raw) != item["bytes"] or sha(raw) != item["sha256"]:
            raise ValueError("Approved source bytes changed before installation")
        target = PREFIX + (f"source-records/{review['source_commit']}-{revision}-matrix.json"
                           if name == review["source_catalog_path"] else name)
        privacy(raw, target)
        existing = ROOT / target
        if existing.exists():
            if existing.read_bytes() != raw:
                raise ValueError("A previous case or shared geometry path would be overwritten")
            classifications["reused_immutable_paths"].append(target)
        else:
            planned[target] = raw
            classifications["new_paths"].append(target)
        if target not in base_sources:
            source_rows[target] = {**item, "path": target, "source_relative_path": name, "source_commit": review["source_commit"]}
    guide_path = PREFIX + f"cases/{identifier}-guide.json.gz"
    guide_bytes = (stage / "derived" / f"{identifier}-guide.json.gz").read_bytes()
    planned[guide_path] = guide_bytes
    evidence.update(public_native_id_pose_check=native, files=[])
    evidence_path = f"archive/sources/{STUDY}-{identifier}-verification.json"
    planned[evidence_path] = encoded(evidence)
    bundle, movie = entry["assets"]["native_cad"][0], entry["assets"]["animations"]["turntable"]
    release_path = f"archive/releases/{STUDY}-{identifier}.json"
    planned[release_path] = encoded({
        "schema_version": 1, "study_id": STUDY, "case_id": identifier, "logical_case_id": logical,
        "geometry_revision": revision, "source_commit": review["source_commit"],
        "tag": f"{STUDY}-{identifier}", "status": "UNSELECTED_DIGITAL_CASE_NOT_SLICED",
        "assets": [{key: file[key] for key in ["url", "bytes", "sha256"]} for file in [bundle, movie]],
        "case_categories": ["cg", "animation", "native_cad", "assembly"],
        "physical_fit": "UNKNOWN", "full_print": "ON_HOLD",
    })
    source_index["files"] = sorted(source_rows.values(), key=lambda item: item["path"])
    source_index["source_revision"] = review["source_commit"]
    planned[source_path.relative_to(ROOT).as_posix()] = encoded(source_index)
    catalog_bytes = encoded(catalog)
    planned[catalog_path.relative_to(ROOT).as_posix()] = catalog_bytes
    receipt_path = ROOT / ("archive/copilot-symmetry-revision.json" if args.symmetry else "archive/copilot-support-free-revision.json")
    receipt = json.loads(receipt_path.read_text())
    receipt["revision_catalog"] = {"path": "/" + catalog_path.relative_to(ROOT).as_posix(),
                                   "bytes": len(catalog_bytes), "sha256": sha(catalog_bytes)}
    receipt["base_catalog_sha256"] = catalog["base_catalog_sha256"]
    receipt["budget_baseline"] = "/archive/body-support-baseline.json"
    record = next(item for item in receipt["cases"] if item.get("requested_case_id", item.get("actual_case_id")) == identifier)
    if record["status"] == "READY":
        raise ValueError("Do not reinstall or downgrade a publicly verified revision")
    record.update(status="PUBLIC_PENDING", source_commit=entry["source_commit"], actual_count=entry["metrics"]["part_count"],
                  external_aid_count=0, assembly_aid_count=0)
    viewer_url = f"https://ktanino10.github.io/octoprints-brick-kit-downloads/ja/density-guide.html?case={identifier}"
    if args.symmetry:
        record.update(actual_case_id=identifier, symmetry_evidence=entry["symmetry_visual"],
                      mechanical_evidence=entry["assembly_support"]["assembly_validation_transport_ref"],
                      downloads={"cad": bundle["url"], "cg": entry["assets"]["cg"][0]["url"],
                                 "animation": movie["url"], "assembly": entry["assets"]["assembly"][0]["url"], "viewer": viewer_url})
        validate_symmetry_receipt(receipt)
    else:
        record.update(geometry_sequence_evidence=entry["assembly_support"]["assembly_validation_ref"],
                      cad_url=bundle["url"], cg_url=entry["assets"]["cg"][0]["url"], animation_url=movie["url"],
                      assembly_url=entry["assets"]["assembly"][0]["url"], viewer_url=viewer_url)
        validate_copilot_support_receipt(receipt)
    planned[receipt_path.relative_to(ROOT).as_posix()] = encoded(receipt)
    mutable = {source_path.relative_to(ROOT).as_posix(), catalog_path.relative_to(ROOT).as_posix(),
               receipt_path.relative_to(ROOT).as_posix()}
    translations_path = ROOT / "site/i18n/density-source.en.json"
    translations = json.loads(translations_path.read_text())
    for source, target in json.loads((stage / "derived/translations.json").read_text()).items():
        if source in translations and translations[source] != target:
            raise ValueError("A fixed existing translation would change")
        translations[source] = target
    for name, raw in planned.items():
        privacy(raw, name)
        path = ROOT / name
        if name not in mutable and path.exists() and path.read_bytes() != raw:
            raise ValueError("A fixed revision publication file would be overwritten")
    budget = body_support_budget(planned)
    if budget is None:
        raise ValueError("The explicit immutable baseline and additional budget must be saved first")
    for name, raw in planned.items():
        path = ROOT / name
        if name in mutable:
            path.parent.mkdir(parents=True, exist_ok=True); path.write_bytes(raw)
            classifications["mutable_indexes"].append(name)
        else:
            immutable_write(path, raw)
    translations_path.write_bytes(encoded(translations))
    (stage / "public-storage-review.json").write_bytes(encoded({"budget": budget, "classification": classifications,
        "old_catalog_and_prior_READY_receipt": "UNCHANGED", "status": "PUBLIC_PENDING_NOT_GLOBAL_READY"}))
    print(json.dumps({"case": identifier, "actual": record["actual_count"], "new_request_state": receipt["state"],
                      "new_case_status": record["status"], "budget": budget}, indent=2))


if __name__ == "__main__":
    main()
