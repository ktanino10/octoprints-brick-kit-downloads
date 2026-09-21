import { assetURL, setLanguageContext } from './i18n.js';
import { readJSON } from './site.js';
import {
  studyElement as create, formatStudyNumber as format, studyImage, renderStudyPanels,
  comparisonKinds as kinds, comparisonViews as views, comparisonRules as rules,
} from './study-ui.js';
import {
  MONA_STUDY_URL, MONA_ROLES, MONA_REFERENCE_COUNTS, countDelta,
  validateMonaPointer, validateMonaStudy, chooseMonaComparison,
} from './mona-study-data.js';

const $ = (selector) => document.querySelector(selector);
const names = { original: '原型Mona（無分割）', 'fine-c': '初期細密C（4 mm）',
  'current-r3': '公開中r3（8 mm）', 'pilot-360': '新しい約36 cm案（8 mm）' };
let study = null, comparison = null;

function imageError() {
  $('#mona-error').hidden = false;
  $('#mona-error').textContent = 'Monaの実比較画像を読み込めません。旧画像や推定の画像で代用していません。';
}
const actualImage = (image, caption) => studyImage(image, caption, imageError);

function showComparison() {
  if (!study || !comparison) return;
  const url = new URL(location.href);
  url.searchParams.set('comparison', comparison.id);
  history.replaceState(history.state, '', url);
  for (const button of document.querySelectorAll('[data-mona-comparison]')) {
    button.setAttribute('aria-pressed', String(button.dataset.monaComparison === comparison.id));
  }
  $('#mona-comparison-title').textContent = `${kinds[comparison.kind]} · ${views[comparison.view]}`;
  $('#mona-comparison-rule').textContent = rules[comparison.kind];
  $('#mona-method').textContent = comparison.method_note;
  renderStudyPanels({ host: $('#mona-images'), comparison, study, roles: MONA_ROLES, names, onError: imageError,
    captionFor: (row) => row.role === 'original' ? 'ブロック数は対象外・無分割の原型'
      : `${format(row.metrics.part_count, 0)}部品 · 実高 ${format(row.metrics.dimensions_mm[2])} mm` });
}

function renderMetrics() {
  const table = $('#mona-metrics');
  table.replaceChildren();
  for (const role of MONA_ROLES) {
    const row = study.rows.find((item) => item.role === role);
    const metrics = row.metrics;
    const tr = create('tr');
    tr.dataset.role = role;
    tr.dataset.candidate = row.candidate_id;
    const heading = create('th', names[role]);
    heading.scope = 'row';
    const notApplicable = '対象外（無分割）';
    tr.append(heading);
    for (const value of [
      role === 'original' ? notApplicable : format(metrics.part_count, 0),
      role === 'original' ? notApplicable : format(metrics.unique_types, 0),
      role === 'original' ? notApplicable : format(metrics.one_by_one_exceptions, 0),
      metrics.dimensions_mm.map((value) => format(value, 3)).join(' × '),
      role === 'original' ? notApplicable : format(metrics.layer_count, 0),
      role === 'original' ? notApplicable : metrics.minimum_part_mm.map((value) => format(value)).join(' / '),
      role === 'original' ? notApplicable : format(metrics.grip_long_ge_15_8_count, 0),
    ]) tr.append(create('td', value));
    table.append(tr);
  }
  const pilot = study.rows.find((row) => row.role === 'pilot-360');
  const deltas = $('#mona-deltas');
  deltas.replaceChildren();
  for (const role of ['fine-c', 'current-r3']) {
    const delta = countDelta(pilot.metrics.part_count, MONA_REFERENCE_COUNTS[role]);
    const signed = (value) => `${value > 0 ? '+' : ''}${format(value, 1)}`;
    deltas.append(create('p', `${names[role]}との差：${signed(delta.parts)}部品（${signed(delta.percent)}%）`));
  }
  $('#mona-actual-height').textContent = `目標は約360 mm。実データの高さは${format(pilot.metrics.dimensions_mm[2])} mmです。`;
  $('#mona-layer-note').textContent = study.assembly_layer_note;
  $('#mona-appearance-limit').textContent = study.appearance_limit;
  $('#mona-tradeoff').textContent = study.assembly_tradeoff;
  const sampling = study.fidelity_sampling;
  const parts = study.pilot_metrics;
  $('#mona-sampling').replaceChildren(
    create('p', `形をサンプリングした占有セル：初期C ${format(sampling.first_C_cell_count, 0)} → 新案 ${format(sampling.pilot_cell_count, 0)}。個別部品数とは異なります。`),
    create('p', study.visual_observations.at(-1)),
    create('p', `新案の内訳：3.2 mmプレート ${format(parts.plate_count, 0)}部品、9.6 mm内部ブロック ${format(parts.standard9_6mm_brick_count, 0)}部品。`),
    create('p', `共通直方体 ${format(parts.common_rectangular_parts, 0)}部品と、直交した支持・把持用形状 ${format(parts.orthogonal_backing_contour_parts, 0)}部品で構成しています。曲面外装や斜面の部品はありません。`),
    create('p', `基礎の${format(parts.foundation_parts, 0)}部品は総数に含みます。別の仮支持台${format(parts.temporary_aid_count, 0)}個は総数に含みません。`)
  );
  $('#mona-interface').replaceChildren(actualImage(study.fixed_interface_image, '実ネイティブ形状の8 mm共通ブロック・部品寸法'));
  $('#mona-observations').replaceChildren(...study.visual_observations.map((text) => create('li', text)));
  const proof = $('#mona-provenance');
  proof.replaceChildren();
  for (const row of study.rows) {
    const evidence = create('details');
    evidence.append(create('summary', names[row.role]), create('p', row.candidate_id),
      create('p', `Geometry SHA-256: ${row.evidence.geometry_sha256}`));
    if (row.role !== 'original') {
      evidence.append(create('p', `Manifest SHA-256: ${row.evidence.manifest_sha256}`),
        create('p', `BOM SHA-256: ${row.evidence.bom_sha256}`));
    }
    proof.append(evidence);
  }
}

setLanguageContext((url) => {
  if (comparison) url.searchParams.set('comparison', comparison.id);
  return url;
});
window.addEventListener('popstate', () => {
  if (!study) return;
  comparison = chooseMonaComparison(study, new URLSearchParams(location.search).get('comparison'));
  showComparison();
});

try {
  const pointer = validateMonaPointer(await readJSON(MONA_STUDY_URL));
  if (pointer.state === 'INPUT_WAIT') {
    $('#mona-pending').hidden = false;
    $('#mona-status').textContent = 'INPUT_WAIT：原型から再構成したMonaの実画像・実数量を受領待ちです。';
  } else {
    study = validateMonaStudy(await readJSON(pointer.data_url, pointer.data_sha256), pointer);
    comparison = chooseMonaComparison(study, new URLSearchParams(location.search).get('comparison'));
    for (const group of study.comparisons) {
      const button = create('button', `${kinds[group.kind]} · ${views[group.view]}`);
      button.type = 'button';
      button.dataset.monaComparison = group.id;
      button.addEventListener('click', () => { comparison = group; showComparison(); });
      $('#mona-controls').append(button);
    }
    $('#mona-results').hidden = false;
    renderMetrics();
    showComparison();
    $('#mona-status').textContent = '実画像と実数量の比較です。見た目の承認・正式採用・実物合格を示すものではありません。';
    const source = create('a', '機械可読の比較データを取得 ↓', 'text-link');
    source.href = assetURL(pointer.data_url);
    source.download = '';
    $('#mona-source').append(source, create('p', `Source revision: ${study.source_commit}`));
  }
} catch (error) {
  $('#mona-results').hidden = true;
  $('#mona-error').hidden = false;
  $('#mona-error').textContent = `Mona比較を確認できません。${error.message}`;
  $('#mona-status').textContent = '確認できない新案の画像・数量を推定で表示しません。';
}
