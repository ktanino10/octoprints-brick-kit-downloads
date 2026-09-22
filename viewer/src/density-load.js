import { verifiedJSON, loadNativeLibraries } from './density-assets.js';
import { validateGuideManifest } from './density-state.js';
import { densityAssert as check } from '../../assets/density-data.js';

export async function loadDensityModel(entry, displayCatalog, { signal, detail } = {}) {
  const data = await verifiedJSON(entry.manifest, signal);
  const rootProof = data.root_validation ? await verifiedJSON(data.root_validation, signal) : null;
  const manifest = validateGuideManifest(data, entry.id, rootProof);
  if (rootProof) check(entry.whisker_support?.sequence_evidence_sha256 === manifest.root_validation.sha256
    && entry.whisker_support?.manifest_sha256 === manifest.source_manifest_sha256,
  '根元改訂の証拠が実ID・形状・組立順・支台数と一致しません。');
  check(manifest.metrics.part_count === entry.metrics.part_count && manifest.metrics.unique_types === entry.metrics.unique_types,
    'カタログと実3Dの部品数・使用型が一致しません。');
  if (displayCatalog) check(displayCatalog.schema_version === 1 && displayCatalog.study_id === manifest.study_id
    && displayCatalog.mode === 'DISPLAY_ONLY_LIGHTWEIGHT'
    && displayCatalog.roots_and_non_rectangular_types === 'UNCHANGED_NATIVE'
    && displayCatalog.selected_part_preview === 'UNCHANGED_NATIVE',
  '表示用軽量形状の原形指紋・誤差・変更範囲が不正です。');
  const available = displayCatalog?.cases[entry.id];
  const detailMode = detail ?? (available ? 'light' : 'native');
  check(['light', 'native'].includes(detailMode), '表示品質の指定が不正です。');
  if (available) check(available.source_manifest_sha256 === entry.manifest.sha256,
    '表示用軽量形状の原形指紋・誤差・変更範囲が不正です。');
  check(detailMode !== 'light' || available, 'この実案の表示用軽量モデルはまだありません。原形表示で開いてください。');
  const lightweightFiles = detailMode === 'light'
    ? available.geometry_files.filter(file => file.mode === 'NATIVE_PREVIEW_TESSELLATION') : [];
  for (const file of lightweightFiles) check(/^(?:BR|PL)-\d+x\d+-H\d+(?:-EDGE-C020)?$/.test(file.type_id)
    && manifest.types[file.type_id]?.geometry_sha256 === file.source_geometry_sha256,
  '表示用軽量形状の原形指紋・誤差・変更範囲が不正です。');
  const [nativeLibraries, lightweight] = await Promise.all([
    loadNativeLibraries(manifest.geometry_files, signal),
    lightweightFiles.length ? loadNativeLibraries(lightweightFiles, signal) : null,
  ]);
  signal?.throwIfAborted();
  const libraries = lightweight ? { mode: 'NATIVE_PREVIEW_TESSELLATION',
    types: { ...nativeLibraries.types, ...lightweight.types } } : nativeLibraries;
  return { manifest, rootProof, available, detailMode, libraries, nativeLibraries };
}
