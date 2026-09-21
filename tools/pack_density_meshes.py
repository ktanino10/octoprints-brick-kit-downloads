"""Pack approved native vertices/faces for on-demand static viewing; no geometry is generated."""

import argparse
import gzip
import hashlib
import json
import math
from pathlib import Path
import struct

ROOT = Path(__file__).resolve().parents[1]


def pack_meshes(prototypes, *, mode="NATIVE_FLOAT32", precision_note=""):
    if prototypes.get("units") != "mm" or prototypes.get("origin") != "body-bottom-center" or not prototypes.get("types"):
        raise ValueError("Pack only actual millimeter native meshes with body-bottom-center origins")
    if mode not in {"NATIVE_FLOAT32", "NATIVE_PREVIEW_TESSELLATION"}:
        raise ValueError("Unsupported native mesh presentation mode")
    chunks = []
    metadata = []
    offset = 0
    maximum_error = 0.0
    for identifier, mesh in sorted(prototypes["types"].items()):
        vertices, faces = mesh["vertices"], mesh["faces"]
        if len(vertices) < 3 or not faces:
            raise ValueError("Empty actual native geometry")
        if any(len(point) != 3 or any(type(v) not in {float, int} or not math.isfinite(v) for v in point) for point in vertices):
            raise ValueError("Invalid actual native vertices")
        if any(len(face) != 3 or len(set(face)) != 3 or any(type(i) is not int or i < 0 or i >= len(vertices) for i in face) for face in faces):
            raise ValueError("Invalid actual native faces")
        position_bytes = b"".join(struct.pack("<3f", *point) for point in vertices)
        index_bytes = b"".join(struct.pack("<3I", *face) for face in faces)
        restored = struct.iter_unpack("<3f", position_bytes)
        error = max(abs(a - b) for before, after in zip(vertices, restored, strict=True) for a, b in zip(before, after, strict=True))
        maximum_error = max(error, maximum_error)
        metadata.append({
            "id": identifier, "vertex_count": len(vertices), "index_count": len(faces) * 3,
            "positions_byte_offset": offset, "indices_byte_offset": offset + len(position_bytes),
            "geometry_sha256": hashlib.sha256(position_bytes + index_bytes).hexdigest(),
            "maximum_float32_coordinate_error_mm": error,
        })
        chunks.extend([position_bytes, index_bytes])
        offset += len(position_bytes) + len(index_bytes)
    header = json.dumps({
        "schema_version": 1, "units": "mm", "origin": "body-bottom-center", "mode": mode,
        "precision_note": precision_note, "types": metadata,
    }, separators=(",", ":"), sort_keys=True).encode()
    preamble = b"OCBMESH1" + struct.pack("<I", len(header)) + header
    packed = preamble + b"\0" * (-len(preamble) % 4) + b"".join(chunks)
    return packed, {"types": metadata, "maximum_float32_coordinate_error_mm": maximum_error,
                    "vertex_and_face_counts_unchanged": True, "geometry_generated": False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, required=True, help="Exact approved native prototype file in owned READY staging")
    parser.add_argument("--source-sha256", required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--report", type=Path, required=True)
    parser.add_argument("--preview-tessellation", action="store_true")
    parser.add_argument("--precision-note", default="")
    args = parser.parse_args()
    for file in [args.input, args.output, args.report]:
        if file.is_symlink() or not file.resolve().is_relative_to(ROOT / ".archive-work"):
            raise ValueError("Pack only approved inputs and outputs in owned READY staging")
    if args.output.exists() or args.report.exists():
        raise ValueError("Refusing to overwrite a verified geometry pack")
    source = args.input.read_bytes()
    if hashlib.sha256(source).hexdigest() != args.source_sha256:
        raise ValueError("Native input differs from its approved hash")
    if args.preview_tessellation and not args.precision_note:
        raise ValueError("A distinct preview tessellation needs its native-source accuracy explanation")
    packed, evidence = pack_meshes(json.loads(source), mode="NATIVE_PREVIEW_TESSELLATION" if args.preview_tessellation else "NATIVE_FLOAT32",
                                  precision_note=args.precision_note)
    compressed = gzip.compress(packed, compresslevel=9, mtime=0)
    if len(compressed) >= 90_000_000:
        raise ValueError("Split the actual type library into smaller packs before Git publication")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(compressed)
    evidence.update(source_sha256=args.source_sha256, compressed_bytes=len(compressed),
                    uncompressed_bytes=len(packed), sha256=hashlib.sha256(compressed).hexdigest())
    args.report.write_text(json.dumps(evidence, indent=2) + "\n")
    print(json.dumps({key: value for key, value in evidence.items() if key != "types"}, indent=2))


if __name__ == "__main__":
    main()
