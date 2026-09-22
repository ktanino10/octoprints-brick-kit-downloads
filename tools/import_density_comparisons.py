"""Accept only fixed final comparison images/CSV after all actual cases are installed."""

import argparse
import copy
import hashlib
import io
import json
from pathlib import Path
import re
import subprocess

from PIL import Image

from density_comparison_evidence import verify_comparison_csv
from density_requirements import delivery_status
from install_density_case import encoded, immutable_write
from make_density_receipt import receipt_for
from stage_density_case import committed_bytes, safe_relative
from validate_archive import privacy
from validate_density import body_support_budget

ROOT = Path(__file__).resolve().parents[1]
STUDY = "part-count-matrix-20260921"
PREFIX = f"artifacts/studies/{STUDY}/"


def sha(data):
    return hashlib.sha256(data).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--receipt", type=Path, required=True)
    parser.add_argument("--receipt-sha256", required=True)
    parser.add_argument("--body-support", action="store_true", help="Import only the immutable versioned Copilot comparison supplement")
    args = parser.parse_args()
    raw = args.receipt.read_bytes()
    if sha(raw) != args.receipt_sha256:
        raise ValueError("The final comparison receipt differs from its explicitly supplied SHA")
    receipt = json.loads(raw)
    if (receipt.get("study_id") != STUDY
            or receipt.get("state") not in {
                "READY_FIXED_INCREMENTAL_CASES_NOT_AUTOMATIC_ALL15", "READY_FINAL_COMPARISON_SHEETS",
                "READY_FIXED_SOURCE_COMPARISON_SUPPLEMENT_NOT_PUBLIC_QA",
                "READY_FIXED_BODY_SUPPORT_COMPARISON_SUPPLEMENT_NOT_PUBLIC_QA",
            }
            or not re.fullmatch(r"[0-9a-f]{40}", str(receipt.get("source_commit", "")))):
        raise ValueError("Only an explicitly fixed READY comparison supplement may be imported")
    catalog_path = ROOT / PREFIX / "catalog.json"
    catalog = json.loads(catalog_path.read_text())
    overlay_path = ROOT / PREFIX / "revisions/body-support-v2/catalog.json"
    overlay = None
    if args.body_support:
        if (receipt["state"] != "READY_FIXED_BODY_SUPPORT_COMPARISON_SUPPLEMENT_NOT_PUBLIC_QA"
                or receipt.get("geometry_revision") != "body-support-v2" or receipt.get("case_ids") != []
                or receipt.get("multiplier_cases_newly_ready") != 0):
            raise ValueError("A versioned comparison supplement must not promote any new source case")
        overlay = json.loads(overlay_path.read_text())
        if overlay["base_catalog_sha256"] != sha(catalog_path.read_bytes()) or any(item["state"] != "READY" for item in overlay["cases"]):
            raise ValueError("All four actually accepted body-support cases and the immutable base are required")
        replacements = {item["logical_case_id"]: item for item in overlay["cases"]}
        catalog = copy.deepcopy(catalog)
        catalog["cases"] = [replacements.get(item.get("logical_case_id", item["id"]), item) for item in catalog["cases"]]
    elif receipt["state"] == "READY_FIXED_BODY_SUPPORT_COMPARISON_SUPPLEMENT_NOT_PUBLIC_QA":
        raise ValueError("The versioned supplement cannot replace the original global comparison")
    if len(catalog["cases"]) != 15 or any(delivery_status(case) != "READY" for case in catalog["cases"]):
        raise ValueError("Final comparison import waits for all fifteen actual accepted cases")
    source = Path(receipt["source_root"])
    if source.name != "public" or source.parent.name != STUDY:
        raise ValueError("Comparison inputs escape the explicitly authorized study")
    repo, commit = source.parents[3], receipt["source_commit"]
    approved = {entry["path"]: entry for entry in receipt["files"]}
    if len(approved) != len(receipt["files"]):
        raise ValueError("Comparison allowlist repeats a path")
    payload = {}
    for name, record in approved.items():
        safe_relative(name)
        payload[name] = committed_bytes(repo, source / name, commit, record)
        privacy(payload[name], name)
    revision_prefix = "revisions/body-support-v2/" if args.body_support else ""
    index_name, csv_name = revision_prefix + "comparison-sheets.json", revision_prefix + "comparison.csv"
    if not {index_name, csv_name} <= payload.keys():
        raise ValueError("Final comparison supplement lacks its actual index or CSV")
    index = json.loads(payload[index_name])
    stage = ROOT / ".archive-work" / ("body-support-final-comparisons" if args.body_support else "density-final-comparisons")
    stage.mkdir(exist_ok=True)
    staged_index = stage / "comparison-sheets.json"
    staged_index.write_bytes(payload[index_name])
    checked_catalog = stage / "effective-catalog.json"
    checked_catalog.write_bytes(encoded(catalog))
    subprocess.run([
        "node", "--input-type=module", "-e",
        "import {readFile} from 'node:fs/promises';"
        "import {validateDensityComparisons} from './assets/density-comparisons.js';"
        "validateDensityComparisons(JSON.parse(await readFile(process.argv[1])),JSON.parse(await readFile(process.argv[2])),"
        "{bodySupport:process.argv[3]==='body',previous:JSON.parse(await readFile(process.argv[4]))});",
        str(staged_index), str(checked_catalog), "body" if args.body_support else "original",
        str(ROOT / PREFIX / "comparison-sheets.json") if args.body_support else str(staged_index),
    ], cwd=ROOT, check=True)
    csv_evidence = verify_comparison_csv(payload[csv_name], catalog)
    needed = {index_name, csv_name}
    proof_inputs = receipt["read_only_verification_files"]
    binding_entries = [entry for entry in proof_inputs if entry["path"].endswith("/comparison-source-binding.json")]
    source_count = 32 if args.body_support else 90
    if len(proof_inputs) != source_count + 1 or len(binding_entries) != 1:
        raise ValueError("The final comparison supplement must explicitly close 90 source files and one binding record")
    binding = json.loads(committed_bytes(repo, Path(binding_entries[0]["path"]), commit, binding_entries[0]))
    binding_state = "COMPLETE_VERSIONED_BODY_SUPPORT_COMPARISON_BINDING" if args.body_support else "COMPLETE_ORIGINAL_RENDER_SOURCE_BINDING"
    if (binding.get("state") != binding_state or binding.get("study_id") != STUDY
            or binding.get("public_descriptor_sha256") != sha(payload[index_name])
            or len(binding.get("records", [])) != source_count):
        raise ValueError("The private source closure does not bind the exact final public descriptor")
    approved_proofs = {entry["path"]: entry for entry in proof_inputs if entry is not binding_entries[0]}
    recorded = {str(repo / safe_relative(entry["path"])): entry for entry in binding["records"]}
    if len(recorded) != source_count or recorded.keys() != approved_proofs.keys():
        raise ValueError("Final comparison source closure omits, duplicates or adds a source file")
    expected_cases = {column["case_id"] for row in index["rows"] for column in row["columns"]}
    if len(expected_cases) != (6 if args.body_support else 18) or set(receipt.get("comparison_case_ids", [])) != expected_cases:
        raise ValueError("Final comparison closure must bind the eighteen actual comparison models")
    for path, record in recorded.items():
        approved_record = approved_proofs[path]
        prior = args.body_support and Path(path).parent == source and Path(path).name in {"comparison-sheets.json", "comparison.csv"}
        if ((not prior and record.get("case_id") not in expected_cases)
                or record.get("permission") != ("READ_ONLY_PRIOR_COMPARISON_NOT_PUBLICATION" if prior else "READ_ONLY_ORIGINAL_RENDER_BINDING_NOT_PUBLICATION")
                or any(record[key] != approved_record[key] for key in ["bytes", "sha256"])):
            raise ValueError("A source binding differs from its explicit fixed read-only receipt")
        if prior:
            prior_bytes = committed_bytes(repo, Path(path), commit, approved_record)
            if prior_bytes != (ROOT / PREFIX / Path(path).name).read_bytes():
                raise ValueError("The prior comparison input differs from the unchanged public original")
    if args.body_support:
        before = (ROOT / PREFIX / "comparison.csv").read_bytes().splitlines(keepends=True)
        after = payload[csv_name].splitlines(keepends=True)
        slots = {item["logical_case_id"] for item in overlay["cases"]}
        keep_before = [line for index, line in enumerate(before) if index == 0 or line.decode().split(",")[1] not in slots]
        keep_after = [line for index, line in enumerate(after) if index == 0 or line.decode().split(",")[1] not in slots]
        if keep_before != keep_after or len(keep_after) != 12:
            raise ValueError("The versioned CSV changed the header or any of the other eleven fixed rows")
        csv_evidence["other_eleven_rows_and_header_byte_identical"] = True

    def proof_bytes(identifier, ending):
        matches = [entry for entry in proof_inputs
                   if f"/{identifier}/" in entry["path"] and entry["path"].endswith(ending)]
        if len(matches) != 1 or matches[0].get("permission") != "READ_ONLY_VERIFICATION_NOT_PUBLICATION":
            raise ValueError("Comparison source binding is missing or ambiguous")
        entry = matches[0]
        return committed_bytes(repo, Path(entry["path"]), commit, entry)

    bindings = []
    for row in index["rows"]:
        for column in row["columns"]:
            identifier = column["case_id"]
            for ending, expected in [("/manifest.json", column["manifest_sha256"]),
                                     ("/bom.csv", column["bom_sha256"]),
                                     ("/media/render-stats.json", column["source_render_stats_sha256"])]:
                if sha(proof_bytes(identifier, ending)) != expected:
                    raise ValueError("A final comparison column changed its fixed source manifest/BOM/camera evidence")
        for image in row["images"]:
            name = image["path"]
            if name not in approved or len(payload[name]) != image["bytes"] or sha(payload[name]) != image["sha256"]:
                raise ValueError("A final comparison image is not the exact approved source file")
            with Image.open(io.BytesIO(payload[name])) as actual:
                if list(actual.size) != image["image_size_px"]:
                    raise ValueError("Actual comparison image dimensions differ from the descriptor")
            needed.add(name)
            source_view = "three_quarter" if image["view"] == "three_quarter" else "front"
            for condition in image["conditions"]:
                identifier = condition["case_id"]
                original = proof_bytes(identifier, f"/media/assembled-{source_view}.png")
                if sha(original) != condition["source_image_sha256"]:
                    raise ValueError("A comparison panel does not bind the exact original CG pixels")
                with Image.open(io.BytesIO(original)) as actual:
                    if list(actual.size) != condition["camera"]["image_size_px"]:
                        raise ValueError("The source CG dimensions differ from its camera record")
                summary = json.loads((ROOT / PREFIX / f"cases/{identifier}-summary.json").read_text())
                if condition["camera"] != summary["camera_conditions"][source_view]:
                    raise ValueError("A comparison changed an already accepted source camera")
                metadata = json.loads((ROOT / ".archive-work" / f"density-{identifier}" / "image-metadata-review.json").read_text())
                recorded = [item for item in metadata if item["path"].endswith(f"/assembled-{source_view}.png")]
                if len(recorded) != 1 or recorded[0]["source_sha256"] != sha(original):
                    raise ValueError("The source CG changed since its native/media package was accepted")
                bindings.append({"case_id": identifier, "view": source_view, "source_image_sha256": sha(original),
                                 "public_package_image_sha256": recorded[0]["public_sha256"],
                                 "camera_unchanged": True})
    if len(needed) != (5 if args.body_support else 11):
        raise ValueError("Final supplement must contain exactly nine sheets, one CSV and one index")
    for name in needed:
        destination = ROOT / PREFIX / name
        if destination.exists() and destination.read_bytes() != payload[name]:
            raise ValueError("A fixed comparison artifact would be overwritten: " + name)
    if args.body_support:
        body_support_budget({PREFIX + name: payload[name] for name in needed})
    assets = []
    for name in sorted(needed):
        immutable_write(ROOT / PREFIX / name, payload[name])
        assets.append({"path": "/" + PREFIX + name, "bytes": len(payload[name]), "sha256": sha(payload[name])})
    destination_catalog = overlay if args.body_support else catalog
    destination_catalog["comparison_sheets"] = next(item for item in assets if item["path"].endswith("/comparison-sheets.json"))
    destination_catalog["comparison_assets"] = assets
    record = {"schema_version": 1, "study_id": STUDY, "source_commit": commit, "source_images": bindings,
              "csv": csv_evidence, "private_source_inputs_copied": 0, "images_and_csv": assets,
              "files": [{"path": file["path"].lstrip("/"), "bytes": file["bytes"], "sha256": file["sha256"],
                         "source_relative_path": file["path"].removeprefix("/" + PREFIX),
                         "source_commit": commit} for file in assets]}
    privacy(encoded(record), "comparison publication evidence")
    evidence_name = f"{STUDY}-{'body-support-v2-' if args.body_support else ''}comparisons-verification.json"
    immutable_write(ROOT / "archive/sources" / evidence_name, encoded(record))
    catalog_bytes = encoded(destination_catalog)
    (overlay_path if args.body_support else catalog_path).write_bytes(catalog_bytes)
    pointer_path = ROOT / ("archive/copilot-support-free-revision.json" if args.body_support else "archive/density-study.json")
    pointer = json.loads(pointer_path.read_text())
    catalog_name = PREFIX + ("revisions/body-support-v2/" if args.body_support else "") + "catalog.json"
    pointer["revision_catalog" if args.body_support else "catalog"] = {
        "path": "/" + catalog_name, "bytes": len(catalog_bytes), "sha256": sha(catalog_bytes)}
    if args.body_support:
        pointer["comparisons"] = {"state": "PUBLIC_PENDING", "descriptor": destination_catalog["comparison_sheets"],
                                 "assets": assets, "verification": {"public_browser_passed": False, "anonymous_downloads_passed": False}}
    pointer_path.write_bytes(encoded(pointer))
    if not args.body_support:
        (ROOT / "archive/block-budget-matrix.json").write_bytes(encoded(receipt_for(catalog, catalog_sha256=sha(catalog_bytes))))
    print("Accepted actual versioned comparison sheets and fifteen-row CSV; public comparison QA remains required.")


if __name__ == "__main__":
    main()
