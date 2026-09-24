import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname, sep } from 'node:path';
import { gunzipSync, gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { MeshoptEncoder, MeshoptDecoder } from '../viewer/node_modules/meshoptimizer/index.js';

const root = resolve(new URL('../', import.meta.url).pathname);
const argument = process.argv.indexOf('--stage');
if (argument < 0 || !process.argv[argument + 1]) throw new Error('An owned reviewed stage is required');
const stage = resolve(process.argv[argument + 1]);
if (!stage.startsWith(root + sep + '.archive-work' + sep)) throw new Error('Lossless packing must use owned native staging');
const sha = data => createHash('sha256').update(data).digest('hex');
const report = JSON.parse(await readFile(resolve(stage, 'repository-native-public-verification.json')));
if (report.all_anonymous_cors_sha_native_geometry !== true) throw new Error('First verify the original immutable public native blobs');
await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const files = [];
for (const source of report.files) {
  const packed = await readFile(resolve(root, source.repository_path));
  if (packed.length !== source.bytes || sha(packed) !== source.sha256) throw new Error('Original native geometry changed');
  const raw = gunzipSync(packed), vertexCount = raw.readUInt32LE(4), faces = raw.readUInt32LE(8);
  if (raw.subarray(0, 4).toString() !== 'OBM1' || raw.length !== 12 + vertexCount * 12 + faces * 12
    || sha(raw.subarray(12)) !== source.geometry_sha256) throw new Error('Original native arrays differ');
  const positions = raw.subarray(12, 12 + vertexCount * 12), indices = raw.subarray(12 + vertexCount * 12);
  const encodedPositions = MeshoptEncoder.encodeVertexBuffer(positions, vertexCount, 12);
  const encodedIndices = MeshoptEncoder.encodeIndexSequence(indices, faces * 3, 4);
  const decodedPositions = new Uint8Array(positions.length), decodedIndices = new Uint8Array(indices.length);
  MeshoptDecoder.decodeVertexBuffer(decodedPositions, vertexCount, 12, encodedPositions);
  MeshoptDecoder.decodeIndexSequence(decodedIndices, faces * 3, 4, encodedIndices);
  if (!Buffer.from(decodedPositions).equals(positions) || !Buffer.from(decodedIndices).equals(indices)) {
    throw new Error('The transport is not bit-exact for all original Float32 values and index ordering');
  }
  const header = Buffer.alloc(24);
  header.write('OBMLZ001'); header.writeUInt32LE(vertexCount, 8); header.writeUInt32LE(faces, 12);
  header.writeUInt32LE(encodedPositions.length, 16); header.writeUInt32LE(encodedIndices.length, 20);
  const bytes = gzipSync(Buffer.concat([header, encodedPositions, encodedIndices]), { level: 9, mtime: 0 });
  const repositoryPath = `viewer-data/copilot-symmetry-20260923/lossless/${source.type_id}.mesh.gz`;
  const path = resolve(root, repositoryPath);
  await mkdir(dirname(path), { recursive: true });
  try {
    const old = await readFile(path);
    if (!old.equals(bytes)) throw new Error('A fixed lossless native transport path would change');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await writeFile(path, bytes);
  }
  files.push({
    type_id: source.type_id, repository_path: repositoryPath, format: 'OBM1_MESHOPT_GZIP',
    codec: 'MESHOPT_VERTEX_BUFFER_AND_INDEX_SEQUENCE', codec_version: '1.2.0',
    bytes: bytes.length, sha256: sha(bytes), geometry_sha256: source.geometry_sha256,
    decoded_bytes: raw.length, decoded_sha256: sha(raw),
    native_repository_path: source.repository_path, native_public_commit: source.public_commit,
    native_sha256: source.sha256, native_bytes: source.bytes,
    original_float32_and_uint32_bytes_recovered: true,
    native_geometry_modified: false, indices_reordered: false,
  });
}
const output = {
  schema_version: 1, case_id: report.case_id, mode: 'LOSSLESS_NATIVE_TRANSPORT_NOT_DISPLAY_LOD',
  original_public_native_commit: report.public_commit, files,
  original_gzip_bytes: files.reduce((sum, file) => sum + file.native_bytes, 0),
  transport_gzip_bytes: files.reduce((sum, file) => sum + file.bytes, 0),
};
await writeFile(resolve(stage, 'lossless-native-transport.json'), JSON.stringify(output, null, 2) + '\n');
const indexPath = resolve(root, 'viewer-data/copilot-symmetry-20260923/lossless-manifest.json');
let index;
try { index = JSON.parse(await readFile(indexPath)); }
catch (error) {
  if (error.code !== 'ENOENT') throw error;
  index = { schema_version: 1, mode: 'LOSSLESS_NATIVE_TRANSPORT_NOT_DISPLAY_LOD',
    codec: 'meshoptimizer1.2.0 vertex-buffer + index-sequence, then gzip',
    source_native_files_preserved: true, files: [] };
}
const byType = new Map(index.files.map(file => [file.type_id, file]));
for (const file of files) {
  const previous = byType.get(file.type_id);
  if (previous) {
    for (const key of ['repository_path', 'sha256', 'geometry_sha256', 'decoded_sha256', 'native_sha256']) {
      if (previous[key] !== file[key]) throw new Error('Previously archived lossless native bytes would change');
    }
  } else byType.set(file.type_id, file);
}
index.files = [...byType.values()].sort((a, b) => a.type_id.localeCompare(b.type_id));
await writeFile(indexPath, JSON.stringify(index, null, 2) + '\n');
console.log(JSON.stringify({ case: report.case_id, types: files.length, original: output.original_gzip_bytes,
  lossless: output.transport_gzip_bytes, geometry_changed: false, indices_reordered: false }));
