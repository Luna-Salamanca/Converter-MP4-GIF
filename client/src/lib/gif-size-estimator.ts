/**
 * Content-aware GIF size estimation.
 *
 * Uses sampled frame data and a mini trial-encode to produce
 * an estimated size range rather than a single flat heuristic.
 */
import { GIFEncoder, quantize, applyPalette } from 'gifenc'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface EstimationInput {
  /** Total number of frames in the final GIF */
  totalFrames: number
  /** Output width in pixels */
  width: number
  /** Output height in pixels */
  height: number
  /** Max colours used by the palette (derived from quality) */
  maxColors: number
  /** Inter-frame delay in ms */
  delay: number
  /** Whether draft/fast mode is enabled */
  fastMode: boolean
}

export interface EstimationResult {
  /** Estimated lower-bound bytes */
  lowBytes: number
  /** Estimated mid-point bytes */
  midBytes: number
  /** Estimated upper-bound bytes */
  highBytes: number
  /** Complexity rating: low / medium / high */
  complexity: 'low' | 'medium' | 'high'
}

/* ------------------------------------------------------------------ */
/*  Frame-level complexity metrics                                     */
/* ------------------------------------------------------------------ */

/**
 * Count approximate unique colours in an RGBA pixel buffer.
 * Uses a Set of packed RGB values (ignoring alpha) sampled
 * at a stride for speed.
 */
function countUniqueColors(rgba: Uint8ClampedArray, stride = 4): number {
  const seen = new Set<number>()
  for (let i = 0; i < rgba.length; i += 4 * stride) {
    // pack r,g,b into one 24-bit int
    seen.add((rgba[i] << 16) | (rgba[i + 1] << 8) | rgba[i + 2])
  }
  return seen.size
}

/**
 * Mean absolute difference (MAD) between two RGBA buffers.
 * Returns a value in [0, 255]. A higher value means more inter-frame
 * motion / change.
 */
function meanAbsDiff(
  a: Uint8ClampedArray,
  b: Uint8ClampedArray,
  stride = 4
): number {
  let sum = 0
  let count = 0
  const len = Math.min(a.length, b.length)
  for (let i = 0; i < len; i += 4 * stride) {
    sum += Math.abs(a[i] - b[i]) // R
    sum += Math.abs(a[i + 1] - b[i + 1]) // G
    sum += Math.abs(a[i + 2] - b[i + 2]) // B
    count += 3
  }
  return count > 0 ? sum / count : 0
}

/* ------------------------------------------------------------------ */
/*  Trial encode: encode a few frames and measure bytes               */
/* ------------------------------------------------------------------ */

/**
 * Encode a handful of sample frames with the same gifenc pipeline and
 * return the byte length of the resulting mini-GIF.
 */
function trialEncode(
  samples: Uint8ClampedArray[],
  width: number,
  height: number,
  maxColors: number,
  delay: number
): number {
  if (samples.length === 0) return 0

  // Build palette from all samples (same as real export)
  const totalLength = samples.reduce((s, arr) => s + arr.length, 0)
  const combined = new Uint8ClampedArray(totalLength)
  let offset = 0
  for (const px of samples) {
    combined.set(px, offset)
    offset += px.length
  }
  const palette = quantize(combined, maxColors)

  const encoder = GIFEncoder()
  for (const frame of samples) {
    const index = applyPalette(frame, palette)
    encoder.writeFrame(index, width, height, {
      palette,
      delay,
      repeat: 0,
    })
  }
  encoder.finish()
  return encoder.bytes().byteLength
}

/* ------------------------------------------------------------------ */
/*  Main estimation function                                           */
/* ------------------------------------------------------------------ */

/**
 * Produce a content-aware size estimate from sampled frames.
 *
 * @param samples  Array of RGBA pixel buffers (Uint8ClampedArray) from
 *                 evenly-spaced sample frames (3–5 is ideal).
 * @param input    Export parameters.
 */
export function estimateGifSize(
  samples: Uint8ClampedArray[],
  input: EstimationInput
): EstimationResult {
  const { totalFrames, width, height, maxColors, delay } = input

  if (samples.length === 0 || totalFrames === 0) {
    return { lowBytes: 0, midBytes: 0, highBytes: 0, complexity: 'low' }
  }

  /* ---------- 1. Complexity metrics ---------- */

  // Unique-colour density (0–1 scale, 1 = every sampled pixel unique)
  const pixelsPerFrame = width * height
  const colourCounts = samples.map((s) => countUniqueColors(s))
  const avgUniqueColors =
    colourCounts.reduce((a, b) => a + b, 0) / colourCounts.length
  // Normalise against the pixels we actually sampled (stride-adjusted)
  const sampledPixels = Math.ceil(pixelsPerFrame / 4) // stride=4 in countUniqueColors
  const colorDensity = Math.min(1, avgUniqueColors / sampledPixels)

  // Inter-frame motion (0–255 scale)
  let avgMotion = 0
  if (samples.length > 1) {
    const diffs: number[] = []
    for (let i = 1; i < samples.length; i++) {
      diffs.push(meanAbsDiff(samples[i - 1], samples[i]))
    }
    avgMotion = diffs.reduce((a, b) => a + b, 0) / diffs.length
  }

  // Complexity score in [0, 1]
  const motionScore = Math.min(1, avgMotion / 60) // 60 MAD ≈ heavy motion
  const complexityScore = 0.4 * colorDensity + 0.6 * motionScore

  const complexity: EstimationResult['complexity'] =
    complexityScore < 0.25 ? 'low' : complexityScore < 0.55 ? 'medium' : 'high'

  /* ---------- 2. Trial encode ---------- */

  const trialBytes = trialEncode(samples, width, height, maxColors, delay)
  const bytesPerSampleFrame = trialBytes / samples.length

  /* ---------- 3. Extrapolate ---------- */

  // The trial encode includes GIF header/trailer overhead which is
  // amortised over more frames in the real export.  We use the per-frame
  // average from the trial and simply scale up.
  const rawEstimate = bytesPerSampleFrame * totalFrames

  // The trial uses evenly-spaced samples, so it might under- or
  // over-represent motion between them. Apply a complexity-based spread.
  const spreadFactor = 0.15 + 0.25 * complexityScore // 15% – 40% spread

  const midBytes = Math.round(rawEstimate)
  const lowBytes = Math.round(rawEstimate * (1 - spreadFactor))
  const highBytes = Math.round(rawEstimate * (1 + spreadFactor))

  return { lowBytes, midBytes, highBytes, complexity }
}

/* ------------------------------------------------------------------ */
/*  Formatting helpers                                                 */
/* ------------------------------------------------------------------ */

/** Format bytes into a human-readable string (KB / MB). */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 KB'
  const mb = bytes / (1024 * 1024)
  if (mb < 1) return `${Math.round(mb * 1024)} KB`
  if (mb < 10) return `${mb.toFixed(1)} MB`
  return `${Math.round(mb)} MB`
}

/** Format an EstimationResult into a user-facing range string. */
export function formatEstimationRange(result: EstimationResult): string {
  const lo = formatBytes(result.lowBytes)
  const hi = formatBytes(result.highBytes)
  if (lo === hi) return `~${lo}`
  return `${lo} – ${hi}`
}
