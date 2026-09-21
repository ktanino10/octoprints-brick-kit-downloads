"""Verify the final fifteen-row CSV against fixed counts and accepted actual artifacts."""

import csv
import io
import math
import re

from density_requirements import delivery_status, logical_case_id

COLUMNS = [
    "case_id", "logical_case_id", "geometry_revision", "character", "target_ratio", "baseline_count",
    "actual_reference_count", "target_count", "actual_count", "actual_ratio", "difference",
    "width_mm", "depth_mm", "height_mm", "types", "one_by_one", "grip_long_ge_15_8_fraction",
]


def verify_comparison_csv(raw, catalog):
    cases = catalog["cases"]
    if len(cases) != 15 or any(delivery_status(case) != "READY" for case in cases):
        raise ValueError("Final comparison CSV requires all fifteen accepted actual cases")
    reader = csv.DictReader(io.StringIO(raw.decode("utf-8-sig")))
    if reader.fieldnames != COLUMNS:
        raise ValueError("Final comparison CSV columns do not match the fixed contract")
    rows = list(reader)
    by_id = {case["id"]: case for case in cases}
    if (len(rows) != 15 or len({row["case_id"] for row in rows}) != 15
            or {row["case_id"] for row in rows} != by_id.keys()):
        raise ValueError("Final comparison CSV must contain each actual multiplier case exactly once, without references")
    for row in rows:
        case = by_id[row["case_id"]]
        character = case["character"]
        baseline = catalog["baselines"][character]
        reference = catalog.get("reference_revisions", {}).get(character, baseline)
        count = case["metrics"]["part_count"]
        frozen = baseline["metrics"]["part_count"]
        target = (frozen * case["count_percentage"] + 50) // 100
        text = {
            "logical_case_id": logical_case_id(case), "character": character,
            "geometry_revision": case.get("geometry_revision", "original-matrix"),
        }
        if any(row[key] != value for key, value in text.items()):
            raise ValueError("Comparison CSV changed an actual geometry identity or logical slot")
        integers = {
            "baseline_count": frozen, "actual_reference_count": reference["metrics"]["part_count"],
            "target_count": target, "actual_count": count, "difference": count - target,
            "types": case["metrics"]["unique_types"], "one_by_one": case["metrics"]["one_by_one_exceptions"],
        }
        for key, expected in integers.items():
            if not re.fullmatch(r"-?\d+", row[key]) or int(row[key]) != expected:
                raise ValueError("Comparison CSV changed a fixed or actual count: " + key)
        floats = {
            "target_ratio": case["count_percentage"] / 100, "actual_ratio": count / frozen,
            "width_mm": case["metrics"]["dimensions_mm"][0],
            "depth_mm": case["metrics"]["dimensions_mm"][1],
            "height_mm": case["metrics"]["dimensions_mm"][2],
            "grip_long_ge_15_8_fraction": case["metrics"]["grip_long_ge_15_8_count"] / count,
        }
        for key, expected in floats.items():
            actual = float(row[key])
            if not math.isfinite(actual) or not math.isclose(actual, expected, rel_tol=1e-9, abs_tol=1e-6):
                raise ValueError("Comparison CSV changed actual dimensions or ratios: " + key)
    return {"rows": 15, "fixed_denominators_unchanged": True, "references_counted_as_cases": False,
            "actual_counts_dimensions_ratios_types_match": True}
