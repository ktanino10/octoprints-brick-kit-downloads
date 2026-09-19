import { parse } from '@babel/parser';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
const entries = new Map();
const japanese = /[\u3040-\u30ff\u3400-\u9fff]/;
const normalize = (value) => value.replace(/\s+/g, ' ').trim();
function add(value, filename) {
  if (!japanese.test(value)) return;
  const key = normalize(value);
  if (!entries.has(key)) entries.set(key, new Set());
  entries.get(key).add(filename);
}
function walk(node, filename) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'StringLiteral') add(node.value, filename);
  if (node.type === 'TemplateLiteral') {
    const source = node.quasis.map((part, index) => `${part.value.cooked ?? part.value.raw}${index < node.expressions.length ? `{${index}}` : ''}`).join('');
    add(source, filename);
  }
  for (const [key, value] of Object.entries(node)) {
    if (['loc', 'start', 'end', 'extra', 'comments', 'tokens'].includes(key)) continue;
    if (Array.isArray(value)) value.forEach((child) => walk(child, filename));
    else if (value && typeof value === 'object') walk(value, filename);
  }
}
for (const directory of ['viewer/src', 'assets']) {
  for (const filename of await readdir(path.join(root, directory))) {
    if (!filename.endsWith('.js') || ['i18n.js', 'translations.js'].includes(filename)) continue;
    const relative = `${directory}/${filename}`;
    walk(parse(await readFile(path.join(root, relative), 'utf8'), { sourceType: 'module' }), relative);
  }
}
await mkdir(path.join(root, '.archive-work'), { recursive: true });
await writeFile(path.join(root, '.archive-work/i18n-runtime.json'), JSON.stringify(
  Object.fromEntries([...entries].map(([key, files]) => [key, { en: '', sources: [...files] }])), null, 2) + '\n');
console.log(`Extracted ${entries.size} explicit runtime message templates; no model/data files modified.`);
