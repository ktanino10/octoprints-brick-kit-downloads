# 2026-09-19: First physical feedback on the 4 mm joints

[日本語](README.md) / [English](README.en.md) ·
[Archive overview](../../README.en.md) ·
[Public feedback page](https://ktanino10.github.io/octoprints-brick-kit-downloads/en/feedback.html)

**Outcome: the current small-joint design will not be carried directly into the full model. Redesign is under discussion.**
**Full-kit printing is ON HOLD**, and all distributed geometry remains **NOT_SLICED**.
This does not mean that no physical trial took place: actual trial parts were printed and issues were reported.

This record is published with the contributor's permission.
It is not a success report or manufacturing approval, but a record intended to inform the next design with practical difficulties encountered in the first trial.

## Contributor's report

> “They are small and difficult to make. Also, some of the holes are filled with plastic.”

These are treated as two separate issues:

| Issue | What is known now | What is not yet known |
|---|---|---|
| Parts are small and difficult to handle | This is the contributor's report from actual use. The approach of simply increasing the number of small subdivisions needs reconsideration. | The best dimensions for larger parts, or the required assembly time. |
| Some holes are filled with plastic | This is the contributor's report of the printed result. A follow-up confirmed that the holes were already blocked **before ultrasonic cleaning**. | Whether the main cause is the first layer, supports, slicer settings, geometry, or something else. |

The existence of printed parts is separate from passing fit, retention, and durability checks.
Seating, retention, and the condition after repeated insertion/removal have not yet been established as numerical or condition-by-condition results for each notch.
Forcing parts together or individually scraping out small holes will not be assumed to be an acceptable requirement for a finished kit.

## Files involved and unconfirmed conditions

- Distributed trial set: **4 mm, 7 types, 11 parts**.
- Distributed [3MF](../../p4-trial-11-parts.3mf) SHA-256: `ce054bdae89885e9dfc0fe8dfdf5871f1b573ba1fdc25f09f24fe503ee11c69f`.
- Distributed [STL](../../p4-trial-11-parts.stl) SHA-256: `76fbc0193ab8956fa484dd2d36585993daf1375f5e528bfc080f40849fbbdadb`.
- Pretrial configuration: a **Bambu Lab P1S with a 0.2 mm nozzle installed** was reported. PLA was the assumed material.
- The slicer project, actual profile, layer height, material brand, support settings, and other settings used have not been supplied.
- The hash of the input actually sliced has not been cross-checked against the distributed files.
- The downloads remain **NOT_SLICED**. They are not described as sliced, physically fit-validated, or approved for full physical assembly.

## Post-print ultrasonic cleaning

[Ultrasonic cleaning after 3D printing — the contributor's YouTube video](https://youtu.be/rHhXFxvFU-E)

The contributor shared this link as a short video of **ultrasonic cleaning after 3D printing**.
It is **not printing-process footage or evidence of successful fit**.

In a follow-up, the contributor stated that the holes **“were already filled before cleaning.”**
The initial reported blockage is therefore not attributed to ultrasonic cleaning.
The geometry, slicing output, and printed condition at the time of printing still need investigation.
Whether the blockage changed after cleaning has not been recorded, nor have the cleaning liquid, temperature, duration, or other conditions.

## Photos

The **10 JPEGs** have had their orientation normalized and have been re-saved with EXIF and other metadata removed.
The numbers are references within this record, not notch numbers or trial conditions.

| Photo | Photo |
|---|---|
| ![Photo 01: Trial parts on the print plate](media/photo-01.jpg) | ![Contributor photo 02](media/photo-02.jpg) |
| ![Contributor photo 03](media/photo-03.jpg) | ![Contributor photo 04](media/photo-04.jpg) |
| ![Contributor photo 05](media/photo-05.jpg) | ![Contributor photo 06](media/photo-06.jpg) |
| ![Contributor photo 07](media/photo-07.jpg) | ![Contributor photo 08](media/photo-08.jpg) |
| ![Contributor photo 09](media/photo-09.jpg) | ![Contributor photo 10](media/photo-10.jpg) |

## Videos

**[Combined video: approximately 33.35 seconds, silent](https://raw.githubusercontent.com/ktanino10/octoprints-brick-kit-downloads/main/feedback/2026-09-19/media/trial-feedback-combined.mp4)**

Following the contributor's correction, the clips are joined in the order **video 01 → video 02**.
The combined MP4 is exactly **33.352167 seconds**, **1,001 frames**, and **1280×720 pixels**.
It was not re-encoded. The two separate sanitized, silent MP4s are also retained for comparison and reference.

Combined MP4 SHA-256: `e44c57632d5c7760d6e4618a61eb008257f1f1dc4bee8a12cb3831cd7e9092e6`

- [Video 01: approximately 27.46 seconds, silent](https://raw.githubusercontent.com/ktanino10/octoprints-brick-kit-downloads/main/feedback/2026-09-19/media/video-01-silent.mp4) — 27.457611 seconds.
- [Video 02: approximately 5.89 seconds, silent](https://raw.githubusercontent.com/ktanino10/octoprints-brick-kit-downloads/main/feedback/2026-09-19/media/video-02-silent.mp4) — 5.894556 seconds.

The public videos were remuxed without re-encoding the video stream, removing audio, sensor/data tracks, and associated metadata such as location and recording time.
Playback speed and frame order within each source clip were not changed.
No audio transcription or measurements of force or dimensions from the videos were performed.
Publishing the photos and videos does not establish a pass or fail for every hole or condition.
Public file sizes and hashes are recorded in [media-manifest.json](media-manifest.json).

## Direction under discussion

The contributor expressed a wish to “use real LEGO as a reference” and to have “LEGO-like blocks.”
**Adoption or manufacture of a new design has not been decided.**

One candidate direction is to move away from large numbers of small pins and separate small holes toward
common blocks that are easier to handle, with round studs and open-underbody walls or tubes for retention.
The idea is to use repeatable body shapes such as **2×2, 2×4, and 1×2 blocks on an approximately 8 mm pitch**,
and add detail only where needed for faces and outlines with thin plates or similar parts.
Visual detail and the size of a single part held in the hand would be designed separately.
This is an **unadopted discussion**, not an approved redesign; the approximate 8 mm pitch is **not an official LEGO manufacturing dimension or tolerance**.

References:

- [LEGO: the stud-and-tube principle](https://www.lego.com/en-us/history/articles/d-the-stud-and-tube-principle).
- [LDraw specification: conversion to physical dimensions is approximate, not a manufacturing tolerance](https://www.ldraw.org/article/218.html).
- [Prusa: accuracy, first-layer, and fit challenges when FFF-printing LEGO-like parts](https://blog.prusa3d.com/how-to-make-3d-printed-lego-and-lego-duplo-parts_31741/).

These are references for design principles, **not validated settings for Bambu Lab P1S/PLA**.
They do not authorize direct adoption of compensation values or processing methods for another manufacturer's printer,
and they provide **no assurance of compatibility with commercial LEGO parts**.

## Photo and video rights

The photos and videos in this directory are published as improvement records with the contributor's permission.
**Copyright remains with the contributor.** The model's CC BY-NC 4.0 license does **not** automatically apply to these photos or videos.
Reuse beyond this publication permission must follow separate authorization from the rights holder.
For the trial-part geometry, see the repository's [LICENSE](../../LICENSE) and [ATTRIBUTION.en.md](../../ATTRIBUTION.en.md).
