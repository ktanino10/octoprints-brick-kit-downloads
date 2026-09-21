"""Build thin, localized HTML entries from shared templates and explicit text catalogs."""

import argparse
import hashlib
from html import escape
from html.parser import HTMLParser
import json
from pathlib import Path, PurePosixPath
import posixpath
import re
from urllib.parse import urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parents[1]
ROUTES = json.loads((ROOT / "site/routes.json").read_text())
JP = re.compile(r"[\u3040-\u30ff\u3400-\u9fff]")
ATTRIBUTES = {"alt", "title", "placeholder", "aria-label", "aria-valuetext", "data-caption"}
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
DOCS = {
    "README.md": "README.en.md", "ATTRIBUTION.md": "ATTRIBUTION.en.md",
    "feedback/2026-09-19/README.md": "feedback/2026-09-19/README.en.md",
    "artifacts/selected/r2-20260919/TRIAL-GUIDE.md": "docs/TRIAL-GUIDE.en.md",
    "docs/COMMON-BLOCKS.ja.md": "docs/COMMON-BLOCKS.en.md",
}
registry_path = ROOT / "archive/revisions.json"
if registry_path.is_file():
    for revision in json.loads(registry_path.read_text())["revisions"]:
        if revision["generation"] != "common-blocks" or revision["availability"] != "AVAILABLE":
            continue
        base = f"artifacts/revisions/{revision['id']}/"
        source_catalog = json.loads((ROOT / revision["catalog_url"].lstrip("/")).read_text())
        for candidate in source_catalog["candidates"]:
            if candidate.get("assembly_guide_en_url"):
                DOCS[base + candidate["assembly_guide_url"]] = base + candidate["assembly_guide_en_url"]
        for trial in source_catalog.get("trial_sets", []):
            if trial.get("instructions_en_url"):
                DOCS[base + trial["instructions_url"]] = base + trial["instructions_en_url"]


def normalize(text):
    return re.sub(r"\s+", " ", text).strip()


def identifier(text):
    return hashlib.sha256(normalize(text).encode()).hexdigest()[:16]


class Collector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip = None
        self.messages = set()

    def add(self, text):
        if JP.search(text) or normalize(text) == "。":
            self.messages.add(normalize(text))

    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style"}:
            self.skip = tag
        for key, value in attrs:
            if value and (key in ATTRIBUTES or (tag == "meta" and key == "content")):
                self.add(value)

    def handle_endtag(self, tag):
        if tag == self.skip:
            self.skip = None

    def handle_data(self, text):
        if not self.skip:
            self.add(text)


def required_messages():
    pages = set()
    for route in ROUTES.values():
        collector = Collector()
        collector.feed((ROOT / "site/templates" / route["template"]).read_text())
        pages.update(collector.messages)
    runtime_path = ROOT / ".archive-work/i18n-runtime.json"
    runtime = set(json.loads(runtime_path.read_text())) if runtime_path.exists() else set()
    data = set()

    def collect(value):
        if isinstance(value, dict):
            for item in value.values():
                collect(item)
        elif isinstance(value, list):
            for item in value:
                collect(item)
        elif isinstance(value, str) and JP.search(value):
            data.add(normalize(value))
    paths = [ROOT / "artifacts/phase1/catalog.json",
             ROOT / "artifacts/selected/r2-20260919/catalog.json", ROOT / "archive/bundles.json"]
    paths += list((ROOT / "artifacts/phase1").glob("*/manifest.json"))
    paths += list((ROOT / "artifacts/selected/r2-20260919").glob("*/manifest.json"))
    publication_path = ROOT / "archive/revisions.json"
    if publication_path.is_file():
        for revision in json.loads(publication_path.read_text())["revisions"]:
            if revision["generation"] != "common-blocks" or revision["availability"] != "AVAILABLE":
                continue
            catalog_path = ROOT / revision["catalog_url"].lstrip("/")
            current = json.loads(catalog_path.read_text())
            paths.append(catalog_path)
            paths += [
                ROOT / candidate["manifest_url"].lstrip("/")
                if candidate["manifest_url"].startswith(("/", "artifacts/"))
                else catalog_path.parent / candidate["manifest_url"]
                for candidate in current["candidates"]
            ]
            paths.append(ROOT / revision["bundle_index_url"].lstrip("/"))
    for path in paths:
        collect(json.loads(path.read_text()))
    for filename in ["shape-study.json", "mona-study.json"]:
        comparison_pointer = ROOT / "archive" / filename
        if comparison_pointer.is_file():
            pointer = json.loads(comparison_pointer.read_text())
            if pointer["state"] == "READY":
                collect(json.loads((ROOT / pointer["data_url"].lstrip("/")).read_text()))
    return {"pages": sorted(pages), "runtime": sorted(runtime), "data": sorted(data)}


def catalogs():
    messages = {}
    for path in sorted((ROOT / "site/i18n").glob("*.en.json")):
        for source, target in json.loads(path.read_text()).items():
            if source in messages and messages[source] != target:
                raise ValueError(f"Conflicting translation: {source}")
            if not isinstance(target, str) or not target:
                raise ValueError(f"Missing translation: {source}")
            if set(re.findall(r"\{\d+\}", source)) != set(re.findall(r"\{\d+\}", target)):
                raise ValueError(f"Interpolation variables changed: {source}")
            messages[normalize(source)] = target
    return messages


def localized(route, locale):
    return f"{locale}/{route['localized']}"


class Renderer(HTMLParser):
    def __init__(self, key, locale, output, messages):
        super().__init__(convert_charrefs=True)
        self.key, self.locale, self.output, self.messages = key, locale, output, messages
        self.route = ROUTES[key]
        self.result = []
        self.stack = []
        self.head_open = False
        self.body_open = False
        self.root_open = False
        self.language_nav = False
        self.skip = None

    def relative(self, destination):
        result = posixpath.relpath(destination, str(PurePosixPath(self.output).parent))
        return result

    def translate(self, text):
        key = normalize(text)
        if not JP.search(key) and key != "。":
            return text
        if key not in self.messages:
            raise ValueError(f"Untranslated template: {self.key}: {key}")
        translated = self.messages[key] if self.locale == "en" else key
        return (" " if text[:1].isspace() else "") + translated + (" " if text[-1:].isspace() else "")

    def link(self, value, attribute, tag):
        url = urlsplit(value)
        if url.scheme or url.netloc or not url.path:
            return value
        canonical = posixpath.normpath(posixpath.join(str(PurePosixPath(self.route["legacy"]).parent), url.path))
        if canonical == "." or value.split("?")[0].split("#")[0].endswith("/"):
            canonical = posixpath.normpath(posixpath.join(canonical, "index.html"))
        if self.locale == "en" and canonical in DOCS:
            canonical = DOCS[canonical]
        for route in ROUTES.values():
            if canonical == route["legacy"]:
                canonical = localized(route, self.locale)
                break
        if attribute == "data-video-url":
            return canonical
        return urlunsplit(("", "", self.relative(canonical), url.query, url.fragment))

    def metadata(self):
        root = self.relative(".")
        self.result.append(f'<meta name="archive-root" content="{escape(root)}/">')
        for locale in ("ja", "en"):
            destination = self.relative(localized(self.route, locale))
            self.result.append(f'<link rel="alternate" hreflang="{locale}" href="{escape(destination)}">')
        self.result.append(f'<link rel="stylesheet" href="{escape(self.relative("assets/i18n.css"))}">')
        if self.key in {"history", "gallery-phase1", "gallery-selected"}:
            self.result.append(f'<script type="module" src="{escape(self.relative("assets/i18n.js"))}"></script>')

    def open_body(self, attrs=""):
        if self.body_open:
            return
        if self.head_open:
            self.metadata()
            self.result.append("</head>")
            self.head_open = False
        self.result.append(f"<body{attrs}>")
        self.body_open = True

    def navigation(self):
        if self.language_nav:
            return
        self.language_nav = True
        label = "表示言語" if self.locale == "ja" else "Page language"
        self.result.append(f'<nav class="language-switch" aria-label="{label}" data-i18n-ignore>')
        for locale, name in (("ja", "日本語"), ("en", "English")):
            href = self.relative(localized(self.route, locale))
            current = ' aria-current="page"' if locale == self.locale else ""
            self.result.append(f'<a href="{escape(href)}" lang="{locale}" hreflang="{locale}" data-language="{locale}"{current}>{name}</a>')
        self.result.append("</nav>")

    def handle_decl(self, decl):
        pass

    def handle_starttag(self, tag, attrs):
        if tag == "html":
            self.root_open = True
            self.result.append(f'<!doctype html><html lang="{self.locale}" data-archive-page="{self.key}"><head>')
            self.head_open = True
            return
        if tag == "head":
            return
        if tag == "body":
            rendered = "".join(f' {k}="{escape(v, quote=True)}"' if v is not None else f" {k}" for k, v in attrs)
            self.open_body(rendered)
            return
        if self.head_open and tag not in {"meta", "title", "link", "script", "style", "noscript"}:
            self.open_body()
        if self.body_open and not self.language_nav and tag in {"main", "h1"}:
            self.navigation()
        updated = []
        for attribute, value in attrs:
            if value is not None and attribute in {"href", "src", "poster", "data-video-url"}:
                value = self.link(value, attribute, tag)
            if value is not None and (attribute in ATTRIBUTES or (tag == "meta" and attribute == "content")) and JP.search(value):
                updated.append((f"data-l10n-{attribute}", identifier(value)))
                value = self.translate(value)
            updated.append((attribute, value))
        self.result.append("<" + tag + "".join(
            f' {name}="{escape(value, quote=True)}"' if value is not None else f" {name}"
            for name, value in updated) + ">")
        if tag not in VOID:
            self.stack.append(tag)
        if tag == "title":
            self.title_index = len(self.result) - 1
        if tag in {"script", "style"}:
            self.skip = tag

    def handle_endtag(self, tag):
        if tag == "head":
            if self.head_open:
                self.metadata()
                self.result.append("</head>")
                self.head_open = False
            return
        if tag == "body":
            return
        if tag == "html":
            if not self.language_nav:
                self.navigation()
            self.result.append("</body></html>")
            return
        self.result.append(f"</{tag}>")
        if tag == self.skip:
            self.skip = None
        if self.stack and self.stack[-1] == tag:
            self.stack.pop()
        if tag == "header":
            self.navigation()

    def handle_data(self, text):
        if self.skip:
            self.result.append(text)
            return
        if JP.search(text) or normalize(text) == "。":
            if self.stack and self.stack[-1] == "title":
                self.result[self.title_index] = self.result[self.title_index][:-1] + f' data-l10n-text="{identifier(text)}">'
                self.result.append(escape(self.translate(text)))
            else:
                self.result.append(f"<!--l10n:{identifier(text)}-->" + escape(self.translate(text)))
        else:
            self.result.append(escape(text))

    def handle_comment(self, data):
        if not data.startswith("l10n:"):
            self.result.append(f"<!--{data}-->")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("operation", choices=("extract", "build"))
    args = parser.parse_args()
    required = required_messages()
    if args.operation == "extract":
        output = ROOT / ".archive-work/i18n-required.json"
        output.parent.mkdir(exist_ok=True)
        output.write_text(json.dumps(required, ensure_ascii=False, indent=2) + "\n")
        print({key: len(values) for key, values in required.items()})
        return
    messages = catalogs()
    missing = set().union(*map(set, required.values())) - set(messages)
    if missing:
        raise ValueError(f"{len(missing)} missing translations: {sorted(missing)[:8]}")
    for key, route in ROUTES.items():
        for locale, output in [("ja", route["legacy"]), ("ja", localized(route, "ja")), ("en", localized(route, "en"))]:
            renderer = Renderer(key, locale, output, messages)
            renderer.feed((ROOT / "site/templates" / route["template"]).read_text())
            path = ROOT / output
            path.parent.mkdir(parents=True, exist_ok=True)
            formatted = "\n".join(line.rstrip() for line in "".join(renderer.result).splitlines()).rstrip() + "\n"
            path.write_text(formatted)
    source_ids = {identifier(key): key for key in messages}
    payload = {"messages": messages, "sourceIds": source_ids, "routes": ROUTES, "docs": DOCS}
    (ROOT / "assets/translations.js").write_text(
        "// Generated by tools/localize_pages.py from reviewed local catalogs.\n"
        + "export default " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n")
    print(f"Built {len(ROUTES) * 3} thin HTML entries using {len(messages)} shared messages; binary assets were not copied.")


if __name__ == "__main__":
    main()
