import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { COMMON_REVISION, R2_REVISION, validatePublication, chooseRevision, revisionFile, physicalSummary } from '../../assets/publication.js';
import { resolvePublishedContext } from '../src/revisions.js';
import { displayPosition } from '../src/data.js';
import { translate } from '../../assets/i18n.js';

const root = new URL('../../', import.meta.url);
const read = async (path) => JSON.parse(await readFile(new URL(path.replace(/^\//, ''), root), 'utf8'));
const publication = await read('archive/revisions.json');

test('published catalog pointers match actual frozen bytes and no pending input is downloadable', async () => {
  validatePublication(publication);
  for (const entry of publication.revisions) {
    if (entry.availability === 'INPUT_WAIT') {
      assert.equal(entry.catalog_url, undefined);
      assert.throws(() => chooseRevision(publication, { revision: entry.id }), /受領待ち/);
      continue;
    }
    const bytes = await readFile(new URL(entry.catalog_url.slice(1), root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.catalog_sha256);
  }
});

test('a pending revision cannot become current or borrow an earlier catalog', () => {
  const pending = structuredClone(publication);
  pending.current_revision = COMMON_REVISION;
  assert.throws(() => validatePublication(pending), /入力待ち/);
  const borrowed = structuredClone(publication);
  const current = borrowed.revisions.find((entry) => entry.id === COMMON_REVISION);
  current.catalog_url = '/artifacts/selected/r2-20260919/catalog.json';
  assert.throws(() => validatePublication(borrowed), /入力待ち/);
});

test('explicit history, unknown modes and legacy candidate links never silently select another generation', () => {
  assert.equal(chooseRevision(publication, { mode: 'phase1' }).id, 'phase1');
  assert.equal(chooseRevision(publication, { mode: 'r2' }).id, R2_REVISION);
  assert.equal(chooseRevision(publication, { candidate: 'mona-fine' }).id, R2_REVISION);
  assert.equal(chooseRevision(publication, { candidate: 'copilot-fine' }).id, 'phase1');
  assert.throws(() => chooseRevision(publication, { mode: 'phase1', revision: R2_REVISION }), /一致しません/);
  assert.throws(() => chooseRevision(publication, { revision: 'not-published' }), /見つかりません/);
  assert.throws(() => chooseRevision(publication, { mode: 'newest-unchecked' }), /モード/);
});

test('revision artifact paths are exact, non-traversing and generation-specific', () => {
  const revision = { id: COMMON_REVISION, generation: 'common-blocks' };
  assert.equal(revisionFile(`artifacts/revisions/${COMMON_REVISION}/catalog.json`, revision),
    `/artifacts/revisions/${COMMON_REVISION}/catalog.json`);
  for (const value of [
    '/artifacts/selected/r2-20260919/catalog.json',
    `/artifacts/revisions/${COMMON_REVISION}/../private.json`,
    `/artifacts/revisions/${COMMON_REVISION}/%2e%2e/private.json`,
    `/artifacts/revisions/${COMMON_REVISION}/catalog.json?x=1`,
    `https://example.test/artifacts/revisions/${COMMON_REVISION}/catalog.json`,
  ]) assert.throws(() => revisionFile(value, revision));
});

test('physical trial descriptions are specific to the generation and cannot turn geometry into approval', () => {
  const revised = publication.revisions.find((entry) => entry.id === COMMON_REVISION);
  const earlier = publication.revisions.find((entry) => entry.id === R2_REVISION);
  assert.match(physicalSummary(revised), /この版の実物試験はまだ/);
  assert.match(physicalSummary(revised), /旧4 mm試作/);
  assert.match(physicalSummary(earlier), /超音波洗浄前/);
  assert.match(translate(physicalSummary(revised), 'en'), /has not been physically tested/);
  assert.match(translate(physicalSummary(earlier), 'en'), /before ultrasonic cleaning/);
  assert.doesNotMatch(translate(physicalSummary(revised), 'en'), /[\u3040-\u30ff\u3400-\u9fff]/);
  const forged = structuredClone(publication);
  forged.revisions[0].status.physical_trial = 'ISSUES_REPORTED';
  assert.throws(() => validatePublication(forged), /実物試験済み/);
  forged.revisions[0].status.physical_trial = 'NOT_TESTED';
  forged.revisions[0].status.physical_fit = 'PASS';
  assert.throws(() => validatePublication(forged), /印刷保留/);
});

test('actual legacy catalogs still resolve through explicit revision-aware publication', async () => {
  const catalogHashes = [];
  const reader = async (path, hash) => { if (hash) catalogHashes.push(hash); return read(path); };
  const r2 = await resolvePublishedContext({ mode: 'r2', candidate: 'mona-fine', readJSON: reader });
  assert.equal(r2.revision, R2_REVISION);
  assert.equal(r2.catalog.candidates.length, 3);
  assert.equal(r2.publicationEntry.status.physical_trial, 'ISSUES_REPORTED');
  assert.deepEqual(catalogHashes, [r2.publicationEntry.catalog_sha256]);
  const old = await resolvePublishedContext({ mode: 'phase1', readJSON: read });
  assert.equal(old.catalog.candidates.length, 9);
  await assert.rejects(resolvePublishedContext({ mode: 'r2', candidate: 'mona-new', readJSON: read }), /存在しません/);
});

test('mixed brick/plate exploded view uses actual source Z, not a uniform layer approximation', () => {
  const parts = [
    { layer: 0, position_mm: [0, 0, 0] },
    { layer: 1, position_mm: [0, 0, 9.6] },
    { layer: 2, position_mm: [0, 0, 12.8] },
    { layer: 3, position_mm: [0, 0, 22.4] },
  ];
  const original = JSON.stringify(parts);
  for (const part of parts) {
    assert.deepEqual(displayPosition(part, 0, [0, 0, 0], null), part.position_mm);
    assert.equal(displayPosition(part, 1, [0, 0, 0], null)[2], part.position_mm[2] * 2.75);
  }
  assert.equal(JSON.stringify(parts), original);
  assert.equal(displayPosition({ layer: 2, position_mm: [0, 0, 7.2] }, 1, [0, 0, 0], 3.6)[2], 19.8);
});
