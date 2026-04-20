import assert from 'node:assert/strict'
import test from 'node:test'

import { STORAGE_KEY, validatePassword } from './cassie-config'

test('validatePassword trims surrounding whitespace', () => {
  assert.equal(validatePassword(' sharkie '), true)
})

test('validatePassword rejects incorrect casing and values', () => {
  assert.equal(validatePassword('Sharkie'), false)
  assert.equal(validatePassword('sharkie!'), false)
})

test('STORAGE_KEY remains stable', () => {
  assert.equal(STORAGE_KEY, 'cassie_content_unlocked')
})
