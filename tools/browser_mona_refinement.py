"""Check the independent refinement page without replacing the first Mona pilot."""

import argparse
import json
from pathlib import Path
from urllib.parse import parse_qs, urljoin, urlsplit

from playwright.sync_api import expect, sync_playwright
from browser_study_helpers import english, uncropped_image

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--url", required=True)
parser.add_argument("--browser", required=True)
parser.add_argument("--expect-input-wait", action="store_true")
parser.add_argument("--output", type=Path, default=Path(".archive-work/refinement-browser"))
args = parser.parse_args()
base = args.url.rstrip("/") + "/"
args.output.mkdir(parents=True, exist_ok=True)
report = {"base": base, "input_wait": args.expect_input_wait, "checks": [], "errors": []}


def checked(message):
    report["checks"].append(message)
    print("PASS", message, flush=True)


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path=args.browser, headless=True,
                                        args=["--no-first-run", "--disable-background-networking", "--disable-sync"])
    context = browser.new_context(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce")
    page = context.new_page()
    page.set_default_timeout(30000)
    page.on("pageerror", lambda error: report["errors"].append(str(error)))
    requests = []
    page.on("request", lambda request: requests.append(request.url))
    try:
        old = context.request.get(urljoin(base, "archive/mona-study.json")).json()
        assert old["study_id"] == "mona-likeness-360-20260921" and old["state"] == "READY"
        current = context.request.get(urljoin(base, "archive/revisions.json")).json()
        assert current["current_revision"] == "r3-8mm-20260920"
        pointer = context.request.get(urljoin(base, "archive/mona-refinement.json")).json()
        assert pointer["previous_study_unchanged"] == old["study_id"] and pointer["selection"] == "NOT_SELECTED"
        assert pointer["visual_approval"] == "PENDING" and pointer["physical_fit"] == "UNKNOWN"
        study = None
        if args.expect_input_wait:
            assert pointer["state"] == "INPUT_WAIT" and "data_url" not in pointer
        else:
            assert pointer["state"] == "READY"
            study = context.request.get(urljoin(base, pointer["data_url"].lstrip("/"))).json()
        for locale in ["ja", "en"]:
            response = page.goto(urljoin(base, f"{locale}/mona-refinement.html"), wait_until="networkidle")
            assert response.status == 200
            expect(page.locator("html")).to_have_attribute("lang", locale)
            expect(page.locator("#refine-error")).to_be_hidden()
            if args.expect_input_wait:
                expect(page.locator("#refine-pending")).to_be_visible()
                expect(page.locator("#refine-images img")).to_have_count(0)
                expect(page.locator("#refine-metrics tr")).to_have_count(0)
                expect(page.locator("#refine-controls button")).to_have_count(0)
            else:
                expect(page.locator("#refine-metrics tr")).to_have_count(3)
                expect(page.locator('[data-refinement-comparison="face-front"]')).to_have_attribute("aria-pressed", "true")
                for row in study["rows"]:
                    cells = page.locator(f'#refine-metrics tr[data-candidate="{row["candidate_id"]}"] td')
                    metrics = row["metrics"]
                    expect(cells.nth(0)).to_have_text(f'{metrics["part_count"]:,}')
                    expect(cells.nth(1)).to_have_text(f'{metrics["unique_types"]:,}')
                    expect(cells.nth(2)).to_have_text(f'{metrics["one_by_one_exceptions"]:,}')
                    expect(cells.nth(3)).to_have_text(" × ".join(f"{value:,.3f}".rstrip("0").rstrip(".") for value in metrics["dimensions_mm"]))
                    expect(cells.nth(4)).to_have_text(f'{metrics["layer_count"]:,}')
                    heights = page.locator(f'#refine-height-families [data-role="{row["role"]}"] p')
                    expected = [
                        f'Body height {family["body_height_mm"]:g} mm: {family["part_count"]:,} parts / {family["unique_types"]:,} types'
                        if locale == "en" else
                        f'本体高 {family["body_height_mm"]:g} mm：{family["part_count"]:,}部品 / {family["unique_types"]:,}型'
                        for family in metrics["body_height_families"]
                    ]
                    expect(heights).to_have_text(expected)
                refined = next(row for row in study["rows"] if row["role"] == "refined-360")
                for index, baseline in enumerate([10908, 13837]):
                    delta = refined["metrics"]["part_count"] - baseline
                    signed = ("+" if delta > 0 else "") + f"{delta:,}"
                    expect(page.locator("#refine-deltas p").nth(index)).to_contain_text(signed)
                for group in study["comparisons"]:
                    button = page.locator(f'[data-refinement-comparison="{group["id"]}"]')
                    button.focus()
                    button.press("Enter")
                    expect(button).to_have_attribute("aria-pressed", "true")
                    images = [group["sheet"]] if group["kind"] == "scale" else group["images"]
                    expect(page.locator("#refine-images img")).to_have_count(len(images))
                    for image in images:
                        visible = page.locator(f'#refine-images img[src="{urljoin(base, image["path"].lstrip("/"))}"]')
                        expect(visible).to_have_js_property("naturalWidth", image["width"])
                        expect(visible).to_have_js_property("naturalHeight", image["height"])
                        uncropped_image(visible)
                    assert parse_qs(urlsplit(page.url).query)["comparison"] == [group["id"]]
                    if locale == "en":
                        english(page)
                        page.locator("#refine-images").screenshot(path=str(args.output / f'{group["id"]}-en.png'))
                selected = study["comparisons"][-1]["id"]
                page.reload(wait_until="networkidle")
                expect(page.locator(f'[data-refinement-comparison="{selected}"]')).to_have_attribute("aria-pressed", "true")
                page.locator("#refine-images [data-lightbox]").first.click()
                expect(page.locator("#image-dialog")).to_be_visible()
                page.keyboard.press("Escape")
                other = "en" if locale == "ja" else "ja"
                page.locator(f'[data-language="{other}"]').click()
                expect(page.locator(f'[data-refinement-comparison="{selected}"]')).to_have_attribute("aria-pressed", "true")
                page.locator(f'[data-language="{locale}"]').click()
            if locale == "en":
                english(page)
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
            page.screenshot(path=str(args.output / f"refinement-{locale}.png"), full_page=True)
            checked(f"{locale}: explicit INPUT_WAIT with no new images/counts" if args.expect_input_wait else
                    f"{locale}: actual three-row quantities/heights, matched images, keyboard, language, reload and lightbox")
        assert not any(url.endswith((".blend", ".FCStd", ".stl", ".step", ".3mf")) or "prototypes.json" in url for url in requests)
        checked("no native geometry or print payload is downloaded by the comparison")
        phone_context = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True,
                                            has_touch=True, locale="ja-JP", reduced_motion="reduce")
        phone = phone_context.new_page()
        phone.goto(urljoin(base, "en/mona-refinement.html?comparison=face-front"), wait_until="networkidle")
        english(phone)
        assert phone.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
        if study:
            expect(phone.locator('[data-refinement-comparison="face-front"]')).to_have_attribute("aria-pressed", "true")
            for image in phone.locator("#refine-images img").all():
                uncropped_image(image)
        else:
            expect(phone.locator("#refine-pending")).to_be_visible()
        phone.screenshot(path=str(args.output / "refinement-mobile-en.png"), full_page=True)
        phone_context.close()
        checked("390px English share URL ignores browser locale and preserves explicit state/image ratio")
        failed_context = browser.new_context()
        failed = failed_context.new_page()
        failed.route("**/archive/mona-refinement.json", lambda route: route.fulfill(status=503, body="unavailable"))
        failed.goto(urljoin(base, "en/mona-refinement.html"), wait_until="networkidle")
        expect(failed.locator("#refine-error")).to_be_visible()
        expect(failed.locator("#refine-images img")).to_have_count(0)
        expect(failed.locator("#refine-metrics tr")).to_have_count(0)
        english(failed)
        failed_context.close()
        checked("missing refinement data never falls back to the previous pilot")
        page.goto(urljoin(base, "mona-refinement.html?comparison=invalid"), wait_until="networkidle")
        expect(page.locator("html")).to_have_attribute("lang", "ja")
        if study:
            expect(page.locator('[data-refinement-comparison="face-front"]')).to_have_attribute("aria-pressed", "true")
        checked("legacy root URL and invalid comparison state use an explicit default")
        if study:
            missing_context = browser.new_context()
            missing = missing_context.new_page()
            face = next(group for group in study["comparisons"] if group["kind"] == "face" and group["view"] == "front")
            image = next(image for image in face["images"] if image["role"] == "refined-360")
            address = urljoin(base, image["path"].lstrip("/"))
            missing.route(address, lambda route: route.fulfill(status=404, body="missing"))
            missing.goto(urljoin(base, "en/mona-refinement.html?comparison=face-front"), wait_until="networkidle")
            expect(missing.locator("#refine-error")).to_be_visible()
            expect(missing.locator(f'#refine-images img[src="{address}"]')).to_have_js_property("naturalWidth", 0)
            english(missing)
            missing_context.close()
            checked("a missing new image is reported without substituting a previous render")
        assert not report["errors"], report["errors"]
    except Exception as error:
        report["failure"] = str(error)
        page.screenshot(path=str(args.output / "failure.png"), full_page=True)
        raise
    finally:
        (args.output / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
        browser.close()
