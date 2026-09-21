"""Finalize one audited native/media copy as a standalone versioned Release ZIP."""

import argparse
import json
from pathlib import Path

from density_release import create_release_zip, file_sha, reviewed_files

ROOT = Path(__file__).resolve().parents[1]
STUDY = "part-count-matrix-20260921"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", type=Path, required=True)
    args = parser.parse_args()
    stage = args.stage.resolve()
    if stage.is_symlink() or not stage.is_relative_to(ROOT / ".archive-work"):
        raise ValueError("Use an owned, explicitly staged case")
    review = json.loads((stage / "source-review.json").read_text())
    case = review["case_id"]
    native = stage / "native"
    blender = json.loads((stage / "blender-portability.json").read_text())
    reopen = json.loads((stage / "freecad-relocated.json").read_text())
    poses = json.loads((stage / "native-pose-verification.json").read_text())
    motion = json.loads((stage / "animation-portability.json").read_text())
    scene = native / f"artifacts/studies/{STUDY}/cases/{case}/scene.blend"
    if poses["case_id"] != case or poses["all_ids_types_colors_poses_steps"] != "MATCH":
        raise ValueError("Exact native ID/pose audit is missing")
    if not motion["motion_unchanged"] or not motion["frame1_roundtrip_no_drift"] or motion["public_sha256"] != file_sha(scene):
        raise ValueError("Evaluated animation preservation is not bound to this scene")
    entries = [{"path": path.relative_to(native).as_posix(), "bytes": path.stat().st_size, "sha256": file_sha(path)}
               for path in sorted(native.rglob("*")) if path.is_file()]
    inventory = {"study_id": STUDY, "case_id": case, "review_state": "VERIFIED_PUBLIC_COPY", "files": entries}
    reviewed_files(native, inventory, blender, reopen)
    if not {"LICENSE", "ATTRIBUTION.md"} <= {entry["path"] for entry in entries}:
        raise ValueError("Each standalone public package must preserve license and attribution")
    output = stage / f"{case}-cad-scene-animation-public.zip"
    notes = (
        f"Octoprints / {STUDY} / {case}\n\n"
        "NOT_SELECTED / NOT_SLICED / physical fit, retention, loads and stability UNKNOWN / full printing ON_HOLD.\n"
        "This is a comparison reference, not a user-adopted production kit.\n"
        f"Extract ALL files, then open artifacts/studies/{STUDY}/cases/{case}/assembly.FCStd.\n"
        "Keep the relative cases/ and shared/ directories intact, including shared parametric authoring documents.\n"
        "Parts are actual native shapes; temporary aids are counted separately and must not be removed before physical checks.\n"
        "Animation shows turntable, radial explanatory separation and bottom-up assembly; not collision-free disassembly simulation.\n"
        "No printer profile, G-code or physical manufacturing approval is included.\n"
        "Model derivatives: CC BY-NC 4.0. Preserve LICENSE and ATTRIBUTION.md. No LEGO/GitHub endorsement or compatibility guarantee.\n"
        "The three 1x baselines are comparison assumptions, not user selections and not three of the fifteen multiplier cases.\n"
        "Japanese: https://ktanino10.github.io/octoprints-brick-kit-downloads/ja/density-matrix.html\n"
        "English: https://ktanino10.github.io/octoprints-brick-kit-downloads/en/density-matrix.html\n"
    )
    package = create_release_zip(native, output, entries, notes=notes)
    (stage / "public-package-inventory.json").write_text(json.dumps(inventory, indent=2) + "\n")
    (stage / "package.json").write_text(json.dumps({"study_id": STUDY, "case_id": case, **package}, indent=2) + "\n")
    print(json.dumps({"case_id": case, **package}, indent=2))


if __name__ == "__main__":
    main()
