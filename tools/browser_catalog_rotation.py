"""Verify lazy real 3D rotation, current model identity, mobile controls and cleanup."""

import argparse
import gzip
import json
import math
from pathlib import Path
from urllib.parse import urljoin

from playwright.sync_api import expect, sync_playwright
from browser_study_helpers import english, published_print_cases

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--url", required=True)
parser.add_argument("--browser", required=True)
parser.add_argument("--output", type=Path, required=True)
parser.add_argument("--case", action="append", help="Only exercise selected current actual cases in an incremental batch")
args = parser.parse_args()
base = args.url.rstrip("/") + "/"
args.output.mkdir(parents=True, exist_ok=True)
report = {"base": base, "engine": "webkit-2203", "cases": [], "errors": [], "checks": []}


def checked(text):
    report["checks"].append(text)
    print("PASS", text, flush=True)


def ready(page, case):
    expect(page.locator("#catalog-preview-dialog")).to_be_visible()
    expect(page.locator("#catalog-preview-canvas")).to_have_attribute("data-model-ready", "true", timeout=180000)
    expect(page.locator("#catalog-preview-canvas")).to_have_attribute("data-candidate", case["id"])
    expect(page.locator("#catalog-preview-error")).to_be_hidden()
    page.evaluate("""async () => {
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      document.querySelector('#catalog-preview-canvas canvas').getContext('webgl2').finish();
    }""")
    value = page.evaluate("window.__catalogPreview.diagnostics()")
    assert value["actual_instances"] == case["metrics"]["part_count"] == value["visible_instances"]
    assert value["actual_aids"] == case["expected_aids"] == value["visible_aids"]
    assert value["matrix_elements_mismatched"] == 0 and value["unrestricted_azimuth"]
    assert value["touch_rotation_enabled"] and value["display_mode"] == "NATIVE_PREVIEW_TESSELLATION"
    return value


with sync_playwright() as playwright:
    browser = playwright.webkit.launch(executable_path=args.browser, headless=True, timeout=60000)
    context = browser.new_context(viewport={"width": 1440, "height": 1050}, reduced_motion="reduce")
    page = context.new_page()
    page.set_default_timeout(30000)
    page.on("pageerror", lambda error: report["errors"].append(str(error)))
    requested = []
    page.on("request", lambda request: requested.append(request.url))
    try:
        pointer = context.request.get(urljoin(base, "archive/density-study.json")).json()
        catalog = context.request.get(urljoin(base, pointer["catalog"]["path"].lstrip("/"))).json()
        actual_cases = published_print_cases(context.request, base, catalog)
        selected_cases = [case for case in actual_cases if not args.case or case["id"] in args.case]
        assert selected_cases and (not args.case or {case["id"] for case in selected_cases} == set(args.case))
        receipt = context.request.get(urljoin(base, "archive/block-budget-matrix.json")).json()
        evidence = context.request.get(urljoin(base, receipt["verification_record"]["path"].lstrip("/"))).json()
        counts = {item["case_id"]: item["temporary_aids_excluded_from_figure_count"]
                  for item in evidence["actual_multiplier_cases"]}
        for case in actual_cases:
            case["expected_aids"] = 0 if case.get("geometry_revision") == "body-support-v2" else counts[case["id"]]
        page.goto(urljoin(base, "en/"), wait_until="networkidle")
        expect(page.locator(".print-model")).to_have_count(3)
        assert not any("catalog-preview.js" in url or url.endswith(".mesh.gz") or "-guide.json.gz" in url for url in requested)
        expect(page.locator("#catalog-preview-canvas canvas")).to_have_count(0)
        checked("landing stays image-only; 3D renderer and geometry are loaded only on request")
        for case in selected_cases:
            page.locator(f'#model-{case["character"]}').select_option(case["id"])
            page.locator(f'[data-open-rotation="{case["character"]}"]').click()
            value = ready(page, case)
            english(page)
            before = value["camera"]
            page.locator('[data-preview-action="left"]').click()
            after = page.evaluate("window.__catalogPreview.diagnostics().camera")
            assert math.dist(before[:3], after[:3]) > 1
            assert math.dist(before[3:], after[3:]) < 1e-5
            if case["count_percentage"] == 120:
                for _ in range(11):
                    page.locator('[data-preview-action="left"]').click()
                returned = page.evaluate("window.__catalogPreview.diagnostics().camera")
                assert math.dist(before, returned) < 1e-5
                page.locator('[data-preview-action="front"]').click()
                page.locator("#catalog-preview-canvas canvas").screenshot(path=str(args.output / f'{case["id"]}-front.png'))
                page.locator('[data-preview-action="back"]').click()
                page.locator("#catalog-preview-canvas canvas").screenshot(path=str(args.output / f'{case["id"]}-back.png'))
            canvas = page.locator("#catalog-preview-canvas canvas")
            box = canvas.bounding_box()
            camera = page.evaluate("window.__catalogPreview.diagnostics().camera")
            page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
            page.mouse.down()
            page.mouse.move(box["x"] + box["width"] / 2 + 90, box["y"] + box["height"] / 2 + 15, steps=3)
            page.mouse.up()
            assert math.dist(camera, page.evaluate("window.__catalogPreview.diagnostics().camera")) > 1
            camera = page.evaluate("window.__catalogPreview.diagnostics().camera")
            page.locator('[data-preview-action="zoom-in"]').click()
            zoomed = page.evaluate("window.__catalogPreview.diagnostics().camera")
            assert math.dist(zoomed[:3], zoomed[3:]) < math.dist(camera[:3], camera[3:])
            assert page.evaluate("window.__catalogPreview.diagnostics().matrix_elements_mismatched") == 0
            canvas.focus()
            page.keyboard.press("Escape")
            expect(page.locator("#catalog-preview-dialog")).not_to_be_visible()
            expect(page.locator("#catalog-preview-canvas canvas")).to_have_count(0)
            assert page.evaluate("window.__catalogPreview.diagnostics().ready") is False
            report["cases"].append(case["id"])
        checked(f"{len(selected_cases)} selected actual models rotate and zoom with exact poses; selected 1.2x views complete a 360-degree roundtrip")

        mobile = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True, reduced_motion="reduce")
        try:
            small = mobile.new_page()
            small.on("pageerror", lambda error: report["errors"].append(str(error)))
            small.goto(urljoin(base, "ja/"), wait_until="networkidle")
            largest = max(selected_cases, key=lambda case: case["metrics"]["part_count"])
            small.locator(f'#model-{largest["character"]}').select_option(largest["id"])
            small.locator(f'[data-open-rotation="{largest["character"]}"]').tap()
            value = ready(small, largest)
            assert small.locator("#catalog-preview-canvas canvas").evaluate("(canvas) => getComputedStyle(canvas).touchAction") == "none"
            small.locator('[data-preview-action="right"]').tap()
            assert math.dist(value["camera"], small.evaluate("window.__catalogPreview.diagnostics().camera")) > 1
            assert small.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
            assert small.locator("#catalog-preview-dialog").evaluate("(dialog) => dialog.scrollWidth <= dialog.clientWidth + 1")
            small.screenshot(path=str(args.output / "largest-mobile.png"), full_page=True)
            small.locator("#catalog-preview-close").tap()
            expect(small.locator("#catalog-preview-canvas canvas")).to_have_count(0)
        finally:
            mobile.close()
        checked("largest actual model works at 390px with touch-configured rotation, tap controls and no horizontal overflow")

        first = selected_cases[0]
        manifest_url = urljoin(base, first["manifest"]["path"].lstrip("/"))
        pending = browser.new_context()
        held = []
        try:
            pending.route(manifest_url, lambda route: held.append(route))
            waiting = pending.new_page()
            waiting.goto(urljoin(base, "en/"), wait_until="networkidle")
            waiting.locator(f'#model-{first["character"]}').select_option(first["id"])
            with waiting.expect_request(manifest_url):
                waiting.locator(f'[data-open-rotation="{first["character"]}"]').click()
            expect(waiting.locator("#catalog-preview-loading")).to_be_visible()
            waiting.locator("#catalog-preview-close").click()
            assert len(held) == 1
            held[0].abort()
            pending.unroute(manifest_url)
            alternate_character = "ducky" if first["character"] != "ducky" else "mona"
            waiting.locator(f'[data-open-rotation="{alternate_character}"]').click()
            alternate = next(case for case in actual_cases if case["character"] == alternate_character)
            ready(waiting, alternate)
            expect(waiting.locator("#catalog-preview-error")).to_be_hidden()
            waiting.locator("#catalog-preview-close").click()
        finally:
            pending.close()
        checked("closing an unfinished load cancels it and cannot replace a subsequently opened character")

        model = json.loads(gzip.decompress(context.request.get(manifest_url).body()))
        broken_url = urljoin(base, model["geometry_files"][0]["path"].lstrip("/"))
        failed = browser.new_context()
        try:
            failed.route(broken_url, lambda route: route.fulfill(status=404, body=""))
            broken = failed.new_page()
            broken.goto(urljoin(base, "en/"), wait_until="networkidle")
            broken.locator(f'#model-{first["character"]}').select_option(first["id"])
            broken.locator(f'[data-open-rotation="{first["character"]}"]').click()
            expect(broken.locator("#catalog-preview-error")).to_be_visible(timeout=180000)
            expect(broken.locator("#catalog-preview-canvas")).to_have_attribute("data-model-ready", "false")
            expect(broken.locator("#catalog-preview-canvas canvas")).to_have_count(0)
            expect(broken.locator("[data-preview-action]").first).to_be_disabled()
        finally:
            failed.close()
        checked("missing actual geometry shows an explicit error rather than a proxy or stale model")
        assert not report["errors"]
    except Exception as error:
        report["failure"] = str(error)
        raise
    finally:
        (args.output / "report.json").write_text(json.dumps(report, indent=2) + "\n")
        context.close()
        browser.close()
