export class DataError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DataError';
  }
}

export const requireThat = (condition, message) => { if (!condition) throw new DataError(message); };
export const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
export const finite = (value) => typeof value === 'number' && Number.isFinite(value);
export const nonnegativeInteger = (value) => Number.isSafeInteger(value) && value >= 0;
export const positive = (value) => finite(value) && value > 0;
export const vector = (value, size) => Array.isArray(value) && value.length === size && value.every(finite);
export const text = (value) => typeof value === 'string' && value.length > 0;
export const owns = (value, key) => Object.hasOwn(value, key);

export function validateFootprint(type, label, required = false) {
  if (!required && type.footprint_cells === undefined) return;
  requireThat(Array.isArray(type.footprint_cells) && type.footprint_cells.length > 0, `${label} の占有セル定義がありません。`);
  const occupied = new Set();
  for (const cell of type.footprint_cells) {
    requireThat(Array.isArray(cell) && cell.length === 2
      && cell.every(nonnegativeInteger) && cell[0] < type.cells[0] && cell[1] < type.cells[1], `${label} の占有セルが外接範囲外です。`);
    const key = cell.join(',');
    requireThat(!occupied.has(key), `${label} の占有セルが重複しています。`);
    occupied.add(key);
  }
  const pending = [type.footprint_cells[0]];
  const visited = new Set([pending[0].join(',')]);
  for (let cursor = 0; cursor < pending.length; cursor += 1) {
    const [x, y] = pending[cursor];
    for (const next of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
      const key = next.join(',');
      if (occupied.has(key) && !visited.has(key)) { visited.add(key); pending.push(next); }
    }
  }
  requireThat(visited.size === occupied.size, `${label} の占有セルが連結していません。`);
}

export function validateMetrics(metrics, name = 'モデル', { estimateRequired = true } = {}) {
  requireThat(record(metrics), `${name}の指標がありません。`);
  for (const key of ['part_count', 'unique_types', 'color_count', 'layer_count']) {
    requireThat(nonnegativeInteger(metrics[key]) && metrics[key] > 0, `${name}の ${key} が不正です。`);
  }
  for (const key of ['height_mm', 'width_mm', 'depth_mm']) {
    requireThat(positive(metrics[key]), `${name}の ${key} が不正です。`);
  }
  if (estimateRequired || metrics.approx_build_hours !== undefined) {
    requireThat(vector(metrics.approx_build_hours, 2)
      && metrics.approx_build_hours[0] >= 0
      && metrics.approx_build_hours[1] >= metrics.approx_build_hours[0], `${name}の組立目安が不正です。`);
  }
  return metrics;
}
