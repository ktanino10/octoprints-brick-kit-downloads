import { assemblyScope, assemblySetup, CHARACTERS, STYLES } from './data.js';
import { $, $$, element, number, setPressed } from './dom.js';

function metric(selector, value, unit) {
  const host = $(selector);
  host.replaceChildren(document.createTextNode(value), element('small', '', unit));
}

export function resetMetrics() {
  metric('#metric-parts', '—', '個');
  metric('#metric-height', '—', 'mm');
  metric('#metric-footprint', '—', 'mm');
  metric('#metric-time', '—', '時間');
  $('#visible-count').textContent = '—';
  $('#total-count').textContent = '—';
  $('#visible-percent').textContent = '—';
  $('#visible-track').style.width = '0%';
  $('#data-candidate').textContent = '—';
  $('#graph-info').textContent = '幾何接触グラフは、実機の嵌合・強度・保持力を保証しません。';
  $('#model-warnings').hidden = true;
  $('#attachment-summary').hidden = true;
  $('#variant-context').hidden = true;
  $('#baseline-comparison').hidden = true;
  $('#current-dimensions').hidden = true;
  $('#current-dimensions').replaceChildren();
  $('#insertion-status').textContent = '未検証 / UNKNOWN';
  $('#assembly-setup').hidden = true;
  $('#assembly-setup').replaceChildren();
}

export function candidateHeading(catalog, candidate, viewContext = { kind: 'phase1' }) {
  document.body.dataset.character = candidate.character;
  const character = CHARACTERS[candidate.character];
  const style = STYLES[candidate.style];
  const fineCaution = candidate.style === 'fine'
    ? ` · ${number(candidate.metrics.part_count, 0)}部品 / PLA小型接合部は実機試験が前提` : '';
  const revised = viewContext.kind === 'selected' || viewContext.kind === 'preview';
  const revisionLabel = revised ? ` · ${viewContext.revision}${viewContext.kind === 'preview' ? ' / PREVIEW' : ''}`
    : viewContext.kind === 'baseline' ? ' · PHASE 1基準 / 旧接合部' : '';
  $('#candidate-kicker').textContent = `${style.english.toUpperCase()} · ${number(candidate.pitch_mm)} mm PITCH${revisionLabel}${fineCaution}`;
  $('#candidate-title').replaceChildren(document.createTextNode(character.name), element('span', 'variant-name', style.name));
  $('#candidate-id').textContent = candidate.id;
  document.title = `${character.name} · ${style.name} — Octoprints / Brick study`;
  setPressed($$('button[data-character]'), (button) => button.dataset.character === candidate.character);
  setPressed($$('button[data-style]'), (button) => button.dataset.style === candidate.style);
  $$('button[data-character]').forEach((button) => {
    button.disabled = !catalog.candidates.some((item) => item.character === button.dataset.character);
  });
  $$('button[data-style]').forEach((button) => {
    const found = catalog.candidates.find((item) => item.character === candidate.character && item.style === button.dataset.style);
    button.disabled = !found;
    $('[data-pitch]', button).textContent = found ? `${number(found.pitch_mm)} mm` : '未生成';
  });
  const context = $('#variant-context');
  const metrics = candidate.metrics;
  const balanced = catalog.candidates.find((entry) => entry.character === candidate.character && entry.style === 'balanced');
  context.dataset.fine = String(candidate.style === 'fine');
  context.replaceChildren(
    element('strong', '', viewContext.kind === 'baseline' ? '選択済み外観基準・旧形状'
      : revised ? '外観基準選択済み・接合部は試作'
        : candidate.style === 'fine' ? '細密 / 高工数の検討案' : '外観と作業量を比べる'),
    element('span', 'effort-facts', `${number(metrics.part_count, 0)}個 · ${metrics.approx_build_hours.map((value) => number(value)).join('–')}時間（推定）`),
  );
  if (candidate.style === 'fine' && balanced) {
    context.append(element('span', 'effort-ratio', `バランス案の約${number(metrics.part_count / balanced.metrics.part_count)}倍の部品数`));
  }
  context.append(element('span', 'effort-disclaimer', '部品増は外観精度・嵌合精度・組立やすさを保証しません。'));
  context.hidden = false;
}

export function renderMetrics(manifest, candidate, viewContext = { kind: 'phase1' }) {
  const metrics = manifest.metrics;
  metric('#metric-parts', number(manifest.parts.length, 0), '個');
  metric('#metric-height', number(metrics.height_mm), 'mm');
  metric('#metric-footprint', `${number(metrics.width_mm)} × ${number(metrics.depth_mm)}`, 'mm');
  metric('#metric-time', metrics.approx_build_hours.map((value) => number(value)).join('–'), '時間');
  $('#height-value').textContent = number(metrics.height_mm);
  $('#total-count').textContent = number(manifest.parts.length, 0);
  $('#data-candidate').textContent = manifest.candidate_id;
  const assembly = manifest.assembly;
  const scope = assemblyScope(assembly);
  $('#insertion-status').textContent = scope.label;
  $('#step-help').textContent = `層と順序候補の共通範囲を表示。${scope.detail}`;
  const graph = $('#graph-info');
  graph.replaceChildren(
    element('strong', '', `公称スタッド接触：${number(assembly.graph_components, 0)}連結成分 / ${number(assembly.contact_edge_count, 0)}接触辺`),
    document.createTextNode(`配置上の接触グラフで、実機の嵌合・強度・保持力の保証ではありません。${scope.detail}`),
  );
  if (scope.sourceDetails.length) {
    const details = element('details', 'warnings');
    const list = element('ul');
    list.append(...scope.sourceDetails.map((line) => element('li', '', line)));
    details.append(element('summary', '', '公称経路チェックの記載範囲・前提'), list);
    graph.append(details);
  }
  if (assembly.support_risk) {
    const risk = assembly.support_risk;
    const block = element('div', 'hidden-part-note');
    block.append(element('strong', '', '保持リスク（幾何条件の記録・強度UNKNOWN）'));
    for (const [key, label] of [['self_weight_cantilever', '単体自重の片持ち条件'], ['single_stud', '丸スタッド1本'], ['cradle_retention_required', '仮支持台撤去後の保持条件']]) {
      if (Number.isFinite(risk.counts[key])) block.append(element('p', '', `${label}：${number(risk.counts[key], 0)}部品`));
    }
    block.append(element('p', 'control-help', '重複あり。実際の上層荷重・充填・衝撃・摩擦・転倒・保持力は未確認です。部品ID・型番に加え「片持ち」「丸スタッド」でも検索できます。'));
    if (risk.scope) block.append(element('p', 'control-help', risk.scope));
    graph.append(block);
  }
  const underside = assembly.underside_attachment_count ?? manifest.parts.filter((part) => part.insertion_axis === '+Z').length;
  const fixtureParts = manifest.parts.filter((part) => part.required_aids?.length).length;
  $('#attachment-summary').textContent = `${number(underside, 0)}部品が「下側からの後付け候補」。${fixtureParts ? `${number(fixtureParts, 0)}部品は設計上の仮支持台が必要です。` : ''}経路判定：${scope.label}。実機組立は未確認です。`;
  $('#attachment-summary').hidden = false;
  renderAssemblySetup(manifest);
  $('#metric-time').title = '1部品あたりの作業時間などから推定した検討値です。実測・組立保証ではありません。';
  const warnings = [...new Set([...(candidate.warnings ?? []), ...(manifest.warnings ?? [])])];
  if (assembly.graph_components !== 1) warnings.unshift(`幾何接触グラフが${assembly.graph_components}成分に分かれています。支えや配置の検討が必要です。`);
  $('#model-warnings').hidden = warnings.length === 0;
  $('#model-warnings').open = candidate.style === 'fine';
  $('#warning-count').textContent = `(${warnings.length})`;
  $('#warning-list').replaceChildren(...warnings.map((warning) => element('li', '', warning)));
  const comparison = $('#baseline-comparison');
  comparison.hidden = viewContext.kind === 'phase1';
  if (viewContext.kind === 'selected' || viewContext.kind === 'preview') {
    comparison.textContent = `選択済み外観基準 ${number(metrics.baseline_part_count, 0)}個 → この接合部試作 ${number(metrics.part_count, 0)}個。部品の組み替えを含み、外観の選択が接合部の承認を意味するものではありません。`;
    renderCurrentDimensions(metrics);
    renderRevisionFacts(graph, manifest);
  } else if (viewContext.kind === 'baseline') {
    comparison.textContent = `表示は選択済みのPhase1基準 ${number(metrics.part_count, 0)}個です。旧壁厚・旧接合部の情報であり、新版の測定値ではありません。`;
  }
}

function renderAssemblySetup(manifest) {
  const setup = assemblySetup(manifest);
  const host = $('#assembly-setup');
  host.replaceChildren();
  host.hidden = !setup.fixtureParts && !setup.steps.length;
  if (host.hidden) return;
  host.append(element('strong', '', setup.firstPartStep === null
    ? '仮支持が必要・準備条件の記録を確認'
    : `部品の順序候補${number(setup.firstPartStep, 0)}より前：仮支持台${number(setup.aidCount, 0)}種の準備が必要`));
  if (setup.allFixturePartsDownward) {
    host.append(element('p', '', `補助具対象の${number(setup.fixtureParts, 0)}部品も、現行案は上から下へ（−Z）の配置です。下側からの後付け案ではありません。`));
  }
  if (setup.retentionRequiredBeforeRemoval) {
    host.append(element('p', 'setup-retention', '実機で保持力を確認するまで、仮支持台を外さない条件です。保持力・強度・実機の安定性はUNKNOWNです。'));
  }
  if (setup.steps.length) {
    const details = element('details', 'part-source-details');
    const list = element('ul');
    for (const step of setup.steps) {
      list.append(element('li', '', `${step.aid_id} / 部品の順序候補${number(step.before_part_step, 0)}より前：${step.instruction}`));
    }
    details.append(element('summary', '', '元データの準備条件'), list);
    host.append(details);
  }
  host.append(element('p', 'control-help', '設計記録の表示です。仮支持台や準備を本体の部品数・組立スライダーに足したり、実行・承認したりはしません。'));
}

function renderCurrentDimensions(metrics) {
  const labels = {
    nominal_min_wall_mm: '公称最小壁厚', nominal_roof_mm: '公称屋根厚',
    min_socket_mouth_wall_mm: '口元の最小壁厚', min_socket_straight_wall_mm: '直部の最小壁厚',
    minimum_socket_wall_mm: '最小ソケット壁厚', min_roof_mm: '最小屋根厚',
    measured_min_wall_mm: '形状からの最小壁厚', measured_min_roof_mm: '形状からの最小屋根厚',
    bearing_pad_height_mm: '着座パッド高さ',
    micro_stud_diameter_mm: '接合軸の公称径',
  };
  const rows = Object.entries(metrics).filter(([key, value]) =>
    Number.isFinite(value) && /(?:wall|roof|bearing_pad|micro_stud).*_mm$/.test(key) && !/baseline|historical|previous|legacy|phase_?1|(?:^|_)old(?:_|$)/i.test(key));
  const host = $('#current-dimensions');
  host.replaceChildren();
  if (!rows.length) return;
  host.hidden = false;
  host.append(element('h4', '', '公称寸法と検証状態（この版の記載）'));
  if (metrics.wall_measurement_status) {
    host.append(element('p', 'control-help', `ネイティブ寸法検証：${metrics.wall_measurement_status}。公称値と実形状照合の完了は別です。`));
  }
  const facts = element('dl', 'evidence-facts');
  for (const [key, value] of rows) {
    const row = element('div');
    row.append(element('dt', '', labels[key] ?? key), element('dd', '', `${number(value, 3)} mm`));
    facts.append(row);
  }
  host.append(facts, element('p', 'control-help', '壁厚と保持力は別の検証です。小型PLA軸の強度・摩擦・保持力は実機未確認です。'));
}

function renderRevisionFacts(host, manifest) {
  const preservation = manifest.appearance_preservation;
  const repairs = manifest.assembly.support_repairs;
  if (!preservation && !repairs) return;
  const details = element('details', 'warnings');
  const list = element('ul');
  details.append(element('summary', '', '基準との差分・支持の検討記録'), list);
  if (preservation) {
    for (const [key, label] of [
      ['occupied_cell_changes', '占有セルの変更'],
      ['boundary_color_changes', '境界色の変更'],
      ['potentially_visible_changed_seam_segments', '見える可能性のある部品境界の変更'],
    ]) {
      if (Number.isFinite(preservation[key])) list.append(element('li', '', `${label}：${number(preservation[key], 0)}`));
    }
    list.append(element('li', '', '格子上の外形と境界色の照合であり、部品境界や連続曲面の見た目が完全に同一という意味ではありません。'));
  }
  if (repairs) {
    if (typeof repairs.status === 'string') list.append(element('li', '', `支持の再構成：${repairs.status}（実機未確認）`));
    if (Number.isFinite(repairs.unsupported_after)) list.append(element('li', '', `本体のみでの未支持記録：${number(repairs.unsupported_after, 0)}部品。補助具条件も確認してください。`));
    if (Number.isFinite(repairs.hidden_recolored_cells)) list.append(element('li', '', `内部の色変更セル：${number(repairs.hidden_recolored_cells, 0)}`));
  }
  if (manifest.assembly.aids?.length) list.append(element('li', '', `仮支持台 ${manifest.assembly.aids.length}種の設計情報あり。初回接合部試験とは別枠で、実機保持力は未確認です。`));
  host.append(details);
}

export function enableControls(enabled, sceneAvailable) {
  for (const id of ['explode', 'layers', 'steps', 'previous-step', 'next-step', 'show-complete']) {
    $(`#${id}`).disabled = !enabled;
  }
  for (const button of $$('[data-view], #reset-view')) button.disabled = !sceneAvailable;
}

export function renderProgress(progress, index, visible, total) {
  $('#explode').value = String(Math.round(progress.explosion * 100));
  $('#explode-value').textContent = `${Math.round(progress.explosion * 100)}%`;
  $('#explode').setAttribute('aria-valuetext', progress.explosion === 0 ? '完成形' : `${Math.round(progress.explosion * 100)}パーセント分解`);
  $('#layers').max = String(index.layers.length);
  $('#layers').value = String(progress.layers);
  $('#layer-value').textContent = `${number(progress.layers, 0)} / ${number(index.layers.length, 0)} 層`;
  $('#layers').setAttribute('aria-valuetext', `${index.layers.length}層のうち下から${progress.layers}層まで`);
  $('#steps').max = String(index.steps.length);
  $('#steps').value = String(progress.steps);
  $('#step-value').textContent = `${number(progress.steps, 0)} / ${number(index.steps.length, 0)}`;
  $('#steps').setAttribute('aria-valuetext', progress.steps === 0 ? '開始前、表示部品なし' : `${index.steps.length}件の順序候補のうち${progress.steps}番目、候補ID ${index.steps[progress.steps - 1]}まで。差込経路は未検証`);
  $('#previous-step').disabled = progress.steps === 0;
  $('#next-step').disabled = progress.steps === index.steps.length;
  $('#visible-count').textContent = number(visible, 0);
  $('#visible-percent').textContent = `${Math.round(visible / total * 100)}%`;
  $('#visible-track').style.width = `${visible / total * 100}%`;
  $('#empty-progress').hidden = visible !== 0 || !$('#stage-message').hidden;
}
