import { revisionFile } from './publication.js';
import {
  requireThat, record, finite, nonnegativeInteger, vector, text, owns,
  validateFootprint, validateMetrics,
} from './data-contracts.js';

export const COMMON_STAGE = 'DIGITAL_PROTOTYPE_NOT_PHYSICALLY_TESTED';
const characters = ['mona', 'copilot', 'ducky'];
const close = (left, right) => finite(left) && finite(right) && Math.abs(left - right) < 1e-7;

export function commonFile(value, revision) {
  requireThat(text(value), '新版のファイル参照がありません。');
  const root = `/artifacts/revisions/${revision}/`;
  let path = value;
  if (!value.startsWith('/') && !value.startsWith('artifacts/')) {
    requireThat(!value.includes(':') && !value.includes('\\'), '新版の相対ファイル参照が不正です。');
    path = root + value;
  }
  return revisionFile(path, { id: revision, generation: 'common-blocks' });
}

export function validateCommonStatus(status, { visualRequired = true } = {}) {
  requireThat(record(status)
    && ((!visualRequired && status.visual_selection === undefined)
      || status.visual_selection === 'PRACTICAL_8MM_REDESIGN_AUTHORIZED')
    && status.physical_fit === 'UNKNOWN' && status.retention_strength === 'UNKNOWN'
    && status.slicer_status === 'NOT_SLICED' && status.full_print === 'ON_HOLD'
    && status.production_export === 'BLOCKED', '共通ブロックの設計承認・実物未検証・未スライスの状態が一致しません。');
}

function validateCommonType(type, id) {
  requireThat(record(type) && ['brick', 'plate', 'contour-brick'].includes(type.kind)
    && vector(type.cells, 2) && type.cells.every((count) => Number.isSafeInteger(count) && count > 0)
    && type.pitch_mm === 8 && type.origin === 'body-bottom-center'
    && [1, 3].includes(type.plate_units) && close(type.body_height_mm, type.plate_units * 3.2)
    && close(type.layer_mm, type.body_height_mm)
    && (type.kind === 'plate' ? type.plate_units === 1 : type.plate_units === 3)
    && vector(type.body_mm, 3)
    && close(type.body_mm[0], type.cells[0] * 8 - 0.2)
    && close(type.body_mm[1], type.cells[1] * 8 - 0.2)
    && close(type.body_mm[2], type.body_height_mm)
    && type.stud_diameter_mm === 4.8 && type.stud_height_mm === 1.8,
  `共通ブロック型 ${id} の寸法・原点・高さ単位が契約と一致しません。`);
  validateFootprint(type, id, true);
  const footprint = new Set(type.footprint_cells.map((cell) => cell.join(',')));
  requireThat(Array.isArray(type.stud_cells) && type.stud_cells.length > 0, `${id} のスタッド配置がありません。`);
  const studs = new Set();
  for (const cell of type.stud_cells) {
    requireThat(Array.isArray(cell) && cell.length === 2 && cell.every(nonnegativeInteger)
      && footprint.has(cell.join(',')) && !studs.has(cell.join(',')), `${id} のスタッド配置が占有形状と一致しません。`);
    studs.add(cell.join(','));
  }
}

function assertRevision(revision) {
  requireThat(typeof revision === 'string' && /^r3-[a-zA-Z0-9._-]+$/.test(revision), '共通ブロック版の識別子が不正です。');
}

export function validateCommonCatalog(catalog) {
  requireThat(record(catalog) && catalog.schema_version === 3 && catalog.units === 'mm'
    && catalog.stage === COMMON_STAGE, '共通ブロックのカタログ形式・単位・試作段階が不正です。');
  assertRevision(catalog.revision);
  validateCommonStatus(catalog.status, { visualRequired: false });
  requireThat(Array.isArray(catalog.candidates) && catalog.candidates.length === 3, '共通ブロック版には3キャラクターが必要です。');
  const found = new Set();
  const candidates = catalog.candidates.map((candidate) => {
    requireThat(record(candidate) && characters.includes(candidate.character)
      && candidate.id === `${candidate.character}-practical8` && candidate.style === 'practical8'
      && candidate.pitch_mm === 8 && !found.has(candidate.character), '共通ブロックの候補ID・ピッチ・キャラクターが一致しません。');
    found.add(candidate.character);
    validateMetrics(candidate.metrics, candidate.id, { estimateRequired: false });
    validateCommonStatus(candidate.status);
    const normalized = { ...candidate };
    for (const field of ['manifest_url', 'render_url', 'exploded_url', 'blend_url', 'video_url',
      'bom_url', 'native_assembly_url', 'assembly_guide_url']) {
      normalized[field] = commonFile(candidate[field], catalog.revision);
    }
    for (const field of ['summary_bom_url', 'assembly_steps_url', 'evidence_url', 'thumbnail_url',
      'assembly_guide_en_url', 'plate_index_url', 'before_after_url']) {
      if (candidate[field] !== undefined) normalized[field] = commonFile(candidate[field], catalog.revision);
    }
    if (candidate.plate_files !== undefined) {
      requireThat(Array.isArray(candidate.plate_files) && candidate.plate_files.length > 0,
        '色別プレートのファイル一覧が不正です。');
      normalized.plate_files = candidate.plate_files.map((plate) => {
        requireThat(record(plate) && text(plate.color_id) && Number.isSafeInteger(plate.part_count) && plate.part_count > 0,
          '色別プレートの色・部品数が不正です。');
        return { ...plate, url: commonFile(plate.url, catalog.revision) };
      });
      requireThat(normalized.plate_files.reduce((sum, plate) => sum + plate.part_count, 0) === candidate.metrics.part_count,
        '色別プレートの数量が、このモデルの部品数と一致しません。');
    }
    requireThat(candidate.warnings === undefined || (Array.isArray(candidate.warnings) && candidate.warnings.every(text)),
      '注意事項の形式が不正です。');
    return normalized;
  });
  const normalized = { ...catalog, candidates, prototypes_url: commonFile(catalog.prototypes_url, catalog.revision) };
  for (const field of ['contact_sheet_url', 'evidence_url', 'dimensions_url', 'common_parts_url', 'review_data_url']) {
    if (catalog[field] !== undefined) normalized[field] = commonFile(catalog[field], catalog.revision);
  }
  if (catalog.common_parts !== undefined) {
    requireThat(record(catalog.common_parts) && Array.isArray(catalog.common_parts.libraries), '共有部品ライブラリーの記録が不正です。');
    normalized.common_parts = {
      ...catalog.common_parts,
      libraries: catalog.common_parts.libraries.map((url) => commonFile(url, catalog.revision)),
      dimension_comparison_url: commonFile(catalog.common_parts.dimension_comparison_url, catalog.revision),
      underside_sections_url: commonFile(catalog.common_parts.underside_sections_url, catalog.revision),
    };
  }
  return normalized;
}

export function validateCommonManifest(manifest, candidateId) {
  requireThat(record(manifest) && manifest.schema_version === 3 && manifest.units === 'mm'
    && manifest.candidate_id === candidateId && characters.some((character) => candidateId === `${character}-practical8`),
  '共通ブロックの配置形式・単位・候補IDが一致しません。');
  assertRevision(manifest.revision);
  requireThat(record(manifest.frame) && manifest.frame.up === '+Z' && manifest.frame.front === '-Y'
    && manifest.frame.handedness === 'right' && manifest.position_origin === 'body-bottom-center',
  '共通ブロックの座標系・部品原点が一致しません。');
  validateCommonStatus(manifest.status);
  requireThat(record(manifest.palette) && record(manifest.types), '色または部品型の定義がありません。');
  for (const [id, color] of Object.entries(manifest.palette)) {
    requireThat(record(color) && /^#[0-9a-fA-F]{6}$/.test(color.hex) && text(color.name), `色 ${id} の定義が不正です。`);
  }
  for (const [id, type] of Object.entries(manifest.types)) validateCommonType(type, id);
  requireThat(Array.isArray(manifest.parts) && manifest.parts.length > 0, '配置データに部品がありません。');
  const ids = new Set();
  const typeIds = new Set();
  const colorIds = new Set();
  const layers = new Set();
  for (const part of manifest.parts) {
    requireThat(record(part) && text(part.id) && !ids.has(part.id) && owns(manifest.types, part.type_id)
      && owns(manifest.palette, part.color_id), '部品IDが欠けているか、重複しています。');
    requireThat(vector(part.position_mm, 3) && [0, 90, 180, 270].includes(part.rotation_z_deg)
      && nonnegativeInteger(part.layer) && close(part.position_mm[2], part.layer * 3.2)
      && Number.isSafeInteger(part.course) && Number.isSafeInteger(part.step) && part.step > 0
      && vector(part.print_rotation_deg, 3) && part.print_rotation_deg.every((angle) => angle === 0)
      && text(part.role) && typeof part.small_part_exception === 'boolean'
      && part.insertion_axis === '-Z' && Array.isArray(part.support_ids) && part.support_ids.every(text)
      && new Set(part.support_ids).size === part.support_ids.length
      && nonnegativeInteger(part.support_stud_sites), `${part.id} の共通ブロック配置・高さ・役割が不正です。`);
    requireThat(part.support_class === undefined || ['GROUND', 'OPEN_UNDERSIDE_SEATED_NOMINAL'].includes(part.support_class),
      `${part.id} の共通ブロック支持区分が不正です。`);
    ids.add(part.id);
    typeIds.add(part.type_id);
    colorIds.add(part.color_id);
    layers.add(part.layer);
  }
  for (const part of manifest.parts) {
    requireThat(part.attach_to === null || (ids.has(part.attach_to) && part.attach_to !== part.id),
      `${part.id} の接続先候補が不正です。`);
    requireThat(part.support_ids.every((id) => ids.has(id) && id !== part.id), `${part.id} の支持部品IDが不正です。`);
  }
  validateMetrics(manifest.metrics, candidateId, { estimateRequired: false });
  for (const [key, actual] of Object.entries({ part_count: ids.size, unique_types: typeIds.size, color_count: colorIds.size, layer_count: layers.size })) {
    requireThat(manifest.metrics[key] === actual, `部品から集計した ${key}（${actual}）が指標（${manifest.metrics[key]}）と一致しません。`);
  }
  const assembly = manifest.assembly;
  requireThat(record(assembly) && Number.isSafeInteger(assembly.graph_components) && assembly.graph_components > 0
    && Array.isArray(assembly.contact_edges) && assembly.contact_edge_count === assembly.contact_edges.length
    && nonnegativeInteger(assembly.contact_stud_sites) && assembly.mechanical_validation === 'UNKNOWN',
  '共通ブロックの接触グラフと実物未検証の宣言が一致しません。');
  if (assembly.retention_strength !== undefined) requireThat(assembly.retention_strength === 'UNKNOWN', '保持力の実物合格を推定できません。');
  const edges = new Set();
  const neighbors = new Map([...ids].map((id) => [id, new Set()]));
  let studSites = 0;
  for (const edge of assembly.contact_edges) {
    requireThat(Array.isArray(edge) && edge.length === 3 && ids.has(edge[0]) && ids.has(edge[1]) && edge[0] !== edge[1]
      && Number.isSafeInteger(edge[2]) && edge[2] > 0 && !edges.has(JSON.stringify(edge.slice(0, 2))),
    '接触辺の部品IDまたはスタッド数が不正です。');
    edges.add(JSON.stringify(edge.slice(0, 2)));
    neighbors.get(edge[0]).add(edge[1]);
    neighbors.get(edge[1]).add(edge[0]);
    studSites += edge[2];
  }
  requireThat(studSites === assembly.contact_stud_sites, '接触スタッド数の集計が宣言と一致しません。');
  const visited = new Set();
  let components = 0;
  for (const id of ids) {
    if (visited.has(id)) continue;
    components += 1;
    const queue = [id];
    visited.add(id);
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      for (const neighbor of neighbors.get(queue[cursor])) if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  requireThat(components === assembly.graph_components, '接触グラフの連結成分数が実部品の辺と一致しません。');
  requireThat(manifest.warnings === undefined || (Array.isArray(manifest.warnings) && manifest.warnings.every(text)),
    '注意事項の形式が不正です。');
  return manifest;
}

export function validateCommonPrototypes(prototypes) {
  requireThat(record(prototypes) && prototypes.schema_version === 3 && prototypes.units === 'mm'
    && prototypes.origin === 'body-bottom-center' && record(prototypes.types), '共通ブロックの実メッシュ形式・原点が不正です。');
  assertRevision(prototypes.revision);
  for (const [id, type] of Object.entries(prototypes.types)) {
    validateCommonType(type, id);
    requireThat(Array.isArray(type.vertices) && type.vertices.length >= 3 && type.vertices.every((point) => vector(point, 3)),
      `${id} の頂点データが不正です。`);
    requireThat(Array.isArray(type.faces) && type.faces.length > 0 && type.faces.every((face) =>
      Array.isArray(face) && face.length === 3 && face.every((index) => nonnegativeInteger(index) && index < type.vertices.length)
      && new Set(face).size === 3), `${id} の三角形データが不正です。`);
    const minima = [Infinity, Infinity, Infinity];
    const maxima = [-Infinity, -Infinity, -Infinity];
    for (const vertex of type.vertices) for (let axis = 0; axis < 3; axis += 1) {
      minima[axis] = Math.min(minima[axis], vertex[axis]);
      maxima[axis] = Math.max(maxima[axis], vertex[axis]);
    }
    const expectedMin = [-type.body_mm[0] / 2, -type.body_mm[1] / 2, 0];
    const expectedMax = [type.body_mm[0] / 2, type.body_mm[1] / 2, type.body_height_mm + type.stud_height_mm];
    requireThat(minima.every((value, axis) => Math.abs(value - expectedMin[axis]) <= 0.00001)
      && maxima.every((value, axis) => Math.abs(value - expectedMax[axis]) <= 0.00001),
    `${id} の実メッシュ外形が8 mm共通ブロックの寸法・底面原点と一致しません。`);
  }
  return prototypes;
}

export function validateCommonMatch(manifest, prototypes) {
  requireThat(prototypes.schema_version === 3 && prototypes.revision === manifest.revision
    && prototypes.origin === manifest.position_origin, '配置と実メッシュの版・原点が一致しません。');
  for (const typeId of new Set(manifest.parts.map((part) => part.type_id))) {
    const source = manifest.types[typeId];
    const native = prototypes.types[typeId];
    requireThat(native, `${typeId} の実部品形状がありません。代替形状は作成しません。`);
    for (const field of ['kind', 'pitch_mm', 'body_height_mm', 'layer_mm', 'plate_units', 'stud_diameter_mm', 'stud_height_mm', 'origin']) {
      requireThat(source[field] === native[field], `${typeId} の配置定義と実部品寸法が一致しません。`);
    }
    for (const field of ['cells', 'body_mm']) {
      requireThat(source[field].every((value, index) => close(value, native[field][index])), `${typeId} の配置定義と実部品寸法が一致しません。`);
    }
    for (const field of ['footprint_cells', 'stud_cells']) {
      const cells = (items) => items.map((cell) => cell.join(',')).sort().join(';');
      requireThat(cells(source[field]) === cells(native[field]), `${typeId} の占有セルと実形状が一致しません。`);
    }
  }
}
