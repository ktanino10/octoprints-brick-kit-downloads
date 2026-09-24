import { readFile, writeFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { gunzipSync, gzipSync } from 'node:zlib';
import { validateNativeGeometryFile } from '../assets/density-data.js';
import { decodeLosslessNativeType } from '../viewer/src/density-assets.js';

const argument = name => {
  const i = process.argv.indexOf(name);
  if (i < 0 || !process.argv[i + 1]) throw new Error(`Missing ${name}`);
  return process.argv[i + 1];
};
const root = resolve(new URL('../', import.meta.url).pathname), stage = resolve(argument('--stage'));
const commit = argument('--public-commit');
if (!stage.startsWith(root + sep + '.archive-work' + sep) || !/^[0-9a-f]{40}$/.test(commit)) throw new Error('Owned stage and immutable public commit required');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const transport = JSON.parse(await readFile(resolve(stage, 'lossless-native-transport.json')));
const receiptPath = resolve(root, 'archive/copilot-symmetry-revision.json');
const receipt = JSON.parse(await readFile(receiptPath));
const row = receipt.cases.find(item => item.actual_case_id === transport.case_id);
if (row?.status !== 'PUBLIC_PENDING') throw new Error('Do not rewrite a publicly verified corrected guide');
const catalogPath = resolve(root, receipt.revision_catalog.path.slice(1)), catalog = JSON.parse(await readFile(catalogPath));
const entry = catalog.cases.find(item => item.id === transport.case_id), relative = entry.manifest.path.slice(1);
if (spawnSync('git', ['cat-file', '-e', `origin/main:${relative}`], { cwd: root }).status === 0) {
  throw new Error('Use a new guide path instead of replacing a previously published guide');
}
const compressed = await readFile(resolve(root, relative));
if (hash(compressed) !== entry.manifest.sha256) throw new Error('Current unserved normalized guide changed');
const guide = JSON.parse(gunzipSync(compressed)), byType = new Map(transport.files.map(file => [file.type_id, file]));
let replaced = 0;
for (let index = 0; index < guide.geometry_files.length; index++) {
  const original = guide.geometry_files[index], item = byType.get(original.type_id);
  if (!item) continue;
  if (original.storage !== 'PUBLIC_REPO_COMMIT' || original.sha256 !== item.native_sha256
      || original.geometry_sha256 !== item.geometry_sha256 || original.public_commit !== item.native_public_commit
      || original.repository_path !== item.native_repository_path) throw new Error('The transport would point to different native geometry');
  const bytes = await readFile(resolve(root, item.repository_path));
  const git = execFileSync('git', ['cat-file', 'blob', `${commit}:${item.repository_path}`], { cwd: root, maxBuffer: 90_000_000 });
  if (!bytes.equals(git) || hash(bytes) !== item.sha256 || bytes.length !== item.bytes) throw new Error('Published transport bytes differ');
  const file = { ...item, storage: 'PUBLIC_REPO_COMMIT', public_commit: commit,
    url: `https://raw.githubusercontent.com/ktanino10/octoprints-brick-kit-downloads/${commit}/${item.repository_path}` };
  validateNativeGeometryFile(file);
  const decoded = await decodeLosslessNativeType(gunzipSync(bytes), file);
  if (decoded.types[file.type_id].geometry_sha256 !== original.geometry_sha256) throw new Error('Decoded native geometry changed');
  guide.geometry_files[index] = file; replaced++;
}
if (replaced !== transport.files.length) throw new Error('A lossless transport type is absent from the actual guide');
const next = gzipSync(Buffer.from(JSON.stringify(guide) + '\n'), { level: 9, mtime: 0 });
await writeFile(resolve(root, relative), next);
entry.manifest.bytes = next.length; entry.manifest.sha256 = hash(next);
const catalogBytes = Buffer.from(JSON.stringify(catalog, null, 2) + '\n');
await writeFile(catalogPath, catalogBytes);
receipt.revision_catalog.bytes = catalogBytes.length; receipt.revision_catalog.sha256 = hash(catalogBytes);
await writeFile(receiptPath, JSON.stringify(receipt, null, 2) + '\n');
await writeFile(resolve(stage, 'lossless-native-transport-applied.json'), JSON.stringify({
  case_id: transport.case_id, public_commit: commit, types: replaced,
  prior_guide_sha256: hash(compressed), guide_sha256: hash(next), guide_bytes: next.length,
  native_geometry_modified: false, source_model_modified: false, already_published_guides_modified: false,
}, null, 2) + '\n');
console.log('Updated only the unserved guide transport for', transport.case_id, replaced, 'exact-native types');
