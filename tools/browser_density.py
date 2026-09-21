"""Check matrix readiness and real radial/bottom-up guide behavior in a fresh browser."""

import argparse
import json
from pathlib import Path
from urllib.parse import urljoin

from playwright.sync_api import expect, sync_playwright
from browser_study_helpers import english, uncropped_image, play_actual_chapter

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--url", required=True)
parser.add_argument("--browser", required=True)
parser.add_argument("--engine", choices=["chromium", "webkit"], default="chromium")
parser.add_argument("--expect-input-wait", action="store_true")
parser.add_argument("--case", help="A specific actual READY case for incremental acceptance")
parser.add_argument("--output", type=Path, default=Path(".archive-work/density-browser"))
args = parser.parse_args()
base = args.url.rstrip("/") + "/"
args.output.mkdir(parents=True, exist_ok=True)
report = {"base": base, "engine": args.engine, "browser_executable": args.browser,
          "input_wait": args.expect_input_wait, "checks": [], "errors": [], "cases": [],
          "media": [], "baseline_media": []}


def checked(message):
    report["checks"].append(message)
    print("PASS", message, flush=True)


with sync_playwright() as playwright:
    launch = {"executable_path": args.browser, "headless": True, "timeout": 60000}
    if args.engine == "chromium":
        launch["args"] = ["--no-first-run", "--disable-background-networking", "--disable-sync"]
    browser = getattr(playwright, args.engine).launch(**launch)
    context = browser.new_context(viewport={"width": 1440, "height": 1050}, reduced_motion="reduce")
    page = context.new_page()
    page.set_default_timeout(60000)
    page.set_default_navigation_timeout(90000)
    page.on("pageerror", lambda error: report["errors"].append(str(error)))
    try:
        print("Checking explicit matrix publication record.", flush=True)
        pointer = context.request.get(urljoin(base, "archive/density-study.json")).json()
        receipt = context.request.get(urljoin(base, "archive/block-budget-matrix.json")).json()
        current = context.request.get(urljoin(base, "archive/revisions.json")).json()
        assert current["current_revision"] == "r3-8mm-20260920"
        if args.expect_input_wait:
            assert pointer["state"] == "INPUT_WAIT" and receipt["state"] == "INPUT_WAIT"
            assert not receipt["cases"] and not any(receipt["verification"].values())
            for locale in ["ja", "en"]:
                for route in ["density-matrix.html", "density-guide.html"]:
                    response = page.goto(urljoin(base, f"{locale}/{route}"), wait_until="networkidle")
                    assert response.status == 200
                    expect(page.locator("html")).to_have_attribute("lang", locale)
                    if route == "density-matrix.html":
                        expect(page.locator("#matrix-pending")).to_be_visible()
                        expect(page.locator("#matrix-cards img")).to_have_count(0)
                        expect(page.locator("#matrix-table tr")).to_have_count(0)
                    else:
                        expect(page.locator("#density-canvas canvas")).to_have_count(0)
                        expect(page.locator("#guide-mode")).to_be_disabled()
                        expect(page.locator("#guide-loading")).to_be_visible()
                        expect(page.locator("#guide-error")).to_be_hidden()
                    if locale == "en":
                        english(page)
                    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
            checked("JA/EN pending matrix and guide contain no fabricated cases, geometry or success flags")
        else:
            assert pointer["state"] in ["PARTIAL", "READY"]
            catalog = context.request.get(urljoin(base, pointer["catalog"]["path"].lstrip("/"))).json()
            cases = [entry for entry in catalog["cases"] if entry["state"] == "READY"
                     and (not args.case or entry["id"] == args.case)]
            assert cases
            for locale in ["ja", "en"]:
                page.goto(urljoin(base, f"{locale}/density-matrix.html"), wait_until="networkidle")
                expect(page.locator("#matrix-results")).to_be_visible()
                expect(page.locator("#matrix-table tr")).to_have_count(15)
                if locale == "en":
                    english(page)
                for character in ["mona", "copilot", "ducky"]:
                    page.locator(f'[data-density-character="{character}"]').click()
                    for view in ["front", "three_quarter"]:
                        page.locator(f'[data-density-view="{view}"]').click()
                        for image in page.locator("#matrix-cards img").all():
                            expect(image).not_to_have_js_property("naturalWidth", 0)
                            uncropped_image(image)
                    baseline = catalog["baselines"][character]
                    if baseline["state"] == "READY" and locale == "en":
                        expect(page.locator(f'[data-baseline-download="{character}"]')).to_have_attribute(
                            "href", baseline["assets"]["native_cad"][0]["url"])
                        videos = page.locator("#matrix-reference details")
                        videos.locator("summary").click()
                        for chapter in ["turntable", "radial_explode", "bottom_up"]:
                            result = play_actual_chapter(page.locator(f'[data-baseline-chapter="{chapter}"]'),
                                                         baseline["assets"]["animations"][chapter])
                            report["baseline_media"].append({"character": character, "chapter": chapter, **result})
                        videos.locator("summary").click()
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
            checked("matrix character/view controls and fifteen explicit actual/pending states work in both languages")
            for entry in cases:
                page.goto(urljoin(base, f'en/density-guide.html?case={entry["id"]}'), wait_until="domcontentloaded", timeout=120000)
                expect(page.locator("#density-canvas")).to_have_attribute("data-ready", "true", timeout=180000)
                expect(page.locator("#guide-error")).to_be_hidden()
                expect(page.locator("#density-canvas")).to_have_attribute("data-visible-parts", str(entry["metrics"]["part_count"]))
                english(page)
                page.locator("#guide-mode").select_option("radial")
                for value in ["100", "0", "100", "0"]:
                    page.locator("#guide-explode").evaluate("(input, value) => { input.value = value; input.dispatchEvent(new Event('input', {bubbles:true})); }", value)
                    expect(page.locator("#density-canvas")).to_have_attribute("data-explosion", str(int(value) / 100).removesuffix(".0"))
                    diagnostics = page.evaluate("window.__densityGuide.diagnostics()")
                    assert diagnostics["actual_instances"] == entry["metrics"]["part_count"]
                    assert diagnostics["matrix_elements_mismatched"] == 0
                for view in ["front", "back", "left", "right", "underside"]:
                    page.locator(f'[data-guide-action="view:{view}"]').click()
                page.locator("#guide-mode").select_option("assembly")
                expect(page.locator("#density-canvas")).to_have_attribute("data-visible-parts", "0")
                page.locator('[data-guide-action="part-next"]').click()
                expect(page.locator("#density-canvas")).to_have_attribute("data-visible-parts", "1")
                page.locator('[data-guide-action="course-next"]').click()
                assert int(page.locator("#density-canvas").get_attribute("data-visible-parts")) > 1
                page.locator('[data-guide-action="complete"]').click()
                expect(page.locator("#density-canvas")).to_have_attribute("data-visible-parts", str(entry["metrics"]["part_count"]))
                assert page.evaluate("window.__densityGuide.diagnostics().matrix_elements_mismatched") == 0
                page.locator('[data-guide-action="view:front"]').click()
                canvas = page.locator("#density-canvas canvas")
                box = canvas.bounding_box()
                canvas.click(position={"x": box["width"] / 2, "y": box["height"] / 2})
                expect(page.locator("#guide-selection strong")).to_be_visible()
                page.locator("#guide-parts button").first.click()
                selected = page.locator("#guide-selection strong").inner_text()
                expect(page.locator("#guide-part-preview canvas")).to_be_visible()
                page.locator('[data-guide-action="part-bottom"]').click()
                page.locator("#guide-same").check()
                page.locator("#guide-search").fill(selected)
                expect(page.locator("#guide-parts tr")).to_have_count(1)
                page.locator('[data-language="ja"]').click()
                expect(page.locator("#guide-selection strong")).to_have_text(selected)
                page.reload(wait_until="domcontentloaded")
                expect(page.locator("#density-canvas")).to_have_attribute("data-ready", "true", timeout=180000)
                expect(page.locator("#guide-selection strong")).to_have_text(selected)
                for position, name in enumerate(["turntable", "radial_explode", "bottom_up"]):
                    clip = entry["assets"]["animations"][name]
                    video = page.locator("#guide-downloads video").nth(position)
                    result = play_actual_chapter(video, clip)
                    report["media"].append({"case_id": entry["id"], "chapter": name, **result})
                page.screenshot(path=str(args.output / f'{entry["id"]}.png'), full_page=True)
                report["cases"].append(entry["id"])
            checked("actual cases support radial cycling, all views, empty/part/course/full assembly, selection and shared reload")
            checked("actual Release/Pages videos decode and play every declared chapter through the page CSP")
        phone_context = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True,
                                            has_touch=True, locale="ja-JP", reduced_motion="reduce")
        phone = phone_context.new_page()
        for route in ["density-matrix.html", "density-guide.html"]:
            suffix = f'?case={args.case}' if args.case and route == "density-guide.html" else ""
            phone.goto(urljoin(base, f"en/{route}{suffix}"), wait_until="domcontentloaded")
            if not args.expect_input_wait and route == "density-guide.html":
                expect(phone.locator("#density-canvas")).to_have_attribute("data-ready", "true", timeout=180000)
            english(phone)
            assert phone.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
            phone.screenshot(path=str(args.output / f'mobile-{route}.png'), full_page=True)
        phone_context.close()
        checked("390px direct English pages ignore browser language and stay within the viewport")
        failed_context = browser.new_context()
        failed = failed_context.new_page()
        failed.route("**/archive/density-study.json", lambda route: route.fulfill(status=503, body="unavailable"))
        for route, error in [("density-matrix.html", "#matrix-error"), ("density-guide.html", "#guide-error")]:
            failed.goto(urljoin(base, "en/" + route), wait_until="networkidle")
            expect(failed.locator(error)).to_be_visible()
            english(failed)
        failed_context.close()
        checked("missing matrix/guide data is an explicit localized error, not an earlier-model fallback")
        if not args.expect_input_wait:
            entry = cases[0]
            missing_image_context = browser.new_context()
            missing_image = missing_image_context.new_page()
            image_url = urljoin(base, entry["images"]["front"]["path"].lstrip("/"))
            missing_image.route(image_url, lambda route: route.fulfill(status=404, body="missing actual image"))
            missing_image.goto(urljoin(base, f'en/density-matrix.html?character={entry["character"]}&view=front'),
                               wait_until="networkidle")
            expect(missing_image.locator("#matrix-error")).to_be_visible()
            expect(missing_image.locator(f'.density-card[data-case="{entry["id"]}"] img')).to_have_js_property("naturalWidth", 0)
            english(missing_image)
            missing_image_context.close()
            broken_geometry_context = browser.new_context()
            broken_geometry = broken_geometry_context.new_page()
            broken_geometry.route("**/geometry/*.mesh.gz",
                                  lambda route: route.fulfill(status=503, body="missing actual native geometry"))
            broken_geometry.goto(urljoin(base, f'en/density-guide.html?case={entry["id"]}'), wait_until="domcontentloaded")
            expect(broken_geometry.locator("#guide-error")).to_be_visible(timeout=60000)
            expect(broken_geometry.locator("#density-canvas")).to_have_attribute("data-ready", "false")
            expect(broken_geometry.locator("#density-canvas canvas")).to_have_count(0)
            expect(broken_geometry.locator("#guide-mode")).to_be_disabled()
            english(broken_geometry)
            broken_geometry_context.close()
            checked("failed actual images or native meshes show explicit errors without replacement geometry")
        assert not report["errors"], report["errors"]
    except Exception as error:
        report["failure"] = str(error)
        page.screenshot(path=str(args.output / "failure.png"), full_page=True)
        raise
    finally:
        (args.output / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
        browser.close()
