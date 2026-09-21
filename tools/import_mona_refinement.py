"""Import only the fixed Fine-C refinement comparison; verify private evidence read-only."""

import argparse
import hashlib
import io
import json
import math
from pathlib import Path, PurePosixPath
import subprocess

from PIL import Image

from import_mona_study import encoded, record_sha, verify_camera
from mona_study_evidence import require, verify_manifest_bom, verify_reference_identity, body_height_families
from validate_archive import privacy

ROOT = Path(__file__).resolve().parents[1]
STUDY = "mona-fine-c-refinement-20260921"
COMMIT = "02918d3bffd4db065656f5ffe7e037da1b0754d8"
RECEIPT_SHA = "313f18df0ff097fd7a21721585727c6464d6b398e448d955f2dd3f8fb854b3ef"
STUDY_SHA = "a3ed17cd5c0f48f493cef94261be96380cb0d79abddebe3c81a9fcc2306e7a92"
ROLES = {"phase1-fine-c": "fine-c", "dense360-pilot": "previous-360", "fine-c-refined360": "refined-360"}
FLAGS = {"current_revision_unchanged": "r3-8mm-20260920", "previous_study_unchanged": "mona-likeness-360-20260921",
         "selection": "NOT_SELECTED", "visual_approval": "PENDING", "physical_fit": "UNKNOWN",
         "retention_strength": "UNKNOWN", "slicer_status": "NOT_SLICED", "full_print": "ON_HOLD"}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def checked(path, expected, size=None, repo=None):
    require(path.is_file() and not path.is_symlink(), "Missing or symlinked explicit refinement input")
    data = path.read_bytes()
    require(sha(data) == expected and (size is None or len(data) == size), "Fixed refinement input changed: " + path.name)
    if repo:
        require(path.resolve().is_relative_to(repo), "Verification input escapes the authorized source project")
        blob = subprocess.check_output(["git", "-C", str(repo), "cat-file", "blob", f"{COMMIT}:{path.relative_to(repo).as_posix()}"])
        require(blob == data, "Input differs from the committed READY bytes: " + path.name)
    return data


def verify_front_registration(registration, evidence):
    require({key: value for key, value in registration.items() if key != "actual_blender_depth_camera_matrix_world_m"}
            == evidence["camera"], "Registered face declaration differs from actual depth evidence")
    matrix = registration["actual_blender_depth_camera_matrix_world_m"]
    require(matrix == evidence["camera_matrix_world_m"] and len(matrix) == 4
            and all(len(row) == 4 and all(math.isfinite(value) for value in row) for row in matrix)
            and matrix[3] == [0, 0, 0, 1], "Invalid actual registered camera")
    require(registration["projection"] == "ORTHOGRAPHIC" and registration["view"] == "front"
            and registration["position_mm"][0] == registration["target_mm"][0]
            and registration["position_mm"][2] == registration["target_mm"][2]
            and registration["position_mm"][1] < registration["target_mm"][1],
            "Unexpected registered front view")
    expected_basis = [[1, 0, 0], [0, 0, -1], [0, 1, 0]]
    require(all(math.isclose(matrix[i][j], expected_basis[i][j], abs_tol=1e-6)
                for i in range(3) for j in range(3))
            and all(math.isclose(matrix[i][3], registration["position_mm"][i] / 1000, abs_tol=1e-6)
                    for i in range(3)), "Actual registered camera basis or position differs")
    require(registration["exclude_foundation"] is True and evidence["foundation_hidden"] is True
            and math.isclose(registration["pixels_per_mm"],
                             registration["image_size_px"][1] / registration["ortho_scale_mm"])
            and math.isclose(registration["registered_body_height_px"],
                             registration["body_height_mm"] * registration["pixels_per_mm"]),
            "Registered face scale includes foundation or changes normalization")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--handoff", type=Path, required=True)
    args = parser.parse_args()
    receipt = json.loads(checked(args.handoff, RECEIPT_SHA))
    require(receipt["state"] == "READY" and receipt["source_commit"] == COMMIT
            and receipt["study_id"] == STUDY and receipt["user_visual_approval"] == "PENDING",
            "Unexpected refinement READY identity")
    public = Path(receipt["source_root"])
    require(public.name == "public" and public.parent.name == STUDY, "Unexpected public refinement source root")
    repo = public.parents[3].resolve()
    entries = {entry["path"]: entry for entry in receipt["files"]}
    require(len(entries) == len(receipt["files"]) == 21
            and sum(entry["bytes"] for entry in entries.values()) == receipt["total_bytes"] == 4465276,
            "The compact refinement allowlist changed")
    payload = {}
    for name, entry in entries.items():
        path = PurePosixPath(name)
        require(len(path.parts) == 1 and path.name == name and "\\" not in name
                and (path.suffix in {".jpg", ".json", ".csv", ".html", ".md"} or name == "LICENSE"),
                "Native/internal or escaping file is not an approved comparison input")
        data = checked(public / name, entry["sha256"], entry["bytes"], repo)
        privacy(data, name)
        if path.suffix == ".jpg":
            with Image.open(io.BytesIO(data)) as image:
                require(not image.getexif() and not any(key in image.info for key in ["xmp", "XML:com.adobe.xmp"]),
                        "Comparison image metadata needs explicit review")
        payload[name] = data
    require(sha(payload["study.json"]) == STUDY_SHA, "The approved refinement summary differs")
    raw = json.loads(payload["study.json"])
    require(raw["state"] == "READY_FOR_USER_COMPARISON" and raw["kind"] == "MONA_FINE_C_PATTERN_REFINEMENT"
            and raw["study_id"] == STUDY and raw["primary_reference"] == "phase1-fine-c"
            and raw["previous_reference"] == "dense360-pilot"
            and raw["visual_review"]["user_visual_approval"] == "PENDING", "Refinement comparison has an incorrect target or approval")
    for key, value in FLAGS.items():
        actual = raw.get(key) if key.endswith("_unchanged") else raw["status"].get(key)
        require(actual == value, "Current/previous model or physical gate changed: " + key)

    private_entries = {entry["path"]: entry for entry in receipt["read_only_verification_files"]}
    require(len(private_entries) == len(receipt["read_only_verification_files"]) == 14,
            "Only the fourteen expressly permitted proof files may be read")
    private = {}
    for name, entry in private_entries.items():
        require(entry["purpose"].startswith("READ_ONLY_"), "Private evidence cannot be copied for publication")
        private[name] = checked(Path(name), entry["sha256"], entry["bytes"], repo)

    def evidence_file(role, filename):
        matches = [name for name in private if Path(name).name == filename
                   and (role is None or f"/{role}/" in name)]
        require(len(matches) == 1, "Ambiguous or unapproved proof reference")
        return private[matches[0]]

    binding_bytes = evidence_file(None, "native-scene-binding.json")
    bindings = json.loads(binding_bytes)
    require(bindings["result"] == "PASS" and len(bindings["rows"]) == 3, "Actual scene binding is incomplete")
    binding_rows = {row["role"]: row for row in bindings["rows"]}
    contract_bytes = evidence_file(None, "contract.json")
    contract = json.loads(contract_bytes)
    require(contract["result"] == "PASS" and contract["study_id"] == STUDY
            and contract["new_derivative_count"] == raw["surface_edge_treatment"]["used_derivative_types"]
            and contract["selected_actual_part_count"] == raw["surface_edge_treatment"]["part_count"]
            and contract["true_cavity_roof_mm"] == raw["surface_edge_treatment"]["true_roof_over_cavity_mm"]
            and contract["outer_cap_above_cavity_datum_mm"] == raw["surface_edge_treatment"]["outer_cap_above_cavity_datum_mm"]
            and contract["status"]["physical_fit"] == "UNKNOWN", "Native edge/cavity evidence differs from the published summary")
    old_proof = json.loads((ROOT / "archive/sources/mona-likeness-360-20260921-verification.json").read_text())
    old_by_id = {row["candidate_id"]: row for row in old_proof["rows"]}
    rows, manifests = [], {}
    render_stats, depths = {}, {}
    require(len(raw["rows"]) == 3 and {row["role"] for row in raw["rows"]} == set(ROLES), "Expected exactly three actual roles")
    for row in raw["rows"]:
        role = row["role"]
        explicit = next(item for item in receipt["private_count_verification"] if item["role"] == role)
        mb, bb = private[explicit["manifest_path"]], private[explicit["bom_path"]]
        if role == "fine-c-refined360":
            require(Path(explicit["manifest_path"]).name == "manifest-edge-refined.json"
                    and Path(explicit["bom_path"]).parent.name == "edge-finished", "Do not import the unfinished internal manifest")
        proof = verify_manifest_bom(mb, bb)
        manifest = json.loads(mb)
        manifests[role] = manifest
        require(manifest["candidate_id"] == explicit["candidate_id"] == row["candidate_id"]
                and proof["counted_instances"] == explicit["physical_piece_count"] == row["metrics"]["physical_piece_count"],
                "Actual role, final BOM or count differs")
        for key in ["manifest_sha256", "bom_sha256"]:
            require(proof[key] == explicit[key] == row["provenance"][key], "Final manifest/BOM provenance mismatch")
        if role == "phase1-fine-c":
            proof["reference_identity_verified"] = verify_reference_identity(
                manifest, json.loads((ROOT / "artifacts/phase1/mona-fine/manifest.json").read_text()))
        elif role == "dense360-pilot":
            previous = old_by_id["mona-dense360"]
            require(all(proof[key] == previous[key] for key in
                        ["manifest_sha256", "bom_sha256", "identity_projection_sha256", "counted_instances"]),
                    "The first pilot has been replaced or altered")
            proof["reference_identity_verified"] = True
        metrics = proof.pop("metrics")
        metrics["body_height_families"] = body_height_families(manifest)
        for key, source_key in [
            ("part_count", "physical_piece_count"), ("unique_types", "unique_types"),
            ("one_by_one_exceptions", "one_by_one_exceptions"), ("layer_count", "layer_count"),
            ("grip_long_ge_15_8_count", "grip_long_ge_15_8_mm"), ("body_height_families", "body_height_families"),
        ]:
            require(metrics[key] == row["metrics"][source_key], "Actual quantity or body-height family mismatch: " + key)
        require(metrics["minimum_part_mm"] == [row["metrics"][key] for key in
                ["minimum_xy_short_mm", "minimum_xy_long_mm", "minimum_body_height_mm"]], "Independent minima differ")
        metrics["dimensions_mm"] = row["metrics"]["actual_size_mm"]
        require(row["metrics"]["delta_from_primary_fine_c"] == metrics["part_count"] - 13837
                and row["metrics"]["delta_from_previous_pilot"] == metrics["part_count"] - 10908,
                "Comparison baselines have been conflated")
        stats_bytes, depth_bytes = evidence_file(role, "render-stats.json"), evidence_file(role, "depth-evidence.json")
        stats, depth = json.loads(stats_bytes), json.loads(depth_bytes)
        render_stats[role], depths[role] = stats, depth
        scene = binding_rows[role]
        used_types = {part["type_id"] for part in manifest["parts"]}
        require(stats["role"] == role and stats["part_count"] == metrics["part_count"]
                and stats["native_scene_reopened"] is True and stats["actual_geometry_normalized"] is False
                and sha(stats_bytes) == row["provenance"]["render_stats_sha256"]
                and scene["actual_instance_count"] == metrics["part_count"] and scene["used_native_types"] == metrics["unique_types"]
                and set(scene["native_geometry"]) == used_types
                and scene["manifest_sha256"] == proof["manifest_sha256"] and scene["source_scene_unchanged"] is True
                and scene["whole_part_color"] == "PASS_SINGLE_CONSTANT_MATERIAL_NO_FACIAL_TEXTURE"
                and scene["type_color_pose_steps"] == scene["native_vertices_faces"] == "MATCH"
                and scene["instance_projection_sha256"] == row["provenance"]["saved_scene_binding_sha256"]
                and row["provenance"]["whole_part_colors"] is True,
                "Actual render, material, native geometry or scene binding differs")
        require(depth["state"] == "COMPLETE_ACTUAL_NATIVE_DEPTH" and depth["role"] == role
                and depth["actual_instance_count"] == metrics["part_count"] and depth["manifest_sha256"] == proof["manifest_sha256"]
                and depth["source_scene_sha256"] == scene["scene_sha256"]
                and depth["maximum_sample_error_fraction_of_body_height"] <= depth["sample_error_tolerance_fraction_of_body_height"],
                "Depth-camera evidence is not bound to the actual final scene")
        for key in ["physical_fit", "retention_strength", "slicer_status", "selection"]:
            require(stats[key] == FLAGS[key], "Render evidence changes a physical or adoption gate")
        proof.update(geometry_sha256=row["provenance"]["native_geometry_source_hashes"][-1]["sha256"],
                     native_geometry_source_hashes=row["provenance"]["native_geometry_source_hashes"],
                     used_native_geometry_report_sha256=record_sha(scene["native_geometry"]),
                     native_scene_binding_report_sha256=sha(binding_bytes),
                     render_stats_sha256=sha(stats_bytes), depth_evidence_sha256=sha(depth_bytes),
                     whole_part_colors_verified=True, render_instances_match_manifest=True,
                     native_binding_basis="HASH_VERIFIED_SOURCE_SAVED_SCENE_REPORT_AND_INDEPENDENT_MANIFEST_BOM_CHECK")
        rows.append({"role": ROLES[role], "source_role": role, "candidate_id": row["candidate_id"],
                     "pitch_mm": 4 if role == "phase1-fine-c" else 8, "stud_diameter_mm": 4.8,
                     "open_underside": role != "phase1-fine-c", "color_mode": "WHOLE_PART_SINGLE_COLOR",
                     "metrics": metrics, "evidence": proof})

    refined = manifests["fine-c-refined360"]
    require(all(spec["pitch_mm"] == 8 and spec["stud_diameter_mm"] == 4.8 and spec["stud_height_mm"] == 1.8
                for spec in refined["types"].values()), "The refined connection system changed")
    pattern = raw["pattern_provenance"]
    require(pattern["primary_manifest_sha256"] == rows[0]["evidence"]["manifest_sha256"]
            and pattern["c_occupied_cells"] == refined["c_pattern"]["reference_cells"]
            == manifests["phase1-fine-c"]["metrics"]["cell_count"]
            and pattern["c_boundary_cells"] == refined["c_pattern"]["reference_boundary_cells"]
            and pattern["occupied_cell_changes"] == refined["c_pattern"]["occupied_cell_changes"] == 0
            and pattern["boundary_color_changes"] == refined["c_pattern"]["boundary_color_changes"] == 0
            and pattern["legacy_pins_or_sockets_scaled"] is False and pattern["slopes_or_curved_masks"] is False
            and pattern["single_color_per_actual_part"] is True, "The actual Fine-C pattern or whole-part color basis changed")
    selected = set(refined["edge_treatment"]["selected_part_ids"])
    parts = {part["id"]: part for part in refined["parts"]}
    require(len(selected) == contract["selected_actual_part_count"] and selected <= set(parts)
            and len({parts[identifier]["type_id"] for identifier in selected}) == contract["new_derivative_count"]
            and refined["edge_treatment"]["size_mm"] == raw["surface_edge_treatment"]["size_mm"],
            "Exterior native finish counts were mixed with exported master counts")
    exceptions = raw["small_part_exceptions"]
    require(len(exceptions) == rows[-1]["metrics"]["one_by_one_exceptions"]
            and len({item["part_id"] for item in exceptions}) == len(exceptions), "Small-part exception count differs")
    for item in exceptions:
        part = parts[item["part_id"]]
        require(item["position_mm"] == part["position_mm"] and item["color_id"] == part["color_id"]
                and item["body_mm"] == refined["types"][part["type_id"]]["body_mm"]
                and item["extended_grip"] is False, "Disclosed small-part exception differs from actual geometry")

    prefix = f"/artifacts/studies/{STUDY}/"

    def image(item):
        entry = entries[item["path"]]
        require(item["sha256"] == entry["sha256"] and item["bytes"] == entry["bytes"], "Actual comparison image hash mismatch")
        with Image.open(io.BytesIO(payload[item["path"]])) as source_image:
            require(list(source_image.size) == item["size_px"], "Actual image dimensions differ")
        return {"path": prefix + item["path"], "sha256": item["sha256"], "bytes": item["bytes"],
                "width": item["size_px"][0], "height": item["size_px"][1]}

    comparisons = []
    conditions = raw["render_conditions"]
    for source_view, view in [("front", "front"), ("three_quarter", "three-quarter")]:
        cameras = [row["images"][source_view]["normalization"] for row in raw["rows"]]
        condition_hash = record_sha({"cameras": cameras, "presentation": conditions["presentation"],
                                     "palette": conditions["source_palette"]})
        pictures = []
        for row, camera in zip(raw["rows"], cameras):
            role = row["role"]
            verify_camera(camera, conditions["roles"][role]["normalization"][source_view])
            require(camera == render_stats[role]["camera_conditions"]["normalized-" + source_view]
                    and camera["projection"] == "ORTHOGRAPHIC" and camera["direction_world"] == cameras[0]["direction_world"]
                    and math.isclose(camera["pixels_per_mm"], camera["image_size_px"][1] / camera["ortho_scale_mm"])
                    and math.isclose(camera["rendered_model_height_px"], camera["actual_projected_height_mm"] * camera["pixels_per_mm"])
                    and math.isclose(camera["rendered_model_height_px"], 864), "Normalized actual screen heights differ")
            pictures.append({**image(row["images"][source_view]), "role": ROLES[role],
                             "conditions_sha256": condition_hash, "projected_subject_height_px": camera["rendered_model_height_px"],
                             "source_camera": camera})
        comparisons.append({"id": "shape-" + view, "kind": "shape", "view": view, "framing_rule": "MATCHED_SCREEN_HEIGHT",
            "conditions_sha256": condition_hash, "method_note": "3案の実頂点投影を同じ画面上高さへそろえています。実寸比ではありません。",
            "images": pictures})
    face_rule = raw["rows"][0]["images"]["face"]["crop_rule"]
    region = [face_rule["x_fraction_of_body_height"][0], face_rule["z_fraction_of_body_height"][0],
              face_rule["x_fraction_of_body_height"][1], face_rule["z_fraction_of_body_height"][1]]
    face_hash = record_sha({"rule": face_rule, "registrations": [row["images"]["face"]["registration"] for row in raw["rows"]]})
    faces = []
    for row in raw["rows"]:
        item = row["images"]["face"]
        verify_front_registration(item["registration"], depths[row["role"]])
        require(item["crop_rule"] == face_rule and item["crop_box_in_registered_image_px"]
                == raw["rows"][0]["images"]["face"]["crop_box_in_registered_image_px"], "Face crops use different registered regions")
        faces.append({**image(item), "role": ROLES[row["role"]], "conditions_sha256": face_hash,
                      "normalized_face_region": region, "source_registration": item["registration"]})
    comparisons.append({"id": "face-front", "kind": "face", "view": "front",
        "framing_rule": "MATCHED_NORMALIZED_FACE_REGION", "conditions_sha256": face_hash,
        "normalized_face_region": region, "method_note": "土台を除く原型の体高に登録した、同じ顔領域です。", "images": faces})
    details = [{**image(item), "region": item["region"], "crop_rule": item["crop_rule"]} for item in raw["detail_comparisons"]]
    require({item["region"] for item in details} == {"forehead", "eye_rims", "mouth"}, "Expected three actual facial-detail panels")
    quality = [{key: item[key] for key in ["id", "before", "after", "unit"]} | {"label": item["label_ja"]}
               for item in raw["quality_comparison"]]
    original_metric = raw["c_target_metrics"]["secondary_original_source_comparison"]
    quality.append({"id": "original-front-outline", "label": "原型との正面投影輪郭IoU（別の比較目標）",
        "before": original_metric["previous_360"]["silhouette"]["front"]["intersection_over_union"],
        "after": original_metric["refined"]["silhouette"]["front"]["intersection_over_union"], "unit": "IoU"})
    summary = {"schema_version": 1, "study_id": STUDY, "kind": "MONA_FINE_C_REFINEMENT_COMPARISON",
        "source_kind": raw["kind"], "source_commit": COMMIT, "source_study_sha256": STUDY_SHA, **FLAGS,
        "rows": rows, "comparisons": comparisons, "detail_comparisons": details,
        "appearance_limit": raw["visual_review"]["observations_ja"][2],
        "assembly_tradeoff": raw["limits_ja"][1] + " " + raw["limits_ja"][2] + " " + raw["limits_ja"][3],
        "assembly_layer_note": raw["assembly_unit_note_ja"],
        "changes": [raw["changed_regions_ja"][i] for i in [0, 1, 2, 3, 5]],
        "remaining_differences": raw["limits_ja"] + raw["visual_review"]["observations_ja"],
        "quality_comparison": quality, "metric_caution": raw["metric_caution_ja"],
        "original_source_tradeoff": "初期Cへの近さを優先した結果、原型との正面IoUは低下しています。別の比較目標の変化を隠さず示します。",
        "small_part_exceptions": exceptions, "surface_edge_treatment": raw["surface_edge_treatment"],
        "pattern_provenance": pattern, "render_conditions": conditions, "source_row_metrics": [row["metrics"] for row in raw["rows"]]}
    serialized = encoded(summary)
    privacy(serialized, "normalized refinement summary")
    destination = ROOT / prefix.lstrip("/")
    require(not destination.exists(), "Refusing to overwrite any existing refinement version")
    destination.mkdir(parents=True)
    for name, data in payload.items():
        (destination / name).write_bytes(data)
    (destination / "public-study.json").write_bytes(serialized)
    index = {"schema_version": 1, "revision": STUDY, "source_revision": COMMIT,
             "source_public_study_sha256": STUDY_SHA,
             "files": [{**entry, "path": prefix.lstrip("/") + entry["path"]} for entry in receipt["files"]]}
    (ROOT / f"archive/sources/{STUDY}.json").write_bytes(encoded(index))
    proof_record = {"study_id": STUDY, "source_commit": COMMIT, "public_source_files": 21, "public_source_bytes": 4465276,
        "private_inputs_read_only": 14, "private_inputs_copied": 0, "native_assets_copied": 0,
        "native_contract_sha256": sha(contract_bytes), "native_binding_report_sha256": sha(binding_bytes),
        "rows": [{"candidate_id": row["candidate_id"], **row["evidence"]} for row in rows], "files": []}
    (ROOT / f"archive/sources/{STUDY}-verification.json").write_bytes(encoded(proof_record))
    pointer = {"schema_version": 1, "study_id": STUDY, "state": "READY", **FLAGS,
               "source_commit": COMMIT, "data_url": prefix + "public-study.json", "data_sha256": sha(serialized)}
    (ROOT / "archive/mona-refinement.json").write_bytes(encoded(pointer))
    translations = {raw["assembly_unit_note_ja"]: raw["assembly_unit_note_en"],
                    raw["metric_caution_ja"]: raw["metric_caution_en"]}
    for name in ["changed_regions", "limits"]:
        translations.update(zip(raw[name + "_ja"], raw[name + "_en"], strict=True))
    translations.update(zip(raw["visual_review"]["observations_ja"], raw["visual_review"]["observations_en"], strict=True))
    translations.update({item["label_ja"]: item["label_en"] for item in raw["quality_comparison"]})
    translations.update({item["reason_ja"]: item["reason_en"] for item in exceptions})
    translations[summary["assembly_tradeoff"]] = " ".join(raw["limits_en"][i] for i in [1, 2, 3])
    (ROOT / "site/i18n/mona-refinement-source.en.json").write_bytes(encoded(translations))
    print(json.dumps({"approved_files": len(payload), "source_bytes": 4465276, "read_only_private_inputs": 14,
                      "copied_private_inputs": 0, "actual_rows_verified": len(rows),
                      "summary_sha256": pointer["data_sha256"]}, indent=2))


if __name__ == "__main__":
    main()
