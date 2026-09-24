import { assetURL } from '../../assets/i18n.js';
import { densityAssert as check, densityPath, validateDensityFile, validateNativeGeometryFile,
  isObject, isHash, isCount } from '../../assets/density-data.js';

export async function verifiedBytes(file, signal, { nativeGeometry = false } = {}) {
  if (nativeGeometry) validateNativeGeometryFile(file);
  else validateDensityFile(file);
  const url = nativeGeometry && file.storage === 'PUBLIC_REPO_COMMIT'
    ? file.url : assetURL(densityPath(file.path ?? file.url));
  const response = await fetch(url, {
    credentials: 'omit', redirect: 'error',
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(120000)]) : AbortSignal.timeout(120000),
  });
  check(response.ok, `実データを取得できません（HTTP ${response.status}）。`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))]
    .map((byte) => byte.toString(16).padStart(2, '0')).join('');
  check(bytes.length === file.bytes && hash === file.sha256, '実データのバイト数・ハッシュが公開記録と一致しません。');
  return bytes;
}

export async function inflateIfNeeded(bytes) {
  if (bytes[0] !== 0x1f || bytes[1] !== 0x8b) return bytes;
  check(typeof DecompressionStream === 'function', 'このブラウザーは圧縮した実形状を展開できません。対応する最新版で開いてください。');
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function verifiedJSON(file, signal) {
  const packed = await verifiedBytes(file, signal);
  if (file.encoding === 'gzip') check(packed[0] === 0x1f && packed[1] === 0x8b,
    '検査記録の輸送形式が、宣言されたgzipと一致しません。');
  const bytes = await inflateIfNeeded(packed);
  if (file.encoding === 'gzip') {
    const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))]
      .map(byte => byte.toString(16).padStart(2, '0')).join('');
    check(bytes.length === file.decoded_bytes && digest === file.decoded_sha256,
      '展開した検査記録が元の実データのバイト数・SHA-256と一致しません。');
  }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
}

export async function decodeMeshPack(input) {
  const bytes = input.byteOffset === 0 && input.byteLength === input.buffer.byteLength
    ? input : input.slice();
  check(bytes.length >= 12 && new TextDecoder().decode(bytes.subarray(0, 8)) === 'OCBMESH1',
    '共有メッシュの形式が不正です。代替形状は表示しません。');
  const view = new DataView(bytes.buffer);
  const headerLength = view.getUint32(8, true);
  check(headerLength > 0 && headerLength <= 8_000_000 && 12 + headerLength <= bytes.length,
    '共有メッシュのヘッダー範囲が不正です。');
  const header = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(12, 12 + headerLength)));
  const start = Math.ceil((12 + headerLength) / 4) * 4;
  check(header.schema_version === 1 && header.units === 'mm' && header.origin === 'body-bottom-center'
    && ['NATIVE_FLOAT32', 'NATIVE_PREVIEW_TESSELLATION'].includes(header.mode)
    && Array.isArray(header.types) && header.types.length > 0,
  '共有メッシュの単位・原点・元形状の区分が不正です。');
  const types = Object.create(null);
  const intervals = [];
  for (const type of header.types) {
    check(isObject(type) && typeof type.id === 'string' && type.id.length > 0 && !Object.hasOwn(types, type.id)
      && isCount(type.vertex_count) && type.vertex_count >= 3
      && isCount(type.index_count) && type.index_count > 0 && type.index_count % 3 === 0
      && isHash(type.geometry_sha256)
      && isCount(type.positions_byte_offset) && type.positions_byte_offset % 4 === 0
      && isCount(type.indices_byte_offset) && type.indices_byte_offset % 4 === 0,
    '型別共有メッシュの寸法・インデックス・指紋が不正です。');
    const pStart = start + type.positions_byte_offset, iStart = start + type.indices_byte_offset;
    const pEnd = pStart + type.vertex_count * 12, iEnd = iStart + type.index_count * 4;
    check(pEnd <= bytes.length && iEnd <= bytes.length && Number.isSafeInteger(pEnd) && Number.isSafeInteger(iEnd),
      '共有メッシュの頂点・面がファイル範囲外です。');
    intervals.push([pStart, pEnd], [iStart, iEnd]);
    const positions = new Float32Array(bytes.buffer, pStart, type.vertex_count * 3);
    const indices = new Uint32Array(bytes.buffer, iStart, type.index_count);
    check(positions.every(Number.isFinite) && indices.every((n) => n < type.vertex_count),
      '実メッシュに非数または存在しない頂点参照があります。');
    for (let index = 0; index < indices.length; index += 3) {
      check(indices[index] !== indices[index + 1] && indices[index] !== indices[index + 2]
        && indices[index + 1] !== indices[index + 2], '実メッシュに重複頂点の三角形があります。');
    }
    const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256',
      await new Blob([bytes.subarray(pStart, pEnd), bytes.subarray(iStart, iEnd)]).arrayBuffer()))]
      .map((byte) => byte.toString(16).padStart(2, '0')).join('');
    check(digest === type.geometry_sha256, '型別の頂点・面が記録された実メッシュと一致しません。');
    types[type.id] = { ...type, positions, indices };
  }
  intervals.sort((a, b) => a[0] - b[0]);
  check(intervals[0][0] === start && intervals.every((range, index) => index === 0 || range[0] === intervals[index - 1][1])
    && intervals.at(-1)[1] === bytes.length, '共有メッシュに重複または未使用のデータ範囲があります。');
  return { mode: header.mode, precision_note: header.precision_note, types };
}

export async function decodeNativeType(input, file) {
  const bytes = input.byteOffset === 0 && input.byteLength === input.buffer.byteLength ? input : input.slice();
  check(bytes.length >= 12 && new TextDecoder().decode(bytes.subarray(0, 4)) === 'OBM1'
    && typeof file.type_id === 'string' && isHash(file.geometry_sha256),
  '型別の実ネイティブメッシュと識別子が一致しません。');
  const view = new DataView(bytes.buffer);
  const vertexCount = view.getUint32(4, true), faceCount = view.getUint32(8, true);
  const endVertices = 12 + vertexCount * 12;
  check(vertexCount >= 3 && faceCount > 0 && bytes.length === endVertices + faceCount * 12,
    '型別の実メッシュの頂点・面のバイト数が不正です。');
  const positions = new Float32Array(bytes.buffer, 12, vertexCount * 3);
  const indices = new Uint32Array(bytes.buffer, endVertices, faceCount * 3);
  check(positions.every(Number.isFinite) && indices.every((index) => index < vertexCount),
    '実メッシュに非数または存在しない頂点参照があります。');
  for (let index = 0; index < indices.length; index += 3) {
    check(indices[index] !== indices[index + 1] && indices[index] !== indices[index + 2]
      && indices[index + 1] !== indices[index + 2], '実メッシュに重複頂点の三角形があります。');
  }
  const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes.subarray(12)))]
    .map((byte) => byte.toString(16).padStart(2, '0')).join('');
  check(digest === file.geometry_sha256, '型別の頂点・面が記録された実メッシュと一致しません。');
  const lightweight = file.mode === 'NATIVE_PREVIEW_TESSELLATION';
  if (lightweight) check(isHash(file.source_geometry_sha256)
    && file.quality?.original_vertex_positions_retained === true && file.quality?.manufacturing_geometry_modified === false
    && Number.isFinite(file.quality.approximate_error_mm) && file.quality.approximate_error_mm <= 0.040001,
  '表示用軽量形状の原形指紋・誤差・変更範囲が不正です。');
  return { mode: lightweight ? 'NATIVE_PREVIEW_TESSELLATION' : 'NATIVE_FLOAT32',
    types: { [file.type_id]: { positions, indices, geometry_sha256: digest,
      ...(lightweight ? { source_geometry_sha256: file.source_geometry_sha256 } : {}) } } };
}

let losslessDecoder;
export async function decodeLosslessNativeType(input, file) {
  validateNativeGeometryFile(file);
  const bytes = input.byteOffset === 0 && input.byteLength === input.buffer.byteLength ? input : input.slice();
  check(file.format === 'OBM1_MESHOPT_GZIP' && bytes.length >= 24
    && new TextDecoder().decode(bytes.subarray(0, 8)) === 'OBMLZ001',
  '可逆圧縮した原形は、元の全頂点・面順・バイト列と固定ネイティブ指紋を保持する必要があります。');
  const header = new DataView(bytes.buffer);
  const vertices = header.getUint32(8, true), faces = header.getUint32(12, true);
  const vertexBytes = header.getUint32(16, true), indexBytes = header.getUint32(20, true);
  check(vertices >= 3 && faces > 0 && vertexBytes > 0 && indexBytes > 0
    && bytes.length === 24 + vertexBytes + indexBytes
    && file.decoded_bytes === 12 + vertices * 12 + faces * 12,
  '型別の実メッシュの頂点・面のバイト数が不正です。');
  losslessDecoder ??= import('meshoptimizer/decoder').then(async module => {
    await module.MeshoptDecoder.ready;
    return module.MeshoptDecoder;
  });
  const decoder = await losslessDecoder;
  const restored = new Uint8Array(file.decoded_bytes), view = new DataView(restored.buffer);
  restored.set(new TextEncoder().encode('OBM1')); view.setUint32(4, vertices, true); view.setUint32(8, faces, true);
  decoder.decodeVertexBuffer(restored.subarray(12, 12 + vertices * 12), vertices, 12, bytes.subarray(24, 24 + vertexBytes));
  decoder.decodeIndexSequence(restored.subarray(12 + vertices * 12), faces * 3, 4, bytes.subarray(24 + vertexBytes));
  const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', restored))]
    .map(value => value.toString(16).padStart(2, '0')).join('');
  check(digest === file.decoded_sha256, '可逆圧縮した原形は、元の全頂点・面順・バイト列と固定ネイティブ指紋を保持する必要があります。');
  return decodeNativeType(restored, file);
}

export async function loadNativeLibraries(files, signal) {
  const result = { mode: 'NATIVE_FLOAT32', types: Object.create(null), precision_notes: [] };
  const controller = new AbortController();
  const combined = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;
  let cursor = 0;
  async function loadNext() {
    while (cursor < files.length) {
      const file = files[cursor++];
      const bytes = await inflateIfNeeded(await verifiedBytes(file, combined, { nativeGeometry: true }));
      const library = file.format === 'OBM1_MESHOPT_GZIP' ? await decodeLosslessNativeType(bytes, file)
        : file.format === 'OBM1_GZIP' ? await decodeNativeType(bytes, file) : await decodeMeshPack(bytes);
      for (const [id, type] of Object.entries(library.types)) {
        check(!Object.hasOwn(result.types, id), '共有型IDが複数の形状ライブラリーで重複しています。');
        result.types[id] = type;
      }
      if (library.mode === 'NATIVE_PREVIEW_TESSELLATION') result.mode = library.mode;
      if (library.precision_note) result.precision_notes.push(library.precision_note);
    }
  }
  try { await Promise.all(Array.from({ length: Math.min(6, files.length) }, loadNext)); }
  catch (error) { controller.abort(); throw error; }
  return result;
}
