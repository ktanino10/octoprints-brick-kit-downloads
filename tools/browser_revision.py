"""Exercise revision isolation and current/historical bilingual publication gates."""

import argparse
import json
from pathlib import Path
from urllib.parse import urljoin

from playwright.sync_api import sync_playwright, expect

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--url", required=True)
parser.add_argument("--browser", required=True)
parser.add_argument("--expect-input-wait", action="store_true")
parser.add_argument("--output", type=Path, default=Path(".archive-work/revision-browser"))
args = parser.parse_args()
base = args.url.rstrip("/") + "/"
args.output.mkdir(parents=True, exist_ok=True)
report = {"base": base, "input_wait": args.expect_input_wait, "checks": [], "errors": [], "failed_requests": []}


def checked(name):
    report["checks"].append(name)
    print("PASS", name, flush=True)


def localized(page, locale):
    expect(page.locator("html")).to_have_attribute("lang", locale)
    page.wait_for_timeout(120)
    if locale == "en":
        result = page.evaluate("""() => {
          const issues = [], jp = /[\\u3040-\\u30ff\\u3400-\\u9fff]/;
          const ignored = element => element.closest('script,style,noscript,code,[data-i18n-ignore]');
          const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
          let node;
          while ((node = walker.nextNode())) if (!ignored(node.parentElement) && jp.test(node.nodeValue)) issues.push(node.nodeValue.trim());
          for (const element of document.querySelectorAll('[aria-label],[title],[alt],[placeholder],[aria-valuetext]')) {
            if (ignored(element)) continue;
            for (const name of ['aria-label','title','alt','placeholder','aria-valuetext']) if (jp.test(element.getAttribute(name) || '')) issues.push(element.getAttribute(name));
          }
          return {issues: issues.slice(0, 20), missing: window.__archiveI18n?.missing || []};
        }""")
        assert not result["issues"] and not result["missing"], result
        expect(page.locator("#translation-error")).to_have_count(0)


def no_overflow(page):
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path=args.browser, headless=True,
                                        args=["--no-first-run", "--disable-background-networking", "--disable-sync"])
    context = browser.new_context(viewport={"width": 1440, "height": 1050}, reduced_motion="reduce")
    page = context.new_page()
    page.set_default_timeout(30000)
    page.on("pageerror", lambda error: report["errors"].append(str(error)))
    page.on("requestfailed", lambda request: report["failed_requests"].append({"url": request.url, "failure": request.failure}))
    requested = []
    page.on("request", lambda request: requested.append(request.url))
    try:
        registry_response = context.request.get(urljoin(base, "archive/revisions.json"))
        assert registry_response.status == 200
        registry = registry_response.json()
        upcoming = next(entry for entry in registry["revisions"] if entry["generation"] == "common-blocks")
        if args.expect_input_wait:
            assert upcoming["availability"] == "INPUT_WAIT"
            assert upcoming["id"] != registry["current_revision"]
        else:
            assert upcoming["availability"] == "AVAILABLE"
            assert upcoming["id"] == registry["current_revision"]
        for locale in ["ja", "en"]:
            for route in ["", "models.html", "downloads.html", "history.html", "feedback.html",
                          "gallery/phase1.html", "gallery/selected.html"]:
                response = page.goto(urljoin(base, locale + "/" + route), wait_until="networkidle", timeout=90000)
                assert response.status == 200
                localized(page, locale)
                no_overflow(page)
                if route in ["", "models.html"]:
                    expect(page.locator("#current-error")).to_be_hidden()
                    if args.expect_input_wait:
                        expect(page.locator('[data-availability="INPUT_WAIT"]')).to_have_count(1)
                        expect(page.locator("#current-specimens img")).to_have_count(0)
                        expect(page.locator("#selected-videos video")).to_have_count(0)
                    else:
                        expect(page.locator("#current-specimens article")).to_have_count(3)
                        for image in page.locator("#current-specimens img").all():
                            image.scroll_into_view_if_needed()
                            expect(image).not_to_have_js_property("naturalWidth", 0)
                        if route == "models.html":
                            expect(page.locator("#current-exploded img")).to_have_count(3)
                            for image in page.locator("#current-exploded img").all():
                                image.scroll_into_view_if_needed()
                                expect(image).not_to_have_js_property("naturalWidth", 0)
                if route == "downloads.html":
                    expect(page.locator("#download-error")).to_be_hidden()
                    expect(page.locator("#historical-bundles .bundle")).to_have_count(4)
                    if args.expect_input_wait:
                        expect(page.locator("#bundles .bundle")).to_have_count(0)
                    page.locator("#revision-filter").select_option("phase1")
                    page.locator("#file-search").fill("scene.blend")
                    expect(page.locator("#file-list .path")).to_have_count(9)
                    for name in page.locator("#file-list .path").all_text_contents():
                        assert name.startswith("artifacts/phase1/")
                if route == "feedback.html":
                    expect(page.locator("#photo-grid figure")).to_have_count(10)
                    assert page.locator('a[href="https://youtu.be/rHhXFxvFU-E"]').count() == 1
                if not route:
                    page.screenshot(path=str(args.output / f"home-{locale}.png"), full_page=True)
            checked(f"{locale}: current/INPUT_WAIT distinction, history, download isolation and feedback")
        if not args.expect_input_wait:
            catalog = context.request.get(urljoin(base, upcoming["catalog_url"].lstrip("/"))).json()
            for candidate in catalog["candidates"]:
                identifier = candidate["id"]
                total = candidate["metrics"]["part_count"]
                page.goto(urljoin(base, f"en/viewer/?revision={upcoming['id']}&candidate={identifier}"),
                          wait_until="networkidle", timeout=90000)
                expect(page.locator("#canvas-host")).to_have_attribute("data-model-ready", "true", timeout=90000)
                expect(page.locator("#canvas-host")).to_have_attribute("data-candidate", identifier)
                expect(page.locator("#canvas-host")).to_have_attribute("data-visible-parts", str(total))
                expect(page.locator("#freshness")).to_have_attribute("data-revision", upcoming["id"])
                expect(page.locator("#freshness")).to_have_attribute("data-physical-trial", "NOT_TESTED")
                expect(page.locator("#production-gate")).to_contain_text("Do not print")
                canvas = page.locator("#canvas-host canvas")
                canvas.scroll_into_view_if_needed()
                box = canvas.bounding_box()
                for x, y in [(0.5, 0.5), (0.45, 0.45), (0.55, 0.6), (0.5, 0.35)]:
                    canvas.click(position={"x": box["width"] * x, "y": box["height"] * y})
                    if page.locator("#clear-selection").is_visible():
                        break
                expect(page.locator("#clear-selection")).to_be_visible()
                picked = page.locator("#part-details .part-id").inner_text()
                page.locator("#part-search").fill(picked)
                expect(page.locator("#part-list [data-part-id]")).to_have_count(1)
                for mode in ["colors", "types", "combined"]:
                    page.locator(f'[data-bom="{mode}"]').click()
                    expect(page.locator("#bom-table tfoot")).to_contain_text(f"{total:,}")
                canvas.press("ArrowRight")
                page.locator("#explode").focus()
                page.locator("#explode").press("End")
                expect(page.locator("#canvas-host")).to_have_attribute("data-explosion", "1")
                page.locator("#layers").focus()
                page.locator("#layers").press("Home")
                expect(page.locator("#canvas-host")).to_have_attribute("data-visible-parts", "0")
                page.locator("#show-complete").click()
                page.locator("#steps").focus()
                page.locator("#steps").press("Home")
                page.locator("#next-step").click()
                expect(page.locator("#canvas-host")).to_have_attribute("data-visible-parts", "1")
                page.locator('[data-language="ja"]').click()
                expect(page.locator("#part-details .part-id")).to_have_text(picked)
                page.locator('[data-language="en"]').click()
                page.reload(wait_until="networkidle", timeout=90000)
                expect(page.locator("#canvas-host")).to_have_attribute("data-model-ready", "true", timeout=90000)
                expect(page.locator("#part-details .part-id")).to_have_text(picked)
                expect(page.locator("#canvas-host")).to_have_attribute("data-visible-parts", "1")
                page.locator("#show-complete").click()
                page.locator("#part-search").fill("")
                page.locator("#clear-selection").click()
                page.locator("#video-preview summary").click()
                video = page.locator("#video-preview video")
                expect(video.locator("source")).to_have_count(1)
                expect(video).not_to_have_js_property("readyState", 0, timeout=30000)
                video.evaluate("(video) => { video.muted = true; return video.play(); }")
                page.wait_for_timeout(250)
                assert video.evaluate("(video) => video.currentTime > 0 && video.videoWidth > 0")
                video.evaluate("(video) => video.pause()")
                localized(page, "en")
                page.locator("#video-preview summary").click()
                page.locator("#studio").scroll_into_view_if_needed()
                page.screenshot(path=str(args.output / f"current-{identifier}.png"))
                checked(f"current {identifier}: actual geometry, mesh pick, orbit, Z/layer/step, ID/BOM, language/reload and video")
        if args.expect_input_wait:
            assert not any("/artifacts/revisions/" in url for url in requested), requested
            page.goto(urljoin(base, f"en/viewer/?revision={upcoming['id']}"), wait_until="networkidle", timeout=90000)
            expect(page.locator("#catalog-error")).to_contain_text("awaiting real deliverables")
            expect(page.locator("#canvas-host canvas")).to_have_count(0)
            expect(page.locator("#explode")).to_be_disabled()
            localized(page, "en")
            checked("pending revision renders no old or placeholder model and makes no native-file requests")
        for candidate, count in [("mona-fine", 13434), ("copilot-chunky", 3021), ("ducky-fine", 10311)]:
            page.goto(urljoin(base, f"en/viewer/?mode=r2&candidate={candidate}"), wait_until="networkidle", timeout=90000)
            expect(page.locator("#canvas-host")).to_have_attribute("data-model-ready", "true", timeout=90000)
            expect(page.locator("#canvas-host")).to_have_attribute("data-candidate", candidate)
            expect(page.locator("#canvas-host")).to_have_attribute("data-visible-parts", str(count))
            expect(page.locator("#freshness")).to_have_attribute("data-revision", "r2-20260919")
            expect(page.locator("#freshness")).to_have_attribute("data-physical-trial", "ISSUES_REPORTED")
            page.locator("#part-list [data-part-id]").first.click()
            identifier = page.locator("#part-details .part-id").inner_text()
            page.locator("#explode").focus()
            page.locator("#explode").press("End")
            expect(page.locator("#canvas-host")).to_have_attribute("data-explosion", "1")
            page.locator("#steps").focus()
            page.locator("#steps").press("Home")
            page.locator("#next-step").click()
            expect(page.locator("#canvas-host")).to_have_attribute("data-visible-parts", "1")
            page.locator('[data-language="ja"]').click()
            expect(page.locator("#part-details .part-id")).to_have_text(identifier)
            expect(page.locator("#canvas-host")).to_have_attribute("data-visible-parts", "1")
            page.locator('[data-language="en"]').click()
            page.reload(wait_until="networkidle", timeout=90000)
            expect(page.locator("#canvas-host")).to_have_attribute("data-model-ready", "true", timeout=90000)
            expect(page.locator("#part-details .part-id")).to_have_text(identifier)
            expect(page.locator("#canvas-host")).to_have_attribute("data-visible-parts", "1")
            localized(page, "en")
            checked(f"r2 history {candidate}: exact IDs/counts, separate physical status, controls and language/deep-link continuity")
        page.goto(urljoin(base, "en/viewer/?mode=phase1&candidate=copilot-fine"), wait_until="networkidle", timeout=90000)
        expect(page.locator("#canvas-host")).to_have_attribute("data-model-ready", "true", timeout=90000)
        expect(page.locator("#canvas-host")).to_have_attribute("data-visible-parts", "19588")
        expect(page.locator("#freshness")).to_have_attribute("data-physical-trial", "NOT_VALIDATED")
        localized(page, "en")
        checked("Phase1 numerical comparisons are not assigned r2 physical-trial success")
        mobile = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True,
                                     locale="ja-JP", reduced_motion="reduce")
        phone = mobile.new_page()
        for route in ["", "models.html", "downloads.html", "history.html", "feedback.html"]:
            phone.goto(urljoin(base, "en/" + route), wait_until="networkidle", timeout=90000)
            localized(phone, "en")
            no_overflow(phone)
        if not args.expect_input_wait:
            phone.goto(urljoin(base, "en/viewer/?candidate=copilot-practical8"), wait_until="networkidle", timeout=90000)
            expect(phone.locator("#canvas-host")).to_have_attribute("data-model-ready", "true", timeout=90000)
            phone.locator("#explode").focus()
            phone.locator("#explode").press("End")
            expect(phone.locator("#canvas-host")).to_have_attribute("data-explosion", "1")
            phone.locator("#show-complete").click()
            localized(phone, "en")
            no_overflow(phone)
            phone.locator("#viewport").scroll_into_view_if_needed()
            phone.screenshot(path=str(args.output / "current-mobile.png"))
        mobile.close()
        checked("English revision pages fit a 390px screen with explicit URL language")
        assert not report["errors"], report["errors"]
    except Exception as error:
        report["failure"] = str(error)
        report["failure_ui"] = {selector: page.locator(selector).inner_text() for selector in
                               ["#catalog-error", "#stage-message-copy", "#evidence-detail"] if page.locator(selector).count()}
        page.screenshot(path=str(args.output / "failure.png"), full_page=True)
        raise
    finally:
        (args.output / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
        browser.close()
