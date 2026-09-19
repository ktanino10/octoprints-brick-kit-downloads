export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
export const number = (value, digits = 1) => new Intl.NumberFormat('ja-JP', { maximumFractionDigits: digits }).format(value);

export function element(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = String(content);
  return node;
}

export function swatch(hex) {
  const node = element('span', 'swatch');
  node.style.setProperty('--swatch-color', hex);
  node.setAttribute('aria-hidden', 'true');
  return node;
}

export function announce(message) {
  $('#announcer').textContent = message;
}

export function setStageMessage(title, copy, retry = false) {
  $('#stage-message-title').textContent = title;
  $('#stage-message-copy').textContent = copy;
  $('#stage-message').hidden = false;
  $('#retry-model').hidden = !retry;
  $('#height-callout').hidden = true;
  $('#empty-progress').hidden = true;
}

export function setPressed(nodes, predicate) {
  nodes.forEach((node) => node.setAttribute('aria-pressed', String(predicate(node))));
}
