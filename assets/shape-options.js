import { assetURL, numberLocale, setLanguageContext } from './i18n.js';
import { readJSON } from './site.js';
import { SHAPE_STUDY_URL, SHAPE_VARIANTS, SHAPE_CHARACTERS, BASELINE_COUNTS, validateStudyPointer, validateShapeStudy, countDelta } from './shape-options-data.js';

const $ = (selector) => document.querySelector(selector);
import { CHARACTER_NAMES as names } from './character-names.js';
const variants = { 'baseline-r3': '現行r3', 'plate-refined': 'プレート細分化案', 'contour-refined': '輪郭・斜面案' };
const format = (value, digits = 1) => new Intl.NumberFormat(numberLocale(), { maximumFractionDigits: digits }).format(value);
const element = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = String(text);
  if (className) node.className = className;
  return node;
};
let study = null;
let character = 'mona';
let view = 'perspective';
const params = new URLSearchParams(location.search);
if (SHAPE_CHARACTERS.includes(params.get('character'))) character = params.get('character');
if (['perspective', 'front'].includes(params.get('view'))) view = params.get('view');

function deltaText(row) {
  const delta = countDelta(row.metrics.part_count, BASELINE_COUNTS[row.character]);
  if (row.variant === 'baseline-r3') return '比較の基準・採用済みの現行版';
  const signed = (value) => `${value > 0 ? '+' : ''}${format(value)}`;
  return `現行比 ${signed(delta.parts)}部品（${signed(delta.percent)}%）`;
}

function render() {
  if (!study) return;
  const url = new URL(location.href);
  url.searchParams.set('character', character);
  url.searchParams.set('view', view);
  history.replaceState(history.state, '', url);
  for (const button of document.querySelectorAll('[data-study-character]')) button.setAttribute('aria-pressed', String(button.dataset.studyCharacter === character));
  for (const button of document.querySelectorAll('[data-study-view]')) button.setAttribute('aria-pressed', String(button.dataset.studyView === view));
  $('#study-character-title').textContent = `${names[character]} · ${view === 'front' ? '正面' : '斜め'}`;
  $('#study-revision').textContent = study.study_id;
  $('#study-appearance-limit').textContent = study.appearance_limit;
  $('#study-render-note').textContent = study.render_note;
  const sheet = study.comparisons.find((item) => item.character === 'all' && item.view === (view === 'perspective' ? 'three_quarter' : 'front'));
  $('#study-sheet').href = assetURL(sheet.path);
  $('#study-cards').replaceChildren();
  for (const variant of SHAPE_VARIANTS) {
    const row = study.rows.find((entry) => entry.character === character && entry.variant === variant);
    const metrics = row.metrics;
    const image = row.images[view];
    const card = element('article', undefined, 'study-card');
    card.dataset.variant = variant;
    card.dataset.candidate = row.candidate_id;
    const heading = element('div', undefined, 'study-card-header');
    heading.append(element('p', variant === 'baseline-r3' ? 'CURRENT / BASELINE' : 'UNSELECTED / DIGITAL STUDY', 'eyebrow'),
      element('h3', variants[variant]));
    const link = element('a', undefined, 'image-link');
    link.href = assetURL(image.path);
    link.dataset.lightbox = '';
    link.dataset.caption = `${names[character]} · ${variants[variant]} · ${format(metrics.part_count, 0)}部品 · ${study.study_id}`;
    const img = element('img');
    img.src = link.href;
    img.alt = `${names[character]} · ${variants[variant]} · ${view === 'front' ? '正面' : '斜め'}の実生成画像`;
    img.width = 1100;
    img.height = 1100;
    img.addEventListener('error', () => {
      $('#study-error').hidden = false;
      $('#study-error').textContent = '実比較画像を読み込めません。旧画像や代替画像には置き換えていません。再読み込みしてください。';
    });
    link.append(img, element('span', '画像を拡大 ＋', 'zoom-hint'));
    const content = element('div', undefined, 'study-card-content');
    const count = element('p', undefined, 'count');
    count.append(element('strong', format(metrics.part_count, 0)), element('small', '個別部品'));
    const facts = element('dl', undefined, 'study-facts');
    for (const [label, value] of [
      ['一意の形状・型', format(metrics.unique_types, 0)],
      ['プレート部品 / 組立手順', `${format(metrics.plate_parts, 0)} / ${format(metrics.assembly_step_count, 0)}`],
      ['小部品の例外', `${format(metrics.small_part_count, 0)}個 · ${metrics.small_part_definition}`],
      ['各最小値：短辺 / 長辺 / 厚み', `${metrics.minimum_part_mm.map((value) => format(value, 2)).join(' / ')} mm`],
      ['全体寸法 / mm', metrics.dimensions_mm.map((value) => format(value, 2)).join(' × ')],
    ]) {
      const definition = element('div');
      definition.append(element('dt', label), element('dd', value));
      facts.append(definition);
    }
    content.append(count, element('p', deltaText(row), 'study-delta'), facts);
    for (const [title, items] of [['主な見た目の変更', row.appearance_changes], ['組立とのトレードオフ', row.assembly_tradeoffs]]) {
      const list = element('ul');
      list.append(...items.map((text) => element('li', text)));
      content.append(element('h4', title), list);
    }
    const evidence = element('details', undefined, 'study-evidence');
    evidence.append(element('summary', '実数量の根拠と画像ハッシュ'),
      element('p', `${row.candidate_id} · ${row.evidence.count_method}`),
      element('p', `Manifest SHA-256: ${row.evidence.manifest_sha256}`),
      element('p', `BOM SHA-256: ${row.evidence.bom_sha256}`),
      element('p', `Native geometry SHA-256: ${row.evidence.native_geometry_sha256}`),
      element('p', `Image SHA-256: ${image.sha256}`));
    content.append(evidence);
    card.append(heading, link, content);
    $('#study-cards').append(card);
  }
}

function renderTable() {
  $('#study-table').replaceChildren();
  for (const name of SHAPE_CHARACTERS) for (const variant of SHAPE_VARIANTS) {
    const row = study.rows.find((entry) => entry.character === name && entry.variant === variant);
    const tr = element('tr');
    tr.dataset.candidate = row.candidate_id;
    const title = element('th');
    title.scope = 'row';
    const button = element('button', `${names[name]} / ${variants[variant]}`);
    button.type = 'button';
    button.addEventListener('click', () => {
      character = name;
      render();
      $('#study-character-title').scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    title.append(button);
    const delta = countDelta(row.metrics.part_count, BASELINE_COUNTS[name]).parts;
    tr.append(title, element('td', format(row.metrics.part_count, 0)),
      element('td', `${delta > 0 ? '+' : ''}${format(delta, 0)}`),
      element('td', format(row.metrics.unique_types, 0)),
      element('td', format(row.metrics.small_part_count, 0)),
      element('td', format(row.metrics.dimensions_mm[2], 2)));
    $('#study-table').append(tr);
  }
}

setLanguageContext((url) => {
  url.searchParams.set('character', character);
  url.searchParams.set('view', view);
  return url;
});
for (const button of document.querySelectorAll('[data-study-character]')) button.addEventListener('click', () => { character = button.dataset.studyCharacter; render(); });
for (const button of document.querySelectorAll('[data-study-view]')) button.addEventListener('click', () => { view = button.dataset.studyView; render(); });

try {
  const pointer = validateStudyPointer(await readJSON(SHAPE_STUDY_URL));
  if (pointer.state === 'INPUT_WAIT') {
    $('#study-pending').hidden = false;
    $('#study-status').textContent = '新しい6候補の実画像・実数量は、まだ公開されていません。現行r3は変更していません。';
    for (const button of document.querySelectorAll('.study-controls button')) button.disabled = true;
  } else {
    study = validateShapeStudy(await readJSON(pointer.data_url, pointer.data_sha256), pointer);
    $('#study-results').hidden = false;
    $('#study-status').textContent = '実際の個別部品数と画像を照合した比較です。新案は未採用・実物未検証です。';
    const source = element('a', '機械可読の比較データを取得 ↓', 'text-link');
    source.href = assetURL(pointer.data_url);
    source.download = '';
    $('#study-provenance').append(source, element('p', `Source revision: ${study.source_commit}`));
    render();
    renderTable();
  }
} catch (error) {
  $('#study-results').hidden = true;
  $('#study-error').hidden = false;
  $('#study-error').textContent = `比較データを確認できません。${error.message}`;
  $('#study-status').textContent = '確認できない数量や画像を推定で表示していません。';
}
