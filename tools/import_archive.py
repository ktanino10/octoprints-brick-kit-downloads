"""Import only explicitly enumerated deliverables, never a production checkout."""

import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
import xml.etree.ElementTree as ET
import zipfile

REVISION = "r2-20260919"
SOURCE_COMMIT = "88be7521001fc09843aa125309329f6345adf468"
CHARACTERS = ("mona", "copilot", "ducky")
STYLES = ("chunky", "balanced", "fine")
SELECTED = ("mona-fine", "copilot-chunky", "ducky-fine")
OMIT_KEYS = {
    "invocation", "invocations", "commands", "command", "cwd", "environment",
    "python_executable", "native_modules", "selection_authority", "authorization_gates",
    "run_id", "run_dir", "log", "log_path", "stdout", "stderr", "logs",
    "parent_action", "parent_action_requires_upward_insertion", "metadata_amendment",
}
LOCAL_PATH = re.compile(r"(?:/Users/|/home/|/private/|/var/folders/|/tmp/|/Applications/|/opt/homebrew/|/usr/local/)[^\s\"<>]*")
SESSION = re.compile(r"(?:creator |parent )?session\s+[0-9a-f-]{36}", re.I)


def sha(path):
    return hashlib.file_digest(path.open("rb"), "sha256").hexdigest()


def selected_files(source):
    files = set()

    def add(path):
        p = source / path
        if not p.is_file() or p.is_symlink() or not p.resolve().is_relative_to(source):
            raise ValueError(f"Missing or unsafe deliverable: {path}")
        files.add(path)

    def glob(directory, pattern):
        for p in sorted((source / directory).glob(pattern)):
            if p.is_file():
                add(p.relative_to(source).as_posix())

    for name in ("catalog.json", "gallery.html", "contact-sheet.jpg",
                 "mona-comparison.jpg", "copilot-comparison.jpg", "ducky-comparison.jpg",
                 "evidence/validation.json"):
        add(f"artifacts/phase1/{name}")
    for character in CHARACTERS:
        for style in STYLES:
            base = f"artifacts/phase1/{character}-{style}"
            for name in ("preview.png", "scene.blend", "manifest.json", "bom.csv", "bom-summary.csv",
                         "render-evidence.json", "still-stats.json"):
                add(f"{base}/{name}")
            if style == "balanced":
                for name in ("turntable.mp4", "video-evidence.json", "video-stats.json"):
                    add(f"{base}/{name}")
    for name in ("NativeLibrary.FCStd", "coupon.FCStd", "coupon-guide.json", "prototypes.json",
                 "evidence.json", "mesh-validation.json", "native-build.json", "native-verify.json"):
        add(f"artifacts/cad/{name}")
    for directory in ("bricks", "coupons"):
        for extension in ("stl", "step"):
            glob(f"artifacts/cad/{directory}", f"*.{extension}")
    base = f"artifacts/selected/{REVISION}"
    for name in ("TRIAL-GUIDE.md", "fit-results-blank.csv", "catalog.json", "type-plan.json",
                 "comparison.jpg", "comparison-review.jpg", "gallery.html", "evidence/geometry.json"):
        add(f"{base}/{name}")
    for candidate in SELECTED:
        for name in ("preview.png", "scene.blend", "turntable.mp4", "manifest.json", "bom.csv",
                     "bom-summary.csv", "assembly-steps.csv", "assembly-repair.json",
                     "render-evidence.json", "video-evidence.json", "still-stats.json",
                     "video-stats.json", "video-probe.json"):
            add(f"{base}/{candidate}/{name}")
    for directory in ("libraries", "assemblies", "bricks", "trial", "proof"):
        for extension in ("FCStd", "stl", "step", "3mf", "json", "csv"):
            glob(f"{base}/cad/{directory}", f"**/*.{extension}")
    for extension in ("FCStd", "stl", "step", "json"):
        glob(f"{base}/cad/aids", f"*.{extension}")
    for extension in ("stl", "step"):
        glob(f"{base}/cad/aids/parts", f"*.{extension}")
    for name in ("contract.json", "prototypes.json", "evidence.json", "mesh-validation.json",
                 "native-library-p4.json", "native-library-p8.json", "verify-assemblies.json",
                 "verify-joint-proof.json", "verify-library-p4.json", "verify-library-p8.json",
                 "verify-trial-p4.json", "verify-trial-p8.json"):
        add(f"{base}/cad/{name}")
    add("artifacts/selected/current.json")
    for name in ("connector.json", "selected-connectors-v2.json", "selected-designs.json"):
        add(f"design/{name}")
    return sorted(files)


def clean_json(value, source):
    if isinstance(value, dict):
        return {key: clean_json(item, source) for key, item in value.items() if key not in OMIT_KEYS}
    if isinstance(value, list):
        return [clean_json(item, source) for item in value]
    if isinstance(value, str):
        if SESSION.search(value):
            return "Contributor-approved design record; manufacturing approval is not implied."
        value = value.replace(str(source) + "/", "")
        return LOCAL_PATH.sub("[local-metadata-removed]", value)
    return value


def sanitize_native(path):
    """FCStd is a ZIP of XML properties and shape streams; keep shapes unchanged."""
    with zipfile.ZipFile(path) as z:
        entries = [(entry, z.read(entry)) for entry in z.infolist()]
    output = []
    edits = 0
    for entry, data in entries:
        if entry.filename.endswith(".xml"):
            tree = ET.fromstring(data)
            changed = False
            if entry.filename == "Document.xml":
                props = tree.find("Properties")
                values = {
                    "CreatedBy": "", "LastModifiedBy": "", "Company": "",
                    "License": "CC BY-NC 4.0",
                    "LicenseURL": "https://creativecommons.org/licenses/by-nc/4.0/",
                }
                for prop in props.findall("Property"):
                    name = prop.get("name")
                    field = prop.find("String")
                    if name in values and field is not None and field.get("value") != values[name]:
                        field.set("value", values[name])
                        changed = True
            for node in tree.iter():
                for key, value in node.attrib.items():
                    if LOCAL_PATH.search(value):
                        raise ValueError(f"Native reference needs explicit review: {path.name} {node.tag}.{key}")
            if changed:
                data = ET.tostring(tree, encoding="utf-8", xml_declaration=True)
                edits += 1
        output.append((entry, data))
    if edits:
        with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
            for entry, data in output:
                z.writestr(entry, data)
    return edits


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("operation", choices=("inventory", "copy"))
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--root", type=Path, default=Path.cwd())
    args = parser.parse_args()
    root = args.root.resolve()
    source = args.source.resolve()
    files = selected_files(source)
    inventory_path = root / "archive/source-inventory.json"
    inventory = {
        "schema_version": 1,
        "source_revision": SOURCE_COMMIT,
        "scope": "Allowlisted deliverables only. No repository history or execution environment.",
        "files": [{"path": name, "bytes": (source / name).stat().st_size,
                   "sha256": sha(source / name)} for name in files],
    }
    if args.operation == "inventory":
        inventory_path.parent.mkdir(exist_ok=True)
        inventory_path.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n")
        print(json.dumps({"files": len(files), "bytes": sum(f["bytes"] for f in inventory["files"]),
                          "largest": max(inventory["files"], key=lambda f: f["bytes"])}, indent=2))
        return
    if not inventory_path.exists() or json.loads(inventory_path.read_text()) != inventory:
        raise ValueError("Inventory must be created and reviewed before copying; source must be unchanged.")
    changes_path = root / ".archive-work/import-changes.json"
    modifications = json.loads(changes_path.read_text()) if changes_path.exists() else []
    previous_hashes = {item["path"]: item["public_sha256"] for item in modifications}
    for entry in inventory["files"]:
        relative = entry["path"]
        target = root / relative
        if target.exists():
            if sha(target) in {entry["sha256"], previous_hashes.get(relative)}:
                continue
            raise ValueError(f"Refusing to overwrite a modified file: {relative}")
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source / relative, target)
        if target.suffix == ".json":
            original = json.loads(target.read_text())
            cleaned = clean_json(original, source)
            if cleaned != original:
                target.write_text(json.dumps(cleaned, ensure_ascii=False, separators=(",", ":")) + "\n")
        if target.suffix == ".FCStd":
            sanitize_native(target)
        if sha(target) != entry["sha256"]:
            modifications.append({"path": relative, "source_sha256": entry["sha256"],
                                  "public_sha256": sha(target),
                                  "change": "Removed execution/local metadata or corrected native document license; no geometry edits."})
    viewer_paths = subprocess.check_output(
        ["git", "-C", str(source), "ls-tree", "-r", "--name-only", SOURCE_COMMIT, "viewer"],
        text=True).splitlines()
    for name in viewer_paths:
        if not (name.startswith("viewer/src/") or name in {
            "viewer/index.html", "viewer/package.json", "viewer/package-lock.json",
            "viewer/scripts/build.mjs", "viewer/assets/mark.svg", "viewer/THIRD_PARTY_LICENSES.txt",
            "viewer/tests/data.test.mjs", "viewer/tests/geometry.test.mjs",
            "viewer/tests/selected-data.test.mjs", "viewer/tests/selected-fixtures.mjs",
        }):
            continue
        data = subprocess.check_output(["git", "-C", str(source), "show", f"{SOURCE_COMMIT}:{name}"])
        path = root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
    (root / ".archive-work").mkdir(exist_ok=True)
    (root / ".archive-work/import-changes.json").write_text(json.dumps(modifications, indent=2) + "\n")
    print(f"Copied {len(files)} allowlisted files; metadata derivatives: {len(modifications)}. Viewer: committed source only.")


if __name__ == "__main__":
    main()
