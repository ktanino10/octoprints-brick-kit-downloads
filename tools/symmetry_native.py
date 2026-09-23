"""Read-only actual BRep reflection measurements; never edits or saves the source documents."""

import math


def reflected_solid_measurement(shape_a, rotation_a, shape_b, rotation_b):
    import FreeCAD

    if any(type(angle) is not int or angle not in {0, 90, 180, 270} for angle in [rotation_a, rotation_b]):
        raise ValueError("Native reflection needs actual quarter-turn type orientations")
    for shape in [shape_a, shape_b]:
        if shape.isNull() or not shape.isValid() or len(shape.Solids) != 1:
            raise ValueError("A reflected native part must be one valid actual solid")
    left, right = shape_a.copy(), shape_b.copy()
    left.rotate(FreeCAD.Vector(0, 0, 0), FreeCAD.Vector(0, 0, 1), rotation_a)
    right.rotate(FreeCAD.Vector(0, 0, 0), FreeCAD.Vector(0, 0, 1), rotation_b)
    reflection = FreeCAD.Matrix()
    reflection.A11 = -1
    mirrored = left.transformGeometry(reflection)
    if mirrored.isNull() or not mirrored.isValid() or len(mirrored.Solids) != 1:
        raise ValueError("The actual BRep reflection did not retain one valid solid")
    volume_a, volume_b = abs(mirrored.Volume), abs(right.Volume)
    difference = abs(mirrored.cut(right).Volume) + abs(right.cut(mirrored).Volume)
    if not all(math.isfinite(value) for value in [volume_a, volume_b, difference]) or min(volume_a, volume_b) <= 0:
        raise ValueError("Invalid actual BRep reflection volume")
    tolerance = max(0.00001, max(volume_a, volume_b) * 0.0000001)
    return {
        "reflected_native_volume_mm3": volume_a,
        "paired_native_volume_mm3": volume_b,
        "symmetric_difference_volume_mm3": difference,
        "tolerance_mm3": tolerance,
        "within_native_volume_tolerance": difference <= tolerance,
        "measurement": "ACTUAL_BREP_BIDIRECTIONAL_CUT_VOLUME_AFTER_X_REFLECTION",
        "source_geometry_modified": False,
        "physical_validation": "UNKNOWN",
    }
