import { assetURL, setLanguageContext } from '../../assets/i18n.js';
import { getJSON as readJSON } from './network.js';
import {
  DENSITY_POINTER, validateDensityPointer, validateDensityCatalog, densityAssert as check, densityDeliveryStatus, allDensityCases,
} from '../../assets/density-data.js';
import { studyElement as element, formatStudyNumber as number, studyVideo } from '../../assets/study-ui.js';
import { verifiedJSON, loadNativeLibraries } from './density-assets.js';
import {
  validateGuideManifest, guideIndex, AssemblyPlayback, courseBoundary, stageRange,
  samePartDestinations, searchGuideParts, sortedBOM,
} from './density-state.js';
import { DensityStudio } from './density-studio.js';
import { DensityPartPreview } from './density-part-preview.js';
import { readDensityView, writeDensityView } from './density-view-state.js';

const $ = (selector) => document.querySelector(selector);
let catalog = null, candidate = null, manifest = null, index = null, studio = null, preview = null;
let progress = { mode: 'assembled', steps: 0, explosion: 0 };
let selected = null, playback = null, request = null, generation = 0, animationFrame = null, page = 0;
let pendingExplosionFrame = null, pendingExplosion = 0;
let lastSaved = 0;
const originalParams = new URLSearchParams(location.search);
Object.defineProperty(window, '__densityGuide', { value: Object.freeze({
  diagnostics: () => studio?.diagnostics() ?? { ready: false },
}) });

function showError(error) {
  $('#guide-error').hidden = false;
  $('#guide-error').textContent = typeof error === 'string' ? error : error.message;
}
function downloadURL(file) {
  return file.url?.startsWith('https://') ? file.url : assetURL(file.path ?? file.url);
}
function link(file, label) {
  const node = element('a', file.member_path ? `${label}（ZIP内：${file.member_path}）` : label);
  node.href = downloadURL(file);
  return node;
}
function setEnabled(ready) {
  document.querySelectorAll('[data-guide-action],#guide-mode,#guide-explode,#guide-step,#guide-speed,#guide-stage,#guide-search,#guide-same,#guide-prev,#guide-next')
    .forEach((node) => { node.disabled = !ready; });
}
function writeURL(url = new URL(location.href)) {
  if (!candidate) return url;
  if (!manifest) {
    const pending = new URL(url);
    pending.search = '';
    pending.searchParams.set('case', candidate.id);
    return pending;
  }
  return writeDensityView(url, {
    candidate: candidate.id, ...progress, part: selected?.id ?? null,
    query: $('#guide-search').value, same: $('#guide-same').checked,
    camera: studio ? [...studio.camera.position.toArray(), ...studio.controls.target.toArray()] : null,
  });
}
setLanguageContext(writeURL);
function saveView() {
  if (!manifest) return;
  const now = performance.now();
  if (playback?.playing && now - lastSaved < 250) return;
  lastSaved = now;
  history.replaceState(history.state, '', writeURL());
}
function stopPlayback() {
  playback?.pause();
  if (animationFrame !== null) cancelAnimationFrame(animationFrame);
  animationFrame = null;
  $('#guide-play').setAttribute('aria-pressed', 'false');
  studio?.showMovingPart(null, 0);
  saveView();
}
function updateProgress() {
  if (!manifest) return;
  const count = progress.mode === 'assembly' ? progress.steps : manifest.parts.length;
  studio?.setProgress(progress);
  $('#guide-mode').value = progress.mode;
  $('#guide-step').value = String(progress.steps);
  $('#guide-explode').value = String(Math.round(progress.explosion * 100));
  $('#guide-explode').disabled = progress.mode !== 'radial';
  $('#guide-step').disabled = progress.mode !== 'assembly';
  $('#guide-progress').textContent = `${number(count, 0)} / ${number(manifest.parts.length, 0)}部品`;
  $('#guide-empty').hidden = count !== 0;
  $('#guide-empty').textContent = manifest.aids.length
    ? '本体部品は0個です。仮支持台は別の準備物として表示し、本体個数には含めません。'
    : 'まだ何も配置していません。次の部品から底側の組立を始めます。';
  const active = progress.mode === 'assembly' ? index.ordered[progress.steps] ?? null : null;
  $('#guide-active').textContent = active ? `${active.id} · ${active.type_id} · ${manifest.palette[active.color_id].name}`
    : count === manifest.parts.length ? '全IDを表示中（実物組立の承認ではありません）' : '次に配置する部品を確認してください。';
  $('#guide-current-course').textContent = active ? `次：配置層 ${active.assembly_course} / 底面Z ${number(active.position_mm[2])} mm` : '';
  $('#guide-required-aids').textContent = active?.required_aids.length
    ? `先に置く仮支持台：${active.required_aids.join(', ')}。実保持力を確認する前に撤去しないでください。` : '';
  const parts = active ? manifest.types[active.type_id].files ?? {} : {};
  $('#guide-active-files').replaceChildren(...Object.entries(parts).map(([format, file]) => link(file, `${format.toUpperCase()} ↗`)));
  saveView();
}
function setMode(mode) {
  stopPlayback();
  progress.mode = mode;
  progress.explosion = mode === 'radial' ? 0.35 : 0;
  if (mode === 'assembly') {
    progress.steps = 0;
    playback.seek(0);
  }
  updateProgress();
  studio?.setView('perspective');
}
function tick(now) {
  animationFrame = null;
  if (!playback?.playing) return;
  const active = playback.tick(now);
  if (active) {
    studio?.showMovingPart(index.ordered[playback.count] ?? null, playback.credit);
    animationFrame = requestAnimationFrame(tick);
  } else stopPlayback();
}
function play(start = progress.steps, end = manifest.parts.length) {
  stopPlayback();
  progress.mode = 'assembly';
  progress.explosion = 0;
  playback.rate = Number($('#guide-speed').value);
  playback.play(start === end ? 0 : start, end);
  $('#guide-play').setAttribute('aria-pressed', 'true');
  animationFrame = requestAnimationFrame(tick);
}
function selectPart(id) {
  if (id !== null) check(index?.byId.has(id), '選択した部品IDが実モデルに存在しません。');
  selected = id === null ? null : index.byId.get(id);
  studio?.select(selected);
  $('#guide-selection').replaceChildren();
  if (!selected) {
    preview?.clear();
    $('#guide-selection').append(element('p', '一覧または3Dモデルから部品を選択してください。'));
    renderParts(); saveView(); return;
  }
  const type = manifest.types[selected.type_id];
  const title = element('strong', selected.id);
  const same = samePartDestinations(index, selected);
  $('#guide-selection').append(title,
    element('p', `${selected.type_id} · ${manifest.palette[selected.color_id].name}`),
    element('p', `位置 ${selected.position_mm.map((value) => number(value, 3)).join(' / ')} mm · 工程 ${selected.step}`),
    element('p', `同じ型・同じ色の配置先：${number(same.length, 0)}個`));
  if (selected.required_aids.length) $('#guide-selection').append(element('p',
    `先に置く仮支持台：${selected.required_aids.join(', ')}。実保持力を確認する前に撤去しないでください。`));
  for (const [format, file] of Object.entries(type.files ?? {})) $('#guide-selection').append(link(file, `${format.toUpperCase()} ↗`));
  const print = selected.print_map;
  if (print) $('#guide-selection').append(element('p', `印刷配置：${print.plate_id} / slot ${print.slot_id}`));
  else $('#guide-selection').append(element('p', '印刷プレート・slot対応は未生成です。型・色・実組立IDから確認してください。', 'quiet'));
  if (studio) {
    if (!preview) preview = new DensityPartPreview($('#guide-part-preview'));
    preview.show(studio.geometryFor(selected.type_id), manifest.palette[selected.color_id].hex);
  }
  renderParts(); saveView();
}
function renderParts() {
  if (!index) return;
  const result = searchGuideParts(index, $('#guide-search').value, {
    sameAs: $('#guide-same').checked ? selected : null, page, size: 24,
  });
  page = result.page;
  const host = $('#guide-parts');
  host.replaceChildren();
  for (const part of result.parts) {
    const row = element('tr');
    const cell = element('td');
    const button = element('button', part.id);
    button.type = 'button';
    button.setAttribute('aria-pressed', String(selected?.id === part.id));
    button.addEventListener('click', () => selectPart(part.id));
    cell.append(button);
    row.append(cell, element('td', part.type_id), element('td', manifest.palette[part.color_id].name),
      element('td', String(part.step)), element('td', number(part.position_mm[2])));
    host.append(row);
  }
  if (!result.total) {
    const row = element('tr'), cell = element('td', '一致する実部品がありません。検索条件を減らしてください。');
    cell.colSpan = 5; row.append(cell); host.append(row);
  }
  $('#guide-list-count').textContent = `${number(result.total, 0)}部品 · ${page + 1} / ${result.pages}`;
  $('#guide-prev').disabled = page === 0;
  $('#guide-next').disabled = page + 1 >= result.pages;
}
function renderBOM() {
  const host = $('#guide-bom');
  host.replaceChildren();
  for (const group of sortedBOM(index)) {
    const row = element('tr');
    const cell = element('td'), button = element('button', group.typeId);
    button.type = 'button';
    button.addEventListener('click', () => { $('#guide-same').checked = true; page = 0; selectPart(group.parts[0].id); });
    cell.append(button);
    row.append(cell, element('td', manifest.palette[group.colorId].name), element('td', number(group.parts.length, 0)));
    host.append(row);
  }
}
function renderDownloads() {
  const host = $('#guide-downloads');
  host.replaceChildren();
  const mediaGeneration = generation;
  for (const [key, label] of [['cg', 'CG・Blender'], ['native_cad', 'FreeCAD・STEP・STL'], ['assembly', 'BOM・実組立順']]) {
    const section = element('section');
    section.append(element('h3', label));
    for (const file of candidate.assets[key]) {
      section.append(link(file, file.label ?? file.filename ?? '公開ファイルを取得 ↗'),
        element('p', `SHA-256: ${file.sha256}`, 'hash'));
    }
    host.append(section);
  }
  const section = element('section');
  section.append(element('h3', '旋回・放射分解・底から組立の動画'));
  for (const [key, label] of [['turntable', '旋回'], ['radial_explode', '360度放射分解'], ['bottom_up', '底から組立']]) {
    const clip = candidate.assets.animations[key];
    const video = studyVideo(`${downloadURL(clip)}#t=${clip.start_seconds},${clip.end_seconds}`, label,
      () => {
        if (mediaGeneration === generation) showError('公開動画を読み込めません。動画の取得リンクから確認してください。');
      });
    section.append(element('h4', label), video, link(clip, '元の動画を取得 ↗'));
  }
  host.append(section);
}
async function selectCandidate(id, params = null) {
  const item = allDensityCases(catalog).find((entry) => entry.id === id);
  check(item, '指定した倍率案がカタログにありません。');
  request?.abort(); request = new AbortController();
  const current = ++generation, signal = request.signal;
  stopPlayback();
  manifest = null; index = null; selected = null; page = 0;
  $('#density-canvas').dataset.ready = 'false';
  preview?.clear(); studio?.clear(); setEnabled(false);
  candidate = item; $('#guide-case').value = id;
  if (!params) history.replaceState(history.state, '', writeURL());
  $('#guide-error').hidden = true;
  $('#guide-parts').replaceChildren(); $('#guide-bom').replaceChildren(); $('#guide-selection').replaceChildren();
  $('#guide-downloads').querySelectorAll('video').forEach((video) => video.pause());
  $('#guide-downloads').replaceChildren();
  for (const selector of ['#guide-target-status', '#guide-mesh-mode', '#guide-progress', '#guide-active',
    '#guide-current-course', '#guide-required-aids', '#guide-list-count']) $(selector).textContent = '';
  $('#guide-active-files').replaceChildren(); $('#guide-stage').replaceChildren();
  $('#guide-search').value = ''; $('#guide-same').checked = false;
  $('#guide-step').max = '0'; $('#guide-step').value = '0'; $('#guide-explode').value = '0';
  $('#guide-empty').hidden = true;
  $('#guide-case-warning').textContent = '';
  $('#guide-whisker-status').hidden = true;
  $('#guide-loading').hidden = false;
  $('#guide-loading').textContent = '実ID・配置・共有ネイティブ形状を読み込み、ハッシュを照合しています。';
  if (item.state === 'INPUT_WAIT') {
    $('#guide-loading').textContent = 'この案の実データは受領待ちです。旧案や箱の形状では代用しません。';
    history.replaceState(history.state, '', writeURL());
    return;
  }
  try {
    const next = validateGuideManifest(await verifiedJSON(item.manifest, signal), id);
    check(next.metrics.part_count === item.metrics.part_count && next.metrics.unique_types === item.metrics.unique_types,
      'カタログと実3Dの部品数・使用型が一致しません。');
    const libraries = await loadNativeLibraries(next.geometry_files, signal);
    if (current !== generation) return;
    manifest = next; index = guideIndex(next);
    $('#guide-case-warning').textContent = item.tradeoff;
    const whiskerRevisionRequired = densityDeliveryStatus(item) === 'REQUIRES_WHISKER_REVISION';
    $('#guide-whisker-status').hidden = !whiskerRevisionRequired;
    if (whiskerRevisionRequired) $('#guide-whisker-status').textContent =
      '表示中は外付け・組立仮支台が必要な旧Mona設計です。支台を非表示にして新要件達成とは扱いません。ヒゲ支台なしの実改訂を待っており、今回の完了件数から除外しています。';
    $('#guide-target-status').textContent = item.state === 'TARGET_MISSED'
      ? '個数目標の許容差を未達。15案の完成には数えていません。'
      : `目標 ${number(item.target_count, 0)} / 実数 ${number(item.metrics.part_count, 0)} / 実倍率 ${number(item.actual_ratio, 4)}倍`;
    if (!studio) studio = new DensityStudio($('#density-canvas'), {
      onSelect: selectPart, onError: showError, onViewChange: () => { if (manifest) saveView(); },
    });
    studio.load(manifest, libraries, index);
    progress = { mode: 'assembled', steps: manifest.parts.length, explosion: 0 };
    playback = new AssemblyPlayback(manifest.parts.length, (steps) => {
      progress.steps = steps; updateProgress();
    });
    $('#guide-step').max = String(manifest.parts.length);
    $('#guide-stage').replaceChildren(...index.stages.map((stage) => {
      const option = element('option', stage.label); option.value = stage.id; return option;
    }));
    $('#guide-mesh-mode').textContent = libraries.mode === 'NATIVE_PREVIEW_TESSELLATION'
      ? '軽量ネイティブ近似メッシュ表示。分割数・精度の違いは公開記録を参照し、詳細な原形はCADから確認してください。'
      : '実ネイティブ由来の頂点・面を表示。座標はブラウザーのFloat32表現です。';
    $('#guide-search').value = ''; $('#guide-same').checked = false;
    setEnabled(true);
    if (params) {
      const state = readDensityView(params, index);
      progress = { mode: state.mode, steps: state.steps, explosion: state.explosion };
      $('#guide-search').value = state.query; $('#guide-same').checked = state.same;
      updateProgress();
      if (state.camera) {
        studio.camera.position.fromArray(state.camera.slice(0, 3));
        studio.controls.target.fromArray(state.camera.slice(3)); studio.controls.update(); studio.requestRender();
      }
      if (state.part) selectPart(state.part);
    } else updateProgress();
    renderBOM(); renderDownloads();
    renderParts();
    $('#guide-loading').hidden = true;
    $('#density-canvas').dataset.ready = 'true';
    saveView();
  } catch (error) {
    if (signal.aborted || current !== generation) return;
    setEnabled(false); showError(error); $('#density-canvas').dataset.ready = 'false';
    $('#guide-loading').hidden = true;
  }
}

$('#guide-case').addEventListener('change', () => selectCandidate($('#guide-case').value).catch(showError));
$('#guide-mode').addEventListener('change', () => setMode($('#guide-mode').value));
$('#guide-explode').addEventListener('input', () => {
  pendingExplosion = Number($('#guide-explode').value) / 100;
  if (pendingExplosionFrame !== null) return;
  pendingExplosionFrame = requestAnimationFrame(() => {
    pendingExplosionFrame = null; progress.explosion = pendingExplosion; updateProgress();
  });
});
$('#guide-step').addEventListener('input', () => { stopPlayback(); playback.seek(Number($('#guide-step').value)); });
$('#guide-search').addEventListener('input', () => { page = 0; renderParts(); saveView(); });
$('#guide-same').addEventListener('change', () => { page = 0; renderParts(); saveView(); });
$('#guide-prev').addEventListener('click', () => { page--; renderParts(); });
$('#guide-next').addEventListener('click', () => { page++; renderParts(); });
$('#guide-speed').addEventListener('change', () => { if (playback) playback.rate = Number($('#guide-speed').value); });
document.querySelectorAll('[data-guide-action]').forEach((button) => button.addEventListener('click', () => {
  if (!manifest) return;
  const action = button.dataset.guideAction;
  if (action.startsWith('view:')) { studio.setView(action.slice(5)); saveView(); return; }
  if (action === 'focus') { studio.focusPart(); saveView(); return; }
  if (action === 'part-top' || action === 'part-bottom') { preview?.view(action === 'part-bottom' ? 'underside' : 'front'); return; }
  if (action === 'play') { playback.playing ? stopPlayback() : play(); return; }
  if (action === 'replay') { play(0); return; }
  if (action === 'stage') { const [start, end] = stageRange(index, $('#guide-stage').value); play(start, end); return; }
  stopPlayback(); progress.mode = 'assembly'; progress.explosion = 0;
  if (action === 'empty') playback.seek(0);
  if (action === 'complete') playback.seek(manifest.parts.length);
  if (action === 'part-next') playback.seek(Math.min(manifest.parts.length, progress.steps + 1));
  if (action === 'part-prev') playback.seek(Math.max(0, progress.steps - 1));
  if (action === 'course-next') playback.seek(courseBoundary(index, progress.steps, 1));
  if (action === 'course-prev') playback.seek(courseBoundary(index, progress.steps, -1));
}));
document.addEventListener('visibilitychange', () => { if (document.hidden) stopPlayback(); });
window.addEventListener('pagehide', stopPlayback);
window.addEventListener('popstate', () => {
  if (!catalog) return;
  const params = new URLSearchParams(location.search);
  const id = params.get('case');
  if (id && id !== candidate?.id) selectCandidate(id, params).catch(showError);
  else if (index) {
    try {
      stopPlayback();
      const state = readDensityView(params, index);
      progress = { mode: state.mode, steps: state.steps, explosion: state.explosion };
      $('#guide-search').value = state.query; $('#guide-same').checked = state.same;
      updateProgress(); selectPart(state.part);
      if (state.camera) {
        studio.camera.position.fromArray(state.camera.slice(0, 3));
        studio.controls.target.fromArray(state.camera.slice(3)); studio.controls.update(); studio.requestRender();
      }
    } catch (error) { showError(error); }
  }
});

try {
  setEnabled(false);
  const pointer = validateDensityPointer(await readJSON(DENSITY_POINTER));
  if (pointer.state === 'INPUT_WAIT') {
    $('#guide-loading').textContent = '15案の実ネイティブ形状・順序・動画を受領待ちです。表示用の仮モデルは作成していません。';
  } else {
    catalog = validateDensityCatalog(await verifiedJSON(pointer.catalog), pointer);
    $('#guide-case').replaceChildren(...allDensityCases(catalog).map((item) => {
      const historical = (catalog.historical_cases ?? []).some((old) => old.id === item.id);
      const label = historical ? `${item.id} · 履歴 · ${number(item.metrics.part_count, 0)}部品`
        : `${item.id} · ${item.state === 'INPUT_WAIT' ? '入力待ち' : `${number(item.metrics.part_count, 0)}部品`}`;
      const option = element('option', label);
      option.value = item.id; return option;
    }));
    const id = originalParams.get('case') ?? catalog.cases.find((item) => item.state === 'READY')?.id;
    check(id, '実3Dを開ける完成案は、まだありません。');
    $('#guide-case').disabled = false;
    await selectCandidate(id, originalParams);
  }
} catch (error) { showError(error); }
