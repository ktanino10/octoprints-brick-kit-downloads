"""Read-only native scene fingerprints, shared by metadata sanitization and verification."""

import array
import hashlib
import json

import bpy


def geometry_digest():
    digest = hashlib.sha256()
    for mesh in sorted(bpy.data.meshes, key=lambda item: item.name):
        digest.update(mesh.name.encode())
        digest.update(json.dumps([getattr(material, "name", None) for material in mesh.materials]).encode())
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
        digest.update(json.dumps([getattr(slot.material, "name", None) for slot in obj.material_slots]).encode())
    return digest.hexdigest()


def appearance_records():
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
    return records


def appearance_digest():
    return hashlib.sha256(json.dumps(appearance_records(), sort_keys=True).encode()).hexdigest()


def animation_records():
    records = []
    for scene in sorted(bpy.data.scenes, key=lambda item: item.name):
        records.append(["scene", scene.name, scene.frame_start, scene.frame_end, scene.render.fps, scene.render.fps_base])
    for block in sorted([*bpy.data.objects, *bpy.data.scenes], key=lambda item: item.name):
        animation = block.animation_data
        if not animation:
            continue
        records.append(["block", block.name])
        for curve in animation.drivers:
            variables = []
            for variable in curve.driver.variables:
                variables.append([variable.name, variable.type, [
                    [getattr(target.id, "name", None), target.data_path,
                     getattr(target, "transform_type", None), getattr(target, "transform_space", None)]
                    for target in variable.targets]])
            records.append(["driver", curve.data_path, curve.array_index, curve.driver.type, curve.driver.expression, variables])
        action = animation.action
        if action:
            records.append(["action", action.name])
            curves = list(action.fcurves) if hasattr(action, "fcurves") else []
            if hasattr(action, "layers"):
                for layer in action.layers:
                    for strip in layer.strips:
                        if hasattr(strip, "channelbags"):
                            for bag in strip.channelbags:
                                curves.extend(bag.fcurves)
            for curve in sorted(curves, key=lambda item: (item.data_path, item.array_index)):
                records.append(["curve", curve.data_path, curve.array_index,
                    [[list(point.co), list(point.handle_left), list(point.handle_right), point.interpolation]
                     for point in curve.keyframe_points]])
    return records


def animation_digest():
    return hashlib.sha256(json.dumps(animation_records(), sort_keys=True).encode()).hexdigest()
