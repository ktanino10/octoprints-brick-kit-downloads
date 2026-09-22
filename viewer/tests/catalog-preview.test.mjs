import test from 'node:test';
import assert from 'node:assert/strict';
import { Vector3 } from 'three';
import { rotatePreviewPosition } from '../src/catalog-preview.js';

test('catalogue rotation covers a full orbit without moving the target or changing radius or height', () => {
  const target = new Vector3(12, -9, 210), original = new Vector3(280, -520, 410);
  const radius = original.distanceTo(target), points = [];
  let position = original.clone();
  for (let step = 0; step < 12; step++) {
    position = rotatePreviewPosition(position, target, Math.PI / 6);
    points.push(position.clone());
    assert.ok(Math.abs(position.distanceTo(target) - radius) < 1e-8);
    assert.ok(Math.abs(position.z - original.z) < 1e-8);
  }
  assert.ok(position.distanceTo(original) < 1e-8);
  assert.ok(points.some(point => point.x < target.x) && points.some(point => point.x > target.x));
  assert.ok(points.some(point => point.y < target.y) && points.some(point => point.y > target.y));
  assert.deepEqual(target.toArray(), [12, -9, 210]);
  assert.deepEqual(original.toArray(), [280, -520, 410]);
});
