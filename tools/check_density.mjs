import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import {
  DENSITY_ID, validateDensityPointer, validateDensityCatalog, densityPath, densityGuideEntries,
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
  const verified = async (file) => {
    const bytes = await readFile(new URL(densityPath(file.path ?? file.url).slice(1), root));
    if (bytes.length !== file.bytes || createHash('sha256').update(bytes).digest('hex') !== file.sha256) throw new Error('Density data hash mismatch');
    return bytes;
  };
  const load = async (file) => {
    const bytes = await verified(file);
    return JSON.parse(bytes[0] === 0x1f && bytes[1] === 0x8b ? gunzipSync(bytes) : bytes);
  };
  const catalog = validateDensityCatalog(await load(pointer.catalog), pointer);
  for (const baseline of Object.values(catalog.baselines)) {
    if (baseline.state === 'READY') for (const file of Object.values(baseline.images)) await verified(file);
  }
  for (const reference of catalog.appearance_references ?? []) for (const file of reference.images) await verified(file);
  const cases = [];
  const checkedGeometry = new Set();
  for (const entry of densityGuideEntries(catalog)) {
    if (entry.state === 'INPUT_WAIT') continue;
    const data = await load(entry.manifest);
    const proof = data.root_validation ? await load(data.root_validation) : null;
    const manifest = validateGuideManifest(data, entry.id, proof);
    for (const file of Object.values(entry.images)) await verified(file);
    for (const file of manifest.geometry_files) {
      if (checkedGeometry.has(file.sha256)) continue;
      await verified(file);
      checkedGeometry.add(file.sha256);
    }
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
    cases.push({ id: entry.id, historical: (catalog.historical_cases ?? []).some((old) => old.id === entry.id),
      reference: entry.kind === 'BASELINE_REFERENCE_NOT_MULTIPLIER_CASE',
      actual: manifest.parts.length, target: entry.target_count,
      difference: entry.target_difference, ratio: entry.actual_ratio, steps: index.ordered.length,
      courses: index.courses.length, status: entry.state });
  }
  if (receipt.state === 'READY') {
    if (pointer.state !== 'READY' || receipt.study_id !== DENSITY_ID || cases.filter((item) => !item.historical && !item.reference).length !== 15
      || !receipt.verification.public_browser_passed || !receipt.verification.anonymous_downloads_passed) {
      throw new Error('READY receipt requires every actual case and completed public verification');
    }
  }
  console.log(JSON.stringify({ state: pointer.state, actual_cases: cases }, null, 2));
}
