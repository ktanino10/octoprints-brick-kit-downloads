"""Nominal material/color reflection checks; studs, clearances and cavities need native QA."""

import math


def require(condition, message):
    if not condition:
        raise ValueError(message)


def nominal_material_cells(manifest):
    occupied = {}
    identities = set()
    for part in manifest["parts"]:
        require(part["id"] not in identities, "Duplicate actual part identity in nominal symmetry check")
        identities.add(part["id"])
        require(part["color_id"] in manifest["palette"], "Unknown actual whole-part color")
        spec = manifest["types"][part["type_id"]]
        unit, pitch, counts = spec.get("vertical_unit_mm"), spec.get("pitch_mm"), spec.get("cells")
        require(pitch == 8 and unit == 1.6 and isinstance(counts, list) and len(counts) == 2
                and all(type(value) is int and value > 0 for value in counts),
                "Nominal sampling needs declared 8mm XY and 1.6mm Z material-cell conventions")
        slices = spec.get("body_slices")
        if slices is None:
            height = spec["body_height_mm"] / unit
            require(math.isfinite(height) and height > 0 and abs(height - round(height)) < 1e-7,
                    "Actual body height does not align with the declared nominal vertical accounting unit")
            slices = [{"bottom_unit": 0, "height_units": round(height), "footprint_cells": spec["footprint_cells"]}]
        require(isinstance(slices, list) and bool(slices), "Actual nominal material slices are missing")
        angle, position = part["rotation_z_deg"], part["position_mm"]
        require(type(angle) is int and angle in {0, 90, 180, 270}
                and isinstance(position, list) and len(position) == 3 and all(math.isfinite(value) for value in position),
                "Invalid actual source position or quarter-turn rotation")
        cosine, sine = [(1, 0), (0, 1), (-1, 0), (0, -1)][angle // 90]
        own = set()
        for section in slices:
            bottom, height, footprint = (section.get(key) for key in ["bottom_unit", "height_units", "footprint_cells"])
            require(type(bottom) is int and bottom >= 0 and type(height) is int and height > 0
                    and isinstance(footprint, list) and bool(footprint),
                    "Invalid or empty nominal material slice")
            require(len({tuple(cell) for cell in footprint}) == len(footprint),
                    "A nominal slice repeats a material cell")
            for cell in footprint:
                require(isinstance(cell, list) and len(cell) == 2
                        and all(type(value) is int and 0 <= value < counts[axis] for axis, value in enumerate(cell)),
                        "A nominal footprint cell is outside the actual type extent")
                x = (cell[0] - (counts[0] - 1) / 2) * pitch
                y = (cell[1] - (counts[1] - 1) / 2) * pitch
                for z_unit in range(bottom, bottom + height):
                    key = (
                        round(position[0] + cosine * x - sine * y, 6),
                        round(position[1] + sine * x + cosine * y, 6),
                        round(position[2] + (z_unit + 0.5) * unit, 6),
                    )
                    require(key not in own and key not in occupied,
                            "Actual nominal material cells overlap; symmetry cannot silently discard an instance")
                    own.add(key)
                    occupied[key] = part["color_id"]
    return occupied


def nominal_reflection_metrics(cells, mirror_x_mm=0, feature_color=None):
    require(bool(cells) and type(mirror_x_mm) in {int, float} and math.isfinite(mirror_x_mm),
            "Declare a finite reflection plane and actual nonempty nominal cells")
    def reflected(key):
        return (round(2 * mirror_x_mm - key[0], 6), key[1], key[2])
    shape_xor = len(cells.keys() ^ {reflected(key) for key in cells})
    color_difference = sum(cells.get(reflected(key)) != color for key, color in cells.items() if reflected(key) in cells)
    front = {}
    for (x, y, z), color in cells.items():
        key = (x, z)
        if key not in front or y < front[key][0]:
            front[key] = (y, color)
    mask_xor = color_mismatch = depth_mismatch = 0
    for (x, z), (depth, color) in front.items():
        peer = front.get((round(2 * mirror_x_mm - x, 6), z))
        if peer is None:
            mask_xor += 2
            continue
        color_mismatch += peer[1] != color
        depth_mismatch += abs(peer[0] - depth) > 1e-6
    feature = None
    if feature_color is not None:
        mask = {key for key, row in front.items() if row[1] == feature_color}
        require(bool(mask), "The requested feature color is not visible in the nominal front projection")
        mirrored = {(round(2 * mirror_x_mm - x, 6), z) for x, z in mask}
        feature = {"color_id": feature_color, "visible_samples": len(mask), "front_mask_xor": len(mask ^ mirrored)}
    return {
        "metric": "NOMINAL_8MM_XY_1_6MM_Z_MATERIAL_CELLS_NOT_NATIVE_TESSELLATION",
        "actual_material_samples": len(cells), "mirror_x_mm": mirror_x_mm,
        "material_occupancy_xor": shape_xor, "paired_material_color_differences": color_difference,
        "front_shape_xor": mask_xor, "paired_front_color_differences": color_mismatch,
        "paired_front_depth_differences": depth_mismatch, "feature": feature,
        "native_geometry_or_physical_validation": False,
        "excluded": ["studs", "cavities", "gaps", "chamfers", "lighting", "native CAD reflection", "physical supports"],
    }
