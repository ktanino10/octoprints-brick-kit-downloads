"""Verify the display-only Rubber Ducky correction without renaming actual IDs or artifacts."""

import argparse
import json
from pathlib import Path
from urllib.parse import urljoin

from playwright.sync_api import expect, sync_playwright
from browser_study_helpers import english

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--url", required=True)
parser.add_argument("--browser", required=True)
parser.add_argument("--output", type=Path, required=True)
args = parser.parse_args()
base = args.url.rstrip("/") + "/"
args.output.mkdir(parents=True, exist_ok=True)
report = {"base": base, "display_name": "Rubber Ducky", "slug": "ducky", "errors": [], "checks": []}
expect.set_options(timeout=60000)


def checked(text):
    report["checks"].append(text)
    print("PASS", text, flush=True)


def no_overflow(page):
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
    assert "Rubber Rubber Ducky" not in page.locator("body").inner_text()


with sync_playwright() as p:
    browser = p.webkit.launch(executable_path=args.browser, headless=True, timeout=60000)
    context = browser.new_context(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce")
    page = context.new_page()
    page.set_default_timeout(90000)
    page.on("pageerror", lambda error: report["errors"].append(str(error)))
    try:
        pointer = context.request.get(urljoin(base, "archive/density-study.json")).json()
        catalog = context.request.get(urljoin(base, pointer["catalog"]["path"].lstrip("/"))).json()
        cases = [case for case in catalog["cases"] if case["character"] == "ducky"]
        assert [case["metrics"]["part_count"] for case in cases] == [11586, 14460, 19309, 28932, 38473]
        for locale in ["ja", "en"]:
            page.goto(urljoin(base, f"{locale}/?ducky=ducky-p120"), wait_until="networkidle")
            card = page.locator('.print-model[data-character="ducky"]')
            expect(card.locator("h2")).to_have_text("Rubber Ducky")
            expect(card.locator("[data-open-rotation]")).to_have_attribute("aria-label", (
                "Rubber Duckyを360度回転して見る" if locale == "ja" else "Rotate Rubber Ducky in 360 degrees"))
            for case in cases:
                card.locator("select").select_option(case["id"])
                expect(card).to_have_attribute("data-case", case["id"])
                expect(card.locator("img")).to_have_attribute("alt", (
                    f'Rubber Ducky・{case["metrics"]["part_count"]:,}部品の実モデル' if locale == "ja"
                    else f'Actual Rubber Ducky model with {case["metrics"]["part_count"]:,} parts'))
                expect(card.locator("[data-print-download]")).to_have_attribute("href", case["assets"]["native_cad"][0]["url"])
                expect(card.locator("[data-print-guide]")).to_have_attribute("href",
                    urljoin(base, f'{locale}/density-guide.html?case={case["id"]}'))
            if locale == "en":
                english(page)
            no_overflow(page)
            page.goto(urljoin(base, f"{locale}/density-matrix.html?character=ducky"), wait_until="networkidle")
            expect(page.locator('[data-density-character="ducky"]')).to_have_text("Rubber Ducky")
            expect(page.locator("#matrix-character")).to_have_text("Rubber Ducky")
            for case in cases:
                expect(page.locator(f'#matrix-table tr[data-case="{case["id"]}"] th')).to_contain_text("Rubber Ducky")
            expect(page.locator("#matrix-reference h3").first).to_contain_text("Rubber Ducky")
            no_overflow(page)
            page.goto(urljoin(base, f"{locale}/density-guide.html?case=ducky-p120"), wait_until="domcontentloaded")
            expect(page.locator("#density-canvas")).to_have_attribute("data-ready", "true", timeout=180000)
            expect(page.locator("#density-canvas")).to_have_attribute("data-visible-parts", "11586")
            for case in cases:
                expect(page.locator(f'#guide-case option[value="{case["id"]}"]')).to_contain_text("Rubber Ducky")
            page.locator("#guide-search").fill("DUCKY-P120-")
            part = page.locator("#guide-parts button").first
            assert "DUCKY-P120-" in part.inner_text()
            part.click()
            expect(page.locator("#guide-selection strong")).to_contain_text("DUCKY-P120-")
            if locale == "en":
                english(page)
            no_overflow(page)
            checked(f"{locale}: five Rubber Ducky variants retain exact case IDs, counts, images and download/guide URLs")
        page.set_viewport_size({"width": 390, "height": 844})
        for route in ["en/?ducky=ducky-p400", "ja/density-matrix.html?character=ducky"]:
            page.goto(urljoin(base, route), wait_until="networkidle")
            no_overflow(page)
            if "density-matrix" in route:
                expect(page.locator('[data-density-character="ducky"]')).to_have_text("Rubber Ducky")
            else:
                expect(page.locator('[data-character="ducky"] h2')).to_have_text("Rubber Ducky")
            page.screenshot(path=str(args.output / ("mobile-matrix.png" if "density-matrix" in route else "mobile-catalogue.png")), full_page=True)
        checked("390px long display name stays readable without horizontal overflow or double prefixes")
        assert not report["errors"]
    except Exception as error:
        report["failure"] = str(error)
        raise
    finally:
        (args.output / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
        context.close()
        browser.close()
