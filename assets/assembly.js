import { assetURL, localizedURL, numberLocale, setLanguageContext } from './i18n.js';
import { readJSON } from './site.js';
import { COMMON_REVISION, PUBLICATION_URL, chooseRevision, validatePublication } from './publication.js';
import { validateCommonCatalog, validateCommonManifest } from './common-blocks.js';

const $ = (selector) => document.querySelector(selector);
const names = { mona: 'Mona', copilot: 'Copilot', ducky: 'Ducky' };
const number = (value) => new Intl.NumberFormat(numberLocale(), { maximumFractionDigits: 3 }).format(value);
const pageSize = 30;
let catalog = null;
let manifest = null;
let candidate = null;
let page = 0;
let generation = 0;
const params = new URLSearchParams(location.search);
const element = (tag, text, className = '') => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = String(text);
  if (className) node.className = className;
  return node;
};

function renderRows() {
  if (!manifest) return;
  const query = $('#assembly-search').value.trim().toLocaleLowerCase('en');
  const layer = $('#assembly-layer').value;
  const rows = manifest.parts.filter((part) => {
    const color = manifest.palette[part.color_id];
    return (!layer || String(part.layer) === layer)
      && (!query || `${part.id} ${part.type_id} ${part.role} ${color.name} ${color.hex}`.toLocaleLowerCase('en').includes(query));
  }).sort((left, right) => left.step - right.step || left.id.localeCompare(right.id, 'en', { numeric: true }));
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  page = Math.min(page, pages - 1);
  $('#assembly-results').textContent = `${number(rows.length)} / ${number(manifest.parts.length)}部品を表示`;
  $('#assembly-parts').replaceChildren();
  for (const part of rows.slice(page * pageSize, (page + 1) * pageSize)) {
    const row = element('tr');
    row.dataset.partId = part.id;
    const id = element('td');
    id.append(element('strong', part.id, 'mono'), element('small', part.type_id, 'group-note'));
    const color = manifest.palette[part.color_id];
    const role = element('td');
    role.append(element('span', color.name), element('small', `${color.hex} · ${part.role}`, 'group-note'));
    row.append(element('td', part.step), id, role,
      element('td', part.position_mm.map(number).join(', '), 'mono'),
      element('td', `${part.rotation_z_deg}° / ${part.small_part_exception ? '小部品の例外' : '共通部品'}`));
    $('#assembly-parts').append(row);
  }
  if (!rows.length) {
    const row = element('tr');
    const cell = element('td', '一致する部品がありません。ID・色名、または表示範囲を変えてください。');
    cell.colSpan = 5;
    row.append(cell);
    $('#assembly-parts').append(row);
  }
  $('#assembly-prev').disabled = page === 0;
  $('#assembly-next').disabled = page + 1 === pages;
  $('#assembly-page').textContent = `${page + 1} / ${pages}`;
}

async function loadCandidate(id, restore = false) {
  const version = ++generation;
  manifest = null;
  candidate = catalog.candidates.find((entry) => entry.id === id);
  $('#assembly-overview').hidden = true;
  $('#assembly-parts').replaceChildren();
  $('#assembly-results').textContent = '';
  $('#assembly-error').hidden = true;
  for (const selector of ['#assembly-search', '#assembly-layer', '#assembly-prev', '#assembly-next']) $(selector).disabled = true;
  try {
    if (!candidate) throw new Error('指定された部品モデルは、この版に存在しません。');
    $('#assembly-status').textContent = '版と実マニフェストを確認しています。';
    const loaded = validateCommonManifest(await readJSON(candidate.manifest_url), id);
    if (version !== generation) return;
    if (loaded.revision !== catalog.revision || loaded.metrics.part_count !== candidate.metrics.part_count) {
      throw new Error('新版の配置マニフェストが表示中の版と一致しません。');
    }
    manifest = loaded;
    $('#assembly-candidate').value = id;
    $('#assembly-name').textContent = `${names[candidate.character]} · ${catalog.revision}`;
    $('#assembly-counts').textContent = `${number(manifest.parts.length)}部品 · ${number(manifest.metrics.unique_types)}型 · 高さ${number(manifest.metrics.height_mm)} mm`;
    $('#assembly-status').textContent = '実マニフェストを照合しました。これはデジタル配置の記録で、実物の組立合格ではありません。';
    const links = $('#assembly-links');
    links.replaceChildren();
    for (const [label, href] of [
      ['この版を3Dで確認 ↗', localizedURL(`viewer/?revision=${encodeURIComponent(catalog.revision)}&candidate=${encodeURIComponent(id)}`)],
      ['原版の組立ガイドを取得 ↓', assetURL(candidate.assembly_guide_url)],
      ['部品表を取得 ↓', assetURL(candidate.bom_url)],
    ]) {
      const link = element('a', label, 'button secondary');
      link.href = href;
      links.append(link);
    }
    $('#assembly-layer').replaceChildren(element('option', 'すべての高さ'));
    $('#assembly-layer').firstElementChild.value = '';
    for (const layer of [...new Set(manifest.parts.map((part) => part.layer))].sort((a, b) => a - b)) {
      const option = element('option', `${number(layer * 3.2)} mm`);
      option.value = String(layer);
      $('#assembly-layer').append(option);
    }
    $('#assembly-search').value = restore ? params.get('q') ?? '' : '';
    const requestedLayer = restore ? params.get('layer') : null;
    $('#assembly-layer').value = requestedLayer && manifest.parts.some((part) => String(part.layer) === requestedLayer) ? requestedLayer : '';
    const initialPage = Number(restore ? params.get('page') ?? 1 : 1);
    page = Number.isSafeInteger(initialPage) && initialPage > 0 ? initialPage - 1 : 0;
    $('#assembly-search').disabled = false;
    $('#assembly-layer').disabled = false;
    $('#assembly-overview').hidden = false;
    renderRows();
  } catch (error) {
    if (version !== generation) return;
    $('#assembly-status').textContent = '公開状態は不明です。全数印刷は保留します。';
    $('#assembly-error').hidden = false;
    $('#assembly-error').textContent = `組立候補の実データを読み込めません。${error.message}`;
  }
}

try {
  const publication = validatePublication(await readJSON(PUBLICATION_URL));
  const revision = chooseRevision(publication, { revision: params.get('revision') ?? COMMON_REVISION });
  if (revision.generation !== 'common-blocks') throw new Error('この組立候補ガイドは、新しい共通ブロック版だけを対象とします。');
  catalog = validateCommonCatalog(await readJSON(revision.catalog_url, revision.catalog_sha256));
  $('#assembly-candidate').replaceChildren(...catalog.candidates.map((entry) => {
    const option = element('option', names[entry.character]);
    option.value = entry.id;
    return option;
  }));
  $('#assembly-candidate').disabled = false;
  $('#assembly-candidate').addEventListener('change', (event) => loadCandidate(event.target.value));
  for (const selector of ['#assembly-search', '#assembly-layer']) {
    $(selector).addEventListener('input', () => { page = 0; renderRows(); });
  }
  $('#assembly-prev').addEventListener('click', () => { page -= 1; renderRows(); });
  $('#assembly-next').addEventListener('click', () => { page += 1; renderRows(); });
  setLanguageContext((url) => {
    url.searchParams.set('revision', revision.id);
    if (candidate) url.searchParams.set('candidate', candidate.id);
    for (const [key, selector] of [['q', '#assembly-search'], ['layer', '#assembly-layer']]) {
      if ($(selector).value) url.searchParams.set(key, $(selector).value);
      else url.searchParams.delete(key);
    }
    url.searchParams.set('page', String(page + 1));
    return url;
  });
  await loadCandidate(params.get('candidate') ?? catalog.candidates[0].id, true);
} catch (error) {
  $('#assembly-status').textContent = '実データがそろうまで、組立順や部品数を推測で表示しません。';
  $('#assembly-error').hidden = false;
  $('#assembly-error').textContent = `組立候補の公開版を確認できません。${error.message}`;
}
