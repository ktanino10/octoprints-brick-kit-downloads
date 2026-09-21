import { assetURL, setLanguageContext } from './i18n.js';
import { readJSON } from './site.js';
import {
  studyElement as create, formatStudyNumber as format, renderStudyPanels,
  comparisonKinds as kinds, comparisonViews as views, comparisonRules as rules,
} from './study-ui.js';
import {
  REFINEMENT_URL, REFINEMENT_ROLES, REFINEMENT_BASELINES, countDelta,
  validateRefinementPointer, validateRefinementStudy, chooseRefinementComparison,
} from './mona-refinement-data.js';

const $ = (selector) => document.querySelector(selector);
const names = { 'fine-c': '初期細密C（4 mm）', 'previous-360': '前の36 cm案（10,908部品）',
  'refined-360': '初期Cへ近づける改良案' };
let study = null, comparison = null;

function imageError() {
  $('#refine-error').hidden = false;
  $('#refine-error').textContent = '改良案の実画像を読み込めません。前の画像を新案として代用していません。';
}

function renderComparison() {
  if (!study || !comparison) return;
  const url = new URL(location.href);
  url.searchParams.set('comparison', comparison.id);
  history.replaceState(history.state, '', url);
  document.querySelectorAll('[data-refinement-comparison]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.refinementComparison === comparison.id));
  });
  $('#refine-comparison-title').textContent = `${kinds[comparison.kind]} · ${views[comparison.view]}`;
  $('#refine-rule').textContent = rules[comparison.kind];
  $('#refine-method').textContent = comparison.method_note;
  renderStudyPanels({ host: $('#refine-images'), comparison, study, roles: REFINEMENT_ROLES, names, onError: imageError,
    captionFor: (row) => `${format(row.metrics.part_count, 0)}部品 · 実高 ${format(row.metrics.dimensions_mm[2])} mm` });
}

function renderMetrics() {
  const table = $('#refine-metrics');
  table.replaceChildren();
  for (const role of REFINEMENT_ROLES) {
    const row = study.rows.find((item) => item.role === role), metrics = row.metrics;
    const tr = create('tr');
    tr.dataset.role = role;
    tr.dataset.candidate = row.candidate_id;
    const label = create('th', names[role]);
    label.scope = 'row';
    tr.append(label);
    for (const value of [
      format(metrics.part_count, 0), format(metrics.unique_types, 0), format(metrics.one_by_one_exceptions, 0),
      metrics.dimensions_mm.map((value) => format(value, 3)).join(' × '), format(metrics.layer_count, 0),
      metrics.minimum_part_mm.map((value) => format(value, 3)).join(' / '), format(metrics.grip_long_ge_15_8_count, 0),
    ]) tr.append(create('td', value));
    table.append(tr);
  }
  const refined = study.rows.find((row) => row.role === 'refined-360');
  const deltas = $('#refine-deltas');
  deltas.replaceChildren();
  for (const role of ['previous-360', 'fine-c']) {
    const delta = countDelta(refined.metrics.part_count, REFINEMENT_BASELINES[role]);
    const signed = (value) => `${value > 0 ? '+' : ''}${format(value, 1)}`;
    deltas.append(create('p', `${names[role]}との差：${signed(delta.parts)}部品（${signed(delta.percent)}%）`));
  }
  $('#refine-height-families').replaceChildren();
  for (const role of REFINEMENT_ROLES) {
    const row = study.rows.find((item) => item.role === role);
    const item = create('section', undefined, 'refine-height-card');
    item.dataset.role = role;
    item.append(create('h3', names[role]));
    for (const family of row.metrics.body_height_families) {
      item.append(create('p', `本体高 ${format(family.body_height_mm, 3)} mm：${format(family.part_count, 0)}部品 / ${format(family.unique_types, 0)}型`));
    }
    $('#refine-height-families').append(item);
  }
  $('#refine-layer-note').textContent = study.assembly_layer_note;
  $('#refine-limit').textContent = study.appearance_limit;
  $('#refine-tradeoff').textContent = study.assembly_tradeoff;
  $('#refine-changes').replaceChildren(...study.changes.map((text) => create('li', text)));
  $('#refine-differences').replaceChildren(...study.remaining_differences.map((text) => create('li', text)));
  const proof = $('#refine-provenance');
  proof.replaceChildren();
  for (const row of study.rows) {
    const evidence = create('details');
    evidence.append(create('summary', names[row.role]), create('p', row.candidate_id),
      create('p', `Manifest SHA-256: ${row.evidence.manifest_sha256}`),
      create('p', `BOM SHA-256: ${row.evidence.bom_sha256}`),
      create('p', `Geometry SHA-256: ${row.evidence.geometry_sha256}`),
      create('p', `Identity / pose / color SHA-256: ${row.evidence.identity_projection_sha256}`));
    proof.append(evidence);
  }
}

setLanguageContext((url) => {
  if (comparison) url.searchParams.set('comparison', comparison.id);
  return url;
});
window.addEventListener('popstate', () => {
  if (!study) return;
  comparison = chooseRefinementComparison(study, new URLSearchParams(location.search).get('comparison'));
  renderComparison();
});

try {
  const pointer = validateRefinementPointer(await readJSON(REFINEMENT_URL));
  if (pointer.state === 'INPUT_WAIT') {
    $('#refine-pending').hidden = false;
    $('#refine-status').textContent = 'INPUT_WAIT：改良Monaの実形状・部品表・比較画像を受領待ちです。';
  } else {
    study = validateRefinementStudy(await readJSON(pointer.data_url, pointer.data_sha256), pointer);
    comparison = chooseRefinementComparison(study, new URLSearchParams(location.search).get('comparison'));
    for (const group of study.comparisons) {
      const button = create('button', `${kinds[group.kind]} · ${views[group.view]}`);
      button.type = 'button';
      button.dataset.refinementComparison = group.id;
      button.addEventListener('click', () => { comparison = group; renderComparison(); });
      $('#refine-controls').append(button);
    }
    $('#refine-results').hidden = false;
    renderMetrics();
    renderComparison();
    $('#refine-status').textContent = '実部品の色・形状・数量に結び付いた比較です。外観の合格や全数印刷の承認ではありません。';
    const source = create('a', '機械可読の比較データを取得 ↓', 'text-link');
    source.href = assetURL(pointer.data_url);
    source.download = '';
    $('#refine-source').append(source, create('p', `Source revision: ${study.source_commit}`));
  }
} catch (error) {
  $('#refine-results').hidden = true;
  $('#refine-error').hidden = false;
  $('#refine-error').textContent = `Mona改良比較を確認できません。${error.message}`;
  $('#refine-status').textContent = '確認できない新案の画像・数量を推定で表示しません。';
}
