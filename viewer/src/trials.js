import { CHARACTERS, DataError, revisionPath } from './data.js';
import { $, element, number } from './dom.js';
import { appendDownload } from './assets.js';
import { getJSON } from './network.js';
import { commonFile } from '../../assets/common-blocks.js';

function suppliedText(value, missing = '未記載・未確認') {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) return value.join(' / ');
  return missing;
}

function fileType(url) {
  return new URL(url, 'http://local.invalid').pathname.split('.').at(-1).toUpperCase();
}

async function renderLayoutFacts(set, host, orientation, signal, revision) {
  if (!set.layout_url) return;
  const note = element('p', 'control-help', '配置資料の姿勢・数量を確認中です。');
  host.append(note);
  try {
    const layout = await getJSON(revisionPath(set.layout_url, revision), signal);
    if (signal.aborted || !note.isConnected) return;
    const expected = set.parts.filter((part) => !part.optional).reduce((sum, part) => sum + part.quantity, 0);
    if (layout.pitch_mm !== set.pitch_mm || layout.piece_count !== expected) throw new DataError('配置資料のピッチまたは個数がカタログと一致しません。');
    const instructions = Array.isArray(layout.instructions) ? layout.instructions.filter((line) => typeof line === 'string') : [];
    const socketDown = instructions.some((line) => /female receiver.*socket DOWN/i.test(line));
    const stemUp = instructions.some((line) => /male grip.*stem UP/i.test(line));
    if (socketDown && stemUp) {
      orientation.textContent = '受け側：ソケット下向き・底面z=0。雄側：座面と軸を上向き（資料の指定・実機未確認）。';
    }
    const objects = Number.isSafeInteger(layout.document_object_count) ? `${number(layout.document_object_count, 0)}個のCAD内部オブジェクト` : 'CADの構築履歴';
    note.textContent = `${objects}をすべて出力する指示ではありません。対象は${set.parts.length}種・指定数量${number(expected, 0)}個、またはその配置ファイルです。スライス・時間・質量・実機適合は未確認です。`;
    if (instructions.some((line) => /negative-clearance.*intentionally interferes/i.test(line))) {
      note.append(element('span', 'trial-negative-clearance', ' −0.05 mmは意図的な干渉条件です。衝突なし・適合済みとは解釈せず、未検証の軸への無理な圧入を推奨しません。'));
    }
  } catch (error) {
    if (signal.aborted || !note.isConnected) return;
    note.textContent = `配置資料を確認できません。${error.message}`;
    note.setAttribute('role', 'alert');
    note.dataset.state = 'error';
  }
}

export function renderTrials(context, signal) {
  const section = $('#fit-trials');
  section.hidden = context.kind === 'phase1';
  const host = $('#trial-sets');
  host.replaceChildren();
  if (section.hidden) return;
  if (context.kind === 'common') {
    renderCommonTrials(context, signal);
    return;
  }
  if (context.kind === 'baseline') {
    $('#trial-summary').textContent = '新版の試験片は未公開です。表示中の旧基準形状や過去の6 mm試験片を、新しい4 mm・8 mm接合部の代わりに使いません。';
    host.append(element('p', 'section-empty', '公開された新版カタログに試験片がそろうまで、取得リンクは表示しません。'));
    return;
  }

  function renderCommonTrials(context, signal) {
    const host = $('#trial-sets');
    $('#fit-trials .eyebrow').textContent = 'CURRENT COMMON-BLOCK TRIAL / NOT_SLICED';
    $('#trial-title').textContent = '新しい接合部は、新しい少数試験で。';
    $('#trial-summary').textContent = 'この版の実物試験は未実施です。旧4 mm・旧8 mm・6 mmクーポンの結果やファイルを代用しません。試験資料の配布は、印刷合格や全数印刷の許可ではありません。';
    const sets = context.catalog.trial_sets;
    if (!Array.isArray(sets) || !sets.length) {
      const error = element('p', 'section-empty', '新版の少数試験セットを確認できません。試験片が実在する版の公開資料を確認してください。');
      error.setAttribute('role', 'alert');
      host.append(error);
      return;
    }
    for (const set of sets) {
      const box = element('section', 'data-card trial-set');
      try {
        if (!set || set.pitch_mm !== 8 || !Number.isSafeInteger(set.piece_count) || set.piece_count <= 0) {
          throw new DataError('新版試験セットのピッチまたは部品数が不正です。');
        }
        const heading = element('div', 'card-heading');
        heading.append(element('h3', '', set.label ?? '8 mm共通ブロック・小型試験'),
          element('span', 'small-label', `${number(set.piece_count, 0)}個 / NOT_SLICED`));
        box.append(heading, element('p', 'control-help', '形状のみの試験資料です。実際の機種・ノズル・材料・プレート・スライス条件とレイヤー経路を別途確認します。'));
        const entries = [];
        if (set.downloads !== undefined) {
          if (!Array.isArray(set.downloads)) throw new DataError('新版試験セットの取得先一覧が不正です。');
          for (const entry of set.downloads) {
            if (typeof entry.label !== 'string' || typeof entry.url !== 'string') throw new DataError('新版試験セットの取得先一覧が不正です。');
            const url = commonFile(entry.url, context.revision);
            entries.push({ label: entry.label, extension: fileType(url), url });
          }
        } else {
          for (const [field, label] of [
            ['native_url', '新版試験のネイティブCAD'],
            ['plate_url', '新版試験の形状3MF・NOT_SLICED'],
            ['plate_stl_url', '新版試験の配置STL'],
            ['plate_step_url', '新版試験の配置STEP'],
            ['layout_url', '新版試験の配置・数量JSON'],
            ['instructions_url', '新版試験の条件・姿勢ガイド'],
            ['parts_csv_url', '試験片の数量CSV'],
            ['csv_url', '試験片の記録CSV'],
          ]) {
            if (!set[field]) continue;
            const url = commonFile(set[field], context.revision);
            entries.push({ label, extension: fileType(url), url });
          }
          if (set.parts !== undefined) {
            if (!Array.isArray(set.parts) || !set.parts.length) throw new DataError('新版試験セットの数量内訳が不正です。');
            let total = 0;
            for (const part of set.parts) {
              if (typeof part.label !== 'string' || !Number.isSafeInteger(part.quantity) || part.quantity <= 0) {
                throw new DataError('新版試験セットの数量内訳が不正です。');
              }
              total += part.quantity;
              const url = commonFile(part.url, context.revision);
              entries.push({ label: `${part.label} × ${number(part.quantity, 0)}`, extension: fileType(url), url });
            }
            if (total !== set.piece_count) throw new DataError('新版試験セットの数量内訳が不正です。');
          }
        }
        if (!entries.length) throw new DataError('新版試験セットの取得先一覧が不正です。');
        const downloads = element('div', 'trial-downloads');
        box.append(downloads);
        host.append(box);
        for (const entry of entries) appendDownload(downloads, entry, signal);
      } catch (error) {
        const message = element('p', 'section-empty', `新版の試験資料を確認できません。${error.message}`);
        message.setAttribute('role', 'alert');
        box.replaceChildren(message);
        host.append(box);
      }
    }
  }
  const sets = context.catalog.trial_sets ?? [];
  if (!sets.length) {
    $('#trial-summary').textContent = 'この試作版の試験片セットは未公開です。本体一式を出力せず、少数試験片の公開を待ちます。';
    return;
  }
  const total = sets.reduce((sum, set) => sum + set.parts.filter((part) => !part.optional).reduce((count, part) => count + part.quantity, 0), 0);
  $('#trial-summary').textContent = `過去に用意した試験片は4 mm／8 mmの合計${number(total, 0)}個。4 mmの初回試作では小ささ・穴詰まりが報告され、改良検討中です。再印刷や本体一式の出力を指示するものではありません。任意の受け台は別枠です。`;
  for (const set of sets) {
    const box = element('section', 'data-card trial-set');
    box.dataset.pitch = String(set.pitch_mm);
    const subjects = context.catalog.candidates.filter((candidate) => candidate.pitch_mm === set.pitch_mm).map((candidate) => CHARACTERS[candidate.character].name).join('・');
    const count = set.parts.filter((part) => !part.optional).reduce((sum, part) => sum + part.quantity, 0);
    const heading = element('div', 'card-heading');
    heading.append(element('h3', '', `${number(set.pitch_mm)} mm · ${subjects}`), element('span', 'small-label', `${number(count, 0)}個 / NOT_SLICED`));
    box.append(heading);
    const facts = element('dl', 'evidence-facts');
    let orientation;
    const clearance = set.diametral_clearances_mm ?? set.clearances_mm;
    const clearanceText = Array.isArray(clearance) && clearance.every(Number.isFinite)
      ? `${clearance.map((value) => `${value > 0 ? '+' : ''}${number(value, 2)}`).join(' / ')} mm`
      : '同梱資料で確認';
    for (const [label, value] of [
      ['ノズル候補', `${number(set.nozzle_recommendation_mm)} mm（設計仮定・未検証）`],
      ['材料', suppliedText(set.material, 'PLAを想定・実機未検証')],
      ['姿勢', suppliedText(set.orientation ?? set.print_orientation)],
      ['直径差', clearanceText],
      ['レイアウト', '幾何配置のみ・スライス未確認'],
      ['実機嵌合・保持力', 'UNKNOWN'],
    ]) {
      const row = element('div');
      const definition = element('dd', '', value);
      if (label === '姿勢') orientation = definition;
      row.append(element('dt', '', label), definition);
      facts.append(row);
    }
    box.append(facts, element('p', 'card-footnote', '直径差は穴径−軸径で、片側の隙間ではありません。ノズル径・壁厚の条件だけでは強度や嵌合を保証しません。'));
    const downloads = element('div', 'trial-downloads');
    box.append(downloads);
    host.append(box);
    renderLayoutFacts(set, box, orientation, signal, context.revision);
    for (const part of [...set.parts, ...(set.optional_parts ?? []).map((part) => ({ ...part, optional: true }))]) {
      const url = revisionPath(part.url, context.revision);
      appendDownload(downloads, { label: `${part.optional ? '任意 · ' : ''}${part.label} × ${number(part.quantity, 0)}`, extension: fileType(url), url }, signal);
    }
    for (const [key, label] of [
      ['native_url', `${number(set.pitch_mm)} mm試験片CAD（構築履歴を含む）`],
      ['plate_url', `${number(count, 0)}個の配置3MF（スライス前）`],
      ['plate_stl_url', `${number(count, 0)}個の配置STL（スライス前）`],
      ['plate_step_url', `${number(count, 0)}個の配置STEP（検討用）`],
      ['layout_url', '姿勢・数量の配置記録JSON'],
      ['instructions_url', '試験条件・姿勢の資料（検討用）'],
      ['parts_csv_url', '試験片の数量CSV'],
      ['csv_url', '試験片の記録CSV'],
    ]) {
      if (!set[key]) continue;
      const url = revisionPath(set[key], context.revision);
      appendDownload(downloads, { label, extension: fileType(url), url }, signal);
    }
  }
}
