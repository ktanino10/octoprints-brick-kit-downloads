"""Independently measure every required reflected native type pair in an owned audited copy."""

import argparse
import gzip
import hashlib
import json
from pathlib import Path

import FreeCAD

from symmetry_evidence import validate_part_pairs
from symmetry_native import reflected_solid_measurement
from symmetry_requirements import symmetry_identity

ROOT = Path(__file__).resolve().parents[1]


def digest(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--case-directory", type=Path, required=True)
    parser.add_argument("--guide", type=Path, required=True)
    parser.add_argument("--pose-report", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    for path in [args.case_directory, args.guide, args.pose_report, args.output]:
        if not path.resolve().is_relative_to(ROOT / ".archive-work"):
            raise ValueError("Native reflection inspection must stay within owned reviewed staging")
    case_dir = args.case_directory.resolve()
    identifier = case_dir.name
    symmetry_identity(identifier)
    assembly = case_dir / "assembly.FCStd"
    native_manifest = json.loads((case_dir / "manifest.json").read_text())
    mapping = json.loads((case_dir / "native-id-map.json").read_text())
    guide_bytes = args.guide.read_bytes()
    if guide_bytes[:2] == b"\x1f\x8b":
        guide_bytes = gzip.decompress(guide_bytes)
    guide = json.loads(guide_bytes)
    pose_report = json.loads(args.pose_report.read_text())
    assembly_digest = digest(assembly)
    if (guide.get("candidate_id") != identifier or native_manifest.get("candidate_id") != identifier
            or pose_report.get("case_id") != identifier or pose_report.get("assembly_sha256") != assembly_digest
            or pose_report.get("all_ids_types_colors_poses_steps") != "MATCH"
            or pose_report.get("relocated_reopen") is not True
            or pose_report.get("actual_instances") != len(guide["parts"])):
        raise ValueError("The native reflection pass requires the matching independent relocated ID/pose audit")
    original = {part["id"]: part for part in native_manifest["parts"]}
    parts = {part["id"]: part for part in guide["parts"]}
    if len(original) != len(native_manifest["parts"]) or len(parts) != len(guide["parts"]) or parts.keys() != original.keys():
        raise ValueError("The public guide and actual native copy differ in physical part identities")
    for identifier_in_model, part in parts.items():
        if any(part[field] != original[identifier_in_model][field]
               for field in ["type_id", "color_id", "position_mm", "rotation_z_deg", "step"]):
            raise ValueError("The guide's mirrored part metadata differs from the independently reopened native assembly")
    mirror_map = {identifier_in_model: part["mirror_part_id"] for identifier_in_model, part in parts.items()}
    pairing = validate_part_pairs(guide["parts"], mirror_map)
    inspected, shapes, object_bindings, measurements = {}, {}, {}, []
    document = FreeCAD.openDocument(str(assembly))
    try:
        for array in mapping["arrays"]:
            obj = document.getObject(array["native_name"])
            if obj is None or obj.TypeId != "App::Link" or obj.PrototypeId != array["type_id"]:
                raise ValueError("The actual native type array differs from its verified map")
            target = obj.LinkedObject
            if target is None or not hasattr(target, "Shape"):
                raise ValueError("The native array has no actual linked solid")
            path = Path(target.Document.FileName).resolve()
            if not path.is_relative_to(ROOT / ".archive-work"):
                raise ValueError("A native geometry reference escapes the owned portable copy")
            if path not in inspected:
                inspected[path] = digest(path)
            bound_object = (str(path), target.Name)
            type_id = array["type_id"]
            if type_id in object_bindings and object_bindings[type_id] != bound_object:
                raise ValueError("One native type identifier resolves to multiple different master objects")
            object_bindings[type_id] = bound_object
            shapes[type_id] = target.Shape.copy()
        for left_type, left_rotation, right_type, right_rotation in pairing["required_type_rotation_pairs"]:
            if left_type not in shapes or right_type not in shapes:
                raise ValueError("An actual mirror pair lacks its native master geometry")
            result = reflected_solid_measurement(shapes[left_type], left_rotation, shapes[right_type], right_rotation)
            measurements.append({
                "type_rotation_pair": [left_type, left_rotation, right_type, right_rotation],
                **result,
            })
            print("MEASURED", left_type, left_rotation, right_type, right_rotation,
                  result["symmetric_difference_volume_mm3"], "/", result["tolerance_mm3"], flush=True)
    finally:
        for name in list(FreeCAD.listDocuments()):
            FreeCAD.closeDocument(name)
    if digest(assembly) != assembly_digest or any(digest(path) != expected for path, expected in inspected.items()):
        raise ValueError("Read-only reflection measurement changed an actual native file")
    passed = all(row["within_native_volume_tolerance"] for row in measurements)
    synthetic = native_manifest.get("scope") == "SYNTHETIC_TEST_ONLY_NOT_CUSTOMER_GEOMETRY_OR_PUBLICATION"
    report = {
        "case_id": identifier, "geometry_revision": "bilateral-symmetry-v3",
        "state": ("PASS_SYNTHETIC_NATIVE_DRIVER_TEST" if synthetic else "PASS_ACTUAL_PORTABLE_BREP_REFLECTION")
                 if passed else "FAIL_ACTUAL_PORTABLE_BREP_REFLECTION",
        "synthetic_test_only_not_customer_geometry": synthetic,
        "assembly_sha256": assembly_digest, "guide_file_sha256": digest(args.guide),
        "pairing": pairing, "type_rotation_pair_comparisons": measurements,
        "actual_native_master_files_checked": len(inspected),
        "native_source_files_unchanged": True, "saved": False, "recomputed": False,
        "physical_validation": "UNKNOWN",
    }
    args.output.write_text(json.dumps(report, indent=2) + "\n")
    if not passed:
        raise ValueError("At least one independently measured actual native mirror pair exceeds its tolerance")
    print("PASS", identifier, pairing["actual_part_count"], len(measurements), flush=True)


if __name__ == "__main__":
    main()
