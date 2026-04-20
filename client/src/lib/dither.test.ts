import assert from 'node:assert/strict'
import test from 'node:test'

import { applyOrderedDither } from './dither'

test('applyOrderedDither adjusts RGB channels based on Bayer matrix offsets', () => {
  const data = new Uint8ClampedArray([100, 100, 100, 50, 100, 100, 100, 60])

  applyOrderedDither(data, 2, 1, 16)

  assert.deepEqual(Array.from(data), [92, 92, 92, 50, 100, 100, 100, 60])
})

test('applyOrderedDither preserves alpha and clamps RGB values', () => {
  const data = new Uint8ClampedArray([1, 1, 1, 10, 252, 252, 252, 20])

  applyOrderedDither(data, 1, 2, 16)

  assert.deepEqual(Array.from(data), [0, 0, 0, 10, 255, 255, 255, 20])
})
