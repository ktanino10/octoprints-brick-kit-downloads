"""Loopback-only project-subpath preview, including single-byte-range media responses."""

import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1] / "_site"
PREFIX = "/octoprints-brick-kit-downloads/"


class Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        name = unquote(urlsplit(path).path)
        if not name.startswith(PREFIX):
            return str(ROOT / "__not_published__")
        target = (ROOT / name[len(PREFIX):]).resolve()
        if not target.is_relative_to(ROOT) or any(part.startswith(".") for part in Path(name).parts):
            return str(ROOT / "__not_published__")
        return str(target)

    def send_head(self):
        self.byte_range = None
        path = Path(self.translate_path(self.path))
        header = self.headers.get("Range")
        if not header or not path.is_file():
            return super().send_head()
        match = re.fullmatch(r"bytes=(\d*)-(\d*)", header)
        size = path.stat().st_size
        if not match:
            self.send_error(416)
            return None
        left, right = match.groups()
        start = int(left) if left else max(0, size - int(right or 0))
        end = min(size - 1, int(right) if right and left else size - 1)
        if start > end or start >= size:
            self.send_error(416)
            return None
        file = path.open("rb")
        file.seek(start)
        self.byte_range = end - start + 1
        self.send_response(206)
        self.send_header("Content-type", self.guess_type(str(path)))
        self.send_header("Content-Length", str(self.byte_range))
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Accept-Ranges", "bytes")
        self.end_headers()
        return file

    def copyfile(self, source, outputfile):
        if self.byte_range is None:
            return super().copyfile(source, outputfile)
        remaining = self.byte_range
        while remaining:
            chunk = source.read(min(65536, remaining))
            if not chunk:
                break
            outputfile.write(chunk)
            remaining -= len(chunk)

    def log_message(self, format, *args):
        if args and str(args[1]) not in {"200", "206", "304"}:
            super().log_message(format, *args)


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--port", type=int, default=8859)
args = parser.parse_args()
server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
print(f"Preview ready on 127.0.0.1:{args.port}{PREFIX}", flush=True)
try:
    server.serve_forever()
finally:
    server.server_close()
