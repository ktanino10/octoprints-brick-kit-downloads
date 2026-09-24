import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import catalog from '../../assets/translations.js';
import { interpolate, translate, MissingTranslationError, validateLocale, setLocale, getLocale, localizedURL } from '../../assets/i18n.js';
import { readViewState, writeViewState } from '../src/view-state.js';
import { makeIndex } from '../src/data.js';

const root = new URL('../../', import.meta.url);
const limits = {
  candidate: 'mona-fine', layers: 75, steps: 13434,
  parts: new Map([['MON-F-00001', {}]]), supportClasses: new Set(['GROUND']),
};
const state = {
  candidate: 'mona-fine', part: 'MON-F-00001',
  progress: { explosion: 0.5, layers: 15, steps: 20 },
  camera: [300, -400, 250, 0, 0, 90], query: 'MON-F-00001',
  visibleOnly: false, undersideOnly: false, support: '', bom: 'types', page: 0,
};

test('compact translation bindings restore every exact source string without repeating the source catalog', () => {
  const entries = Object.keys(catalog.messages);
  assert.equal(Object.keys(catalog.sourceIds).length, entries.length);
  for (const source of entries) {
    const normalized = source.replace(/\s+/g, ' ').trim();
    const id = createHash('sha256').update(normalized).digest('hex').slice(0, 16);
    assert.equal(catalog.sourceIds[id], source);
  }
});

test('every reviewed English message keeps its interpolation variables', async () => {
  for (const file of (await readdir(new URL('site/i18n/', root))).filter((name) => name.endsWith('.en.json'))) {
    const messages = JSON.parse(await readFile(new URL(`site/i18n/${file}`, root), 'utf8'));
    for (const [source, target] of Object.entries(messages)) {
      assert.ok(target.length, source);
      assert.deepEqual(new Set(source.match(/\{\d+\}/g) ?? []), new Set(target.match(/\{\d+\}/g) ?? []), source);
    }
  }
});

test('locale selection is explicit and unsupported locales fail', () => {
  setLocale('en');
  assert.equal(getLocale(), 'en');
  assert.equal(translate('全数印刷は保留'), 'Do not print the full kit');
  assert.throws(() => setLocale('fr'), RangeError);
  assert.equal(getLocale(), 'en');
  assert.throws(() => validateLocale('../../en'), RangeError);
  setLocale('ja');
  assert.equal(translate('全数印刷は保留'), '全数印刷は保留');
});

test('source-backed interpolation is text, never HTML or replacement-string execution', () => {
  const unsafe = '<img src=x onerror=alert(1)> $& $1';
  assert.equal(interpolate('Part {0}', { 0: unsafe }), `Part ${unsafe}`);
  assert.throws(() => interpolate('Part {0}', {}), /Missing interpolation/);
  assert.equal(translate(`部品 ${unsafe} を選択。Purple、p4、第1層、順序候補2。`, 'en'),
    `Selected part ${unsafe}. Purple, p4, layer 1, assembly-sequence step 2. `);
  assert.throws(() => translate('辞書に存在しない新しい説明です', 'en'), MissingTranslationError);
});

test('dynamic English retains IDs, all numerical counts and unvalidated gates', () => {
  assert.equal(translate('13,434 個の部品が見つかりました', 'en'), '13,434 parts found');
  assert.equal(translate('124色 / 236型', 'en'), '124 colors / 236 types');
  assert.equal(translate('嵌合・保持力未確認 / UNKNOWN', 'en'), 'Fit and retention unvalidated / UNKNOWN');
  assert.equal(translate('MON-F-00001', 'en'), 'MON-F-00001');
  assert.equal(translate('PRODUCTION_BLOCKED', 'en'), 'PRODUCTION_BLOCKED');
});

test('locale-aware links preserve queries/fragments and shared root assets', () => {
  const url = new URL(localizedURL('viewer/?mode=phase1&candidate=copilot-fine#data', 'en'));
  assert.ok(url.pathname.endsWith('/en/viewer/index.html'));
  assert.equal(url.searchParams.get('candidate'), 'copilot-fine');
  assert.equal(url.searchParams.get('mode'), 'phase1');
  assert.equal(url.hash, '#data');
  assert.ok(localizedURL('p4-trial-11-parts.3mf', 'en').endsWith('/p4-trial-11-parts.3mf'));
  assert.ok(localizedURL('feedback/2026-09-19/README.md', 'en').endsWith('/feedback/2026-09-19/README.en.md'));
});

test('shared view round-trips selection, progress, camera and filters without changing IDs', () => {
  const url = writeViewState('https://example.test/project/en/viewer/?mode=selected#data', state);
  assert.equal(url.searchParams.get('candidate'), 'mona-fine');
  assert.equal(url.searchParams.get('mode'), 'selected');
  assert.equal(url.hash, '#data');
  assert.deepEqual(readViewState(url.searchParams.get('view'), limits), state);
  assert.throws(() => readViewState('{broken', limits), /JSON/);
  for (const bad of [
    { ...state, candidate: 'ducky-fine' },
    { ...state, part: 'NOT-A-REAL-ID' },
    { ...state, camera: [0, 0, 0, 0, 0, 0] },
    { ...state, progress: { ...state.progress, steps: 999999 } },
    { ...state, progress: { ...state.progress, layers: '75' } },
    { ...state, bom: 'html' },
  ]) assert.throws(() => readViewState(JSON.stringify(bad), limits));
});

test('JA and EN compute identical BOMs from untouched actual model data', async () => {
  for (const [candidate, count] of [['mona-fine', 13434], ['copilot-chunky', 3021], ['ducky-fine', 10311]]) {
    const original = await readFile(new URL(`artifacts/selected/r2-20260919/${candidate}/manifest.json`, root), 'utf8');
    const manifest = JSON.parse(original);
    setLocale('ja');
    const ja = makeIndex(manifest);
    setLocale('en');
    const en = makeIndex(manifest);
    assert.deepEqual([...ja.partsById.keys()], [...en.partsById.keys()]);
    assert.deepEqual([...ja.types], [...en.types]);
    assert.deepEqual([...ja.colors], [...en.colors]);
    assert.equal(en.partsById.size, count);
    assert.equal(JSON.stringify(manifest), JSON.stringify(JSON.parse(original)));
  }
  setLocale('ja');
});
