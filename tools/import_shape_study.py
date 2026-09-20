"""Import only READY comparison media and verify private count inputs without publishing them."""

import argparse
import csv
import hashlib
import io
import json
import math
from pathlib import Path, PurePosixPath
import re
import shutil
import subprocess

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
STUDY = "shape-study-20260920"
BASELINE = "r3-8mm-20260920"
COMMIT = "3ef504a3819eef7e864fd606991d793abfb56ef8"
RECEIPT_SHA = "c2c69641f64b4492a3fc5958ec92548a86fb14d77452873e526cec99d04f753e"
INVENTORY_SHA = "4ffbe960589cc0baf6d241d4a65b58e6aa1a676ef510f19cae18bcf61c960c6a"
STUDY_SHA = "44e3eb00e697bde16540c935db56718238a58e4d30b121ab83c67999ebcdffcc"
PRIVATE = re.compile(rb"/Users/|/home/[^/ ]+/|/private/var/|/var/folders/|file:///|session-state/|github_pat_[A-Za-z0-9_]{30,}|gh[pousr]_[A-Za-z0-9]{25,}")
COUNTS = {"mona": 519, "copilot": 695, "ducky": 413}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def checked(path, expected):
    require(path.is_file() and not path.is_symlink(), "Missing or symlinked explicit input")
    data = path.read_bytes()
    require(sha(data) == expected, f"Changed READY input: {path.name}")
    return data


def private_file(value, directory, name, digest):
    path = Path(value)
    require(path.resolve().is_relative_to(directory.resolve()) and path.name == name,
            "Private count verification path is outside the explicit study input")
    return checked(path, digest)


def pose_projection(manifest):
    return sorted((part["id"], part["type_id"], part["color_id"], tuple(part["position_mm"]), part["rotation_z_deg"])
                  for part in manifest["parts"])


def verify_count(row, verification, source_study_root):
    manifest_bytes = private_file(verification["manifest_path"], source_study_root, "manifest.json", verification["manifest_sha256"])
    bom_bytes = private_file(verification["bom_path"], source_study_root, "bom.csv", verification["bom_sha256"])
    manifest = json.loads(manifest_bytes)
    require(manifest["candidate_id"] == row["candidate_id"], "Study candidate identity mismatch")
    parts = {part["id"]: part for part in manifest["parts"]}
    require(len(parts) == len(manifest["parts"]), "Duplicate actual part IDs")
    bom = list(csv.DictReader(io.StringIO(bom_bytes.decode("utf-8"))))
    require(len(bom) == len(parts) and {item["part_id"] for item in bom} == set(parts), "BOM and assembly ID sets differ")
    for item in bom:
        part = parts[item["part_id"]]
        require(item["type_id"] == part["type_id"] and item["color_id"] == part["color_id"]
                and item["hex"] == manifest["palette"][part["color_id"]]["hex"], "BOM type/color mismatch")
        require([float(item[key]) for key in ["x_mm", "y_mm", "z_mm"]] == part["position_mm"]
                and float(item["rotation_z_deg"]) == part["rotation_z_deg"]
                and int(item["assembly_step"]) == part["step"], "BOM pose or sequence mismatch")
        require(float(item["body_height_mm"]) == manifest["types"][part["type_id"]]["body_height_mm"], "BOM height mismatch")
    metrics = row["metrics"]
    count = len(parts)
    require(count == metrics["physical_piece_count"] == metrics["part_count"] == verification["actual_part_count"]
            == row["provenance"]["actual_render_part_count"]
            == manifest["study_binding"]["physical_piece_count"], "Actual instance counts differ")
    require(row["provenance"]["manifest_sha256"] == verification["manifest_sha256"]
            and row["provenance"]["bom_sha256"] == verification["bom_sha256"]
            and row["provenance"]["native_geometry_sha256"] == manifest["study_binding"]["actual_used_geometry_sha256"],
            "Manifest/BOM/native hash provenance differs")
    type_ids = {part["type_id"] for part in parts.values()}
    used_types = [manifest["types"][key] for key in type_ids]
    small = sum(len(manifest["types"][part["type_id"]]["footprint_cells"]) == 1 for part in parts.values())
    require(len(type_ids) == metrics["unique_types"] and small == metrics["one_by_one_exceptions"], "Type or small-part count mismatch")
    require(sum(manifest["types"][part["type_id"]]["body_height_mm"] == 3.2 for part in parts.values()) == metrics["plate_parts"],
            "Plate instance count mismatch")
    minima = [min(min(item["body_mm"][:2]) for item in used_types),
              min(max(item["body_mm"][:2]) for item in used_types),
              min(item["body_height_mm"] for item in used_types)]
    require(all(abs(a - b) < 1e-7 for a, b in zip(minima, [
        metrics["min_xy_short_mm"], metrics["min_xy_long_mm"], metrics["min_body_height_mm"]])),
        "Independent minimum dimensions differ from actual used parts")
    require(metrics["baseline_count"] == COUNTS[row["character"]]
            and metrics["delta"] == count - COUNTS[row["character"]], "Baseline count or actual delta is wrong")
    require(all(item["pitch_mm"] == 8 and item["stud_diameter_mm"] == 4.8 for item in used_types),
            "The fixed connection system changed")
    adopted = json.loads((ROOT / "artifacts/revisions" / BASELINE / f"{row['character']}-practical8/manifest.json").read_text())
    require(manifest["palette"] == adopted["palette"], "Comparison palette changed")
    original_path = Path(verification["original_r3_manifest_path"])
    expected_original = source_study_root.parents[1] / "revisions" / BASELINE / f"{row['character']}-practical8/manifest.json"
    require(original_path.resolve() == expected_original.resolve(), "Original r3 verification reference differs")
    original = json.loads(original_path.read_text())
    require(pose_projection(original) == pose_projection(adopted), "Private/public adopted r3 identities or poses differ")
    baseline_ok = row["variant_id"] == "baseline-r3"
    if baseline_ok:
        require(pose_projection(manifest) == pose_projection(adopted), "Baseline comparison changes actual r3 poses or IDs")
    require(row["status"]["selection"] == ("BASELINE_REFERENCE" if baseline_ok else "PENDING")
            and row["status"]["physical_fit"] == row["status"]["retention_strength"] == "UNKNOWN",
            "Study approval or physical status changed")
    return {
        "manifest_sha256": verification["manifest_sha256"], "bom_sha256": verification["bom_sha256"],
        "native_geometry_sha256": row["provenance"]["native_geometry_sha256"],
        "counted_instances": count, "count_method": metrics["count_basis"],
        "baseline_identity_verified": baseline_ok,
        "id_pose_projection_sha256": sha(json.dumps(pose_projection(manifest), separators=(",", ":")).encode()),
        "bom_ids_types_colors_poses_match": True,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--handoff", type=Path, required=True)
    args = parser.parse_args()
    receipt = json.loads(checked(args.handoff, RECEIPT_SHA))
    require(receipt["state"] == "READY" and receipt["source_commit"] == COMMIT and receipt["study_id"] == STUDY,
            "Unexpected source READY identity")
    public = Path(receipt["source_root"]).resolve()
    source_study = public.parent
    require(public.name == "public" and source_study.name == STUDY, "Unexpected public input root")
    subprocess.run(["git", "-C", str(source_study.parents[2]), "cat-file", "-e", COMMIT + "^{commit}"],
                   check=True, stdout=subprocess.DEVNULL)
    allowlist = json.loads(checked(source_study / "public-inventory.json", INVENTORY_SHA))
    require(allowlist["files"] == receipt["files"] and len(receipt["files"]) == 32, "Unexpected comparison allowlist")
    entries = {entry["path"]: entry for entry in receipt["files"]}
    require(len(entries) == 32 and sum(item["bytes"] for item in entries.values()) == receipt["total_bytes"] == 5342538,
            "Duplicate or changed lightweight input scope")
    for name, entry in entries.items():
        rel = PurePosixPath(name)
        require(not rel.is_absolute() and ".." not in rel.parts and "\\" not in name
                and (rel.suffix.lower() in {".json", ".csv", ".jpg", ".html", ".md"} or name == "LICENSE"),
                "Large native/code or escaping input is outside the comparison scope")
        data = checked(public / name, entry["sha256"])
        require(len(data) == entry["bytes"] and not PRIVATE.search(data), "Size or privacy mismatch")
        if rel.suffix.lower() == ".jpg":
            with Image.open(io.BytesIO(data)) as image:
                require(not image.getexif() and not any(key in image.info for key in ["xmp", "XML:com.adobe.xmp"]),
                        "Image metadata requires review; do not publish original authoring metadata")
    raw = json.loads(checked(public / "study.json", STUDY_SHA))
    require(raw["state"] == "READY" and raw["current_revision_unchanged"] == BASELINE
            and raw["status"]["selection"] == "PENDING" and raw["status"]["current_r3_replacement"] == "NOT_AUTHORIZED"
            and raw["status"]["physical_fit"] == raw["status"]["retention_strength"] == "UNKNOWN"
            and raw["status"]["slicer_status"] == "NOT_SLICED" and raw["status"]["full_print"] == "ON_HOLD",
            "Study replaces or approves the adopted model")
    verification = {item["candidate_id"]: item for item in receipt["private_count_verification"]}
    require(len(verification) == len(raw["rows"]) == 9, "Expected nine verified candidate records")
    prefix = f"artifacts/studies/{STUDY}/"
    rows = []
    for row in raw["rows"]:
        evidence = verify_count(row, verification[row["candidate_id"]], source_study)
        metrics = row["metrics"]
        images = {}
        for public_view, source_view in [("perspective", "three_quarter"), ("front", "front")]:
            image = row["images"][source_view]
            entry = entries[image["path"]]
            require(entry["sha256"] == image["sha256"], "Actual rendered image hash mismatch")
            camera = raw["camera_conditions"][image["camera_group_id"]]
            require(camera["character"] == row["character"] and camera["view"] == source_view
                    and camera["projection"] == "ORTHOGRAPHIC"
                    and camera["geometry_scale_m_per_mm"] == 0.001
                    and camera["ortho_scale_mm"] > 0
                    and math.isclose(camera["pixels_per_mm_in_image_plane"],
                                     camera["image_size_px"][1] / camera["ortho_scale_mm"], rel_tol=1e-10)
                    and len(camera["camera_matrix_world_m"]) == 4 and camera["lighting"],
                    "Missing or inconsistent same-camera/scale/light evidence")
            images[public_view] = {"path": "/" + prefix + image["path"], "sha256": image["sha256"],
                                   "bytes": entry["bytes"], "comparison_group": image["camera_group_id"],
                                   "source_render_sha256": image["source_render_sha256"]}
        rows.append({
            "character": row["character"], "variant": row["variant_id"], "candidate_id": row["candidate_id"],
            "baseline_candidate_id": f"{row['character']}-practical8", "pitch_mm": 8, "stud_diameter_mm": 4.8,
            "metrics": {"part_count": metrics["physical_piece_count"], "unique_types": metrics["unique_types"],
                        "small_part_count": metrics["one_by_one_exceptions"],
                        "small_part_definition": "8 mm格子1セルの1×1部品。新しい1×1チップは追加していません。",
                        "minimum_part_mm": [metrics["min_xy_short_mm"], metrics["min_xy_long_mm"], metrics["min_body_height_mm"]],
                        "dimensions_mm": metrics["overall_size_mm"],
                        "plate_parts": metrics["plate_parts"], "assembly_step_count": metrics["assembly_step_count"],
                        "common_parts": metrics["common_parts"], "contour_or_slope_parts": metrics["contour_or_slope_parts"]},
            "images": images, "appearance_changes": [row["appearance_changes_ja"]],
            "assembly_tradeoffs": [row["tradeoff_ja"]], "evidence": evidence,
        })
    normalized = {
        "schema_version": 1, "kind": raw["kind"], "study_id": STUDY, "baseline_revision": BASELINE,
        "source_commit": COMMIT, "selection": "UNSELECTED", "physical_fit": "UNKNOWN",
        "retention_strength": "UNKNOWN", "slicer_status": "NOT_SLICED", "full_print": "ON_HOLD",
        "source_study_sha256": STUDY_SHA, "rows": rows, "camera_conditions": raw["camera_conditions"],
        "appearance_limit": raw["appearance_limit_ja"], "render_note": raw["render_note_ja"],
        "comparisons": [{**item, "path": "/" + prefix + item["path"]} for item in raw["comparisons"]],
    }
    generated = json.dumps(normalized, ensure_ascii=False, indent=2).encode() + b"\n"
    require(not PRIVATE.search(generated), "Private verification paths must not enter the public summary")
    destination = ROOT / prefix
    require(not destination.exists(), "Refusing to overwrite a published study revision")
    destination.mkdir(parents=True)
    for name in entries:
        shutil.copyfile(public / name, destination / name)
    (destination / "public-study.json").write_bytes(generated)
    source_index = {"schema_version": 1, "revision": STUDY, "source_revision": COMMIT,
                    "source_public_study_sha256": STUDY_SHA,
                    "scope": "Only the explicitly approved compact media/metrics. Private count paths and native assets excluded.",
                    "files": [{**entry, "path": prefix + entry["path"]} for entry in receipt["files"]]}
    (ROOT / "archive/sources" / f"{STUDY}.json").write_text(json.dumps(source_index, ensure_ascii=False, indent=2) + "\n")
    report = {"study_id": STUDY, "source_commit": COMMIT, "public_files_copied": 32,
              "public_source_bytes": receipt["total_bytes"], "native_assets_copied": 0,
              "private_paths_published": False, "rows": [{"candidate_id": row["candidate_id"], **row["evidence"]} for row in rows]}
    (ROOT / "archive/sources" / f"{STUDY}-verification.json").write_text(json.dumps({**report, "files": []}, indent=2) + "\n")
    pointer = {"schema_version": 1, "study_id": STUDY, "state": "READY", "baseline_revision": BASELINE,
               "selection": "UNSELECTED", "physical_fit": "UNKNOWN", "retention_strength": "UNKNOWN",
               "slicer_status": "NOT_SLICED", "full_print": "ON_HOLD", "source_commit": COMMIT,
               "data_url": "/" + prefix + "public-study.json", "data_sha256": sha(generated)}
    (ROOT / "archive/shape-study.json").write_text(json.dumps(pointer, indent=2) + "\n")
    print(json.dumps({"study_id": STUDY, "copied_files": 32, "copied_bytes": receipt["total_bytes"],
                      "actual_rows_verified": len(rows), "public_summary_sha256": pointer["data_sha256"]}, indent=2))


if __name__ == "__main__":
    main()
