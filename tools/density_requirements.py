"""Requested-delivery gates are separate from historical digital artifact readiness."""

import re

MONA_WHISKER_REQUIREMENT = "NO_EXTERNAL_OR_ASSEMBLY_AIDS"
MONA_GEOMETRY_REVISION = "whisker-root-v2"
MONA_ROOT_REFERENCE_ID = "mona-fine8-base-root-v2"


def case_identity(identifier):
    match = re.fullmatch(r"((mona|copilot|ducky)-p(120|150|200|300|400))(-root-v2)?", str(identifier))
    if not match or (match[4] and match[2] != "mona"):
        raise ValueError("Invalid actual matrix case identity")
    return match[1], MONA_GEOMETRY_REVISION if match[4] else None


def artifact_identity(identifier):
    if identifier == MONA_ROOT_REFERENCE_ID:
        return "mona-fine8-base", MONA_GEOMETRY_REVISION
    return case_identity(identifier)


def logical_case_id(case):
    logical, revision = case_identity(case["id"])
    if case.get("logical_case_id", logical) != logical:
        raise ValueError("Actual geometry belongs to a different logical comparison slot")
    if revision and (case.get("logical_case_id") != logical or case.get("geometry_revision") != revision):
        raise ValueError("Revised geometry needs its explicit logical slot and geometry revision")
    if logical != f'{case["character"]}-p{case["count_percentage"]}':
        raise ValueError("Logical comparison slot differs from its character or multiplier")
    return logical


def all_cases(catalog):
    return [*catalog["cases"], *catalog.get("historical_cases", [])]


def delivery_status(case):
    if case["state"] != "READY":
        return case["state"]
    if case["character"] != "mona":
        return "READY"
    support = case.get("whisker_support")
    if not isinstance(support, dict):
        return "REQUIRES_WHISKER_REVISION"
    hashes = ["attachment_evidence_sha256", "sequence_evidence_sha256"]
    valid = (
        type(support.get("external_aid_count")) is int and support["external_aid_count"] == 0
        and type(support.get("assembly_aid_count")) is int and support["assembly_aid_count"] == 0
        and support.get("status") == "DIGITAL_SELF_SUPPORTING_UNTESTED"
        and support.get("physical_validation") == "UNKNOWN"
        and isinstance(support.get("geometry_revision"), str) and bool(support["geometry_revision"])
        and ("geometry_revision" not in case or support["geometry_revision"] == case["geometry_revision"])
        and isinstance(support.get("manifest_sha256"), str)
        and re.fullmatch(r"[0-9a-f]{64}", support["manifest_sha256"])
        and support["manifest_sha256"] == case.get("source_manifest_sha256")
        and all(re.fullmatch(r"[0-9a-f]{64}", str(support.get(key, ""))) for key in hashes)
        and support.get("all_categories_geometry_match") is True
    )
    return "READY" if valid else "REQUIRES_WHISKER_REVISION"
