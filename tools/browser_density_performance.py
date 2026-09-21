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
parser.add_argument("--case", required=True)
parser.add_argument("--output", type=Path, required=True)
args = parser.parse_args()
base = args.url.rstrip("/") + "/"
report = {"base": base, "case_id": args.case, "scope": "ACTUAL_NATIVE_CASE_INTERACTION_MEASUREMENTS",
          "errors": [], "viewports": []}

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path=args.browser, headless=True,
                                        args=["--no-first-run", "--disable-background-networking", "--disable-sync"])
    try:
        for width, height in [(1440, 1000), (390, 844)]:
            context = browser.new_context(viewport={"width": width, "height": height}, reduced_motion="reduce")
            page = context.new_page()
            page.on("pageerror", lambda error: report["errors"].append(str(error)))
            start = time.monotonic()
            page.goto(urljoin(base, f"en/density-guide.html?case={args.case}"), wait_until="domcontentloaded")
            expect(page.locator("#density-canvas")).to_have_attribute("data-ready", "true", timeout=180000)
            expect(page.locator("#guide-error")).to_be_hidden()
            loaded_ms = (time.monotonic() - start) * 1000
            samples = page.evaluate("""async () => {
              const canvas = document.querySelector('#density-canvas canvas');
              const gl = canvas.getContext('webgl2');
              const frames = [];
              for (let index = 0; index < 5; index++) {
                const start = performance.now();
                canvas.dispatchEvent(new KeyboardEvent('keydown', {key:'ArrowLeft', bubbles:true}));
                await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
                gl.finish();
                frames.push(performance.now() - start);
              }
              return {frames_ms: frames, diagnostics: window.__densityGuide.diagnostics(),
                renderer: gl.getParameter(gl.RENDERER), vendor: gl.getParameter(gl.VENDOR)};
            }""")
            page.locator("#guide-mode").select_option("radial")
            radial = page.locator("#guide-explode").evaluate("""async input => {
              const start = performance.now();
              input.value = '100'; input.dispatchEvent(new Event('input',{bubbles:true}));
              await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve))));
              document.querySelector('#density-canvas canvas').getContext('webgl2').finish();
              return {input_to_finished_frame_ms: performance.now() - start,
                diagnostics: window.__densityGuide.diagnostics()};
            }""")
            record = {"width": width, "height": height, "load_ms": loaded_ms, **samples, "radial": radial}
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
