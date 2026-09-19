const record = (value) => value && typeof value === 'object' && !Array.isArray(value);
const integer = (value, maximum) => Number.isSafeInteger(value) && value >= 0 && value <= maximum;
const camera = (value) => Array.isArray(value) && value.length === 6
  && value.every((number) => Number.isFinite(number) && Math.abs(number) < 100000)
  && Math.hypot(value[0] - value[3], value[1] - value[4], value[2] - value[5]) > 0.01;

export function readViewState(value, { candidate, layers, steps, parts, supportClasses }) {
  if (!value) return null;
  if (value.length > 8000) throw new Error('共有ビューの指定が長すぎます。');
  let state;
  try { state = JSON.parse(value); }
  catch { throw new Error('共有ビューのJSONを読み込めません。'); }
  if (!record(state) || state.candidate !== candidate
      || !record(state.progress) || !integer(state.progress.layers, layers)
      || !integer(state.progress.steps, steps) || !Number.isFinite(state.progress.explosion)
      || state.progress.explosion < 0 || state.progress.explosion > 1
      || !camera(state.camera) || (state.part !== null && !parts.has(state.part))
      || typeof state.query !== 'string' || state.query.length > 1000
      || typeof state.visibleOnly !== 'boolean' || typeof state.undersideOnly !== 'boolean'
      || !['colors', 'types', 'combined'].includes(state.bom)
      || !integer(state.page, parts.size) || typeof state.support !== 'string'
      || (state.support && !supportClasses.has(state.support))) {
    throw new Error('共有ビューの部品・進行・視点の指定が不正です。現在のモデルを確認してください。');
  }
  return state;
}

export function writeViewState(url, state) {
  const target = new URL(url);
  target.searchParams.set('candidate', state.candidate);
  target.searchParams.set('view', JSON.stringify(state));
  return target;
}
