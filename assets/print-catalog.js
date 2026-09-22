import { assetURL, localizedURL, numberLocale, setLanguageContext } from './i18n.js';
import { readJSON } from './site.js';
import { DENSITY_POINTER, validateDensityPointer } from './density-data.js';
import { printCatalog, selectedPrintCase } from './print-catalog-data.js';

const names = { mona: 'Mona', copilot: 'Copilot', ducky: 'Ducky' };
const number = (value, digits = 1) => new Intl.NumberFormat(numberLocale(), { maximumFractionDigits: digits }).format(value);
const selected = new Map();
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
function modelCard(group, initial) {
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
  const download = element('a', 'STL入りモデル一式を取得 ↓', 'button primary');
  download.dataset.printDownload = '';
  const packageInfo = element('p', undefined, 'quiet');
  const guide = element('a', '部品と組立手順を確認 →', 'button secondary');
  guide.dataset.printGuide = '';
  const compare = element('a', '5案を大きな画像で比較する →', 'text-link');
  compare.href = localizedURL(`density-matrix.html?character=${group.character}`);
  body.append(label, select, size, aids, download, packageInfo, guide, compare);
  card.append(heading, imageLink, body);
  function choose(item) {
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
