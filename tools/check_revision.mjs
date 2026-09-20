import { readFile, stat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import {
  validateCommonCatalog, validateCommonManifest, validateCommonPrototypes, validateCommonMatch,
} from '../assets/common-blocks.js';

const workspace = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const options = new Map();
for (let index = 2; index < process.argv.length; index += 2) options.set(process.argv[index], process.argv[index + 1]);
const root = await realpath(options.get('--root') ?? workspace);
const revision = options.get('--revision');
if (!/^r3-[a-zA-Z0-9._-]+$/.test(revision ?? '')) throw new Error('A common-block revision must be explicit.');
if (root !== workspace && !root.startsWith(path.join(workspace, '.archive-work') + path.sep)) {
  throw new Error('Check only the public workspace or its owned staging, not a private source.');
}
const prefix = `/artifacts/revisions/${revision}/`;
const locate = async (relative) => {
  if (!relative.startsWith(prefix)) throw new Error(`Cross-revision file: ${relative}`);
  const target = await realpath(path.resolve(root, relative.slice(1)));
  if (!target.startsWith(path.join(root, 'artifacts/revisions', revision) + path.sep)) throw new Error('Escaping staged path.');
  if (!(await stat(target)).isFile()) throw new Error(`Missing actual file: ${relative}`);
  return target;
};
const read = async (relative) => JSON.parse(await readFile(await locate(relative), 'utf8'));
const catalog = validateCommonCatalog(await read(prefix + 'catalog.json'));
const prototypes = validateCommonPrototypes(await read(catalog.prototypes_url));
const candidates = [];
const actualTypes = new Set();
const artwork = new Set();
for (const candidate of catalog.candidates) {
  const manifest = validateCommonManifest(await read(candidate.manifest_url), candidate.id);
  validateCommonMatch(manifest, prototypes);
  for (const key of ['part_count', 'unique_types', 'color_count', 'layer_count', 'height_mm', 'width_mm', 'depth_mm']) {
    if (manifest.metrics[key] !== candidate.metrics[key]) throw new Error(`Catalog/manifest metric mismatch: ${candidate.id}: ${key}`);
  }
  for (const type of new Set(manifest.parts.map((part) => part.type_id))) actualTypes.add(type);
  for (const field of ['manifest_url', 'bom_url', 'native_assembly_url', 'assembly_guide_url', 'render_url', 'exploded_url', 'blend_url', 'video_url']) {
    await locate(candidate[field]);
  }
  for (const field of ['render_url', 'exploded_url', 'blend_url', 'video_url']) {
    if (artwork.has(candidate[field])) throw new Error(`Different candidates or media roles cannot share a substituted file: ${candidate[field]}`);
    artwork.add(candidate[field]);
  }
  const projected = { types: manifest.types, palette: manifest.palette, parts: manifest.parts, frame: manifest.frame };
  candidates.push({ id: candidate.id, ...manifest.metrics,
    small_part_exceptions: manifest.parts.filter((part) => part.small_part_exception).length,
    native_assembly: candidate.native_assembly_url,
    geometry_projection_sha256: createHash('sha256').update(JSON.stringify(projected)).digest('hex') });
}
if (actualTypes.size !== Object.keys(prototypes.types).length) {
  throw new Error('Shared native types differ from the union of types actually used by the three models.');
}
process.stdout.write(JSON.stringify({
  revision, schema_version: 3, status: 'DIGITAL_DATA_CONTRACT_PASS_NOT_PHYSICAL_APPROVAL',
  candidates, total_instances: candidates.reduce((total, item) => total + item.part_count, 0),
  shared_types: actualTypes.size,
}, null, 2) + '\n');
