# Attribution, modifications, and licensing

[日本語](ATTRIBUTION.md) / [English](ATTRIBUTION.en.md) · [Archive overview](README.en.md)

This public archive grew out of a noncommercial exploration of assembling Mona, Copilot, and Ducky from independent bricks.
It separates the fifteen higher-part design comparisons from the Phase1, r2 and r3 trial history.
Actual published models, images/videos, native CAD, placements, BOMs, joints and trials are identified in the
[revision registry](archive/revisions.json) and [complete inventory](archive/inventory.json).
The two legacy root-level files for the 4 mm, 11-part trial are preserved unchanged.

## Upstream work and credit

[martinwoodward/octoprints](https://github.com/martinwoodward/octoprints) publishes GitHub-themed
3D-printable mascot models. It is the starting point for the character shapes and colors used here.
We do not present those original characters as this project's own original work.

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

Later higher-part studies add larger assembled sizes, half-height parts, integrated roots/body assembly structures,
five physical-part-count multipliers, radial separation, bottom-up assembly explanations, display-only LOD and 360-degree previews.
Our part decomposition, native CAD, sequences and viewing features are not attributed to the upstream project as its implementation or validation.

The r3 redesign authorized on 2026-09-20 uses an 8 mm pitch, 9.6 mm brick bodies and 3.2 mm plates,
with open-underside walls, tubes and ribs. It prioritizes parts such as 2×2 and 2×4 blocks rather than preserving
the earlier micro-pin system, grouping or counts.
These are independent prototype dimension assumptions, not official LEGO manufacturing tolerances or compatibility claims.
A revision awaiting actual deliverables is not described as available; earlier published artifacts and hashes are preserved.

## Model license and limits

The model-derived deliverables are noncommercial experimental data distributed under **CC BY-NC 4.0**.
When redistributing or modifying them, retain attribution, a link to the license, and a notice of changes.
The included [LICENSE](LICENSE) is the upstream CC BY-NC 4.0 license text; it has not been changed for this English documentation.

No endorsement, sponsorship, certification, or compatibility by **GitHub or LEGO** is claimed.
Trademark rights belong to their respective owners.
Distributing geometry is not a guarantee of physical safety, fit, retention, or suitability for manufacture.
The files remain prototypes marked **NOT_SLICED**, and full-kit printing is **ON HOLD**.
Implementation of the common-block redesign is authorized, but physical manufacturing is not approved.
Issues in the earlier 4 mm physical trial are not presented as physical results for the new 8 mm common blocks.

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
[THIRD_PARTY_LICENSES.txt](viewer/assets/THIRD_PARTY_LICENSES.txt).
The original copyright notices and license text are retained.

## Public software used

| Project | Introduction and role here | License |
|---|---|---|
| [mrdoob/three.js](https://github.com/mrdoob/three.js) | A browser 3D library, used for actual-mesh rendering, rotation/zoom and instanced shared geometry. | MIT |
| [zeux/meshoptimizer](https://github.com/zeux/meshoptimizer) | A mesh-optimization library, used only to precompute display LOD for ordinary bricks. It does not replace the original CAD, STL or Blender files. | MIT |

These are software tools, not the source of the character designs. Their MIT or other software licenses are
distinct from CC BY-NC 4.0 on model-derived artifacts. Pinned-version notices, including build/test tools,
are retained in the third-party license document linked above.

## Public interface references

The [public assembly guide](https://ktanino10.github.io/copilot-brick-display/assembly-guide/B.html?commit=35ebc1123477)
and [public assembly view](https://ktanino10.github.io/copilot-brick-display/assembly.html?commit=35ebc1123477)
informed the part-to-placement navigation and step-by-step interaction.
This is a reference to interface presentation, not a republication of their code or model data.
