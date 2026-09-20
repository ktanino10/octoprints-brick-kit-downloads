# COPILOT / candidate assembly sequence

COPILOT: 695 separately identified parts / 86 types / 181.0 mm high.

**Digital procedure only. Physical retention, load capacity and full printing remain unapproved.**

Start only after the new common-brick trial is reviewed. Sort by color/type using `bom-types-colors.csv`; each placed part is mapped in `bom.csv` and `assembly-steps.csv`.

Build the two low foundation plate courses first. Continue in increasing actual Z and ascending step number. Every part approaches from above (-Z). Align studs with the open underside spaces between walls/tubes; do not target the tube bores. Never force a fit.

The layer number is bottom Z / 3.2 mm: a brick spans three units, a plate one. The course maps below show footprint/step labels, not slicer toolpaths. Use the interactive native-mesh viewer for part selection, exact ID, color and support references.

Small 1x1 exceptions: 10. Their IDs are explicitly listed in the manifest. Partial stud contact and a connected graph do not certify grip, friction or accumulated load.

- [Course 01](courses/course-01.svg)
- [Course 02](courses/course-02.svg)
- [Course 03](courses/course-03.svg)
- [Course 04](courses/course-04.svg)
- [Course 05](courses/course-05.svg)
- [Course 06](courses/course-06.svg)
- [Course 07](courses/course-07.svg)
- [Course 08](courses/course-08.svg)
- [Course 09](courses/course-09.svg)
- [Course 10](courses/course-10.svg)
- [Course 11](courses/course-11.svg)
- [Course 12](courses/course-12.svg)
- [Course 13](courses/course-13.svg)
- [Course 14](courses/course-14.svg)
- [Course 15](courses/course-15.svg)
- [Course 16](courses/course-16.svg)
- [Course 17](courses/course-17.svg)
- [Course 18](courses/course-18.svg)
- [Course 19](courses/course-19.svg)
- [Course 20](courses/course-20.svg)

Stop for blocked insertion, excessive force, missing cavity/toolpaths, cracks or unstable support. Hands, tools, material deformation, first-layer errors and impact are not included in the nominal checks.
