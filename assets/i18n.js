import catalog from './translations.js';
import { characterDisplayText } from './character-names.js';

const japanese = /[\u3040-\u30ff\u3400-\u9fff]/;
const normalize = (value) => String(value).replace(/\s+/g, ' ').trim();
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const attributes = ['alt', 'title', 'placeholder', 'aria-label', 'aria-valuetext', 'data-caption', 'content'];
const cache = new Map();
const rules = Object.entries(catalog.messages).filter(([key]) => /\{\d+\}/.test(key)).map(([source, target]) => {
  const positions = [];
  let cursor = 0;
  let expression = '';
  for (const match of source.matchAll(/\{(\d+)\}/g)) {
    expression += escapeRegex(source.slice(cursor, match.index)) + '([\\s\\S]*?)';
    positions.push(match[1]);
    cursor = match.index + match[0].length;
  }
  expression += escapeRegex(source.slice(cursor));
  return { source, target, positions, expression, regex: new RegExp(`^${expression}$`),
    weight: source.replace(/\{\d+\}/g, '').length };
}).sort((a, b) => b.weight - a.weight);
const literals = Object.entries(catalog.messages).filter(([key]) => !/\{\d+\}/.test(key))
  .sort(([a], [b]) => b.length - a.length);

export class MissingTranslationError extends Error {
  constructor(source) {
    super(`Missing English translation for a visible message: ${source}`);
    this.name = 'MissingTranslationError';
    this.source = source;
  }
}

export function validateLocale(value) {
  if (!['ja', 'en'].includes(value)) throw new RangeError(`Unsupported language: ${value}`);
  return value;
}

export function interpolate(template, values) {
  return template.replace(/\{(\d+)\}/g, (_, key) => {
    if (!Object.hasOwn(values, key)) throw new Error(`Missing interpolation argument: ${key}`);
    return String(values[key]);
  });
}

function renderRule(rule, match, depth) {
  const values = {};
  rule.positions.forEach((position, index) => { values[position] = translateFragment(match[index + 1], depth + 1); });
  return interpolate(rule.target, values);
}

function translateFragment(value, depth = 0) {
  if (!japanese.test(value)) return value;
  const source = normalize(value);
  if (Object.hasOwn(catalog.messages, source)) return catalog.messages[source];
  if (depth > 12) throw new MissingTranslationError(source);
  for (const rule of rules) {
    const match = source.match(rule.regex);
    if (!match || match.slice(1).some((part) => part === source)) continue;
    try {
      return renderRule(rule, match, depth);
    } catch (error) {
      if (!(error instanceof MissingTranslationError)) throw error;
    }
  }
  for (const rule of rules) {
    if (rule.weight < 12 || rule.source.startsWith('{')) continue;
    const match = source.match(new RegExp(rule.expression));
    if (!match || match[0] === source || match.slice(1).some((part) => part === source)) continue;
    try {
      const replacement = renderRule(rule, match, depth);
      const result = source.slice(0, match.index) + replacement + source.slice(match.index + match[0].length);
      return translateFragment(result, depth + 1);
    } catch (error) {
      if (!(error instanceof MissingTranslationError)) throw error;
    }
  }
  let result = source;
  for (const [key, translated] of literals) {
    if (japanese.test(key) && result.includes(key)) result = result.split(key).join(translated);
  }
  if (!japanese.test(result)) return result.replaceAll('、', ', ').replaceAll('。', '. ');
  throw new MissingTranslationError(source);
}

export function translate(source, locale = getLocale()) {
  validateLocale(locale);
  if (locale === 'ja') return characterDisplayText(source);
  const key = normalize(source);
  if (!japanese.test(source) && !Object.hasOwn(catalog.messages, key)) return characterDisplayText(source);
  if (cache.has(key)) return cache.get(key);
  const result = characterDisplayText(Object.hasOwn(catalog.messages, key) ? catalog.messages[key] : translateFragment(key));
  if (japanese.test(result)) throw new MissingTranslationError(key);
  if (cache.size >= 4096) cache.delete(cache.keys().next().value);
  cache.set(key, result);
  return result;
}

const browser = typeof document !== 'undefined';
const root = browser
  ? new URL(document.querySelector('meta[name="archive-root"]')?.content ?? './', document.baseURI)
  : new URL('../', import.meta.url);
let currentLocale = browser ? validateLocale(document.documentElement.lang || 'ja') : 'ja';
let contextProvider = (url) => url;
const missing = new Set();
const textBindings = new WeakMap();
const attributeBindings = new WeakMap();

export function getLocale() { return currentLocale; }
export function numberLocale() { return getLocale() === 'en' ? 'en-US' : 'ja-JP'; }
export function assetURL(path) {
  const url = new URL(path.replace(/^\/+/, ''), root);
  if (url.origin !== root.origin || !url.pathname.startsWith(root.pathname)) throw new Error('Archive URL escapes its project base.');
  return url.href;
}

export function localizedURL(path, locale = getLocale()) {
  validateLocale(locale);
  const url = new URL(path, root);
  if (url.origin !== root.origin || !url.pathname.startsWith(root.pathname)) return url.href;
  let name = decodeURIComponent(url.pathname.slice(root.pathname.length));
  if (!name || name.endsWith('/')) name += 'index.html';
  for (const route of Object.values(catalog.routes)) {
    if ([route.legacy, `ja/${route.localized}`, `en/${route.localized}`].includes(name)) {
      url.pathname = root.pathname + `${locale}/${route.localized}`;
      return url.href;
    }
  }
  for (const [ja, en] of Object.entries(catalog.docs)) {
    if (name === ja || name === en) {
      url.pathname = root.pathname + (locale === 'en' ? en : ja);
      return url.href;
    }
  }
  return url.href;
}

export function setLanguageContext(provider) {
  contextProvider = provider;
  updateLanguageLinks();
}

function ignored(element) {
  return !element || element.closest('script, style, noscript, code, [data-i18n-ignore]');
}

function showMissing(error) {
  if (missing.has(error.source)) return;
  missing.add(error.source);
  console.error(error.message);
  let banner = document.querySelector('#translation-error');
  if (!banner) {
    banner = document.createElement('p');
    banner.id = 'translation-error';
    banner.className = 'translation-error';
    banner.setAttribute('role', 'alert');
    banner.setAttribute('data-i18n-ignore', '');
    document.body.prepend(banner);
  }
  banner.textContent = 'Some text could not be translated. This English view is incomplete. Switch to Japanese or reload.';
}

function output(binding) {
  try {
    return translate(binding.source);
  } catch (error) {
    if (!(error instanceof MissingTranslationError)) throw error;
    showMissing(error);
    return '[Translation unavailable]';
  }
}

function originalForText(node) {
  const previous = node.previousSibling;
  const marker = previous?.nodeType === Node.COMMENT_NODE && previous.data.startsWith('l10n:')
    ? previous.data.slice(5) : node.parentElement?.getAttribute('data-l10n-text');
  const source = catalog.sourceIds[marker];
  if (source && [source, catalog.messages[source]].flatMap(value => [normalize(value), normalize(characterDisplayText(value))])
    .includes(normalize(node.nodeValue))) {
    return node.nodeValue.match(/^\s*/)[0] + source + node.nodeValue.match(/\s*$/)[0];
  }
  return node.nodeValue;
}

function localizeText(node) {
  if (ignored(node.parentElement) || !node.nodeValue.trim()) return;
  let binding = textBindings.get(node);
  if (!binding || node.nodeValue !== binding.last) {
    binding = { source: originalForText(node), last: node.nodeValue };
    textBindings.set(node, binding);
  }
  const leading = binding.source.match(/^\s*/)[0];
  const trailing = binding.source.match(/\s*$/)[0];
  const value = currentLocale === 'ja' ? characterDisplayText(binding.source) : leading + output(binding) + trailing;
  binding.last = value;
  if (node.nodeValue !== value) node.nodeValue = value;
}

function localizeAttributes(element) {
  if (ignored(element)) return;
  let bindings = attributeBindings.get(element);
  if (!bindings) { bindings = new Map(); attributeBindings.set(element, bindings); }
  for (const attribute of attributes) {
    if (!element.hasAttribute(attribute)) continue;
    const value = element.getAttribute(attribute);
    let binding = bindings.get(attribute);
    if (!binding || value !== binding.last) {
      const marker = element.getAttribute(`data-l10n-${attribute}`);
      const original = catalog.sourceIds[marker];
      const source = original && [original, catalog.messages[original]].flatMap(text =>
        [normalize(text), normalize(characterDisplayText(text))]).includes(normalize(value)) ? original : value;
      binding = { source, last: value };
      bindings.set(attribute, binding);
    }
    const translated = output(binding);
    binding.last = translated;
    if (value !== translated) element.setAttribute(attribute, translated);
  }
  if (element.tagName === 'A' && element.hasAttribute('href') && !element.hasAttribute('data-language')) {
    const href = element.getAttribute('href');
    if (href.startsWith('#')) return;
    const target = localizedURL(element.href);
    if (target !== element.href) element.href = target;
  }
}

function localizeTree(rootNode) {
  if (rootNode.nodeType === Node.TEXT_NODE) {
    localizeText(rootNode);
    return;
  }
  if (rootNode.nodeType === Node.ELEMENT_NODE) localizeAttributes(rootNode);
  const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeType === Node.TEXT_NODE) localizeText(node);
    else localizeAttributes(node);
  }
}

function languageURL(locale) {
  const page = catalog.routes[document.documentElement.dataset.archivePage];
  const next = new URL(`${locale}/${page.localized}`, root);
  next.search = location.search;
  next.hash = location.hash;
  return contextProvider(next);
}

function updateLanguageLinks() {
  if (!browser) return;
  document.querySelector('.language-switch')?.setAttribute('aria-label', currentLocale === 'ja' ? '表示言語' : 'Page language');
  for (const link of document.querySelectorAll('[data-language]')) {
    link.href = languageURL(link.dataset.language);
    link.setAttribute('aria-current', link.dataset.language === currentLocale ? 'page' : 'false');
  }
}

export function setLocale(locale, { updateURL = true } = {}) {
  validateLocale(locale);
  if (!browser) { currentLocale = locale; return; }
  document.dispatchEvent(new CustomEvent('archive-language-will-change', { detail: { locale } }));
  if (updateURL) history.pushState(null, '', languageURL(locale));
  currentLocale = locale;
  document.documentElement.lang = locale;
  missing.clear();
  document.querySelector('#translation-error')?.remove();
  localizeTree(document.documentElement);
  updateLanguageLinks();
  document.dispatchEvent(new CustomEvent('archive-language-changed', { detail: { locale } }));
}

if (browser) {
  for (const element of document.querySelectorAll('img[src], video[poster], source[src], script[src], link[rel="stylesheet"], link[rel="icon"]')) {
    for (const attribute of ['src', 'poster', 'href']) {
      if (element.hasAttribute(attribute)) element.setAttribute(attribute, new URL(element.getAttribute(attribute), document.baseURI).href);
    }
  }
  localizeTree(document.documentElement);
  updateLanguageLinks();
  const observer = new MutationObserver((changes) => {
    for (const change of changes) {
      if (change.type === 'characterData') localizeText(change.target);
      else if (change.type === 'attributes') localizeAttributes(change.target);
      else change.addedNodes.forEach(localizeTree);
    }
  });
  observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true,
    attributes: true, attributeFilter: [...attributes, 'href'] });
  for (const link of document.querySelectorAll('[data-language]')) {
    link.addEventListener('focus', updateLanguageLinks);
    link.addEventListener('pointerenter', updateLanguageLinks);
    link.addEventListener('click', (event) => {
      updateLanguageLinks();
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      setLocale(link.dataset.language);
    });
  }
  window.addEventListener('popstate', () => {
    const name = location.pathname.slice(root.pathname.length).split('/')[0];
    setLocale(name === 'en' ? 'en' : 'ja', { updateURL: false });
  });
  Object.defineProperty(window, '__archiveI18n', { value: Object.freeze({
    get locale() { return currentLocale; }, get missing() { return [...missing]; },
  }) });
}
