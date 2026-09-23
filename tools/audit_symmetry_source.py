"""Independently reconstruct the sealed corrected source, support loads and actual native raster evidence."""

import argparse
import gzip
import hashlib
import json
from pathlib import Path

from stage_density_case import committed_bytes
from symmetry_cells import nominal_material_cells, nominal_reflection_metrics
from symmetry_evidence import geometry_sequence_identity, validate_part_pairs, validate_native_pair_volumes
from symmetry_support_evidence import verify_bilateral_supports

ROOT = Path(__file__).resolve().parents[1]


def grid(manifest):
    result = {}
    for (x, y, z), color in nominal_material_cells(manifest).items():
        coordinates = [x / 8, y / 8, z / 1.6 - 0.5]
        if any(abs(value - round(value)) >= 1e-5 for value in coordinates):
            raise ValueError("Actual material cells do not match the declared source diff coordinate system")
        key = tuple(round(value) for value in coordinates)
        if key in result:
            raise ValueError("Actual material cells overlap in the source-difference audit")
        result[key] = color
    return result


def raster(path):
    from PIL import Image

    with Image.open(path) as image:
        width, height = image.size
        rgba = image.convert("RGBA").tobytes()
    return raster_rgba(width, height, rgba)


def raster_rgba(width, height, rgba):
    if type(width) is not int or type(height) is not int or width <= 0 or height <= 0 or len(rgba) != width * height * 4:
        raise ValueError("Invalid actual RGBA raster size")
    labels = bytearray(width * height)
    for index in range(width * height):
        red, green, blue, alpha = rgba[index * 4:index * 4 + 4]
        if alpha > 127:
            labels[index] = 1 + [red, green, blue].index(max(red, green, blue))
    reflected = bytearray().join(labels[y * width:(y + 1) * width][::-1] for y in range(height))
    mismatches = [index for index, (a, b) in enumerate(zip(labels, reflected, strict=True)) if bool(a) != bool(b)]
    maximum_distance = 0
    for index in mismatches:
        x, y = index % width, index // width
        destination = reflected if labels[index] else labels
        if not any(destination[yy * width + xx] for yy in range(max(0, y - 1), min(height, y + 2))
                   for xx in range(max(0, x - 1), min(width, x + 2))):
            raise ValueError("Actual native silhouette disagreement exceeds the declared one-pixel boundary tolerance")
        maximum_distance = 1
    return {
        "image_size_px": [width, height],
        "left_eye_pixels": sum(labels[y * width + x] == 3 for y in range(height) for x in range(width // 2)),
        "right_eye_pixels": sum(labels[y * width + x] == 3 for y in range(height) for x in range(width // 2, width)),
        "all_label_xor_including_silhouette": sum(a != b for a, b in zip(labels, reflected, strict=True)),
        "whole_material_xor": sum(a != b for a, b in zip(labels, reflected, strict=True) if a and b),
        "silhouette_xor": len(mismatches),
        "maximum_silhouette_boundary_distance_pixels": maximum_distance,
        "eye_mask_xor": sum((a == 3) != (b == 3) for a, b in zip(labels, reflected, strict=True)),
        "classification": "Unlit native R/G/B labels with alpha>127; paired foreground materials exclude separately reported silhouette-edge disagreements.",
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--receipt", type=Path, required=True)
    parser.add_argument("--receipt-sha256", required=True)
    parser.add_argument("--stage", type=Path, required=True)
    args = parser.parse_args()
    receipt_bytes = args.receipt.read_bytes()
    if hashlib.sha256(receipt_bytes).hexdigest() != args.receipt_sha256:
        raise ValueError("The source audit requires the exact fixed receipt")
    receipt = json.loads(receipt_bytes)
    stage = args.stage.resolve()
    if not stage.is_relative_to(ROOT / ".archive-work"):
        raise ValueError("Symmetry evidence output must stay in owned staging")
    review = json.loads((stage / "source-review.json").read_text())
    case = review["case_id"]
    if receipt["source_commit"] != review["source_commit"] or receipt.get("case_ids") != [case]:
        raise ValueError("The source audit must match this exact staged single case")
    repo = Path(receipt["source_root"]).parents[3]

    def read(suffix):
        entries = [entry for entry in receipt["read_only_verification_files"] if entry["path"].endswith(suffix)]
        if len(entries) != 1:
            raise ValueError("A required source audit input is missing or ambiguous: " + suffix)
        entry = entries[0]
        raw = committed_bytes(repo, Path(entry["path"]), receipt["source_commit"], entry)
        return json.loads(raw), entry["sha256"]

    full, manifest_sha = read(f"/cases/{case}/manifest.json")
    proof = json.loads(gzip.decompress((stage / "light/validation" / f"{case}-symmetry-support.json.gz").read_bytes()))
    mirror, mirror_sha = read(f"/cases/{case}/nominal-symmetry-pairs.json")
    native, _ = read(f"/portable/cases/{case}/native-complete.json")
    context = full["symmetry_context"]
    old, old_sha = read(f"/cases/{context['source_current_case_id']}/manifest.json")
    baseline, baseline_sha = read("/mechanical-baseline/manifest.json")
    change, change_sha = read("/intentional-change.json")
    if (old_sha != context["source_current_manifest_sha256"] or old_sha != change["source_manifest_sha256"]
            or baseline_sha != proof["mechanical_baseline_manifest_sha256"]
            or mirror_sha != context["nominal_part_mirror_map_ref"]["sha256"]
            or change_sha != proof["intentional_change_ref"]["sha256"]):
        raise ValueError("The old/current/new-baseline/mirror/intentional source bindings differ")
    identity = geometry_sequence_identity(full)
    if identity != proof["geometry_sequence_identity_sha256"] or identity != change["new_geometry_sequence_identity_sha256"]:
        raise ValueError("The actual new source identity differs from its frozen mechanical/change proof")
    pairs = validate_part_pairs(full["parts"], mirror["physical_part_mirror_map"])
    measured = validate_native_pair_volumes(proof["native_symmetry"], pairs)
    nominal = nominal_reflection_metrics(nominal_material_cells(full), 0, "c2")
    if any(nominal[key] != 0 for key in ["material_occupancy_xor", "paired_material_color_differences",
                                        "front_shape_xor", "paired_front_color_differences", "paired_front_depth_differences"]):
        raise ValueError("The actual corrected nominal shape/color/depth is not symmetric")
    if nominal["feature"]["front_mask_xor"] != 0:
        raise ValueError("Actual corrected eye material cells differ")
    mechanics = verify_bilateral_supports(proof, full, native)
    before, after = grid(old), grid(full)
    if grid(baseline) != after:
        raise ValueError("The new mechanical target changed occupancy or color after its baseline was sealed")
    added, removed = sorted(after.keys() - before.keys()), sorted(before.keys() - after.keys())
    recolored = sorted([*key, before[key], after[key]] for key in before.keys() & after.keys() if before[key] != after[key])
    if ([list(item) for item in added] != change["added_cells_1_6mm_z"]
            or [list(item) for item in removed] != change["removed_cells_1_6mm_z"]
            or recolored != change["recolored_cells_before_after"]):
        raise ValueError("The actual old/new geometry/color delta differs from the explicit intended change record")
    native_render, _ = read("/native-material-mask-render.json")
    native_visual, _ = read("/native-visual-symmetry.json")
    originals = json.loads((stage / "image-metadata-review.json").read_text())
    mask_record = next(item for item in originals if item["path"].endswith("/native-material-front.png"))
    scene_sha = hashlib.sha256((stage / "original-scene.blend").read_bytes()).hexdigest()
    if (native_render["mask_sha256"] != mask_record["source_sha256"]
            or native_visual["mask_sha256"] != mask_record["source_sha256"]
            or native_render["scene_sha256"] != scene_sha or native_visual["native_scene_sha256"] != scene_sha
            or native_render["manifest_sha256"] != manifest_sha or native_render["actual_instances"] != len(full["parts"])
            or native_render["palette_label_channels"] != {"c0": "R", "c1": "G", "c2": "B"}):
        raise ValueError("The actual unlit native pixels are not bound to the original complete native scene")
    pixels = raster(stage / "native" / mask_record["path"])
    if (pixels["eye_mask_xor"] != native_visual["left_vs_reflected_right_eye_xor_pixels"]
            or pixels["whole_material_xor"] != native_visual["whole_material_xor_pixels"]
            or pixels["silhouette_xor"] != native_visual["whole_silhouette_xor_pixels"]
            or pixels["left_eye_pixels"] != native_visual["eyes"]["left"]["pixels"]
            or pixels["right_eye_pixels"] != native_visual["eyes"]["right"]["pixels"]
            or pixels["left_eye_pixels"] != pixels["right_eye_pixels"]
            or pixels["eye_mask_xor"] != 0 or pixels["whole_material_xor"] != 0
            or pixels["maximum_silhouette_boundary_distance_pixels"] > native_visual["raster_boundary_tolerance_pixels"]):
        raise ValueError("Recomputed actual native raster measurements differ from the sealed source report")
    visual = {"case_id": case, "intentional_change_from_previous_published_case": {
        "added_1_6mm_cells": len(added), "removed_1_6mm_cells": len(removed), "recolored_1_6mm_cells": len(recolored),
        "full_diff_matches_sealed_readonly_record": True},
        "new_mechanical_baseline_cells_and_colors_exact": True, "actual_native_png": pixels,
        "physical_validation": "UNKNOWN"}
    for name, data in [
        ("independent-source-symmetry.json", {"identity": identity, "pairs": pairs, "source_native_measurements": measured, "nominal": nominal}),
        ("independent-mechanical-supports.json", mechanics), ("independent-change-and-visual.json", visual),
    ]:
        (stage / name).write_text(json.dumps(data, indent=2) + "\n")
    print(json.dumps({"case": case, "actual": len(full["parts"]), "native_pairs": measured["actual_native_type_rotation_pairs"],
                      "supports": mechanics["checked_material_supports"], "prefixes": mechanics["actual_native_load_prefixes"],
                      "nominal_xor": 0, "eyes": pixels["left_eye_pixels"], "native_raster": pixels}, indent=2))


if __name__ == "__main__":
    main()
