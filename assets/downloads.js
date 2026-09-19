import { readJSON } from './site.js';
import { assetURL, setLanguageContext } from './i18n.js';

const $ = (selector) => document.querySelector(selector);
const labels = { selected: '選定 r2-20260919', phase1: 'Phase1 / 履歴', trial: '4 mm・8 mm 試験 / NOT_SLICED', feedback: '実物フィードバック', design: '設計記録', viewer: '公開ビューア', site: '公開サイト・権利表示' };
const pageSize = 30;
let files = [];
let page = 0;
const create = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
};
const bytes = (n) => n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(1)} MB`;

function render() {
  const needle = $('#file-search').value.trim().toLowerCase();
  const group = $('#group-filter').value;
  const format = $('#format-filter').value;
  const filtered = files.filter((file) => (!needle || file.path.toLowerCase().includes(needle))
    && (!group || file.group === group) && (!format || file.format === format));
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  page = Math.min(page, pages - 1);
  $('#file-count').replaceChildren(document.createTextNode(`${filtered.length.toLocaleString('ja-JP')} / ${files.length.toLocaleString('ja-JP')} ファイル · ${bytes(filtered.reduce((sum, file) => sum + file.bytes, 0))}`));
  const inventory = create('a', '全ファイル目録 JSON ↓');
  inventory.href = assetURL('archive/inventory.json');
  inventory.download = '';
  $('#file-count').append(inventory);
  $('#file-list').replaceChildren();
  for (const file of filtered.slice(page * pageSize, (page + 1) * pageSize)) {
    const row = create('tr');
    const name = create('td');
    const link = create('a', file.path, 'path');
    link.href = assetURL(file.path);
    link.download = '';
    link.setAttribute('data-i18n-ignore', '');
    name.append(link, create('span', labels[file.group], 'group-note'));
    const checksum = create('td');
    const detail = create('details');
    detail.append(create('summary', 'SHA-256'), create('code', file.sha256));
    if (file.source_sha256 && file.source_sha256 !== file.sha256) detail.append(create('span', '公開用メタデータ整理済み。形状は未変更。'));
    checksum.append(detail);
    row.append(name, create('td', file.format), create('td', bytes(file.bytes)), checksum);
    $('#file-list').append(row);
  }
  if (!filtered.length) {
    const row = create('tr');
    const cell = create('td', '一致するファイルがありません。検索語・版・形式の条件を減らしてください。');
    cell.colSpan = 4;
    row.append(cell);
    $('#file-list').append(row);
  }
  $('#page-count').textContent = `${page + 1} / ${pages}`;
  $('#previous-page').disabled = page === 0;
  $('#next-page').disabled = page + 1 === pages;
}

function renderBundles(bundles) {
  $('#bundles').replaceChildren();
  for (const bundle of bundles) {
    const article = create('article', undefined, 'bundle');
    article.append(create('span', bundle.revision, 'file-label'), create('h3', bundle.label),
      create('p', bundle.description), create('p', `${bundle.file_count}ファイル / ${bytes(bundle.bytes)}`));
    const link = create('a', 'ZIPを取得 ↓', 'button primary');
    const url = new URL(bundle.url);
    if (url.origin !== 'https://github.com' || !url.pathname.startsWith('/ktanino10/octoprints-brick-kit-downloads/releases/download/')) {
      throw new Error('配布先が公開プロジェクトと一致しません。');
    }
    link.href = url.href;
    article.append(link, create('p', `SHA-256 ${bundle.sha256}`, 'hash'));
    $('#bundles').append(article);
  }
}

try {
  const [inventory, packages] = await Promise.all([readJSON('archive/inventory.json'), readJSON('archive/bundles.json')]);
  if (!Array.isArray(inventory.files) || !inventory.files.length || !Array.isArray(packages.bundles)) throw new Error('目録の形式が不正です。');
  const base = new URL('./', location.href);
  for (const file of inventory.files) {
    const url = new URL(file.path, base);
    if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname) || !/^[0-9a-f]{64}$/.test(file.sha256)
        || !Number.isSafeInteger(file.bytes) || file.bytes < 0 || !labels[file.group]) {
      throw new Error('目録のパス・ハッシュ・サイズ・グループが不正です。');
    }
  }
  files = inventory.files;
  renderBundles(packages.bundles);
  for (const format of [...new Set(files.map((file) => file.format))].sort()) {
    const option = create('option', format);
    option.value = format;
    $('#format-filter').append(option);
  }
  const initialGroup = new URLSearchParams(location.search).get('group');
  if (Object.hasOwn(labels, initialGroup ?? '')) $('#group-filter').value = initialGroup;
  const params = new URLSearchParams(location.search);
  $('#file-search').value = params.get('q') ?? '';
  const initialFormat = params.get('format');
  if (files.some((file) => file.format === initialFormat)) $('#format-filter').value = initialFormat;
  const initialPage = Number(params.get('page') ?? 1);
  if (Number.isSafeInteger(initialPage) && initialPage > 0) page = initialPage - 1;
  setLanguageContext((url) => {
    for (const [name, selector] of [['q', '#file-search'], ['group', '#group-filter'], ['format', '#format-filter']]) {
      const value = $(selector).value;
      if (value) url.searchParams.set(name, value);
      else url.searchParams.delete(name);
    }
    url.searchParams.set('page', String(page + 1));
    return url;
  });
  for (const selector of ['#file-search', '#group-filter', '#format-filter']) {
    $(selector).addEventListener('input', () => { page = 0; render(); });
  }
  $('#previous-page').addEventListener('click', () => { page -= 1; render(); });
  $('#next-page').addEventListener('click', () => { page += 1; render(); });
  render();
} catch (error) {
  $('#download-error').hidden = false;
  $('#download-error').textContent = `ファイル目録を読み込めません。${error.message} ページを再読み込みするか、GitHub ReleaseまたはJSON目録から取得してください。`;
  $('#bundles').replaceChildren();
  $('#file-count').textContent = '目録を確認できないため、件数・配布リンクは表示していません。';
}
