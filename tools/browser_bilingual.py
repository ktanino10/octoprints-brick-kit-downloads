"""Check real JA/EN pages, translations and viewer state on a project-subpath origin."""

import argparse
import json
from pathlib import Path
from urllib.parse import urljoin, urlsplit, parse_qs

from playwright.sync_api import sync_playwright, expect

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--url", required=True)
parser.add_argument("--browser", required=True)
parser.add_argument("--output", type=Path, default=Path(".archive-work/bilingual-browser"))
parser.add_argument("--public", action="store_true")
args = parser.parse_args()
base = args.url.rstrip("/") + "/"
args.output.mkdir(parents=True, exist_ok=True)
report = {"base": base, "checks": [], "errors": []}


def passed(name):
    report["checks"].append(name)
    print("PASS", name, flush=True)


def english(page):
    expect(page.locator("html")).to_have_attribute("lang", "en")
    page.wait_for_timeout(100)
    findings = page.evaluate("""() => {
      const jp = /[\\u3040-\\u30ff\\u3400-\\u9fff]/;
      const ignore = e => e.closest('script,style,noscript,code,[data-i18n-ignore]');
      const issues = [];
      const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (!ignore(node.parentElement) && jp.test(node.nodeValue)) issues.push(node.nodeValue.trim());
      }
      for (const element of document.querySelectorAll('[aria-label],[aria-valuetext],[title],[placeholder],[alt]')) {
        if (ignore(element)) continue;
        for (const name of ['aria-label','aria-valuetext','title','placeholder','alt']) {
          if (jp.test(element.getAttribute(name) || '')) issues.push(name + ': ' + element.getAttribute(name));
        }
      }
      return {issues: issues.slice(0, 30), missing: window.__archiveI18n?.missing || []};
    }""")
    assert not findings["issues"] and not findings["missing"], findings
    expect(page.locator("#translation-error")).to_have_count(0)


def width(page):
    dimensions = page.evaluate("({actual:document.documentElement.scrollWidth,viewport:innerWidth})")
    assert dimensions["actual"] <= dimensions["viewport"] + 1, dimensions


def loaded(page, candidate, count=None):
    expect(page.locator("#canvas-host")).to_have_attribute("data-candidate", candidate, timeout=90000)
    expect(page.locator("#canvas-host")).to_have_attribute("data-model-ready", "true", timeout=90000)
    if count is not None:
        expect(page.locator("#metric-parts")).to_contain_text(f"{count:,}")
    expect(page.locator("#catalog-error")).to_be_hidden()


def link_state(page, language):
    link = page.locator(f'[data-language="{language}"]')
    link.focus()
    return json.loads(parse_qs(urlsplit(link.get_attribute("href")).query)["view"][0])

def same_view(left, right):
    assert {key: value for key, value in left.items() if key != "camera"} == {key: value for key, value in right.items() if key != "camera"}
    assert max(abs(a - b) for a, b in zip(left["camera"], right["camera"])) < 1e-7


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=args.browser, headless=True,
                               args=["--no-first-run", "--disable-background-networking", "--disable-sync"])
    context = browser.new_context(viewport={"width": 1440, "height": 1050}, reduced_motion="reduce")
    page = context.new_page()
    page.set_default_timeout(30000)
    page.on("pageerror", lambda error: report["errors"].append(str(error)))
    try:
        for locale in ["ja", "en"]:
            for route in ["", "downloads.html", "feedback.html", "history.html", "gallery/phase1.html", "gallery/selected.html"]:
                response = page.goto(urljoin(base, f"{locale}/{route}"), wait_until="networkidle", timeout=90000)
                assert response.status == 200
                expect(page.locator("html")).to_have_attribute("lang", locale)
                expect(page.locator("[data-language]")).to_have_count(2)
                width(page)
                if locale == "en":
                    english(page)
                if not route:
                    expect(page.locator(".candidate-card")).to_have_count(9)
                    if locale == "en":
                        assert "13,434 parts" in page.locator(".specimen").first.locator("p").inner_text()
                        assert "angle. Inspect" in page.locator("#selected-media h2").inner_text()
                    for image in page.locator(".candidate-card img").all():
                        image.scroll_into_view_if_needed()
                        expect(image).not_to_have_js_property("naturalWidth", 0)
                    page.screenshot(path=str(args.output / f"home-{locale}.png"), full_page=True)
                if route == "downloads.html":
                    expect(page.locator(".bundle")).to_have_count(4)
                    page.locator("#file-search").fill("mona-fine")
                    assert page.locator("#file-list .path").count() > 0
                    page.locator("#file-search").fill("missing-no-file")
                    assert page.locator("#file-list .path").count() == 0
                    if locale == "en":
                        expect(page.locator("#file-list")).to_contain_text("No matching files")
                        english(page)
                if route == "feedback.html":
                    expect(page.locator("#photo-grid figure")).to_have_count(10)
                    expect(page.locator('a[href="https://youtu.be/rHhXFxvFU-E"]')).to_have_count(1)
                    assert page.locator("iframe").count() == 0
                if route.startswith("gallery/"):
                    for image in page.locator("img").all():
                        image.scroll_into_view_if_needed()
                        expect(image).not_to_have_js_property("naturalWidth", 0)
            passed(f"{locale}: direct home, nine images, downloads, feedback, history and both galleries")

        page.goto(urljoin(base, "ja/viewer/"), wait_until="networkidle", timeout=90000)
        for candidate, count in [("mona-fine", 13434), ("copilot-chunky", 3021), ("ducky-fine", 10311)]:
            if candidate != "mona-fine":
                page.locator(f'button[data-character="{candidate.split("-")[0]}"]').click()
            loaded(page, candidate, count)
            page.locator("#part-list [data-part-id]").first.click()
            part = page.locator("#part-details .part-id").inner_text()
            page.locator("#part-search").fill(part)
            page.locator('[data-bom="types"]').click()
            bom_before = page.locator("#bom-table tbody tr td:last-child").all_text_contents()
            page.locator("#canvas-host canvas").press("ArrowRight")
            page.locator("#explode").focus()
            page.locator("#explode").press("End")
            page.locator("#steps").focus()
            page.locator("#steps").press("Home")
            page.locator("#next-step").click()
            expect(page.locator("#canvas-host")).to_have_attribute("data-visible-parts", "1")
            page.wait_for_timeout(150)
            original = link_state(page, "en")
            page.evaluate("window.__canvasBeforeLanguage = document.querySelector('#canvas-host canvas')")
            page.locator('[data-language="en"]').press("Enter")
            assert "/en/viewer/" in page.url
            english(page)
            assert page.evaluate("window.__canvasBeforeLanguage === document.querySelector('#canvas-host canvas')")
            expect(page.locator("#part-details .part-id")).to_have_text(part)
            expect(page.locator("#part-search")).to_have_value(part)
            expect(page.locator("#canvas-host")).to_have_attribute("data-explosion", "1")
            expect(page.locator("#canvas-host")).to_have_attribute("data-visible-parts", "1")
            assert page.locator("#bom-table tbody tr td:last-child").all_text_contents() == bom_before
            after = link_state(page, "ja")
            same_view(after, original)
            shared_url = page.url
            page.reload(wait_until="networkidle", timeout=90000)
            loaded(page, candidate, count)
            english(page)
            expect(page.locator("#canvas-host")).to_have_attribute("data-visible-parts", "1")
            expect(page.locator("#part-details .part-id")).to_have_text(part)
            restored = link_state(page, "ja")
            same_view(restored, original)
            assert page.url == shared_url
            page.locator("#show-complete").click()
            page.locator("#part-search").fill("")
            page.locator("#clear-selection").click()
            page.locator("#video-preview summary").click()
            video = page.locator("#video-preview video")
            expect(video.locator("source")).to_have_count(1)
            expect(video).not_to_have_js_property("readyState", 0, timeout=30000)
            video.evaluate("(video) => { video.muted = true; return video.play(); }")
            expect(video).to_have_js_property("paused", False)
            page.wait_for_timeout(150)
            assert video.evaluate("(video) => video.currentTime > 0 && video.videoWidth > 0")
            video.evaluate("(video) => video.pause()")
            english(page)
            page.locator("#video-preview summary").click()
            page.locator("#studio").scroll_into_view_if_needed()
            page.screenshot(path=str(args.output / f"viewer-en-{candidate}.png"))
            page.locator('[data-language="ja"]').click()
            expect(page.locator("html")).to_have_attribute("lang", "ja")
            expect(page.locator("#candidate-title")).to_contain_text({"mona-fine": "こまかく", "copilot-chunky": "ざっくり", "ducky-fine": "こまかく"}[candidate])
            passed(f"{candidate}: JA/EN live state parity, same canvas/camera/ID/BOM, deep-link reload, keyboard and MP4")
        page.goto(urljoin(base, "en/viewer/?mode=phase1&candidate=copilot-fine"), wait_until="networkidle", timeout=90000)
        loaded(page, "copilot-fine", 19588)
        english(page)
        expect(page.locator(".gallery-card")).to_have_count(9)
        passed("English Phase1 largest historical model and nine-candidate viewer")

        mobile = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True,
                                     reduced_motion="reduce", locale="ja-JP")
        phone = mobile.new_page()
        for route in ["", "downloads.html", "feedback.html", "history.html", "gallery/phase1.html", "gallery/selected.html", "viewer/?candidate=copilot-chunky"]:
            phone.goto(urljoin(base, "en/" + route), wait_until="networkidle", timeout=90000)
            if route.startswith("viewer"):
                loaded(phone, "copilot-chunky", 3021)
                phone.locator("#viewport").scroll_into_view_if_needed()
                phone.screenshot(path=str(args.output / "viewer-en-mobile.png"))
            english(phone)
            width(phone)
        mobile.close()
        passed("390px English pages/viewer with Japanese browser locale and empty storage")

        for route in ["", "viewer/", "downloads.html", "feedback.html", "history.html",
                      "artifacts/phase1/gallery.html", "artifacts/selected/r2-20260919/gallery.html"]:
            response = page.goto(urljoin(base, route), wait_until="networkidle", timeout=90000)
            assert response.status == 200
            expect(page.locator("html")).to_have_attribute("lang", "ja")
        passed("all seven legacy Japanese URLs remain functional")

        failure = browser.new_context()
        error_page = failure.new_page()
        error_page.route("**/artifacts/selected/r2-20260919/mona-fine/manifest.json",
                         lambda route: route.fulfill(status=503, body="unavailable"))
        error_page.goto(urljoin(base, "en/viewer/"), wait_until="networkidle", timeout=90000)
        expect(error_page.locator("#stage-message-title")).to_contain_text("Could not load")
        expect(error_page.locator("#explode")).to_be_disabled()
        english(error_page)
        error_page.route("**/archive/inventory.json", lambda route: route.fulfill(status=404, body="missing"))
        error_page.goto(urljoin(base, "en/downloads.html"), wait_until="networkidle")
        expect(error_page.locator("#download-error")).to_be_visible()
        english(error_page)
        failure.close()
        passed("English network/error states remain explicit and contain no Japanese fallback")
        assert not report["errors"], report["errors"]
    except Exception as error:
        report["failure"] = str(error)
        page.screenshot(path=str(args.output / "failure.png"), full_page=True)
        raise
    finally:
        (args.output / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
        browser.close()
