"""Verify route parity, explicit locales, translation coverage and frozen artifact bytes."""

import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re

from localize_pages import ROUTES, catalogs, required_messages

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.lang = None
        self.root = None
        self.language_links = []
        self.scripts = []
        self.images = []
        self.skip = []
        self.text = []

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == "html":
            self.lang = attrs.get("lang")
        if tag == "meta" and attrs.get("name") == "archive-root":
            self.root = attrs.get("content")
        if "data-language" in attrs:
            self.language_links.append(attrs["data-language"])
        if tag == "script" and "src" in attrs:
            self.scripts.append(attrs["src"])
        if tag == "img" and "src" in attrs:
            self.images.append(attrs["src"])
        if tag in {"script", "style"} or "data-i18n-ignore" in attrs:
            self.skip.append(tag)

    def handle_endtag(self, tag):
        if self.skip and self.skip[-1] == tag:
            self.skip.pop()

    def handle_data(self, value):
        if not self.skip:
            self.text.append(value)


def main():
    messages = catalogs()
    required = set().union(*map(set, required_messages().values()))
    assert required <= set(messages), sorted(required - set(messages))
    assert not any(re.search(r"[\u3040-\u30ff\u3400-\u9fff]", value) for value in messages.values()), "Japanese remains in an English message"
    routes = 0
    for definition in ROUTES.values():
        for locale, name in [("ja", definition["legacy"]), ("ja", "ja/" + definition["localized"]), ("en", "en/" + definition["localized"])]:
            path = ROOT / name
            page = Page()
            page.feed(path.read_text())
            assert page.lang == locale, name
            assert sorted(page.language_links) == ["en", "ja"], name
            assert page.root and (path.parent / page.root).resolve() == ROOT, name
            if locale == "en":
                assert not re.search(r"[\u3040-\u30ff\u3400-\u9fff]", "".join(page.text)), name
            for reference in page.images + page.scripts:
                if reference.startswith(("https:", "http:")):
                    raise AssertionError(f"External runtime dependency: {reference}")
                target = (path.parent / reference).resolve()
                assert target.is_relative_to(ROOT) and target.is_file(), (name, reference)
                assert not target.is_relative_to(ROOT / locale), f"Duplicated language-specific binary/runtime asset: {reference}"
            routes += 1
    frozen = json.loads((ROOT / "site/immutable-artifacts.json").read_text())
    for entry in frozen["files"]:
        path = ROOT / entry["path"]
        assert path.stat().st_size == entry["bytes"], entry["path"]
        assert hashlib.sha256(path.read_bytes()).hexdigest() == entry["sha256"], entry["path"]
    assert json.loads((ROOT / "archive/bundles.json").read_text())["tag"] == "archive-2026-09-19-r2"
    print(f"Bilingual checks passed: {routes} routes, {len(messages)} explicit messages, {len(frozen['files'])} unchanged artifact files.")


if __name__ == "__main__":
    main()
