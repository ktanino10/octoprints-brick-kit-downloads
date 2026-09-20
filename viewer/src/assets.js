import { CHARACTERS, STYLES, artifactPath, downloadEntries } from './data.js';
import { $, $$, element, number, setPressed } from './dom.js';
import { fileExists } from './network.js';
import { publicURL } from './paths.js';

function placeholderIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 32 32');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M5 7h22v18H5ZM8 21l6-6 4 4 3-3 4 5M22 12h.01');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.4');
  path.setAttribute('stroke-linecap', 'round');
  svg.append(path);
  return svg;
}

export function renderGallery(catalog, onSelect, context = { kind: 'phase1' }) {
  const gallery = $('#gallery');
  const history = context.kind === 'phase1';
  const common = context.kind === 'common';
  gallery.replaceChildren();
  gallery.classList.toggle('selected-gallery', !history);
  $('#comparison-title').textContent = common ? '8 mm共通ブロック・同じ版の3体。' : history ? `${catalog.candidates.length}つの案、同じ目線で。`
    : context.kind === 'baseline' ? '選択済み3案の外観基準（旧形状）。' : '選択済み3案の接合部試作。';
  for (const [character, info] of Object.entries(CHARACTERS)) {
    const row = element('div', history ? 'gallery-row' : 'selected-gallery-item');
    const heading = element('div', 'gallery-row-heading');
    const dot = element('i', `character-dot ${character}-dot`);
    dot.setAttribute('aria-hidden', 'true');
    heading.append(dot, element('h3', '', info.name), element('span', '', `${info.short} / 約180 mm`));
    row.append(heading);
    for (const [style, styleInfo] of Object.entries(STYLES)) {
      if (history && style === 'practical8') continue;
      const candidate = catalog.candidates.find((entry) => entry.character === character && entry.style === style);
      if (!candidate) {
        if (!history) continue;
        const missing = element('div', 'gallery-unavailable', `${styleInfo.name}：未生成`);
        row.append(missing);
        continue;
      }
      const button = element('button', 'gallery-card');
      button.type = 'button';
      button.dataset.candidate = candidate.id;
      button.setAttribute('aria-pressed', 'false');
      const scope = common ? `${catalog.revision}の共通ブロック試作` : context.kind === 'baseline' ? 'Phase1外観基準・旧形状' : history ? 'Phase1履歴'
        : `${catalog.revision}の接合部試作${context.kind === 'preview' ? '・版指定プレビュー' : ''}`;
      button.setAttribute('aria-label', `${info.name}・${styleInfo.name}、${number(candidate.metrics.part_count, 0)}個。${scope}をスタジオで表示`);
      const imageContainer = element('span', 'gallery-image');
      const placeholder = element('span', 'image-placeholder');
      const message = element('span', '', 'レンダーを確認中');
      placeholder.append(placeholderIcon(), message, element('small', '', '実際のレンダーができるまで、代替画像は表示しません。'));
      imageContainer.append(placeholder);
      if (candidate.render_url) {
        const image = element('img');
        image.alt = `${info.name}・${styleInfo.name}、${scope}の実生成レンダー`;
        image.loading = 'lazy';
        image.decoding = 'async';
        image.className = 'gallery-preview-pending';
        image.setAttribute('aria-hidden', 'true');
        image.addEventListener('load', () => {
          image.hidden = false;
          image.classList.remove('gallery-preview-pending');
          image.removeAttribute('aria-hidden');
          placeholder.hidden = true;
          button.dataset.renderState = 'available';
        });
        image.addEventListener('error', () => {
          image.hidden = true;
          placeholder.hidden = false;
          message.textContent = 'レンダー未生成・読込不可';
          button.dataset.renderState = 'missing';
        });
        image.src = publicURL(artifactPath(candidate.render_url));
        imageContainer.append(image);
      } else {
        message.textContent = 'レンダー未生成';
        button.dataset.renderState = 'missing';
      }
      imageContainer.append(element('span', 'gallery-selected', '表示中'));
      const meta = element('span', 'gallery-meta');
      const title = element('span', 'gallery-title');
      title.append(element('span', '', styleInfo.name), element('span', '', '↗'));
      const numbers = element('span', 'gallery-numbers');
      const count = element('span');
      count.append(element('strong', '', number(candidate.metrics.part_count, 0)), document.createTextNode('個'));
      numbers.append(count, element('span', '', `${number(candidate.pitch_mm)} mmピッチ`), element('span', '', `${number(candidate.metrics.height_mm)} mm高`));
      const effort = element('span', 'gallery-effort', candidate.metrics.approx_build_hours
        ? `${candidate.metrics.approx_build_hours.map((value) => number(value)).join('–')}時間（推定）`
        : '組立時間は未算定・実物組立は未検証');
      if (style === 'fine') {
        effort.classList.add('fine-effort');
        effort.append(element('span', 'effort-tag', '高工数'));
      }
      meta.append(title, numbers, effort);
      if (!history) meta.append(element('span', 'gallery-scope', scope));
      button.append(imageContainer, meta);
      button.addEventListener('click', () => onSelect(candidate.id, true));
      row.append(button);
    }
    gallery.append(row);
  }
  renderContactSheet(catalog, context);
}

export function markGallerySelection(candidateId) {
  setPressed($$('.gallery-card'), (node) => node.dataset.candidate === candidateId);
}

async function renderContactSheet(catalog, context) {
  const host = $('#contact-sheet-link');
  const pending = element('span', 'small-label', '一覧画像を確認中');
  host.replaceChildren(pending);
  if (!catalog.contact_sheet_url) {
    pending.textContent = '一覧画像は未生成です';
    return;
  }
  const url = artifactPath(catalog.contact_sheet_url);
  if (await fileExists(url)) {
    if (!pending.isConnected) return;
    const link = element('a', 'button secondary', context.kind === 'baseline' ? 'Phase1・9案の基準一覧画像 ↗' : `${catalog.candidates.length}案の一覧画像を開く ↗`);
    link.href = publicURL(url);
    link.target = '_blank';
    link.rel = 'noopener';
    link.setAttribute('aria-label', '実生成のコンタクトシートを新しいタブで開く');
    host.replaceChildren(link);
  } else if (pending.isConnected) {
    pending.textContent = '一覧画像は未生成・読込不可です';
  }
}

function addVideo(url, host, candidate) {
  const details = element('details', 'video-details');
  details.append(element('summary', '', '360°動画をこの画面で見る'));
  const video = element('video');
  video.controls = true;
  video.preload = 'none';
  video.playsInline = true;
  video.setAttribute('aria-label', `${candidate.label ?? `${CHARACTERS[candidate.character].name} ${STYLES[candidate.style].name}`}の360度ターンテーブル`);
  const caption = element('p', 'video-caption', '実生成の動画です。分解・層の操作は動画には反映されません。');
  video.addEventListener('error', () => {
    caption.textContent = '動画を再生できません。ファイルを取得して、対応プレーヤーで確認してください。';
  });
  details.addEventListener('toggle', () => {
    if (details.open && !video.dataset.loaded) {
      video.preload = 'metadata';
      const source = element('source');
      source.type = 'video/mp4';
      source.src = publicURL(url);
      video.append(source);
      video.dataset.loaded = 'true';
      video.load();
    }
    if (!details.open) video.pause();
  });
  details.append(video, caption);
  host.append(details);
}

export async function appendDownload(host, entry, signal) {
  const row = element('div', 'download-row download-pending');
  const pending = element('span', 'download-unavailable');
  pending.append(element('span', '', entry.label), element('small', '', '確認中'));
  row.append(pending);
  host.append(row);
  const available = await fileExists(entry.url, signal);
  if (signal?.aborted || !row.isConnected) return false;
  row.classList.remove('download-pending');
  if (!available) {
    $('small', pending).textContent = '未生成・読込不可';
    row.dataset.available = 'false';
    return false;
  }
  const link = element('a');
  link.href = publicURL(entry.url);
  link.setAttribute('download', '');
  link.append(element('span', '', entry.label), element('span', 'download-extension', entry.extension), element('span', 'download-arrow', '↓'));
  link.setAttribute('aria-label', `${entry.label}を取得（${entry.extension}・検討用）`);
  row.replaceChildren(link);
  row.dataset.available = 'true';
  return true;
}

export async function renderDownloads(catalog, candidate, signal, context = { kind: 'phase1' }) {
  const host = $('#downloads');
  const videoHost = $('#video-preview');
  $('video', videoHost)?.pause();
  videoHost.replaceChildren();
  host.replaceChildren();
  if (context.kind === 'common') {
    const guide = element('a', 'button secondary compact', '日英の組立候補ガイド →');
    guide.href = publicURL(`/assembly.html?revision=${encodeURIComponent(catalog.revision)}&candidate=${encodeURIComponent(candidate.id)}`);
    host.append(guide);
  }
  let entries;
  try {
    entries = downloadEntries(catalog, candidate, { baselineOnly: context.kind === 'baseline' });
  } catch (error) {
    host.append(element('p', 'section-empty', `取得先の定義が不正です。${error.message}`));
    return;
  }
  await Promise.all(entries.map(async (entry) => {
    const available = await appendDownload(host, entry, signal);
    if (available && !signal.aborted && entry.extension === 'MP4') addVideo(entry.url, videoHost, candidate);
  }));
}
