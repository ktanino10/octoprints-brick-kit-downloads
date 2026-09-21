"""Run with Blender --background --factory-startup --disable-autoexec --python."""

import array
import argparse
import hashlib
import json
from pathlib import Path
import re
import sys

import bpy

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
from import_archive import clean_json

parser = argparse.ArgumentParser(description=__doc__)
scope = parser.add_mutually_exclusive_group(required=True)
scope.add_argument("--revision")
scope.add_argument("--study", choices=["part-count-matrix-20260921"])
parser.add_argument("--stage-root", type=Path, required=True)
parser.add_argument("--report", type=Path, required=True)
args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])
stage = args.stage_root.resolve()
if not stage.is_relative_to(ROOT / ".archive-work") or stage == ROOT / ".archive-work":
    raise ValueError("Native publication metadata may only be edited in an owned revision staging directory")
if args.revision and not re.fullmatch(r"r3-[a-zA-Z0-9._-]+", args.revision):
    raise ValueError("Invalid revision")
artifact_root = stage / "artifacts" / ("revisions" if args.revision else "studies") / (args.revision or args.study)
if not artifact_root.is_dir() or not artifact_root.resolve().is_relative_to(stage) or any(path.is_symlink() for path in artifact_root.rglob("*")):
    raise ValueError("Missing or symlinked revision staging inputs")
report_path = args.report.resolve()
if not report_path.is_relative_to(ROOT / ".archive-work"):
    raise ValueError("Native validation report must stay in owned staging")


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


def appearance_digest():
    records = []
    for material in sorted(bpy.data.materials, key=lambda item: item.name):
        nodes = []
        if material.use_nodes and material.node_tree:
            for node in material.node_tree.nodes:
                inputs = []
                for socket in node.inputs:
                    if not hasattr(socket, "default_value"):
                        continue
                    value = socket.default_value
                    if isinstance(value, (float, int, str, bool)):
                        normalized = value
                    elif value is None:
                        normalized = None
                    elif hasattr(value, "__len__") and all(isinstance(item, (int, float)) for item in value):
                        normalized = list(value)
                    else:
                        continue
                    inputs.append([socket.name, normalized])
                nodes.append([node.name, node.type, inputs])
        records.append([material.name, list(material.diffuse_color), material.use_nodes, nodes])
    return hashlib.sha256(json.dumps(records, sort_keys=True).encode()).hexdigest()


def animation_digest():
    digest = hashlib.sha256()
    for scene in sorted(bpy.data.scenes, key=lambda item: item.name):
        digest.update(json.dumps([scene.name, scene.frame_start, scene.frame_end, scene.render.fps,
                                  scene.render.fps_base]).encode())
    for block in sorted([*bpy.data.objects, *bpy.data.scenes], key=lambda item: item.name):
        animation = block.animation_data
        if not animation:
            continue
        digest.update(block.name.encode())
        for curve in animation.drivers:
            variables = []
            for variable in curve.driver.variables:
                variables.append([variable.name, variable.type, [
                    [getattr(target.id, "name", None), target.data_path,
                     getattr(target, "transform_type", None), getattr(target, "transform_space", None)]
                    for target in variable.targets]])
            digest.update(json.dumps([curve.data_path, curve.array_index, curve.driver.type,
                                      curve.driver.expression, variables], sort_keys=True).encode())
        action = animation.action
        if action:
            digest.update(action.name.encode())
            curves = list(action.fcurves) if hasattr(action, "fcurves") else []
            if hasattr(action, "layers"):
                for layer in action.layers:
                    for strip in layer.strips:
                        if hasattr(strip, "channelbags"):
                            for bag in strip.channelbags:
                                curves.extend(bag.fcurves)
            for curve in sorted(curves, key=lambda item: (item.data_path, item.array_index)):
                digest.update(json.dumps([curve.data_path, curve.array_index,
                    [[list(point.co), list(point.handle_left), list(point.handle_right), point.interpolation]
                     for point in curve.keyframe_points]]).encode())
    return digest.hexdigest()


results = []
files = sorted(artifact_root.rglob("*.blend"))
if not files:
    raise ValueError("No actual Blender scenes in the ready staging input")
for path in files:
    relative = path.relative_to(stage).as_posix()
    input_hash = hashlib.sha256(path.read_bytes()).hexdigest()
    bpy.ops.wm.open_mainfile(filepath=str(path), load_ui=True, use_scripts=False)
    before = geometry_digest()
    colors_before = appearance_digest()
    animation_before = animation_digest()
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
    bpy.ops.wm.save_as_mainfile(filepath=path.relative_to(ROOT).as_posix(), check_existing=False, compress=True, relative_remap=False)
    bpy.ops.wm.open_mainfile(filepath=str(path), load_ui=True, use_scripts=False)
    after = geometry_digest()
    colors_after = appearance_digest()
    animation_after = animation_digest()
    if before != after or colors_before != colors_after or animation_before != animation_after:
        raise ValueError(f"Native geometry changed while saving: {relative}")
    results.append({
        "path": relative, "objects": len(bpy.data.objects), "meshes": len(bpy.data.meshes),
        "geometry_sha256_before": before, "geometry_sha256_after": after,
        "geometry_unchanged": True, "native_reopened": True,
        "input_sha256": input_hash, "public_sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        "appearance_sha256_before": colors_before, "appearance_sha256_after": colors_after,
        "material_parameters_unchanged": True,
        "animation_sha256_before": animation_before, "animation_sha256_after": animation_after,
        "animation_parameters_unchanged": True,
        "change": "Blender File Browser directory and render output made relative; no remeshing.",
    })
    print("PORTABLE", relative, len(bpy.data.objects), before, flush=True)
report_path.parent.mkdir(parents=True, exist_ok=True)
report_path.write_text(json.dumps(results, indent=2) + "\n")
