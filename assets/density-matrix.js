import { assetURL, localizedURL, setLanguageContext } from './i18n.js';
import { readJSON } from './site.js';
import { studyElement as element, formatStudyNumber as number, studyImage } from './study-ui.js';
import {
  DENSITY_POINTER, DENSITY_CHARACTERS, COUNT_PERCENTAGES,
  validateDensityPointer, validateDensityCatalog, targetPartCount,
} from './density-data.js';

const $ = (selector) => document.querySelector(selector);
const names = { mona: 'Mona', copilot: 'Copilot', ducky: 'Ducky' };
let catalog = null, character = 'mona', view = 'front';
const params = new URLSearchParams(location.search);
if (DENSITY_CHARACTERS.includes(params.get('character'))) character = params.get('character');
if (['front', 'three_quarter'].includes(params.get('view'))) view = params.get('view');
function showError(message) {
  $('#matrix-error').hidden = false; $('#matrix-error').textContent = message;
}
function actualImage(image, caption) {
  return studyImage(image, caption, () => showError('実比較画像を読み込めません。旧画像や仮のモデルで代用していません。'));
}
function render() {
  if (!catalog) return;
  document.querySelectorAll('[data-density-character]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.densityCharacter === character)));
  document.querySelectorAll('[data-density-view]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.densityView === view)));
  const url = new URL(location.href);
  url.searchParams.set('character', character); url.searchParams.set('view', view);
  history.replaceState(history.state, '', url);
  $('#matrix-character').textContent = names[character];
  const baseline = catalog.baselines[character];
  const reference = $('#matrix-reference'); reference.replaceChildren();
  if (baseline.state === 'READY') {
    reference.append(element('h3', `${names[character]} · 1倍の比較基準`),
      actualImage(baseline.images[view], `${names[character]} · 1倍基準 · ${number(baseline.metrics.part_count, 0)}部品`),
      element('p', `${number(baseline.metrics.part_count, 0)}部品 / ${number(baseline.metrics.unique_types, 0)}型`),
      element('p', baseline.metrics.dimensions_mm.map((n) => number(n, 3)).join(' × ') + ' mm', 'quiet'));
  } else if (baseline.state === 'COUNTED') {
    reference.append(element('h3', `${names[character]} · 1倍の比較基準`),
      element('p', `${number(baseline.metrics.part_count, 0)}部品 / ${number(baseline.metrics.unique_types, 0)}型`),
      element('p', '1倍の実個数は固定済みです。基準のネイティブCAD・CGは準備中で、完成画像は代用していません。'));
  } else reference.append(element('p', 'このキャラクターのFine C適合8 mm基準は、実データ確定待ちです。旧r3の個数で代用しません。'));
  const initial = catalog.appearance_references?.find((item) => item.character === character);
  if (initial) {
    const sourceImage = initial.images.find((item) => item.view === view) ?? initial.images[0];
    reference.append(element('h3', '初期Fine Cの外観参照'), actualImage(sourceImage, `${names[character]} · Fine C`),
      element('p', initial.note, 'quiet'));
  }
  const host = $('#matrix-cards'); host.replaceChildren();
  for (const percentage of COUNT_PERCENTAGES) {
    const item = catalog.cases.find((entry) => entry.character === character && entry.count_percentage === percentage);
    const card = element('article', undefined, 'density-card');
    card.dataset.case = item.id;
    card.dataset.state = item.state;
    card.append(element('p', `${number(percentage / 100)}× / PIECE COUNT`, 'eyebrow'));
    if (item.state === 'INPUT_WAIT') {
      card.append(element('h3', '入力待ち'), element('p', '実CG・動画・CAD・組立データはまだ公開していません。'));
      if (baseline.state !== 'INPUT_WAIT') card.append(element('p', `目標：${number(targetPartCount(baseline.metrics.part_count, percentage), 0)}部品（実数ではありません）`));
    } else {
      card.append(actualImage(item.images[view], `${item.id} · ${number(item.metrics.part_count, 0)}部品`),
        element('h3', `${number(item.metrics.part_count, 0)}部品`),
        element('p', `目標 ${number(item.target_count, 0)} / 差 ${item.target_difference > 0 ? '+' : ''}${number(item.target_difference, 0)}`),
        element('p', `実倍率 ${number(item.actual_ratio, 4)}倍 · ${number(item.metrics.unique_types, 0)}型`),
        element('p', `1×1例外 ${number(item.metrics.one_by_one_exceptions, 0)}個 · 長辺15.8 mm以上 ${number(item.metrics.grip_long_ge_15_8_count / item.metrics.part_count * 100, 1)}%`),
        element('p', item.metrics.dimensions_mm.map((n) => number(n, 3)).join(' × ') + ' mm', 'quiet'),
        element('p', item.tradeoff, 'quiet'));
      if (item.state === 'TARGET_MISSED') card.append(element('p', '個数目標の許容差を未達。15案の完成には数えていません。', 'error'));
      const guide = element('a', '実3D・放射分解・底から組立 ↗', 'button secondary');
      guide.href = localizedURL(`density-guide.html?case=${item.id}`);
      card.append(guide);
      const downloads = element('div', undefined, 'density-quick-links');
      for (const [key, label] of [['cg', 'CG / Blender'], ['native_cad', 'Native CAD'], ['assembly', 'BOM / assembly']]) {
        const file = item.assets[key][0];
        const link = element('a', label);
        link.href = file.url?.startsWith('https://') ? file.url : assetURL(file.path ?? file.url);
        downloads.append(link);
      }
      card.append(downloads);
    }
    host.append(card);
  }
}
function renderTable() {
  const host = $('#matrix-table'); host.replaceChildren();
  for (const item of catalog.cases) {
    const tr = element('tr');
    tr.dataset.case = item.id;
    const label = element('th', `${names[item.character]} / ${number(item.count_percentage / 100)}×`); label.scope = 'row';
    tr.append(label);
    const baseline = catalog.baselines[item.character];
    const values = item.state === 'INPUT_WAIT'
      ? [baseline.state !== 'INPUT_WAIT' ? number(targetPartCount(baseline.metrics.part_count, item.count_percentage), 0) : '未確定',
        '入力待ち', '—', '—', '—', '入力待ち']
      : [number(item.target_count, 0), number(item.metrics.part_count, 0), number(item.actual_ratio, 4),
        `${item.target_difference > 0 ? '+' : ''}${number(item.target_difference, 0)}`, number(item.metrics.unique_types, 0),
        item.state === 'READY' ? '実データ公開' : '目標未達'];
    for (const value of values) tr.append(element('td', value));
    host.append(tr);
  }
}
setLanguageContext((url) => { url.searchParams.set('character', character); url.searchParams.set('view', view); return url; });
document.querySelectorAll('[data-density-character]').forEach((button) => button.addEventListener('click', () => { character = button.dataset.densityCharacter; render(); }));
document.querySelectorAll('[data-density-view]').forEach((button) => button.addEventListener('click', () => { view = button.dataset.densityView; render(); }));
try {
  const pointer = validateDensityPointer(await readJSON(DENSITY_POINTER));
  if (pointer.state === 'INPUT_WAIT') {
    $('#matrix-pending').hidden = false;
    $('#matrix-status').textContent = 'INPUT_WAIT：同じ前提の1倍基準と15実案の公開用データを待っています。';
    document.querySelectorAll('[data-density-character],[data-density-view]').forEach((button) => { button.disabled = true; });
  } else {
    catalog = validateDensityCatalog(await readJSON(pointer.catalog.path, pointer.catalog.sha256), pointer);
    const ready = catalog.cases.filter((item) => item.state === 'READY').length;
    $('#matrix-status').textContent = `${number(ready, 0)} / 15案のCG・動画・CAD・組立データが公開されています。実物合格ではありません。`;
    $('#matrix-results').hidden = false; render(); renderTable();
  }
} catch (error) {
  $('#matrix-results').hidden = true;
  showError(`個数倍率比較を確認できません。${error.message}`);
}
