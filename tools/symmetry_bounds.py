"""Necessary native-feature symmetry checks, never a substitute for full geometry/color comparison."""

import math
import struct


def require(condition, message):
    if not condition:
        raise ValueError(message)


def native_mesh_bounds(raw):
    require(len(raw) >= 12 and raw[:4] == b"OBM1", "Expected actual OBM1 native geometry")
    vertices, faces = struct.unpack_from("<II", raw, 4)
    require(vertices >= 3 and faces > 0 and len(raw) == 12 + vertices * 12 + faces * 12,
            "Native geometry byte ranges do not match their declared counts")
    coordinates = list(struct.iter_unpack("<fff", raw[12:12 + vertices * 12]))
    require(all(math.isfinite(value) for point in coordinates for value in point),
            "Native geometry contains a nonfinite coordinate")
    used = set()
    for triangle in struct.iter_unpack("<III", raw[12 + vertices * 12:]):
        require(len(set(triangle)) == 3 and all(index < vertices for index in triangle),
                "Native geometry has an invalid triangle")
        used.update(triangle)
    return ([min(coordinates[index][axis] for index in used) for axis in range(3)],
            [max(coordinates[index][axis] for index in used) for axis in range(3)])


def world_bounds(part, local):
    angle = part.get("rotation_z_deg")
    position = part.get("position_mm")
    require(type(angle) is int and angle in {0, 90, 180, 270} and isinstance(position, list) and len(position) == 3
            and all(type(value) in {int, float} and math.isfinite(value) for value in position),
            "Expected the actual finite body-bottom-center pose and quarter-turn rotation")
    cosine, sine = [(1, 0), (0, 1), (-1, 0), (0, -1)][angle // 90]
    corners = [
        [position[0] + cosine * x - sine * y, position[1] + sine * x + cosine * y, position[2] + z]
        for x in [local[0][0], local[1][0]]
        for y in [local[0][1], local[1][1]]
        for z in [local[0][2], local[1][2]]
    ]
    return [[function(point[axis] for point in corners) for axis in range(3)] for function in [min, max]]


def feature_bounds_symmetry(manifest, native_bounds_by_type, color_id, mirror_x_mm, tolerance_mm=0.0001):
    require(type(mirror_x_mm) in {int, float} and math.isfinite(mirror_x_mm)
            and type(tolerance_mm) in {int, float} and 0 < tolerance_mm <= 0.0001,
            "Declare the actual mirror plane and a bounded native Float32 tolerance")
    require(color_id in manifest["palette"], "The feature color does not belong to the actual manifest")
    halves = {
        side: {"part_ids": [], "bounds_mm": [[math.inf] * 3, [-math.inf] * 3]}
        for side in ["left", "right"]
    }
    seen = set()
    for part in manifest["parts"]:
        require(part["id"] not in seen, "Actual part identities must be unique")
        seen.add(part["id"])
        if part["color_id"] != color_id:
            continue
        require(part["type_id"] in native_bounds_by_type, "A feature lacks its actual native type geometry")
        bounds = world_bounds(part, native_bounds_by_type[part["type_id"]])
        require(bounds[1][0] < mirror_x_mm - tolerance_mm or bounds[0][0] > mirror_x_mm + tolerance_mm,
                "A feature part crosses the mirror plane; paired-eye classification is ambiguous")
        side = "left" if bounds[1][0] < mirror_x_mm else "right"
        group = halves[side]
        group["part_ids"].append(part["id"])
        for axis in range(3):
            group["bounds_mm"][0][axis] = min(group["bounds_mm"][0][axis], bounds[0][axis])
            group["bounds_mm"][1][axis] = max(group["bounds_mm"][1][axis], bounds[1][axis])
    require(all(group["part_ids"] for group in halves.values()), "Both actual eye-feature groups are required")
    left, right = (halves[side]["bounds_mm"] for side in ["left", "right"])
    reflected = [[2 * mirror_x_mm - left[1][0], left[0][1], left[0][2]],
                 [2 * mirror_x_mm - left[0][0], left[1][1], left[1][2]]]
    deltas = [[right[bound][axis] - reflected[bound][axis] for axis in range(3)] for bound in range(2)]
    for group in halves.values():
        group["part_count"] = len(group.pop("part_ids"))
        group["span_mm"] = [group["bounds_mm"][1][axis] - group["bounds_mm"][0][axis] for axis in range(3)]
    return {
        "metric": "ACTUAL_NATIVE_FEATURE_BOUNDS_NECESSARY_ONLY_NOT_FULL_SYMMETRY",
        "case_id": manifest["candidate_id"], "color_id": color_id, "mirror_x_mm": mirror_x_mm,
        "tolerance_mm": tolerance_mm, "halves": halves, "mirrored_bounds_error_mm": deltas,
        "bounds_match": all(abs(value) <= tolerance_mm for point in deltas for value in point),
        "full_geometry_color_or_visible_outline_pass": False,
        "limitation": "Bounds include all feature-colored native parts, not an occlusion-filtered silhouette. Equal bounds alone do not prove mirrored shape or color.",
    }
