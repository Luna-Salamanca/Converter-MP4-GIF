import assert from 'node:assert/strict'
import test from 'node:test'

import { getVideo, setVideo } from './video-state'

test('setVideo stores file/url and revokes previous object URL', () => {
  const originalCreate = URL.createObjectURL
  const originalRevoke = URL.revokeObjectURL

  const revoked: string[] = []
  let seq = 0

  URL.createObjectURL = () => `blob:test-${++seq}`
  URL.revokeObjectURL = (url: string) => {
    revoked.push(url)
  }

  try {
    const fileOne = { name: 'one.mp4' } as File
    const fileTwo = { name: 'two.mp4' } as File

    setVideo(fileOne)
    assert.deepEqual(getVideo(), { file: fileOne, url: 'blob:test-1' })
    assert.deepEqual(revoked, [])

    setVideo(fileTwo)
    assert.deepEqual(getVideo(), { file: fileTwo, url: 'blob:test-2' })
    assert.deepEqual(revoked, ['blob:test-1'])
  } finally {
    URL.createObjectURL = originalCreate
    URL.revokeObjectURL = originalRevoke
  }
})
