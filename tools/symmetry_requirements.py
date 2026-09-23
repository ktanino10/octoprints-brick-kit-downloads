"""Fail closed on unreceived symmetry revisions; prior READY records are not evidence."""

import re

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
    for row, percentage, count in zip(cases, PERCENTAGES, PREVIOUS_COUNTS, strict=True):
        logical, parsed_percentage = symmetry_identity(row.get("requested_case_id"))
        previous = logical if percentage == 400 else logical + "-support-free-v2"
        if (parsed_percentage != percentage or row.get("logical_case_id") != logical
                or row.get("previous_case_id") != previous or row.get("previous_actual_count") != count
                or row.get("multiplier") != percentage / 100
                or row.get("target_count") != (17873 * percentage + 50) // 100):
            raise ValueError("The symmetry request changed a frozen comparison identity or denominator")
        if (row.get("status") != "INPUT_WAIT" or any(row.get(field) is not None for field in pending_fields)
                or row.get("verification") != {"public_browser_passed": False, "anonymous_downloads_passed": False}):
            raise ValueError("Actual symmetry evidence must be accepted before any corrected case can be published")
    if (record.get("state") != "PARTIAL" or record.get("published_verified_case_count") != 0
            or record.get("verification") != {"public_browser_passed": False, "anonymous_downloads_passed": False}):
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
