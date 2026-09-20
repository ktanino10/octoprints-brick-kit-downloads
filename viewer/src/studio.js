import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { isPartVisible, validateGeometryMatch } from './data.js';
import { cameraFitDistance, manifestBounds, partMatrix, prototypeGeometry, updateBatch } from './geometry.js';

const VIEW_DIRECTIONS = {
  perspective: new THREE.Vector3(270, -430, 250).normalize(),
  front: new THREE.Vector3(0, -1, 0),
  side: new THREE.Vector3(1, 0, 0),
  top: new THREE.Vector3(0, -0.0001, 1).normalize(),
};

export class BrickStudio {
  constructor(host, { onSelect, onError, onViewChange }) {
    this.host = host;
    this.onSelect = onSelect;
    this.onError = onError;
    this.onViewChange = onViewChange;
    this.geometries = new Map();
    this.batches = [];
    this.materials = [];
    this.selected = null;
    this.frame = null;
    this.disposed = false;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#f5f6f8');
    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 10000);
    this.camera.up.set(0, 0, 1);
    this.camera.position.set(270, -430, 280);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    const canvas = this.renderer.domElement;
    canvas.tabIndex = 0;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'ブリックの3Dモデル。ドラッグで回転、右ドラッグで移動、スクロールで拡大。矢印キーで回転、Shiftと矢印キーで移動、＋と−で拡大縮小。部品は下の一覧からも選択できます。');
    this.host.replaceChildren(canvas);
    this.controls = new OrbitControls(this.camera, canvas);
    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.controls.enableDamping = !this.motionQuery.matches;
    this.controls.dampingFactor = 0.11;
    this.controls.screenSpacePanning = true;
    this.controls.rotateSpeed = 0.7;
    this.controls.zoomSpeed = 0.85;
    this.controls.maxPolarAngle = Math.PI * 0.98;
    this.controls.target.set(0, 0, 90);
    this.controls.minDistance = 8;
    this.controls.maxDistance = 2500;
    this.controls.addEventListener('change', () => this.requestRender());
    this.controls.addEventListener('start', () => {
      this.currentView = null;
      this.onViewChange(null);
    });
    this.motionChanged = () => { this.controls.enableDamping = !this.motionQuery.matches; };
    this.motionQuery.addEventListener('change', this.motionChanged);
    this.buildEnvironment();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.pointerStart = null;
    canvas.addEventListener('pointerdown', (event) => {
      this.pointerStart = { x: event.clientX, y: event.clientY, button: event.button };
    });
    canvas.addEventListener('pointerup', (event) => this.pick(event));
    canvas.addEventListener('keydown', (event) => this.keyboardView(event));
    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      this.onError('3D描画が中断されました。再読み込みで復旧できます。部品一覧・構成表は引き続き確認できます。');
    });
    this.resizeObserver = new ResizeObserver(() => {
      const { width, height } = host.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      this.renderer.setSize(width, height, false);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      if (this.manifest && this.currentView) this.setView(this.currentView);
      this.requestRender();
    });
    this.resizeObserver.observe(host);
    this.requestRender();
  }

  buildEnvironment() {
    const hemisphere = new THREE.HemisphereLight('#ffffff', '#c4c9d3', 2.5);
    hemisphere.position.set(0, 0, 1);
    this.scene.add(hemisphere);
    this.keyLight = new THREE.DirectionalLight('#fff9f1', 3.2);
    this.keyLight.position.set(-150, -230, 390);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.set(2048, 2048);
    this.keyLight.shadow.normalBias = 0.16;
    this.keyLight.shadow.bias = -0.00008;
    this.keyLight.shadow.camera.near = 1;
    this.keyLight.shadow.camera.far = 2000;
    this.scene.add(this.keyLight, this.keyLight.target);
    const fill = new THREE.DirectionalLight('#e9f1ff', 1.9);
    fill.position.set(160, 90, 230);
    this.scene.add(fill);
    const front = new THREE.DirectionalLight('#ffffff', 0.7);
    front.position.set(120, -300, 80);
    this.scene.add(front);
    this.floor = new THREE.Mesh(
      new THREE.PlaneGeometry(6000, 6000),
      new THREE.MeshStandardMaterial({ color: '#f5f6f8', roughness: 1, metalness: 0 }),
    );
    this.floor.position.z = -0.2;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);
    const grid = new THREE.GridHelper(360, 36, '#cdd3de', '#dce1e9');
    grid.rotation.x = Math.PI / 2;
    grid.position.z = -0.15;
    grid.material.transparent = true;
    grid.material.opacity = 0.38;
    grid.material.depthWrite = false;
    this.grid = grid;
    this.scene.add(grid);
    this.model = new THREE.Group();
    this.scene.add(this.model);
    this.highlightMaterial = new THREE.MeshBasicMaterial({
      color: '#f18c32', transparent: true, opacity: 0.5,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
      depthWrite: false,
    });
    this.emptyGeometry = new THREE.BufferGeometry();
    this.highlight = new THREE.Mesh(this.emptyGeometry, this.highlightMaterial);
    this.highlight.visible = false;
    this.scene.add(this.highlight);
  }

  geometryFor(typeId) {
    if (!this.geometries.has(typeId)) {
      this.geometries.set(typeId, prototypeGeometry(this.prototypes.types[typeId]));
    }
    return this.geometries.get(typeId);
  }

  load(manifest, prototypes, index) {
    validateGeometryMatch(manifest, prototypes);
    this.clear();
    if (this.prototypes !== prototypes) {
      this.geometries.forEach((geometry) => geometry.dispose());
      this.geometries.clear();
    }
    this.manifest = manifest;
    this.prototypes = prototypes;
    this.index = index;
    this.progress = { layers: index.layers.length, steps: index.steps.length, explosion: 0 };
    const colorMaterials = new Map();
    for (const group of index.groups.values()) {
      if (!colorMaterials.has(group.colorId)) {
        const material = new THREE.MeshStandardMaterial({
          color: manifest.palette[group.colorId].hex, roughness: 0.36,
          metalness: 0.015, flatShading: true,
        });
        colorMaterials.set(group.colorId, material);
        this.materials.push(material);
      }
      const mesh = new THREE.InstancedMesh(this.geometryFor(group.typeId), colorMaterials.get(group.colorId), group.parts.length);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.name = `${group.typeId}/${group.colorId}`;
      this.batches.push({ mesh, parts: group.parts });
      this.model.add(mesh);
    }
    this.baseBounds = manifestBounds(manifest, (id) => this.geometryFor(id));
    this.center = this.baseBounds.getCenter(new THREE.Vector3()).toArray();
    this.layerMm = manifest.schema_version === 3 ? null : manifest.types[manifest.parts[0].type_id].layer_mm;
    const explosionHeights = manifest.parts.map((part) => this.layerMm === null ? part.position_mm[2] : part.layer * this.layerMm);
    this.explosionHeights = { min: Math.min(...explosionHeights), max: Math.max(...explosionHeights) };
    this.floor.position.z = this.baseBounds.min.z - 0.2;
    this.grid.position.set(this.center[0], this.center[1], this.baseBounds.min.z - 0.15);
    this.fitBounds = this.baseBounds.clone();
    this.setProgress(this.progress);
    this.setView('perspective');
    this.host.dataset.modelReady = 'true';
    this.host.dataset.candidate = manifest.candidate_id;
    this.host.dataset.batches = String(this.batches.length);
    this.host.dataset.prototypeGeometries = String(this.geometries.size);
  }

  setProgress(progress) {
    if (!this.manifest) return 0;
    const previousExplosion = this.progress.explosion;
    this.progress = { ...progress };
    let visible = 0;
    for (const batch of this.batches) visible += updateBatch(batch, this.index, progress, this.center, this.layerMm);
    if (progress.explosion !== previousExplosion) {
      const previousSize = this.fitBounds.getSize(new THREE.Vector3()).length();
      this.fitBounds.copy(this.baseBounds);
      for (const axis of ['x', 'y']) {
        const center = axis === 'x' ? this.center[0] : this.center[1];
        this.fitBounds.min[axis] = center + (this.baseBounds.min[axis] - center) * (1 + progress.explosion * 0.36);
        this.fitBounds.max[axis] = center + (this.baseBounds.max[axis] - center) * (1 + progress.explosion * 0.36);
      }
      this.fitBounds.min.z += this.explosionHeights.min * progress.explosion * 1.75;
      this.fitBounds.max.z += this.explosionHeights.max * progress.explosion * 1.75;
      const ratio = this.fitBounds.getSize(new THREE.Vector3()).length() / previousSize;
      const offset = this.camera.position.clone().sub(this.controls.target).multiplyScalar(ratio);
      this.controls.target.copy(this.fitBounds.getCenter(new THREE.Vector3()));
      this.camera.position.copy(this.controls.target).add(offset);
      this.controls.update();
    }
    this.updateLighting();
    this.updateHighlight();
    this.host.dataset.visibleParts = String(visible);
    this.host.dataset.explosion = String(progress.explosion);
    this.renderer.shadowMap.needsUpdate = true;
    this.requestRender();
    return visible;
  }

  updateLighting() {
    const center = this.fitBounds.getCenter(new THREE.Vector3());
    const radius = this.fitBounds.getSize(new THREE.Vector3()).length() / 2;
    this.keyLight.target.position.copy(center);
    this.keyLight.position.copy(center).add(new THREE.Vector3(-radius * 2, -radius * 3, radius * 4));
    const camera = this.keyLight.shadow.camera;
    camera.left = -radius * 1.5;
    camera.right = radius * 1.5;
    camera.top = radius * 1.6;
    camera.bottom = -radius * 1.6;
    camera.far = radius * 10 + 100;
    camera.updateProjectionMatrix();
  }

  setView(view) {
    if (!this.manifest) return;
    const bounds = this.fitBounds;
    const center = bounds.getCenter(new THREE.Vector3());
    const distance = cameraFitDistance(bounds, VIEW_DIRECTIONS[view], this.camera.fov, this.camera.aspect);
    this.camera.up.set(0, 0, 1);
    this.controls.target.copy(center);
    this.camera.position.copy(center).addScaledVector(VIEW_DIRECTIONS[view], distance);
    this.camera.near = Math.max(0.05, distance / 10000);
    this.camera.far = Math.max(6000, distance * 8);
    this.camera.updateProjectionMatrix();
    this.controls.update();
    this.currentView = view;
    this.onViewChange(view);
    this.requestRender();
  }

  select(part) {
    this.selected = part;
    this.updateHighlight();
    this.requestRender();
  }

  updateHighlight() {
    const part = this.selected;
    this.highlight.visible = Boolean(part && this.manifest
      && isPartVisible(part, this.index, this.progress.layers, this.progress.steps));
    if (!this.highlight.visible) return;
    this.highlight.geometry = this.geometryFor(part.type_id);
    this.highlight.matrixAutoUpdate = false;
    partMatrix(part, this.progress.explosion, this.center, this.layerMm, this.highlight.matrix);
    this.highlight.matrixWorldNeedsUpdate = true;
  }

  focusPart() {
    if (!this.highlight.visible) return;
    const geometry = this.highlight.geometry;
    const bounds = geometry.boundingBox.clone().applyMatrix4(this.highlight.matrix);
    const center = bounds.getCenter(new THREE.Vector3());
    const distance = Math.max(bounds.getSize(new THREE.Vector3()).length() * 4, 40);
    const direction = this.camera.position.clone().sub(this.controls.target).normalize();
    this.controls.target.copy(center);
    this.camera.position.copy(center).addScaledVector(direction, distance);
    this.currentView = null;
    this.onViewChange(null);
    this.controls.update();
    this.requestRender();
  }

  pick(event) {
    const start = this.pointerStart;
    this.pointerStart = null;
    if (!start || start.button !== 0 || !this.manifest
      || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 5) return;
    const box = this.host.getBoundingClientRect();
    this.pointer.set((event.clientX - box.left) / box.width * 2 - 1, -(event.clientY - box.top) / box.height * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.batches.filter((batch) => batch.mesh.visible).map((batch) => batch.mesh), false);
    if (hits.length) {
      const hit = hits[0];
      const part = hit.object.userData.visibleParts[hit.instanceId];
      if (part) this.onSelect(part.id);
    }
  }

  keyboardView(event) {
    if (!this.manifest) return;
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', 'Escape', 'Home'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Escape') { this.onSelect(null); return; }
    if (event.key === 'Home') { this.setView('perspective'); return; }
    const offset = this.camera.position.clone().sub(this.controls.target);
    if (event.key === '+' || event.key === '=' || event.key === '-') {
      const scale = event.key === '-' ? 1.12 : 0.88;
      const length = THREE.MathUtils.clamp(offset.length() * scale, this.controls.minDistance, this.controls.maxDistance);
      offset.setLength(length);
      this.camera.position.copy(this.controls.target).add(offset);
    } else if (event.shiftKey) {
      const delta = offset.length() * 0.025;
      const right = new THREE.Vector3().setFromMatrixColumn(this.camera.matrix, 0);
      const up = new THREE.Vector3().setFromMatrixColumn(this.camera.matrix, 1);
      const move = event.key === 'ArrowLeft' ? right.multiplyScalar(-delta)
        : event.key === 'ArrowRight' ? right.multiplyScalar(delta)
          : event.key === 'ArrowUp' ? up.multiplyScalar(delta) : up.multiplyScalar(-delta);
      this.controls.target.add(move);
      this.camera.position.add(move);
    } else {
      const zToY = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1, 0));
      const spherical = new THREE.Spherical().setFromVector3(offset.applyQuaternion(zToY));
      if (event.key === 'ArrowLeft') spherical.theta -= 0.1;
      if (event.key === 'ArrowRight') spherical.theta += 0.1;
      if (event.key === 'ArrowUp') spherical.phi -= 0.1;
      if (event.key === 'ArrowDown') spherical.phi += 0.1;
      spherical.phi = THREE.MathUtils.clamp(spherical.phi, 0.01, Math.PI * 0.98);
      offset.setFromSpherical(spherical).applyQuaternion(zToY.invert());
      this.camera.position.copy(this.controls.target).add(offset);
    }
    this.currentView = null;
    this.onViewChange(null);
    this.controls.update();
    this.requestRender();
  }

  requestRender() {
    if (this.disposed || this.frame !== null) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = null;
      if (this.disposed) return;
      const changed = this.controls.update();
      try {
        this.renderer.render(this.scene, this.camera);
      } catch {
        this.onError('3D描画に失敗しました。再読み込みするか、WebGL対応のブラウザーで開いてください。');
        return;
      }
      if (changed && this.controls.enableDamping) this.requestRender();
    });
  }

  clear() {
    this.batches.forEach(({ mesh }) => { this.model.remove(mesh); mesh.dispose(); });
    this.materials.forEach((material) => material.dispose());
    this.batches = [];
    this.materials = [];
    this.selected = null;
    this.manifest = null;
    this.highlight.visible = false;
    this.host.dataset.modelReady = 'false';
    this.host.dataset.visibleParts = '0';
    this.requestRender();
  }

  dispose() {
    this.clear();
    this.disposed = true;
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.resizeObserver.disconnect();
    this.motionQuery.removeEventListener('change', this.motionChanged);
    this.controls.dispose();
    this.geometries.forEach((geometry) => geometry.dispose());
    this.highlightMaterial.dispose();
    this.emptyGeometry.dispose();
    this.floor.geometry.dispose();
    this.floor.material.dispose();
    this.grid.geometry.dispose();
    this.grid.material.dispose();
    this.keyLight.shadow.dispose();
    this.renderer.dispose();
    this.host.replaceChildren();
  }
}
