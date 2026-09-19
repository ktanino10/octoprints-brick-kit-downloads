# Attribution, modifications, and licensing

[日本語](ATTRIBUTION.md) / [English](ATTRIBUTION.en.md) · [Archive overview](README.en.md)

This public archive grew out of a noncommercial exploration of assembling Mona, Copilot, and Ducky from independent bricks.
It includes 9 candidate models and 3 selected models, rendered images and videos, native CAD, placements and bills of materials,
custom joints, and trial parts. The two legacy root-level files for the 4 mm, 11-part trial are preserved unchanged.

## Upstream work and credit

- **Authors:** the creators and contributors of `martinwoodward/octoprints`.
- **Repository:** <https://github.com/martinwoodward/octoprints>.
- **Pinned revision:** `981a85f0bec9d1a9c280fd5719d0d797852229c4`.
- **License:** Creative Commons Attribution–NonCommercial 4.0 International (**CC BY-NC 4.0**), <https://creativecommons.org/licenses/by-nc/4.0/>.
- **Upstream LICENSE at that revision:** <https://github.com/martinwoodward/octoprints/blob/981a85f0bec9d1a9c280fd5719d0d797852229c4/LICENSE>.

## Modifications and additions

The changes and additions include:

- Uniform scaling to approximately 180 mm, discretization onto 4/6/8 mm grids, and color sampling.
- Splitting and grouping into independent bricks; individual part IDs, BOMs, and proposed assembly sequences.
- Custom studs, receiver holes, seating pads, and identification notches.
- Four-condition fit coupons and offset-joint trial parts; separate 4 mm and 8 mm layouts with 11 parts each.
- Temporary left/right supports for Mona's whiskers.
- Blender, FreeCAD, STEP, STL, and 3MF deliverables; images, videos, and the public viewer.
- Cleanup of local metadata in public copies, conversion to relative paths, and adaptation for static hosting.

The r2 revision changed part grouping and joints. The overall envelope and colors guided the work;
identical seams or pixel-for-pixel identity with Phase1 are **not** claimed.
These parts were not designed as compatible replacements for commercial bricks.

## Model license and limits

The model-derived deliverables are noncommercial experimental data distributed under **CC BY-NC 4.0**.
When redistributing or modifying them, retain attribution, a link to the license, and a notice of changes.
The included [LICENSE](LICENSE) is the upstream CC BY-NC 4.0 license text; it has not been changed for this English documentation.

No endorsement, sponsorship, certification, or compatibility by **GitHub or LEGO** is claimed.
Trademark rights belong to their respective owners.
Distributing geometry is not a guarantee of physical safety, fit, retention, or suitability for manufacture.
The files remain prototypes marked **NOT_SLICED**; the first physical trial revealed issues, redesign is under discussion,
and full-kit printing is **ON HOLD**.

## Photos, videos, and software

The physical-feedback photos and videos in `feedback/2026-09-19/media/` are published as improvement records with the contributor's permission.
**Copyright remains with the contributor. The model's CC BY-NC 4.0 license does not automatically apply to these photos or videos.**
Reuse beyond this publication permission must follow separate authorization from the rights holder.
Only the metadata-sanitized public files are retained for distribution; original attachments and audio or sensor tracks are not distributed.
See the [physical-feedback record](feedback/2026-09-19/README.en.md) for the media and its rights notice.

The rendered images and turntable videos in `artifacts/` are derivatives generated from the models described above.
The files in `assets/thumbs/` are reduced thumbnails of those actual rendered images.
Photos, videos, and models from third-party reference sites have not been republished.
The contributor's [YouTube link](https://youtu.be/rHhXFxvFU-E) shows **post-print ultrasonic cleaning**;
it is not footage of printing or evidence of successful fit. The reported holes were already blocked before cleaning.

Third-party software, including Three.js, is governed by the individual licenses in
[THIRD_PARTY_LICENSES.txt](viewer/THIRD_PARTY_LICENSES.txt).
The original copyright notices and license text are retained.
