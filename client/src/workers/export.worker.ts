/// <reference lib="webworker" />
import { GIFEncoder, quantize } from 'gifenc'
import type { WorkerRequest } from './export.types'

function applyPaletteExact(
  rgba: Uint8ClampedArray | Uint8Array,
  palette: number[][],
  cache: Map<number, number>
) {
  const index = new Uint8Array(rgba.length / 4)
  for (let i = 0; i < rgba.length; i += 4) {
    const r = rgba[i]
    const g = rgba[i + 1]
    const b = rgba[i + 2]

    const key = (r << 16) | (g << 8) | b
    let idx = cache.get(key)

    if (idx === undefined) {
      let mindist = 1e100
      let k = 0
      for (let j = 0; j < palette.length; j++) {
        const p = palette[j]
        const dist = (p[0] - r) ** 2 + (p[1] - g) ** 2 + (p[2] - b) ** 2
        if (dist < mindist) {
          mindist = dist
          k = j
        }
      }
      idx = k
      cache.set(key, k)
    }
    index[i / 4] = idx
  }
  return index
}

let encoder: ReturnType<typeof GIFEncoder> | null = null
let globalPalette: number[][] | null = null
let colorCache = new Map<number, number>()
let isCancelled = false

function resetState() {
  encoder = null
  globalPalette = null
  colorCache.clear()
  isCancelled = false
}

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const request = e.data

  if (request.type === 'CANCEL') {
    isCancelled = true
    resetState()
    return
  }

  if (request.type === 'INIT_PALETTE') {
    isCancelled = false
    try {
      const { samples, maxColors } = request.payload
      const totalLength = samples.reduce(
        (sum: number, arr: Uint8ClampedArray) => sum + arr.length,
        0
      )
      const combined = new Uint8ClampedArray(totalLength)
      let offset = 0
      for (const pixels of samples) {
        combined.set(pixels, offset)
        offset += pixels.length
      }

      globalPalette = quantize(combined, maxColors)
      encoder = GIFEncoder()
      colorCache.clear()

      if (!isCancelled) {
        self.postMessage({ type: 'PALETTE_READY' })
      }
    } catch (err: any) {
      self.postMessage({
        type: 'ERROR',
        payload: { error: err.message || 'Unknown error during quantize' },
      })
    }
  }

  if (request.type === 'ENCODE_FRAME') {
    if (isCancelled) return
    try {
      const { frameData, width, height, delay, index } = request.payload
      if (!globalPalette || !encoder)
        throw new Error('Worker not initialized with palette')

      const colorIndex = applyPaletteExact(frameData, globalPalette, colorCache)
      encoder.writeFrame(colorIndex, width, height, {
        palette: globalPalette,
        delay,
        repeat: 0,
      })

      if (!isCancelled) {
        self.postMessage({
          type: 'FRAME_ENCODED',
          payload: { frameIndex: index },
        })
      }
    } catch (err: any) {
      self.postMessage({
        type: 'ERROR',
        payload: {
          error: err.message || 'Unknown error during encoding frame',
        },
      })
    }
  }

  if (request.type === 'FINISH') {
    if (isCancelled) return
    try {
      if (!encoder) throw new Error('Worker not initialized with palette')
      encoder.finish()
      const raw = encoder.bytes()

      // We must copy the array buffer into a new standard ArrayBuffer for transferability,
      // as `raw.buffer` might be tied to WASM memory in some implementations
      const buf = new ArrayBuffer(raw.byteLength)
      new Uint8Array(buf).set(raw)

      self.postMessage({ type: 'FINISHED', payload: { buffer: buf } }, [buf])

      resetState()
    } catch (err: any) {
      self.postMessage({
        type: 'ERROR',
        payload: { error: err.message || 'Error finishing GIF' },
      })
    }
  }
}
