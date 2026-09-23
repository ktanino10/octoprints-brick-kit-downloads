"""Measure real-case native rendering and input latency; never substitute a synthetic model."""

import argparse
import json
from pathlib import Path
import time
from urllib.parse import urljoin

from playwright.sync_api import expect, sync_playwright

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--url", required=True)
parser.add_argument("--browser", required=True)
parser.add_argument("--engine", choices=["chromium", "webkit"], default="chromium")
parser.add_argument("--case", required=True)
parser.add_argument("--detail", choices=["native", "light"], default="native")
parser.add_argument("--output", type=Path, required=True)
args = parser.parse_args()
base = args.url.rstrip("/") + "/"
report = {"base": base, "case_id": args.case, "engine": args.engine, "scope": "ACTUAL_NATIVE_CASE_INTERACTION_MEASUREMENTS",
          "detail": args.detail, "errors": [], "viewports": []}

with sync_playwright() as playwright:
    launch = {"executable_path": args.browser, "headless": True, "timeout": 60000}
    if args.engine == "chromium":
        launch["args"] = ["--no-first-run", "--disable-background-networking", "--disable-sync"]
    browser = getattr(playwright, args.engine).launch(**launch)
    try:
        for width, height in [(1440, 1000), (390, 844)]:
            context = browser.new_context(viewport={"width": width, "height": height}, reduced_motion="reduce")
            page = context.new_page()
            page.on("pageerror", lambda error: report["errors"].append(str(error)))
            start = time.monotonic()
            page.goto(urljoin(base, f"en/density-guide.html?case={args.case}&detail={args.detail}"), wait_until="domcontentloaded")
            expect(page.locator("#density-canvas")).to_have_attribute("data-ready", "true", timeout=180000)
            expect(page.locator("#guide-error")).to_be_hidden()
            loaded_ms = (time.monotonic() - start) * 1000
            samples = page.evaluate("""async () => {
              const canvas = document.querySelector('#density-canvas canvas');
              const gl = canvas.getContext('webgl2');
              const frames = [], handlers = [], eventLoops = [], gpuWaits = [];
              for (let index = 0; index < 5; index++) {
                const before = JSON.stringify(window.__densityGuide.diagnostics().camera);
                const start = performance.now();
                canvas.dispatchEvent(new KeyboardEvent('keydown', {key:'ArrowLeft', bubbles:true}));
                handlers.push(performance.now() - start);
                await new Promise(resolve => setTimeout(resolve, 0));
                eventLoops.push(performance.now() - start);
                await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
                const gpuStart = performance.now();
                gl.finish();
                gpuWaits.push(performance.now() - gpuStart);
                if (JSON.stringify(window.__densityGuide.diagnostics().camera) === before) {
                  throw new Error('The measured rotation input did not actually change the camera');
                }
                frames.push(performance.now() - start);
              }
              return {frames_ms: frames, input_handler_ms: handlers, event_loop_yield_ms: eventLoops,
                gpu_finish_wait_ms: gpuWaits, diagnostics: window.__densityGuide.diagnostics(),
                renderer: gl.getParameter(gl.RENDERER), vendor: gl.getParameter(gl.VENDOR)};
            }""")
            canvas = page.locator("#density-canvas canvas")
            canvas.scroll_into_view_if_needed()
            bounds = canvas.bounding_box()
            before_drag = page.evaluate("window.__densityGuide.diagnostics().camera")
            drag_start = time.monotonic()
            page.mouse.move(bounds["x"] + bounds["width"] / 2, bounds["y"] + bounds["height"] / 2)
            page.mouse.down()
            page.mouse.move(bounds["x"] + bounds["width"] / 2 + 70, bounds["y"] + bounds["height"] / 2 + 20, steps=3)
            page.mouse.up()
            drag_delivery_ms = (time.monotonic() - drag_start) * 1000
            page.evaluate("""async () => {
              await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
              document.querySelector('#density-canvas canvas').getContext('webgl2').finish();
            }""")
            drag_ms = (time.monotonic() - drag_start) * 1000
            assert page.evaluate("window.__densityGuide.diagnostics().camera") != before_drag, "Actual drag did not change the camera"
            page.locator("#guide-mode").select_option("assembly")
            total = int(page.locator("#guide-step").get_attribute("max"))
            page.locator("#guide-step").evaluate(
                "(input,value)=>{input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}))}", str(max(0, total - 600)))
            page.locator("#guide-speed").select_option("600")
            page.locator('[data-guide-action="play"]').click()
            expect(page.locator("#guide-play")).to_have_attribute("aria-pressed", "true")
            pause_start = time.monotonic()
            page.locator('[data-guide-action="play"]').click()
            expect(page.locator("#guide-play")).to_have_attribute("aria-pressed", "false")
            pause_ms = (time.monotonic() - pause_start) * 1000
            page.locator("#guide-mode").select_option("assembled")
            page.locator("#guide-mode").select_option("radial")
            radial = page.locator("#guide-explode").evaluate("""async input => {
              const start = performance.now();
              input.value = '100'; input.dispatchEvent(new Event('input',{bubbles:true}));
              await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve))));
              document.querySelector('#density-canvas canvas').getContext('webgl2').finish();
              return {input_to_finished_frame_ms: performance.now() - start,
                diagnostics: window.__densityGuide.diagnostics()};
            }""")
            record = {"width": width, "height": height, "load_ms": loaded_ms, **samples, "radial": radial,
                      "actual_drag_input_delivery_ms": drag_delivery_ms,
                      "actual_drag_to_finished_frame_ms": drag_ms, "pause_ui_response_ms": pause_ms}
            report["viewports"].append(record)
            assert samples["diagnostics"]["matrix_elements_mismatched"] == 0
            assert radial["diagnostics"]["matrix_elements_mismatched"] == 0
            print(json.dumps(record, ensure_ascii=False), flush=True)
            context.close()
        assert not report["errors"], report["errors"]
    except Exception as error:
        report["failure"] = str(error)
        raise
    finally:
        browser.close()
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(report, indent=2) + "\n")
