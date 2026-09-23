"""Requested-delivery gates are separate from historical digital artifact readiness."""

import re
from urllib.parse import parse_qs, urlsplit

MONA_WHISKER_REQUIREMENT = "NO_EXTERNAL_OR_ASSEMBLY_AIDS"
MONA_GEOMETRY_REVISION = "whisker-root-v2"
MONA_ROOT_REFERENCE_ID = "mona-fine8-base-root-v2"
COPILOT_SUPPORT_REVISION = "body-support-v2"


def case_identity(identifier):
    match = re.fullmatch(r"((mona|copilot|ducky)-p(120|150|200|300|400))(-root-v2)?", str(identifier))
    if not match or (match[4] and match[2] != "mona"):
        raise ValueError("Invalid actual matrix case identity")
    return match[1], MONA_GEOMETRY_REVISION if match[4] else None


def artifact_identity(identifier):
    symmetric = re.fullmatch(r"(copilot-p(?:120|150|200|300|400))-symmetric-v3", str(identifier))
    if symmetric:
        return symmetric[1], "bilateral-symmetry-v3"
    support = re.fullmatch(r"(copilot-p(?:120|150|200|300))-support-free-v2", str(identifier))
    if support:
        return support[1], COPILOT_SUPPORT_REVISION
    if identifier == MONA_ROOT_REFERENCE_ID:
        return "mona-fine8-base", MONA_GEOMETRY_REVISION
    return case_identity(identifier)


def logical_case_id(case):
    logical, revision = artifact_identity(case["id"])
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


def validate_copilot_support_receipt(record):
    expected = {f"copilot-p{value}": value for value in [120, 150, 200, 300]}
    cases = record.get("cases", [])
    if (record.get("schema_version") != 1 or record.get("request_id") != "copilot-support-free-20260922"
            or record.get("study_id") != "part-count-matrix-20260921"
            or record.get("baseline_count") != 17873 or record.get("expected_case_count") != 4
            or len(cases) != 4 or {item.get("logical_case_id") for item in cases} != expected.keys()):
        raise ValueError("The separate Copilot request must cover exactly four fixed logical slots")
    requirements = record.get("requirements", {})
    for key, value in {"external_aid_count": 0, "assembly_aid_count": 0,
                       "hiding_or_renaming_supports_is_not_completion": True,
                       "actual_native_geometry_and_assembly_sequence_evidence_required": True,
                       "physical_validation": "UNKNOWN", "slicer_status": "NOT_SLICED", "full_print": "ON_HOLD"}.items():
        if type(requirements.get(key)) is not type(value) or requirements[key] != value:
            raise ValueError("The new Copilot request lost its actual-geometry or physical-validation boundary")
    preserved = record.get("preserved_existing_four_x", {})
    if (preserved.get("case_id") != "copilot-p400" or preserved.get("actual_count") != 71261
            or preserved.get("assembly_aid_count") != 0 or preserved.get("regeneration_requested") is not False
            or preserved.get("counts_toward_the_four_new_revisions") is not False):
        raise ValueError("The existing zero-aid 4x case is preserved, not a newly completed revision")
    ready = 0
    for case in cases:
        logical = case["logical_case_id"]
        identifier = logical + "-support-free-v2"
        target = (17873 * expected[logical] + 50) // 100
        if (case.get("actual_case_id") != identifier or case.get("geometry_revision") != COPILOT_SUPPORT_REVISION
                or case.get("multiplier") != expected[logical] / 100 or case.get("target_count") != target):
            raise ValueError("A Copilot support-free receipt changed its fixed identity, denominator or target")
        status = case.get("status")
        verification = case.get("verification", {})
        if status == "INPUT_WAIT":
            if (any(case.get(key) is not None for key in ["actual_count", "source_commit", "external_aid_count",
                                                         "assembly_aid_count", "geometry_sequence_evidence",
                                                         "cad_url", "cg_url", "animation_url", "assembly_url", "viewer_url"])
                    or verification != {"public_browser_passed": False, "anonymous_downloads_passed": False}):
                raise ValueError("Unreceived Copilot geometry cannot acquire actual success-shaped fields")
            continue
        if status not in {"SOURCE_READY", "PUBLIC_PENDING", "READY"}:
            raise ValueError("Unknown support-free Copilot revision status")
        evidence = case.get("geometry_sequence_evidence")
        if (type(case.get("actual_count")) is not int or case["actual_count"] <= 0
                or abs(case["actual_count"] - target) > max(1, target * 0.01)
                or not re.fullmatch(r"[0-9a-f]{40}", str(case.get("source_commit", "")))
                or type(case.get("external_aid_count")) is not int or case["external_aid_count"] != 0
                or type(case.get("assembly_aid_count")) is not int or case["assembly_aid_count"] != 0
                or not isinstance(evidence, dict)
                or evidence.get("path") != f"/artifacts/studies/part-count-matrix-20260921/validation/{identifier}-assembly-support.json"
                or not re.fullmatch(r"[0-9a-f]{64}", str(evidence.get("sha256", "")))
                or type(evidence.get("bytes")) is not int or evidence["bytes"] <= 0):
            raise ValueError("Actual support-free Copilot identity/count/zero-aid/evidence binding is incomplete")
        if status == "READY":
            if verification != {"public_browser_passed": True, "anonymous_downloads_passed": True}:
                raise ValueError("A public Copilot revision needs actual browser and anonymous verification")
            for key in ["cad_url", "cg_url", "animation_url", "assembly_url", "viewer_url"]:
                url = case.get(key, "")
                if not isinstance(url, str):
                    raise ValueError("A completed revision has no actual public URL")
                parsed = urlsplit(url)
                release = f"/ktanino10/octoprints-brick-kit-downloads/releases/download/part-count-matrix-20260921-{identifier}/"
                viewer = parsed.netloc == "ktanino10.github.io" and parsed.path in {
                    "/octoprints-brick-kit-downloads/ja/density-guide.html",
                    "/octoprints-brick-kit-downloads/en/density-guide.html",
                } and parse_qs(parsed.query).get("case") == [identifier]
                asset = not parsed.query and (
                    parsed.netloc == "github.com" and parsed.path.startswith(release)
                    or parsed.netloc == "ktanino10.github.io" and parsed.path.startswith(
                        f"/octoprints-brick-kit-downloads/artifacts/studies/part-count-matrix-20260921/images/{identifier}-"))
                if parsed.scheme != "https" or parsed.fragment or not (viewer if key == "viewer_url" else asset):
                    raise ValueError("A new support-free revision cannot use an old or non-public artifact URL")
            ready += 1
        elif any(verification.values()):
            raise ValueError("An unverified source revision cannot claim public QA")
    if record.get("published_verified_case_count") != ready:
        raise ValueError("The new request's published count includes unverified or prior cases")
    comparisons = record.get("comparisons")
    comparisons_ready = False
    if comparisons is not None:
        if (not isinstance(comparisons, dict) or comparisons.get("state") not in {"PUBLIC_PENDING", "READY"}
                or not isinstance(comparisons.get("assets"), list) or len(comparisons["assets"]) != 5):
            raise ValueError("The support-free comparison needs three images, one exact CSV and its descriptor")
        paths = set()
        for file in comparisons["assets"]:
            path = file.get("path", "")
            if (not isinstance(path, str) or not path.startswith("/artifacts/studies/part-count-matrix-20260921/revisions/body-support-v2/")
                    or path in paths or type(file.get("bytes")) is not int or file["bytes"] <= 0
                    or not re.fullmatch(r"[0-9a-f]{64}", str(file.get("sha256", "")))):
                raise ValueError("A versioned comparison file is unbound, duplicated or outside its revision")
            paths.add(path)
        if comparisons.get("descriptor") not in comparisons["assets"]:
            raise ValueError("Comparison descriptor must bind its exact published asset")
        comparisons_ready = comparisons["state"] == "READY"
        if comparisons.get("verification") != {"public_browser_passed": comparisons_ready, "anonymous_downloads_passed": comparisons_ready}:
            raise ValueError("Comparison readiness requires both real browser and anonymous download verification")
    complete = ready == 4 and comparisons_ready
    expected_state = "READY" if complete else "PARTIAL"
    if record.get("state") != expected_state or record.get("verification") != {
            "public_browser_passed": complete, "anonymous_downloads_passed": complete}:
        raise ValueError("The earlier fifteen-case READY state cannot complete the new four-case request")
    if record.get("previous_completed_delivery", {}).get("satisfies_this_new_request") is not False:
        raise ValueError("Prior publication and new design completion must remain separate")
    return record
