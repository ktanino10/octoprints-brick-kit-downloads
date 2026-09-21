import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { cameraFitDistance } from './geometry.js';

export class DensityPartPreview {
  constructor(host) {
    this.host = host;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#eaf0f7');
    this.camera = new THREE.PerspectiveCamera(36, 1, 0.01, 10000);
    this.camera.up.set(0, 0, 1);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.material = new THREE.MeshStandardMaterial({ roughness: 0.65, flatShading: true });
    this.empty = new THREE.BufferGeometry();
    this.mesh = new THREE.Mesh(this.empty, this.material);
    this.mesh.visible = false;
    this.scene.add(this.mesh, new THREE.HemisphereLight('#ffffff', '#a4b4c7', 3));
    const key = new THREE.DirectionalLight('#ffffff', 3);
    key.position.set(-2, -3, 4);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight('#dbe8ff', 2);
    fill.position.set(2, 3, -1);
    this.scene.add(fill);
    const canvas = this.renderer.domElement;
    canvas.tabIndex = 0;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', '選択部品の実形状。ドラッグで回転、スクロールで拡大します。裏面ボタンで開いた下面を確認できます。');
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = false;
    this.controls.addEventListener('change', () => this.render());
    canvas.addEventListener('keydown', (event) => {
      if (event.key === 'Home') { event.preventDefault(); this.view('front'); }
      if (event.key === '+' || event.key === '-' || event.key === '=') {
        event.preventDefault();
        const offset = this.camera.position.clone().sub(this.controls.target).multiplyScalar(event.key === '-' ? 1.15 : 0.85);
        this.camera.position.copy(this.controls.target).add(offset); this.controls.update();
      }
    });
    host.replaceChildren(canvas);
    this.resizeObserver = new ResizeObserver(() => {
      const box = host.getBoundingClientRect();
      if (box.width <= 0 || box.height <= 0) return;
      this.renderer.setSize(box.width, box.height, false);
      this.camera.aspect = box.width / box.height;
      this.camera.updateProjectionMatrix();
      if (this.mesh.visible) this.view(this.currentView ?? 'front');
      this.render();
    });
    this.resizeObserver.observe(host);
  }
  show(geometry, color) {
    this.mesh.geometry = geometry;
    this.material.color.set(color);
    this.mesh.visible = true;
    this.view('front');
  }
  clear() { this.mesh.visible = false; this.mesh.geometry = this.empty; this.render(); }
  view(name) {
    if (!this.mesh.visible) return;
    const direction = name === 'underside' ? new THREE.Vector3(0.4, -0.6, -1).normalize()
      : new THREE.Vector3(0.6, -1, 0.7).normalize();
    const bounds = this.mesh.geometry.boundingBox;
    const center = bounds.getCenter(new THREE.Vector3());
    const distance = cameraFitDistance(bounds, direction, this.camera.fov, this.camera.aspect, 1.3);
    this.controls.target.copy(center);
    this.camera.position.copy(center).addScaledVector(direction, distance);
    this.controls.minDistance = Math.max(1, distance / 10);
    this.controls.maxDistance = distance * 10;
    this.controls.update();
    this.currentView = name;
    this.render();
  }
  render() { this.renderer.render(this.scene, this.camera); }
  dispose() {
    this.resizeObserver.disconnect(); this.controls.dispose(); this.material.dispose(); this.empty.dispose();
    this.renderer.dispose(); this.host.replaceChildren();
  }
}
