"""Reopen extracted, portable FreeCAD documents without recomputing or saving."""

import argparse
import hashlib
import json
from pathlib import Path

import FreeCAD

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--root", type=Path, required=True)
parser.add_argument("--output", type=Path, required=True)
args = parser.parse_args()
root = args.root.resolve()
workspace = Path(__file__).resolve().parents[1]
if not root.is_relative_to(workspace / ".archive-work") or root == workspace / ".archive-work":
    raise ValueError("Native reopening must use an extracted bundle in owned staging")
if any(path.is_symlink() for path in root.rglob("*")):
    raise ValueError("Native staging contains symlinks")
if not args.output.resolve().is_relative_to(workspace / ".archive-work"):
    raise ValueError("Native verification reports must stay in owned staging")
records = []
files = sorted(root.rglob("*.FCStd"))
if not files:
    raise ValueError("No native documents were found in the staged revision")
for path in files:
    before = path.read_bytes()
    doc = FreeCAD.openDocument(str(path))
    links = [obj for obj in doc.Objects if obj.TypeId == "App::Link"]
    resolved = 0
    instances = 0
    checked_shapes = set()
    for link in links:
        target = link.LinkedObject
        if isinstance(target, tuple):
            target = target[0]
        visited = set()
        while target is not None and target.TypeId == "App::Link":
            identity = (target.Document.Name, target.Name)
            if identity in visited:
                raise ValueError(f"Cyclic native link: {path.name}: {link.Name}")
            visited.add(identity)
            target = target.LinkedObject
            if isinstance(target, tuple):
                target = target[0]
        if target is None or target.Document is None:
            raise ValueError(f"Unresolved native link: {path.name}: {link.Name}")
        if hasattr(target, "Shape") and target.Shape.isNull():
            raise ValueError(f"Linked native shape is empty: {path.name}: {link.Name}")
        identity = (target.Document.Name, target.Name)
        if "assemblies" in path.parts and identity not in checked_shapes:
            if not hasattr(target, "Shape") or not target.Shape.isValid() or len(target.Shape.Solids) != 1 or target.Shape.Volume <= 0:
                raise ValueError(f"Assembly target is not one valid native solid: {path.name}: {link.Name}")
            checked_shapes.add(identity)
        resolved += 1
        instances += max(1, getattr(link, "ElementCount", 0))
    proxy_objects = [obj.Name for obj in doc.Objects if getattr(obj, "Proxy", None)]
    if proxy_objects:
        raise ValueError(f"Unexpected Python proxy: {path.name}")
    record = {
        "path": path.relative_to(root).as_posix(),
        "document_objects": len(doc.Objects),
        "native_links_resolved": resolved,
        "link_instances": instances,
        "valid_single_solid_targets_checked": len(checked_shapes),
        "proxy_free": True, "opened": True, "recomputed": False, "saved": False,
        "sha256": hashlib.sha256(before).hexdigest(),
    }
    records.append(record)
    print("REOPEN", record, flush=True)
    for name in list(FreeCAD.listDocuments()):
        FreeCAD.closeDocument(name)
    if path.read_bytes() != before:
        raise ValueError(f"Read-only native verification changed {path.name}")
args.output.parent.mkdir(parents=True, exist_ok=True)
args.output.write_text(json.dumps({"freecad_version": ".".join(FreeCAD.Version()[:3]),
                                 "documents": records}, indent=2) + "\n")
