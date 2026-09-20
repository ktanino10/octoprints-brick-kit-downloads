# 8 mm common blocks: design and publication scope

[日本語](COMMON-BLOCKS.ja.md) / [English](COMMON-BLOCKS.en.md) ·
[Current models](https://ktanino10.github.io/octoprints-brick-kit-downloads/en/models.html) ·
[Revision-specific downloads](https://ktanino10.github.io/octoprints-brick-kit-downloads/en/downloads.html)

**Revision: `r3-8mm-20260920`. Implementing the redesign is authorized; manufacturing is not approved.**
Consult `availability` in the [revision registry](../archive/revisions.json).
`INPUT_WAIT` means real deliverables are still awaited, not that files, images or counts are available.
`AVAILABLE` means the digital prototype has been archived for download, not that it passed physical testing.
**No physical trial of this revision yet; fit, retention and full assembly UNKNOWN; NOT_SLICED; full-kit printing ON_HOLD.**

## Why the design is changing

The goal remains approximately 180 mm Mona, Copilot and Ducky models, with larger parts that can be held by hand.
This is not a simple enlargement of the old 4 mm/1.10 mm pin system.
The revised design uses common parts such as 2×2 and 2×4 blocks, necessary 1×2 parts and thin plates,
with open undersides and wall/tube/rib retention.
Exact preservation of old seams, pixels, continuous surfaces or final dimensions is not guaranteed.

| Design basis | Dimension |
|---|---|
| XY pitch | 8.0 mm |
| Standard brick body / plate body | 9.6 mm / 3.2 mm |
| Body-to-grid gap | 0.2 mm |
| 2×2 body | 15.8 × 15.8 × 9.6 mm |
| 2×4 body | 15.8 × 31.8 × 9.6 mm |
| Stud diameter / height | 4.8 mm / 1.8 mm |
| Standard brick height including studs | 11.4 mm |

These are independent prototype design assumptions. **They are not official LEGO manufacturing dimensions or tolerances,
a commercial compatibility claim, or a guarantee of successful FDM printing.**
Refer to that revision's native CAD and dimension records for actual types, clearances and measurements.
Nominal CAD contact and closed meshes do not validate friction, retention, material strength or print tolerances.

## Keep generations separate

The ten photos and silent videos published on 2026-09-19 document the earlier r2 4 mm trial.
It reported parts too small to handle and holes blocked with plastic **before** ultrasonic cleaning.
That is not a physical result for the new revision, or proof of success for old r2 8 mm or historical 6 mm parts.
All nine Phase1 candidates, the three r2 assemblies, earlier trials, four ZIP packages and their hashes remain preserved history.

## Working with the files

- **FreeCAD:** extract the entire package for one revision and preserve relative directories between assemblies and shared libraries.
  Do not copy an assembly alone or interpret every internal construction object as a printable instance.
- **Type-specific STEP/STL and BOM:** distinguish unique types from individual IDs and required quantities.
  Each instance does not require a duplicate STL download.
- **Color-grouped geometry 3MF:** these are layouts of separate parts, not configured Bambu Studio projects, G-code or sliced data.
  Merely fitting the printer's nominal area does not validate the real selected build plate.
- **Complete/exploded images, videos and proposed assembly sequences:** these use the same revision's real data.
  An exploded view is a display operation, not approval of physical insertion paths, retention, or hand/tool access.

Before any separately authorized small physical trial, match that revision's trial parts, counts and orientations to the actual
P1S, installed nozzle, build plate, PLA and process profile.
Do not silently substitute the old 4 mm/0.2 mm setup or another printer's correction values for unknown settings.
Do not import both a 3MF and its equivalent STL onto the same plate: that duplicates the parts.
Inspect the slicer's layer preview for open underside cavities, wall/tube/rib and stud paths, and unwanted support.
Stop if warnings, missing paths, blocked cavities or uncertain conditions remain.
Record time and material quantity only from actual slicing results. No slicing, printing or sending is performed here.

## The requested two printing approaches

Printing separate parts for later assembly is the redesigned system's scope.
Whether “print everything at once” means a monolithic assembled model or batch-printing separate parts on one plate is still unconfirmed.
Color-grouped layouts do not settle that question or constitute one-piece printable files.

## Attribution, rights and publication boundary

Original models: `martinwoodward/octoprints`, revision `981a85f0bec9d1a9c280fd5719d0d797852229c4`.
Model derivatives follow [CC BY-NC 4.0](../LICENSE); retain [attribution and modification notices](../ATTRIBUTION.en.md).
Physical photos/videos belong to the contributor under separate publication permission, not an automatic blanket CC license.
Production environments, internal logs, personal information and unrelated private works are excluded.
If publication metadata is sanitized, source/public SHA-256 values and geometry-preservation records remain distinct.
