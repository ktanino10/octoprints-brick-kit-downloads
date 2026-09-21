# Octoprints — A public archive of prototypes and improvements

[日本語](README.md) / [English](README.en.md)

**[Public site / English](https://ktanino10.github.io/octoprints-brick-kit-downloads/en/)** ·
**[Assembly viewer](https://ktanino10.github.io/octoprints-brick-kit-downloads/en/viewer/)** ·
**[All downloads](https://ktanino10.github.io/octoprints-brick-kit-downloads/en/downloads.html)** ·
**[Physical feedback](https://ktanino10.github.io/octoprints-brick-kit-downloads/en/feedback.html)** ·
**[Design history](https://ktanino10.github.io/octoprints-brick-kit-downloads/en/history.html)** ·
**[Current models and publication status](https://ktanino10.github.io/octoprints-brick-kit-downloads/en/models.html)**

The [revised proposed-sequence guide](https://ktanino10.github.io/octoprints-brick-kit-downloads/en/assembly.html)
reads IDs, types, colors, base positions, rotations and steps from the same revision's actual manifest. It is not physical assembly approval.

[Public repository](https://github.com/ktanino10/octoprints-brick-kit-downloads) ·
[日本語サイト](https://ktanino10.github.io/octoprints-brick-kit-downloads/ja/).
The legacy root URLs remain available:
[home](https://ktanino10.github.io/octoprints-brick-kit-downloads/),
[viewer](https://ktanino10.github.io/octoprints-brick-kit-downloads/viewer/),
[downloads](https://ktanino10.github.io/octoprints-brick-kit-downloads/downloads.html),
[feedback](https://ktanino10.github.io/octoprints-brick-kit-downloads/feedback.html), and
[history](https://ktanino10.github.io/octoprints-brick-kit-downloads/history.html).

This is a noncommercial prototype record for approximately 180 mm-tall Mona, Copilot, and Ducky models assembled from independent bricks.
**On 2026-09-20, implementation of an 8 mm common-block redesign was authorized.**
The revised approach prioritizes parts such as 2×2 and 2×4 blocks, 9.6 mm brick bodies and 3.2 mm plates,
with open undersides and wall/tube/rib retention. Earlier 4 mm Fine and 1.10 mm pin constraints are superseded where they conflict with this direction.

The current revision is **`r3-8mm-20260920`**. The [revision registry](archive/revisions.json) and
[current-model page](https://ktanino10.github.io/octoprints-brick-kit-downloads/en/models.html) use actual, checked deliverables from that same revision.
No earlier image or geometry is substituted for the redesigned models.
See the [common-block design/publication guide](docs/COMMON-BLOCKS.en.md) / [日本語](docs/COMMON-BLOCKS.ja.md).

| Actual r3 model | Individual parts | Types used | Width × depth × height / mm | Small 1×1 exceptions |
|---|---:|---:|---|---:|
| Mona | 519 | 68 | 199.8 × 167.8 × 181.0 | 5 |
| Copilot | 695 | 86 | 247.8 × 199.8 × 181.0 | 10 |
| Ducky | 413 | 56 | 151.8 × 215.8 × 181.0 | 0 |

There are **1,627 instances sharing 133 master types**. Seven new FreeCAD documents cover two shared libraries,
three assemblies, the trial and native section checks. The release includes complete/exploded PNGs, three Blender scenes,
three 6-second 720×720 turntables, per-type STL/STEP, **33 color-grouped geometry 3MF plates** (11 / 13 / 9),
individual/type-color BOMs and bilingual guides.

- **[New release and ZIP packages](https://github.com/ktanino10/octoprints-brick-kit-downloads/releases/tag/archive-2026-09-20-r3)**
- [Nine-piece trial 3MF](artifacts/revisions/r3-8mm-20260920/cad/trial/plate.3mf) /
  [equivalent trial STL](artifacts/revisions/r3-8mm-20260920/cad/trial/plate.stl) /
  [English trial instructions](artifacts/revisions/r3-8mm-20260920/TRIAL-en.md).
- [Same-scale old/new dimensions](artifacts/revisions/r3-8mm-20260920/size-comparison.png) /
  [actual BRep open undersides and sections](artifacts/revisions/r3-8mm-20260920/open-underside-sections.png).
- [Relocated native reopening and geometry-preservation record](archive/portability/r3-8mm-20260920.json).

The new trial has **nine pieces**: three male 2×2 variants, five female 2×4 variants, and one thin 2×4 plate.
Male values are **stud diameter corrections −0.10 / 0 / +0.10 mm**; female values are
**radial clearances −0.04 / 0 / +0.04 / +0.08 / +0.12 mm**, not the earlier r2 diameter differences.
The 0.4 mm nozzle is a comparison candidate, not claimed installed. The last reported installed nozzle was 0.2 mm;
confirm the current hardware.

**The new revision has not been physically tested. Fit, retention and full assembly are unvalidated; full-kit printing is ON HOLD.**
The small-part handling and blocked-hole feedback belongs to the earlier r2 4 mm trial on 2026-09-19, not the new revision.
Those holes were blocked **before** ultrasonic cleaning. The cause, actual slicer settings and condition-specific retention remain unresolved.
Geometry-only 3MF files remain **NOT_SLICED**, not configured Bambu Studio projects or G-code.

## Mona likeness, size and actual quantities

The **[Mona comparison against initial Fine C](https://ktanino10.github.io/octoprints-brick-kit-downloads/en/mona-likeness.html)**
shows the original, initial C, published r3 and the new approximately 36 cm pilot.
Front and three-quarter views use **matched on-screen heights**, with a separate facial close-up.
True scale is shown separately; a larger display is not counted as better likeness.

| Mona configuration | Actual parts | Types | Width × depth × height / mm |
|---|---:|---:|---|
| Unsubdivided original | Not applicable | Not applicable | 69.126 × 56.769 × 60.776 |
| Initial Fine C | 13,837 | 7 | 211.82 × 171.82 × 180.71 |
| Published r3 | 519 | 68 | 199.8 × 167.8 × 181.0 |
| New Mona pilot — unselected | 10,908 | 137 | 407.8 × 343.8 × 360.2 |

The pilot retains the 8 mm interface and resamples the original geometry; it is not an enlarged coarse r3 arrangement.
It has 2,929 fewer parts than initial C and 10,389 more than r3. Different grouping reduces the physical count relative to C,
while occupied sampling cells increase from 82,357 to 115,033. A low part count is not an aesthetic success criterion.
There are 10,572 plates, 336 internal blocks and 112 placement layers. The 3.2 mm value is plate body height, not an FDM slicing layer height.

**User visual approval is still pending.** The broad same-color forehead, white eye rims and stepped smile are not identical to initial C.
The total includes 44 foundation parts and excludes two separate temporary whisker pedestals; these must not be removed before actual retention checks.
Weight, retention, tipping and printability remain unvalidated: NOT_SLICED, with full-kit printing on hold.
This publication provides a Mona image/count comparison only, not a new kit, trial, one-piece model or adoption of the other two characters.
Current r3, the earlier A/B comparison and formal releases remain unchanged.

## Earlier shape and actual part-count comparison

The **[bilingual image and quantity comparison](https://ktanino10.github.io/octoprints-brick-kit-downloads/en/shape-options.html)**
shows adopted r3 alongside two unselected studies with matched camera, scale and palette.
All retain the 8 mm connection system and 181 mm overall height.
Counts were checked against actual manifest and BOM part IDs; they are individual instances, not type counts or estimates.

| Character | Adopted r3 | A: surface plate refinement | B: contour / slope replacement |
|---|---:|---:|---:|
| Mona | 519 | 670 (+151) | 519 (no change) |
| Copilot | 695 | 916 (+221) | 695 (no change) |
| Ducky | 413 | 522 (+109) | 413 (no change) |

A refines surface height steps with 3.2 mm plates, at the cost of more seams, exposed studs and assembly work.
B replaces 36 blocks per character with slopes one-for-one, keeping the part count unchanged but adding specialized types,
thicker roofs and shallower underside cavities. Coarse eyes and mouths from the 8 mm XY grid remain.
No new 1×1 chips, trial sets or one-piece print version were created.
**The alternatives are unselected and physically unvalidated. Adopted r3, existing downloads and formal releases are unchanged;
full-kit printing remains on hold.**

## Preserved earlier revisions and physical feedback

The quantities below describe Phase1/r2 history. They are not the new revision's counts or trial sets.

| Category | Preserved work |
|---|---|
| Phase1 candidates | Three characters at three detail levels: **9 candidates**, 9 images, **9 Blender scenes**, **3 Balanced videos**, individual/aggregate bills of materials (BOMs), and placements. |
| Selected r2 | Mona Fine 4 mm / Copilot Chunky 8 mm / Ducky Fine 4 mm: 3 images, 3 Blender scenes, 3 videos, BOMs, proposed assembly sequences, and part IDs. |
| Native CAD | The r2 assemblies have **26,766 individual instances sharing 236 native types**: 2 shared FreeCAD libraries, 3 assemblies, and STEP/STL files by type. The legacy version preserves **21 basic types** and **5 historical 6 mm coupons**. |
| Trials and aids | Separate 4 mm and 8 mm trial sets, **11 parts each**, with 3MF/STL/STEP, FreeCAD, layouts, and a results CSV; left/right temporary supports for Mona's whiskers. The two legacy root-level 4 mm downloads are unchanged. |
| Physical feedback | 10 metadata-sanitized JPEGs, 2 silent MP4s plus 1 combined MP4 in the corrected order, and records of the issues and redesign discussion. |

The selected r2 part counts are **Mona Fine 4 mm: 13,434 / Copilot Chunky 8 mm: 3,021 / Ducky Fine 4 mm: 10,311**.
Selection for appearance is separate from manufacturing approval. Changes to grouping changed the seams; pixel-for-pixel identity with Phase1 is not claimed.

- [Static gallery of all 9 candidates](artifacts/phase1/gallery.html) / [Selected r2 images and videos](artifacts/selected/r2-20260919/gallery.html).
- [Physical photos, videos, and reports](feedback/2026-09-19/README.en.md) / [Feedback page](https://ktanino10.github.io/octoprints-brick-kit-downloads/en/feedback.html).
- [Design history and unresolved conditions](https://ktanino10.github.io/octoprints-brick-kit-downloads/en/history.html).
- [Complete file inventory, sizes, and SHA-256 hashes](archive/inventory.json) / [Checksums](archive/SHA256SUMS.txt).
- [Public-copy metadata cleanup and native-geometry preservation record](archive/portability.json).
- [English archive and ZIP guide](docs/ARCHIVE.en.md) / [English r2 trial guide](docs/TRIAL-GUIDE.en.md).

The four existing ZIP packages at **`archive-2026-09-19-r2` are immutable archives**.
They retain their original documents; these English companions are provided separately, outside the ZIPs.

To open a FreeCAD assembly, extract the entire ZIP and preserve the relative layout of `cad/assemblies/` and `cad/libraries/`.
The preserved **Phase1/r2 history contains 11 FreeCAD documents and 12 Blender scenes**.
The 26,766 instances are not 26,766 separately supplied STL files.
The viewer supports the assembled model, exploded view, layers, proposed assembly sequence, part IDs, BOM, viewpoints, and videos.
It does not run CAD, slice geometry, or operate a printer from the browser.

The originating development repository and history, runtime environment, conversations, and internal logs are not included.
Where local paths or other metadata were cleaned up, source hashes and public-file hashes are distinguished.
Use the public inventory to verify current downloads. Historical numerical checks must not be read as physical approval.

For the selected r2 4 mm joint, the inlet wall was revised from the old **0.877 mm** to **1.21 mm**.
The stud has a **1.10 mm stem diameter, 0.98 mm tip diameter, and 0.60 mm height**.
These are CAD dimensions; strength and retention have not been validated.

## Desired output modes — pending clarification

The requested direction is **printing separate parts and assembling them afterward**, plus a proposed **“print everything at once”** alternative.
The second option is **not yet defined**: it could mean printing the assembled model as one piece, or batch-printing still-separate parts on one plate.
A one-piece model has not been selected. The new authorization concerns redesigning the separate-part assembly system.
Color-grouped geometry-only plate layouts do not confirm a preference for a monolithic model or approve manufacturing.
The assembled viewer is not a one-piece printable file. No slicing, printing or printer transmission is performed.
**Full-kit printing remains ON HOLD.** This intention is separate from the existing trial record.

## Legacy 4 mm joint and small trial set

The following preserves the historical preparation and observation procedure; it is **not a current instruction to reprint**.

> **2026-09-19 physical feedback: redesign under discussion**
>
> The trial parts were reported to be “small and difficult to make,” with “some holes filled with plastic.”
> The current design will not be carried directly into full-model printing. The files below remain as a record of the earlier trial.
> Read the [photos, videos, and redesign discussion](feedback/2026-09-19/README.en.md).
> The rights for these photos and videos are explained in that record's “Photo and video rights” section.

**NOT_SLICED — These trial parts are unsliced, and a physical-fit pass has not been confirmed. Issues were reported in the first physical trial.**

These files are for comparing joints under the design assumption of a **Bambu Lab P1S, 0.2 mm nozzle, and PLA**.
They are not a Bambu Studio project with printer settings, G-code, or print-ready data.
A 0.2 mm nozzle does not guarantee that the thin stem will resist breakage, or that fit and retention will be satisfactory.

### Downloads

- [Geometry-only 3MF with 11 parts](p4-trial-11-parts.3mf) — Layout data referencing shared types. This is normally the preferred input.
- [STL of the same 11 parts](p4-trial-11-parts.stl) — Units are millimeters. This is an alternative to the 3MF, not an additional set.

**Do not load the 3MF and STL together on the same plate: doing so duplicates the parts. Use only one.**
Download through the GitHub file page and confirm that the saved file still has its `.3mf` or `.stl` extension.

### Contents

| Part | Quantity |
|---|---:|
| Receivers identified by 1–4 notches | 1 of each; 4 total |
| Common male keys | 4 |
| Lower parts of the offset joint | 2 |
| Upper part of the offset joint | 1 |
| Total | **11** |

Receiver notch counts **1 / 2 / 3 / 4** correspond to diameter differences of **−0.05 / 0 / +0.10 / +0.20 mm**.
The difference is **the receiver's straight bore diameter minus the male stem diameter**, not a per-side clearance.
The −0.05 mm condition is intentional nominal interference.
Even keys printed from the same type can differ physically or wear, so use a separate key for each condition.

### Preparing in Bambu Studio on another PC

1. Open the geometry-only 3MF and select an **existing preset for the actual Bambu Lab P1S / 0.2 mm nozzle**.
   If that preset is not available, stop. Do not substitute another printer or a 0.4 mm nozzle preset.
2. Select the plate type and PLA that will actually be used. This pack does not specify a PLA brand, color, or plate type.
   An existing, compatible Generic PLA preset may be a provisional candidate, but it must be checked against the actual material.
   Use compatible existing profiles for layer height, temperature, speed, and other settings; record the profile names and values used.
3. Confirm that there are **11 parts**. **Receiver holes face down, male stems face up, and the bottoms are at z=0.**
   Do not change orientation or size by automatic rotation or scaling.
   The layout is within a nominal **256 × 256 mm** area, but must be checked again against the selected printer and plate.
4. Slice locally and inspect the layer preview.
   Check that receiver holes are not unintentionally filled at their entrances, that paths for the thin male stems have not disappeared,
   that the hole roofs have bridging and top-surface paths, and that unwanted supports do not block the holes.
   If there are warnings or anything you cannot judge, stop for review rather than proceeding to printing.
5. Record the selected printer, nozzle, material and process profiles, layer height, warnings, and preview.
   Save a Bambu Studio project locally under a **different name from the original file**.
   Record print time and PLA quantity only from an actual slice using those settings; do not substitute estimates based on geometry alone.

This pack has not validated profile compatibility, layer previews, print time, PLA quantity, or supports.
Confirming that geometry exists and fits in a layout is not a slicing pass or a physical manufacturing guarantee.
There is no automatic printer connection or Print/Send function.
**Do not connect to a printer or use Send/Print as part of this preparation.**

### Minimum observations for a physical trial

Begin with the loosest condition, **+0.20 mm (4 notches)**. If it is tight, stop rather than forcing it.

- Actual nozzle diameter, PLA, plate, profiles used, and layer height.
- Whether the part seats without excessive force, with any incomplete seating, play, or bottoming-out noted.
- Whether the key falls out under its own weight when the receiver is gently turned upside down.
- Cracks, stress whitening, or looseness after **5 insertion/removal cycles**, and any damage to the receiver roof. If possible, include photographs and the male stem's outside diameter.

There is no need to force calipers into the small holes. Record unmeasured values as unknown.
Only try the **3-part offset joint** after basic fit has been checked.
This small trial does not validate the loads, impacts, or assembly feasibility of the large model.

**Physical fit, retention, and full physical assembly remain unvalidated. This is not a final manufacturing release.**

## License and attribution

The model-derived data is for noncommercial experimentation under [CC BY-NC 4.0](LICENSE).
See [ATTRIBUTION.en.md](ATTRIBUTION.en.md) for upstream credit, modifications, trademark notices, and the separate rights for contributor-owned physical-feedback photos and videos.
