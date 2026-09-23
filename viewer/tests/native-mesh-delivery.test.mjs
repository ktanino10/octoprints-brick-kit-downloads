import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { DENSITY_ID, SYMMETRY_MESH_PREFIX, validateDensityFile, validateNativeGeometryFile } from '../../assets/density-data.js';
import { loadNativeLibraries, verifiedJSON } from '../src/density-assets.js';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function fixture() {
  const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
  const indices = new Uint32Array([0, 1, 2]);
  const body = Buffer.concat([Buffer.from(positions.buffer), Buffer.from(indices.buffer)]);
  const header = Buffer.alloc(12);
  header.write('OBM1'); header.writeUInt32LE(3, 4); header.writeUInt32LE(1, 8);
  const packed = gzipSync(Buffer.concat([header, body]), { mtime: 0 });
  const file = {
    storage: 'PUBLIC_REPO_COMMIT', type_id: 'UNIT-ONLY',
    public_commit: 'a'.repeat(40), repository_path: `${SYMMETRY_MESH_PREFIX}UNIT-ONLY.mesh.gz`,
    format: 'OBM1_GZIP', bytes: packed.length, sha256: hash(packed), geometry_sha256: hash(body),
  };
  file.url = `https://raw.githubusercontent.com/ktanino10/octoprints-brick-kit-downloads/${file.public_commit}/${file.repository_path}`;
  return { packed, file };
}

test('only native meshes in the exact repository, immutable commit and type path can use repository delivery', async () => {
  const { file } = fixture();
  assert.equal(validateNativeGeometryFile(file), file);
  assert.throws(() => validateDensityFile(file));
  for (const mutate of [
    f => { f.public_commit = 'main'; },
    f => { f.url = f.url.replace('octoprints-brick-kit-downloads/', 'octoprints-brick-kit/'); },
    f => { f.url = f.url.replace('raw.githubusercontent.com', 'github.com'); },
    f => { f.url += '?raw=1'; },
    f => { f.url += '#allowed'; },
    f => { f.repository_path = f.repository_path.replace('/geometry/', '/../geometry/'); },
    f => { f.type_id = '../UNIT-ONLY'; },
    f => { f.type_id = 'DIFFERENT-TYPE'; },
    f => { f.path = '/artifacts/studies/part-count-matrix-20260921/old.mesh.gz'; },
    f => { f.format = 'JSON'; },
    f => { f.mode = 'NATIVE_PREVIEW_TESSELLATION'; },
    f => { f.mode = 'UNVERIFIED_PROXY'; },
    f => { f.sha256 = 'unverified'; },
    f => { f.storage = 'ANY_EXTERNAL_URL'; },
  ]) {
    const changed = structuredClone(file); mutate(changed);
    assert.throws(() => validateNativeGeometryFile(changed));
  }
  await assert.rejects(verifiedJSON(file));
});

test('real native loading checks compressed SHA and decoded geometry without cookies, redirects or fallback', async t => {
  const { file, packed } = fixture();
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, options });
    return new Response(packed, { status: 200, headers: { 'Content-Type': 'application/octet-stream' } });
  });
  const library = await loadNativeLibraries([file]);
  assert.equal(library.mode, 'NATIVE_FLOAT32');
  assert.equal(library.types['UNIT-ONLY'].geometry_sha256, file.geometry_sha256);
  assert.deepEqual([...library.types['UNIT-ONLY'].indices], [0, 1, 2]);
  assert.equal(calls[0].url, file.url);
  assert.equal(calls[0].options.credentials, 'omit');
  assert.equal(calls[0].options.redirect, 'error');
  assert.ok(calls[0].options.signal instanceof AbortSignal);
  await assert.rejects(loadNativeLibraries([{ ...file, sha256: 'b'.repeat(64) }]));
  await assert.rejects(loadNativeLibraries([{ ...file, geometry_sha256: 'c'.repeat(64) }]));
});

test('missing pinned native data is an explicit error and never fetches an earlier case', async t => {
  const { file } = fixture();
  const requests = [];
  t.mock.method(globalThis, 'fetch', async url => {
    requests.push(url);
    return new Response('missing actual native data', { status: 404 });
  });
  await assert.rejects(loadNativeLibraries([file]), /404/);
  assert.deepEqual(requests, [file.url]);
});

test('same-origin gzip proof verifies both transport and raw bytes, without raw-URL fallback', async t => {
  const raw = Buffer.from('{"unit_only":true,"not_real_model_evidence":true}\n');
  const packed = gzipSync(raw, { mtime: 0 });
  const file = {
    path: `/artifacts/studies/${DENSITY_ID}/validation/UNIT-ONLY-proof.json.gz`,
    encoding: 'gzip', bytes: packed.length, sha256: hash(packed),
    decoded_bytes: raw.length, decoded_sha256: hash(raw),
  };
  const requested = [];
  const mock = t.mock.method(globalThis, 'fetch', async (url, options) => {
    requested.push({ url, options });
    return new Response(packed, { status: 200 });
  });
  assert.deepEqual(await verifiedJSON(file), { unit_only: true, not_real_model_evidence: true });
  await assert.rejects(verifiedJSON({ ...file, decoded_sha256: 'f'.repeat(64) }));
  await assert.rejects(verifiedJSON({ ...file, decoded_bytes: raw.length + 1 }));
  assert.ok(requested.every(row => row.url.endsWith('UNIT-ONLY-proof.json.gz')));
  assert.ok(requested.every(row => row.options.credentials === 'omit' && row.options.redirect === 'error'));
  const calls = requested.length;
  await assert.rejects(verifiedJSON({ ...file, decoded_bytes: undefined }));
  assert.equal(requested.length, calls);
  mock.mock.mockImplementation(async () => new Response(raw, { status: 200 }));
  await assert.rejects(verifiedJSON({ ...file, bytes: raw.length, sha256: hash(raw) }));
  mock.mock.mockImplementation(async () => new Response('missing compressed evidence', { status: 404 }));
  await assert.rejects(verifiedJSON(file), /404/);
});
