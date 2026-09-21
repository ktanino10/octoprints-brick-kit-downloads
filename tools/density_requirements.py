"""Requested-delivery gates are separate from historical digital artifact readiness."""

import re

MONA_WHISKER_REQUIREMENT = "NO_EXTERNAL_OR_ASSEMBLY_AIDS"


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
        and isinstance(support.get("manifest_sha256"), str)
        and support["manifest_sha256"] == case.get("source_manifest_sha256")
        and all(re.fullmatch(r"[0-9a-f]{64}", str(support.get(key, ""))) for key in hashes)
        and support.get("all_categories_geometry_match") is True
    )
    return "READY" if valid else "REQUIRES_WHISKER_REVISION"
