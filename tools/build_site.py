"""Stage only audited public files, not development tools, environments or private inputs."""

import json
from pathlib import Path
import os
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[1]
output = ROOT / "_site"
inventory = json.loads((ROOT / "archive/inventory.json").read_text())
names = {entry["path"] for entry in inventory["files"]}
names.update({"archive/inventory.json", "archive/SHA256SUMS.txt"})
if output.exists():
    unexpected = {path.relative_to(output).as_posix() for path in output.rglob("*") if path.is_file()} - names - {".nojekyll", "archive/deployment.json"}
    if unexpected:
        raise ValueError(f"Unrecognized files in output; refusing to publish: {sorted(unexpected)}")
for name in sorted(names):
    source = ROOT / name
    target = output / name
    if source.is_symlink() or not source.resolve().is_relative_to(ROOT):
        raise ValueError(f"Unsafe site input: {name}")
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, target)
(output / ".nojekyll").touch()
commit = os.environ.get("GITHUB_SHA") or subprocess.check_output(["git", "-C", str(ROOT), "rev-parse", "HEAD"], text=True).strip()
(output / "archive/deployment.json").write_text(json.dumps({
    "repository": "ktanino10/octoprints-brick-kit-downloads",
    "commit": commit,
    "workflow_run": os.environ.get("GITHUB_RUN_ID"),
    "archive_revision": inventory["archive_revision"],
    "physical_status": "ISSUES_REPORTED_PRODUCTION_BLOCKED",
}, indent=2) + "\n")
print(f"Staged {len(names)} files plus deployment metadata; {inventory['totals']['bytes']} bytes.")
