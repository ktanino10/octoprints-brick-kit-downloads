import { MeshoptSimplifier } from '../viewer/node_modules/meshoptimizer/index.js';

export function weldPositions(positions, indices) {
  const coordinates = [], lookup = new Map(), remap = new Uint32Array(positions.length / 3);
  for (let index = 0; index < remap.length; index++) {
    const point = [...positions.subarray(index * 3, index * 3 + 3)];
    const key = point.join(',');
    if (!lookup.has(key)) { lookup.set(key, coordinates.length / 3); coordinates.push(...point); }
    remap[index] = lookup.get(key);
  }
  return { positions: new Float32Array(coordinates), indices: Uint32Array.from(indices, index => remap[index]) };
}

export function meshMeasures(positions, indices) {
  const used = new Set(indices), edges = new Map(), min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const index of used) for (let axis = 0; axis < 3; axis++) {
    min[axis] = Math.min(min[axis], positions[index * 3 + axis]);
    max[axis] = Math.max(max[axis], positions[index * 3 + axis]);
  }
  let volume = 0;
  const caps = new Map();
  for (let offset = 0; offset < indices.length; offset += 3) {
    const a = indices[offset], b = indices[offset + 1], c = indices[offset + 2];
    for (const [left, right] of [[a, b], [b, c], [c, a]]) {
      const key = left < right ? `${left}:${right}` : `${right}:${left}`;
      edges.set(key, (edges.get(key) ?? 0) + 1);
    }
    const ax = positions[a * 3], ay = positions[a * 3 + 1], az = positions[a * 3 + 2];
    const bx = positions[b * 3], by = positions[b * 3 + 1], bz = positions[b * 3 + 2];
    const cx = positions[c * 3], cy = positions[c * 3 + 1], cz = positions[c * 3 + 2];
    volume += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
    if ([a, b, c].every(index => Math.abs(positions[index * 3 + 2] - max[2]) < 1e-5)) {
      for (const [left, right] of [[a, b], [b, c], [c, a]]) {
        if (!caps.has(left)) caps.set(left, new Set());
        if (!caps.has(right)) caps.set(right, new Set());
        caps.get(left).add(right); caps.get(right).add(left);
      }
    }
  }
  let capComponents = 0;
  const seen = new Set();
  for (const start of caps.keys()) {
    if (seen.has(start)) continue;
    capComponents++;
    const pending = [start];
    while (pending.length) {
      const index = pending.pop();
      if (seen.has(index)) continue;
      seen.add(index);
      for (const neighbor of caps.get(index)) if (!seen.has(neighbor)) pending.push(neighbor);
    }
  }
  return { vertices: used.size, triangles: indices.length / 3, bounds_mm: [min, max],
    volume_mm3: Math.abs(volume), euler_characteristic: used.size - edges.size + indices.length / 3,
    boundary_edges: [...edges.values()].filter(count => count === 1).length,
    nonmanifold_edges: [...edges.values()].filter(count => count > 2).length,
    top_cap_components: capComponents };
}

export async function simplifyDisplayMesh(positions, indices, errorMm = 0.04) {
  if (!Number.isFinite(errorMm) || errorMm <= 0 || errorMm > 0.04) throw new Error('Invalid display-only error budget');
  await MeshoptSimplifier.ready;
  const welded = weldPositions(positions, indices);
  const before = meshMeasures(welded.positions, welded.indices);
  const [reduced, error] = MeshoptSimplifier.simplify(welded.indices, welded.positions, 3,
    Math.max(12, Math.floor(welded.indices.length / 8 / 3) * 3), errorMm, ['ErrorAbsolute', 'LockBorder']);
  const after = meshMeasures(welded.positions, reduced);
  if (after.euler_characteristic !== before.euler_characteristic || after.boundary_edges !== before.boundary_edges
      || after.nonmanifold_edges !== before.nonmanifold_edges || after.top_cap_components !== before.top_cap_components) {
    throw new Error('Display LOD changed mesh topology or removed a stud cap');
  }
  if (error > errorMm + 1e-6 || !Number.isFinite(error)
      || before.volume_mm3 <= 0 || Math.abs(after.volume_mm3 / before.volume_mm3 - 1) > 0.02
      || before.bounds_mm.some((point, index) => point.some((value, axis) =>
        Math.abs(value - after.bounds_mm[index][axis]) > errorMm + 1e-6))) {
    throw new Error('Display LOD exceeded geometric quality limits');
  }
  const kept = [], remap = new Map();
  const compact = Uint32Array.from(reduced, index => {
    if (!remap.has(index)) {
      remap.set(index, kept.length / 3);
      kept.push(...welded.positions.subarray(index * 3, index * 3 + 3));
    }
    return remap.get(index);
  });
  return { positions: new Float32Array(kept), indices: compact, before, after,
    algorithm: 'MESHOPT_SIMPLIFY_NO_VERTEX_UPDATE', meshoptimizer_version: '1.2.0',
    approximate_error_mm: error, requested_error_mm: errorMm, original_vertex_positions_retained: true,
    manufacturing_geometry_modified: false };
}
