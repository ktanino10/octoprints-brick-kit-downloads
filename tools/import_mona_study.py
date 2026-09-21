"""Import the pinned compact Mona READY set; private evidence is read-only and never copied."""

import argparse
import hashlib
import io
import json
import math
from pathlib import Path, PurePosixPath
import subprocess

from PIL import Image

from mona_study_evidence import require, verify_manifest_bom, verify_reference_identity
from validate_archive import privacy

ROOT = Path(__file__).resolve().parents[1]
STUDY = "mona-likeness-360-20260921"
COMMIT = "a666ae1c50a5b6626f6b3b629e688e08e2675c83"
RECEIPT_SHA = "ba4a56f8d25468d035b8411d2db452310f769740efeac256b6b33cf6f2cfc706"
STUDY_SHA = "fd25139be15b6347e9149b4c71e8ddfc0d007e4988b45a54de7ee67306efdc24"
ROLES = {"original-source": "original", "phase1-fine-c": "fine-c",
         "r3-baseline": "current-r3", "dense360-pilot": "pilot-360"}
FLAGS = {"current_revision_unchanged": "r3-8mm-20260920", "selection": "NOT_SELECTED",
         "visual_approval": "PENDING", "physical_fit": "UNKNOWN", "retention_strength": "UNKNOWN",
         "slicer_status": "NOT_SLICED", "full_print": "ON_HOLD"}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def encoded(data):
    return json.dumps(data, ensure_ascii=False, indent=2).encode() + b"\n"


def record_sha(data):
    return sha(json.dumps(data, sort_keys=True, separators=(",", ":")).encode())


def verify_camera(camera, declaration):
    require({key: value for key, value in camera.items() if key != "camera_matrix_world_m"} == declaration,
            "Rendered camera differs from its declared framing")
    matrix = camera["camera_matrix_world_m"]
    require(len(matrix) == 4 and all(len(row) == 4 and all(math.isfinite(value) for value in row) for row in matrix)
            and matrix[3] == [0, 0, 0, 1], "Invalid rendered camera matrix")
    for column, vector in enumerate(["right_world", "up_world", "direction_world"]):
        require(all(math.isclose(matrix[row][column], camera[vector][row], rel_tol=0, abs_tol=1e-6)
                    for row in range(3)), "Rendered camera basis differs from its view")
    require(all(math.isclose(matrix[row][3], camera["position_mm"][row] / 1000, rel_tol=0, abs_tol=1e-6)
                for row in range(3)), "Rendered camera position differs from its view")


def checked(path, expected, size=None, repo=None):
    require(path.is_file() and not path.is_symlink(), "Missing or symlinked explicit READY input")
    data = path.read_bytes()
    require(sha(data) == expected and (size is None or len(data) == size), "READY input bytes changed: " + path.name)
    if repo:
        require(path.resolve().is_relative_to(repo), "Verification input is outside the source project")
        relative = path.relative_to(repo).as_posix()
        blob = subprocess.check_output(["git", "-C", str(repo), "cat-file", "blob", f"{COMMIT}:{relative}"])
        require(blob == data, "READY input differs from the pinned source commit: " + path.name)
    return data


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--handoff", type=Path, required=True)
    args = parser.parse_args()
    receipt = json.loads(checked(args.handoff, RECEIPT_SHA))
    require(receipt["state"] == "READY" and receipt["source_commit"] == COMMIT
            and receipt["study_id"] == STUDY and receipt["selection"] == "NOT_SELECTED"
            and receipt["user_likeness_approval"] == "PENDING", "Unapproved Mona READY identity")
    public = Path(receipt["source_root"])
    require(public.name == "public" and public.parent.name == STUDY, "Unexpected compact public source root")
    repo = public.parents[3].resolve()
    entries = {entry["path"]: entry for entry in receipt["files"]}
    require(len(entries) == len(receipt["files"]) == 23
            and sum(entry["bytes"] for entry in entries.values()) == receipt["total_bytes"] == 3991425,
            "Changed compact Mona allowlist")
    payload = {}
    for name, entry in entries.items():
        relative = PurePosixPath(name)
        require(len(relative.parts) == 1 and relative.name == name and "\\" not in name
                and (relative.suffix in {".json", ".csv", ".jpg", ".png", ".html", ".md"} or name == "LICENSE"),
                "Native, internal or escaping file is outside the compact Mona scope")
        data = checked(public / name, entry["sha256"], entry["bytes"], repo)
        privacy(data, name)
        if relative.suffix in {".jpg", ".png"}:
            with Image.open(io.BytesIO(data)) as image:
                require(not image.getexif() and not any(key in image.info for key in
                        ["xmp", "XML:com.adobe.xmp", "File", "Date", "Time"]), "Image metadata needs review")
        payload[name] = data
    require(sha(payload["study.json"]) == STUDY_SHA, "The approved Mona summary changed")
    raw = json.loads(payload["study.json"])
    require(raw["state"] == "READY_FOR_USER_COMPARISON" and raw["kind"] == "MONA_LIKENESS_AND_SCALE_STUDY"
            and raw["study_id"] == STUDY and raw["current_revision_unchanged"] == FLAGS["current_revision_unchanged"]
            and raw["primary_reference"] == "phase1-fine-c"
            and raw["visual_review"]["user_likeness_approval"] == "PENDING"
            and raw["visual_review"]["current_r3_changed"] is False, "Mona comparison must not adopt a new kit")
    for key in ["selection", "physical_fit", "retention_strength", "slicer_status", "full_print"]:
        require(raw["status"][key] == FLAGS[key], "Mona physical or adoption gate changed")

    allowed_private = {entry["path"]: entry for entry in receipt["read_only_verification_files"]}
    require(len(allowed_private) == 7, "Only seven explicit read-only verification inputs are permitted")
    private = {}
    for name, entry in allowed_private.items():
        require(entry["purpose"] == "READ_ONLY_COUNT_OR_ORIGINAL_SOURCE_VERIFICATION_NOT_PUBLICATION",
                "Private verification scope changed")
        private[name] = checked(Path(name), entry["sha256"], entry["bytes"], repo)
    proofs, manifests = {}, {}
    reference_paths = {
        "phase1-fine-c": ROOT / "artifacts/phase1/mona-fine/manifest.json",
        "r3-baseline": ROOT / "artifacts/revisions/r3-8mm-20260920/mona-practical8/manifest.json",
    }
    for item in receipt["private_count_verification"]:
        if item["role"] == "original-source":
            original_bytes = private[item["original_render_input_path"]]
            original = json.loads(original_bytes)
            require(item["manifest_path"] is None and item["bom_path"] is None
                    and original["physical_piece_count"] is None and original["native_brick_types"] is None,
                    "Unsubdivided original must have no fabricated block count")
            proofs[item["role"]] = {"geometry_sha256": sha(original_bytes)}
            continue
        mb, bb = private[item["manifest_path"]], private[item["bom_path"]]
        require(sha(mb) == item["manifest_sha256"] and sha(bb) == item["bom_sha256"],
                "Verification entry and allowlist hashes differ")
        proof = verify_manifest_bom(mb, bb)
        manifest = json.loads(mb)
        require(manifest["candidate_id"] == item["candidate_id"]
                and proof["counted_instances"] == item["physical_piece_count"], "Actual candidate/count mismatch")
        if item["role"] in reference_paths:
            proof["reference_identity_verified"] = verify_reference_identity(
                manifest, json.loads(reference_paths[item["role"]].read_text()))
        manifests[item["role"]] = manifest
        proofs[item["role"]] = proof
    pilot = manifests["dense360-pilot"]
    require(pilot["native_binding"]["actual_native_geometry"] is True
            and pilot["native_binding"]["new_prototypes_sha256"] == receipt["native_geometry_sha256"]
            and pilot["sampling"]["silhouette_pruning"] is False
            and pilot["sampling"]["two_cell_module_snap"] is False
            and pilot["fidelity_sampling_verification"] == raw["fidelity_sampling"],
            "Pilot sampling/native binding differs from the original-source study")
    for key in ["slug", "source_revision", "source_stl_bounds", "source_object_bounds", "triangles"]:
        require(pilot["source"][key] == original["source"][key], "Pilot uses a different original source")
    ratio = pilot["source"]["target_height_mm"] / original["source"]["target_height_mm"]
    for left, right in zip(pilot["source"]["source_stl_to_assembly_mm"][:3], original["source"]["source_stl_to_assembly_mm"][:3]):
        require(all(math.isclose(a, b * ratio, rel_tol=1e-8, abs_tol=1e-7) for a, b in zip(left, right)),
                "Fresh-sampling transform is not registered to the actual original source")
    require(all(spec["pitch_mm"] == 8 and spec["stud_diameter_mm"] == 4.8 and spec["open_underside"]
                for spec in pilot["types"].values()), "Pilot interface was resized")

    prefix = f"/artifacts/studies/{STUDY}/"

    def image(item):
        entry = entries[item["path"]]
        require(item["sha256"] == entry["sha256"] and item["bytes"] == entry["bytes"], "Image hash/size mismatch")
        with Image.open(io.BytesIO(payload[item["path"]])) as actual:
            require(list(actual.size) == item["size_px"], "Actual image dimensions differ")
        return {"path": prefix + item["path"], "sha256": item["sha256"], "bytes": item["bytes"],
                "width": item["size_px"][0], "height": item["size_px"][1]}

    rows = []
    require({row["role"] for row in raw["rows"]} == set(ROLES) and len(raw["rows"]) == 4, "Expected four comparison roles")
    for row in raw["rows"]:
        role, metrics, proof = row["role"], row["metrics"], dict(proofs[row["role"]])
        if role == "original-source":
            require(metrics["physical_piece_count"] is None and metrics["unique_types"] is None
                    and metrics["layer_count"] is None and row["provenance"]["source_mesh_sha256"] == proof["geometry_sha256"]
                    and metrics["actual_size_mm"] == original["printed_source_size_mm"], "Original reference mismatch")
            normalized_metrics = {key: None for key in ["part_count", "unique_types", "one_by_one_exceptions",
                "layer_count", "minimum_part_mm", "grip_long_ge_15_8_count"]}
        else:
            normalized_metrics = proof.pop("metrics")
            for public_key, source_key in [
                ("part_count", "physical_piece_count"), ("unique_types", "unique_types"),
                ("one_by_one_exceptions", "one_by_one_exceptions"), ("layer_count", "layer_count"),
            ]:
                require(normalized_metrics[public_key] == metrics[source_key], "Actual summarized metric differs")
            require(normalized_metrics["minimum_part_mm"] == [metrics[key] for key in
                    ["minimum_xy_short_mm", "minimum_xy_long_mm", "minimum_body_height_mm"]],
                    "Independent minima were changed or combined")
            require(proof["manifest_sha256"] == row["provenance"]["manifest_sha256"]
                    and proof["bom_sha256"] == row["provenance"]["bom_sha256"]
                    and proof["counted_instances"] == row["provenance"]["actual_render_part_count"],
                    "Rendered row and actual instances differ")
            proof["geometry_sha256"] = row["provenance"]["native_geometry_source_hashes"][-1]["sha256"]
            proof["native_geometry_source_hashes"] = row["provenance"]["native_geometry_source_hashes"]
        normalized_metrics["dimensions_mm"] = metrics["actual_size_mm"]
        result = {"role": ROLES[role], "source_role": role, "candidate_id": row["candidate_id"],
                  "count_status": "NOT_APPLICABLE" if role == "original-source" else "ACTUAL_INSTANCES",
                  "pitch_mm": None if role == "original-source" else 4 if role == "phase1-fine-c" else 8,
                  "metrics": normalized_metrics, "evidence": proof}
        if role == "dense360-pilot":
            require(metrics == receipt["rows"][-1]["metrics"]
                    and normalized_metrics["grip_long_ge_15_8_count"] == metrics["grip_long_ge_15_8_mm"],
                    "Final pilot metrics differ from READY")
            result.update(stud_diameter_mm=4.8, open_underside=True)
            result["evidence"].update(resampled_from_original=True,
                                     original_geometry_sha256=proofs["original-source"]["geometry_sha256"])
        rows.append(result)

    comparisons = []
    conditions = raw["render_conditions"]
    for source_view, view in [("front", "front"), ("three_quarter", "three-quarter")]:
        cameras = [row["images"][source_view]["normalization"] for row in raw["rows"]]
        condition_hash = record_sha({"cameras": cameras, "presentation": conditions["presentation"],
                                     "palette": conditions["source_palette"]})
        pictures = []
        for row, camera in zip(raw["rows"], cameras):
            item = row["images"][source_view]
            verify_camera(camera, conditions["roles"][row["role"]]["normalization"][source_view])
            require(camera["projection"] == "ORTHOGRAPHIC" and camera["role"] == row["role"]
                    and camera["direction_world"] == cameras[0]["direction_world"]
                    and camera["group_id"] == item["group_id"]
                    and math.isclose(camera["pixels_per_mm"], camera["image_size_px"][1] / camera["ortho_scale_mm"])
                    and math.isclose(camera["rendered_model_height_px"],
                                     camera["actual_projected_height_mm"] * camera["pixels_per_mm"])
                    and math.isclose(camera["rendered_model_height_px"], 864), "Projected screen-height normalization mismatch")
            pictures.append({**image(item), "role": ROLES[row["role"]], "conditions_sha256": condition_hash,
                             "projected_subject_height_px": camera["rendered_model_height_px"],
                             "source_camera": camera})
        comparisons.append({"id": "shape-" + view, "kind": "shape", "view": view,
            "framing_rule": "MATCHED_SCREEN_HEIGHT", "conditions_sha256": condition_hash,
            "method_note": raw["normalization_note_ja"], "images": pictures})
    face = conditions["face_region"]
    region = [face["x_fraction_of_body_height"][0], face["z_fraction_of_body_height"][0],
              face["x_fraction_of_body_height"][1], face["z_fraction_of_body_height"][1]]
    registrations = [row["images"]["face"]["registration"] for row in raw["rows"]]
    face_hash = record_sha({"rule": face, "registrations": registrations})
    faces = []
    for row, registration in zip(raw["rows"], registrations):
        item = row["images"]["face"]
        require(item["crop_rule"] == face and registration["exclude_foundation"] is True
                and registration == conditions["roles"][row["role"]]["registration"]["front"]
                and item["crop_box_in_registered_image_px"] == raw["rows"][0]["images"]["face"]["crop_box_in_registered_image_px"],
                "Registered face region differs")
        faces.append({**image(item), "role": ROLES[row["role"]], "conditions_sha256": face_hash,
                      "normalized_face_region": region})
    comparisons.append({"id": "face-front", "kind": "face", "view": "front",
        "framing_rule": "MATCHED_NORMALIZED_FACE_REGION", "conditions_sha256": face_hash,
        "normalized_face_region": region, "method_note": "土台を除く原型の体高に登録した、同じ顔領域です。",
        "images": faces})
    physical = next(group for group in raw["comparison_groups"] if group["mode"] == "PHYSICAL_SIZE_RATIO")
    physical_cameras = {ROLES[role]: conditions["roles"][role]["physical_scale"] for role in physical["roles"]}
    for camera in physical_cameras.values():
        require(camera["pixels_per_mm"] == physical["pixels_per_mm"]
                and math.isclose(camera["pixels_per_mm"], camera["image_size_px"][1] / camera["ortho_scale_mm"])
                and camera["position_mm"] == [0, -2000, 180] and camera["target_mm"] == [0, 0, 180],
                "Physical comparison uses independent fitting rather than one scale")
    comparisons.append({"id": "scale-front", "kind": "scale", "view": "front",
        "framing_rule": "SHARED_PIXELS_PER_MM", "conditions_sha256": record_sha(physical_cameras),
        "pixels_per_mm": physical["pixels_per_mm"],
        "row_pixels_per_mm": {role: camera["pixels_per_mm"] for role, camera in physical_cameras.items()},
        "row_roles": list(physical_cameras), "sheet": image(physical),
        "method_note": "初期Cと新案を同じ2.5 px/mm、同じ接地面で比較します。個別の拡大合わせはしていません。"})
    summary = {"schema_version": 1, "study_id": STUDY, "kind": raw["kind"], "source_commit": COMMIT,
        "source_study_sha256": STUDY_SHA, **FLAGS, "rows": rows, "comparisons": comparisons,
        "prior_visual_feedback": "USERREJECTS_LIKENESS", "appearance_limit": raw["visual_review"]["observations_ja"][5],
        "assembly_tradeoff": raw["limits_ja"][1] + " " + raw["limits_ja"][2],
        "priority": raw["priority_ja"], "assembly_layer_note": raw["assembly_layer_note_ja"],
        "limitations": raw["limits_ja"], "visual_observations": raw["visual_review"]["observations_ja"],
        "fidelity_sampling": raw["fidelity_sampling"], "pilot_metrics": raw["rows"][-1]["metrics"],
        "fixed_interface_image": image(raw["fixed_interface_image"]),
        "render_conditions": conditions, "descriptive_likeness_metrics": raw["descriptive_likeness_metrics"]}
    generated = encoded(summary)
    privacy(generated, "public Mona summary")
    destination = ROOT / prefix.lstrip("/")
    require(not destination.exists(), "Refusing to overwrite an existing Mona study")
    destination.mkdir(parents=True)
    for name, data in payload.items():
        (destination / name).write_bytes(data)
    (destination / "public-study.json").write_bytes(generated)
    source_index = {"schema_version": 1, "revision": STUDY, "source_revision": COMMIT,
        "source_public_study_sha256": STUDY_SHA,
        "files": [{**entry, "path": prefix.lstrip("/") + entry["path"]} for entry in receipt["files"]]}
    (ROOT / f"archive/sources/{STUDY}.json").write_bytes(encoded(source_index))
    proof_record = {"study_id": STUDY, "source_commit": COMMIT, "public_source_files": 23,
        "public_source_bytes": 3991425, "private_inputs_copied": 0, "native_assets_copied": 0,
        "rows": [{"candidate_id": row["candidate_id"], **row["evidence"]} for row in rows], "files": []}
    (ROOT / f"archive/sources/{STUDY}-verification.json").write_bytes(encoded(proof_record))
    pointer = {"schema_version": 1, "study_id": STUDY, "state": "READY", **FLAGS,
        "source_commit": COMMIT, "data_url": prefix + "public-study.json", "data_sha256": sha(generated)}
    (ROOT / "archive/mona-study.json").write_bytes(encoded(pointer))
    translations = {}
    for name in ["priority", "normalization_note", "assembly_layer_note", "piece_count_definition"]:
        translations[raw[name + "_ja"]] = raw[name + "_en"]
    for left, right in [("limits_ja", "limits_en")]:
        translations.update(zip(raw[left], raw[right], strict=True))
    translations.update(zip(raw["visual_review"]["observations_ja"], raw["visual_review"]["observations_en"], strict=True))
    translations[summary["assembly_tradeoff"]] = raw["limits_en"][1] + " " + raw["limits_en"][2]
    (ROOT / "site/i18n/mona-source.en.json").write_bytes(encoded(translations))
    print(json.dumps({"files_copied": len(payload), "source_bytes": 3991425,
                      "private_inputs_copied": 0, "actual_brick_rows_verified": 3,
                      "summary_sha256": pointer["data_sha256"]}, indent=2))


if __name__ == "__main__":
    main()
