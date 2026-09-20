"""Check independent JA/EN shape comparisons without altering or replacing adopted r3."""

import argparse
import json
from pathlib import Path
from urllib.parse import parse_qs, urljoin, urlsplit

from playwright.sync_api import sync_playwright, expect

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--url", required=True)
parser.add_argument("--browser", required=True)
parser.add_argument("--expect-input-wait", action="store_true")
parser.add_argument("--output", type=Path, default=Path(".archive-work/shape-browser"))
args = parser.parse_args()
base = args.url.rstrip("/") + "/"
args.output.mkdir(parents=True, exist_ok=True)
report = {"base": base, "input_wait": args.expect_input_wait, "checks": [], "errors": []}


def checked(text):
    report["checks"].append(text)
    print("PASS", text, flush=True)


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
        publication = context.request.get(urljoin(base, "archive/revisions.json")).json()
        assert publication["current_revision"] == "r3-8mm-20260920"
        pointer = context.request.get(urljoin(base, "archive/shape-study.json")).json()
        assert pointer["selection"] == "UNSELECTED"
        study = None
        if not args.expect_input_wait:
            assert pointer["state"] == "READY"
            study = context.request.get(urljoin(base, pointer["data_url"].lstrip("/"))).json()
            assert len(study["rows"]) == 9
        for locale in ["ja", "en"]:
            response = page.goto(urljoin(base, f"{locale}/shape-options.html"), wait_until="networkidle", timeout=90000)
            assert response.status == 200
            expect(page.locator("html")).to_have_attribute("lang", locale)
            expect(page.locator("#study-error")).to_be_hidden()
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
            if args.expect_input_wait:
                expect(page.locator("#study-pending")).to_be_visible()
                expect(page.locator("#study-cards img")).to_have_count(0)
                expect(page.locator("#study-table tr")).to_have_count(0)
                expect(page.locator('[data-study-character="mona"]')).to_be_disabled()
            else:
                expect(page.locator("#study-table tr")).to_have_count(9)
                for row in study["rows"]:
                    cells = page.locator(f'#study-table tr[data-candidate="{row["candidate_id"]}"] td')
                    baseline = {"mona": 519, "copilot": 695, "ducky": 413}[row["character"]]
                    delta = row["metrics"]["part_count"] - baseline
                    expect(cells).to_have_text([
                        f'{row["metrics"]["part_count"]:,}', f'+{delta}' if delta > 0 else str(delta),
                        str(row["metrics"]["unique_types"]), str(row["metrics"]["small_part_count"]),
                        f'{row["metrics"]["dimensions_mm"][2]:g}',
                    ])
                for character in ["mona", "copilot", "ducky"]:
                    page.locator(f'[data-study-character="{character}"]').click()
                    for view in ["perspective", "front"]:
                        page.locator(f'[data-study-view="{view}"]').focus()
                        page.locator(f'[data-study-view="{view}"]').press("Enter")
                        expect(page.locator(".study-card")).to_have_count(3)
                        for row in [row for row in study["rows"] if row["character"] == character]:
                            card = page.locator(f'.study-card[data-candidate="{row["candidate_id"]}"]')
                            expect(card.locator(".count strong")).to_have_text(f'{row["metrics"]["part_count"]:,}')
                            expect(card.locator("img")).not_to_have_js_property("naturalWidth", 0)
                            assert row["images"][view]["path"].lstrip("/") in card.locator("img").get_attribute("src")
                            metrics = row["metrics"]
                            facts = card.locator(".study-facts dd")
                            expect(facts.nth(0)).to_have_text(str(metrics["unique_types"]))
                            expect(facts.nth(1)).to_have_text(f'{metrics["plate_parts"]} / {metrics["assembly_step_count"]}')
                            expect(facts.nth(3)).to_have_text(" / ".join(f"{value:g}" for value in metrics["minimum_part_mm"]) + " mm")
                            expect(facts.nth(4)).to_have_text(" × ".join(f"{value:g}" for value in metrics["dimensions_mm"]))
                            for key in ["manifest_sha256", "bom_sha256", "native_geometry_sha256"]:
                                expect(card.locator(".study-evidence")).to_contain_text(row["evidence"][key])
                        assert parse_qs(urlsplit(page.url).query) == {"character": [character], "view": [view]}
                        if locale == "en":
                            english(page)
                            page.locator("#study-cards").screenshot(path=str(args.output / f"{character}-{view}-en.png"))
                page.reload(wait_until="networkidle")
                expect(page.locator('[data-study-character="ducky"]')).to_have_attribute("aria-pressed", "true")
                expect(page.locator('[data-study-view="front"]')).to_have_attribute("aria-pressed", "true")
                page.locator('.study-card[data-variant="plate-refined"] [data-lightbox]').click()
                expect(page.locator("#image-dialog")).to_be_visible()
                expect(page.locator("#image-dialog img")).not_to_have_js_property("naturalWidth", 0)
                page.keyboard.press("Escape")
                other = "en" if locale == "ja" else "ja"
                page.locator(f'[data-language="{other}"]').click()
                expect(page.locator('[data-study-character="ducky"]')).to_have_attribute("aria-pressed", "true")
                expect(page.locator('[data-study-view="front"]')).to_have_attribute("aria-pressed", "true")
                page.reload(wait_until="networkidle")
                expect(page.locator('[data-study-character="ducky"]')).to_have_attribute("aria-pressed", "true")
                expect(page.locator('[data-study-view="front"]')).to_have_attribute("aria-pressed", "true")
                page.locator(f'[data-language="{locale}"]').click()
                sheet = next(item for item in study["comparisons"] if item["character"] == "all" and item["view"] == "front")
                expect(page.locator("#study-sheet")).to_have_attribute("href", urljoin(base, sheet["path"].lstrip("/")))
            if locale == "en":
                english(page)
            page.screenshot(path=str(args.output / f"comparison-{locale}.png"), full_page=True)
            checked(f"{locale}: actual/pending distinction, count table, view/character controls, language and no overflow")
        assert not any(url.endswith((".blend", ".FCStd", ".stl", ".step", ".3mf")) or "prototypes.json" in url for url in requests)
        checked("comparison page loads no native CAD, mesh library or print payload")
        phone_context = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True,
                                            reduced_motion="reduce", locale="ja-JP")
        phone = phone_context.new_page()
        phone.goto(urljoin(base, "en/shape-options.html?character=copilot&view=front"), wait_until="networkidle", timeout=90000)
        english(phone)
        assert phone.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
        if not args.expect_input_wait:
            expect(phone.locator('[data-study-character="copilot"]')).to_have_attribute("aria-pressed", "true")
            expect(phone.locator('[data-study-view="front"]')).to_have_attribute("aria-pressed", "true")
        phone.screenshot(path=str(args.output / "comparison-mobile.png"), full_page=True)
        phone_context.close()
        checked("390px direct English share URL ignores browser-language defaults")
        page.goto(urljoin(base, "shape-options.html?character=invalid&view=invalid"), wait_until="networkidle")
        expect(page.locator("html")).to_have_attribute("lang", "ja")
        if not args.expect_input_wait:
            expect(page.locator('[data-study-character="mona"]')).to_have_attribute("aria-pressed", "true")
            expect(page.locator('[data-study-view="perspective"]')).to_have_attribute("aria-pressed", "true")
        checked("legacy root URL and invalid comparison choices use safe explicit defaults")
        failure = browser.new_context()
        failed = failure.new_page()
        failed.route("**/archive/shape-study.json", lambda route: route.fulfill(status=503, body="unavailable"))
        failed.goto(urljoin(base, "en/shape-options.html"), wait_until="networkidle")
        expect(failed.locator("#study-error")).to_be_visible()
        expect(failed.locator("#study-cards img")).to_have_count(0)
        english(failed)
        failure.close()
        checked("unavailable comparison data is an explicit error, never invented counts/images")
        if not args.expect_input_wait:
            images = browser.new_context()
            broken = images.new_page()
            broken.route("**/mona-plate-refined-three_quarter.jpg", lambda route: route.fulfill(status=404, body="missing"))
            broken.goto(urljoin(base, "en/shape-options.html"), wait_until="networkidle")
            expect(broken.locator("#study-error")).to_be_visible()
            expect(broken.locator('.study-card[data-variant="plate-refined"] img')).to_have_js_property("naturalWidth", 0)
            english(broken)
            images.close()
            checked("a failed real image is reported explicitly without a proxy or historical substitute")
        assert not report["errors"], report["errors"]
    except Exception as error:
        report["failure"] = str(error)
        page.screenshot(path=str(args.output / "failure.png"), full_page=True)
        raise
    finally:
        (args.output / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
        browser.close()
