import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { validateCatalog, validateManifest, validatePrototypes, validateGeometryMatch, makeIndex, downloadEntries } from '../src/data.js';
import { contextFromCatalog, validateManifestChoice } from '../src/revisions.js';
import { publicURL } from '../src/paths.js';

const root = new URL('../../', import.meta.url);
const read = async (path) => JSON.parse(await readFile(new URL(path.replace(/^\//, ''), root), 'utf8'));

test('public paths work below a project base and reject escaping it', () => {
  assert.equal(publicURL('/artifacts/phase1/catalog.json'), new URL('artifacts/phase1/catalog.json', root).href);
  assert.equal(publicURL('archive/status.json'), new URL('archive/status.json', root).href);
  assert.throws(() => publicURL('../outside.json'));
  assert.throws(() => publicURL('https://example.com/private.json'));
});

test('all twelve real candidates retain native geometry, unique IDs and exact BOM totals', async () => {
  const expected = {
    phase1: { 'mona-chunky': 2325, 'mona-balanced': 4838, 'mona-fine': 13837,
      'copilot-chunky': 3135, 'copilot-balanced': 6576, 'copilot-fine': 19588,
      'ducky-chunky': 1767, 'ducky-balanced': 3646, 'ducky-fine': 10662 },
    selected: { 'mona-fine': 13434, 'copilot-chunky': 3021, 'ducky-fine': 10311 },
  };
  const selection = await read('design/selected-designs.json');
  for (const [scope, path] of [['phase1', 'artifacts/phase1/catalog.json'], ['selected', 'artifacts/selected/r2-20260919/catalog.json']]) {
    const catalog = validateCatalog(await read(path));
    const prototypes = validatePrototypes(await read(catalog.prototypes_url));
    assert.equal(Object.keys(prototypes.types).length, scope === 'phase1' ? 21 : 236);
    const context = scope === 'phase1' ? { kind: 'phase1' }
      : contextFromCatalog(selection, catalog, await read('artifacts/selected/current.json'));
    assert.equal(catalog.candidates.length, scope === 'phase1' ? 9 : 3);
    for (const candidate of catalog.candidates) {
      const manifest = validateManifest(await read(candidate.manifest_url), candidate.id);
      validateGeometryMatch(manifest, prototypes);
      validateManifestChoice(manifest, context);
      assert.equal(manifest.parts.length, expected[scope][candidate.id]);
      const index = makeIndex(manifest);
      assert.equal([...index.colors.values()].reduce((a, b) => a + b, 0), manifest.parts.length);
      assert.equal([...index.types.values()].reduce((a, b) => a + b, 0), manifest.parts.length);
      for (const entry of downloadEntries(catalog, candidate)) {
        const bytes = await readFile(new URL(entry.url.replace(/^\//, ''), root));
        assert.ok(bytes.length > 0, entry.url);
      }
    }
  }
  for (const choice of selection.selections) {
    const bytes = await readFile(new URL(choice.baseline_manifest, root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), choice.baseline_sha256);
  }
});

test('fixed public record acknowledges the physical failure without approving printing', async () => {
  const status = await read('archive/status.json');
  assert.equal(status.feedback, 'SMALL_PARTS_AND_BLOCKED_HOLES_BEFORE_CLEANING');
  assert.equal(status.production_export, 'BLOCKED');
  assert.equal(status.physical_fit, 'NOT_VALIDATED');
  assert.equal(status.print_data, 'NOT_SLICED');
});
