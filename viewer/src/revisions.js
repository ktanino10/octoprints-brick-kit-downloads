import {
  artifactPath, DataError, revisionPath, SELECTION_URL, SELECTED_STAGE, validateCatalog,
} from './data.js';

export const CURRENT_SELECTION_URL = '/artifacts/selected/current.json';
export const PHASE1_CATALOG_URL = '/artifacts/phase1/catalog.json';
const assert = (condition, message) => { if (!condition) throw new DataError(message); };
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

export function validateSelection(selection) {
  assert(object(selection) && selection.schema_version === 1
    && typeof selection.revision === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(selection.revision), '外観基準の選択記録が不正です。');
  assert(Array.isArray(selection.selections) && selection.selections.length === 3, '3キャラクターの選択記録が必要です。');
  const characters = new Set();
  for (const entry of selection.selections) {
    assert(object(entry) && ['mona', 'copilot', 'ducky'].includes(entry.character)
      && ['chunky', 'balanced', 'fine'].includes(entry.style)
      && entry.candidate_id === `${entry.character}-${entry.style}`
      && entry.visual_decision === 'APPROVED'
      && Number.isFinite(entry.pitch_mm) && entry.pitch_mm > 0
      && Number.isFinite(entry.layer_mm) && entry.layer_mm > 0
      && Number.isSafeInteger(entry.baseline_part_count) && entry.baseline_part_count > 0
      && /^[0-9a-f]{64}$/i.test(entry.baseline_sha256), '外観基準のID・選択範囲・数値が不正です。');
    assert(!characters.has(entry.character), '外観基準のキャラクターが重複しています。');
    characters.add(entry.character);
    assert(artifactPath(entry.baseline_manifest).startsWith('/artifacts/phase1/'), '外観基準はPhase1の記録を参照する必要があります。');
  }
  const gates = selection.gates;
  assert(object(gates) && gates.visual_baseline === 'APPROVED'
    && gates.revised_joint_fit === 'UNKNOWN' && gates.retention_strength === 'UNKNOWN'
    && gates.physical_assembly === 'UNKNOWN' && gates.production_export === 'BLOCKED', '外観基準の選択を製造承認と解釈できません。実機検証・量産ゲートを確認してください。');
  return selection;
}

export function validatePublishedPointer(pointer) {
  assert(object(pointer) && pointer.selection_url === SELECTION_URL, '選択版ポインターの選択記録参照先が不正です。');
  revisionPath(pointer.catalog_url, pointer.revision);
  return pointer;
}

function matchChoice(candidate, choice, selected) {
  assert(candidate && candidate.character === choice.character && candidate.style === choice.style
    && candidate.pitch_mm === choice.pitch_mm && candidate.layer_mm === choice.layer_mm, '公開案がユーザーの外観基準選択と一致しません。');
  assert((selected ? candidate.metrics.baseline_part_count : candidate.metrics.part_count) === choice.baseline_part_count, '外観基準の部品数が選択記録と一致しません。');
}

export function contextFromCatalog(selection, catalog, pointer = null, { preview = false } = {}) {
  validateSelection(selection);
  validateCatalog(catalog);
  const selected = pointer !== null;
  if (selected) {
    validatePublishedPointer(pointer);
    assert(pointer.revision === selection.revision && catalog.revision === pointer.revision
      && catalog.stage === SELECTED_STAGE && catalog.selection_url === SELECTION_URL, '選択記録・公開ポインター・試作版のrevisionが一致しません。');
  }
  const candidates = selection.selections.map((choice) => {
    const candidate = catalog.candidates.find((entry) => entry.id === choice.candidate_id);
    matchChoice(candidate, choice, selected);
    return candidate;
  });
  if (selected) assert(catalog.candidates.length === candidates.length, '選択版に未選択の案が含まれています。');
  return {
    kind: selected ? preview ? 'preview' : 'selected' : 'baseline',
    revision: selection.revision,
    selection,
    catalog: selected ? catalog : { ...catalog, candidates },
    catalogURL: selected ? pointer.catalog_url : PHASE1_CATALOG_URL,
    statusURL: selected ? '/archive/status.json' : null,
  };
}

export async function resolveViewContext({ mode, previewRevision = null, readJSON, readOptionalJSON }) {
  if (mode === 'phase1') {
    return { kind: 'phase1', revision: 'phase1', selection: null, catalog: validateCatalog(await readJSON(PHASE1_CATALOG_URL)), catalogURL: PHASE1_CATALOG_URL, statusURL: '/archive/status.json' };
  }
  const selection = validateSelection(await readJSON(SELECTION_URL));
  if (previewRevision !== null) {
    const catalogURL = revisionPath(`/artifacts/selected/${previewRevision}/catalog.json`, previewRevision);
    assert(previewRevision === selection.revision, '版指定プレビューが現在の外観基準選択のrevisionと一致しません。');
    const reference = { revision: previewRevision, catalog_url: catalogURL, selection_url: SELECTION_URL };
    return contextFromCatalog(selection, await readJSON(catalogURL), reference, { preview: true });
  }
  const rawPointer = await readOptionalJSON(CURRENT_SELECTION_URL);
  if (rawPointer === null) return contextFromCatalog(selection, await readJSON(PHASE1_CATALOG_URL));
  const pointer = validatePublishedPointer(rawPointer);
  return contextFromCatalog(selection, await readJSON(pointer.catalog_url), pointer);
}

export function validateManifestChoice(manifest, context) {
  if (context.kind === 'phase1') {
    assert(manifest.schema_version === 1, 'Phase1履歴に別版の配置データが含まれています。');
    return;
  }
  const choice = context.selection.selections.find((entry) => entry.candidate_id === manifest.candidate_id);
  assert(choice, '配置データが外観基準の選択に含まれていません。');
  for (const typeId of new Set(manifest.parts.map((part) => part.type_id))) {
    const type = manifest.types[typeId];
    assert(type.pitch_mm === choice.pitch_mm && type.layer_mm === choice.layer_mm, '配置部品の格子が選択済み外観基準と一致しません。');
  }
  if (context.kind === 'baseline') {
    assert(manifest.schema_version === 1 && manifest.metrics.part_count === choice.baseline_part_count, '基準表示に新しい試作版の配置データが混在しています。');
  } else {
    assert(manifest.schema_version === 2 && manifest.metrics.baseline_part_count === choice.baseline_part_count
      && manifest.visual_approval.baseline_manifest_sha256.toLowerCase() === choice.baseline_sha256.toLowerCase()
      && (manifest.revision === undefined || manifest.revision === context.revision), '新しい試作版の外観基準ハッシュ・revisionが選択記録と一致しません。');
  }
}
