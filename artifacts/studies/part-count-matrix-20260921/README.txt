Part-count matrix / separate digital designs, not production approval.

For native CAD, Blender scenes, full-resolution CG and videos, use the versioned
Release case bundles. Preserve cases/ and shared/ relative directories when
extracting. Native assembly.FCStd uses actual shared linked masters. Type STEP
and STL files, actual-ID BOM and motion metadata are included.

The public interactive meshes are the same native tessellation, encoded as OBM1:
gzip bytes; decompressed ASCII magic OBM1; little-endian uint32 vertex count and
triangle count; packed little-endian Float32 XYZ coordinates, then Uint32 triangle
indices. Dimensions are millimeters. Float32 rounding error and fingerprints are
recorded per type. This is not a box proxy.

Part positions are body-bottom-center coordinates. Rotate about local+Z by the
given degrees, then translate to position_mm. Radial display is always
position_mm + slider * radial_offset_mm; never accumulate deltas. It is a
display separation, not a tested physical extraction path.

The bottom-up order is step1..N with actual-Z assembly courses. Step0 has no
figure pieces; final has every ID once. Required temporary supports are separate
from the figure count and must be shown/explained before dependent seed parts.

Printing plates/slots, slicing, machine profiles and G-code are NOT_GENERATED.
The part-file guide maps existing type STL/STEP to matching type/color/IDs only.

The1x baselines are provisional creator assumptions: Mona12435,
Copilot17873 and Ducky9669. Targets are physical-piece counts with round-half-up,
not linear size multipliers. Actual counts, ratios, dimensions and deviations
are recorded separately. User aesthetic selection, fit, retention, stability
and printing remain unapproved.
