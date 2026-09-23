"""Normalize an approved staged case into the public matrix/guide contract without changing poses."""

import argparse
import copy
import gzip
import hashlib
import json
import math
from pathlib import Path
import struct
import subprocess

from mona_study_evidence import verify_manifest_bom, body_height_families
from density_requirements import COPILOT_SUPPORT_REVISION, MONA_ROOT_REFERENCE_ID, artifact_identity
from density_root_evidence import validate_root_evidence
from density_body_support import validate_body_support_evidence, validate_support_ledger
from symmetry_evidence import decode_support_transport, validate_part_pairs, validate_native_pair_volumes
from symmetry_requirements import SYMMETRY_REVISION
from symmetry_support_evidence import verify_bilateral_supports
from repository_meshes import pinned_mesh_descriptor
from validate_archive import privacy

ROOT = Path(__file__).resolve().parents[1]
STUDY = "part-count-matrix-20260921"
PREFIX = f"/artifacts/studies/{STUDY}/"
FLAGS = {"current_revision_unchanged": "r3-8mm-20260920", "baseline_choice": "COMPARISON_ASSUMPTION_NOT_USER_SELECTION",
         "selection": "NOT_SELECTED", "visual_approval": "PENDING", "physical_fit": "UNKNOWN",
         "retention_strength": "UNKNOWN", "whole_figure_stability": "UNKNOWN", "slicer_status": "NOT_SLICED", "full_print": "ON_HOLD"}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def encoded(data):
    return json.dumps(data, ensure_ascii=False, separators=(",", ":")).encode() + b"\n"


def revision_fields(identifier, *records):
    logical, revision = artifact_identity(identifier)
    if revision is None:
        return {}
    if not records or any(record.get("logical_case_id") != logical or record.get("geometry_revision") != revision
                          for record in records):
        raise ValueError("Revised case sources disagree on the logical slot or actual geometry revision")
    return {"logical_case_id": logical, "geometry_revision": revision}


def verify_portable_identity(source, portable):
    for key in ["candidate_id", "units", "palette"]:
        if portable.get(key) != source.get(key):
            raise ValueError("Portable CAD manifest changed its source identity, frame or palette")
    if (source.get("frame") != {"up": "+Z", "front": "-Y", "handedness": "right"}
            or portable.get("position_origin", portable.get("origin")) != source.get("position_origin")
            or ("frame" in portable and portable["frame"] != source["frame"])):
        raise ValueError("Portable CAD manifest changed its declared source coordinate convention")
    original = {part["id"]: part for part in source["parts"]}
    exported = {part["id"]: part for part in portable["parts"]}
    if original.keys() != exported.keys() or len(exported) != len(portable["parts"]):
        raise ValueError("Portable CAD manifest does not cover the actual source IDs once")
    fields = ["type_id", "color_id", "position_mm", "rotation_z_deg", "layer", "step",
              "support_ids", "required_aids", "assembly_course", "radial_offset_mm"]
    for identifier, part in original.items():
        keys = fields + [key for key in ["assembly_stage_z_mm", "insertion_predecessor_ids"] if key in part]
        if any(key not in exported[identifier] or exported[identifier][key] != part[key] for key in keys):
            raise ValueError("Portable CAD manifest changed an actual source pose, color or assembly dependency")
    used = {part["type_id"] for part in original.values()}
    if not used <= portable["types"].keys():
        raise ValueError("Portable CAD manifest omitted an actual source type")
    required = {"body_mm", "body_height_mm", "pitch_mm", "stud_diameter_mm"}
    for identifier in used:
        spec = portable["types"][identifier]
        if not required <= spec.keys():
            raise ValueError("Portable native type lacks its actual dimensions")
        for key, value in spec.items():
            if key.endswith("_mm") or key in {"cells", "footprint_cells", "stud_cells", "kind", "origin", "body_slices"}:
                if value != source["types"][identifier].get(key):
                    raise ValueError("Portable native type changed retained source geometry metadata")
    return True


def verify_light_parts(original, exported):
    if len(exported) != len(original) or len({part["id"] for part in exported}) != len(original):
        raise ValueError("Lightweight instance count or ID coverage differs")
    for part in exported:
        if part["id"] not in original:
            raise ValueError("Lightweight placement contains an unknown source ID")
        source = original[part["id"]]
        for key, value in part.items():
            if key == "source_part_ids" and key not in source:
                expected = [part["id"]]
            elif key in source:
                expected = source[key]
            else:
                raise ValueError("Lightweight placement has an unverified source field: " + key)
            if value != expected:
                raise ValueError("Lightweight placement changed an actual source part")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--receipt", type=Path, required=True)
    parser.add_argument("--receipt-sha256", required=True)
    parser.add_argument("--stage", type=Path, required=True)
    parser.add_argument("--mesh-public-commit", help="Fixed public repository commit for the explicitly separated native meshes")
    args = parser.parse_args()
    receipt_bytes = args.receipt.read_bytes()
    if sha(receipt_bytes) != args.receipt_sha256:
        raise ValueError("Fixed receipt hash mismatch")
    receipt = json.loads(receipt_bytes)
    stage = args.stage.resolve()
    if not stage.is_relative_to(ROOT / ".archive-work") or receipt["study_id"] != STUDY:
        raise ValueError("Use the approved case in owned staging")
    light = stage / "light"
    source = Path(receipt["source_root"]).parents[3]
    native_root = stage / "native/artifacts/studies" / STUDY
    stage_review = json.loads((stage / "source-review.json").read_text())
    case_id = stage_review["case_id"]
    is_reference = stage_review.get("kind") == "BASELINE_REFERENCE_NOT_MULTIPLIER_CASE"
    is_symmetry = stage_review.get("kind") == "COPILOT_SYMMETRY_REVISION"
    if is_symmetry and not args.mesh_public_commit:
        raise ValueError("The corrected case needs a fixed PUBLIC native-mesh commit before guide normalization")
    if is_reference and (case_id != MONA_ROOT_REFERENCE_ID or receipt.get("multiplier_cases_newly_ready") != 0):
        raise ValueError("A reference cannot be accepted as a multiplier case")
    if case_id not in receipt.get("case_ids", [receipt.get("case_id")]) or stage_review["source_commit"] != receipt["source_commit"]:
        raise ValueError("Staged case is not authorized by this fixed READY receipt")
    summary = json.loads((light / receipt.get("case_summary_path", f"cases/{case_id}-summary.json")).read_text())
    compressed_file = summary["manifest"]["path"]
    input_folder = stage / "normalization-input" if is_symmetry else light
    payload = json.loads(gzip.decompress((input_folder / compressed_file).read_bytes()))
    private_files = receipt["read_only_verification_files"]

    def proof_bytes(ending):
        matches = [entry for entry in private_files if entry["path"].endswith(ending)]
        if len(matches) != 1:
            raise ValueError("Ambiguous or unauthorized proof input")
        entry = matches[0]
        path = Path(entry["path"])
        data = subprocess.check_output(["git", "-C", str(source), "cat-file", "blob",
                                        receipt["source_commit"] + ":" + path.relative_to(source).as_posix()])
        if len(data) != entry["bytes"] or sha(data) != entry["sha256"]:
            raise ValueError("Private proof changed after READY")
        return data

    mb, bb = proof_bytes(f"/cases/{case_id}/manifest.json"), proof_bytes(f"/cases/{case_id}/bom.csv")
    full = json.loads(mb)
    verify_portable_identity(full, json.loads((native_root / "cases" / case_id / "manifest.json").read_text()))
    revision = revision_fields(case_id, payload, full, summary)
    body_support = revision.get("geometry_revision") == COPILOT_SUPPORT_REVISION
    evidence = verify_manifest_bom(mb, bb)
    motion_bytes = proof_bytes(f"/cases/{case_id}/motion.json")
    motion = json.loads(motion_bytes)
    validation = json.loads(proof_bytes(f"/cases/{case_id}/validation.json"))
    audit = json.loads(proof_bytes(f"/cases/{case_id}/saved-scene-audit.json"))
    native = json.loads(proof_bytes(f"/portable/cases/{case_id}/native-complete.json"))
    sequence_valid = (
        validation.get("result") == ("PASS_LIMITED_NATIVE_SYMMETRY_AND_NONRESET_SUPPORT" if is_symmetry
                                    else "PASS_LIMITED_NATIVE_SUPPORT_AND_BODY_FIRST_SEQUENCE" if body_support
                                    else "PASS_LIMITED_NATIVE_ROOT_AND_BODY_FIRST_SEQUENCE")
        and validation.get("manifest_sha256") == sha(mb)
        and validation.get("case_id") == case_id
        and validation.get("geometry_revision") == revision["geometry_revision"]
        and validation.get("body_first_all_steps_supported") is True
        and validation.get("floating_seed_steps") == 0 and validation.get("blocked_vertical_body_columns") == 0
    ) if revision else (
        validation.get("bottom_up_all_ids_once") is True and validation.get("radial_absolute_pose_roundtrip") is True
    )
    if (payload["candidate_id"] != case_id or payload["motion"] != motion
            or evidence["counted_instances"] != summary["metrics"]["part_count"]
            or ("actual_count" in receipt and evidence["counted_instances"] != receipt["actual_count"])
            or evidence["manifest_sha256"] != summary["provenance"]["source_manifest_sha256"]
            or evidence["bom_sha256"] != summary["provenance"]["bom_sha256"]
            or audit["result"] != "PASS" or not audit["roundtrip_absolute_no_drift"] or not audit["empty_to_final_all_instances"]
            or native["state"] != "COMPLETE_NATIVE_CAD"
            or not sequence_valid):
        raise ValueError("Actual case count, BOM, motion or native evidence mismatch")
    parts = {part["id"]: part for part in full["parts"]}
    mirror_record = None
    if is_symmetry:
        mirror_record = json.loads(proof_bytes(f"/cases/{case_id}/nominal-symmetry-pairs.json"))
        mirror_map = mirror_record["physical_part_mirror_map"]
        validate_part_pairs(full["parts"], mirror_map)
        if any(part.get("mirror_part_id") != mirror_map.get(part["id"]) for part in payload["parts"]):
            raise ValueError("Approved public mirror IDs differ from the exact source pairing map")
        if any(part.get("mechanically_checked_support") is not (parts[part["id"]].get("mechanically_checked_support") is True)
               for part in payload["parts"]):
            raise ValueError("Compact mechanical-support flags differ from the actual source support set")
        verify_light_parts(parts, [{key: value for key, value in part.items() if key not in {"mirror_part_id", "mechanically_checked_support"}}
                                  for part in payload["parts"]])
    else:
        verify_light_parts(parts, payload["parts"])
    source_motion = audit["saved_scene_binding"]
    if (source_motion["actual_instance_count"] != len(parts)
            or source_motion["used_native_types"] != evidence["metrics"]["unique_types"]
            or source_motion["manifest_sha256"] != sha(mb)
            or source_motion["whole_part_color"] != "PASS_SINGLE_CONSTANT_MATERIAL_NO_FACIAL_TEXTURE"):
        raise ValueError("Saved scene does not match actual whole-part colors/counts")
    portable = json.loads((stage / "freecad-relocated.json").read_text())
    assembly = next(entry for entry in portable["documents"] if entry["path"].endswith(f"/{case_id}/assembly.FCStd"))
    if assembly["link_instances"] != len(parts) or assembly["valid_single_solid_targets_checked"] != evidence["metrics"]["unique_types"]:
        raise ValueError("Public relocated native assembly does not match the actual figure")
    animation_check = json.loads((stage / "animation-portability.json").read_text())
    if not animation_check["motion_unchanged"] or not animation_check["frame1_roundtrip_no_drift"]:
        raise ValueError("Public saved-scene animation was not preserved")
    root_record = root_validation = whisker_support = load_ledger = None
    if revision:
        reference = summary["assembly_support" if body_support or is_symmetry else "whisker_support"]["assembly_validation_ref"]
        suffix = "symmetry" if is_symmetry else "assembly" if body_support else "whisker"
        if reference["path"] != f"validation/{case_id}-{suffix}-support.json":
            raise ValueError("The actual root revision references a different validation record")
        if is_symmetry:
            transport = summary["assembly_validation_transport_ref"]
            if transport != payload.get("assembly_validation_transport_ref"):
                raise ValueError("The actual symmetry proof transport differs across approved inputs")
            decoded_proof, root_bytes = decode_support_transport(case_id, transport, reference, (light / transport["path"]).read_bytes())
        else:
            root_bytes = (light / reference["path"]).read_bytes()
        if sha(root_bytes) != reference["sha256"]:
            raise ValueError("The exact public root validation bytes changed")
        if is_symmetry:
            root_record = verify_bilateral_supports(decoded_proof, full, native)
            pairs = validate_part_pairs(full["parts"], mirror_record["physical_part_mirror_map"])
            root_record["native_pair_evidence"] = validate_native_pair_volumes(decoded_proof["native_symmetry"], pairs)
            independent = json.loads((stage / "independent-native-symmetry.json").read_text())
            if (independent.get("state") != "PASS_ACTUAL_PORTABLE_BREP_REFLECTION"
                    or independent.get("synthetic_test_only_not_customer_geometry") is not False
                    or independent["case_id"] != case_id or independent["pairing"]["actual_part_count"] != len(parts)):
                raise ValueError("The corrected case has no independent actual portable native reflection audit")
            change_visual = json.loads((stage / "independent-change-and-visual.json").read_text())
            if change_visual.get("case_id") != case_id or not change_visual.get("new_mechanical_baseline_cells_and_colors_exact"):
                raise ValueError("The intended change and real native raster evidence are missing")
            root_record["independent_native_pairs"] = len(independent["type_rotation_pair_comparisons"])
            root_record["independent_change_and_visual"] = change_visual
            root_record["gravity_balance_result"] = "PASS_ALL_NOMINAL_CAD_STATIC_MOMENT_BOUNDS"
        else:
            root_record = (validate_body_support_evidence if body_support else validate_root_evidence)(json.loads(root_bytes), full, native)
        if body_support and root_record["checked_support_modules"] > 1:
            ledger_bytes = proof_bytes(f"/cases/{case_id}/support-load-ledger.json")
            original_bytes = proof_bytes(f"/cases/{revision['logical_case_id']}/manifest.json")
            load_ledger = validate_support_ledger(json.loads(ledger_bytes), full, json.loads(original_bytes), native, sha(mb))
            load_ledger["read_only_ledger_sha256"] = sha(ledger_bytes)
        if native.get("temporary_aids") != [] or payload.get("assembly_aids") != []:
            raise ValueError("The root source/native assembly still contains temporary supports")
        if full["motion"]["stages"] != motion["stages"] or full["motion"]["sequence_mode"] != motion.get("sequence_mode"):
            raise ValueError("Root motion stages differ from the exact canonical source identity")
        metadata = json.loads((stage / "native-metadata-review.json").read_text())
        original_assembly = [item for item in metadata if item["path"].endswith(f"/{case_id}/assembly.FCStd")]
        if (len(original_assembly) != 1
                or original_assembly[0]["source_sha256"] != summary["provenance"]["native_assembly_sha256"]
                or sha((stage / "original-scene.blend").read_bytes()) != summary["provenance"]["render_scene_sha256"]):
            raise ValueError("Root native/render provenance does not bind the original metadata-only copies")
        root_validation = ({**transport, "path": PREFIX + transport["path"]} if is_symmetry
                           else {"path": PREFIX + reference["path"], "bytes": len(root_bytes), "sha256": sha(root_bytes)})
        whisker_support = {
            "external_aid_count": 0, "assembly_aid_count": 0,
            "status": "DIGITAL_SELF_SUPPORTING_UNTESTED", "physical_validation": "UNKNOWN",
            "geometry_revision": revision["geometry_revision"], "manifest_sha256": sha(mb),
            "attachment_evidence_sha256": root_record["native_support_contact_evidence_sha256" if body_support or is_symmetry else "native_root_contact_evidence_sha256"],
            "sequence_evidence_sha256": sha(root_bytes), "motion_sha256": sha(motion_bytes),
            "geometry_sequence_identity_sha256": root_record["geometry_sequence_identity_sha256"],
            "all_categories_geometry_match": True, "assembly_validation_ref": root_validation,
            "gravity_balance_result": root_record["gravity_balance_result"], "physical_mass_measured": False,
        }
        if is_symmetry:
            whisker_support["assembly_validation_ref"] = {**reference, "path": PREFIX + reference["path"], "bytes": len(root_bytes)}
            whisker_support["assembly_validation_transport_ref"] = root_validation

    def checked_image(item, **extra):
        path = light / item["path"]
        if path.stat().st_size != item["bytes"] or sha(path.read_bytes()) != item["sha256"]:
            raise ValueError("Light image differs from its approved bytes")
        return {"path": PREFIX + item["path"], "bytes": item["bytes"], "sha256": item["sha256"], **extra}

    geometry_files = []
    geometry_types = {}
    repository_types = {row["type_id"] for row in stage_review.get("source_repository_mesh_files", [])}
    for identifier, descriptor in {**payload["geometry"], **payload["assembly_aid_geometry"]}.items():
        geometry_folder = stage / "repository-native" if identifier in repository_types else light
        data = (geometry_folder / descriptor["path"]).read_bytes()
        raw = gzip.decompress(data)
        if sha(data) != descriptor["sha256"] or len(data) != descriptor["bytes"] or raw[:4] != b"OBM1":
            raise ValueError("Approved native geometry gzip differs")
        vertices, faces = struct.unpack("<II", raw[4:12])
        if vertices != descriptor["vertex_count"] or faces != descriptor["face_count"] or len(raw) != 12 + vertices * 12 + faces * 12:
            raise ValueError("Native geometry array lengths differ")
        if sha(raw[12:]) != descriptor["float32_mesh_sha256"]:
            raise ValueError("Native Float32 geometry fingerprint mismatch")
        file = {"path": PREFIX + descriptor["path"], "bytes": len(data), "sha256": sha(data),
                "format": "OBM1_GZIP", "type_id": identifier, "geometry_sha256": sha(raw[12:])}
        if identifier in repository_types:
            file = pinned_mesh_descriptor(ROOT, identifier, args.mesh_public_commit, file)
        geometry_files.append(file)
        geometry_types[identifier] = sha(raw[12:])
    types = {identifier: {**spec, "geometry_sha256": geometry_types[identifier]} for identifier, spec in payload["types"].items()}
    aid_shapes = {item["id"]: item["shape"] for item in native["temporary_aids"]}
    aids = []
    for aid in payload["assembly_aids"]:
        bounds = aid_shapes[aid["id"]]["bounds_mm"]
        dims = [bounds[1][axis] - bounds[0][axis] for axis in range(3)]
        types[aid["id"]] = {"kind": "temporary_support", "pitch_mm": 8, "stud_diameter_mm": None,
                             "body_mm": dims, "body_height_mm": dims[2], "geometry_sha256": geometry_types[aid["id"]]}
        aids.append({"id": aid["id"], "type_id": aid["id"], "position_mm": aid["assembly_position_mm"],
                     "rotation_z_deg": 0, "required_before_step": min(parts[id]["step"] for id in aid["supported_part_ids"]),
                     "retention_validation": "UNKNOWN", "show_during_preparation": True})
    guide = {"schema_version": 1, "study_id": STUDY, "candidate_id": case_id, "units": "mm", **revision,
             "position_origin": payload["origin"], "frame": full["frame"], "status": payload["status"],
             "types": types, "palette": payload["palette"],
             "parts": [{**part, "source_part_ids": part.get("source_part_ids", [part["id"]])} for part in payload["parts"]]
                      if body_support or is_symmetry else payload["parts"], "aids": aids,
             "geometry_files": geometry_files, "metrics": {"part_count": len(parts), "unique_types": evidence["metrics"]["unique_types"]},
             "animation_contract": {"explosion": "ABSOLUTE_RADIAL_OFFSETS", "assembly": "BOTTOM_UP_SOURCE_ORDER",
                "disassembly_validation": "NOT_SIMULATED", "physical_assembly": "UNKNOWN", "radial_center_mm": motion["center_mm"],
                "stages": [{"id": item["stage_id"], "label": item["label_ja"], "start_step": item["start_step"],
                            "end_step": item["end_step"],
                            **({"support_z_mm": item["support_z_mm"]} if root_record else {})}
                           for item in motion["stages"]]},
             "source_manifest_sha256": sha(mb), "source_bom_sha256": sha(bb)}
    if "sequence_mode" in motion:
        guide["animation_contract"]["sequence_mode"] = motion["sequence_mode"]
    if body_support or is_symmetry:
        guide.update(support_validation=root_validation, assembly_support=whisker_support,
                     geometry_sequence_identity_sha256=root_record["geometry_sequence_identity_sha256"],
                     native_support_contact_evidence_sha256=root_record["native_support_contact_evidence_sha256"])
        if is_symmetry:
            guide["symmetry_context"] = payload["symmetry_context"]
            guide["support_load_mode"] = payload["support_load_mode"]
            guide["mechanically_checked_support_ids"] = sorted(part["id"] for part in full["parts"] if part.get("mechanically_checked_support") is True)
    elif root_record:
        guide.update(root_validation=root_validation, whisker_support=whisker_support,
                     geometry_sequence_identity_sha256=root_record["geometry_sequence_identity_sha256"],
                     native_root_contact_evidence_sha256=root_record["native_root_contact_evidence_sha256"])
    if (motion["absolute_pose_rule"] != "position_mm + amount*radial_offset_mm" or motion["assembly_step_zero"] != "EMPTY"
            or motion["assembly_final_step"] != len(parts) or not motion["orientation_unchanged"] or not motion["zero_exact_return"]):
        raise ValueError("Source animation contract was not absolute and empty-to-full")
    package = json.loads((stage / "package.json").read_text())
    release_base = f"https://github.com/ktanino10/octoprints-brick-kit-downloads/releases/download/{STUDY}-{case_id}/"
    bundle = {"url": release_base + package["filename"], "filename": package["filename"],
              "bytes": package["bytes"], "sha256": package["sha256"], "label": "実CG・動画・Blender・CAD・BOM・組立データ一式"}
    for identifier, spec in types.items():
        if spec["kind"] == "temporary_support":
            continue
        spec["files"] = {extension: {**bundle, "member_path": f"artifacts/studies/{STUDY}/shared/masters/{identifier}.{extension}"}
                         for extension in ["stl", "step"]}
    movie = native_root / "cases" / case_id / "assembly-motion.mp4"
    video = {"url": release_base + f"{case_id}-assembly-motion.mp4", "bytes": movie.stat().st_size, "sha256": sha(movie.read_bytes())}
    animations = {}
    for chapter in summary["animation"]["chapters"]:
        key = {"turntable": "turntable", "radial-explosion": "radial_explode", "bottom-up-assembly": "bottom_up"}[chapter["kind"]]
        animations[key] = {**video, "start_seconds": chapter["start_seconds"], "end_seconds": chapter["end_seconds"]}
    output = stage / "derived"
    output.mkdir(exist_ok=True)
    guide_bytes = gzip.compress(encoded(guide), mtime=0)
    privacy(gzip.decompress(guide_bytes), "derived public guide")
    guide_name = f"cases/{case_id}-guide.json.gz"
    (output / Path(guide_name).name).write_bytes(guide_bytes)
    normalized_metrics = {**evidence["metrics"], "dimensions_mm": summary["metrics"]["actual_size_mm"]}
    image_records = {}
    for view in ["front", "three_quarter"]:
        item = next(item for item in summary["images"] if item["view"] == "assembled-" + view)
        camera = summary["camera_conditions"][view]
        if not math.isclose(camera["rendered_model_height_px"], 864):
            raise ValueError("Actual shape comparison does not use normalized projected height")
        image_records[view] = checked_image(item, framing_rule="MATCHED_SCREEN_HEIGHT",
                                           condition_id="ACTUAL_PROJECTED_HEIGHT864_" + view)
    tradeoff = " ".join(summary["visual_review"]["observations_ja"])
    entry = {"id": case_id, **revision, "character": payload["character"], "count_percentage": int(round(summary["metrics"]["target_ratio"] * 100)),
             "state": "READY", "metrics": normalized_metrics, "target_count": summary["metrics"]["target_count"],
             "target_difference": summary["metrics"]["count_difference"], "actual_ratio": summary["metrics"]["actual_ratio"],
             "manifest": {"path": PREFIX + guide_name, "bytes": len(guide_bytes), "sha256": sha(guide_bytes)},
             "source_manifest_sha256": sha(mb), "source_bom_sha256": sha(bb), "source_commit": receipt["source_commit"],
             "images": image_records, "tradeoff": tradeoff,
             "assets": {"cg": [{**bundle, "contents": ["still", "blender"]}],
                        "native_cad": [{**bundle, "contents": ["freecad_assembly", "linked_libraries", "stl", "step"]}],
                        "assembly": [{**bundle, "contents": ["bom", "ordered_ids", "instructions"]}],
                        "animations": animations}}
    if whisker_support:
        entry["assembly_support" if body_support or is_symmetry else "whisker_support"] = whisker_support
    if is_symmetry:
        visual = summary["symmetry_visual_ref"]
        entry["symmetry_visual"] = checked_image(visual)
        entry["previous_case_id"] = full["symmetry_context"]["source_current_case_id"]
        entry["symmetry_context"] = full["symmetry_context"]
    if is_reference:
        entry.pop("count_percentage")
        entry.update(kind="BASELINE_REFERENCE_NOT_MULTIPLIER_CASE", counts_toward_multiplier_cases=False,
                     fixed_count_baseline=summary["metrics"]["baseline_count"],
                     actual_count_difference_from_fixed=summary["metrics"]["count_difference"])
    raw_matrix = json.loads((light / stage_review.get("source_catalog_path", "matrix.json")).read_text())
    if body_support or is_symmetry:
        overlay_revision = SYMMETRY_REVISION if is_symmetry else COPILOT_SUPPORT_REVISION
        expected_count = 5 if is_symmetry else 4
        if (raw_matrix.get("geometry_revision") != overlay_revision or raw_matrix.get("expected_case_count") != expected_count
                or len(raw_matrix["cases"]) != expected_count or summary["metrics"]["baseline_count"] != 17873):
            raise ValueError("New Copilot revision changed its separate scope or fixed denominator")
        base_path = ROOT / PREFIX.lstrip("/") / "catalog.json"
        base_bytes = base_path.read_bytes()
        catalog = {
            "schema_version": 1, "study_id": STUDY,
            "kind": "COPILOT_BILATERAL_SYMMETRY_REVISION" if is_symmetry else "COPILOT_BODY_SUPPORT_REVISION",
            "geometry_revision": overlay_revision, **FLAGS,
            "base_catalog_sha256": sha(base_bytes), "baseline_count": 17873, "expected_case_count": expected_count,
            "cases": [],
        }
        for row in raw_matrix["cases"]:
            identity = revision_fields(row["case_id"], row)
            percentage = int(identity["logical_case_id"].rsplit("p", 1)[1])
            expected = (17873 * percentage + 50) // 100
            if row["baseline_count"] != 17873 or row["target_count"] != expected:
                raise ValueError("Body-support source catalog changed a fixed target")
            catalog["cases"].append(entry if row["case_id"] == case_id else {
                "id": row["case_id"], **identity, "character": "copilot",
                "count_percentage": percentage, "state": "INPUT_WAIT", "target_count": expected,
            })
        reference_rows = []
        references = {"rows": []}
    else:
        catalog = None
    baselines = {}
    existing_catalog_path = ROOT / PREFIX.lstrip("/") / "catalog.json"
    existing_catalog = json.loads(existing_catalog_path.read_text()) if existing_catalog_path.exists() else None
    for row in raw_matrix.get("baseline_rows", []):
        if existing_catalog:
            current = existing_catalog["baselines"][row["character"]]
            if current["manifest_sha256"] != row["source_manifest_sha256"] or current["metrics"]["part_count"] != row["actual_count"]:
                raise ValueError("The fixed baseline changed between sealed case packets")
            baselines[row["character"]] = current
            continue
        end = ("/mona-fine-c360/manifest-edge-refined.json" if row["character"] == "mona"
               else f"/baselines/{row['candidate_id']}/manifest.json")
        bom_end = "/mona-fine-c360/edge-finished/bom.csv" if row["character"] == "mona" else f"/baselines/{row['candidate_id']}/bom.csv"
        baseline_bytes = proof_bytes(end)
        baseline_manifest = json.loads(baseline_bytes)
        baseline_proof = verify_manifest_bom(baseline_bytes, proof_bytes(bom_end))
        if baseline_proof["counted_instances"] != row["actual_count"] or sha(baseline_bytes) != row["source_manifest_sha256"]:
            raise ValueError("Fixed comparison baseline count differs")
        m = baseline_manifest["metrics"]
        dims = m.get("actual_size_mm") or [m["width_mm"], m["depth_mm"], m["height_mm"]]
        baselines[row["character"]] = {"state": "COUNTED", "native_media_status": "PENDING",
            "candidate_id": row["candidate_id"], "pitch_mm": 8, "basis": "INITIAL_FINE_C_ADAPTED_8MM",
            "manifest_sha256": sha(baseline_bytes), "metrics": {**baseline_proof["metrics"], "dimensions_mm": dims}}
    if not body_support and not is_symmetry:
        references = json.loads((light / "references.json").read_text())
    reference_rows = [{"character": row["character"], "candidate_id": row["candidate_id"], "note": row["note_ja"],
                       "images": [checked_image(item, view=item["view"], condition_id=item["condition_id"]) for item in row["images"]]}
                      for row in references["rows"]]
    if not body_support and not is_symmetry:
        catalog = {"schema_version": 1, "study_id": STUDY, "kind": "ACTUAL_PART_COUNT_MATRIX", **FLAGS,
               "baselines": baselines, "appearance_references": reference_rows,
               "cases": [entry if row["case_id"] == case_id else {
                   "id": row["case_id"], **revision_fields(row["case_id"], row),
                   "character": row["character"], "count_percentage": int(round(row["target_ratio"] * 100)),
                   "state": "INPUT_WAIT"} for row in raw_matrix["cases"]]}
    if is_reference:
        if not existing_catalog or entry["fixed_count_baseline"] != existing_catalog["baselines"]["mona"]["metrics"]["part_count"]:
            raise ValueError("The revised reference cannot change the frozen multiplier denominator")
        catalog = copy.deepcopy(existing_catalog)
        catalog.setdefault("reference_revisions", {})["mona"] = entry
    elif not body_support and not is_symmetry and existing_catalog and "reference_revisions" in existing_catalog:
        catalog["reference_revisions"] = copy.deepcopy(existing_catalog["reference_revisions"])
    (output / "catalog.json").write_bytes(encoded(catalog))
    translations = {row["note_ja"]: row["note_en"] for row in references["rows"]}
    for stem in ["observations"]:
        translations.update(zip(summary["visual_review"][stem + "_ja"], summary["visual_review"][stem + "_en"], strict=True))
    translations.update(zip(summary["limitations_ja"], summary["limitations_en"], strict=True))
    translations[tradeoff] = " ".join(summary["visual_review"]["observations_en"])
    translations.update({item["label_ja"]: item["label_en"] for item in motion["stages"]})
    (output / "translations.json").write_bytes(encoded(translations))
    (output / "evidence.json").write_bytes(encoded({"case_id": case_id, "source_commit": receipt["source_commit"],
        **evidence, "body_height_families": body_height_families(full), "public_native_assembly": assembly,
        "public_blender_motion_preserved": True, "source_saved_scene_binding": source_motion["instance_projection_sha256"],
        "source_native_reopen": native["moved_reopen"], "private_inputs_copied": 0,
        **({("symmetry_revision_evidence" if is_symmetry else "body_support_revision_evidence" if body_support else "root_revision_evidence"): root_record} if root_record else {}),
        **({"independent_exclusive_load_ledger": load_ledger} if load_ledger else {})}))
    print(json.dumps({"case_id": case_id, "actual_count": len(parts), "native_types": len(payload["geometry"]),
                      "native_aids": len(aids), "derived_guide_bytes": len(guide_bytes), "catalog_state": "PARTIAL"}, indent=2))


if __name__ == "__main__":
    main()
