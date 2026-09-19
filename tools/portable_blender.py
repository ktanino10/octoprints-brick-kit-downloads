"""Run with Blender --background --factory-startup --disable-autoexec --python."""

import array
import hashlib
import json
from pathlib import Path
import sys

import bpy

ROOT = Path.cwd().resolve()
sys.path.insert(0, str(ROOT / "tools"))
from import_archive import clean_json


def geometry_digest():
    digest = hashlib.sha256()
    for mesh in sorted(bpy.data.meshes, key=lambda item: item.name):
        digest.update(mesh.name.encode())
        for collection, attribute, width, typecode in (
            (mesh.vertices, "co", 3, "f"),
            (mesh.loops, "vertex_index", 1, "i"),
            (mesh.polygons, "loop_total", 1, "i"),
            (mesh.polygons, "material_index", 1, "i"),
        ):
            values = array.array(typecode, [0]) * (len(collection) * width)
            collection.foreach_get(attribute, values)
            digest.update(values.tobytes())
    for obj in sorted(bpy.data.objects, key=lambda item: item.name):
        digest.update(obj.name.encode())
        digest.update(json.dumps([list(row) for row in obj.matrix_world]).encode())
        digest.update(str(getattr(obj.data, "name", None)).encode())
    return digest.hexdigest()


results = []
for path in sorted((ROOT / "artifacts").rglob("*.blend")):
    relative = path.relative_to(ROOT).as_posix()
    bpy.ops.wm.open_mainfile(filepath=str(path), load_ui=True, use_scripts=False)
    before = geometry_digest()
    if bpy.data.libraries or bpy.utils.blend_paths():
        raise ValueError(f"External native dependency requires review: {relative}")
    for screen in bpy.data.screens:
        for area in screen.areas:
            for space in area.spaces:
                if space.type == "FILE_BROWSER" and space.params:
                    space.params.directory = b"//"
    for scene in bpy.data.scenes:
        scene.render.filepath = "//renders/"
    for text in bpy.data.texts:
        if not text.name.endswith(".json"):
            raise ValueError(f"Unexpected embedded text: {relative}: {text.name}")
        original = json.loads(text.as_string())
        cleaned = clean_json(original, ROOT)
        if cleaned != original:
            text.clear()
            text.write(json.dumps(cleaned, ensure_ascii=False, separators=(",", ":")))
    bpy.context.preferences.filepaths.save_version = 0
    bpy.ops.wm.save_as_mainfile(filepath=relative, check_existing=False, compress=True, relative_remap=False)
    bpy.ops.wm.open_mainfile(filepath=str(path), load_ui=True, use_scripts=False)
    after = geometry_digest()
    if before != after:
        raise ValueError(f"Native geometry changed while saving: {relative}")
    results.append({
        "path": relative, "objects": len(bpy.data.objects), "meshes": len(bpy.data.meshes),
        "geometry_sha256_before": before, "geometry_sha256_after": after,
        "geometry_unchanged": True, "native_reopened": True,
        "change": "Blender File Browser directory and render output made relative; no remeshing.",
    })
    print("PORTABLE", relative, len(bpy.data.objects), before, flush=True)
(ROOT / ".archive-work/blender-portability.json").write_text(json.dumps(results, indent=2) + "\n")
