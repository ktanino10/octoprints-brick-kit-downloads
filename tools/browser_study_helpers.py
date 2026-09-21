"""Shared assertions for localized, uncropped static comparison pages."""

from playwright.sync_api import expect


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


def uncropped_image(image):
    expect(image).not_to_have_js_property("naturalWidth", 0)
    measurements = image.evaluate("""img => {
      const box = img.getBoundingClientRect(), style = getComputedStyle(img);
      return {height: box.height, expected: box.width * img.naturalHeight / img.naturalWidth, fit: style.objectFit};
    }""")
    assert abs(measurements["height"] - measurements["expected"]) <= 1, measurements
    assert measurements["fit"] == "contain", measurements
