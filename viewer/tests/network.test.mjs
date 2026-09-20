import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { getJSON } from '../src/network.js';

test('revision catalog loading requires exact bytes and rejects stale or malformed publications', async () => {
  const originalFetch = globalThis.fetch;
  const bytes = JSON.stringify({ fixture: 'unit-test-only', revision: 'r3-test' });
  const hash = createHash('sha256').update(bytes).digest('hex');
  try {
    globalThis.fetch = async () => new Response(bytes, { status: 200, headers: { 'content-type': 'application/json' } });
    assert.deepEqual(await getJSON('/artifacts/revisions/r3-test/catalog.json', null, { sha256: hash }), JSON.parse(bytes));
    await assert.rejects(getJSON('/artifacts/revisions/r3-test/catalog.json', null, { sha256: '0'.repeat(64) }), /登録ハッシュ/);
    await assert.rejects(getJSON('/artifacts/revisions/r3-test/catalog.json', null, { sha256: 'invalid' }), /ハッシュが不正/);
    globalThis.fetch = async () => new Response(bytes, { status: 503 });
    await assert.rejects(getJSON('/artifacts/revisions/r3-test/catalog.json', null, { sha256: hash }), /HTTP 503/);
    const invalid = '{"broken":';
    globalThis.fetch = async () => new Response(invalid, { status: 200 });
    await assert.rejects(getJSON('/artifacts/revisions/r3-test/catalog.json', null, {
      sha256: createHash('sha256').update(invalid).digest('hex'),
    }), /JSON/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
