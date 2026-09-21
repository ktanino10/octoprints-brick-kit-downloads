import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { simplifyDisplayMesh } from '../../tools/density_display_mesh.mjs';

const root = new URL('../../', import.meta.url);
const prefix = 'artifacts/studies/part-count-matrix-20260921/';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

test('display-only simplification preserves original coordinates, topology and eight real stud caps', async () => {
  const path = new URL(prefix + 'geometry/BR-02x04-H048.mesh.gz', root);
  const source = await readFile(path), beforeHash = sha(source);
  const raw = new Uint8Array(gunzipSync(source)), view = new DataView(raw.buffer);
  const vertices = view.getUint32(4, true), faces = view.getUint32(8, true);
  const positions = new Float32Array(raw.buffer, 12, vertices * 3);
  const indices = new Uint32Array(raw.buffer, 12 + vertices * 12, faces * 3);
  const original = new Set(Array.from({ length: vertices }, (_, index) => [...positions.subarray(index * 3, index * 3 + 3)].join(',')));
  const result = await simplifyDisplayMesh(positions, indices);
  assert.ok(result.after.triangles < result.before.triangles / 4);
  assert.equal(result.before.top_cap_components, 8);
  assert.equal(result.after.top_cap_components, 8);
  assert.equal(result.after.euler_characteristic, result.before.euler_characteristic);
  assert.equal(result.after.boundary_edges, result.before.boundary_edges);
  assert.ok(result.approximate_error_mm <= 0.040001);
  assert.ok(Math.abs(result.after.volume_mm3 / result.before.volume_mm3 - 1) < 0.02);
  for (let index = 0; index < result.positions.length; index += 3) {
    assert.ok(original.has([...result.positions.subarray(index, index + 3)].join(',')));
  }
  assert.equal(sha(await readFile(path)), beforeHash);
  await assert.rejects(() => simplifyDisplayMesh(positions, indices, 1), /budget/);
});

test('display catalog remains bound to actual guides and never simplifies root or special geometry', async () => {
  const catalog = JSON.parse(await readFile(new URL(prefix + 'display/catalog.json', root)));
  assert.equal(catalog.selected_part_preview, 'UNCHANGED_NATIVE');
  assert.equal(catalog.roots_and_non_rectangular_types, 'UNCHANGED_NATIVE');
  for (const [id, item] of Object.entries(catalog.cases)) {
    const source = await readFile(new URL(prefix + `cases/${id}-guide.json.gz`, root));
    assert.equal(sha(source), item.source_manifest_sha256);
    const manifest = JSON.parse(gunzipSync(source));
    const originals = new Map(manifest.geometry_files.map(file => [file.type_id, file]));
    for (const file of item.geometry_files) {
      const original = originals.get(file.type_id);
      assert.ok(original);
      const bytes = await readFile(new URL(file.path.slice(1), root));
      assert.equal(sha(bytes), file.sha256);
      if (file.mode === 'NATIVE_PREVIEW_TESSELLATION') {
        assert.match(file.type_id, /^(?:BR|PL)-\d+x\d+-H\d+(?:-EDGE-C020)?$/);
        assert.equal(file.source_geometry_sha256, original.geometry_sha256);
        assert.equal(file.quality.manufacturing_geometry_modified, false);
        assert.equal(file.quality.before.top_cap_components, file.quality.after.top_cap_components);
      } else assert.deepEqual(file, original);
    }
    assert.ok(item.display_triangles_per_frame < item.native_triangles_per_frame / 3);
  }
});
