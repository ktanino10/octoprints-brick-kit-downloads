"""Fail closed on unreceived symmetry revisions; prior READY records are not evidence."""

import re
from urllib.parse import parse_qs, urlsplit

SYMMETRY_REVISION = "bilateral-symmetry-v3"
PERCENTAGES = (120, 150, 200, 300, 400)
PREVIOUS_COUNTS = (21382, 26673, 35630, 53287, 71261)


def symmetry_identity(identifier):
    match = re.fullmatch(r"(copilot-p(120|150|200|300|400))-symmetric-v3", str(identifier))
    if match is None:
        raise ValueError("Expected one of the five explicit new Copilot symmetry identities")
    return match[1], int(match[2])


def validate_symmetry_receipt(record):
    if (record.get("schema_version") != 1 or record.get("request_id") != "copilot-symmetry-20260923"
            or record.get("geometry_revision") != SYMMETRY_REVISION
            or record.get("baseline_count") != 17873 or record.get("expected_case_count") != 5
            or record.get("baseline_public_commit") != "22d7d56308668fe7c366c48ac7af26e77ac4558c"
            or record.get("previous_completed_delivery", {}).get("satisfies_this_new_request") is not False):
        raise ValueError("Symmetry corrections must remain distinct from the completed support-free request")
    cases = record.get("cases")
    if not isinstance(cases, list) or len(cases) != 5:
        raise ValueError("The symmetry request must cover all five current Copilot variants")
    pending_fields = ("actual_case_id", "source_commit", "actual_count", "symmetry_evidence", "mechanical_evidence", "downloads")
    ready = 0
    for row, percentage, count in zip(cases, PERCENTAGES, PREVIOUS_COUNTS, strict=True):
        logical, parsed_percentage = symmetry_identity(row.get("requested_case_id"))
        previous = logical if percentage == 400 else logical + "-support-free-v2"
        if (parsed_percentage != percentage or row.get("logical_case_id") != logical
                or row.get("previous_case_id") != previous or row.get("previous_actual_count") != count
                or row.get("multiplier") != percentage / 100
                or row.get("target_count") != (17873 * percentage + 50) // 100):
            raise ValueError("The symmetry request changed a frozen comparison identity or denominator")
        if row.get("status") == "INPUT_WAIT":
            if (any(row.get(field) is not None for field in pending_fields)
                    or row.get("verification") != {"public_browser_passed": False, "anonymous_downloads_passed": False}):
                raise ValueError("Actual symmetry evidence must be accepted before any corrected case can be published")
            continue
        identifier = row["requested_case_id"]
        if (row.get("status") not in {"PUBLIC_PENDING", "READY"} or row.get("actual_case_id") != identifier
                or not re.fullmatch(r"[0-9a-f]{40}", str(row.get("source_commit", "")))
                or type(row.get("actual_count")) is not int or row["actual_count"] <= 0
                or abs(row["actual_count"] - row["target_count"]) > max(1, row["target_count"] * 0.01)
                or row.get("external_aid_count") != 0 or row.get("assembly_aid_count") != 0):
            raise ValueError("A corrected case lacks its exact new identity, quantities or zero-aid evidence")
        prefix = "/artifacts/studies/part-count-matrix-20260921/validation/"
        for name, suffix in [("symmetry_evidence", "-native-visual-symmetry.json"), ("mechanical_evidence", "-symmetry-support.json.gz")]:
            file = row.get(name)
            if (not isinstance(file, dict) or file.get("path") != prefix + identifier + suffix
                    or type(file.get("bytes")) is not int or file["bytes"] <= 0
                    or not re.fullmatch(r"[0-9a-f]{64}", str(file.get("sha256", "")))):
                raise ValueError("The exact symmetry or mechanical proof file is missing")
        mechanical = row["mechanical_evidence"]
        if (mechanical.get("encoding") != "gzip" or type(mechanical.get("decoded_bytes")) is not int
                or mechanical["decoded_bytes"] <= 0
                or not re.fullmatch(r"[0-9a-f]{64}", str(mechanical.get("decoded_sha256", "")))):
            raise ValueError("The complete decoded mechanical proof must remain hash-bound")
        assets = row.get("downloads")
        if not isinstance(assets, dict):
            raise ValueError("Every corrected case must publish all four artifact categories and its viewer")
        for name in ["cad", "cg", "animation", "assembly", "viewer"]:
            url = urlsplit(str(assets.get(name, "")))
            if name == "viewer":
                valid = url.netloc == "ktanino10.github.io" and url.path == "/octoprints-brick-kit-downloads/ja/density-guide.html" and parse_qs(url.query) == {"case": [identifier]}
            else:
                valid = url.netloc == "github.com" and url.path.startswith(
                    f"/ktanino10/octoprints-brick-kit-downloads/releases/download/part-count-matrix-20260921-{identifier}/") and not url.query
            if not valid or url.scheme != "https" or url.fragment:
                raise ValueError("Corrected artifact links must belong to the exact new public case")
        complete_case = row["status"] == "READY"
        if row.get("verification") != {"public_browser_passed": complete_case, "anonymous_downloads_passed": complete_case}:
            raise ValueError("Case readiness must match completed actual public browser and download checks")
        ready += complete_case
    comparisons_ready = record.get("comparisons", {}).get("state") == "READY"
    complete = ready == 5 and comparisons_ready
    if (record.get("state") != ("READY" if complete else "PARTIAL") or record.get("published_verified_case_count") != ready
            or record.get("verification") != {"public_browser_passed": complete, "anonymous_downloads_passed": complete}):
        raise ValueError("Unreceived corrections cannot inherit the previous delivery's READY state")
    requirements = record.get("requirements", {})
    for field, expected in {
        "correct_actual_geometry_and_whole_part_colors": True,
        "image_only_mirroring_is_not_completion": True,
        "external_aid_count": 0, "assembly_aid_count": 0,
        "minimum_nominal_cad_support_margin_mm": 1,
        "old_unchanged_geometry_or_color_claims_cannot_be_reused": True,
        "physical_validation": "UNKNOWN", "slicer_status": "NOT_SLICED", "full_print": "ON_HOLD",
    }.items():
        if type(requirements.get(field)) is not type(expected) or requirements[field] != expected:
            raise ValueError("The pending symmetry request lost its geometry, support or physical-validation boundary")
    return record
