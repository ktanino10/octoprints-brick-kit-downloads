import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { cameraFitDistance, partMatrix, prototypeGeometry, updateBatch } from '../src/geometry.js';

test('geometry consumes source vertices and triangle topology directly', () => {
  const source = {
    vertices: [[-2, -1, 0], [2, -1, 0], [0, 1, 3.48], [0, 0, 4.73]],
    faces: [[0, 1, 2], [1, 3, 2]],
  };
  const original = JSON.stringify(source);
  const geometry = prototypeGeometry(source);
  assert.equal(geometry.getAttribute('position').count, 4);
  assert.deepEqual([...geometry.index.array], [0, 1, 2, 1, 3, 2]);
  assert.ok(Math.abs(geometry.getAttribute('position').getZ(3) - 4.73) < 1e-6);
  assert.equal(JSON.stringify(source), original);
  geometry.dispose();
});

test('bottom-center origin is unchanged and +90° is an actual right-handed Z rotation', () => {
  const part = { position_mm: [10, -20, 3.6], rotation_z_deg: 90, layer: 1 };
  const matrix = partMatrix(part, 0, [0, 0, 0], 3.6);
  const origin = new THREE.Vector3(0, 0, 0).applyMatrix4(matrix);
  const right = new THREE.Vector3(1, 0, 0).applyMatrix4(matrix);
  assert.deepEqual(origin.toArray(), [10, -20, 3.6]);
  assert.ok(Math.abs(right.x - 10) < 1e-12);
  assert.ok(Math.abs(right.y + 19) < 1e-12);
  assert.ok(Math.abs(right.z - 3.6) < 1e-12);
});

test('instance compaction keeps raycast instance IDs mapped to the right unique part', () => {
  const geometry = prototypeGeometry({ vertices: [[0, 0, 0], [1, 0, 0], [0, 1, 0]], faces: [[0, 1, 2]] });
  const material = new THREE.MeshBasicMaterial();
  const mesh = new THREE.InstancedMesh(geometry, material, 3);
  const parts = [
    { id: 'later', layer: 1, step: 3, position_mm: [10, 0, 3.6], rotation_z_deg: 0 },
    { id: 'first', layer: 0, step: 1, position_mm: [0, 0, 0], rotation_z_deg: 0 },
    { id: 'second', layer: 0, step: 2, position_mm: [5, 0, 0], rotation_z_deg: 90 },
  ];
  const original = JSON.stringify(parts);
  const index = { layers: [0, 1], steps: [1, 2, 3] };
  const batch = { mesh, parts };
  assert.equal(updateBatch(batch, index, { layers: 1, steps: 2, explosion: 0 }, [0, 0, 0], 3.6), 2);
  assert.equal(mesh.count, 2);
  assert.deepEqual(mesh.userData.visibleParts.map((part) => part.id), ['first', 'second']);
  const matrix = new THREE.Matrix4();
  mesh.getMatrixAt(1, matrix);
  assert.equal(matrix.elements[12], 5);
  assert.equal(updateBatch(batch, index, { layers: 0, steps: 3, explosion: 1 }, [0, 0, 0], 3.6), 0);
  assert.equal(mesh.visible, false);
  assert.equal(mesh.count, 0);
  assert.equal(updateBatch(batch, index, { layers: 2, steps: 3, explosion: 1 }, [0, 0, 0], 3.6), 3);
  assert.deepEqual(mesh.userData.visibleParts.map((part) => part.id), ['later', 'first', 'second']);
  assert.equal(JSON.stringify(parts), original);
  mesh.dispose();
  geometry.dispose();
  material.dispose();
});

test('camera frames the actual projected bounds without clipping wide or tall models', () => {
  const bounds = new THREE.Box3(new THREE.Vector3(-110, -95, 0), new THREE.Vector3(110, 95, 182));
  for (const aspect of [0.65, 1.5, 2.2]) {
    for (const direction of [
      new THREE.Vector3(270, -430, 250).normalize(),
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, -0.0001, 1).normalize(),
    ]) {
      const camera = new THREE.PerspectiveCamera(32, aspect, 0.1, 6000);
      const center = bounds.getCenter(new THREE.Vector3());
      camera.up.set(0, 0, 1);
      camera.position.copy(center).addScaledVector(direction, cameraFitDistance(bounds, direction, 32, aspect));
      camera.lookAt(center);
      camera.updateMatrixWorld();
      for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
        const projected = new THREE.Vector3(x, y, z).project(camera);
        assert.ok(Math.abs(projected.x) <= 1 / 1.18 + 1e-8, 'Horizontal bounds must retain padding');
        assert.ok(Math.abs(projected.y) <= 1 / 1.18 + 1e-8, 'Vertical bounds must retain padding');
      }
    }
  }
});
