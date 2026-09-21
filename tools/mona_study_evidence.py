"""Verify actual Mona instances across the preserved Fine-C and common-block schemas."""

import csv
import hashlib
import io
import json
import math


def require(condition, message):
    if not condition:
        raise ValueError(message)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def finite(value):
    return type(value) in {int, float} and math.isfinite(value)


def positive_dimensions(values):
    return isinstance(values, list) and len(values) == 3 and all(finite(value) and value > 0 for value in values)


def identity_projection(manifest):
    parts = []
    used_types = {}
    colors = {}
    for part in manifest["parts"]:
        identifier = part["type_id"]
        spec = manifest["types"][identifier]
        used_types[identifier] = {key: value for key, value in spec.items()
                                  if key.endswith("_mm") or key in {
                                      "cells", "footprint_cells", "stud_cells", "kind", "open_underside",
                                  }}
        colors[part["color_id"]] = manifest["palette"][part["color_id"]]["hex"]
        parts.append([
            part["id"], identifier, part["color_id"], [float(value) for value in part["position_mm"]],
            float(part["rotation_z_deg"]), part["layer"], part["step"],
        ])
    return {
        "frame": manifest["frame"], "position_origin": manifest["position_origin"],
        "parts": sorted(parts), "types": used_types, "colors": colors,
    }


def actual_metrics(manifest):
    require(manifest.get("units") == "mm" and manifest.get("position_origin") == "body-bottom-center"
            and manifest.get("frame") == {"up": "+Z", "front": "-Y", "handedness": "right"},
            "Unsupported actual Mona units, origin or frame")
    parts = manifest.get("parts")
    require(isinstance(parts, list) and parts, "Actual Mona assembly instances are missing")
    require(len({part["id"] for part in parts}) == len(parts), "Duplicate actual Mona part IDs")
    require(all(isinstance(part["id"], str) and part["id"] for part in parts), "Invalid actual Mona part ID")
    require(all(type(part["layer"]) is int and type(part["step"]) is int
                and part["step"] > 0 and part["layer"] >= 0
                and finite(part["rotation_z_deg"])
                and part["rotation_z_deg"] in {0, 90, 180, 270}
                and isinstance(part["position_mm"], list) and len(part["position_mm"]) == 3
                and all(finite(value) for value in part["position_mm"]) for part in parts),
            "Invalid actual layer, sequence or placement")
    type_ids = {part["type_id"] for part in parts}
    types = {identifier: manifest["types"][identifier] for identifier in type_ids}
    require(all(positive_dimensions(spec.get("body_mm")) for spec in types.values()),
            "Actual type body dimensions are missing")
    for spec in types.values():
        if "body_height_mm" in spec:
            require(finite(spec["body_height_mm"])
                    and math.isclose(spec["body_height_mm"], spec["body_mm"][2], abs_tol=1e-8),
                    "Type body height disagrees with its bounding box")

    def cells(spec):
        if "footprint_cells" in spec:
            footprint = spec["footprint_cells"]
            require(isinstance(footprint, list) and footprint
                    and len({tuple(cell) for cell in footprint}) == len(footprint),
                    "Invalid actual footprint")
            return len(footprint)
        rectangle = spec.get("cells")
        require(isinstance(rectangle, list) and len(rectangle) == 2
                and all(type(value) is int and value > 0 for value in rectangle),
                "Actual rectangle cell counts are missing")
        return rectangle[0] * rectangle[1]

    return {
        "part_count": len(parts),
        "unique_types": len(types),
        "one_by_one_exceptions": sum(cells(types[part["type_id"]]) == 1 for part in parts),
        "layer_count": len({part["layer"] for part in parts}),
        "minimum_part_mm": [
            min(min(spec["body_mm"][:2]) for spec in types.values()),
            min(max(spec["body_mm"][:2]) for spec in types.values()),
            min(spec["body_mm"][2] for spec in types.values()),
        ],
        "grip_long_ge_15_8_count": sum(max(types[part["type_id"]]["body_mm"][:2]) >= 15.8 - 1e-8 for part in parts),
    }


def verify_manifest_bom(manifest_bytes, bom_bytes):
    manifest = json.loads(manifest_bytes)
    metrics = actual_metrics(manifest)
    parts = {part["id"]: part for part in manifest["parts"]}
    reader = csv.DictReader(io.StringIO(bom_bytes.decode("utf-8-sig"), newline=""))
    columns = set(reader.fieldnames or [])
    required = {"part_id", "type_id", "hex", "x_mm", "y_mm", "rotation_z_deg"}
    require(len(reader.fieldnames or []) == len(columns) and required <= columns and columns & {"z_mm", "bottom_z_mm"}
            and columns & {"step", "assembly_step"} and columns & {"color_id", "color"},
            "Unsupported actual Mona BOM columns")
    rows = list(reader)
    require(len(rows) == len(parts) and {row["part_id"] for row in rows} == set(parts),
            "Actual Mona BOM and manifest instance ID sets differ")
    for row in rows:
        part = parts[row["part_id"]]
        palette = manifest["palette"][part["color_id"]]
        require(row["type_id"] == part["type_id"] and row["hex"] == palette["hex"],
                "Actual Mona BOM type or palette mismatch")
        if "color_id" in columns:
            require(row["color_id"] == part["color_id"], "Actual Mona BOM color ID mismatch")
        if "color" in columns:
            require(row["color"] == palette["name"], "Actual Mona BOM color name mismatch")
        for key in ["step", "assembly_step"]:
            if key in columns:
                require(int(row[key]) == part["step"], "Actual Mona BOM assembly sequence mismatch")
        if "layer" in columns:
            require(int(row["layer"]) == part["layer"], "Actual Mona BOM placement layer mismatch")
        coordinates = {"x_mm": part["position_mm"][0], "y_mm": part["position_mm"][1],
                       "z_mm": part["position_mm"][2], "bottom_z_mm": part["position_mm"][2],
                       "rotation_z_deg": part["rotation_z_deg"]}
        if "body_height_mm" in columns:
            coordinates["body_height_mm"] = manifest["types"][part["type_id"]]["body_mm"][2]
        for key, expected in coordinates.items():
            if key in columns:
                value = float(row[key])
                require(math.isfinite(value) and math.isclose(value, expected, rel_tol=0, abs_tol=1e-7),
                        "Actual Mona BOM placement or body height mismatch")
    projection = json.dumps(identity_projection(manifest), sort_keys=True, separators=(",", ":")).encode()
    return {
        "metrics": metrics, "manifest_sha256": digest(manifest_bytes), "bom_sha256": digest(bom_bytes),
        "counted_instances": len(parts), "bom_ids_match": True,
        "bom_types_colors_poses_steps_match": True, "identity_projection_sha256": digest(projection),
    }


def body_height_families(manifest):
    actual_metrics(manifest)
    families = {}
    for part in manifest["parts"]:
        spec = manifest["types"][part["type_id"]]
        height = spec.get("body_height_mm", spec["body_mm"][2])
        family = families.setdefault(height, {"part_count": 0, "type_ids": set()})
        family["part_count"] += 1
        family["type_ids"].add(part["type_id"])
    return [{"body_height_mm": height, "part_count": family["part_count"],
             "unique_types": len(family["type_ids"])} for height, family in sorted(families.items())]


def verify_reference_identity(manifest, reference):
    require(identity_projection(manifest) == identity_projection(reference),
            "The comparison changes reference IDs, types, colors, poses, layers or sequence")
    return True
