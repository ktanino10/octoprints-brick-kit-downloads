# r3 — 8 mm common blocks / 8 mm共通ブロック版

**Digital prototype only. NOT_SLICED. Physical fit and retention UNKNOWN. Full-kit printing ON_HOLD.**

**デジタル試作です。実物試験未実施・嵌合/保持力未検証・全数印刷は保留。**
旧r2の4 mm試験で報告された小ささと穴詰まりは、新版の実物結果ではありません。

[日本語](https://ktanino10.github.io/octoprints-brick-kit-downloads/ja/) /
[English](https://ktanino10.github.io/octoprints-brick-kit-downloads/en/) ·
[3D viewer](https://ktanino10.github.io/octoprints-brick-kit-downloads/en/viewer/) ·
[日英の組立候補ガイド](https://ktanino10.github.io/octoprints-brick-kit-downloads/ja/assembly.html) ·
[Download catalog](https://ktanino10.github.io/octoprints-brick-kit-downloads/en/downloads.html)

| Model | Individual parts | Types used | Width × depth × height / mm | 1×1 exceptions |
|---|---:|---:|---|---:|
| Mona | 519 | 68 | 199.8 × 167.8 × 181.0 | 5 |
| Copilot | 695 | 86 | 247.8 × 199.8 × 181.0 | 10 |
| Ducky | 413 | 56 | 151.8 × 215.8 × 181.0 | 0 |

**1,627 instances share 133 master types.** The redesign uses an 8 mm pitch, 9.6 mm brick bodies,
3.2 mm plates, 4.8 mm studs and open-underside walls/tubes/ribs. These are independent prototype dimensions,
not official LEGO manufacturing tolerances or a commercial compatibility guarantee.

## Downloads / 配布物

- **`r3-8mm-nine-brick-trial-NOT-SLICED.zip`**: nine new trial pieces, geometry 3MF/STL/STEP,
  editable native CAD, layout and Japanese/English trial instructions.
- **`r3-8mm-all-parts-NOT-SLICED.zip`**: all per-type STL/STEP, both shared libraries and three relative-linked
  assemblies, 33 color-grouped 3MF plates, BOMs, course diagrams and bilingual assembly guides.
  Media and the redundant browser mesh JSON are separate downloads, not duplicated into this ZIP.
- **`r3-8mm-20260920-media.zip`**: three native Blender scenes, complete/exploded renders, three six-second
  turntables, comparison/section images and diagrams. Geometry and material fingerprints were preserved.
- `SHA256SUMS.txt`: exact release-asset hashes. The [individual-file inventory](https://ktanino10.github.io/octoprints-brick-kit-downloads/archive/inventory.json)
  records source/public hashes and publication derivatives.

Extract native packages completely and keep `cad/assemblies/` and `cad/libraries/` together.
Seven new FreeCAD documents reopened with relative references resolved; the three figures retained all 1,627 instances
and 68/86/56 valid master-solid targets. The viewer and exported per-type STL meshes were compared.
These are digital integrity checks, not manufacturing approval.

## Nine-piece trial / 9部品試験

Three male 2×2 variants use **stud diameter corrections −0.10 / 0 / +0.10 mm**.
Five female 2×4 variants use **radial clearances −0.04 / 0 / +0.04 / +0.08 / +0.12 mm**.
One nominal thin 2×4 plate completes the nine-piece set. This is not a 45-piece combination matrix,
and the female radial values are not the earlier r2 diameter differences.

The stud engages between perimeter walls and the outside of tubes/posts; **the tube bore is not the stud-receiving hole**.
Negative clearance is intentional nominal interference, not a validated fit. Do not force parts together.
The last reported installed nozzle was 0.2 mm; 0.4 mm is a comparison candidate, not claimed to be installed.
Confirm the real printer/nozzle/material/plate/profile on the slicing computer.

All color-plate 3MFs are geometry-only. No configured manufacturer profile, G-code, validated support plan,
print-time or material-mass estimate is supplied. Printing/sending is not performed.
Whether “print everything at once” means a monolithic figure or batch-printing separate pieces remains unconfirmed;
these layouts do not create a one-piece-print offering.

## Fidelity, provenance and preserved history

Native mesh tessellation uses 0.01 mm linear and 0.12 rad angular deflection.
The source's measured conservative radial bound is **0.00430546 mm across 5,565 curved surfaces**.
That describes digital mesh fidelity, **not achievable printed accuracy**.

Source revision: `125ecacc0deb8c74819e4c1934ff3729d1a99791`.
585 explicitly approved files were imported, including the add-only `cad/trial/layout.json` supplement.
The original 584-file receipt and source bytes were not changed. Public native metadata was sanitized;
both new native/trial ZIPs include the supplemental layout and therefore have their own public hashes.
The private orchestration receipt, runtime logs, personal paths and unrelated source content are not included.

Phase1, r2, the previous four ZIPs, old 4 mm downloads and the contributor's physical photos/videos remain unchanged history.
Models retain upstream attribution to `martinwoodward/octoprints` revision `981a85f0bec9d1a9c280fd5719d0d797852229c4`
under **CC BY-NC 4.0**. Physical-feedback photos/videos remain contributor-owned under separate publication permission.
No GitHub/LEGO endorsement, compatibility or physical-fit guarantee is claimed.
