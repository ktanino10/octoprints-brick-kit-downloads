# Commit-pinned native viewer geometry

These files are exact source-native OBM1 gzip meshes for the Copilot symmetry correction.
They belong to this public repository but are deliberately excluded from the GitHub Pages payload.
The viewer downloads only required types from a fixed public commit and verifies compressed
SHA-256, decoded vertices/indices and the native geometry fingerprint.

This is lossless storage, not display LOD, not a replacement box model, and not proof that
a complete corrected case has passed publication or physical checks.
The optional `lossless/` transport encodes vertex buffers and **index sequences**
with the already pinned meshoptimizer codec, then gzip. Decoding restores the
original Float32 bytes and exact Uint32 triangle order, including their SHA-256;
it performs no simplification, quantization or index reordering. The original
OBM1 gzip files remain unchanged in `geometry/`. Both forms are bound to immutable
public commits. This reduces transfer bytes, not physical or visual detail.
Existing Pages-native meshes stay at their original paths. Complete CAD, authoring files,
Blender scenes and media are distributed through versioned public Releases.

Original character models: [martinwoodward/octoprints](https://github.com/martinwoodward/octoprints),
pinned revision `981a85f0bec9d1a9c280fd5719d0d797852229c4`.
Model derivatives follow [CC BY-NC 4.0](../LICENSE). Preserve
[attribution and modification notices](../ATTRIBUTION.en.md).
No GitHub/LEGO endorsement, commercial-brick compatibility, or physical manufacturing approval is claimed.
