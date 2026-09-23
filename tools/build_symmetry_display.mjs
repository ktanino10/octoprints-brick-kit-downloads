import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { DENSITY_ID } from '../assets/density-data.js';

const root = new URL('../', import.meta.url);
const prefix = `artifacts/studies/${DENSITY_ID}/`;
const target = prefix + 'revisions/bilateral-symmetry-v3/';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const base = JSON.parse(await readFile(new URL(prefix + 'display/catalog.json', root)));
const catalog = JSON.parse(await readFile(new URL(target + 'catalog.json', root)));
const result = { schema_version: 1, study_id: DENSITY_ID, mode: 'DISPLAY_ONLY_LIGHTWEIGHT',
  roots_and_non_rectangular_types: 'UNCHANGED_NATIVE', selected_part_preview: 'UNCHANGED_NATIVE',
  policy: 'Reuse only previously verified stock-brick display meshes with identical native fingerprints. New types remain exact native geometry.',
  cases: {}, geometry: {} };
for (const entry of catalog.cases.filter(row => row.state === 'READY')) {
  const bytes = await readFile(new URL(entry.manifest.path.slice(1), root));
  if (sha(bytes) !== entry.manifest.sha256) throw new Error('Accepted symmetry guide changed before display indexing');
  const manifest = JSON.parse(gunzipSync(bytes)), count = new Map();
  for (const part of manifest.parts) count.set(part.type_id, (count.get(part.type_id) ?? 0) + 1);
  let before = 0, after = 0;
  const files = [];
  for (const file of manifest.geometry_files) {
    const nativePath = file.storage === 'PUBLIC_REPO_COMMIT' ? file.repository_path : file.path.slice(1);
    const compressed = await readFile(new URL(nativePath, root));
    if (sha(compressed) !== file.sha256) throw new Error('Exact native geometry changed');
    const raw = gunzipSync(compressed), faces = raw.readUInt32LE(8), instances = count.get(file.type_id) ?? 1;
    before += instances * faces;
    const old = /^(?:BR|PL)-\d+x\d+-H\d+(?:-EDGE-C020)?$/.test(file.type_id) ? base.geometry[file.geometry_sha256] : null;
    if (old) {
      if (old.source_geometry_sha256 !== file.geometry_sha256 || old.quality.manufacturing_geometry_modified !== false) {
        throw new Error('Existing display mesh does not preserve its exact native origin');
      }
      const packed = await readFile(new URL(old.path.slice(1), root));
      if (sha(packed) !== old.sha256) throw new Error('Fixed display mesh changed');
      files.push({ ...old, type_id: file.type_id });
      after += instances * old.quality.after.triangles;
    } else {
      files.push(file); after += instances * faces;
    }
  }
  result.cases[entry.id] = { source_manifest_sha256: entry.manifest.sha256, geometry_files: files,
    native_triangles_per_frame: before, display_triangles_per_frame: after, reduction: before / after };
}
await mkdir(new URL(target + 'display/', root), { recursive: true });
const data = Buffer.from(JSON.stringify(result, null, 2) + '\n');
await writeFile(new URL(target + 'display/catalog.json', root), data);
catalog.display_catalog = { path: '/' + target + 'display/catalog.json', bytes: data.length, sha256: sha(data) };
const catalogBytes = Buffer.from(JSON.stringify(catalog, null, 2) + '\n');
await writeFile(new URL(target + 'catalog.json', root), catalogBytes);
const path = new URL('archive/copilot-symmetry-revision.json', root), receipt = JSON.parse(await readFile(path));
receipt.revision_catalog = { path: '/' + target + 'catalog.json', bytes: catalogBytes.length, sha256: sha(catalogBytes) };
await writeFile(path, JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify(Object.fromEntries(Object.entries(result.cases).map(([key, value]) =>
  [key, { native: value.native_triangles_per_frame, display: value.display_triangles_per_frame, reduction: value.reduction }]))));
