import { assetURL, numberLocale } from './i18n.js';

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

export async function readJSON(path) {
  const response = await fetch(publicURL(path), { credentials: 'omit', signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${path}`);
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

function videoCard(candidate, label) {
  const card = create('figure', 'video-card');
  const video = create('video');
  video.controls = true;
  video.preload = 'none';
  video.playsInline = true;
  video.poster = publicURL(candidate.render_url);
  video.setAttribute('aria-label', `${label} ${names[candidate.character]} ${styles[candidate.style]}の動画`);
  video.dataset.videoUrl = publicURL(candidate.video_url);
  const status = create('p', '', `${label} / ${candidate.pitch_mm} mm / 実生成・無音`);
  video.addEventListener('error', () => {
    status.textContent = '動画を読み込めません。MP4の取得リンクで確認するか、再読み込みしてください。';
    status.setAttribute('role', 'alert');
  });
  const download = create('a', '', 'このMP4を取得 ↓');
  download.href = publicURL(candidate.video_url);
  download.download = '';
  card.append(video, create('h3', '', `${names[candidate.character]} / ${styles[candidate.style]}`), status, download);
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
    const [phase1, current] = await Promise.all([
      readJSON('artifacts/phase1/catalog.json'),
      readJSON('artifacts/selected/r2-20260919/catalog.json'),
    ]);
    renderCandidates(phase1);
    if (current.revision !== 'r2-20260919' || current.candidates.length !== 3) throw new Error('選定版の記録が一致しません。');
    $('#selected-videos').replaceChildren(...current.candidates.map((candidate) => videoCard(candidate, '選定 r2-20260919')));
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
