"""Install fully verified 1x references without changing or counting the fifteen multiplier cases."""

import argparse
import copy
import gzip
import hashlib
import json
import math
from pathlib import Path
import subprocess

from import_mona_study import verify_camera
from install_density_case import immutable_write
from make_density_receipt import receipt_for
from density_requirements import delivery_status
from mona_study_evidence import verify_manifest_bom, identity_projection
from validate_archive import privacy

ROOT = Path(__file__).resolve().parents[1]
STUDY = "part-count-matrix-20260921"
PREFIX = f"artifacts/studies/{STUDY}/"


def encoded(data):
    return json.dumps(data, ensure_ascii=False, indent=2).encode() + b"\n"


def sha(data):
    return hashlib.sha256(data).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--receipt", type=Path, required=True)
    parser.add_argument("--receipt-sha256", required=True)
    args = parser.parse_args()
    raw_receipt = args.receipt.read_bytes()
    if sha(raw_receipt) != args.receipt_sha256:
        raise ValueError("Baseline receipt does not match its supplied hash")
    receipt = json.loads(raw_receipt)
    if receipt["state"] != "READY_THREE_BASELINE_REFERENCES_NOT_MULTIPLIER_CASES" or receipt["study_id"] != STUDY:
        raise ValueError("Only the explicit three-baseline READY packet is accepted")
    commit = receipt["source_commit"]
    source_root = Path(receipt["source_root"])
    repo = source_root.parents[3]
    entries = {entry["path"]: entry for entry in receipt["files"]}
    proof_files = receipt["read_only_verification_files"]

    def private_bytes(suffix):
        matches = [entry for entry in proof_files if entry["path"].endswith(suffix)]
        if len(matches) != 1:
            raise ValueError("Missing or ambiguous explicit baseline proof")
        entry = matches[0]
        relative = Path(entry["path"]).relative_to(repo).as_posix()
        data = subprocess.check_output(["git", "-C", str(repo), "cat-file", "blob", f"{commit}:{relative}"])
        if len(data) != entry["bytes"] or sha(data) != entry["sha256"]:
            raise ValueError("Committed baseline evidence changed")
        return data

    catalog_path = ROOT / PREFIX / "catalog.json"
    catalog = json.loads(catalog_path.read_text())
    previous_cases = copy.deepcopy(catalog["cases"])
    old_baselines = copy.deepcopy(catalog["baselines"])
    proofs = {}
    writes = {}
    translations = {}
    source_path = ROOT / "archive/sources" / f"{STUDY}.json"
    source_index = json.loads(source_path.read_text())
    source_entries = {entry["path"]: entry for entry in source_index["files"]}
    for case in receipt["case_ids"]:
        stage = ROOT / ".archive-work" / ("density-" + case)
        light = stage / "light"
        character = case.split("-")[0]
        summary = json.loads((light / f"cases/{case}-summary.json").read_text())
        model_bytes = (light / summary["manifest"]["path"]).read_bytes()
        if len(model_bytes) != summary["manifest"]["bytes"] or sha(model_bytes) != summary["manifest"]["sha256"]:
            raise ValueError("Baseline lightweight instance bytes changed")
        model = json.loads(gzip.decompress(model_bytes))
        mb = private_bytes(f"/cases/{case}/manifest.json")
        bb = private_bytes(f"/cases/{case}/bom.csv")
        manifest = json.loads(mb)
        proof = verify_manifest_bom(mb, bb)
        original = old_baselines[character]
        if proof["metrics"]["part_count"] != original["metrics"]["part_count"]:
            raise ValueError("Baseline count changed from the fixed comparison assumption")
        for key in ["part_count", "unique_types", "one_by_one_exceptions", "layer_count", "minimum_part_mm", "grip_long_ge_15_8_count"]:
            if proof["metrics"][key] != original["metrics"][key]:
                raise ValueError("Baseline actual metric drift: " + key)
        if summary["metrics"]["actual_size_mm"] != original["metrics"]["dimensions_mm"]:
            raise ValueError("Baseline completed dimensions drifted")
        if model["parts"] != [{key: part[key] for key in model["parts"][index]} for index, part in enumerate(manifest["parts"])]:
            raise ValueError("Light baseline changed actual part values or their order")
        if set(model["types"]) != set(manifest["types"]) or model["palette"] != manifest["palette"]:
            raise ValueError("Light baseline changed actual geometry metadata or palette")
        for identifier, spec in model["types"].items():
            required = {"cells", "footprint_cells", "stud_cells", "pitch_mm", "body_height_mm",
                        "body_mm", "stud_diameter_mm", "stud_height_mm", "origin"}
            if not required <= set(spec) or any(value != manifest["types"][identifier].get(key) for key, value in spec.items()):
                raise ValueError("Compact baseline type altered retained native dimensions or footprint")
        baseline_reference = manifest["baseline_reference"]
        serialized_reference = json.dumps(baseline_reference, sort_keys=True)
        if original["manifest_sha256"] not in serialized_reference:
            raise ValueError("New baseline wrapper is not bound to its previously fixed source manifest")
        if character == "mona":
            old_proof = json.loads((ROOT / "archive/sources/mona-fine-c-refinement-20260921-verification.json").read_text())
            old_identity = next(row for row in old_proof["rows"] if row["candidate_id"] == "mona-fine-c360")
            if proof["identity_projection_sha256"] != old_identity["identity_projection_sha256"]:
                raise ValueError("Mona baseline no longer preserves final edge-refined IDs/types/colors/poses/steps")
        audit = json.loads(private_bytes(f"/cases/{case}/saved-scene-audit.json"))
        saved = audit["saved_scene_binding"]
        if (audit["result"] != "PASS" or not audit["roundtrip_absolute_no_drift"] or not audit["empty_to_final_all_instances"]
                or saved["actual_instance_count"] != proof["counted_instances"]
                or saved["manifest_sha256"] != sha(mb) or saved["whole_part_color"] != "PASS_SINGLE_CONSTANT_MATERIAL_NO_FACIAL_TEXTURE"
                or saved["type_color_pose_steps"] != "MATCH" or saved["native_vertices_faces"] != "MATCH"):
            raise ValueError("Source baseline scene is not the actual single-color native assembly")
        reopened = json.loads((stage / "native-pose-verification.json").read_text())
        animation = json.loads((stage / "animation-portability.json").read_text())
        if (reopened["actual_instances"] != proof["counted_instances"] or reopened["all_ids_types_colors_poses_steps"] != "MATCH"
                or not animation["motion_unchanged"] or not animation["frame1_roundtrip_no_drift"]):
            raise ValueError("Publisher baseline native or evaluated animation verification failed")
        native_proof = json.loads((stage / "freecad-relocated.json").read_text())
        native_assembly = next(row for row in native_proof["documents"] if row["path"].endswith(f"/{case}/assembly.FCStd"))
        if native_assembly["valid_single_solid_targets_checked"] != proof["metrics"]["unique_types"]:
            raise ValueError("Relocated baseline used-type count differs")
        images = {}
        for view in ["front", "three_quarter"]:
            camera = summary["camera_conditions"][view]
            declaration = {key: value for key, value in camera.items() if key != "camera_matrix_world_m"}
            verify_camera(camera, declaration)
            if (camera["projection"] != "ORTHOGRAPHIC" or not math.isclose(camera["rendered_model_height_px"], 864)
                    or not math.isclose(camera["rendered_model_height_px"], camera["pixels_per_mm"] * camera["actual_projected_height_mm"])):
                raise ValueError("Baseline CG does not share the matrix normalization rule")
            item = next(image for image in summary["images"] if image["view"] == "assembled-" + view)
            images[view] = {"path": "/" + PREFIX + item["path"], "bytes": item["bytes"], "sha256": item["sha256"],
                            "framing_rule": "MATCHED_SCREEN_HEIGHT", "condition_id": "ACTUAL_PROJECTED_HEIGHT864_" + view}
        package = json.loads((stage / "package.json").read_text())
        movie = stage / "native" / PREFIX / "cases" / case / "assembly-motion.mp4"
        movie_bytes = movie.read_bytes()
        release_base = f"https://github.com/ktanino10/octoprints-brick-kit-downloads/releases/download/{STUDY}-{case}/"
        bundle = {"url": release_base + package["filename"], "bytes": package["bytes"], "sha256": package["sha256"],
                  "filename": package["filename"], "label": "1倍基準の実CG・動画・CAD・Blender・組立データ"}
        movie_record = {"url": release_base + f"{case}-assembly-motion.mp4", "bytes": len(movie_bytes), "sha256": sha(movie_bytes)}
        animations = {}
        for chapter in summary["animation"]["chapters"]:
            name = {"turntable": "turntable", "radial-explosion": "radial_explode", "bottom-up-assembly": "bottom_up"}[chapter["kind"]]
            animations[name] = {**movie_record, "start_seconds": chapter["start_seconds"], "end_seconds": chapter["end_seconds"]}
        baseline = {**original, "state": "READY", "native_media_status": "READY", "images": images,
                    "source_commit": commit, "native_manifest_sha256": sha(mb), "native_bom_sha256": sha(bb),
                    "native_id_pose_verification": "MATCH",
                    "assets": {"cg": [{**bundle, "contents": ["still", "blender"]}],
                               "native_cad": [{**bundle, "contents": ["freecad_assembly", "linked_libraries", "stl", "step"]}],
                               "assembly": [{**bundle, "contents": ["bom", "ordered_ids", "instructions"]}],
                               "animations": animations},
                    "visual_notes": summary["visual_review"]["observations_ja"]}
        if original["state"] == "READY" and baseline != original:
            raise ValueError("An existing READY baseline must not be replaced")
        catalog["baselines"][character] = baseline
        proof.update(case_id=case, source_commit=commit, baseline_manifest_sha256=original["manifest_sha256"],
                     public_native_id_pose_check=reopened, public_animation_preserved=True,
                     source_saved_scene_projection_sha256=saved["instance_projection_sha256"],
                     kind="BASELINE_REFERENCE_NOT_MULTIPLIER_CASE", files=[])
        proofs[case] = proof
        writes[ROOT / f"archive/sources/{STUDY}-{case}-verification.json"] = encoded(proof)
        writes[ROOT / f"archive/releases/{STUDY}-{case}.json"] = encoded({
            "schema_version": 1, "study_id": STUDY, "case_id": case, "kind": "BASELINE_REFERENCE_NOT_MULTIPLIER_CASE",
            "tag": f"{STUDY}-{case}", "source_commit": commit,
            "assets": [{key: record[key] for key in ["url", "bytes", "sha256"]} for record in [bundle, movie_record]],
            "status": "UNSELECTED_DIGITAL_REFERENCE_NOT_SLICED", "physical_fit": "UNKNOWN", "full_print": "ON_HOLD",
        })
        translations.update(zip(summary["limitations_ja"], summary["limitations_en"], strict=True))
        translations.update(zip(summary["visual_review"]["observations_ja"], summary["visual_review"]["observations_en"], strict=True))
    # The compact packet is a union; copy each approved byte once, never any growing source directory.
    for name, entry in entries.items():
        stage_file = next((ROOT / ".archive-work" / ("density-" + case) / "light" / name
                           for case in receipt["case_ids"]
                           if (ROOT / ".archive-work" / ("density-" + case) / "light" / name).is_file()), None)
        if stage_file is None:
            raise ValueError("Approved union member was not staged")
        data = stage_file.read_bytes()
        if len(data) != entry["bytes"] or sha(data) != entry["sha256"]:
            raise ValueError("Baseline compact file drifted")
        privacy(data, name)
        destination = f"source-records/{commit}-{name}" if name in {"matrix.json", "references.json"} else name
        full = PREFIX + destination
        writes[ROOT / full] = data
        record = {**entry, "path": full, "source_relative_path": name, "source_commit": commit}
        if full in source_entries and source_entries[full]["sha256"] != entry["sha256"]:
            raise ValueError("Shared geometry changed in a baseline handoff")
        source_entries.setdefault(full, record)
    translation_path = ROOT / "site/i18n/density-source.en.json"
    existing_translations = json.loads(translation_path.read_text())
    for source, target in translations.items():
        if source in existing_translations and existing_translations[source] != target:
            raise ValueError("Conflicting baseline translation")
        existing_translations[source] = target
    if catalog["cases"] != previous_cases:
        raise ValueError("Adding 1x references must not alter any multiplier case")
    for path, data in writes.items():
        privacy(data, path.name)
        if path.exists() and path.read_bytes() != data:
            raise ValueError("Fixed shared asset or evidence would be overwritten: " + path.name)
    for path, data in writes.items():
        immutable_write(path, data)
    source_index["source_revision"] = commit
    source_index["files"] = sorted(source_entries.values(), key=lambda entry: entry["path"])
    source_path.write_bytes(encoded(source_index))
    translation_path.write_bytes(encoded(existing_translations))
    catalog_bytes = encoded(catalog)
    privacy(catalog_bytes, "matrix with actual baseline references")
    catalog_path.write_bytes(catalog_bytes)
    pointer_path = ROOT / "archive/density-study.json"
    pointer = json.loads(pointer_path.read_text())
    pointer["catalog"] = {"path": "/" + PREFIX + "catalog.json", "bytes": len(catalog_bytes), "sha256": sha(catalog_bytes)}
    pointer["state"] = "READY" if all(delivery_status(case) == "READY" for case in catalog["cases"]) else "PARTIAL"
    pointer_path.write_bytes(encoded(pointer))
    (ROOT / "archive/block-budget-matrix.json").write_bytes(encoded(receipt_for(catalog, catalog_sha256=sha(catalog_bytes))))
    print(json.dumps({"baseline_references_ready": 3, "multiplier_cases_ready": sum(case["state"] == "READY" for case in catalog["cases"]),
                      "expected_multiplier_cases": 15, "state": pointer["state"]}, indent=2))


if __name__ == "__main__":
    main()
