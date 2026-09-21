import * as THREE from 'three';
import { BrickStudio } from './studio.js';
import { cameraFitDistance, prototypeGeometry } from './geometry.js';
import { radialPosition } from './density-state.js';
import { densityAssert as check } from '../../assets/density-data.js';

const directions = {
  perspective: new THREE.Vector3(270, -430, 250).normalize(),
  front: new THREE.Vector3(0, -1, 0), back: new THREE.Vector3(0, 1, 0),
  left: new THREE.Vector3(-1, 0, 0), right: new THREE.Vector3(1, 0, 0),
  top: new THREE.Vector3(0, -0.0001, 1).normalize(),
  underside: new THREE.Vector3(0, -0.0001, -1).normalize(),
};
const quarterTurns = [[1, 0], [0, 1], [-1, 0], [0, -1]];

export function densityMatrix(part, amount, target = new THREE.Matrix4()) {
  const [cos, sin] = quarterTurns[part.rotation_z_deg / 90];
  const [x, y, z] = radialPosition(part, amount);
  return target.set(cos, -sin, 0, x, sin, cos, 0, y, 0, 0, 1, z, 0, 0, 0, 1);
}

function prefixCount(parts, step) {
  let low = 0, high = parts.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (parts[middle].step <= step) low = middle + 1;
    else high = middle;
  }
  return low;
}

function geometryFromPrototype(prototype) {
  if (!(prototype.positions instanceof Float32Array)) return prototypeGeometry(prototype);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(prototype.positions, 3));
  geometry.setIndex(new THREE.BufferAttribute(prototype.indices, 1));
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  geometry.userData.geometrySha256 = prototype.geometry_sha256;
  geometry.userData.originalNative = !prototype.source_geometry_sha256;
  return geometry;
}

export class DensityStudio extends BrickStudio {
  constructor(host, callbacks) {
    super(host, callbacks);
    this.controls.maxDistance = 20000;
    this.renderer.shadowMap.enabled = false;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.grid.visible = false;
    this.floor.visible = false;
    this.previewHost = callbacks.previewHost;
    this.highlight.material = this.highlightMaterial;
    this.movingMaterial = new THREE.MeshStandardMaterial({ color: '#ffb454', roughness: 0.65 });
    this.moving = new THREE.Mesh(this.emptyGeometry, this.movingMaterial);
    this.moving.visible = false;
    this.scene.add(this.moving);
    this.motionPart = null;
    this.preview = null;
    this.aidMeshes = [];
    this.aidMaterial = new THREE.MeshStandardMaterial({ color: '#9aaac0', transparent: true, opacity: 0.6, roughness: 0.85 });
    this.nativeGeometries = new Map();
    this.controls.addEventListener('start', () => { this.manualCamera = true; });
    this.controls.addEventListener('change', () => {
      if (!this.manualCamera) return;
      clearTimeout(this.cameraCommitTimer);
      this.cameraCommitTimer = setTimeout(() => {
        this.manualCamera = false;
        this.onViewChange(null);
      }, 150);
    });
    this.controls.addEventListener('end', () => this.onViewChange(null));
  }

  geometryFor(id) {
    if (!this.geometries.has(id)) {
      const prototype = this.prototypes.types[id];
      check(prototype, `実部品型 ${id} の形状がありません。箱で代用しません。`);
      this.geometries.set(id, geometryFromPrototype(prototype));
    }
    return this.geometries.get(id);
  }

  nativeGeometryFor(id) {
    const prototype = this.nativePrototypes.types[id];
    check(prototype?.geometry_sha256 === this.manifest.types[id].geometry_sha256,
      `実部品型 ${id} の共有形状と配置の指紋が一致しません。`);
    if (!this.nativeGeometries.has(id)) this.nativeGeometries.set(id, geometryFromPrototype(prototype));
    return this.nativeGeometries.get(id);
  }

  load(manifest, prototypes, index, nativePrototypes = prototypes) {
    this.clear();
    for (const id of new Set([...manifest.parts, ...manifest.aids].map((part) => part.type_id))) {
      const shape = prototypes.types[id];
      check(shape && (shape.source_geometry_sha256 ?? shape.geometry_sha256) === manifest.types[id].geometry_sha256
        && nativePrototypes.types[id]?.geometry_sha256 === manifest.types[id].geometry_sha256,
        `実部品型 ${id} の共有形状と配置の指紋が一致しません。`);
    }
    if (this.prototypes !== prototypes) {
      this.geometries.forEach((geometry) => geometry.dispose());
      this.geometries.clear();
    }
    if (this.nativePrototypes !== nativePrototypes) {
      this.nativeGeometries.forEach((geometry) => geometry.dispose());
      this.nativeGeometries.clear();
    }
    this.manifest = manifest;
    this.prototypes = prototypes;
    this.nativePrototypes = nativePrototypes;
    this.index = index;
    this.progress = { explosion: -1, steps: 0, mode: 'assembled' };
    const materials = new Map();
    for (const group of index.groups.values()) {
      if (!materials.has(group.colorId)) {
        const material = new THREE.MeshStandardMaterial({
          color: manifest.palette[group.colorId].hex, roughness: 0.65, metalness: 0, flatShading: true,
        });
        materials.set(group.colorId, material);
        this.materials.push(material);
      }
      const mesh = new THREE.InstancedMesh(this.geometryFor(group.typeId), materials.get(group.colorId), group.parts.length);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.name = `${group.typeId}/${group.colorId}`;
      mesh.userData.visibleParts = group.parts;
      this.batches.push({ mesh, parts: group.parts, colorId: group.colorId });
      this.model.add(mesh);
    }
    for (const aid of manifest.aids) {
      const mesh = new THREE.Mesh(this.geometryFor(aid.type_id), this.aidMaterial);
      mesh.matrixAutoUpdate = false;
      densityMatrix({ ...aid, radial_offset_mm: [0, 0, 0] }, 0, mesh.matrix);
      mesh.matrixWorldNeedsUpdate = true;
      this.aidMeshes.push({ mesh, aid });
      this.model.add(mesh);
    }
    this.baseBounds = this.boundsAt(0);
    this.fitBounds = this.baseBounds.clone();
    this.center = this.baseBounds.getCenter(new THREE.Vector3()).toArray();
    this.setProgress({ explosion: 0, steps: manifest.parts.length, mode: 'assembled' });
    this.setView('perspective');
    this.host.dataset.modelReady = 'true';
    this.host.dataset.candidate = manifest.candidate_id;
    this.host.dataset.batches = String(this.batches.length);
    this.host.dataset.prototypeGeometries = String(this.geometries.size);
    this.host.dataset.geometryMode = prototypes.mode;
  }

  boundsAt(explosion) {
    const result = new THREE.Box3(), bounds = new THREE.Box3(), matrix = new THREE.Matrix4();
    for (const part of this.manifest.parts) {
      densityMatrix(part, explosion, matrix);
      bounds.copy(this.geometryFor(part.type_id).boundingBox).applyMatrix4(matrix);
      result.union(bounds);
    }
    return result;
  }

  setProgress(progress) {
    if (!this.manifest) return 0;
    const changedExplosion = progress.explosion !== this.progress.explosion;
    const previousRadius = this.fitBounds.getSize(new THREE.Vector3()).length();
    this.progress = { ...progress };
    const threshold = progress.mode === 'assembly' ? progress.steps : this.manifest.parts.length;
    let visible = 0;
    const matrix = new THREE.Matrix4();
    for (const batch of this.batches) {
      if (changedExplosion) {
        for (let index = 0; index < batch.parts.length; index++) {
          batch.mesh.setMatrixAt(index, densityMatrix(batch.parts[index], progress.explosion, matrix));
        }
        batch.mesh.instanceMatrix.needsUpdate = true;
        batch.mesh.count = batch.parts.length;
        batch.mesh.computeBoundingBox();
        batch.mesh.computeBoundingSphere();
      }
      const count = prefixCount(batch.parts, threshold);
      batch.mesh.count = count;
      batch.mesh.visible = count > 0;
      batch.mesh.material.color.set(this.manifest.palette[batch.colorId].hex);
      if (progress.mode === 'assembly') batch.mesh.material.color.lerp(new THREE.Color('#eef2f7'), 0.62);
      visible += count;
    }
    for (const { mesh, aid } of this.aidMeshes) mesh.visible = aid.show_during_preparation === true || progress.mode !== 'assembly'
      || (threshold > 0 && threshold + 1 >= aid.required_before_step);
    if (changedExplosion) {
      this.fitBounds.copy(progress.explosion === 0 ? this.baseBounds : this.boundsAt(progress.explosion));
      const nextRadius = this.fitBounds.getSize(new THREE.Vector3()).length();
      if (previousRadius > 0 && nextRadius > 0) {
        const offset = this.camera.position.clone().sub(this.controls.target).multiplyScalar(nextRadius / previousRadius);
        this.controls.target.copy(this.fitBounds.getCenter(new THREE.Vector3()));
        this.camera.position.copy(this.controls.target).add(offset);
        this.controls.update();
      }
      this.updateLighting();
    }
    this.updateHighlight();
    this.moving.visible = false;
    this.host.dataset.visibleParts = String(visible);
    this.host.dataset.explosion = String(progress.explosion);
    this.host.dataset.assemblyCount = String(threshold);
    this.requestRender();
    return visible;
  }

  showMovingPart(part, fraction) {
    this.motionPart = part;
    this.moving.visible = Boolean(part && this.progress.mode === 'assembly');
    if (!this.moving.visible) { this.requestRender(); return; }
    this.moving.geometry = this.geometryFor(part.type_id);
    this.movingMaterial.color.set(this.manifest.palette[part.color_id].hex);
    this.moving.matrixAutoUpdate = false;
    densityMatrix(part, this.progress.explosion, this.moving.matrix);
    const travel = Math.max(16, this.manifest.types[part.type_id].body_height_mm * 2);
    this.moving.matrix.elements[14] += travel * (1 - fraction);
    this.moving.matrixWorldNeedsUpdate = true;
    this.host.dataset.movingPart = part.id;
    this.requestRender();
  }

  updateHighlight() {
    const part = this.selected;
    this.highlight.visible = Boolean(part && this.manifest
      && (this.progress.mode !== 'assembly' || part.step <= this.progress.steps));
    if (!this.highlight.visible) return;
    this.highlight.geometry = this.geometryFor(part.type_id);
    this.highlight.matrixAutoUpdate = false;
    densityMatrix(part, this.progress.explosion, this.highlight.matrix);
    this.highlight.matrixWorldNeedsUpdate = true;
  }

  setView(view) {
    if (!this.manifest) return;
    check(Object.hasOwn(directions, view), '未対応の3D視点です。');
    const direction = directions[view], center = this.fitBounds.getCenter(new THREE.Vector3());
    const distance = cameraFitDistance(this.fitBounds, direction, this.camera.fov, this.camera.aspect);
    this.controls.target.copy(center);
    this.camera.position.copy(center).addScaledVector(direction, distance);
    this.camera.near = Math.max(0.05, distance / 20000);
    this.camera.far = Math.max(20000, distance * 10);
    this.camera.updateProjectionMatrix();
    this.controls.update();
    this.currentView = view;
    this.onViewChange(view);
    this.requestRender();
  }

  diagnostics() {
    if (!this.manifest) return { ready: false };
    const expected = new THREE.Matrix4();
    let checked = 0, mismatches = 0, visible = 0;
    for (const batch of this.batches) {
      visible += batch.mesh.count;
      for (let instance = 0; instance < batch.parts.length; instance++) {
        densityMatrix(batch.parts[instance], this.progress.explosion, expected);
        for (let element = 0; element < 16; element++) {
          if (batch.mesh.instanceMatrix.array[instance * 16 + element] !== Math.fround(expected.elements[element])) mismatches++;
        }
        checked++;
      }
    }
    return { ready: true, candidate: this.manifest.candidate_id, actual_instances: checked,
      matrix_elements_mismatched: mismatches, visible_instances: visible, explosion: this.progress.explosion,
      draw_calls: this.renderer.info.render.calls, triangles: this.renderer.info.render.triangles,
      shared_geometries: this.geometries.size, instance_batches: this.batches.length, actual_aids: this.aidMeshes.length,
      display_mode: this.prototypes.mode, selected_part_native_geometry: true,
      camera: [...this.camera.position.toArray(), ...this.controls.target.toArray()] };
  }

  clear() {
    clearTimeout(this.cameraCommitTimer);
    this.manualCamera = false;
    this.aidMeshes?.forEach(({ mesh }) => this.model.remove(mesh));
    this.aidMeshes = [];
    super.clear();
    if (this.moving) this.moving.visible = false;
    this.motionPart = null;
    for (const key of ['candidate', 'batches', 'prototypeGeometries', 'geometryMode', 'assemblyCount', 'explosion', 'movingPart']) {
      delete this.host.dataset[key];
    }
  }

  dispose() {
    this.nativeGeometries.forEach((geometry) => geometry.dispose());
    this.nativeGeometries.clear();
    this.movingMaterial.dispose();
    this.aidMaterial.dispose();
    super.dispose();
  }
}
