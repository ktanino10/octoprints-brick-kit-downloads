"""Canonical identity and complete part-pair checks for bilateral-symmetry-v3."""

import math
import gzip
import hashlib
import io
import json

from density_root_evidence import canonical_sha
from symmetry_requirements import SYMMETRY_REVISION, symmetry_identity

SEQUENCE_MODE = "BILATERAL_BODY_FIRST_SUPPORT"
LOAD_MODE = "PER_ROOT_EXCLUSIVE_TOKEN_INTERSECTION_TO_FIRST_SHARED_RECEIVER"
NATIVE_SYMMETRY_PASS = "PASS_ALL_NATIVE_REFLECTED_SOLIDS_AND_WHOLE_PART_COLORS"
PART_FIELDS = (
    "id", "type_id", "color_id", "position_mm", "rotation_z_deg", "step", "support_ids", "required_aids",
    "assembly_stage_z_mm", "assembly_course", "insertion_predecessor_ids", "radial_offset_mm",
    "source_part_ids", "role",
)


def require(condition, message):
    if not condition:
        raise ValueError(message)


def decode_support_transport(case_id, transport, raw_reference, data):
    symmetry_identity(case_id)
    raw_path = f"validation/{case_id}-symmetry-support.json"
    require(isinstance(transport, dict) and isinstance(raw_reference, dict)
            and raw_reference.get("path") == raw_path
            and transport.get("path") == raw_path + ".gz" and transport.get("encoding") == "gzip"
            and type(transport.get("bytes")) is int and transport["bytes"] == len(data)
            and hashlib.sha256(data).hexdigest() == transport.get("sha256")
            and type(transport.get("decoded_bytes")) is int and 0 < transport["decoded_bytes"] < 90_000_000
            and transport.get("decoded_sha256") == raw_reference.get("sha256") and data[:2] == b"\x1f\x8b",
            "The gzip support-proof transport is not bound to its exact raw identity and case")
    with gzip.GzipFile(fileobj=io.BytesIO(data)) as stream:
        raw = stream.read(transport["decoded_bytes"] + 1)
    require(len(raw) == transport["decoded_bytes"]
            and hashlib.sha256(raw).hexdigest() == transport["decoded_sha256"],
            "Decoded support evidence does not match the original source proof bytes")
    proof = json.loads(raw)
    require(proof.get("case_id") == case_id and proof.get("geometry_revision") == SYMMETRY_REVISION,
            "Decoded support proof describes a different actual symmetry revision")
    return proof, raw


def geometry_sequence_identity(manifest):
    logical, _ = symmetry_identity(manifest["candidate_id"])
    require(manifest.get("geometry_revision") == SYMMETRY_REVISION and manifest.get("logical_case_id") == logical
            and manifest["motion"].get("sequence_mode") == SEQUENCE_MODE
            and manifest.get("support_load_mode") == LOAD_MODE,
            "The bilateral identity uses a different case, sequence or load contract")
    parts = manifest["parts"]
    require(isinstance(parts, list) and bool(parts)
            and len({part["id"] for part in parts}) == len(parts)
            and [part["step"] for part in parts] == list(range(1, len(parts) + 1)),
            "The canonical bilateral identity must preserve actual step order and every ID once")
    expected = sorted(part["id"] for part in parts if part.get("mechanically_checked_support") is True)
    require(("mechanically_checked_support_ids" not in manifest or manifest["mechanically_checked_support_ids"] == expected)
            and bool(expected),
            "Checked material supports must match actual part flags in lexical ID order")
    loads = manifest["assembly_support_load_cases"]
    require(isinstance(loads, list) and [row["support_part_id"] for row in loads] == expected,
            "Canonical load cases must cover the same explicit material supports in lexical order")
    by_id = {part["id"]: part for part in parts}
    for row in loads:
        ids = row["payload_part_ids"]
        require(isinstance(ids, list) and len(set(ids)) == len(ids) and all(identifier in by_id for identifier in ids)
                and ids == sorted(ids, key=lambda identifier: by_id[identifier]["step"]),
                "Canonical root payloads must retain actual assembly-step order")
    return canonical_sha({
        "geometry_revision": manifest["geometry_revision"],
        "parts": [[part.get(field, [part["id"]]) if field == "source_part_ids" else part[field]
                   for field in PART_FIELDS] for part in parts],
        "types": manifest["types"], "palette": manifest["palette"],
        "motion_stages": manifest["motion"]["stages"], "sequence_mode": SEQUENCE_MODE,
        "assembly_support_load_cases": loads, "symmetry_context": manifest["symmetry_context"],
        "support_load_mode": LOAD_MODE, "mechanically_checked_support_ids": expected,
    })


def validate_part_pairs(parts, mirror_map, plane_x_mm=0, tolerance_mm=0.00002):
    require(type(plane_x_mm) in {int, float} and math.isfinite(plane_x_mm)
            and type(tolerance_mm) in {int, float} and 0 < tolerance_mm <= 0.00002,
            "Actual reflection plane and bounded native pose tolerance are required")
    require(isinstance(parts, list) and bool(parts) and isinstance(mirror_map, dict),
            "Actual parts and the complete mirror map are required")
    by_id = {part["id"]: part for part in parts}
    require(len(by_id) == len(parts) and by_id.keys() == mirror_map.keys()
            and set(mirror_map.values()) == by_id.keys(),
            "Native symmetry requires a bijection of every actual physical part")
    comparisons, self_pairs, maximum_error = set(), 0, 0.0
    for identifier, part in by_id.items():
        peer_id = mirror_map[identifier]
        require(mirror_map.get(peer_id) == identifier, "The native mirror mapping must be an involution")
        peer = by_id[peer_id]
        require(part["color_id"] == peer["color_id"], "Paired physical parts have different whole-part colors")
        positions = [part["position_mm"], peer["position_mm"]]
        require(all(isinstance(point, list) and len(point) == 3
                    and all(type(value) in {int, float} and math.isfinite(value) for value in point)
                    for point in positions),
                "Actual pair positions contain invalid coordinates")
        expected = [2 * plane_x_mm - positions[0][0], positions[0][1], positions[0][2]]
        error = max(abs(actual - target) for actual, target in zip(positions[1], expected, strict=True))
        require(error <= tolerance_mm, "Actual mirrored part origins differ in X, Y or Z")
        maximum_error = max(error, maximum_error)
        rotations = [part["rotation_z_deg"], peer["rotation_z_deg"]]
        require(all(type(value) is int and value in {0, 90, 180, 270} for value in rotations),
                "Native pair rotations must use the actual quarter-turn convention")
        forward = (part["type_id"], rotations[0], peer["type_id"], rotations[1])
        reverse = (peer["type_id"], rotations[1], part["type_id"], rotations[0])
        comparisons.add(min(forward, reverse))
        self_pairs += identifier == peer_id
    return {
        "actual_part_count": len(parts), "self_mirror_parts": self_pairs,
        "distinct_nonself_part_pairs": (len(parts) - self_pairs) // 2,
        "maximum_pair_origin_error_mm": maximum_error,
        "required_type_rotation_pairs": sorted(comparisons),
        "pairing_is_bijective_involution": True,
        "native_shape_or_contact_approval": False,
    }


def validate_native_pair_volumes(native, pairing):
    require(native.get("result") == NATIVE_SYMMETRY_PASS
            and native.get("actual_part_count") == pairing["actual_part_count"]
            and native.get("reflection_plane_x_mm") == 0
            and native.get("part_pairing_is_involution") is True
            and native.get("pose_pair_tolerance_mm") == 0.00002
            and native.get("physical_validation") == "UNKNOWN",
            "Actual native reflection checks are incomplete or overstate physical validation")
    records = native.get("type_rotation_pair_comparisons")
    require(isinstance(records, list), "Native type/rotation reflection measurements are missing")
    expected = {tuple(pair) for pair in pairing["required_type_rotation_pairs"]}
    seen, largest_difference = set(), 0.0
    for record in records:
        pair = record.get("type_rotation_pair")
        require(isinstance(pair, list) and len(pair) == 4
                and isinstance(pair[0], str) and isinstance(pair[2], str)
                and type(pair[1]) is int and type(pair[3]) is int,
                "Malformed actual native type/rotation comparison")
        key = min(tuple(pair), (pair[2], pair[3], pair[0], pair[1]))
        require(key in expected and key not in seen and record.get("whole_part_color_same") is True,
                "A native comparison is duplicated, unneeded, missing its actual pair or changes color")
        volume_a = record.get("reflected_native_volume_mm3")
        volume_b = record.get("paired_native_volume_mm3")
        difference, claimed = record.get("symmetric_difference_volume_mm3"), record.get("tolerance_mm3")
        require(all(type(value) in {int, float} and math.isfinite(value) for value in [volume_a, volume_b, difference, claimed])
                and volume_a > 0 and volume_b > 0 and difference >= 0,
                "Native volume comparison must include actual positive source volumes and a finite difference")
        limit = max(0.00001, max(volume_a, volume_b) * 0.0000001)
        require(math.isclose(claimed, limit, rel_tol=1e-12, abs_tol=1e-12) and difference <= limit,
                "The actual BRep reflection difference exceeds its independently computed volume limit")
        seen.add(key)
        largest_difference = max(largest_difference, difference)
    require(seen == expected, "Native reflection evidence does not cover every physical type/rotation pair")
    return {"actual_native_type_rotation_pairs": len(seen),
            "maximum_symmetric_difference_volume_mm3": largest_difference,
            "tolerance": "max(1e-5 mm^3, max(actual volumes)*1e-7)",
            "all_actual_pairs_covered": True, "physical_validation": "UNKNOWN"}
