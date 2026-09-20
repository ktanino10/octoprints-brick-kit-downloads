"""Validate exact r3 BOM/type exports, 33 color plates, the nine-piece trial and geometry fidelity."""

from collections import Counter
import csv
import hashlib
import json
import math
from pathlib import Path
import struct
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
REVISION = "r3-8mm-20260920"
DIRECTORY = ROOT / "artifacts/revisions" / REVISION
NS = {"m": "http://schemas.microsoft.com/3dmanufacturing/core/2015/02"}


def expect(condition, message):
    if not condition:
        raise ValueError(message)


def read_json(path):
    return json.loads(path.read_text())


def three_mf(path, placements, expected_parts):
    with zipfile.ZipFile(path) as package:
        expect(not any("gcode" in name.lower() or name.endswith("project_settings.config")
                       for name in package.namelist()), f"Sliced/project data in geometry-only file: {path.name}")
        model = ET.fromstring(package.read("3D/3dmodel.model"))
    expect(model.get("unit") == "millimeter", f"Wrong 3MF units: {path.name}")
    objects = {item.get("id"): item for item in model.findall("m:resources/m:object", NS)}
    items = model.findall("m:build/m:item", NS)
    expect(len(items) == len(placements), f"3MF instance count differs from the real layout: {path.name}")
    for item, placement in zip(items, placements):
        obj = objects[item.get("objectid")]
        expect(obj.get("name") == placement["type_id"], f"3MF type does not match its instance: {path.name}")
        transform = list(map(float, item.get("transform").split()))
        angle = math.radians(placement["rotation_z_deg"])
        expected = [math.cos(angle), math.sin(angle), 0, -math.sin(angle), math.cos(angle), 0, 0, 0, 1, *placement["position_mm"]]
        expect(len(transform) == 12 and all(abs(a - b) < 1e-6 for a, b in zip(transform, expected)),
               f"3MF placement differs from the declared pose: {path.name}")
        expect(abs(transform[11]) < 1e-8, f"A printed part is not at z=0: {path.name}")
        if "part_id" in placement:
            source = expected_parts[placement["part_id"]]
            expect(source["type_id"] == placement["type_id"] and source["color_id"] == placement["color_id"],
                   f"3MF plate ID/type/color differs from figure BOM: {path.name}")
    for obj in objects.values():
        expect(obj.find("m:mesh", NS) is not None, f"Missing actual type mesh: {path.name}")
        expect(len(obj.findall("m:mesh/m:triangles/m:triangle", NS)) > 0, f"Empty actual type mesh: {path.name}")
    return len(items)


def main():
    if not DIRECTORY.exists():
        raise ValueError("Actual r3 inputs are required; this is not a fixture-based acceptance check")
    catalog = read_json(DIRECTORY / "catalog.json")
    prototypes = read_json(DIRECTORY / "cad/prototypes.json")
    expect(len(prototypes["types"]) == 133, "Expected the 133 actual shared master types")
    used = set()
    total = 0
    plates_total = 0
    for candidate in catalog["candidates"]:
        manifest = read_json(DIRECTORY / candidate["manifest_url"])
        parts = {part["id"]: part for part in manifest["parts"]}
        expect(len(parts) == manifest["metrics"]["part_count"] == candidate["metrics"]["part_count"], "Duplicate/mismatched part IDs")
        with (DIRECTORY / candidate["bom_url"]).open(newline="") as file:
            bom = list(csv.DictReader(file))
        expect(len(bom) == len(parts) and {row["part_id"] for row in bom} == set(parts), f"BOM IDs mismatch: {candidate['id']}")
        quantities = Counter()
        for row in bom:
            part = parts[row["part_id"]]
            color = manifest["palette"][part["color_id"]]
            expect(row["type_id"] == part["type_id"] and row["color_id"] == part["color_id"]
                   and row["color"] == color["name"] and row["hex"] == color["hex"], f"BOM type/color mismatch: {part['id']}")
            expect([float(row["x_mm"]), float(row["y_mm"]), float(row["bottom_z_mm"])] == part["position_mm"]
                   and int(row["step"]) == part["step"] and float(row["rotation_z_deg"]) == part["rotation_z_deg"],
                   f"BOM pose/sequence mismatch: {part['id']}")
            expect(float(row["body_height_mm"]) == manifest["types"][part["type_id"]]["body_height_mm"], "BOM mixes brick and plate heights")
            quantities[(part["type_id"], part["color_id"])] += 1
            used.add(part["type_id"])
        with (DIRECTORY / candidate["summary_bom_url"]).open(newline="") as file:
            summary = list(csv.DictReader(file))
        expect({(row["type_id"], row["color_id"]): int(row["quantity"]) for row in summary} == quantities, "Summary BOM mismatch")
        index = read_json(DIRECTORY / candidate["plate_index_url"])
        expect(index["part_count"] == len(parts) and index["plate_count"] == len(index["plates"])
               and index["slicer_status"] == "NOT_SLICED" and index["full_print"] == "ON_HOLD", "Invalid unsliced color-plate inventory")
        placed = []
        for plate in index["plates"]:
            path = DIRECTORY / candidate["id"] / "plates" / plate["file"]
            placements = plate["placements"]
            expect(len(placements) == plate["part_count"], "Plate quantity mismatch")
            for entry in placements:
                expect(entry["color_id"] == plate["color_id"] and entry["print_rotation_deg"] == [0, 0, 0], "Mixed color or print orientation")
                bounds = entry["bounds_xy_mm"]
                expect(all(10 - 1e-6 <= value <= 246 + 1e-6 for point in bounds for value in point), "Plate placement exceeds declared border")
                placed.append(entry["part_id"])
            for left_index, left in enumerate(placements):
                for right in placements[left_index + 1:]:
                    a, b = left["bounds_xy_mm"], right["bounds_xy_mm"]
                    overlap = all(min(a[1][axis], b[1][axis]) - max(a[0][axis], b[0][axis]) > 1e-7 for axis in [0, 1])
                    expect(not overlap, "Color plate contains overlapping body bounds")
            three_mf(path, placements, parts)
        expect(len(placed) == len(parts) and len(set(placed)) == len(parts) and set(placed) == set(parts),
               f"Color plates duplicate or omit figure IDs: {candidate['id']}")
        expect(len(candidate["plate_files"]) == len(index["plates"]), "Catalog plate count mismatch")
        total += len(parts)
        plates_total += len(index["plates"])
    expect(total == 1627 and plates_total == 33 and used == set(prototypes["types"]), "Actual figure/type/plate totals mismatch")
    for type_id, prototype in prototypes["types"].items():
        expect(prototype["open_underside"] is True and prototype["native_one_solid"] is True, f"Wrong native form: {type_id}")
        for format in ["stl", "step"]:
            path = ROOT / prototype[format]
            expect(path.is_file() and path.stat().st_size > 0, f"Missing per-type {format}: {type_id}")
        data = (ROOT / prototype["stl"]).read_bytes()
        count = struct.unpack_from("<I", data, 80)[0]
        expect(len(data) == 84 + count * 50 and count == len(prototype["faces"]), f"Native STL topology count mismatch: {type_id}")
        for index, face in enumerate(prototype["faces"]):
            actual = struct.unpack_from("<9f", data, 84 + index * 50 + 12)
            expected = [coordinate for vertex in face for coordinate in prototype["vertices"][vertex]]
            expect(all(abs(a - b) < 1e-5 for a, b in zip(actual, expected)), f"STL and viewer mesh vertices differ: {type_id}")
    trial = read_json(DIRECTORY / "cad/trial/layout.json")
    expect(trial["piece_count"] == trial["unique_printable_types"] == 9 and len(trial["instances"]) == 9, "Trial is not nine distinct parts")
    expect(trial["plate"]["native_solid_count"] == 9
           and all(trial["plate"][key] is True for key in ["all_bottoms_z0", "all_open_bottoms_down", "all_top_studs_up"]), "Wrong trial orientation")
    expect(trial["print_assumptions"]["male_diameter_corrections_mm"] == [-0.1, 0.0, 0.1]
           and trial["print_assumptions"]["female_radial_clearances_mm"] == [-0.04, 0.0, 0.04, 0.08, 0.12], "Radial and diameter trial definitions changed")
    three_mf(DIRECTORY / "cad/trial/plate.3mf", trial["instances"], {})
    fidelity = read_json(DIRECTORY / "cad/mesh-fidelity.json")
    expect(fidelity["surfaces_checked"] == 5565 and fidelity["maximum_radial_error_bound_mm"] < 0.005
           and fidelity["tessellation"]["linear_deflection_mm"] == 0.01
           and fidelity["status"]["physical_fit"] == "UNKNOWN", "Digital facet fidelity must not erase the smallest clearance or imply printed accuracy")
    for entry in read_json(ROOT / "archive/releases" / f"{REVISION}.json")["bundles"]:
        if entry["filename"].endswith("-media.zip"):
            continue
        path = DIRECTORY / entry["filename"]
        expect(hashlib.sha256(path.read_bytes()).hexdigest() == entry["sha256"], "Final native/trial package hash mismatch")
        with zipfile.ZipFile(path) as package:
            expect("cad/trial/layout.json" in package.namelist(), "Supplemental trial layout is absent from the public bundle")
            for name in package.namelist():
                expect(package.read(name) == (DIRECTORY / name).read_bytes(), f"Package member differs from its public individual file: {name}")
    print(json.dumps({"revision": REVISION, "figures": 3, "instances": total, "shared_types": len(used),
                      "color_plates": plates_total, "trial_parts": 9, "native_stl_mesh_parity": "PASS",
                      "physical_fit": "UNKNOWN", "slicing": "NOT_SLICED", "full_print": "ON_HOLD"}, indent=2))


if __name__ == "__main__":
    main()
