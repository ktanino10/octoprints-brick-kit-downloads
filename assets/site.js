import { assetURL, numberLocale } from './i18n.js';
import { COMMON_REVISION, PUBLICATION_URL, chooseRevision, validatePublication, physicalSummary } from './publication.js';

const $ = (selector) => document.querySelector(selector);
const selected = new Set(['mona-fine', 'copilot-chunky', 'ducky-fine']);
const styles = { chunky: 'A / Chunky', balanced: 'B / Balanced', fine: 'C / Fine' };
const names = { mona: 'Mona', copilot: 'Copilot', ducky: 'Ducky' };
const root = new URL('../', import.meta.url);
const publicURL = (path) => {
  const url = new URL(path.replace(/^\/+/, ''), root);
  if (url.origin !== root.origin || !url.pathname.startsWith(root.pathname)) throw new Error('参照先が公開範囲外です。');
  return url.href;
};
const create = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const number = (n) => n.toLocaleString(numberLocale());

export async function readJSON(path, sha256 = null) {
  const response = await fetch(publicURL(path), { credentials: 'omit', signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${path}`);
  if (sha256 !== null) {
    const buffer = await response.arrayBuffer();
    const actual = [...new Uint8Array(await crypto.subtle.digest('SHA-256', buffer))]
      .map((value) => value.toString(16).padStart(2, '0')).join('');
    if (!/^[0-9a-f]{64}$/.test(sha256) || actual !== sha256) throw new Error('公開カタログの照合ハッシュが一致しません。');
    return JSON.parse(new TextDecoder().decode(buffer));
  }
  return response.json();
}

function imageLink(url, preview, alt, caption) {
  const a = create('a', 'image-link');
  a.href = publicURL(url);
  a.dataset.lightbox = '';
  a.dataset.caption = caption;
  const image = create('img');
  image.src = publicURL(preview);
  image.alt = alt;
  image.width = 640;
  image.height = 640;
  image.loading = 'lazy';
  a.append(image, create('span', 'zoom-hint', '画像を拡大 ＋'));
  return a;
}

function renderCandidates(catalog) {
  const host = $('#candidate-matrix');
  host.replaceChildren();
  if (catalog.candidates.length !== 9) throw new Error('Phase1は9案の記録が必要です。');
  for (const [character, name] of Object.entries(names)) {
    const row = create('section', 'matrix-row');
    row.append(create('h3', '', name));
    const grid = create('div', 'candidate-grid');
    for (const style of Object.keys(styles)) {
      const candidate = catalog.candidates.find((entry) => entry.id === `${character}-${style}`);
      if (!candidate) throw new Error(`候補が見つかりません: ${character}-${style}`);
      const card = create('article', 'candidate-card');
      card.dataset.candidate = candidate.id;
      const count = number(candidate.metrics.part_count);
      card.append(imageLink(candidate.render_url, `assets/thumbs/phase1-${candidate.id}.webp`,
        `${name} ${styles[style]}、Phase1当時の実生成画像`,
        `Phase1履歴 · ${name} ${styles[style]} · ${count}部品 / ${candidate.metrics.height_mm} mm。物理嵌合は未検証。`));
      const info = create('div', 'candidate-info');
      const heading = create('h4', '', styles[style]);
      if (selected.has(candidate.id)) heading.append(create('span', '', '外観を選定'));
      const amount = create('p');
      amount.append(create('strong', '', count), document.createTextNode(' 部品'));
      const viewer = create('a', '', '当時の形状を3Dで見る ↗');
      viewer.href = publicURL(`viewer/?mode=phase1&candidate=${candidate.id}`);
      info.append(heading, amount,
        create('p', '', `${candidate.pitch_mm} mmピッチ / ${candidate.metrics.height_mm} mm高`), viewer);
      card.append(info);
      grid.append(card);
    }
    row.append(grid);
    host.append(row);
  }
}

function videoCard(candidate, label, common = false) {
  const card = create('figure', 'video-card');
  const video = create('video');
  video.controls = true;
  video.preload = 'none';
  video.playsInline = true;
  video.poster = publicURL(candidate.render_url);
  const style = common ? '8 mm共通ブロック' : styles[candidate.style];
  video.setAttribute('aria-label', `${label} ${names[candidate.character]} ${style}の動画`);
  video.dataset.videoUrl = publicURL(candidate.video_url);
  const status = create('p', '', `${label} / ${candidate.pitch_mm} mm / 実生成・無音`);
  video.addEventListener('error', () => {
    status.textContent = '動画を読み込めません。MP4の取得リンクで確認するか、再読み込みしてください。';
    status.setAttribute('role', 'alert');
  });
  const download = create('a', '', 'このMP4を取得 ↓');
  download.href = publicURL(candidate.video_url);
  download.download = '';
  card.append(video, create('h3', '', `${names[candidate.character]} / ${style}`), status, download);
  return card;
}

function initializeVideoDisclosures() {
  document.querySelectorAll('.media-disclosure').forEach((details) => {
    details.addEventListener('toggle', () => {
      details.querySelectorAll('video').forEach((video) => {
        if (details.open && !video.querySelector('source') && video.dataset.videoUrl) {
          const source = create('source');
          source.src = assetURL(video.dataset.videoUrl);
          source.type = 'video/mp4';
          video.preload = 'metadata';
          video.append(source);
          video.load();
        } else if (!details.open) video.pause();
      });
    });
  });
}

function initializeLightbox() {
  const dialog = $('#image-dialog');
  if (!dialog) return;
  const image = dialog.querySelector('img');
  const status = dialog.querySelector('p');
  image.addEventListener('error', () => { status.textContent = '画像を読み込めません。元の画像リンクで確認するか、再読み込みしてください。'; });
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-lightbox]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    image.src = link.href;
    image.alt = link.querySelector('img').alt;
    status.textContent = link.dataset.caption;
    dialog.querySelector('a').href = link.href;
    dialog.showModal();
  });
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
}

async function loadMedia() {
  try {
    const phase1 = await readJSON('artifacts/phase1/catalog.json');
    renderCandidates(phase1);
    $('#history-videos').replaceChildren(...phase1.candidates.filter((candidate) => candidate.style === 'balanced').map((candidate) => videoCard(candidate, 'Phase1・Balanced履歴')));
  } catch (error) {
    const host = $('#media-error');
    host.hidden = false;
    host.textContent = `比較・動画の記録を読み込めません。${error.message} `;
    const retry = create('a', '', 'ページを再読み込み');
    retry.href = location.href;
    host.append(retry);
    $('#candidate-matrix').replaceChildren(create('p', '', '画像や数値を代替データで表示していません。静的ギャラリーでも確認できます。'));
  }
}

function pendingRevision(entry) {
  const note = create('div', 'revision-wait');
  note.dataset.availability = 'INPUT_WAIT';
  note.append(create('p', 'eyebrow', entry.id), create('h2', '', '8 mm共通ブロックの制作データを受領待ちです。'),
    create('p', '', '設計改訂の実装は承認済みです。実際のCAD・画像・動画がそろうまで、新しい形状や部品数は表示しません。'));
  const history = create('a', 'text-link', '旧r2の保存済みモデルを見る →');
  history.href = publicURL('viewer/?mode=r2');
  note.append(history);
  $('#current-specimens').replaceChildren(note);
  $('#current-summary').textContent = physicalSummary(entry);
  $('#selected-videos')?.replaceChildren(create('p', 'quiet', '新版の動画は公開用ファイルの受領待ちです。旧版の動画で代用しません。'));
}

async function loadCurrentModels() {
  try {
    const publication = validatePublication(await readJSON(PUBLICATION_URL));
    const planned = publication.revisions.find((entry) => entry.id === COMMON_REVISION);
    if (planned?.availability === 'INPUT_WAIT') {
      pendingRevision(planned);
      return;
    }
    const entry = chooseRevision(publication);
    if (entry.generation !== 'common-blocks') throw new Error('現行の共通ブロック版が公開記録にありません。');
    const catalog = await readJSON(entry.catalog_url, entry.catalog_sha256);
    if (catalog.schema_version !== 3 || catalog.revision !== entry.id
      || !Array.isArray(catalog.candidates) || catalog.candidates.length !== 3
      || new Set(catalog.candidates.map((item) => item.character)).size !== 3
      || catalog.candidates.some((item) => !names[item.character] || !item.render_url || !item.video_url
        || !Number.isSafeInteger(item.metrics?.part_count) || item.metrics.part_count <= 0
        || !Number.isFinite(item.metrics.height_mm) || item.metrics.height_mm <= 0)) {
      throw new Error('現行3体の実画像・動画・部品数・寸法が一致しません。');
    }
    const host = $('#current-specimens');
    host.replaceChildren();
    let total = 0;
    for (const candidate of catalog.candidates) {
      total += candidate.metrics.part_count;
      const card = create('article', `specimen ${candidate.character}`);
      card.dataset.candidate = candidate.id;
      card.dataset.revision = entry.id;
      const heading = create('div', 'specimen-top');
      heading.append(create('span', '', names[candidate.character].toUpperCase()), create('span', '', '8 mm / COMMON'));
      card.append(heading, imageLink(candidate.render_url, candidate.thumbnail_url ?? candidate.render_url,
        `${names[candidate.character]}・8 mm共通ブロックの実生成画像`,
        `${entry.id} · ${names[candidate.character]} · ${number(candidate.metrics.part_count)}部品 / ${candidate.metrics.height_mm} mm。実物嵌合・保持力は未検証。`));
      const title = create('h2', '', names[candidate.character]);
      title.append(create('small', '', '8 mm共通ブロック'));
      const count = create('p');
      count.append(create('strong', '', number(candidate.metrics.part_count)), document.createTextNode(' 部品 '),
        create('span', '', `${candidate.metrics.height_mm} mm`));
      const link = create('a', 'specimen-link', '組立候補・部品IDを見る ↗');
      link.href = publicURL(`viewer/?revision=${encodeURIComponent(entry.id)}&candidate=${encodeURIComponent(candidate.id)}`);
      card.append(title, count, link);
      host.append(card);
      if ($('#current-exploded') && candidate.exploded_render_url) {
        const figure = create('figure', 'video-card');
        figure.append(imageLink(candidate.exploded_render_url, candidate.exploded_render_url,
          `${names[candidate.character]}・同じ版の分解画像`, `${entry.id} · ${names[candidate.character]} · 分解表示`),
        create('h3', '', names[candidate.character]));
        $('#current-exploded').append(figure);
      }
    }
    $('#current-summary').textContent = `${entry.id} · 合計${number(total)}部品。${physicalSummary(entry)}`;
    $('#selected-videos')?.replaceChildren(...catalog.candidates.map((candidate) => videoCard(candidate, entry.id, true)));
  } catch (error) {
    $('#current-error').hidden = false;
    $('#current-error').textContent = `現行版の公開記録を読み込めません。${error.message}`;
    $('#current-specimens').replaceChildren(create('p', 'loading', '公開版の確認ができないため、別の版の画像や部品数は表示しません。'));
    $('#current-summary').textContent = '公開状態は不明です。全数印刷は保留します。';
  }
}

function renderPhotos() {
  const host = $('#photo-grid');
  if (!host) return;
  for (let i = 1; i <= 10; i += 1) {
    const number = String(i).padStart(2, '0');
    const path = `feedback/2026-09-19/media/photo-${number}.jpg`;
    const figure = create('figure');
    figure.append(imageLink(path, path, `提供された実物試作の写真${number}`,
      `実物試作・写真${number} / 2026-09-19公開。番号はノッチや試験条件を意味しません。権利は提供者に帰属。`),
    create('figcaption', '', `写真 ${number} / 初回試作の記録`));
    host.append(figure);
  }
}

initializeLightbox();
initializeVideoDisclosures();
renderPhotos();
if ($('#candidate-matrix')) loadMedia();
if ($('#current-specimens')) loadCurrentModels();
