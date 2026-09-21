"""Check matrix readiness and real radial/bottom-up guide behavior in a fresh browser."""

import argparse
import json
from pathlib import Path
from urllib.parse import parse_qs, urljoin, urlparse

from playwright.sync_api import expect, sync_playwright
from browser_study_helpers import english, uncropped_image, play_actual_chapter
from density_comparison_evidence import verify_comparison_csv

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--url", required=True)
parser.add_argument("--browser", required=True)
parser.add_argument("--engine", choices=["chromium", "webkit"], default="chromium")
parser.add_argument("--expect-input-wait", action="store_true")
parser.add_argument("--case", action="append", help="A specific actual READY case; repeat for an incremental batch")
parser.add_argument("--skip-baseline-media", action="store_true",
                    help="For unchanged baseline assets only; the publication verifier independently checks this scope")
parser.add_argument("--output", type=Path, default=Path(".archive-work/density-browser"))
args = parser.parse_args()
base = args.url.rstrip("/") + "/"
args.output.mkdir(parents=True, exist_ok=True)
report = {"base": base, "engine": args.engine, "browser_executable": args.browser,
          "input_wait": args.expect_input_wait, "checks": [], "errors": [], "cases": [],
          "media": [], "baseline_media": [], "reference_guides": [], "reference_media": [], "display_modes": [],
          "comparison_sheets": [], "comparison_csv_rows": None}


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
            comparisons = (context.request.get(urljoin(base, catalog["comparison_sheets"]["path"].lstrip("/"))).json()
                           if catalog.get("comparison_sheets") else None)
            available = catalog["cases"] + (list(catalog.get("reference_revisions", {}).values()) if args.case else [])
            cases = [entry for entry in available if entry["state"] == "READY"
                     and (not args.case or entry["id"] in args.case)]
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
                    if comparisons and locale == "en":
                        row = next(item for item in comparisons["rows"] if item["character"] == character)
                        expect(page.locator("#matrix-comparison-archive")).to_be_visible()
                        actual_images = page.locator("#matrix-comparison-images img")
                        expect(actual_images).to_have_count(3)
                        for image, descriptor in zip(actual_images.all(), row["images"], strict=True):
                            expect(image).to_have_js_property("naturalWidth", descriptor["image_size_px"][0])
                            expect(image).to_have_js_property("naturalHeight", descriptor["image_size_px"][1])
                            uncropped_image(image)
                            report["comparison_sheets"].append(image.evaluate("(img) => img.currentSrc"))
                    baseline = catalog.get("reference_revisions", {}).get(character, catalog["baselines"][character])
                    if character in catalog.get("reference_revisions", {}):
                        distinction = page.locator(f'[data-reference-count-distinction="{character}"]')
                        expect(distinction).to_contain_text(f'{catalog["baselines"][character]["metrics"]["part_count"]:,}')
                        expect(distinction).to_contain_text(f'{baseline["metrics"]["part_count"]:,}')
                    if baseline["state"] == "READY" and locale == "en" and not args.skip_baseline_media:
                        expect(page.locator(f'[data-baseline-download="{character}"]')).to_have_attribute(
                            "href", baseline["assets"]["native_cad"][0]["url"])
                        videos = page.locator("#matrix-reference details.media-disclosure")
                        videos.locator("summary").click()
                        for chapter in ["turntable", "radial_explode", "bottom_up"]:
                            result = play_actual_chapter(page.locator(f'[data-baseline-chapter="{chapter}"]'),
                                                         baseline["assets"]["animations"][chapter])
                            report["baseline_media"].append({"character": character, "chapter": chapter, **result})
                        videos.locator("summary").click()
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
            checked("matrix character/view controls and fifteen explicit actual/pending states work in both languages")
            if comparisons:
                csv_path = comparisons["comparison_csv"]["path"]
                csv_url = urljoin(base, f"artifacts/studies/{catalog['study_id']}/{csv_path}")
                result = verify_comparison_csv(context.request.get(csv_url).body(), catalog)
                report["comparison_csv_rows"] = result["rows"]
                checked("all nine actual six-way sheets and the fifteen-row CSV preserve fixed denominators and physical-size conditions")
            for entry in cases:
                page.goto(urljoin(base, f'en/density-guide.html?case={entry["id"]}'), wait_until="domcontentloaded", timeout=120000)
                expect(page.locator("#density-canvas")).to_have_attribute("data-ready", "true", timeout=180000)
                expect(page.locator("#guide-error")).to_be_hidden()
                expect(page.locator("#density-canvas")).to_have_attribute("data-visible-parts", str(entry["metrics"]["part_count"]))
                english(page)
                if catalog.get("display_catalog") and page.locator("#guide-detail").input_value() == "light":
                    initial = page.evaluate("window.__densityGuide.diagnostics()")
                    expect(page.locator("#guide-mesh-mode")).to_contain_text("Lightweight display model")
                    page.locator("#guide-detail").select_option("native")
                    expect(page.locator("#density-canvas")).to_have_attribute("data-ready", "true", timeout=180000)
                    expect(page.locator("#density-canvas")).to_have_attribute("data-geometry-mode", "NATIVE_FLOAT32")
                    page.locator("#density-canvas canvas").screenshot(path=str(args.output / f'{entry["id"]}-original-native.png'))
                    native_view = page.evaluate("window.__densityGuide.diagnostics()")
                    page.locator("#guide-detail").select_option("light")
                    expect(page.locator("#density-canvas")).to_have_attribute("data-ready", "true", timeout=180000)
                    expect(page.locator("#density-canvas")).to_have_attribute("data-geometry-mode", "NATIVE_PREVIEW_TESSELLATION")
                    page.locator("#density-canvas canvas").screenshot(path=str(args.output / f'{entry["id"]}-display-light.png'))
                    light_view = page.evaluate("window.__densityGuide.diagnostics()")
                    assert native_view["actual_instances"] == light_view["actual_instances"] == entry["metrics"]["part_count"]
                    assert native_view["matrix_elements_mismatched"] == light_view["matrix_elements_mismatched"] == 0
                    assert all(abs(left - right) < 1e-4 for left, right in zip(initial["camera"], light_view["camera"]))
                    assert light_view["triangles"] < native_view["triangles"]
                    report["display_modes"].append({"case_id": entry["id"], "original": native_view, "lightweight": light_view})
                root_reference = entry.get("whisker_support", {}).get("assembly_validation_ref")
                if root_reference:
                    root_proof = context.request.get(urljoin(base, root_reference["path"].lstrip("/"))).json()
                    assert page.evaluate("window.__densityGuide.diagnostics().actual_aids") == 0
                    page.locator("#guide-mode").select_option("assembly")
                    expect(page.locator("#density-canvas")).to_have_attribute("data-visible-parts", "0")
                    for module in root_proof["modules"]:
                        before = module["step"] - 1
                        page.locator("#guide-step").evaluate(
                            "(input, step) => { input.value = step; input.dispatchEvent(new Event('input', {bubbles:true})); }", str(before))
                        expect(page.locator("#guide-active")).to_contain_text(module["part_id"])
                        expect(page.locator("#guide-current-course")).to_contain_text("support height")
                        expect(page.locator("#guide-current-course")).to_contain_text(str(module["receiving_body_stage_z_mm"]).removesuffix(".0"))
                        expect(page.locator("#guide-current-course")).to_contain_text(str(module["physical_bottom_z_mm"]).removesuffix(".0"))
                        page.locator('[data-guide-action="part-next"]').click()
                        expect(page.locator("#density-canvas")).to_have_attribute("data-visible-parts", str(module["step"]))
                        page.locator("#guide-search").fill(module["part_id"])
                        page.locator("#guide-parts button").first.click()
                        expect(page.locator("#guide-selection strong")).to_have_text(module["part_id"])
                        page.locator('[data-guide-action="part-bottom"]').click()
                        expect(page.locator("#guide-part-preview canvas")).to_be_visible()
                        expect(page.locator("#guide-part-preview")).to_have_attribute("data-original-native", "true")
                        native_part_sha = page.locator("#guide-part-preview").get_attribute("data-geometry-sha256")
                        assert native_part_sha and len(native_part_sha) == 64
                        page.locator("#guide-part-preview").screenshot(
                            path=str(args.output / f'{module["part_id"]}-native-underside.png'))
                        assert page.evaluate("window.__densityGuide.diagnostics().matrix_elements_mismatched") == 0
                    page.locator("#guide-search").fill("")
                    page.locator('[data-guide-action="complete"]').click()
                    checked("actual support-free root modules enter after their receivers, retain low physical origins and expose native undersides")
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
                    media_kind = "reference_media" if entry.get("kind") == "BASELINE_REFERENCE_NOT_MULTIPLIER_CASE" else "media"
                    report[media_kind].append({"case_id": entry["id"], "chapter": name, **result})
                page.screenshot(path=str(args.output / f'{entry["id"]}.png'), full_page=True)
                report["reference_guides" if entry.get("kind") == "BASELINE_REFERENCE_NOT_MULTIPLIER_CASE" else "cases"].append(entry["id"])
            checked("actual cases support radial cycling, all views, empty/part/course/full assembly, selection and shared reload")
            checked("actual Release/Pages videos decode and play every declared chapter through the page CSP")
            pending = next((entry for entry in catalog["cases"] if entry["state"] == "INPUT_WAIT"), None)
            if pending:
                page.locator("#guide-case").select_option(pending["id"])
                expect(page.locator("#density-canvas")).to_have_attribute("data-ready", "false")
                expect(page.locator("#guide-loading")).to_be_visible()
                expect(page.locator("#guide-error")).to_be_hidden()
                for selector in ["#guide-target-status", "#guide-progress", "#guide-active", "#guide-list-count"]:
                    expect(page.locator(selector)).to_have_text("")
                expect(page.locator("#guide-downloads video")).to_have_count(0)
                expect(page.locator("#guide-search")).to_be_disabled()
                assert page.evaluate("window.__densityGuide.diagnostics().ready") is False
                assert parse_qs(urlparse(page.url).query) == {"case": [pending["id"]]}
                page.locator('[data-language="en"]').click()
                page.reload(wait_until="networkidle")
                expect(page.locator("#guide-case")).to_have_value(pending["id"])
                expect(page.locator("#guide-loading")).to_be_visible()
                expect(page.locator("#guide-error")).to_be_hidden()
                expect(page.locator("#density-canvas canvas")).to_have_count(0)
                english(page)
                checked("switching from a real case to a pending revision clears old counts/media and preserves the pending JA/EN URL")
        phone_context = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True,
                                            has_touch=True, locale="ja-JP", reduced_motion="reduce")
        phone = phone_context.new_page()
        mobile_case = None if args.expect_input_wait else max(cases, key=lambda entry: entry["metrics"]["part_count"])["id"]
        report["mobile_case"] = mobile_case
        for route in ["density-matrix.html", "density-guide.html"]:
            suffix = f'?case={mobile_case}' if mobile_case and route == "density-guide.html" else ""
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
            image_selector = "#matrix-reference img" if entry.get("kind") == "BASELINE_REFERENCE_NOT_MULTIPLIER_CASE" else f'.density-card[data-case="{entry["id"]}"] img'
            failed_images = missing_image.locator(image_selector)
            assert any(image.evaluate("(img) => img.currentSrc") == image_url and image.evaluate("(img) => img.naturalWidth") == 0
                       for image in failed_images.all())
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
            root_entry = next((entry for entry in cases if entry.get("whisker_support", {}).get("assembly_validation_ref")), None)
            if root_entry:
                proof_context = browser.new_context()
                proof_page = proof_context.new_page()
                evidence = root_entry["whisker_support"]["assembly_validation_ref"]
                proof_page.route(urljoin(base, evidence["path"].lstrip("/")),
                                 lambda route: route.fulfill(status=503, body="missing actual root evidence"))
                proof_page.goto(urljoin(base, f'en/density-guide.html?case={root_entry["id"]}'), wait_until="domcontentloaded")
                expect(proof_page.locator("#guide-error")).to_be_visible()
                expect(proof_page.locator("#density-canvas")).to_have_attribute("data-ready", "false")
                expect(proof_page.locator("#density-canvas canvas")).to_have_count(0)
                english(proof_page)
                proof_context.close()
                checked("missing support-free root evidence blocks native guide loading instead of weakening sequence guards")
        assert not report["errors"], report["errors"]
    except Exception as error:
        report["failure"] = str(error)
        page.screenshot(path=str(args.output / "failure.png"), full_page=True)
        raise
    finally:
        (args.output / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
        browser.close()
