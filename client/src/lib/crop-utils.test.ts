import assert from 'node:assert/strict'
import test from 'node:test'

import { resolveCropRect } from './crop-utils'

test('resolveCropRect converts percentage crop to pixels', () => {
  const rect = resolveCropRect(
    { x: 10, y: 20, width: 50, height: 25 },
    1920,
    1080
  )

  assert.deepEqual(rect, {
    x: 192,
    y: 216,
    w: 960,
    h: 270,
  })
})

test('resolveCropRect clamps origin and dimensions inside bounds', () => {
  const rect = resolveCropRect(
    { x: -10, y: 95, width: 120, height: 40 },
    100,
    200
  )

  assert.deepEqual(rect, {
    x: 0,
    y: 190,
    w: 100,
    h: 10,
  })
})

test('resolveCropRect enforces minimum crop size of 1x1', () => {
  const rect = resolveCropRect({ x: 99.9, y: 99.9, width: 0, height: 0 }, 5, 5)

  assert.deepEqual(rect, {
    x: 4,
    y: 4,
    w: 1,
    h: 1,
  })
})
