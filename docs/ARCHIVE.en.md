# English guide to the public archive and ZIP packages

[日本語（archive release notes）](../archive/RELEASE.md) / [English](ARCHIVE.en.md) ·
[Archive overview](../README.en.md) ·
[All downloads](https://ktanino10.github.io/octoprints-brick-kit-downloads/en/downloads.html)

**This guide describes the frozen Phase1/r2 packages, not the current common-block revision.**
The 8 mm common-block redesign was authorized on 2026-09-20; see the [new design/publication guide](COMMON-BLOCKS.en.md)
and [revision registry](../archive/revisions.json) for current availability.
**Issues were found in the earlier 4 mm physical trial. Full-kit printing is ON HOLD. All geometry is NOT_SLICED.**
This is an archive of work and observations, not a manufacturing release or a set of printer-ready projects.
The first 4 mm trial reported difficult-to-handle small parts and holes blocked **before** post-print ultrasonic cleaning.
The cause, actual slicer profile, notch-specific outcomes, retention, and full physical assembly remain unvalidated.

## Four existing packages

The public repository is [ktanino10/octoprints-brick-kit-downloads](https://github.com/ktanino10/octoprints-brick-kit-downloads).
The existing release tag is **[archive-2026-09-19-r2](https://github.com/ktanino10/octoprints-brick-kit-downloads/releases/tag/archive-2026-09-19-r2)**.

| ZIP | Contents and purpose |
|---|---|
| [phase1-candidates.zip](https://github.com/ktanino10/octoprints-brick-kit-downloads/releases/download/archive-2026-09-19-r2/phase1-candidates.zip) | **9 candidates**: 3 characters × 3 detail levels, **9 Blender scenes**, 9 images, **3 Balanced videos**, placements, and individual/aggregate BOMs. Preserves the appearance-exploration stage. |
| [phase1-cad.zip](https://github.com/ktanino10/octoprints-brick-kit-downloads/releases/download/archive-2026-09-19-r2/phase1-cad.zip) | Legacy FreeCAD documents and STEP/STL for **21 basic types** and **5 historical 6 mm fit coupons**. These are earlier design records, not substitutes for the selected r2 4 mm/8 mm trials. |
| [selected-r2-scenes.zip](https://github.com/ktanino10/octoprints-brick-kit-downloads/releases/download/archive-2026-09-19-r2/selected-r2-scenes.zip) | The selected **Mona Fine 4 mm, Copilot Chunky 8 mm, and Rubber Ducky Fine 4 mm**: 3 Blender scenes, 3 images, 3 videos, individual/aggregate BOMs, placements, part IDs, and proposed assembly sequences. |
| [selected-r2-cad.zip](https://github.com/ktanino10/octoprints-brick-kit-downloads/releases/download/archive-2026-09-19-r2/selected-r2-cad.zip) | **236 native types**, 2 shared FreeCAD libraries, 3 assemblies with relative links, type-specific STEP/STL, separate **4 mm and 8 mm trials with 11 parts each**, and Mona's left/right temporary whisker supports. |

**These four ZIP packages are immutable.** They retain the original documents, LICENSE, attribution, and status information shipped with the release.
The English [README](../README.en.md), [attribution](../ATTRIBUTION.en.md), [physical-feedback record](../feedback/2026-09-19/README.en.md),
and [r2 trial guide](TRIAL-GUIDE.en.md) are separate companions outside the original ZIPs.
Translation does not repack the archives, approve a redesign, or supply newly sliced or printable alternatives.

## Open the portable FreeCAD assemblies

**Extract the entire ZIP**, rather than opening or copying an assembly alone.
Keep the sibling `assemblies/` and `libraries/` directories in their original relative layout:

```text
artifacts/selected/r2-20260919/cad/
├── assemblies/
│   ├── mona-fine.FCStd
│   ├── copilot-chunky.FCStd
│   └── ducky-fine.FCStd
└── libraries/
    ├── Selected-p4.FCStd
    └── Selected-p8.FCStd
```

Do not flatten or independently move these directories; the assembly documents refer to the shared libraries by relative paths.
The archived [portability record](../archive/portability.json) records reopening **all 11 FreeCAD documents** after extraction elsewhere with their links resolved.
It also records reopening **all 12 Blender scenes** after public-path cleanup with geometry and placements preserved.
These are data-integrity checks, not physical fit or manufacturing approval.

The selected r2 assemblies contain **13,434 Mona + 3,021 Copilot + 10,311 Rubber Ducky = 26,766 individual instances** sharing **236 types**.
They are not 26,766 separate STL downloads. Grouping changed the seams; pixel-for-pixel identity between Phase1 and r2 is not claimed.

## Check public hashes, not historical input hashes

- **ZIP packages:** [bundles.json](../archive/bundles.json) records each package's exact filename, size, SHA-256, and download URL.
  The release's [SHA256SUMS.txt](https://github.com/ktanino10/octoprints-brick-kit-downloads/releases/download/archive-2026-09-19-r2/SHA256SUMS.txt) checks the ZIP downloads.
- **Individual public files:** use [inventory.json](../archive/inventory.json) and the repository's [archive/SHA256SUMS.txt](../archive/SHA256SUMS.txt).
  A file's public `sha256` is the value to compare with the copy downloaded now.
- **Source provenance:** [source-inventory.json](../archive/source-inventory.json), `source_sha256` entries in the public inventory, and
  [portability.json](../archive/portability.json) distinguish the original files from public copies.
  Metadata cleanup and relative-path changes can change file hashes without changing native geometry.
  Historical validation JSON hashes identify the inputs checked at that time; they must not be substituted for the public-file hashes.

The originating development repository, history, runtime environment, conversations, internal logs, and original personal-media attachments are not part of this public archive.
The repository separately preserves the unchanged root-level 4 mm trial files and the contributor's **10 sanitized JPEGs, 2 silent MP4s, and combined video**.
Model-derived data is **CC BY-NC 4.0**; feedback media remains contributor-owned under separate publication permission.
See [attribution and licensing](../ATTRIBUTION.en.md). No GitHub/LEGO endorsement, certification, or commercial-brick compatibility is claimed.
