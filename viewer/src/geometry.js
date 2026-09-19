import * as THREE from 'three';
import { displayPosition, isPartVisible } from './data.js';

export function prototypeGeometry(prototype) {
  const vertices = new Float32Array(prototype.vertices.length * 3);
  prototype.vertices.forEach((vertex, index) => vertices.set(vertex, index * 3));
  const IndexArray = prototype.vertices.length > 65535 ? Uint32Array : Uint16Array;
  const indices = new IndexArray(prototype.faces.length * 3);
  prototype.faces.forEach((face, index) => indices.set(face, index * 3));
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

export function partMatrix(part, explosion, center, layerMm, target = new THREE.Matrix4()) {
  const position = new THREE.Vector3(...displayPosition(part, explosion, center, layerMm));
  const rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(part.rotation_z_deg));
  return target.compose(position, rotation, new THREE.Vector3(1, 1, 1));
}

export function updateBatch(batch, index, progress, center, layerMm) {
  let count = 0;
  const matrix = new THREE.Matrix4();
  const visible = [];
  for (const part of batch.parts) {
    if (!isPartVisible(part, index, progress.layers, progress.steps)) continue;
    partMatrix(part, progress.explosion, center, layerMm, matrix);
    batch.mesh.setMatrixAt(count, matrix);
    visible.push(part);
    count += 1;
  }
  batch.mesh.count = count;
  batch.mesh.visible = count > 0;
  batch.mesh.instanceMatrix.needsUpdate = true;
  batch.mesh.userData.visibleParts = visible;
  if (count) {
    batch.mesh.computeBoundingBox();
    batch.mesh.computeBoundingSphere();
  }
  return count;
}

export function manifestBounds(manifest, geometryFor) {
  const result = new THREE.Box3();
  const matrix = new THREE.Matrix4();
  const bounds = new THREE.Box3();
  for (const part of manifest.parts) {
    partMatrix(part, 0, [0, 0, 0], 0, matrix);
    bounds.copy(geometryFor(part.type_id).boundingBox).applyMatrix4(matrix);
    result.union(bounds);
  }
  return result;
}

export function cameraFitDistance(bounds, direction, verticalFov, aspect, padding = 1.18) {
  const center = bounds.getCenter(new THREE.Vector3());
  const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 0, 1), direction).normalize();
  const up = new THREE.Vector3().crossVectors(direction, right).normalize();
  const tanVertical = Math.tan(THREE.MathUtils.degToRad(verticalFov) / 2);
  const tanHorizontal = tanVertical * aspect;
  let distance = 0;
  for (const x of [bounds.min.x, bounds.max.x]) {
    for (const y of [bounds.min.y, bounds.max.y]) {
      for (const z of [bounds.min.z, bounds.max.z]) {
        const point = new THREE.Vector3(x, y, z).sub(center);
        const towardCamera = point.dot(direction);
        distance = Math.max(distance,
          Math.abs(point.dot(right)) * padding / tanHorizontal + towardCamera,
          Math.abs(point.dot(up)) * padding / tanVertical + towardCamera);
      }
    }
  }
  return distance;
}
