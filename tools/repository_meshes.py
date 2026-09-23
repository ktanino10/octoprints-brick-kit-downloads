"""Exact source-native mesh storage in the same public Git repository, outside Pages."""

import gzip
import hashlib
from pathlib import Path
import re
import subprocess

from symmetry_bounds import native_mesh_bounds

PREFIX = "viewer-data/copilot-symmetry-20260923/geometry/"
PUBLIC_RAW = "https://raw.githubusercontent.com/ktanino10/octoprints-brick-kit-downloads/"
PERMISSION = "PUBLIC_REPO_NATIVE_MESH_NOT_PAGES"


def repository_mesh_path(type_id):
    if not isinstance(type_id, str) or re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]{0,159}", type_id) is None:
        raise ValueError("Invalid native type identifier for the fixed repository mesh namespace")
    return PREFIX + type_id + ".mesh.gz"


def validate_native_payload(entry, data, geometry_sha256):
    expected = "geometry/" + entry["type_id"] + ".mesh.gz"
    if (entry.get("permission") != PERMISSION or entry.get("path") != expected
            or type(entry.get("bytes")) is not int or not 0 < entry["bytes"] < 90_000_000
            or len(data) != entry["bytes"] or hashlib.sha256(data).hexdigest() != entry.get("sha256")
            or data[:2] != b"\x1f\x8b"):
        raise ValueError("Repository-only native mesh differs from its explicit approved source bytes")
    repository_mesh_path(entry["type_id"])
    raw = gzip.decompress(data)
    bounds = native_mesh_bounds(raw)
    if hashlib.sha256(raw[12:]).hexdigest() != geometry_sha256:
        raise ValueError("Native Float32/index fingerprint changed before repository storage")
    return bounds


def pinned_mesh_descriptor(root, type_id, public_commit, source_descriptor):
    if not isinstance(public_commit, str) or re.fullmatch(r"[0-9a-f]{40}", public_commit) is None:
        raise ValueError("Repository-native geometry requires an immutable public commit")
    path = repository_mesh_path(type_id)
    root = Path(root).resolve()
    local = root / path
    if local.is_symlink() or not local.resolve().is_relative_to(root):
        raise ValueError("Repository-native geometry path escapes the owned checkout")
    data = local.read_bytes()
    bound = subprocess.check_output(["git", "-C", str(root), "cat-file", "blob", public_commit + ":" + path])
    if bound != data:
        raise ValueError("The descriptor would reference different bytes at its fixed public commit")
    if (source_descriptor.get("type_id") != type_id or source_descriptor.get("format") != "OBM1_GZIP"
            or source_descriptor.get("mode") not in {None, "NATIVE_FLOAT32"}
            or len(data) != source_descriptor["bytes"]
            or hashlib.sha256(data).hexdigest() != source_descriptor["sha256"]):
        raise ValueError("Pinned public native bytes differ from the accepted source geometry")
    validate_native_payload({
        "path": "geometry/" + type_id + ".mesh.gz", "type_id": type_id,
        "permission": PERMISSION, "bytes": len(data), "sha256": source_descriptor["sha256"],
    }, data, source_descriptor["geometry_sha256"])
    result = {key: value for key, value in source_descriptor.items()
              if key not in {"path", "url", "storage", "public_commit", "repository_path"}}
    result.update(storage="PUBLIC_REPO_COMMIT", repository_path=path, public_commit=public_commit,
                  url=PUBLIC_RAW + public_commit + "/" + path)
    return result


def verify_pinned_descriptor(root, file):
    if file.get("storage") != "PUBLIC_REPO_COMMIT" or "path" in file:
        raise ValueError("A pinned repository mesh must not masquerade as a Pages-relative file")
    expected = pinned_mesh_descriptor(root, file["type_id"], file["public_commit"], file)
    if expected != file:
        raise ValueError("Repository-native metadata does not bind its exact public origin, type path and commit")
    return file
