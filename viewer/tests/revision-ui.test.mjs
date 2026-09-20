import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolvePublishedContext } from '../src/revisions.js';
import { renderViewContext } from '../src/revision-ui.js';

test('the actual common revision renders without needing a legacy selection block', async () => {
  const root = new URL('../../', import.meta.url);
  const context = await resolvePublishedContext({
    readJSON: async (path) => JSON.parse(await readFile(new URL(path.slice(1), root), 'utf8')),
  });
  assert.equal(context.kind, 'common');
  assert.equal(context.selection, null);
  const original = globalThis.document;
  const nodes = new Map();
  const node = () => ({ dataset: {}, attributes: {}, children: [],
    setAttribute(key, value) { this.attributes[key] = value; },
    replaceChildren(...children) { this.children = children; },
  });
  globalThis.document = { body: node(), createElement: node,
    querySelector(selector) { if (!nodes.has(selector)) nodes.set(selector, node()); return nodes.get(selector); } };
  try {
    renderViewContext(context);
    assert.equal(document.body.dataset.viewMode, 'common');
    assert.equal(nodes.get('#selection-summary').children.length, 3);
    assert.match(nodes.get('#physical-gate').textContent, /未実施/);
    assert.match(nodes.get('#production-gate').textContent, /保留/);
    assert.equal(nodes.get('.style-switch').hidden, true);
    assert.equal(nodes.get('#revision-id').textContent, 'r3-8mm-20260920');
  } finally {
    if (original === undefined) delete globalThis.document;
    else globalThis.document = original;
  }
});
