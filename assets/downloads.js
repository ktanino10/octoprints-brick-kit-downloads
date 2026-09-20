import { readJSON } from './site.js';
import { assetURL, setLanguageContext } from './i18n.js';
import { PUBLICATION_URL, validatePublication } from './publication.js';

const $ = (selector) => document.querySelector(selector);
const labels = { common: '新版・8 mm共通ブロック', 'common-trial': '新版・共通ブロックの小型試験', selected: '旧r2の制作物・履歴', phase1: 'Phase1 / 履歴', trial: '旧r2・4 mm/8 mm試験の履歴', feedback: '実物フィードバック', design: '設計記録', viewer: '公開ビューア', site: '公開サイト・権利表示' };
const pageSize = 30;
let files = [];
let page = 0;
let currentRevision = null;
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
  const revision = $('#revision-filter').value;
  const filtered = files.filter((file) => (!needle || file.path.toLowerCase().includes(needle))
    && (!group || file.group === group) && (!format || file.format === format)
    && (!revision || file.revision === revision));
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
    name.append(link, create('span', `${file.revision} · ${labels[file.group]}`, 'group-note'));
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

function renderBundles(bundles, host) {
  host.replaceChildren();
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
    host.append(article);
  }
}

try {
  const [inventory, packages, publication] = await Promise.all([
    readJSON('archive/inventory.json'), readJSON('archive/bundles.json'),
    readJSON(PUBLICATION_URL).then(validatePublication),
  ]);
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
  const current = publication.revisions.find((entry) => entry.id === publication.current_revision);
  currentRevision = current.id;
  if (current.generation === 'common-blocks') {
    const latest = await readJSON(current.bundle_index_url);
    if (latest.revision !== current.id || !Array.isArray(latest.bundles) || !latest.bundles.length
      || latest.bundles.some((bundle) => bundle.revision !== current.id)) throw new Error('現行版の配布パッケージが公開記録と一致しません。');
    renderBundles(latest.bundles, $('#bundles'));
  } else {
    $('#bundles').replaceChildren(create('p', '新版の配布パッケージは制作データの受領待ちです。旧版のZIPは下の履歴に分けて保存しています。', 'note'));
  }
  renderBundles(packages.bundles, $('#historical-bundles'));
  for (const revision of publication.revisions.filter((entry) => entry.availability === 'AVAILABLE')) {
    const option = create('option', revision.id === currentRevision ? `${revision.id} · 公開中の版` : `${revision.id} · 履歴`);
    option.value = revision.id;
    $('#revision-filter').append(option);
  }
  for (const format of [...new Set(files.map((file) => file.format))].sort()) {
    const option = create('option', format);
    option.value = format;
    $('#format-filter').append(option);
  }
  const initialGroup = new URLSearchParams(location.search).get('group');
  if (Object.hasOwn(labels, initialGroup ?? '')) $('#group-filter').value = initialGroup;
  const params = new URLSearchParams(location.search);
  const initialRevision = params.get('revision');
  if (initialRevision && !publication.revisions.some((entry) => entry.id === initialRevision && entry.availability === 'AVAILABLE')) {
    throw new Error('指定された版のダウンロードは、まだ公開されていません。');
  }
  $('#revision-filter').value = initialRevision ?? (['trial', 'selected'].includes(initialGroup) ? 'r2-20260919'
    : initialGroup === 'phase1' ? 'phase1' : params.has('q') || initialGroup || params.get('scope') === 'all' ? '' : currentRevision);
  $('#file-search').value = params.get('q') ?? '';
  const initialFormat = params.get('format');
  if (files.some((file) => file.format === initialFormat)) $('#format-filter').value = initialFormat;
  const initialPage = Number(params.get('page') ?? 1);
  if (Number.isSafeInteger(initialPage) && initialPage > 0) page = initialPage - 1;
  setLanguageContext((url) => {
    for (const [name, selector] of [['q', '#file-search'], ['group', '#group-filter'], ['format', '#format-filter'], ['revision', '#revision-filter']]) {
      const value = $(selector).value;
      if (value) url.searchParams.set(name, value);
      else url.searchParams.delete(name);
    }
    url.searchParams.set('page', String(page + 1));
    if (!$('#revision-filter').value) url.searchParams.set('scope', 'all');
    else url.searchParams.delete('scope');
    return url;
  });
  for (const selector of ['#file-search', '#group-filter', '#format-filter', '#revision-filter']) {
    $(selector).addEventListener('input', () => { page = 0; render(); });
  }
  $('#previous-page').addEventListener('click', () => { page -= 1; render(); });
  $('#next-page').addEventListener('click', () => { page += 1; render(); });
  render();
} catch (error) {
  $('#download-error').hidden = false;
  $('#download-error').textContent = `ファイル目録を読み込めません。${error.message} ページを再読み込みするか、GitHub ReleaseまたはJSON目録から取得してください。`;
  $('#bundles').replaceChildren();
  $('#historical-bundles').replaceChildren();
  $('#file-count').textContent = '目録を確認できないため、件数・配布リンクは表示していません。';
}
