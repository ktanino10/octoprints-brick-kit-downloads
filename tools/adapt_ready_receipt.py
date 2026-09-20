"""Verify the private source handoff and generate a path-free public import receipt."""

import argparse
import hashlib
import json
from pathlib import Path

from revision_import import validate_receipt

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--handoff", type=Path, required=True)
parser.add_argument("--handoff-sha256", required=True)
parser.add_argument("--allowlist-sha256", required=True)
parser.add_argument("--source", type=Path, required=True)
args = parser.parse_args()
raw = args.handoff.read_bytes()
if hashlib.sha256(raw).hexdigest() != args.handoff_sha256:
    raise ValueError("Private READY handoff hash differs from the source owner's message")
handoff = json.loads(raw)
if handoff["state"] != "READY" or handoff["source_commit"] != "125ecacc0deb8c74819e4c1934ff3729d1a99791":
    raise ValueError("Unexpected READY state or fixed source commit")
prefix = f"artifacts/revisions/{handoff['revision']}/"
source = args.source.resolve()
revision_root = source / prefix
if revision_root.resolve() != Path(handoff["source_root"]).resolve():
    raise ValueError("The specified source worktree differs from the approved handoff")
allowlist = (revision_root / "public-inventory.json").read_bytes()
if hashlib.sha256(allowlist).hexdigest() != args.allowlist_sha256:
    raise ValueError("Public allowlist hash differs from the source owner's message")
if json.loads(allowlist)["files"] != handoff["files"]:
    raise ValueError("The handoff and explicit public allowlist differ")
receipt = {
    "schema_version": 1, "revision": handoff["revision"], "readiness": "READY_FOR_PUBLICATION",
    "source_commit": handoff["source_commit"], "catalog_path": prefix + handoff["catalog_path"],
    "physical_fit": "UNKNOWN", "slicing": "NOT_SLICED",
    "files": [{**entry, "path": prefix + entry["path"]} for entry in handoff["files"]],
}
validate_receipt(receipt)
output = ROOT / ".archive-work" / f"receipt-{handoff['revision']}.json"
output.parent.mkdir(exist_ok=True)
output.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n")
print(f"Verified READY handoff and allowlist; normalized {len(receipt['files'])} approved file entries without private paths.")
