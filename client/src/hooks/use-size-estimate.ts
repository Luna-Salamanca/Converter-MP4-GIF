import { useState, useEffect, useRef, useCallback } from 'react'
import { getVideo } from '@/lib/video-state'
import {
  estimateGifSize,
  formatEstimationRange,
  type EstimationResult,
} from '@/lib/gif-size-estimator'

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
  /** Complexity hint */
  complexity: EstimationResult['complexity'] | null
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
    complexity: null,
    isSampling: false,
    isLargeWarning: false,
  })

  const abortRef = useRef(0) // simple generation counter

  const estimate = useCallback(
    async (s: SizeEstimateSettings, generation: number) => {
      const { url } = getVideo()
      if (!url) {
        setState({
          label: '—',
          complexity: null,
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
        const cropW = Math.floor((s.crop.width / 100) * originalWidth)
        const cropH = Math.floor((s.crop.height / 100) * originalHeight)

        let gifWidth = cropW
        let gifHeight = cropH
        if (s.width !== 'original') {
          const tw = parseInt(s.width)
          gifWidth = tw
          gifHeight = Math.round(tw * (cropH / cropW))
        }

        const effectiveFps = s.fastMode ? Math.min(s.fps, 15) : s.fps
        const duration = Math.max(0.1, s.trimRange[1] - s.trimRange[0])
        const totalFrames = Math.max(1, Math.floor(duration * effectiveFps))
        const delay = Math.round(1000 / effectiveFps)

        const maxColors = Math.max(
          32,
          Math.round(
            256 -
              ((s.fastMode ? 30 : Math.max(1, Math.floor(s.compression / 3))) -
                1) *
                (224 / 29)
          )
        )

        /* ---- Sample frames ---- */
        const samplesToTake = Math.min(s.fastMode ? 3 : 5, totalFrames)

        const tempVideo = document.createElement('video')
        const canvas = document.createElement('canvas')
        canvas.width = gifWidth
        canvas.height = gifHeight
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) throw new Error('No canvas context')

        tempVideo.src = url
        tempVideo.crossOrigin = 'anonymous'
        tempVideo.muted = true
        tempVideo.playsInline = true

        await new Promise<void>((resolve, reject) => {
          tempVideo.onloadedmetadata = () => resolve()
          tempVideo.onerror = (e) => reject(e)
        })

        // Bail if a newer estimation was requested while we loaded metadata
        if (abortRef.current !== generation) {
          tempVideo.removeAttribute('src')
          tempVideo.load()
          return
        }

        const cropX = Math.floor((s.crop.x / 100) * originalWidth)
        const cropY = Math.floor((s.crop.y / 100) * originalHeight)

        const sampleStep = Math.max(1, Math.floor(totalFrames / samplesToTake))
        const samplePixels: Uint8ClampedArray[] = []

        for (
          let i = 0;
          i < totalFrames && samplePixels.length < samplesToTake;
          i += sampleStep
        ) {
          if (abortRef.current !== generation) break

          const time = s.trimRange[0] + i / effectiveFps
          tempVideo.currentTime = time

          await new Promise<void>((resolve) => {
            const onSeeked = () => {
              tempVideo.removeEventListener('seeked', onSeeked)
              resolve()
            }
            tempVideo.addEventListener('seeked', onSeeked)
          })

          ctx.drawImage(
            tempVideo,
            cropX,
            cropY,
            cropW,
            cropH,
            0,
            0,
            gifWidth,
            gifHeight
          )
          samplePixels.push(ctx.getImageData(0, 0, gifWidth, gifHeight).data)
        }

        // Cleanup temp video
        tempVideo.removeAttribute('src')
        tempVideo.load()
        canvas.width = 0
        canvas.height = 0

        if (abortRef.current !== generation) return

        /* ---- Run estimator ---- */
        const result = estimateGifSize(samplePixels, {
          totalFrames,
          width: gifWidth,
          height: gifHeight,
          maxColors,
          delay,
          fastMode: s.fastMode,
        })

        if (abortRef.current !== generation) return

        setState({
          label: formatEstimationRange(result),
          complexity: result.complexity,
          isSampling: false,
          isLargeWarning: result.midBytes > LARGE_THRESHOLD,
        })
      } catch (err) {
        console.warn('[SizeEstimate] sampling failed, falling back', err)
        if (abortRef.current !== generation) return
        setState({
          label: '—',
          complexity: null,
          isSampling: false,
          isLargeWarning: false,
        })
      }
    },
    []
  )

  useEffect(() => {
    const gen = ++abortRef.current

    // Debounce 300ms so rapid setting changes don't thrash
    const timer = setTimeout(() => {
      estimate(settings, gen)
    }, 300)

    return () => clearTimeout(timer)
    // We deliberately spread all settings fields into the dep array
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
