"""Stage one explicitly READY matrix case, never the producer's growing public tree."""

import argparse
import gzip
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import subprocess
import zipfile
from density_requirements import COPILOT_SUPPORT_REVISION, MONA_ROOT_REFERENCE_ID, artifact_identity, case_identity
from symmetry_requirements import SYMMETRY_REVISION, symmetry_identity
from symmetry_evidence import decode_support_transport
from repository_meshes import PERMISSION as MESH_PERMISSION, validate_native_payload

from validate_archive import privacy

ROOT = Path(__file__).resolve().parents[1]
STUDY = "part-count-matrix-20260921"


def sha(data):
    return hashlib.sha256(data).hexdigest()


def safe_relative(value):
    if not isinstance(value, str):
        raise ValueError("Invalid allowed file path")
    path = PurePosixPath(value)
    if path.is_absolute() or ".." in path.parts or "\\" in value or value != path.as_posix():
        raise ValueError("Invalid allowed file path")
    return path


def root_validation_path(case, summary, model, payload):
    logical, revision = artifact_identity(case)
    if revision is None:
        return None
    if any(record.get("logical_case_id") != logical or record.get("geometry_revision") != revision
           for record in [summary, model]):
        raise ValueError("Root revision identity differs across its approved source records")
    body_support = revision == COPILOT_SUPPORT_REVISION
    support = summary.get("assembly_support" if body_support else "whisker_support")
    reference = support.get("assembly_validation_ref") if isinstance(support, dict) else None
    expected = f"validation/{case}-{'assembly' if body_support else 'whisker'}-support.json"
    if not isinstance(reference, dict) or reference.get("path") != expected or expected not in payload:
        raise ValueError("The root revision lacks its exact allowlisted public validation file")
    raw = payload[expected]
    if sha(raw) != reference.get("sha256"):
        raise ValueError("Root validation reference hash differs from its approved bytes")
    proof = json.loads(raw)
    if (proof.get("schema_version") != 1 or proof.get("case_id") != case
            or proof.get("logical_case_id") != logical or proof.get("geometry_revision") != revision
            or proof.get("status") != "DIGITAL_SELF_SUPPORTING_UNTESTED"
            or proof.get("physical_validation") != "UNKNOWN"
            or proof.get("slicer_supports") != "UNKNOWN_SEPARATE_FROM_NO_ASSEMBLY_STANDS"
            or any(type(proof.get(key)) is not int or proof[key] != 0 for key in
                   ["external_aid_count", "assembly_aid_count", "floating_seed_steps", "blocked_vertical_body_columns"])
            or any(proof.get(key) is not True for key in
                   ["source_occupied_cells_unchanged", "source_visible_colors_unchanged", "body_first_all_steps_supported"])
            or proof.get("actual_parts") != len(model["parts"])
            or proof.get("actual_types") != len({part["type_id"] for part in model["parts"]})
            or model.get("assembly_aids") != []
            or any(part.get("required_aids") != [] for part in model["parts"])):
        raise ValueError("Root validation is incomplete, belongs to different geometry, or still requires aids")
    return expected


def committed_bytes(repo, path, commit, entry):
    relative = path.relative_to(repo).as_posix()
    data = subprocess.check_output(["git", "-C", str(repo), "cat-file", "blob", f"{commit}:{relative}"])
    if len(data) != entry["bytes"] or sha(data) != entry["sha256"]:
        raise ValueError("Pinned input differs from the explicit READY receipt: " + path.name)
    return data


def verify_release_persistence(repo, commit, records):
    for item in records:
        if "reconstruction_path" in item:
            path, digest, expected = item["reconstruction_path"], item["reconstruction_sha256"], item["recipe"]
        else:
            path, digest, expected = item["path"], item["sha256"], item["data"]
        relative = Path(path).relative_to(repo).as_posix()
        raw = subprocess.check_output(["git", "-C", str(repo), "cat-file", "blob", f"{commit}:{relative}"])
        if sha(raw) != digest or json.loads(raw) != expected:
            raise ValueError("Fixed ZIP reconstruction record changed")
        combined = hashlib.sha256()
        length = 0
        for chunk in expected["chunks"]:
            safe_relative(chunk["path"])
            data = committed_bytes(repo, repo / chunk["path"], commit, chunk)
            combined.update(data)
            length += len(data)
        if length != expected["bytes"] or combined.hexdigest() != expected["sha256"]:
            raise ValueError("Fixed chunks do not reconstruct the authorized whole ZIP")


def verify_artifact_persistence(repo, commit, records, case):
    verified = []
    recipes = []
    prefix = f"artifacts/studies/{STUDY}/"
    for item in records:
        if item.get("permission") != "PRIVATE_EXACT_ARTIFACT_PERSISTENCE_NOT_PUBLICATION" or item.get("case_id") != case:
            raise ValueError("Unexpected raw-artifact persistence scope")
        index_path = Path(item["index_path"]).relative_to(repo).as_posix()
        raw = subprocess.check_output(["git", "-C", str(repo), "cat-file", "blob", f"{commit}:{index_path}"])
        if sha(raw) != item["index_sha256"] or json.loads(raw) != item["record"]:
            raise ValueError("Fixed raw-artifact persistence index changed")
        index = item["record"]
        if index.get("state") != "EXACT_PRIVATE_LARGE_ARTIFACTS_PERSISTED" or index.get("case_id") != case:
            raise ValueError("Raw-artifact index belongs to another case or is incomplete")
        for entry in index["files"]:
            safe_relative(entry["path"])
            safe_relative(entry["reconstruction_path"])
            if not (entry["path"].startswith(prefix + f"cases/{case}/")
                    or entry["path"].startswith(prefix + f"portable/cases/{case}/")):
                raise ValueError("Raw-artifact persistence names an unapproved case")
            recipe_raw = subprocess.check_output(["git", "-C", str(repo), "cat-file", "blob",
                                                  f"{commit}:{entry['reconstruction_path']}"])
            if sha(recipe_raw) != entry["reconstruction_sha256"]:
                raise ValueError("Raw-artifact reconstruction record changed")
            recipe = json.loads(recipe_raw)
            if recipe["bytes"] != entry["bytes"] or recipe["sha256"] != entry["sha256"]:
                raise ValueError("Raw-artifact reconstruction does not bind the original file")
            recipes.append({"path": str(repo / entry["reconstruction_path"]),
                            "sha256": entry["reconstruction_sha256"], "data": recipe})
            verified.append({key: entry[key] for key in ["path", "bytes", "sha256"]})
    verify_release_persistence(repo, commit, recipes)
    return verified


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--receipt", type=Path, required=True)
    parser.add_argument("--receipt-sha256", required=True)
    parser.add_argument("--case", help="Select one exact case from a multi-case READY packet")
    parser.add_argument("--reference", action="store_true", help="Accept only the explicitly separate support-free 1x reference")
    parser.add_argument("--body-support", action="store_true", help="Accept only the separate four-case Copilot body-support revision")
    parser.add_argument("--symmetry", action="store_true", help="Accept only a sealed bilateral revision with separately permitted native repository meshes")
    args = parser.parse_args()
    receipt_bytes = args.receipt.read_bytes()
    if sha(receipt_bytes) != args.receipt_sha256:
        raise ValueError("Private READY receipt hash mismatch")
    receipt = json.loads(receipt_bytes)
    if receipt["study_id"] != STUDY or receipt["state"] not in {
        "READY_SINGLE_REPRESENTATIVE_CASE_NOT_ALL15", "READY_SINGLE_CASE_NOT_ALL15",
        "READY_FIXED_INCREMENTAL_CASES_NOT_AUTOMATIC_ALL15",
        "READY_FIXED_BODY_SUPPORT_REVISION_CASES",
        "READY_FIXED_BILATERAL_SYMMETRY_CASES",
    }:
        raise ValueError("Only an explicitly finalized individual case may be staged")
    case_ids = receipt.get("case_ids", [receipt.get("case_id")])
    case = args.case or (case_ids[0] if len(case_ids) == 1 else None)
    if case is None or case not in case_ids:
        raise ValueError("Select an explicitly authorized case from this READY packet")
    if args.symmetry:
        symmetry_identity(case)
        if (args.body_support or args.reference or receipt["state"] != "READY_FIXED_BILATERAL_SYMMETRY_CASES"
                or receipt.get("geometry_revision") != SYMMETRY_REVISION
                or receipt.get("catalog_path") != "revisions/bilateral-symmetry-v3/matrix.json"
                or receipt.get("expected_revision_case_count") != 5):
            raise ValueError("The symmetry packet must match its distinct sealed five-case scope")
    elif receipt["state"] == "READY_FIXED_BILATERAL_SYMMETRY_CASES":
        raise ValueError("Symmetry input requires explicit separated publication-permission handling")
    elif args.body_support:
        if (args.reference or artifact_identity(case)[1] != COPILOT_SUPPORT_REVISION
                or receipt["state"] != "READY_FIXED_BODY_SUPPORT_REVISION_CASES"
                or receipt.get("geometry_revision") != COPILOT_SUPPORT_REVISION
                or receipt.get("catalog_path") != "revisions/body-support-v2/matrix.json"
                or receipt.get("expected_revision_case_count") != 4):
            raise ValueError("A body-support packet must match its separate fixed revision scope")
    elif receipt["state"] == "READY_FIXED_BODY_SUPPORT_REVISION_CASES":
        raise ValueError("Stage body-support data explicitly, never as the original fifteen-case matrix")
    elif args.reference:
        if case != MONA_ROOT_REFERENCE_ID or receipt.get("multiplier_cases_newly_ready") != 0:
            raise ValueError("A reference-only packet must not promote any multiplier case")
    else:
        case_identity(case)
    commit = receipt["source_commit"]
    if not re.fullmatch(r"[0-9a-f]{40}", commit):
        raise ValueError("A fixed source commit is required")
    public = Path(receipt["source_root"])
    if public.name != "public" or public.parent.name != STUDY:
        raise ValueError("Source root is not the explicitly authorized study")
    repo = public.parents[3]
    stage = ROOT / ".archive-work" / ("density-" + case)
    if stage.exists():
        raise ValueError("Refusing to overwrite a reviewed case staging directory")
    files = receipt["files"]
    input_files = receipt.get("normalization_input_files", []) if args.symmetry else []
    mesh_files = receipt.get("geometry_mesh_files", []) if args.symmetry else []
    if len({entry["path"] for entry in files}) != len(files):
        raise ValueError("Duplicate publication allowlist entries")
    payload = {}
    for entry in files:
        name = entry["path"]
        safe_relative(name)
        data = committed_bytes(repo, public / name, commit, entry)
        privacy(data, name)
        payload[name] = data
    for entry in input_files:
        name = entry["path"]
        safe_relative(name)
        if (entry.get("permission") != "NORMALIZATION_INPUT_NOT_PAGES" or entry.get("case_id") != case
                or name != f"cases/{case}.json.gz" or name in payload
                or entry.get("archive_member") != f"cases/{case}/viewer-source/{case}.json.gz"):
            raise ValueError("Unexpected normalized-only source input or duplicate Pages publication")
        data = committed_bytes(repo, public / name, commit, entry)
        privacy(gzip.decompress(data), "normalization-only actual model")
        payload[name] = data
    for entry in mesh_files:
        name = entry["path"]
        safe_relative(name)
        if entry.get("permission") != MESH_PERMISSION or name in payload:
            raise ValueError("Native repository geometry was not explicitly separated from Pages/input files")
        payload[name] = committed_bytes(repo, public / name, commit, entry)
    summary_name = receipt.get("case_summary_path", f"cases/{case}-summary.json")
    summary = json.loads(payload[summary_name])
    model_name = summary["manifest"]["path"]
    model = json.loads(gzip.decompress(payload[model_name]))
    if model["case_id"] != case:
        raise ValueError("Lightweight model differs from the selected actual case")
    catalog_name = receipt.get("catalog_path", "matrix.json")
    selected_names = {summary_name, model_name, catalog_name, "LICENSE", "ATTRIBUTION.md", "README.txt"}
    selected_names.update(image["path"] for image in summary["images"])
    selected_names.update(item["path"] for item in {**model["geometry"], **model["assembly_aid_geometry"]}.values())
    if args.symmetry:
        if set(entry["type_id"] for entry in mesh_files) - model["geometry"].keys():
            raise ValueError("The geometry permission list includes a type outside this actual model")
        for entry in mesh_files:
            geometry = model["geometry"][entry["type_id"]]
            if geometry["path"] != entry["path"] or any(geometry[key] != entry[key] for key in ["bytes", "sha256"]):
                raise ValueError("Repository-only permission differs from the actual source geometry descriptor")
            validate_native_payload(entry, payload[entry["path"]], geometry["float32_mesh_sha256"])
        transport = summary.get("assembly_validation_transport_ref")
        if transport != model.get("assembly_validation_transport_ref"):
            raise ValueError("Summary and compact proof transports differ")
        path = transport["path"]
        if path not in payload or path not in {entry["path"] for entry in files}:
            raise ValueError("The symmetry proof's exact gzip transport is not allowlisted for Pages")
        decode_support_transport(case, transport, summary["assembly_support"]["assembly_validation_ref"], payload[path])
        selected_names.add(path)
        visual_ref = summary.get("symmetry_visual_ref", {})
        visual_path = f"validation/{case}-native-visual-symmetry.json"
        if (visual_ref.get("path") != visual_path or visual_path not in payload
                or len(payload[visual_path]) != visual_ref.get("bytes")
                or sha(payload[visual_path]) != visual_ref.get("sha256")):
            raise ValueError("The actual native visual-symmetry evidence is missing from the sealed Pages allowlist")
        selected_names.add(visual_path)
        selected_names.update({f"images/{case}-native-mirror-overlay.jpg", f"images/{case}-paired-eye-zoom.jpg"})
    elif not args.body_support:
        selected_names.add("references.json")
        selected_names.update(image["path"] for row in json.loads(payload["references.json"])["rows"] for image in row["images"])
    root_proof = None if args.symmetry else root_validation_path(case, summary, model, payload)
    if root_proof is not None:
        selected_names.add(root_proof)
    if not selected_names <= set(payload):
        raise ValueError("The actual case needs a file outside this explicit allowlist")
    files = [entry for entry in files if entry["path"] in selected_names]
    payload = {name: data for name, data in payload.items() if name in selected_names}
    proof = {}
    for entry in receipt["read_only_verification_files"]:
        if entry["permission"] != "READ_ONLY_VERIFICATION_NOT_PUBLICATION":
            raise ValueError("Unexpected private verification scope")
        path = Path(entry["path"])
        if not path.resolve().is_relative_to(repo.resolve()):
            raise ValueError("Read-only verification path escapes the authorized project")
        data = committed_bytes(repo, path, commit, entry)
        proof[entry["path"]] = {"bytes": len(data), "sha256": sha(data)}
    verify_release_persistence(repo, commit, receipt.get("zip_persistence", []))
    persisted_artifacts = verify_artifact_persistence(repo, commit, receipt.get("artifact_persistence", []), case)
    releases = [entry for entry in receipt["release_files"] if entry.get("case_id", case) == case]
    if not releases:
        raise ValueError("No actual full native/media package was authorized")
    for entry in releases:
        path = Path(entry["path"])
        if not path.resolve().is_relative_to(public.parent.resolve()) or path.is_symlink():
            raise ValueError("The authorized Release package escapes the source study")
        with path.open("rb") as file:
            digest = hashlib.file_digest(file, "sha256").hexdigest()
        if path.stat().st_size != entry["bytes"] or digest != entry["sha256"]:
            raise ValueError("Source Release package changed after READY")
        with zipfile.ZipFile(path) as package:
            for member in package.infolist():
                safe_relative(member.filename.rstrip("/"))
                if (member.external_attr >> 16) & 0o170000 == 0o120000:
                    raise ValueError("Release package contains a symlink")
            if package.testzip() is not None:
                raise ValueError("Corrupt source Release package")
    stage.mkdir(parents=True)
    light = stage / "light"
    for name, data in payload.items():
        destination = (stage / "repository-native" if name in {entry["path"] for entry in mesh_files}
                       else stage / "normalization-input" if name in {entry["path"] for entry in input_files} else light)
        path = destination / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
    native_root = stage / "native/artifacts/studies" / STUDY
    native_root.mkdir(parents=True)
    for entry in releases:
        with zipfile.ZipFile(entry["path"]) as package:
            for normalization in input_files:
                if package.read(normalization["archive_member"]) != payload[normalization["path"]]:
                    raise ValueError("The exact normalization input is missing from the complete public Release package")
            package.extractall(native_root)
    portable_prefix = f"artifacts/studies/{STUDY}/portable/"
    for entry in persisted_artifacts:
        if entry["path"].startswith(portable_prefix):
            path = native_root / entry["path"][len(portable_prefix):]
            with path.open("rb") as file:
                digest = hashlib.file_digest(file, "sha256").hexdigest()
            if path.stat().st_size != entry["bytes"] or digest != entry["sha256"]:
                raise ValueError("Whole native/media ZIP does not contain the exact persisted raw artifact")
    (stage / "source-review.json").write_text(json.dumps({
        "study_id": STUDY, "case_id": case, "source_commit": commit, "source_light_files": files,
        "kind": "BASELINE_REFERENCE_NOT_MULTIPLIER_CASE" if args.reference else "ACTUAL_MULTIPLIER_CASE",
        **({"kind": "COPILOT_BODY_SUPPORT_REVISION", "geometry_revision": COPILOT_SUPPORT_REVISION,
            "source_catalog_path": catalog_name, "public_storage_delta": receipt["public_storage_delta"]}
           if args.body_support else {}),
        **({"kind": "COPILOT_SYMMETRY_REVISION", "geometry_revision": SYMMETRY_REVISION,
            "source_catalog_path": catalog_name, "public_storage_delta": receipt["public_storage_delta"],
            "source_repository_mesh_files": mesh_files,
            "source_normalization_files": [{key: value for key, value in item.items() if key != "source_path"} for item in input_files],
            "proof_transport": transport} if args.symmetry else {}),
        "private_verification_inputs_read": len(proof), "private_inputs_copied": 0,
        "private_raw_artifact_persistence_verified": len(persisted_artifacts),
        "source_release_files": [{key: item[key] for key in ["bytes", "sha256"]} | {"filename": Path(item["path"]).name}
                                 for item in releases],
        "publication_state": "STAGED_PENDING_PORTABILITY_AND_BROWSER",
    }, indent=2) + "\n")
    print(json.dumps({"case": case, "light_files": len(files), "light_bytes": sum(item["bytes"] for item in files),
                      "read_only_proof_files": len(proof), "native_bundle_files": len(list(native_root.rglob("*"))),
                      "stage": str(stage)}, indent=2))


if __name__ == "__main__":
    main()
