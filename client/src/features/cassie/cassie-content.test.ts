import assert from 'node:assert/strict'
import test from 'node:test'

import { getAllImagesFromFolder } from './cassie-content'

test('getAllImagesFromFolder returns prefixed image paths', () => {
  const images = getAllImagesFromFolder()

  assert.ok(images.length > 0)
  for (const image of images) {
    assert.ok(image.startsWith('/Converter-MP4-GIF/images-optimized/'))
    assert.ok(image.endsWith('.jpg'))
  }
})

test('getAllImagesFromFolder returns unique, deterministic ordering', () => {
  const first = getAllImagesFromFolder()
  const second = getAllImagesFromFolder()

  assert.deepEqual(first, second)
  assert.equal(new Set(first).size, first.length)
})
