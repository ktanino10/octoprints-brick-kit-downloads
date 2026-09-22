"""Exercise the real public archive in an isolated, headless browser."""

import argparse
import hashlib
import json
from pathlib import Path
import re
import time
from urllib.parse import urljoin, urlsplit

from playwright.sync_api import sync_playwright, expect

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--url", required=True)
parser.add_argument("--browser", required=True, help="Existing Chromium/Chrome executable; no browser installation.")
parser.add_argument("--output", type=Path, default=Path(".archive-work/browser"))
parser.add_argument("--smoke", action="store_true", help="Skip exhaustive error-injection and history tests on the live origin.")
args = parser.parse_args()
base = args.url.rstrip("/") + "/"
out = args.output.resolve()
out.mkdir(parents=True, exist_ok=True)
report = {"base": base, "engine": "isolated Chromium", "checks": [], "errors": [], "requests": []}


def checked(name, detail=None):
    report["checks"].append({"name": name, "detail": detail})
    print("PASS", name, detail or "", flush=True)


def clean_width(page):
    width = page.evaluate("({viewport: innerWidth, document: document.documentElement.scrollWidth})")
    assert width["document"] <= width["viewport"] + 1, width


def play(video):
    video.scroll_into_view_if_needed()
    video.evaluate("(v) => { v.muted = true; return v.play(); }")
    expect(video).to_have_js_property("paused", False)
    deadline = time.monotonic() + 20
    while not video.evaluate("(v) => v.currentTime > 0.05 && v.videoWidth > 0"):
        if time.monotonic() >= deadline:
            raise AssertionError("Video did not begin decoding/playing")
        time.sleep(0.1)
    data = video.evaluate("(v) => ({duration: v.duration, width: v.videoWidth, height: v.videoHeight, time: v.currentTime})")
    video.evaluate("(v) => v.pause()")
    assert data["duration"] > 0 and data["width"] > 0
    return data


def model_ready(page, candidate, count):
    host = page.locator("#canvas-host")
    expect(host).to_have_attribute("data-candidate", candidate, timeout=90000)
    expect(host).to_have_attribute("data-model-ready", "true", timeout=90000)
    expect(host).to_have_attribute("data-visible-parts", str(count))
    expect(page.locator("#metric-parts")).to_contain_text(f"{count:,}")
    expect(page.locator("#stage-message")).to_be_hidden()
    expect(page.locator("#freshness")).to_have_attribute("data-state", "ARCHIVED", timeout=30000)
    assert int(host.get_attribute("data-batches")) > 0


def exercise_model(page, candidate, count):
    model_ready(page, candidate, count)
    canvas = page.locator("#canvas-host canvas")
    canvas.scroll_into_view_if_needed()
    page.wait_for_timeout(400)
    original = canvas.screenshot()
    box = canvas.bounding_box()
    assert box["width"] > 200 and box["height"] > 200
    for x, y in [(0.50, 0.50), (0.48, 0.42), (0.57, 0.52), (0.45, 0.63)]:
        canvas.click(position={"x": box["width"] * x, "y": box["height"] * y})
        if page.locator("#clear-selection").is_visible():
            break
    expect(page.locator("#clear-selection")).to_be_visible()
    part_text = page.locator("#part-details").inner_text()
    assert re.search(r"(MON|COP|DUC)-(F|C|R2)-\d+", part_text), part_text
    page.locator("#clear-selection").click()
    canvas.scroll_into_view_if_needed()
    box = canvas.bounding_box()
    page.mouse.move(box["x"] + box["width"] * 0.55, box["y"] + box["height"] * 0.52)
    page.mouse.down()
    page.mouse.move(box["x"] + box["width"] * 0.70, box["y"] + box["height"] * 0.56, steps=12)
    page.mouse.up()
    page.wait_for_timeout(350)
    assert hashlib.sha256(original).digest() != hashlib.sha256(canvas.screenshot()).digest(), "Orbit did not change the rendered canvas"
    page.locator("#reset-view").click()
    page.locator("#explode").focus()
    page.locator("#explode").press("End")
    expect(page.locator("#canvas-host")).to_have_attribute("data-explosion", "1")
    expect(page.locator("#explode-value")).to_have_text("100%")
    page.locator("#layers").focus()
    page.locator("#layers").press("Home")
    expect(page.locator("#canvas-host")).to_have_attribute("data-visible-parts", "0")
    expect(page.locator("#empty-progress")).to_be_visible()
    page.locator("#show-complete").click()
    page.locator("#steps").focus()
    page.locator("#steps").press("Home")
    expect(page.locator("#canvas-host")).to_have_attribute("data-visible-parts", "0")
    page.locator("#next-step").click()
    expect(page.locator("#canvas-host")).to_have_attribute("data-visible-parts", "1")
    page.locator("#previous-step").click()
    expect(page.locator("#canvas-host")).to_have_attribute("data-visible-parts", "0")
    page.locator("#show-complete").click()
    model_ready(page, candidate, count)
    for mode in ("colors", "types", "combined"):
        page.locator(f'[data-bom="{mode}"]').click()
        expect(page.locator("#bom-table table")).to_be_visible()
    first = page.locator("#part-list [data-part-id]").first
    identifier = first.get_attribute("data-part-id")
    page.locator("#part-search").fill(identifier)
    page.locator(f'#part-list [data-part-id="{identifier}"]').click()
    expect(page.locator("#part-details")).to_contain_text(identifier)
    page.locator("#part-search").fill("")
    page.locator("#clear-selection").click()
    expect(page.locator("#downloads .download-pending")).to_have_count(0, timeout=45000)
    assert page.locator('#downloads [data-available="false"]').count() == 0, page.locator("#downloads").inner_text()
    page.locator("#video-preview summary").click()
    video = play(page.locator("#video-preview video"))
    page.locator("#video-preview summary").click()
    page.locator("#studio").scroll_into_view_if_needed()
    page.screenshot(path=str(out / f"viewer-{candidate}.png"))
    checked(f"selected viewer {candidate}: WebGL, pick, orbit, explode, layers, steps, ID, BOM, downloads, MP4",
            {"parts": count, "picked": identifier, "video": video})


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=args.browser, headless=True,
                                args=["--no-first-run", "--disable-background-networking", "--disable-component-update", "--disable-sync"])
    context = browser.new_context(viewport={"width": 1440, "height": 1050}, reduced_motion="reduce", accept_downloads=True)
    page = context.new_page()
    page.set_default_timeout(30000)
    page.on("pageerror", lambda error: report["errors"].append(str(error)))
    page.on("request", lambda request: report["requests"].append(request.url))
    try:
        response = page.goto(base, wait_until="networkidle", timeout=90000)
        assert response.status == 200
        expect(page.locator(".candidate-card")).to_have_count(0)
        expect(page.locator(".print-model")).to_have_count(3)
        expect(page.locator("#print-status")).to_contain_text("全数印刷は保留")
        clean_width(page)
        initial_requests = report["requests"][:]
        assert not any(url.endswith((".blend", ".FCStd", ".stl", ".step", ".mp4")) or "prototypes.json" in url or "/manifest.json" in url for url in initial_requests)
        assert all(urlsplit(url).netloc == urlsplit(base).netloc for url in initial_requests)
        page.screenshot(path=str(out / "landing-desktop.png"), full_page=True)
        checked("landing: three high-part model selectors, no history or geometry/video auto-download")
        page.goto(urljoin(base, "history.html"), wait_until="networkidle")
        page.locator("#phase1-gallery > summary").click()
        expect(page.locator(".candidate-card")).to_have_count(9)
        for card in page.locator(".candidate-card").all():
            image = card.locator("img")
            image.scroll_into_view_if_needed()
            expect(image).to_have_js_property("complete", True)
            expect(image).not_to_have_js_property("naturalWidth", 0, timeout=20000)
            card.locator("a[data-lightbox]").click()
            expect(page.locator("#image-dialog")).to_be_visible()
            expect(page.locator("#image-dialog p")).to_contain_text("Phase1履歴")
            page.locator("#image-dialog img").wait_for()
            expect(page.locator("#image-dialog img")).to_have_js_property("naturalWidth", 1200)
            page.keyboard.press("Escape")
        page.screenshot(path=str(out / "separate-history.png"), full_page=True)
        page.evaluate("window.scrollTo(0, 0)")
        page.screenshot(path=str(out / "landing-top.png"))
        checked("history: nine preserved original candidate images and full-size previews")
        for selector in ("#history-videos",):
            host = page.locator(selector)
            host.locator("..").locator("summary").click()
            for video in host.locator("video").all():
                play(video)
            host.locator("..").locator("summary").click()
        checked("the three historical Balanced videos play on the separate history page")
        page.goto(urljoin(base, "viewer/?mode=r2"), wait_until="networkidle", timeout=90000)
        for candidate, count in [("mona-fine", 13434), ("copilot-chunky", 3021), ("ducky-fine", 10311)]:
            if candidate != "mona-fine":
                page.locator(f'button[data-character="{candidate.split("-")[0]}"]').click()
            exercise_model(page, candidate, count)
        if not args.smoke:
            page.goto(urljoin(base, "viewer/?mode=phase1&candidate=copilot-fine"), wait_until="networkidle", timeout=90000)
            model_ready(page, "copilot-fine", 19588)
            expect(page.locator(".gallery-card")).to_have_count(9)
            page.locator("#studio").scroll_into_view_if_needed()
            page.screenshot(path=str(out / "viewer-phase1-largest.png"))
            checked("Phase1 largest actual model renders 19,588 parts with all nine history choices")
        page.goto(urljoin(base, "downloads.html"), wait_until="networkidle")
        expect(page.locator("#historical-bundles .bundle")).to_have_count(4)
        expect(page.locator("#download-error")).to_be_hidden()
        page.locator("#file-search").fill("Selected-p4.FCStd")
        expect(page.locator("#file-list .path")).to_have_count(1)
        page.locator("#file-search").fill("does-not-exist")
        expect(page.locator("#file-list")).to_contain_text("一致するファイルがありません")
        page.locator("#file-search").fill("p4-trial-11-parts.3mf")
        expect(page.locator("#file-list .path")).to_have_count(1)
        with page.expect_download() as download:
            page.locator("#file-list .path").click()
        downloaded = download.value
        target = out / "legacy-trial.3mf"
        downloaded.save_as(target)
        assert hashlib.sha256(target.read_bytes()).hexdigest() == "ce054bdae89885e9dfc0fe8dfdf5871f1b573ba1fdc25f09f24fe503ee11c69f"
        target.unlink()
        checked("catalog filter, empty result and actual unchanged 3MF browser download")
        page.goto(urljoin(base, "feedback.html"), wait_until="networkidle")
        expect(page.locator("#photo-grid figure")).to_have_count(10)
        for image in page.locator("#photo-grid img").all():
            image.scroll_into_view_if_needed()
            expect(image).to_have_js_property("complete", True)
            expect(image).not_to_have_js_property("naturalWidth", 0, timeout=20000)
        combined = play(page.locator(".wide-video"))
        assert abs(combined["duration"] - 33.352167) < 0.1
        page.locator(".media-disclosure summary").click()
        for video in page.locator(".feedback-subvideos video").all():
            play(video)
        expect(page.locator("main")).to_contain_text("超音波洗浄前から発生")
        assert page.locator('iframe[src*="youtube"]').count() == 0
        checked("feedback: ten public photos, corrected 33.35s combined video, both individual videos, no YouTube embed")
        mobile = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=1, is_mobile=True, has_touch=True, reduced_motion="reduce")
        mobile_page = mobile.new_page()
        mobile_page.set_default_timeout(30000)
        mobile_page.goto(base, wait_until="networkidle", timeout=90000)
        expect(mobile_page.locator(".candidate-card")).to_have_count(9)
        for image in mobile_page.locator(".candidate-card img, .feedback-photo img").all():
            image.scroll_into_view_if_needed()
            expect(image).not_to_have_js_property("naturalWidth", 0, timeout=20000)
        clean_width(mobile_page)
        mobile_page.screenshot(path=str(out / "landing-mobile.png"), full_page=True)
        mobile_page.goto(urljoin(base, "viewer/?candidate=copilot-chunky"), wait_until="networkidle", timeout=90000)
        model_ready(mobile_page, "copilot-chunky", 3021)
        clean_width(mobile_page)
        mobile_page.locator("#explode").focus()
        mobile_page.locator("#explode").press("End")
        expect(mobile_page.locator("#canvas-host")).to_have_attribute("data-explosion", "1")
        mobile_page.locator("#show-complete").click()
        mobile_page.locator("#viewport").scroll_into_view_if_needed()
        mobile_page.screenshot(path=str(out / "viewer-mobile.png"))
        for route in ("downloads.html", "feedback.html", "history.html"):
            mobile_page.goto(urljoin(base, route), wait_until="networkidle")
            clean_width(mobile_page)
        mobile.close()
        checked("390px mobile: landing, functioning WebGL viewer, controls, downloads, feedback and history without overflow")
        if not args.smoke:
            failure = browser.new_context(viewport={"width": 1280, "height": 900})
            failure_page = failure.new_page()
            failure_page.set_default_timeout(30000)
            failure_page.route("**/artifacts/selected/r2-20260919/mona-fine/manifest.json",
                               lambda route: route.fulfill(status=503, body="temporarily unavailable"))
            failure_page.goto(urljoin(base, "viewer/"), wait_until="networkidle", timeout=90000)
            expect(failure_page.locator("#stage-message-title")).to_contain_text("配置を読み込めません")
            expect(failure_page.locator("#explode")).to_be_disabled()
            assert failure_page.locator("#canvas-host").get_attribute("data-model-ready") != "true"
            failure_page.unroute("**/artifacts/selected/r2-20260919/mona-fine/manifest.json")
            failure_page.route("**/archive/status.json", lambda route: route.fulfill(status=503, body="unavailable"))
            failure_page.goto(urljoin(base, "viewer/?candidate=copilot-chunky"), wait_until="networkidle", timeout=90000)
            expect(failure_page.locator("#freshness")).to_have_attribute("data-state", "UNKNOWN")
            expect(failure_page.locator("#freshness-label")).to_have_text("公開記録を読めません")
            failure_page.route("**/archive/inventory.json", lambda route: route.fulfill(status=404, body="not found"))
            failure_page.goto(urljoin(base, "downloads.html"), wait_until="networkidle")
            expect(failure_page.locator("#download-error")).to_be_visible()
            expect(failure_page.locator("#file-list tr")).to_have_count(0)
            failure.close()
            checked("explicit manifest/network/status/catalog failures; no fabricated model, approval or download count")
        assert not report["errors"], report["errors"]
        checked("no uncaught browser JavaScript errors")
    except Exception as error:
        report["failure"] = str(error)
        page.screenshot(path=str(out / "failure.png"))
        print("BROWSER FAILURE", error, flush=True)
        raise
    finally:
        report["requests"] = sorted(set(report["requests"]))
        (out / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
        browser.close()
