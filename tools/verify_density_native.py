"""Reopen a relocated matrix assembly and compare every actual native ID, color, pose and step."""

import argparse
import hashlib
import json
from pathlib import Path
import re

import FreeCAD

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--root", type=Path, required=True)
parser.add_argument("--case", required=True)
parser.add_argument("--report", type=Path, required=True)
args = parser.parse_args()
scope = args.root.resolve()
if not scope.is_relative_to(ROOT / ".archive-work") or not args.report.resolve().is_relative_to(ROOT / ".archive-work"):
    raise ValueError("Read-only native auditing must stay in owned relocated staging")
if not re.fullmatch(r"(mona|copilot|ducky)-(p(120|150|200|300|400)|fine8-base)", args.case):
    raise ValueError("Invalid matrix case")
case = scope / "artifacts/studies/part-count-matrix-20260921/cases" / args.case
manifest = json.loads((case / "manifest.json").read_text())
mapping = json.loads((case / "native-id-map.json").read_text())
parts = {part["id"]: part for part in manifest["parts"]}
filename = case / "assembly.FCStd"
before = hashlib.sha256(filename.read_bytes()).hexdigest()
document = FreeCAD.openDocument(str(filename))
seen = set()
try:
    for array in mapping["arrays"]:
        obj = document.getObject(array["native_name"])
        if obj is None or obj.TypeId != "App::Link":
            raise ValueError("A mapped native link array is missing")
        identifiers, steps, placements = list(obj.InstanceIds), list(obj.AssemblySteps), list(obj.PlacementList)
        if (identifiers != array["ids"] or steps != array["steps"] or len(identifiers) != len(placements)
                or obj.ElementCount != len(identifiers) or obj.PrototypeId != array["type_id"] or obj.ColorId != array["color_id"]):
            raise ValueError("Native link array IDs/types/colors/steps differ from its map")
        if obj.Scale != 1 or any(abs(value - 1) > 1e-12 for value in obj.ScaleVector):
            raise ValueError("Native blocks have been scaled")
        for identifier, step, placement in zip(identifiers, steps, placements):
            if identifier in seen or identifier not in parts:
                raise ValueError("Duplicate or unknown native part ID")
            seen.add(identifier)
            part = parts[identifier]
            if part["type_id"] != obj.PrototypeId or part["color_id"] != obj.ColorId or part["step"] != step:
                raise ValueError("Native part ID mapping differs from actual manifest")
            expected = FreeCAD.Placement(FreeCAD.Vector(*part["position_mm"]), FreeCAD.Rotation(FreeCAD.Vector(0, 0, 1), part["rotation_z_deg"]))
            actual_matrix = placement.toMatrix()
            expected_matrix = expected.toMatrix()
            if any(abs(actual_matrix.A[row * 4 + col] - expected_matrix.A[row * 4 + col]) > 1e-7
                   for row in range(4) for col in range(4)):
                raise ValueError("Native part pose differs from actual manifest")
            color = manifest["palette"][part["color_id"]]["hex"].lstrip("#")
            expected_rgb = [int(color[index:index + 2], 16) / 255 for index in [0, 2, 4]]
            if any(abs(a - b) > 1e-6 for a, b in zip(obj.DisplayColorRGB, expected_rgb)):
                raise ValueError("Native whole-part color differs from the BOM palette")
    if seen != set(parts) or mapping["actual_instances"] != len(parts):
        raise ValueError("Native assembly does not cover every actual ID once")
finally:
    for name in list(FreeCAD.listDocuments()):
        FreeCAD.closeDocument(name)
if hashlib.sha256(filename.read_bytes()).hexdigest() != before:
    raise ValueError("Read-only native pose audit changed the assembly")
record = {"case_id": args.case, "assembly_sha256": before, "actual_instances": len(seen),
          "array_count": len(mapping["arrays"]), "all_ids_types_colors_poses_steps": "MATCH",
          "relocated_reopen": True, "saved": False, "recomputed": False}
args.report.write_text(json.dumps(record, indent=2) + "\n")
print(json.dumps(record, indent=2))
