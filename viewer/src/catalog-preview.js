import * as THREE from 'three';
import { DensityStudio } from './density-studio.js';
import { guideIndex } from './density-state.js';
import { verifiedJSON } from './density-assets.js';
import { loadDensityModel } from './density-load.js';

export function rotatePreviewPosition(position, target, angle) {
  const offset = position.clone().sub(target);
  offset.applyAxisAngle(new THREE.Vector3(0, 0, 1), angle);
  return target.clone().add(offset);
}

class RotationStudio extends DensityStudio {
  pick() { this.pointerStart = null; }

  keyboardView(event) {
    if (event.key !== 'Escape') super.keyboardView(event);
  }

  turn(angle) {
    this.camera.position.copy(rotatePreviewPosition(this.camera.position, this.controls.target, angle));
    this.currentView = null;
    this.controls.update();
    this.requestRender();
  }
}

export async function loadCataloguePreview(host, entry, displayFile, { signal, onError }) {
  const displayCatalog = displayFile ? await verifiedJSON(displayFile, signal) : null;
  const model = await loadDensityModel(entry, displayCatalog, { signal });
  signal.throwIfAborted();
  let closed = false, studio = null;
  const dispose = () => {
    closed = true;
    if (!studio) return;
    const renderer = studio.renderer;
    studio.dispose();
    renderer.forceContextLoss();
    studio = null;
  };
  try {
    studio = new RotationStudio(host, {
      onSelect: () => {}, onViewChange: () => {},
      onError: message => { if (!closed) onError(new Error(message)); },
    });
    const canvas = studio.renderer.domElement;
    canvas.setAttribute('aria-label', '選択モデルの360度表示。ドラッグやスワイプ、左右キーで回転。＋と−で拡大縮小。Escapeで閉じます。');
    studio.load(model.manifest, model.libraries, guideIndex(model.manifest), model.nativeLibraries);
    return {
      mode: model.libraries.mode,
      turn: angle => studio.turn(angle),
      view: direction => studio.setView(direction),
      zoom: direction => studio.keyboardView({ key: direction > 0 ? '+' : '-', preventDefault() {} }),
      focus: () => canvas.focus({ preventScroll: true }),
      diagnostics: () => studio ? { ...studio.diagnostics(),
        touch_rotation_enabled: studio.controls.enableRotate && studio.controls.touches.ONE === THREE.TOUCH.ROTATE,
        unrestricted_azimuth: studio.controls.minAzimuthAngle === -Infinity && studio.controls.maxAzimuthAngle === Infinity,
      } : { ready: false },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
