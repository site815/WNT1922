import test from 'node:test';
import assert from 'node:assert/strict';
import { nativeFPSLabel, receiveNativePerformance } from '../ui/native-performance.mjs';

test('native FPS updates only its text node, survives HUD replacement, and rejects invalid telemetry', () => {
  let writes = 0;
  const node = {get textContent() { return this.value; }, set textContent(value) { ++writes; this.value = value; }};
  const document = {querySelectorAll(selector) { assert.equal(selector, '[data-native-fps]'); return [node]; }};
  assert(receiveNativePerformance({fps:59.8}, document));
  assert.equal(node.textContent, '60 FPS');
  assert.equal(nativeFPSLabel(), '60 FPS', 'A full campaign render can restore the cached native sample');
  assert(receiveNativePerformance({fps:60.1}, document));
  assert.equal(writes, 1, 'Unchanged rounded FPS does not mutate the DOM');
  for (const fps of [undefined, null, '60', NaN, Infinity, -1, 0, 10001]) assert.equal(receiveNativePerformance({fps}, document), false);
  assert.equal(writes, 1);
  assert(receiveNativePerformance({fps:48}, {querySelectorAll:() => []}), 'Title-screen samples need no campaign DOM');
  assert.equal(nativeFPSLabel(), '48 FPS');
});
