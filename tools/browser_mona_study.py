"""Check real or explicitly pending Mona evidence, language state and distinct comparison scales."""

import argparse
import json
from pathlib import Path
from urllib.parse import parse_qs, urljoin, urlsplit

from playwright.sync_api import expect, sync_playwright

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--url", required=True)
parser.add_argument("--browser", required=True)
parser.add_argument("--expect-input-wait", action="store_true")
parser.add_argument("--output", type=Path, default=Path(".archive-work/mona-browser"))
args = parser.parse_args()
base = args.url.rstrip("/") + "/"
args.output.mkdir(parents=True, exist_ok=True)
report = {"base": base, "input_wait": args.expect_input_wait, "checks": [], "errors": []}


def checked(message):
    report["checks"].append(message)
    print("PASS", message, flush=True)


def english(page):
    expect(page.locator("html")).to_have_attribute("lang", "en")
    page.wait_for_timeout(120)
    state = page.evaluate("""() => {
      const jp = /[\\u3040-\\u30ff\\u3400-\\u9fff]/, remaining = [];
      const ignore = e => e.closest('script,style,noscript,code,[data-i18n-ignore]');
      const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walker.nextNode())) if (!ignore(n.parentElement) && jp.test(n.nodeValue)) remaining.push(n.nodeValue.trim());
      for (const e of document.querySelectorAll('[alt],[aria-label],[title]')) if (!ignore(e)) {
        for (const a of ['alt','aria-label','title']) if (jp.test(e.getAttribute(a) || '')) remaining.push(e.getAttribute(a));
      }
      return {remaining: remaining.slice(0,20), missing: window.__archiveI18n?.missing || []};
    }""")
    assert not state["remaining"] and not state["missing"], state


def uncropped_parts_diagram(page):
    image = page.locator("#mona-interface img")
    expect(image).not_to_have_js_property("naturalWidth", 0)
    measurements = image.evaluate("""img => {
      const box = img.getBoundingClientRect(), style = getComputedStyle(img);
      return {height: box.height, expected: box.width * img.naturalHeight / img.naturalWidth, fit: style.objectFit};
    }""")
    assert abs(measurements["height"] - measurements["expected"]) <= 1, measurements
    assert measurements["fit"] == "contain", measurements


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
        current = context.request.get(urljoin(base, "archive/revisions.json")).json()
        assert current["current_revision"] == "r3-8mm-20260920"
        previous = context.request.get(urljoin(base, "archive/shape-study.json")).json()
        assert previous["study_id"] == "shape-study-20260920" and previous["state"] == "READY"
        pointer = context.request.get(urljoin(base, "archive/mona-study.json")).json()
        assert pointer["selection"] == "NOT_SELECTED" and pointer["visual_approval"] == "PENDING"
        assert pointer["physical_fit"] == "UNKNOWN" and pointer["full_print"] == "ON_HOLD"
        study = None
        if args.expect_input_wait:
            assert pointer["state"] == "INPUT_WAIT" and "data_url" not in pointer
        else:
            assert pointer["state"] == "READY"
            study = context.request.get(urljoin(base, pointer["data_url"].lstrip("/"))).json()
        for locale in ["ja", "en"]:
            response = page.goto(urljoin(base, f"{locale}/mona-likeness.html"), wait_until="networkidle")
            assert response.status == 200
            expect(page.locator("html")).to_have_attribute("lang", locale)
            expect(page.locator("#mona-error")).to_be_hidden()
            if args.expect_input_wait:
                expect(page.locator("#mona-pending")).to_be_visible()
                expect(page.locator("#mona-images img")).to_have_count(0)
                expect(page.locator("#mona-metrics tr")).to_have_count(0)
                expect(page.locator("#mona-controls button")).to_have_count(0)
            else:
                expect(page.locator("#mona-metrics tr")).to_have_count(4)
                for row in study["rows"]:
                    cells = page.locator(f'#mona-metrics tr[data-candidate="{row["candidate_id"]}"] td')
                    if row["role"] == "original":
                        expect(cells.nth(0)).to_have_text("Not applicable (unsubdivided)" if locale == "en" else "対象外（無分割）")
                    else:
                        expect(cells.nth(0)).to_have_text(f'{row["metrics"]["part_count"]:,}')
                        expect(cells.nth(1)).to_have_text(f'{row["metrics"]["unique_types"]:,}')
                        expect(cells.nth(2)).to_have_text(f'{row["metrics"]["one_by_one_exceptions"]:,}')
                        expect(cells.nth(4)).to_have_text(f'{row["metrics"]["layer_count"]:,}')
                        expect(cells.nth(6)).to_have_text(f'{row["metrics"]["grip_long_ge_15_8_count"]:,}')
                    expected_size = " × ".join(f"{value:,.3f}".rstrip("0").rstrip(".") for value in row["metrics"]["dimensions_mm"])
                    expect(cells.nth(3)).to_have_text(expected_size)
                expect(page.locator("#mona-sampling")).to_contain_text(f'{study["fidelity_sampling"]["pilot_cell_count"]:,}')
                expect(page.locator("#mona-layer-note")).not_to_be_empty()
                uncropped_parts_diagram(page)
                for group in study["comparisons"]:
                    button = page.locator(f'[data-mona-comparison="{group["id"]}"]')
                    button.focus()
                    button.press("Enter")
                    expect(button).to_have_attribute("aria-pressed", "true")
                    expected_images = [group["sheet"]] if group["kind"] == "scale" else group["images"]
                    expect(page.locator("#mona-images img")).to_have_count(len(expected_images))
                    for image in expected_images:
                        visible = page.locator(f'#mona-images img[src="{urljoin(base, image["path"].lstrip("/"))}"]')
                        expect(visible).not_to_have_js_property("naturalWidth", 0)
                        expect(visible).to_have_js_property("naturalWidth", image["width"])
                        expect(visible).to_have_js_property("naturalHeight", image["height"])
                    if group["kind"] != "scale":
                        heights = page.locator("#mona-images img").evaluate_all("(images) => images.map(e => e.getBoundingClientRect().height)")
                        assert max(heights) - min(heights) <= 1
                    assert parse_qs(urlsplit(page.url).query)["comparison"] == [group["id"]]
                    if locale == "en":
                        english(page)
                        page.locator("#mona-images").screenshot(path=str(args.output / f'{group["id"]}-en.png'))
                page.reload(wait_until="networkidle")
                selected = study["comparisons"][-1]["id"]
                expect(page.locator(f'[data-mona-comparison="{selected}"]')).to_have_attribute("aria-pressed", "true")
                page.locator("#mona-images [data-lightbox]").first.click()
                expect(page.locator("#image-dialog")).to_be_visible()
                page.keyboard.press("Escape")
                other = "en" if locale == "ja" else "ja"
                page.locator(f'[data-language="{other}"]').click()
                expect(page.locator(f'[data-mona-comparison="{selected}"]')).to_have_attribute("aria-pressed", "true")
                page.locator(f'[data-language="{locale}"]').click()
                page.reload(wait_until="networkidle")
                expect(page.locator(f'[data-mona-comparison="{selected}"]')).to_have_attribute("aria-pressed", "true")
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
            if locale == "en":
                english(page)
            page.screenshot(path=str(args.output / f"mona-{locale}.png"), full_page=True)
            checked(f"{locale}: explicit INPUT_WAIT, no new images/counts/controls and no overflow"
                    if args.expect_input_wait else
                    f"{locale}: actual quantities, original N/A, separate comparison modes, lightbox and language state")
        assert not any(url.endswith((".blend", ".FCStd", ".stl", ".step", ".3mf")) or "prototypes.json" in url for url in requests)
        checked("Mona comparison requests no native CAD, large mesh, trial or print payload")
        phone_context = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True,
                                            has_touch=True, reduced_motion="reduce", locale="ja-JP")
        phone = phone_context.new_page()
        group_id = study["comparisons"][-1]["id"] if study else "scale-front"
        phone.goto(urljoin(base, f"en/mona-likeness.html?comparison={group_id}"), wait_until="networkidle")
        english(phone)
        assert phone.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
        if study:
            expect(phone.locator(f'[data-mona-comparison="{group_id}"]')).to_have_attribute("aria-pressed", "true")
            uncropped_parts_diagram(phone)
        else:
            expect(phone.locator("#mona-pending")).to_be_visible()
        phone.screenshot(path=str(args.output / "mona-mobile-en.png"), full_page=True)
        phone_context.close()
        checked("390px direct English URL keeps the pending state without invented comparison data"
                if args.expect_input_wait else
                "390px direct English URL preserves the comparison and ignores the browser locale")
        page.goto(urljoin(base, "mona-likeness.html?comparison=invalid"), wait_until="networkidle")
        expect(page.locator("html")).to_have_attribute("lang", "ja")
        if study:
            assert parse_qs(urlsplit(page.url).query)["comparison"] == [
                next(group["id"] for group in study["comparisons"] if group["kind"] == "shape" and group["view"] == "front")]
        checked("legacy root route and invalid comparison identifiers use explicit safe defaults")
        failure = browser.new_context()
        failed = failure.new_page()
        failed.route("**/archive/mona-study.json", lambda route: route.fulfill(status=503, body="unavailable"))
        failed.goto(urljoin(base, "en/mona-likeness.html"), wait_until="networkidle")
        expect(failed.locator("#mona-error")).to_be_visible()
        expect(failed.locator("#mona-images img")).to_have_count(0)
        expect(failed.locator("#mona-metrics tr")).to_have_count(0)
        english(failed)
        failure.close()
        checked("missing Mona data is an explicit error, never a scaled r3 proxy or invented count")
        if study:
            missing_context = browser.new_context()
            missing = missing_context.new_page()
            group = next(group for group in study["comparisons"] if group["kind"] == "shape" and group["view"] == "front")
            image = next(image for image in group["images"] if image["role"] == "pilot-360")
            image_url = urljoin(base, image["path"].lstrip("/"))
            missing.route(image_url, lambda route: route.fulfill(status=404, body="missing"))
            missing.goto(urljoin(base, "en/mona-likeness.html"), wait_until="networkidle")
            expect(missing.locator("#mona-error")).to_be_visible()
            expect(missing.locator(f'img[src="{image_url}"]')).to_have_js_property("naturalWidth", 0)
            english(missing)
            missing_context.close()
            checked("a missing actual pilot image is not replaced by a historical model")
        assert not report["errors"], report["errors"]
    except Exception as error:
        report["failure"] = str(error)
        page.screenshot(path=str(args.output / "failure.png"), full_page=True)
        raise
    finally:
        (args.output / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
        browser.close()
