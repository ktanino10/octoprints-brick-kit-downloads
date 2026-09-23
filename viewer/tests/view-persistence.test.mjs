import test from 'node:test';
import assert from 'node:assert/strict';
import { createViewPersistence } from '../src/view-persistence.js';

function fixture() {
  let time = 0, wanted = 'initial', saved = 'initial', next = 0;
  const tasks = new Map(), writes = [], errors = [];
  const persistence = createViewPersistence({
    readURL: () => wanted, currentURL: () => saved,
    replace: value => { writes.push({ time, value }); saved = value; },
    now: () => time, onError: error => errors.push(error),
    schedule: (fn, delay) => { const id = ++next; tasks.set(id, { at: time + delay, fn }); return id; },
    cancel: id => tasks.delete(id),
  });
  return {
    persistence, writes, errors, setURL: value => { wanted = value; },
    advance(delta) {
      const end = time + delta;
      while (true) {
        const first = [...tasks].filter(([, row]) => row.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!first) break;
        tasks.delete(first[0]); time = first[1].at; first[1].fn();
      }
      time = end;
    },
  };
}

test('rapid assembly, selection and camera updates stay below browser URL quotas and persist the latest state', () => {
  const f = fixture();
  for (let index = 0; index < 1000; index++) {
    f.setURL(`step=${index}`); f.persistence.request(); f.advance(10);
  }
  f.advance(250);
  assert.ok(f.writes.length <= 41);
  assert.equal(f.writes.at(-1).value, 'step=999');
  assert.ok(f.writes.every((row, index) => index === 0 || row.time - f.writes[index - 1].time >= 250));
  assert.equal(f.errors.length, 0);
});

test('duplicate updates consume no writes and final flush saves current state without leaving a stale timer', () => {
  const f = fixture();
  f.persistence.request(); f.advance(0); assert.equal(f.writes.length, 0);
  f.setURL('step=1'); f.persistence.request(); f.advance(0);
  f.setURL('step=2'); f.persistence.request(); f.persistence.flush();
  assert.equal(f.writes.at(-1).value, 'step=2');
  const count = f.writes.length; f.advance(1000); assert.equal(f.writes.length, count);
  f.setURL('stale-old-case'); f.persistence.request(); f.persistence.cancel(); f.advance(1000);
  assert.equal(f.writes.length, count);
});

test('a persistence failure is reported separately instead of interrupting the assembly input handler', () => {
  let deferred, called = false;
  const errors = [];
  const persistence = createViewPersistence({
    readURL: () => 'new', currentURL: () => 'old',
    replace: () => { called = true; throw new Error('Browser quota'); },
    onError: error => errors.push(error.message),
    schedule: fn => { deferred = fn; return 1; }, cancel: () => {},
  });
  assert.doesNotThrow(() => persistence.request());
  assert.equal(called, false);
  assert.doesNotThrow(() => deferred());
  assert.deepEqual(errors, ['Browser quota']);
});
