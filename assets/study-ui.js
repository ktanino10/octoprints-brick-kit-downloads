import { assetURL, numberLocale } from './i18n.js';

export const comparisonKinds = Object.freeze({ shape: '形の比較', face: '顔の拡大', scale: '実寸比' });
export const comparisonViews = Object.freeze({ front: '正面', 'three-quarter': '斜め（3/4）' });
export const comparisonRules = Object.freeze({
  shape: '画面上の高さをそろえた形の比較です。実寸比ではありません。大きく表示したことを再現度の向上と扱いません。',
  face: '同じ顔領域を切り出した拡大比較です。完成サイズやブロックの実寸比を示す画像ではありません。',
  scale: '全モデルを同じpx/mmで表示した実寸比です。大きく見えることと、顔・体形・丸みが似ていることは別です。',
});
export const formatStudyNumber = (value, digits = 2) =>
  new Intl.NumberFormat(numberLocale(), { maximumFractionDigits: digits }).format(value);

export function studyElement(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = String(text);
  if (className) node.className = className;
  return node;
}

export function studyImage(image, caption, onError) {
  const link = studyElement('a', undefined, 'image-link');
  link.href = assetURL(image.path);
  link.dataset.lightbox = '';
  link.dataset.caption = caption;
  const img = studyElement('img');
  img.src = link.href;
  img.alt = caption;
  img.width = image.width;
  img.height = image.height;
  img.addEventListener('error', () => onError(image));
  link.append(img, studyElement('span', '画像を拡大 ＋', 'zoom-hint'));
  return link;
}

export function studyVideo(url, label, onError) {
  const video = studyElement('video');
  video.controls = true;
  video.playsInline = true;
  video.preload = 'none';
  video.setAttribute('aria-label', label);
  const source = studyElement('source');
  source.type = 'video/mp4';
  source.src = url;
  source.addEventListener('error', onError);
  video.addEventListener('error', onError);
  video.append(source);
  return video;
}

export function renderStudyPanels({ host, comparison, study, roles, names, captionFor, onError }) {
  host.replaceChildren();
  host.classList.toggle('mona-image-grid', comparison.kind !== 'scale');
  if (comparison.kind === 'scale') {
    const figure = studyElement('figure', undefined, 'mona-scale-sheet');
    figure.append(studyImage(comparison.sheet,
      `${comparisonKinds.scale} · ${comparisonViews[comparison.view]} · ${study.study_id}`, onError),
    studyElement('figcaption', comparison.method_note));
    host.append(figure);
    return;
  }
  for (const role of roles) {
    const row = study.rows.find((item) => item.role === role);
    const image = comparison.images.find((item) => item.role === role);
    const figure = studyElement('figure', undefined, 'mona-image-card');
    figure.dataset.role = role;
    figure.dataset.candidate = row.candidate_id;
    figure.append(studyElement('h3', names[role]),
      studyImage(image, `${names[role]} · ${comparisonKinds[comparison.kind]} · ${comparisonViews[comparison.view]}`, onError),
      studyElement('figcaption', captionFor(row)));
    host.append(figure);
  }
}
