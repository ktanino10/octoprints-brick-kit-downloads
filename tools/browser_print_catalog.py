"""Check the first-visit catalogue, actual downloads and separate design history."""

import argparse
import json
from pathlib import Path
from urllib.parse import urljoin, urlsplit

from playwright.sync_api import expect, sync_playwright
from browser_study_helpers import english, uncropped_image, published_print_cases

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--url", required=True)
parser.add_argument("--browser", required=True)
parser.add_argument("--output", type=Path, required=True)
args = parser.parse_args()
base = args.url.rstrip("/") + "/"
args.output.mkdir(parents=True, exist_ok=True)
report = {"base": base, "engine": "webkit-2203", "checks": [], "errors": [], "cases": []}


def passed(text):
    report["checks"].append(text)
    print("PASS", text, flush=True)


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
        catalogue = context.request.get(urljoin(base, pointer["catalog"]["path"].lstrip("/"))).json()
        actual_cases = published_print_cases(context.request, base, catalogue)
        for locale in ["ja", "en"]:
            for route in ["", "models.html"]:
                requested.clear()
                response = page.goto(urljoin(base, f"{locale}/{route}"), wait_until="networkidle")
                assert response.status == 200
                expect(page.locator(".print-model")).to_have_count(3)
                expect(page.locator("#print-catalog-error")).to_be_hidden()
                expect(page.locator('footer a[href="https://github.com/martinwoodward/octoprints"]')).to_have_count(1)
                expect(page.locator(".candidate-card,#current-specimens,#selected-videos,#block-size")).to_have_count(0)
                expect(page.locator("#print-status")).to_contain_text(
                    "not a ready-to-print list" if locale == "en" else "そのまま印刷OK")
                assert not any("/artifacts/revisions/" in url or "/artifacts/phase1/" in url
                               or urlsplit(url).path.endswith((".mp4", ".FCStd", ".stl", ".step", ".blend"))
                               for url in requested)
                assert all(urlsplit(url).netloc == urlsplit(base).netloc for url in requested)
                for character in ["mona", "copilot", "ducky"]:
                    card = page.locator(f'.print-model[data-character="{character}"]')
                    expect(card.locator("select option")).to_have_count(5)
                    expect(card).to_have_attribute("data-physical-status", "UNTESTED")
                    expect(card.locator(".print-model-image")).to_have_attribute("aria-busy", "false")
                    uncropped_image(card.locator("img"))
                if locale == "en":
                    english(page)
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
                page.screenshot(path=str(args.output / f'{locale}-{route or "home"}.png'), full_page=True)
            for entry in actual_cases:
                card = page.locator(f'.print-model[data-character="{entry["character"]}"]')
                card.locator("select").select_option(entry["id"])
                expect(card).to_have_attribute("data-case", entry["id"])
                expect(card.locator("img")).to_have_attribute("src", urljoin(base, entry["images"]["three_quarter"]["path"].lstrip("/")))
                expect(card.locator(".print-model-image")).to_have_attribute("aria-busy", "false")
                expect(card.locator("img")).not_to_have_js_property("naturalWidth", 0)
                expect(card.locator("[data-print-download]")).to_have_attribute("href", entry["assets"]["native_cad"][0]["url"])
                expect(card.locator("[data-print-guide]")).to_have_attribute(
                    "href", urljoin(base, f'{locale}/density-guide.html?case={entry["id"]}'))
                selected_text = card.locator("select option:checked").inner_text()
                assert f'{entry["metrics"]["part_count"]:,}' in selected_text
                if locale == "en":
                    report["cases"].append(entry["id"])
                    english(page)
            passed(f"{locale}: all fifteen real selections update images, counts, download ZIPs and assembly links without r3 promotion")
        page.locator("#model-ducky").select_option("ducky-p200")
        expect(page.locator('[data-character="ducky"] .print-model-aids')).to_contain_text("3")
        page.locator("#model-mona").select_option("mona-p400-root-v2")
        page.locator('[data-language="ja"]').click()
        expect(page.locator("#model-mona")).to_have_value("mona-p400-root-v2")
        expect(page.locator("#model-ducky")).to_have_value("ducky-p200")
        page.reload(wait_until="networkidle")
        expect(page.locator("#model-ducky")).to_have_value("ducky-p200")
        page.locator(".print-model-image").first.click()
        expect(page.locator("#image-dialog")).to_be_visible()
        expect(page.locator("#image-dialog img")).not_to_have_js_property("naturalWidth", 0)
        page.keyboard.press("Escape")
        passed("language switches and reload preserve actual selections; full-size image preview works")

        for locale in ["ja", "en"]:
            page.goto(urljoin(base, f"{locale}/history.html"), wait_until="networkidle")
            expect(page.locator("#phase1-gallery")).not_to_have_attribute("open", "")
            expect(page.locator("#low-count-r3")).to_be_visible()
            for repository in ["martinwoodward/octoprints", "mrdoob/three.js", "zeux/meshoptimizer"]:
                expect(page.locator(f'#references a[href="https://github.com/{repository}"]')).to_have_count(1)
            expect(page.locator("#candidate-matrix .candidate-card")).to_have_count(9)
            page.locator("#phase1-gallery > summary").click()
            for image in page.locator("#candidate-matrix img").all():
                image.scroll_into_view_if_needed()
                expect(image).not_to_have_js_property("naturalWidth", 0)
            if locale == "en":
                english(page)
            page.goto(urljoin(base, f"{locale}/downloads.html"), wait_until="networkidle")
            expect(page.locator("#legacy-r3-packages")).not_to_have_attribute("open", "")
            expect(page.locator("#matrix-download-title")).to_be_visible()
        passed("trial/error, original candidates and rejected low-part design records are on the separate history path")
        separate = context.request.get(urljoin(base, "archive/copilot-support-free-revision.json")).json()
        assert separate["request_id"] == "copilot-support-free-20260922"
        if separate["published_verified_case_count"] < 4:
            assert separate["state"] == "PARTIAL" and not any(separate["verification"].values())
        assert separate["previous_completed_delivery"]["satisfies_this_new_request"] is False
        symmetry = context.request.get(urljoin(base, "archive/copilot-symmetry-revision.json")).json()
        assert symmetry["request_id"] == "copilot-symmetry-20260923"
        assert symmetry["previous_completed_delivery"]["satisfies_this_new_request"] is False
        if symmetry["published_verified_case_count"] == 0:
            assert symmetry["state"] == "PARTIAL" and not any(symmetry["verification"].values())
            page.goto(urljoin(base, "en/"), wait_until="networkidle")
            expect(page.locator('[data-symmetry-review="copilot"]')).to_be_visible()
            expect(page.locator('[data-symmetry-review="copilot"]')).to_contain_text("selected download is the earlier asymmetric version")
            expect(page.locator('[data-symmetry-review="mona"]')).to_be_hidden()
            expect(page.locator('[data-symmetry-review="ducky"]')).to_be_hidden()
            english(page)
            page.goto(urljoin(base, "en/history.html#copilot-symmetry"), wait_until="networkidle")
            expect(page.locator("#copilot-symmetry")).to_be_visible()
            english(page)
        licenses = context.request.get(urljoin(base, "viewer/assets/THIRD_PARTY_LICENSES.txt"))
        assert licenses.status == 200 and "meshoptimizer 1.2.0 (MIT)" in licenses.text()
        assert "three 0.180.0 (MIT)" in licenses.text()
        passed("visible upstream/software credits and the separate support-free request do not overstate printing or revision completion")

        page.set_viewport_size({"width": 390, "height": 844})
        page.goto(urljoin(base, "en/"), wait_until="networkidle")
        expect(page.locator(".print-model")).to_have_count(3)
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
        boxes = [card.bounding_box() for card in page.locator(".print-model").all()]
        assert all(abs(box["x"] - boxes[0]["x"]) < 1 for box in boxes)
        assert boxes[1]["y"] > boxes[0]["y"] + boxes[0]["height"]
        assert all(control.bounding_box()["height"] >= 44 for control in page.locator(".print-model select").all())
        page.locator("#model-ducky").select_option("ducky-p400")
        expect(page.locator('[data-character="ducky"] .print-model-aids')).to_contain_text("1")
        english(page)
        page.screenshot(path=str(args.output / "mobile-390.png"), full_page=True)
        passed("390px catalogue uses readable single-column cards with working size selection")

        failures = browser.new_context(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce")
        try:
            failures.route("**/archive/block-budget-matrix.json",
                           lambda route: route.fulfill(status=503, content_type="application/json", body="{}"))
            broken = failures.new_page()
            broken.goto(urljoin(base, "en/"), wait_until="networkidle")
            expect(broken.locator("#print-catalog-error")).to_be_visible()
            expect(broken.locator(".print-model,#current-specimens")).to_have_count(0)
        finally:
            failures.close()
        missing_image = browser.new_context(viewport={"width": 1440, "height": 1000})
        try:
            first = next(item for item in actual_cases if item["character"] == "mona" and item["count_percentage"] == 120)
            address = urljoin(base, first["images"]["three_quarter"]["path"].lstrip("/"))
            missing_image.route(address, lambda route: route.fulfill(status=404, body=""))
            broken = missing_image.new_page()
            broken.goto(urljoin(base, "en/"), wait_until="networkidle")
            expect(broken.locator("#print-catalog-error")).to_be_visible()
            expect(broken.locator('[data-character="mona"] .model-image-loading')).to_have_text("Actual image unavailable")
            expect(broken.locator('[data-character="mona"] img')).to_have_attribute("src", address)
            expect(broken.locator('[data-character="mona"] img')).not_to_be_visible()
        finally:
            missing_image.close()
        page.goto(urljoin(base, "en/?mona=mona-common"), wait_until="networkidle")
        expect(page.locator("#print-catalog-error")).to_be_visible()
        expect(page.locator(".print-model")).to_have_count(0)
        passed("missing verification or a rejected legacy selection fails explicitly without substitute models")
        assert not report["errors"]
    except Exception as error:
        report["failure"] = str(error)
        raise
    finally:
        (args.output / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
        context.close()
        browser.close()
