import { DataError } from './data.js';
import { $, element } from './dom.js';
import { publicURL } from './paths.js';

export async function getJSON(url, signal, { optional = false } = {}) {
  const timeout = AbortSignal.timeout(30000);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
  let response;
  try {
    response = await fetch(publicURL(url), {
      method: 'GET', cache: 'no-cache', credentials: 'omit', redirect: 'error', signal: combined,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new DataError(`公開ファイルを読み込めません: ${url}。接続を確認して再読み込みしてください。`);
  }
  if (optional && response.status === 404) return null;
  if (!response.ok) throw new DataError(`ファイルを読み込めません（HTTP ${response.status}）: ${url}`);
  try {
    return await response.json();
  } catch {
    throw new DataError(`JSONとして読み込めません: ${url}`);
  }
}

export class ArchiveStatus {
  #request = null;
  #version = 0;
  #endpoint = null;
  #revision = null;

  constructor() {
    this.refresh = this.refresh.bind(this);
    $('#refresh-status').addEventListener('click', this.refresh);
  }

  setScope(endpoint, revision = null, unavailable = '表示する版を確認中です。') {
    this.#endpoint = endpoint;
    this.#revision = revision;
    this.unavailable = unavailable;
    this.refresh();
  }

  render(label, detail, available = false) {
    const host = $('#freshness');
    host.className = `freshness freshness-${available ? 'archived' : 'unknown'}`;
    host.dataset.state = available ? 'ARCHIVED' : 'UNKNOWN';
    $('.status-symbol', host).textContent = available ? '↗' : '?';
    $('#freshness-label').textContent = label;
    $('#freshness-time').textContent = available ? '公開時点の記録・実物合格ではありません' : '公開記録を確認できません';
    $('#evidence-status').textContent = available ? '版を固定した公開アーカイブ' : '不明';
    $('#evidence-detail').textContent = detail;
    $('#evidence-detail').dataset.state = available ? 'ARCHIVED' : 'UNKNOWN';
  }

  async refresh() {
    this.#request?.abort();
    const request = new AbortController();
    this.#request = request;
    const version = ++this.#version;
    $('#refresh-status').disabled = true;
    if (!this.#endpoint) {
      this.render('公開記録を確認中', this.unavailable);
      return;
    }
    this.render('公開記録を確認中', 'この版の記録を読み込んでいます。');
    try {
      const record = await getJSON(this.#endpoint, request.signal);
      if (record.schema_version !== 1 || !Array.isArray(record.archived_revisions)
          || !record.archived_revisions.includes(this.#revision)
          || typeof record.updated !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(record.updated)
          || record.production_export !== 'BLOCKED' || record.physical_fit !== 'NOT_VALIDATED'
          || record.feedback !== 'SMALL_PARTS_AND_BLOCKED_HOLES_BEFORE_CLEANING') {
        throw new DataError('公開記録の版または物理ゲートが一致しません。');
      }
      if (version !== this.#version) return;
      this.render(`${record.updated} 公開記録`,
        '4 mm接合部の初回試作で「小さくて作りにくい」「穴が樹脂で埋まる」と報告されています。'
        + '穴詰まりは超音波洗浄前から発生。原因・条件別の保持力・全体組立は未確定です。'
        + '6 mm／8 mmやPhase1の数値検査は、実物合格の証拠ではありません。全数印刷は保留。'
        + 'これは公開時点の固定記録であり、制作環境を監視するAPIではありません。', true);
    } catch (error) {
      if (version !== this.#version || request.signal.aborted) return;
      this.render('公開記録を読めません', `${error.message} 再確認ボタンでやり直してください。`);
    } finally {
      if (version === this.#version) $('#refresh-status').disabled = false;
    }
  }

  dispose() {
    this.#version += 1;
    this.#request?.abort();
    $('#refresh-status').removeEventListener('click', this.refresh);
  }
}

const pendingChecks = [];
let activeChecks = 0;

function drainChecks() {
  while (activeChecks < 4 && pendingChecks.length) {
    const { url, signal, resolve } = pendingChecks.shift();
    activeChecks += 1;
    fetch(publicURL(url), {
      method: 'HEAD', credentials: 'omit', redirect: 'error',
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000),
    }).then((response) => resolve(response.ok
      && !response.headers.get('content-type')?.includes('text/html')
      && response.headers.get('content-length') !== '0'))
      .catch(() => resolve(false))
      .finally(() => { activeChecks -= 1; drainChecks(); });
  }
}

export function fileExists(url, signal) {
  return new Promise((resolve) => {
    pendingChecks.push({ url, signal, resolve });
    drainChecks();
  });
}

export function catalogError(message, retry) {
  const node = $('#catalog-error');
  node.replaceChildren(element('span', '', message));
  const button = element('button', 'button secondary compact', '再読み込み');
  button.type = 'button';
  button.addEventListener('click', retry);
  node.append(button);
  node.hidden = false;
}
