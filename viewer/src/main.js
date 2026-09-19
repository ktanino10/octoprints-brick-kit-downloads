import './studio.css';
import {
  CHARACTERS, STYLES, DataError, artifactPath, isPartVisible, makeIndex,
  validateManifest, validatePrototypes,
} from './data.js';
import { $, $$, announce, element, setPressed, setStageMessage } from './dom.js';
import { catalogError, ArchiveStatus, getJSON } from './network.js';
import { markGallerySelection, renderDownloads, renderGallery } from './assets.js';
import { PartsInspector } from './inspector.js';
import { candidateHeading, enableControls, renderMetrics, renderProgress, resetMetrics } from './presentation.js';
import { BrickStudio } from './studio.js';
import { resolveViewContext, validateManifestChoice } from './revisions.js';
import { renderViewContext } from './revision-ui.js';
import { renderTrials } from './trials.js';

let catalog = null;
let candidate = null;
let manifest = null;
let index = null;
let studio = null;
let studioAvailable = false;
let prototypeCache = null;
let prototypeRequest = null;
let candidateRequest = null;
let catalogRequest = null;
let selectionGeneration = 0;
let progress = { explosion: 0, layers: 0, steps: 0 };
let viewContext = null;
const requestedMode = new URLSearchParams(window.location.search).get('mode') === 'phase1' ? 'phase1' : 'selected';
const requestedRevision = new URLSearchParams(window.location.search).get('revision');
const inspector = new PartsInspector(selectPart);
const poller = new ArchiveStatus();
if (requestedMode === 'phase1') renderViewContext({ kind: 'phase1', revision: 'phase1', selection: null });

function sceneError(message) {
  studioAvailable = false;
  $('#canvas-host').dataset.modelReady = 'false';
  setStageMessage('3Dを表示できません', message, true);
  enableControls(Boolean(manifest), false);
  $('#explode').disabled = true;
  $('#focus-part').disabled = true;
  announce(message);
}

function getStudio() {
  if (!studio) {
    studio = new BrickStudio($('#canvas-host'), {
      onSelect: selectPart,
      onError: sceneError,
      onViewChange: (view) => setPressed($$('[data-view]'), (node) => node.dataset.view === view),
    });
  }
  return studio;
}

async function getPrototypes() {
  if (prototypeCache) return prototypeCache;
  if (!prototypeRequest) {
    const sourceCatalog = catalog;
    const pending = getJSON(artifactPath(sourceCatalog.prototypes_url))
      .then(validatePrototypes)
      .then((data) => {
        if (catalog === sourceCatalog) prototypeCache = data;
        return data;
      })
      .finally(() => { if (prototypeRequest === pending) prototypeRequest = null; });
    prototypeRequest = pending;
  }
  return prototypeRequest;
}

function resetProgressState() {
  progress = { explosion: 0, layers: 0, steps: 0 };
  $('#explode').value = '0';
  $('#explode-value').textContent = '0%';
  $('#layers').value = '0';
  $('#steps').value = '0';
  $('#layer-value').textContent = '— / — 層';
  $('#step-value').textContent = '— / —';
  $('#empty-progress').hidden = true;
  enableControls(false, false);
}

async function selectCandidate(id, scroll = false) {
  const next = catalog?.candidates.find((entry) => entry.id === id);
  if (!next) return;
  candidateRequest?.abort();
  candidateRequest = new AbortController();
  const request = candidateRequest;
  const generation = ++selectionGeneration;
  candidate = next;
  manifest = null;
  index = null;
  studioAvailable = false;
  studio?.clear();
  resetProgressState();
  resetMetrics();
  inspector.clear();
  candidateHeading(catalog, next, viewContext);
  markGallerySelection(id);
  setStageMessage('実際のブリックを読み込み中', '部品ID・色・配置と、CAD由来のメッシュを照合しています。');
  $('#viewport').setAttribute('aria-busy', 'true');
  renderDownloads(catalog, next, request.signal, viewContext);
  if (scroll) $('#studio').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  const prototypeResult = getPrototypes().then((data) => ({ data }), (error) => ({ error }));
  try {
    const nextManifest = validateManifest(await getJSON(artifactPath(next.manifest_url), request.signal), id);
    if (generation !== selectionGeneration) return;
    validateManifestChoice(nextManifest, viewContext);
    for (const key of ['part_count', 'unique_types', 'color_count', 'layer_count', 'height_mm', 'width_mm', 'depth_mm']) {
      if (next.metrics[key] !== nextManifest.metrics[key]) {
        throw new DataError(`カタログと配置データの ${key} が一致しません。再生成または再読み込みが必要です。`);
      }
    }
    manifest = nextManifest;
    index = makeIndex(manifest);
    progress = { explosion: 0, layers: index.layers.length, steps: index.steps.length };
    renderMetrics(manifest, next, viewContext);
    inspector.load(manifest, index, progress);
    enableControls(true, false);
    $('#explode').disabled = true;
    renderProgress(progress, index, manifest.parts.length, manifest.parts.length);
    const result = await prototypeResult;
    if (generation !== selectionGeneration) return;
    if (result.error) {
      throw new DataError(`実部品の形状を読み込めません。${result.error.message} 箱や円柱による代替は表示しません。`);
    }
    try {
      getStudio().load(manifest, result.data, index);
    } catch (error) {
      if (error instanceof DataError) throw error;
      console.error('3D model initialization failed', error);
      const detail = error instanceof Error ? error.message : String(error);
      throw new DataError(`3Dを初期化できません。WebGL対応のブラウザーとハードウェアアクセラレーションを確認してください。部品一覧・構成表は利用できます。詳細: ${detail}`);
    }
    studioAvailable = true;
    $('#stage-message').hidden = true;
    $('#height-callout').hidden = false;
    enableControls(true, true);
    renderProgress(progress, index, manifest.parts.length, manifest.parts.length);
    announce(`${CHARACTERS[next.character].name}、${STYLES[next.style].name}。${manifest.parts.length}個のブリックを表示。進行を完成形に戻しました。`);
  } catch (error) {
    if (generation !== selectionGeneration || request.signal.aborted) return;
    studioAvailable = false;
    const title = manifest ? '実部品の3Dを表示できません' : 'この案の配置を読み込めません';
    setStageMessage(title, error.message || 'データの生成状況を確認してください。', true);
    enableControls(Boolean(manifest), false);
    $('#explode').disabled = true;
    announce(`${title}。${error.message}`);
  } finally {
    if (generation === selectionGeneration) $('#viewport').setAttribute('aria-busy', 'false');
  }
}

function updateProgress() {
  if (!manifest || !index) return;
  const visible = studioAvailable
    ? studio.setProgress(progress)
    : manifest.parts.filter((part) => isPartVisible(part, index, progress.layers, progress.steps)).length;
  renderProgress(progress, index, visible, manifest.parts.length);
  inspector.setProgress(progress);
  if (!studioAvailable) $('#focus-part').disabled = true;
}

function selectPart(id) {
  const part = id ? index?.partsById.get(id) : null;
  if (id && !part) return;
  studio?.select(part ?? null);
  inspector.renderSelected(part?.id ?? null);
  if (!studioAvailable) $('#focus-part').disabled = true;
  if (part) {
    const visible = isPartVisible(part, index, progress.layers, progress.steps);
    announce(`部品 ${part.id} を選択。${manifest.palette[part.color_id].name}、${part.type_id}、第${part.layer + 1}層、順序候補${part.step}。${part.insertion_axis === '+Z' ? '下側からの後付け候補。差込経路は未検証。' : ''}${visible ? '' : '現在の進行範囲外です。'}`);
  } else {
    announce('部品の選択を解除しました。');
  }
}

async function loadCatalog(preferredId) {
  const rememberedId = typeof preferredId === 'string' ? preferredId : candidate?.id;
  catalogRequest?.abort();
  catalogRequest = new AbortController();
  const request = catalogRequest;
  candidateRequest?.abort();
  selectionGeneration += 1;
  studioAvailable = false;
  studio?.clear();
  catalog = null;
  candidate = null;
  manifest = null;
  index = null;
  prototypeCache = null;
  prototypeRequest = null;
  viewContext = null;
  poller.setScope(null, null, '表示する選択版・履歴を確認中です。');
  resetProgressState();
  resetMetrics();
  inspector.clear();
  $('#catalog-error').hidden = true;
  $('#revision-title').textContent = requestedMode === 'phase1' ? 'Phase1の比較履歴を確認中'
    : requestedRevision ? '明示された版を確認中（版指定プレビュー）' : '選択記録と公開版を確認中';
  $('#revision-id').textContent = '—';
  $('#revision-detail').textContent = '表示する版を確認しています。外観基準の選択は、接合部・組立・製造の承認ではありません。';
  $('#selection-summary').replaceChildren();
  $('#trial-sets').replaceChildren();
  $('#fit-trials').hidden = requestedMode === 'phase1';
  $('#trial-summary').textContent = 'この版の試験片情報を確認中です。本体一式を出力する段階ではありません。';
  $('#downloads').replaceChildren(element('p', 'section-empty', '表示する版の取得先を確認中です。'));
  $('#video-preview video')?.pause();
  $('#video-preview').replaceChildren();
  $('#gallery').replaceChildren(element('p', 'section-empty', '比較カタログを読み込み中です。'));
  setStageMessage('形状データを読み込み中', '公開アーカイブの比較カタログを確認しています。');
  $$('button[data-character], button[data-style]').forEach((button) => { button.disabled = true; });
  try {
    const context = await resolveViewContext({
      mode: requestedMode,
      previewRevision: requestedRevision,
      readJSON: (url) => getJSON(url, request.signal),
      readOptionalJSON: (url) => getJSON(url, request.signal, { optional: true }),
    });
    if (request.signal.aborted) return;
    viewContext = context;
    catalog = context.catalog;
    renderViewContext(context);
    renderTrials(context, request.signal);
    poller.setScope(context.statusURL, context.kind === 'baseline' ? null : context.revision,
      '新版の公開ポインターがありません。表示はPhase1の選択済み基準形状であり、新しい接合部の最新性・実機状態は未確認です。');
    renderGallery(catalog, selectCandidate, context);
    const requested = new URLSearchParams(window.location.search).get('candidate');
    const initial = catalog.candidates.find((entry) => entry.id === rememberedId)
      ?? catalog.candidates.find((entry) => entry.id === requested)
      ?? (context.kind === 'phase1' ? catalog.candidates.find((entry) => entry.character === 'mona' && entry.style === 'balanced') : null)
      ?? catalog.candidates[0];
    await selectCandidate(initial.id);
  } catch (error) {
    if (request.signal.aborted) return;
    poller.setScope(null, null, `表示対象の版を確認できません。データが最新であるとは判断できません。${error.message}`);
    catalogError(`選択記録またはカタログを読み込めません。${error.message}`, loadCatalog);
    setStageMessage('生成済みデータが必要です', '選択記録・公開カタログ・実際の部品形状を確認してください。過去のデータを新版として表示せず、ダミーモデルは表示しません。', true);
    $('#candidate-title').textContent = 'モデル未読込';
    $('#candidate-kicker').textContent = 'ARCHIVE DATA UNAVAILABLE';
    $('#candidate-id').textContent = '—';
    $('#gallery').replaceChildren(element('p', 'section-empty', '比較データを読み込めないため、外観や部品数は表示していません。'));
    $('#downloads').replaceChildren(element('p', 'section-empty', '生成済みのカタログを確認後、実在するファイルのみ取得できます。'));
    $('#revision-title').textContent = '表示対象の版を確認できません';
    $('#revision-detail').textContent = error.message;
    $('#trial-summary').textContent = '公開版を確認できないため、過去の試験片を新版として表示しません。';
    $('#contact-sheet-link').replaceChildren();
  }
}

$$('button[data-character]').forEach((button) => button.addEventListener('click', () => {
  const options = catalog?.candidates.filter((entry) => entry.character === button.dataset.character) ?? [];
  const next = options.find((entry) => entry.style === candidate?.style) ?? options[0];
  if (next) selectCandidate(next.id);
}));
$$('button[data-style]').forEach((button) => button.addEventListener('click', () => {
  const next = catalog?.candidates.find((entry) => entry.character === candidate?.character && entry.style === button.dataset.style);
  if (next) selectCandidate(next.id);
}));
$$('[data-view]').forEach((button) => button.addEventListener('click', () => studio?.setView(button.dataset.view)));
$('#reset-view').addEventListener('click', () => studio?.setView('perspective'));
$('#explode').addEventListener('input', (event) => { progress.explosion = Number(event.target.value) / 100; updateProgress(); });
$('#layers').addEventListener('input', (event) => { progress.layers = Number(event.target.value); updateProgress(); });
$('#steps').addEventListener('input', (event) => { progress.steps = Number(event.target.value); updateProgress(); });
$('#previous-step').addEventListener('click', () => { progress.steps = Math.max(0, progress.steps - 1); updateProgress(); });
$('#next-step').addEventListener('click', () => { progress.steps = Math.min(index.steps.length, progress.steps + 1); updateProgress(); });
$('#show-complete').addEventListener('click', () => {
  progress = { explosion: 0, layers: index.layers.length, steps: index.steps.length };
  updateProgress();
  announce('完成形のすべてのブリックを表示しました。');
});
$('#clear-selection').addEventListener('click', () => selectPart(null));
$('#focus-part').addEventListener('click', () => studio?.focusPart());
$('#retry-model').addEventListener('click', () => {
  if (studio && !studioAvailable) { studio.dispose(); studio = null; }
  loadCatalog(candidate?.id);
});
window.addEventListener('pagehide', () => {
  candidateRequest?.abort();
  catalogRequest?.abort();
  poller.dispose();
  studio?.dispose();
});
window.addEventListener('pageshow', (event) => {
  if (event.persisted) window.location.reload();
});

loadCatalog();
