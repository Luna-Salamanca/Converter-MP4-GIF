import { useState, useEffect, useRef, useCallback } from 'react'
import { getVideo } from '@/lib/video-state'
import { resolveCropRect } from '@/lib/crop-utils'
import {
  estimateGifSize,
  formatEstimationRange,
  type EstimationResult,
} from '@/lib/gif-size-estimator'
import { sampleFrames, clearSampleCache } from '@/lib/export-frame-sampler'

export interface SizeEstimateSettings {
  fps: number
  compression: number
  width: string // 'original' | '720' | '480' | '360'
  trimRange: [number, number]
  crop: { x: number; y: number; width: number; height: number }
  videoDimensions: { width: number; height: number }
  fastMode: boolean
}

interface SizeEstimateState {
  /** Human-readable range string, e.g. "1.2 MB – 2.4 MB" */
  label: string
  /** Whether the estimator is currently sampling */
  isSampling: boolean
  /** Whether the output is likely very large (> 50 MB mid estimate) */
  isLargeWarning: boolean
}

const LARGE_THRESHOLD = 50 * 1024 * 1024 // 50 MB

/**
 * Hook that asynchronously samples frames from the loaded video
 * and produces a content-aware GIF size estimate.
 *
 * Debounces by 300 ms so rapid slider drags don't thrash the estimator.
 */
export function useSizeEstimate(
  settings: SizeEstimateSettings
): SizeEstimateState {
  const [state, setState] = useState<SizeEstimateState>({
    label: 'Calculating…',
    isSampling: false,
    isLargeWarning: false,
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const { url } = getVideo()
    if (!url) {
      clearSampleCache()
    }
    return () => {
      // We don't automatically clear cache on unmount because the export
      // might still need to run and use the cached frames.
    }
  }, [getVideo().url]) // Track URL changes directly

  const estimate = useCallback(
    async (s: SizeEstimateSettings, signal: AbortSignal) => {
      const { url } = getVideo()
      if (!url) {
        setState({
          label: '—',
          isSampling: false,
          isLargeWarning: false,
        })
        return
      }

      setState((prev) => ({ ...prev, isSampling: true }))

      try {
        /* ---- Resolve output dimensions ---- */
        const originalWidth = s.videoDimensions.width
        const originalHeight = s.videoDimensions.height
        const cropSafe = resolveCropRect(s.crop, originalWidth, originalHeight)

        let gifWidth = cropSafe.w
        let gifHeight = cropSafe.h
        if (s.width !== 'original') {
          const tw = parseInt(s.width)
          gifWidth = tw
          gifHeight = Math.round(tw * (cropSafe.h / cropSafe.w))
        }

        const effectiveFps = s.fastMode ? Math.min(s.fps, 15) : s.fps
        const duration = Math.max(0.1, s.trimRange[1] - s.trimRange[0])
        const totalFrames = Math.max(1, Math.floor(duration * effectiveFps))
        const delay = Math.round(1000 / effectiveFps)

        const maxColors = s.fastMode ? 128 : 256

        /* ---- Sample frames ---- */
        const samplesToTake = Math.min(s.fastMode ? 3 : 15, totalFrames)

        if (signal.aborted) return

        const samplePixels = await sampleFrames({
          videoUrl: url,
          totalFrames,
          samplesToTake,
          fps: effectiveFps,
          trimRange: s.trimRange,
          crop: cropSafe,
          width: gifWidth,
          height: gifHeight,
          signal,
        })

        if (signal.aborted) return

        /* ---- Run estimator ---- */
        const result = estimateGifSize(samplePixels, {
          totalFrames,
          width: gifWidth,
          height: gifHeight,
          maxColors,
          delay,
          fastMode: s.fastMode,
        })

        if (signal.aborted) return

        setState({
          label: formatEstimationRange(result),
          isSampling: false,
          isLargeWarning: result.midBytes > LARGE_THRESHOLD,
        })
      } catch (err) {
        console.warn('[SizeEstimate] sampling failed, falling back', err)
        if (signal.aborted) return
        setState({
          label: '—',
          isSampling: false,
          isLargeWarning: false,
        })
      }
    },
    []
  )

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    // Debounce 300ms so rapid setting changes don't thrash
    const timer = setTimeout(() => {
      estimate(settings, abortController.signal)
    }, 300)

    return () => {
      clearTimeout(timer)
      abortController.abort()
    }
    // We deliberately spread all settings fields into the dep array
  }, [
    settings.fps,
    settings.compression,
    settings.width,
    settings.trimRange[0],
    settings.trimRange[1],
    settings.crop.x,
    settings.crop.y,
    settings.crop.width,
    settings.crop.height,
    settings.videoDimensions.width,
    settings.videoDimensions.height,
    settings.fastMode,
    estimate,
  ])

  return state
}
