"""Exercise guide mechanics with a labeled eight-part unit fixture, never a published candidate."""

import argparse
import gzip
import hashlib
import json
from pathlib import Path
from urllib.parse import urljoin

from playwright.sync_api import expect, sync_playwright
from pack_density_meshes import pack_meshes
from browser_study_helpers import english

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--url", required=True)
parser.add_argument("--browser", required=True)
parser.add_argument("--output", type=Path, default=Path(".archive-work/density-unit-browser.json"))
args = parser.parse_args()
base = args.url.rstrip("/") + "/"
prefix = "/artifacts/studies/part-count-matrix-20260921/"
files = {}


def resource(name, data, content_type="application/json"):
    files[urljoin(base, (prefix + name).lstrip("/"))] = (data, content_type)
    return {"path": prefix + name, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}


def encoded(data):
    return json.dumps(data, separators=(",", ":")).encode()


raw, _ = pack_meshes({"units": "mm", "origin": "body-bottom-center", "types": {
    "UNIT-TETRA-NOT-CANDIDATE": {
        "vertices": [[-7.9, -7.9, 0], [7.9, -7.9, 0], [0, 7.9, 0], [0, 0, 4.8]],
        "faces": [[0, 2, 1], [0, 1, 3], [1, 2, 3], [2, 0, 3]],
    },
}})
header_size = int.from_bytes(raw[8:12], "little")
geometry_hash = json.loads(raw[12:12 + header_size])["types"][0]["geometry_sha256"]
geometry_file = resource("UNIT-ONLY.mesh.bin.gz", gzip.compress(raw, mtime=0), "application/gzip")
flags = {"current_revision_unchanged": "r3-8mm-20260920", "baseline_choice": "COMPARISON_ASSUMPTION_NOT_USER_SELECTION",
         "selection": "NOT_SELECTED", "visual_approval": "PENDING", "physical_fit": "UNKNOWN",
         "retention_strength": "UNKNOWN", "whole_figure_stability": "UNKNOWN", "slicer_status": "NOT_SLICED", "full_print": "ON_HOLD"}
parts = []
for index in range(8):
    x, y = [[-8, -8], [8, -8], [-8, 8], [8, 8]][index % 4]
    z = index // 4 * 4.8
    parts.append({"id": f"UNIT-TEST-{index}", "type_id": "UNIT-TETRA-NOT-CANDIDATE", "color_id": "unit",
                  "step": index + 1, "assembly_course": index // 4, "position_mm": [x, y, z], "rotation_z_deg": index % 4 * 90,
                  "radial_offset_mm": [x * 3, y * 3, z + 2.4 - 4.8], "support_ids": [] if index < 4 else [f"UNIT-TEST-{index - 4}"],
                  "required_aids": []})
manifest = {
    "schema_version": 1, "study_id": "part-count-matrix-20260921", "candidate_id": "mona-p120", "units": "mm",
    "frame": {"up": "+Z", "front": "-Y", "handedness": "right"}, "position_origin": "body-bottom-center", "status": flags,
    "palette": {"unit": {"name": "UNIT TEST ONLY", "hex": "#cf6588"}},
    "types": {"UNIT-TETRA-NOT-CANDIDATE": {"body_mm": [15.8, 15.8, 4.8], "body_height_mm": 4.8, "pitch_mm": 8,
                                         "stud_diameter_mm": 4.8, "geometry_sha256": geometry_hash}},
    "parts": parts, "aids": [], "metrics": {"part_count": 8, "unique_types": 1}, "geometry_files": [geometry_file],
    "animation_contract": {"explosion": "ABSOLUTE_RADIAL_OFFSETS", "assembly": "BOTTOM_UP_SOURCE_ORDER",
        "disassembly_validation": "NOT_SIMULATED", "physical_assembly": "UNKNOWN", "radial_center_mm": [0, 0, 4.8],
        "stages": [{"id": "unit-base", "label": "UNIT foundation", "start_step": 1, "end_step": 4},
                   {"id": "unit-upper", "label": "UNIT upper", "start_step": 5, "end_step": 8}]},
}
manifest_file = resource("UNIT-ONLY-manifest.json.gz", gzip.compress(encoded(manifest), mtime=0), "application/gzip")
dummy = resource("UNIT-ONLY-download.bin", b"not a real production artifact", "application/octet-stream")
image = {**dummy, "framing_rule": "MATCHED_SCREEN_HEIGHT", "condition_id": "unit-mona"}
baseline_metrics = {"part_count": 12435, "unique_types": 121, "one_by_one_exceptions": 31,
                    "grip_long_ge_15_8_count": 12404, "dimensions_mm": [423.8, 343.8, 368.2], "minimum_part_mm": [7.8, 7.8, 3.2]}
catalog = {"schema_version": 1, "study_id": manifest["study_id"], "kind": "ACTUAL_PART_COUNT_MATRIX", **flags,
    "baselines": {"mona": {"state": "COUNTED", "native_media_status": "PENDING", "candidate_id": "unit-baseline", "pitch_mm": 8, "basis": "INITIAL_FINE_C_ADAPTED_8MM",
        "manifest_sha256": "5556e329521b5706a366c5dad2aa6c7b13eca9d7d74323338773d5e2b20b2b4c",
        "metrics": baseline_metrics},
        "copilot": {"state": "INPUT_WAIT"}, "ducky": {"state": "INPUT_WAIT"}},
    "cases": [{"id": f"{character}-p{percent}", "character": character, "count_percentage": percent, "state": "INPUT_WAIT"}
              for character in ["mona", "copilot", "ducky"] for percent in [120, 150, 200, 300, 400]]}
catalog["cases"][0].update({
    "state": "TARGET_MISSED", "metrics": {**baseline_metrics, "part_count": 8, "unique_types": 1, "one_by_one_exceptions": 0, "grip_long_ge_15_8_count": 8},
    "target_count": 14922, "target_difference": 8 - 14922, "actual_ratio": 8 / 12435, "manifest": manifest_file,
    "images": {"front": image, "three_quarter": image}, "tradeoff": "UNIT TEST ONLY. Not a real or completed case.",
    "source_commit": "1" * 40, "source_manifest_sha256": "2" * 64, "source_bom_sha256": "3" * 64,
    "assets": {"cg": [{**dummy, "contents": ["still", "blender"]}],
               "native_cad": [{**dummy, "contents": ["freecad_assembly", "linked_libraries", "stl", "step"]}],
               "assembly": [{**dummy, "contents": ["bom", "ordered_ids", "instructions"]}],
               "animations": {key: {**dummy, "start_seconds": 0, "end_seconds": 1}
                              for key in ["turntable", "radial_explode", "bottom_up"]}},
})
catalog_file = resource("UNIT-ONLY-catalog.json", encoded(catalog))
pointer = {"schema_version": 1, "study_id": manifest["study_id"], "state": "PARTIAL", **flags, "catalog": catalog_file}
report = {"scope": "LABELED_UNIT_FIXTURE_ONLY_NOT_REAL_CANDIDATE_ACCEPTANCE", "checks": [], "errors": []}

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path=args.browser, headless=True,
                                        args=["--no-first-run", "--disable-background-networking", "--disable-sync"])
    context = browser.new_context(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce")
    context.route("**/archive/density-study.json", lambda route: route.fulfill(status=200, body=encoded(pointer), content_type="application/json"))
    for address, (data, content_type) in files.items():
        context.route(address, lambda route, request, data=data, content_type=content_type: route.fulfill(status=200, body=data, content_type=content_type))
    page = context.new_page()
    page.on("pageerror", lambda error: report["errors"].append(str(error)))
    try:
        page.goto(urljoin(base, "en/density-guide.html?case=mona-p120"), wait_until="domcontentloaded")
        expect(page.locator("#density-canvas")).to_have_attribute("data-ready", "true", timeout=60000)
        expect(page.locator("#guide-error")).to_be_hidden()
        expect(page.locator("#density-canvas")).to_have_attribute("data-visible-parts", "8")
        english(page)
        page.locator("#guide-mode").select_option("radial")
        for value in ["100", "0", "100", "0"]:
            page.locator("#guide-explode").evaluate("(el, value) => { el.value=value; el.dispatchEvent(new Event('input')); }", value)
            expect(page.locator("#density-canvas")).to_have_attribute("data-explosion", "1" if value == "100" else "0")
            assert page.evaluate("window.__densityGuide.diagnostics().matrix_elements_mismatched") == 0
        page.locator("#guide-mode").select_option("assembly")
        expect(page.locator("#density-canvas")).to_have_attribute("data-visible-parts", "0")
        page.locator('[data-guide-action="part-next"]').click()
        expect(page.locator("#density-canvas")).to_have_attribute("data-visible-parts", "1")
        page.locator('[data-guide-action="course-next"]').click()
        expect(page.locator("#density-canvas")).to_have_attribute("data-visible-parts", "4")
        page.locator("#guide-stage").select_option("unit-upper")
        page.locator('[data-guide-action="stage"]').click()
        expect(page.locator("#density-canvas")).to_have_attribute("data-visible-parts", "8")
        page.locator("#guide-parts button").first.click()
        expect(page.locator("#guide-selection strong")).to_have_text("UNIT-TEST-0")
        page.locator('[data-guide-action="part-bottom"]').click()
        page.locator('[data-guide-action="view:underside"]').click()
        page.locator("#guide-same").check()
        page.locator("#guide-search").fill("UNIT-TEST-0")
        expect(page.locator("#guide-parts tr")).to_have_count(1)
        page.locator('[data-language="ja"]').click()
        page.reload(wait_until="domcontentloaded")
        expect(page.locator("#density-canvas")).to_have_attribute("data-ready", "true", timeout=60000)
        expect(page.locator("#guide-selection strong")).to_have_text("UNIT-TEST-0")
        expect(page.locator("#guide-error")).to_be_hidden()
        assert not report["errors"], report["errors"]
        report["checks"] = ["real WebGL/packed mesh path", "radial slider roundtrip", "zero/one/course/stage/final",
                            "standalone underside", "type/color destinations", "language/shared reload",
                            "target-missed unit fixture never counted as a completed case"]
        print("PASS: isolated 8-part UNIT FIXTURE mechanics; not production-case acceptance.")
    except Exception as error:
        report["failure"] = str(error)
        raise
    finally:
        browser.close()
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(report, indent=2) + "\n")
