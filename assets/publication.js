export const PUBLICATION_URL = '/archive/revisions.json';
export const COMMON_REVISION = 'r3-8mm-20260920';
export const R2_REVISION = 'r2-20260919';
const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const revisionId = (value) => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(value);
const requireThat = (condition, message) => { if (!condition) throw new Error(message); };
const roots = {
  phase1: (id) => id === 'phase1' ? '/artifacts/phase1/' : null,
  r2: (id) => id === R2_REVISION ? `/artifacts/selected/${id}/` : null,
  'common-blocks': (id) => `/artifacts/revisions/${id}/`,
};

export function revisionFile(value, revision) {
  requireThat(record(revision) && revisionId(revision.id) && Object.hasOwn(roots, revision.generation),
    '公開版の識別子または世代が不正です。');
  requireThat(typeof value === 'string' && !value.includes('\\'), '公開版のファイル参照が不正です。');
  const root = roots[revision.generation](revision.id);
  const input = value.startsWith('artifacts/') ? `/${value}` : value;
  requireThat(root && input.startsWith(root), '公開版のファイル参照に別世代が混在しています。');
  const url = new URL(input, 'https://archive.invalid');
  requireThat(url.origin === 'https://archive.invalid' && url.pathname.startsWith(root)
    && !url.username && !url.password && !url.search && !url.hash
    && !/%(?:2e|2f|5c)/i.test(url.pathname), '公開版のファイル参照が公開範囲を外れています。');
  return url.pathname;
}

export function validatePhysicalStatus(value, generation) {
  requireThat(record(value)
    && ['NOT_TESTED', 'ISSUES_REPORTED', 'NOT_VALIDATED'].includes(value.physical_trial)
    && value.physical_fit === 'UNKNOWN' && value.retention_strength === 'UNKNOWN'
    && value.full_assembly === 'UNKNOWN' && value.slicer === 'NOT_SLICED'
    && value.full_kit_printing === 'ON_HOLD', '版別の実物評価または印刷保留の状態が不正です。');
  if (generation === 'common-blocks') {
    requireThat(value.physical_trial === 'NOT_TESTED', '新版のデジタル設計を実物試験済みと表示できません。');
  }
  return value;
}

export function validatePublication(value) {
  requireThat(record(value) && value.schema_version === 1 && revisionId(value.current_revision)
    && Array.isArray(value.revisions) && value.revisions.length > 0, '公開版一覧の形式が不正です。');
  const ids = new Set();
  for (const revision of value.revisions) {
    requireThat(record(revision) && revisionId(revision.id) && !ids.has(revision.id)
      && Object.hasOwn(roots, revision.generation)
      && ['AVAILABLE', 'INPUT_WAIT'].includes(revision.availability)
      && /^\d{4}-\d{2}-\d{2}$/.test(revision.recorded_on), '公開版一覧に不正・重複した版があります。');
    validatePhysicalStatus(revision.status, revision.generation);
    if (revision.availability === 'AVAILABLE') {
      revisionFile(revision.catalog_url, revision);
      requireThat(typeof revision.catalog_sha256 === 'string' && /^[0-9a-f]{64}$/.test(revision.catalog_sha256),
        '公開カタログの照合ハッシュがありません。');
      if (revision.generation === 'common-blocks') {
        requireThat(revision.design_implementation === 'AUTHORIZED'
          && /^[0-9a-f]{40}$/.test(revision.source_commit)
          && typeof revision.bundle_index_url === 'string'
          && revision.bundle_index_url === `/archive/releases/${revision.id}.json`,
        '新版の実装承認・固定入力・配布記録がそろっていません。');
      }
    } else {
      requireThat(revision.catalog_url === undefined && revision.catalog_sha256 === undefined
        && revision.bundle_index_url === undefined && revision.id !== value.current_revision,
      '入力待ちの版を取得可能・現行版として公開できません。');
    }
    if (revision.feedback_url !== undefined) {
      requireThat(revision.id === R2_REVISION && revision.feedback_url === '/feedback/2026-09-19/README.md',
        '過去の実物フィードバックを別版へ割り当てることはできません。');
    }
    ids.add(revision.id);
  }
  requireThat(value.revisions.some((entry) => entry.id === value.current_revision && entry.availability === 'AVAILABLE'),
    '現行版として公開可能なカタログがありません。');
  return value;
}

export function findRevision(publication, id) {
  validatePublication(publication);
  const revision = publication.revisions.find((entry) => entry.id === id);
  requireThat(revision, `公開版が見つかりません: ${id}`);
  return revision;
}

export function chooseRevision(publication, { mode = 'current', revision = null, candidate = null } = {}) {
  validatePublication(publication);
  requireThat(['current', 'selected', 'phase1', 'r2'].includes(mode), '表示モードが不正です。');
  let id = revision;
  if (mode === 'phase1' || mode === 'r2') {
    const modeRevision = mode === 'phase1' ? 'phase1' : R2_REVISION;
    requireThat(!id || id === modeRevision, '履歴モードと指定された版が一致しません。');
    id = modeRevision;
  }
  if (!id && candidate && /^(mona|copilot|ducky)-(chunky|balanced|fine)$/.test(candidate)) {
    id = ['mona-fine', 'copilot-chunky', 'ducky-fine'].includes(candidate) ? R2_REVISION : 'phase1';
  }
  const selected = findRevision(publication, id ?? publication.current_revision);
  requireThat(selected.availability === 'AVAILABLE',
    `新版は制作データの受領待ちです。過去のモデルを新版として表示しません: ${selected.id}`);
  return selected;
}

export function physicalSummary(revision) {
  validatePhysicalStatus(revision.status, revision.generation);
  if (revision.generation === 'common-blocks') {
    return ['8 mm共通ブロック方式の新しいデジタル試作です。この版の実物試験はまだ行われていません。',
      '嵌合・保持力・全体組立・スライス条件は未検証です。全数印刷は保留します。',
      '2026-09-19の小ささ・穴詰まりは旧4 mm試作の記録であり、新版の試験結果ではありません。'].join(' ');
  }
  if (revision.id === R2_REVISION) {
    return ['旧r2・4 mm接合部の初回試作で、小さく扱いにくい部品と樹脂で埋まった穴が報告されました。',
      '穴詰まりは超音波洗浄前から発生。原因・実際のスライサー条件・条件別保持力は未確定です。',
      '旧8 mm試験片の成功や、新版の実物合格を示す記録ではありません。'].join(' ');
  }
  return ['Phase1の外観・数値比較を保存した履歴です。旧4/6/8 mmの形状で、実物嵌合や全体組立の合格を示しません。',
    '歴史的な6 mmクーポンは、新しい8 mm共通ブロックの試験片として代用できません。'].join(' ');
}
