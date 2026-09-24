import { readFile, writeFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { validateNativeGeometryFile } from '../assets/density-data.js';
import { decodeLosslessNativeType } from '../viewer/src/density-assets.js';

const get = name => { const i = process.argv.indexOf(name); if (i < 0 || !process.argv[i + 1]) throw new Error(`Missing ${name}`); return process.argv[i + 1]; };
const root = resolve(new URL('../', import.meta.url).pathname), stage = resolve(get('--stage')), commit = get('--public-commit');
if (!stage.startsWith(root + sep + '.archive-work' + sep) || !/^[0-9a-f]{40}$/.test(commit)) throw new Error('Owned stage and public commit required');
const record = JSON.parse(await readFile(resolve(stage, 'lossless-native-transport.json')));
const checked = [];
let cursor = 0;
async function next() {
  while (cursor < record.files.length) {
    const item = record.files[cursor++], file = { ...item, storage: 'PUBLIC_REPO_COMMIT', public_commit: commit,
      url: `https://raw.githubusercontent.com/ktanino10/octoprints-brick-kit-downloads/${commit}/${item.repository_path}` };
    validateNativeGeometryFile(file);
    const response = await fetch(file.url, { credentials: 'omit', redirect: 'error', signal: AbortSignal.timeout(120000),
      headers: { Origin: 'https://ktanino10.github.io' } });
    if (response.status !== 200 || response.headers.get('access-control-allow-origin') !== '*'
      || response.headers.get('content-type')?.split(';')[0] !== 'application/octet-stream') throw new Error('Actual public native transport failed CORS/MIME/status checks');
    const bytes = Buffer.from(await response.arrayBuffer());
    const hash = createHash('sha256').update(bytes).digest('hex');
    if (bytes.length !== item.bytes || hash !== item.sha256) throw new Error('Actual public transport SHA/bytes differ');
    const fixed = execFileSync('git', ['cat-file', 'blob', `${commit}:${item.repository_path}`], { cwd: root, maxBuffer: 90_000_000 });
    if (!fixed.equals(bytes)) throw new Error('Public transport is not its immutable Git blob');
    const decoded = await decodeLosslessNativeType(gunzipSync(bytes), file);
    if (decoded.types[item.type_id].geometry_sha256 !== item.geometry_sha256) throw new Error('Native geometry arrays were changed by transport');
    checked.push({ ...file, http_status: 200, cors_allow_origin: '*', content_type: 'application/octet-stream',
      authentication: 'none', decoded_native_geometry_verified: true, original_indices_order_preserved: true });
  }
}
await Promise.all(Array.from({ length: Math.min(4, record.files.length) }, next));
await writeFile(resolve(stage, 'lossless-native-public-verification.json'), JSON.stringify({
  case_id: record.case_id, state: 'PUBLIC_NATIVE_MESHES_VERIFIED_NOT_CASE_READY', public_commit: commit,
  files: checked.sort((a, b) => a.type_id.localeCompare(b.type_id)),
  bytes: checked.reduce((total, file) => total + file.bytes, 0), all_anonymous_cors_sha_native_geometry: true,
  bit_exact_lossless_transport_not_display_simplification: true,
}, null, 2) + '\n');
console.log('Verified', checked.length, 'actual public lossless native transports; all original geometry fingerprints retained.');
