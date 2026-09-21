import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import {
  DENSITY_ID, validateDensityPointer, validateDensityCatalog, densityPath,
} from '../assets/density-data.js';
import { validateGuideManifest, guideIndex, radialPosition } from '../viewer/src/density-state.js';

const root = new URL('../', import.meta.url);
const pointer = validateDensityPointer(JSON.parse(await readFile(new URL('archive/density-study.json', root))));
const receipt = JSON.parse(await readFile(new URL('archive/block-budget-matrix.json', root)));
if (pointer.state === 'INPUT_WAIT') {
  if (receipt.state !== 'INPUT_WAIT' || receipt.cases.length !== 0
    || receipt.verification.public_browser_passed || receipt.verification.anonymous_downloads_passed) {
    throw new Error('An unready matrix must not contain fabricated cases or a successful public receipt');
  }
  console.log('Matrix INPUT_WAIT: no actual cases or public-verification success is implied.');
} else {
  const load = async (file) => {
    const bytes = await readFile(new URL(densityPath(file.path ?? file.url).slice(1), root));
    if (bytes.length !== file.bytes || createHash('sha256').update(bytes).digest('hex') !== file.sha256) throw new Error('Density data hash mismatch');
    return JSON.parse(bytes[0] === 0x1f && bytes[1] === 0x8b ? gunzipSync(bytes) : bytes);
  };
  const catalog = validateDensityCatalog(await load(pointer.catalog), pointer);
  const cases = [];
  for (const entry of catalog.cases) {
    if (entry.state === 'INPUT_WAIT') continue;
    const manifest = validateGuideManifest(await load(entry.manifest), entry.id);
    if (manifest.metrics.part_count !== entry.metrics.part_count || manifest.metrics.unique_types !== entry.metrics.unique_types) {
      throw new Error('Actual catalog and guide counts differ');
    }
    const index = guideIndex(manifest);
    const ids = new Set(index.ordered.map((part) => part.id));
    if (ids.size !== entry.metrics.part_count || index.ordered.at(-1).step !== ids.size) throw new Error('Assembly coverage mismatch');
    for (const part of manifest.parts) {
      radialPosition(part, 1); radialPosition(part, 0.3);
      const zero = radialPosition(part, 0);
      if (zero.some((n, axis) => !Object.is(n, part.position_mm[axis]))) throw new Error('Radial pose does not return exactly');
    }
    cases.push({ id: entry.id, actual: manifest.parts.length, target: entry.target_count,
      difference: entry.target_difference, ratio: entry.actual_ratio, steps: index.ordered.length,
      courses: index.courses.length, status: entry.state });
  }
  if (receipt.state === 'READY') {
    if (pointer.state !== 'READY' || receipt.study_id !== DENSITY_ID || cases.length !== 15
      || !receipt.verification.public_browser_passed || !receipt.verification.anonymous_downloads_passed) {
      throw new Error('READY receipt requires every actual case and completed public verification');
    }
  }
  console.log(JSON.stringify({ state: pointer.state, actual_cases: cases }, null, 2));
}
