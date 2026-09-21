import { densityAssert as check } from '../../assets/density-data.js';

const modes = new Set(['assembled', 'radial', 'assembly']);

export function readDensityView(params, index) {
  const mode = params.get('mode') ?? 'assembled';
  const rawStep = params.get('step') ?? String(index.ordered.length);
  const rawExplode = params.get('explode') ?? '0';
  check(modes.has(mode) && /^\d+$/.test(rawStep)
    && /^(?:0(?:\.\d+)?|1(?:\.0+)?)$/.test(rawExplode), '共有された表示モード・組立位置・分解量が不正です。');
  const steps = Number(rawStep), explosion = Number(rawExplode);
  check(Number.isSafeInteger(steps) && steps >= 0 && steps <= index.ordered.length, '共有URLの組立位置が実部品数を超えています。');
  const part = params.get('part');
  check(part === null || index.byId.has(part), '共有URLの部品IDがこの実案に存在しません。');
  let camera = null;
  if (params.has('camera')) {
    camera = params.get('camera').split(',').map(Number);
    check(camera.length === 6 && camera.every((value) => Number.isFinite(value) && Math.abs(value) < 1_000_000)
      && Math.hypot(camera[0] - camera[3], camera[1] - camera[4], camera[2] - camera[5]) > 0.01,
    '共有された3Dカメラが不正です。');
  }
  const query = params.get('q') ?? '';
  check(query.length <= 200, '共有された検索条件が長すぎます。');
  return { mode, steps, explosion: mode === 'radial' ? explosion : 0, part, camera, query,
    same: params.get('same') === '1' };
}

export function writeDensityView(url, state) {
  const next = new URL(url);
  next.searchParams.set('case', state.candidate);
  next.searchParams.set('mode', state.mode);
  next.searchParams.set('step', String(state.steps));
  next.searchParams.set('explode', String(state.explosion));
  for (const [key, value] of [
    ['part', state.part], ['q', state.query], ['same', state.same ? '1' : null],
    ['camera', state.camera?.map((number) => Number(number.toFixed(5))).join(',')],
  ]) {
    if (value) next.searchParams.set(key, value);
    else next.searchParams.delete(key);
  }
  return next;
}
