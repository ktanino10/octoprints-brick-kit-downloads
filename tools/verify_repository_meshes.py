"""Fetch explicitly pinned public native meshes anonymously and verify CORS and exact bytes."""

import argparse
from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
from urllib.request import HTTPRedirectHandler, Request, build_opener

from repository_meshes import pinned_mesh_descriptor, validate_native_payload, PERMISSION

ROOT = Path(__file__).resolve().parents[1]


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ValueError("Pinned native geometry must not redirect to another resource")


def verify_file(file):
    request = Request(file["url"], headers={
        "User-Agent": "Octoprints-pinned-native-verifier/1.0",
        "Origin": "https://ktanino10.github.io", "Accept-Encoding": "identity",
    })
    with build_opener(NoRedirect).open(request, timeout=120) as response:
        if (response.status != 200 or response.geturl() != file["url"]
                or response.headers.get("Access-Control-Allow-Origin") != "*"
                or response.headers.get_content_type() != "application/octet-stream"):
            raise ValueError("Pinned native mesh lacks the expected anonymous CORS/MIME response")
        raw = response.read(file["bytes"] + 1)
    validate_native_payload({
        "path": "geometry/" + file["type_id"] + ".mesh.gz", "type_id": file["type_id"],
        "bytes": file["bytes"], "sha256": file["sha256"], "permission": PERMISSION,
    }, raw, file["geometry_sha256"])
    return {**file, "http_status": 200, "cors_allow_origin": "*",
            "content_type": "application/octet-stream", "authentication": "none",
            "decoded_native_geometry_verified": True}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--public-commit", required=True)
    parser.add_argument("--stage", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    if not args.stage.resolve().is_relative_to(ROOT / ".archive-work") or not args.output.resolve().is_relative_to(ROOT / ".archive-work"):
        raise ValueError("Keep mesh verification inputs and evidence in owned staging")
    installed = json.loads((args.stage / "repository-mesh-install.json").read_text())
    descriptors = [
        pinned_mesh_descriptor(ROOT, row["type_id"], args.public_commit, {
            "type_id": row["type_id"], "format": "OBM1_GZIP",
            "bytes": row["bytes"], "sha256": row["sha256"], "geometry_sha256": row["geometry_sha256"],
        }) for row in installed["files"]
    ]
    with ThreadPoolExecutor(max_workers=4) as pool:
        checked = list(pool.map(verify_file, descriptors))
    args.output.write_text(json.dumps({
        "case_id": installed["case_id"], "state": "PUBLIC_NATIVE_MESHES_VERIFIED_NOT_CASE_READY",
        "public_commit": args.public_commit, "files": checked,
        "bytes": sum(file["bytes"] for file in checked), "all_anonymous_cors_sha_native_geometry": True,
    }, indent=2) + "\n")
    print("Verified", len(checked), "pinned native meshes anonymously; case readiness still requires full public QA.")


if __name__ == "__main__":
    main()
