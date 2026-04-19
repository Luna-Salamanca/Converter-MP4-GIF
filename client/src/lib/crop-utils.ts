/**
 * Crop rectangle helpers shared between the export pipeline and
 * the size estimation hook.
 */

export interface CropRect {
  x: number
  y: number
  w: number
  h: number
}

/**
 * Convert percentage-based crop values (0–100) to pixel values clamped
 * safely within the source video bounds.
 *
 * Guarantees:
 *  - x, y ≥ 0
 *  - w, h ≥ 1
 *  - x + w ≤ videoWidth
 *  - y + h ≤ videoHeight
 */
export function resolveCropRect(
  cropPct: { x: number; y: number; width: number; height: number },
  videoWidth: number,
  videoHeight: number
): CropRect {
  let x = Math.round((cropPct.x / 100) * videoWidth)
  let y = Math.round((cropPct.y / 100) * videoHeight)
  let w = Math.round((cropPct.width / 100) * videoWidth)
  let h = Math.round((cropPct.height / 100) * videoHeight)

  // Clamp origin
  x = Math.max(0, Math.min(x, videoWidth - 1))
  y = Math.max(0, Math.min(y, videoHeight - 1))

  // Clamp dimensions so they stay within bounds and are at least 1px
  w = Math.max(1, Math.min(w, videoWidth - x))
  h = Math.max(1, Math.min(h, videoHeight - y))

  return { x, y, w, h }
}
