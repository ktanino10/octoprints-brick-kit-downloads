import { artifactPath, CHARACTERS, STYLES } from './data.js';
import { $, element, number } from './dom.js';
import { publicURL } from './paths.js';
import { R2_REVISION, physicalSummary } from '../../assets/publication.js';

export function renderViewContext(context) {
  const history = context.kind === 'phase1';
  const baseline = context.kind === 'baseline';
  const preview = context.kind === 'preview';
  document.body.dataset.viewMode = context.kind;
  $('#selected-mode-link').setAttribute('aria-current', history || preview ? 'false' : 'page');
  $('#history-mode-link').setAttribute('aria-current', history ? 'page' : 'false');
  $('#phase1-gallery-link').href = publicURL(artifactPath(context.catalog?.source_history_url ?? '/artifacts/phase1/gallery.html'));
  $('.style-switch').hidden = !history;
  $('.gallery-columns').hidden = !history;
  $('#phase-label').textContent = history ? 'PHASE 1 · 履歴' : baseline ? '選択基準' : preview ? 'PHASE 2 · 版指定' : 'PHASE 2 · 試作';
  $('#visual-gate').textContent = history ? '外観検討' : '外観基準は選択済み';
  $('#assembly-gate').hidden = history;
  $('#physical-gate').textContent = history ? '旧版・実物合格の記録ではない' : '初回試作で課題・保持力未確認';
  $('#production-gate').textContent = '全数印刷は保留';
  $('#revision-id').textContent = history ? 'Phase1 / historical' : `${context.revision}${baseline ? ' / 公開待ち' : preview ? ' / PREVIEW' : ''}`;
  $('#revision-title').textContent = history ? 'Phase1の比較履歴・旧接合部' : baseline ? '外観基準は選択済み・新接合部版は未公開'
    : preview ? '版指定プレビュー・公開状態を示すものではありません' : '選択済みの外観基準を引き継ぐ接合部試作版';
  $('#revision-detail').textContent = history
    ? '当時の9案と旧形状を残した履歴です。現在の接合部試作や製造の承認を示しません。'
    : baseline
      ? '公開ポインターがまだありません。以下は選択済みのPhase1基準形状・基準部品数です。新版のCAD・壁厚改善・組立検証が存在するとは判断していません。'
      : preview
        ? 'URLで明示された試作版を直接読み取っています。公開ポインター経由の通常表示ではありません。資料は検討用・差替え中です。補助具条件は現在の配置マニフェストを参照し、実機嵌合・保持力・製造は未承認のままです。'
        : '選択済みなのはPhase1の外観基準だけです。この版の接合部と組立は試作段階で、実機嵌合・保持力・製造は未承認です。';
  $('#revision-notice').dataset.kind = context.kind;
  $('#selection-summary').replaceChildren();
  if (context.selection) {
    for (const choice of context.selection.selections) {
      $('#selection-summary').append(element('li', '', `${CHARACTERS[choice.character].name} · ${STYLES[choice.style].english} ${number(choice.pitch_mm)} mm / 基準 ${number(choice.baseline_part_count, 0)}個`));
    }
  }
  $('#comparison-kicker').textContent = history ? 'PHASE 1 · HISTORICAL COMPARISON' : baseline ? 'APPROVED EXTERIOR BASELINES · OLD GEOMETRY'
    : preview ? 'EXPLICIT REVISION PREVIEW · NOT A RELEASE' : 'SELECTED PROTOTYPE · CURRENT REVISION';
  $('#comparison-copy').textContent = history
    ? '当時の部品数・画像・接合部の比較です。旧細密壁厚の注意事項はこの旧版の情報です。'
    : baseline
      ? '選択済み3案の基準画像です。新しい接合部の画像・動画ではありません。'
      : 'この試作版の実生成画像だけを表示します。未生成の画像・動画を過去版で置き換えません。';
  $('#selection-note-title').textContent = history ? '現在の外観基準は、別の選択記録に保存されています。' : '外観基準の選択は、製造承認ではありません。';
  $('#selection-note-copy').textContent = 'この画面は表示切替とファイルの読み取りだけです。CAD生成・プリンター接続・送信・承認操作は行いません。';
  $('#visual-selection-status').textContent = history ? '当時の未確定記録' : '選択済み・外観基準のみ';
  $('#downloads-title').textContent = baseline ? '基準データ（Phase1旧版）' : history ? 'Phase1履歴データ'
    : preview ? '版指定の検討資料・差替え中' : 'この試作版の検討データ';
  $('#downloads-scope').textContent = baseline
    ? '以下は旧接合部の外観基準データです。新版の試験片・CAD・動画ではありません。'
    : '公開用メタデータ整理済みのファイルです。組立FCStdは部品ライブラリーが必要なため、配布カタログのCAD一式ZIPを推奨します。全数印刷は保留です。';
  $('#footer-scope').textContent = history ? 'PHASE 1 · 比較履歴' : `${context.revision} · 外観基準のみ選択済み`;
  if (context.publicationEntry) {
    $('#selected-mode-link').textContent = '現行版';
    $('#selected-mode-link').setAttribute('aria-current', context.isCurrent ? 'page' : 'false');
    $('#r2-mode-link').setAttribute('aria-current', context.revision === R2_REVISION ? 'page' : 'false');
    $('#revision-detail').textContent = physicalSummary(context.publicationEntry);
    if (!context.isCurrent) {
      $('#revision-title').textContent = history ? 'Phase1の外観候補・保存された履歴' : '旧r2の接合部試作・保存された履歴';
      $('#comparison-kicker').textContent = 'SUPERSEDED / HISTORICAL GEOMETRY';
      $('#downloads-title').textContent = '旧版の保存資料・現行版ではありません';
      $('#footer-scope').textContent = `${context.revision} · 保存された旧版`;
    }
  }
}
