import { assetURL, localizedURL, numberLocale, setLanguageContext } from './i18n.js';
import { readJSON } from './site.js';
import { DENSITY_POINTER, validateDensityPointer } from './density-data.js';
import { printCatalog, selectedPrintCase } from './print-catalog-data.js';

const names = { mona: 'Mona', copilot: 'Copilot', ducky: 'Ducky' };
const number = (value, digits = 1) => new Intl.NumberFormat(numberLocale(), { maximumFractionDigits: digits }).format(value);
const selected = new Map();
let sourceCatalog = null, preview = null, previewRequest = null, previewGeneration = 0;
const previewDialog = document.querySelector('#catalog-preview-dialog');
const previewHost = document.querySelector('#catalog-preview-canvas');
const previewLoading = document.querySelector('#catalog-preview-loading');
const previewError = document.querySelector('#catalog-preview-error');
const previewMode = document.querySelector('#catalog-preview-mode');
const previewControls = [...document.querySelectorAll('[data-preview-action]')];
Object.defineProperty(window, '__catalogPreview', {
  value: Object.freeze({ diagnostics: () => preview?.diagnostics() ?? { ready: false } }),
});
const element = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
};
function showError(error) {
  const host = document.querySelector('#print-catalog-error');
  host.hidden = false;
  host.textContent = `モデル一覧を確認できません。${error.message}`;
}
function shareURL(url) {
  for (const [character, id] of selected) url.searchParams.set(character, id);
  return url;
}
function clearPreview() {
  previewGeneration++;
  previewRequest?.abort();
  previewRequest = null;
  preview?.dispose();
  preview = null;
  previewHost.replaceChildren();
  previewHost.dataset.modelReady = 'false';
  previewControls.forEach(button => { button.disabled = true; });
}
async function openPreview(item) {
  clearPreview();
  const generation = previewGeneration;
  const request = new AbortController();
  previewRequest = request;
  previewError.hidden = true;
  previewLoading.hidden = false;
  previewMode.textContent = '';
  document.querySelector('#catalog-preview-title').textContent =
    `${names[item.character]} · ${number(item.partCount, 0)}部品を360°回転`;
  document.querySelector('#catalog-preview-aids').textContent =
    `組立用の仮支台：${number(item.aids, 0)}個（本体部品数とは別）`;
  document.querySelector('#catalog-preview-guide').href = localizedURL(`density-guide.html?case=${item.id}`);
  if (!previewDialog.open) previewDialog.showModal();
  const fail = error => {
    if (generation !== previewGeneration || request.signal.aborted) return;
    previewLoading.hidden = true;
    previewError.hidden = false;
    previewError.textContent = `3D回転表示を読み込めません。${error.message}`;
    previewControls.forEach(button => { button.disabled = true; });
    preview?.dispose();
    preview = null;
    previewHost.replaceChildren();
    previewHost.dataset.modelReady = 'false';
    request.abort();
  };
  try {
    const module = await import(assetURL('viewer/assets/catalog-preview.js'));
    request.signal.throwIfAborted();
    const entry = sourceCatalog.cases.find(row => row.id === item.id);
    const instance = await module.loadCataloguePreview(previewHost, entry, sourceCatalog.display_catalog,
      { signal: request.signal, onError: fail });
    if (request.signal.aborted || generation !== previewGeneration || !previewDialog.open) {
      instance.dispose();
      return;
    }
    preview = instance;
    previewLoading.hidden = true;
    previewMode.textContent = instance.mode === 'NATIVE_PREVIEW_TESSELLATION'
      ? '表示用軽量3Dです。根元・特殊形状は原形を保持し、CADや部品数は変更していません。原形表示は組立ガイドから確認できます。'
      : '実ネイティブ形状の3D表示です。';
    previewControls.forEach(button => { button.disabled = false; });
    instance.focus();
  } catch (error) {
    if (!request.signal.aborted && generation === previewGeneration) fail(error);
  }
}
previewDialog.addEventListener('close', () => { if (!previewDialog.open) clearPreview(); });
previewDialog.addEventListener('click', event => { if (event.target === previewDialog) previewDialog.close(); });
document.querySelector('#catalog-preview-close').addEventListener('click', () => previewDialog.close());
for (const button of previewControls) button.addEventListener('click', () => {
  if (!preview) return;
  const action = button.dataset.previewAction;
  if (action === 'left') preview.turn(Math.PI / 6);
  else if (action === 'right') preview.turn(-Math.PI / 6);
  else if (action === 'zoom-in') preview.zoom(1);
  else if (action === 'zoom-out') preview.zoom(-1);
  else preview.view(action);
});
window.addEventListener('pagehide', clearPreview);

function modelCard(group, initial) {
  let choice = initial;
  const card = element('article', undefined, 'print-model');
  card.dataset.character = group.character;
  const heading = element('div', undefined, 'print-model-heading');
  heading.append(element('h2', names[group.character]), element('span', 'STL公開・実物未検証', 'print-data-badge'));
  const imageLink = element('a', undefined, 'image-link print-model-image');
  imageLink.dataset.lightbox = '';
  const image = element('img');
  const imageStatus = element('span', '実画像を読み込み中', 'model-image-loading');
  image.width = 800; image.height = 800;
  image.addEventListener('load', () => {
    if (image.currentSrc === imageLink.href) {
      imageLink.classList.remove('is-loading');
      imageLink.setAttribute('aria-busy', 'false');
    }
  });
  image.addEventListener('error', () => {
    imageLink.setAttribute('aria-busy', 'false');
    imageStatus.textContent = '実画像を表示できません';
    showError(new Error('選択モデルの実画像を読み込めません。別の画像では代用しません。'));
  });
  imageLink.addEventListener('click', event => {
    if (imageLink.classList.contains('is-loading')) { event.preventDefault(); event.stopPropagation(); }
  });
  imageLink.append(image, imageStatus, element('span', '画像を拡大 ＋', 'zoom-hint'));
  const body = element('div', undefined, 'print-model-body');
  const label = element('label', '部品数・完成サイズを選ぶ');
  const select = element('select');
  select.id = `model-${group.character}`; label.htmlFor = select.id;
  for (const item of group.cases) {
    const option = element('option', `${number(item.partCount, 0)}部品 / 高さ${number(item.dimensions[2])} mm`);
    option.value = item.id; select.append(option);
  }
  const size = element('p', undefined, 'print-model-size');
  const aids = element('p', undefined, 'print-model-aids');
  const revisionNote = element('p', undefined, 'quiet');
  const revisionLink = element('a', '支台なし改訂の公開状況 →', 'text-link');
  revisionLink.href = localizedURL('history.html#copilot-support-free');
  const download = element('a', 'STL入りモデル一式を取得 ↓', 'button primary');
  download.dataset.printDownload = '';
  const packageInfo = element('p', undefined, 'quiet');
  const guide = element('a', '部品と組立手順を確認 →', 'button secondary');
  guide.dataset.printGuide = '';
  const compare = element('a', '5案を大きな画像で比較する →', 'text-link');
  compare.href = localizedURL(`density-matrix.html?character=${group.character}`);
  const rotate = element('button', '360°回転で見る', 'button secondary');
  rotate.type = 'button';
  rotate.dataset.openRotation = group.character;
  rotate.setAttribute('aria-label', `${names[group.character]}を360度回転して見る`);
  rotate.addEventListener('click', () => openPreview(choice));
  body.append(label, select, rotate, size, aids, revisionNote, download, packageInfo, guide, compare);
  card.append(heading, imageLink, body);
  function choose(item) {
    choice = item;
    select.value = item.id;
    selected.set(group.character, item.id);
    card.dataset.case = item.id;
    card.dataset.physicalStatus = item.physicalStatus;
    imageLink.classList.add('is-loading');
    imageLink.setAttribute('aria-busy', 'true');
    imageStatus.textContent = '実画像を読み込み中';
    image.src = assetURL(item.image.path);
    image.alt = `${names[group.character]}・${number(item.partCount, 0)}部品の実モデル`;
    imageLink.href = image.src;
    imageLink.dataset.caption = `${names[group.character]} · ${number(item.partCount, 0)}部品 · 実物未検証`;
    size.textContent = `完成サイズ（幅×奥行×高さ）${item.dimensions.map(value => number(value)).join(' × ')} mm`;
    aids.textContent = `組立用の仮支台：${number(item.aids, 0)}個（本体部品数とは別）`;
    revisionNote.hidden = item.character !== 'copilot' || item.aids === 0;
    if (!revisionNote.hidden) {
      revisionNote.replaceChildren(element('span', '現在の配布物は支台付きの案です。支台なしへの設計改訂は別に進めています。'), document.createTextNode(' '), revisionLink);
    }
    download.href = item.download.url;
    packageInfo.textContent = `ZIP ${number(item.download.bytes / 1000000)} MB · STL・STEP・BOM・CAD・動画を同梱`;
    guide.href = localizedURL(`density-guide.html?case=${item.id}`);
  }
  choose(initial);
  select.addEventListener('change', () => {
    try {
      choose(selectedPrintCase(group, select.value));
      history.replaceState(null, '', shareURL(new URL(location.href)));
      setLanguageContext(shareURL);
    } catch (error) { showError(error); }
  });
  return card;
}

try {
  const [pointerData, receipt] = await Promise.all([
    readJSON(DENSITY_POINTER), readJSON('archive/block-budget-matrix.json'),
  ]);
  const pointer = validateDensityPointer(pointerData);
  if (pointer.state !== 'READY' || !receipt.verification_record) throw new Error('印刷用データの公開検証がまだ完了していません。');
  const [catalog, evidence] = await Promise.all([
    readJSON(pointer.catalog.path, pointer.catalog.sha256),
    readJSON(receipt.verification_record.path, receipt.verification_record.sha256),
  ]);
  const groups = printCatalog(catalog, pointer, receipt, evidence);
  sourceCatalog = catalog;
  const params = new URL(location.href).searchParams;
  const cards = groups.map(group => modelCard(group, selectedPrintCase(group, params.get(group.character))));
  document.querySelector('#model-cards').replaceChildren(...cards);
  document.querySelector('#catalog-loading').hidden = true;
  setLanguageContext(shareURL);
} catch (error) {
  document.querySelector('#catalog-loading').hidden = true;
  document.querySelector('#model-cards').replaceChildren();
  showError(error);
}
