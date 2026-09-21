import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { gunzipSync, gzipSync } from 'node:zlib';
import { simplifyDisplayMesh } from './density_display_mesh.mjs';
import { DENSITY_ID, densityGuideEntries } from '../assets/density-data.js';

const root = new URL('../', import.meta.url);
const prefix = `artifacts/studies/${DENSITY_ID}/`;
const sha = value => createHash('sha256').update(value).digest('hex');
const catalog = JSON.parse(await readFile(new URL(prefix + 'catalog.json', root)));
const display = { schema_version: 1, study_id: DENSITY_ID, mode: 'DISPLAY_ONLY_LIGHTWEIGHT',
  error_description: 'Approximate simplifier error, not a manufacturing tolerance or a Hausdorff proof.',
  roots_and_non_rectangular_types: 'UNCHANGED_NATIVE', selected_part_preview: 'UNCHANGED_NATIVE',
  cases: {}, geometry: {} };
await mkdir(new URL(prefix + 'display/geometry/', root), { recursive: true });
for (const entry of densityGuideEntries(catalog)) {
  if (entry.state === 'INPUT_WAIT') continue;
  const data = await readFile(new URL(entry.manifest.path.slice(1), root));
  if (sha(data) !== entry.manifest.sha256) throw new Error('Actual guide identity changed before display derivation');
  const model = JSON.parse(gunzipSync(data)), counts = new Map();
  for (const part of model.parts) counts.set(part.type_id, (counts.get(part.type_id) ?? 0) + 1);
  let before = 0, after = 0;
  const files = [];
  for (const file of model.geometry_files) {
    const original = await readFile(new URL(file.path.slice(1), root));
    if (sha(original) !== file.sha256) throw new Error('Native source mesh changed');
    const raw = new Uint8Array(gunzipSync(original)), view = new DataView(raw.buffer);
    const vertices = view.getUint32(4, true), faces = view.getUint32(8, true);
    const count = counts.get(file.type_id) ?? 1;
    before += count * faces;
    if (!/^(?:BR|PL)-\d+x\d+-H\d+(?:-EDGE-C020)?$/.test(file.type_id)) {
      files.push(file); after += count * faces; continue;
    }
    const key = file.geometry_sha256;
    if (!display.geometry[key]) {
      const simplified = await simplifyDisplayMesh(new Float32Array(raw.buffer, 12, vertices * 3),
        new Uint32Array(raw.buffer, 12 + vertices * 12, faces * 3));
      const header = Buffer.alloc(12);
      header.write('OBM1'); header.writeUInt32LE(simplified.positions.length / 3, 4);
      header.writeUInt32LE(simplified.indices.length / 3, 8);
      const arrays = Buffer.concat([Buffer.from(simplified.positions.buffer), Buffer.from(simplified.indices.buffer)]);
      const compressed = gzipSync(Buffer.concat([header, arrays]), { level: 9, mtime: 0 });
      const path = prefix + `display/geometry/${key}-e004.mesh.gz`;
      try {
        const existing = await readFile(new URL(path, root));
        if (sha(existing) !== sha(compressed)) throw new Error('An existing versioned display mesh would be overwritten');
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        await writeFile(new URL(path, root), compressed);
      }
      const { positions, indices, ...quality } = simplified;
      display.geometry[key] = { ...file, path: '/' + path, bytes: compressed.length, sha256: sha(compressed),
        geometry_sha256: sha(arrays), source_geometry_sha256: file.geometry_sha256,
        mode: 'NATIVE_PREVIEW_TESSELLATION', quality };
      console.log(file.type_id, faces, '→', simplified.indices.length / 3, 'triangles');
    }
    const preview = { ...display.geometry[key], type_id: file.type_id };
    files.push(preview);
    after += count * preview.quality.after.triangles;
  }
  display.cases[entry.id] = { source_manifest_sha256: entry.manifest.sha256, geometry_files: files,
    native_triangles_per_frame: before, display_triangles_per_frame: after, reduction: before / after };
}
const displayBytes = Buffer.from(JSON.stringify(display, null, 2) + '\n');
await writeFile(new URL(prefix + 'display/catalog.json', root), displayBytes);
catalog.display_catalog = { path: '/' + prefix + 'display/catalog.json', bytes: displayBytes.length, sha256: sha(displayBytes) };
const catalogBytes = Buffer.from(JSON.stringify(catalog, null, 2) + '\n');
await writeFile(new URL(prefix + 'catalog.json', root), catalogBytes);
const pointerPath = new URL('archive/density-study.json', root);
const pointer = JSON.parse(await readFile(pointerPath));
pointer.catalog = { path: '/' + prefix + 'catalog.json', bytes: catalogBytes.length, sha256: sha(catalogBytes) };
await writeFile(pointerPath, JSON.stringify(pointer, null, 2) + '\n');
execFileSync('python3', ['tools/make_density_receipt.py'], { stdio: 'inherit' });
console.log(JSON.stringify(Object.fromEntries(Object.entries(display.cases).map(([id, item]) => [id, {
  native: item.native_triangles_per_frame, display: item.display_triangles_per_frame, reduction: item.reduction,
}]))));
