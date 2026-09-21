"""Compare evaluated motion of original and metadata-sanitized staged scenes without saving."""

import argparse
import hashlib
import json
from pathlib import Path
import sys

import bpy

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--original", type=Path, required=True)
parser.add_argument("--public", type=Path, required=True)
parser.add_argument("--output", type=Path, required=True)
parser.add_argument("--frame", action="append", type=int, default=[], help="Additional actual sequence-boundary frames to compare")
args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])
if any(frame < 1 or frame > 144 for frame in args.frame):
    raise ValueError("Matrix animation samples must remain within the actual 144-frame movie")
for path in [args.original, args.public, args.output]:
    if path.is_symlink() or not path.resolve().is_relative_to(ROOT / ".archive-work"):
        raise ValueError("Read only original/public copies in owned staging")


def inspect(path):
    file_hash = hashlib.sha256(path.read_bytes()).hexdigest()
    bpy.ops.wm.open_mainfile(filepath=str(path), load_ui=True, use_scripts=False)
    result = []
    for frame in [1, *sorted({54, 72, 73, 144, *args.frame} - {1}), 1]:
        bpy.context.scene.frame_set(frame)
        bpy.context.view_layer.update()
        graph = bpy.context.evaluated_depsgraph_get()
        graph.update()
        records = []
        instances = 0
        for item in graph.object_instances:
            if item.is_instance:
                instances += 1
            records.append([item.object.original.name, item.is_instance,
                            [list(row) for row in item.matrix_world], tuple(item.persistent_id)])
        records.sort(key=lambda row: json.dumps(row, separators=(",", ":")))
        result.append({"frame": frame, "evaluated_instances": instances, "objects_and_instances": len(records),
                       "evaluated_pose_sha256": hashlib.sha256(json.dumps(records, separators=(",", ":")).encode()).hexdigest()})
    if hashlib.sha256(path.read_bytes()).hexdigest() != file_hash:
        raise ValueError("Read-only animated scene inspection modified the file")
    return {"sha256": file_hash, "frames": result}


before, after = inspect(args.original), inspect(args.public)
if before["frames"] != after["frames"]:
    raise ValueError("Actual evaluated animation changed during metadata sanitization")
if before["frames"][0] != before["frames"][-1]:
    raise ValueError("The saved scene does not return to the same evaluated frame-1 poses")
args.output.write_text(json.dumps({"original_sha256": before["sha256"], "public_sha256": after["sha256"],
                                  "evaluated_frames": after["frames"], "motion_unchanged": True,
                                  "frame1_roundtrip_no_drift": True, "recomputed_geometry": False}, indent=2) + "\n")
print("PASS: original and public-copy evaluated motion agree at every declared sample frame.")
