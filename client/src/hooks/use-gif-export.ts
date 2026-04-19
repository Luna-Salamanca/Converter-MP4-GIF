import { useState, useCallback } from 'react'
import { toast } from '@/hooks/use-toast'
import { getVideo } from '@/lib/video-state'
import { resolveCropRect } from '@/lib/crop-utils'
import { GIFEncoder, quantize } from 'gifenc'
import { sampleFrames, clearSampleCache } from '@/lib/export-frame-sampler'

export interface ExportSettings {
  fps: number
  quality: number // 1-30 (1 is best) — remapped to gifenc's maxColors
  width: number
  height: number
  crop: { x: number; y: number; width: number; height: number }
  trimRange: [number, number]
  filename: string
  fastMode: boolean
}

/**
 * Pre-flight validation.  Throws a user-friendly Error if something
 * is obviously wrong so the catch block can surface it via toast.
 */
function validateExportInputs(
  settings: ExportSettings,
  videoWidth: number,
  videoHeight: number
): void {
  if (videoWidth === 0 || videoHeight === 0) {
    throw new Error(
      'Video dimensions could not be read. Try re-loading the file.'
    )
  }

  if (settings.width <= 0 || settings.height <= 0) {
    throw new Error(
      `Invalid output dimensions (${settings.width}×${settings.height}). ` +
        'Adjust the resolution or crop settings.'
    )
  }

  const { x, y, width, height } = settings.crop
  if (width <= 0 || height <= 0) {
    throw new Error('Crop area has zero width or height.')
  }
  if (x < 0 || y < 0 || x + width > 100.1 || y + height > 100.1) {
    // 100.1 allows for tiny floating-point rounding
    throw new Error('Crop rectangle is outside the video bounds.')
  }
}

function applyPaletteExact(
  rgba: Uint8ClampedArray,
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

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useGifExport() {
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState(0)

  const exportGif = useCallback(async (settings: ExportSettings) => {
    const { url } = getVideo()

    if (!url) {
      toast({
        title: 'Export Failed',
        description: 'No video source found to export.',
        variant: 'destructive',
      })
      return
    }

    setIsExporting(true)
    setProgress(0)

    toast({
      title: 'Starting Export...',
      description: settings.fastMode
        ? 'Generating fast preview...'
        : 'Processing your video frames. This may take a moment.',
    })

    const tempVideo = document.createElement('video')
    const canvas = document.createElement('canvas')
    let objectUrl: string | null = null

    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
        objectUrl = null
      }

      tempVideo.removeAttribute('src')
      tempVideo.load()

      canvas.width = 0
      canvas.height = 0
    }

    try {
      tempVideo.src = url
      tempVideo.crossOrigin = 'anonymous'
      tempVideo.muted = true
      tempVideo.playsInline = true

      await new Promise<void>((resolve, reject) => {
        tempVideo.onloadedmetadata = () => resolve()
        tempVideo.onerror = (e) => reject(e)
      })

      const originalWidth = tempVideo.videoWidth
      const originalHeight = tempVideo.videoHeight

      // Validate before doing any heavy work
      validateExportInputs(settings, originalWidth, originalHeight)

      // Resolve & clamp crop coordinates
      const crop = resolveCropRect(settings.crop, originalWidth, originalHeight)

      const duration = Math.max(
        0.1,
        settings.trimRange[1] - settings.trimRange[0]
      )
      const numFrames = Math.max(1, Math.floor(duration * settings.fps))
      const delay = Math.round(1000 / settings.fps)

      // Always use max possible colors for video to prevent gross banding.
      // gifenc's applyPalette truncates to 16-bit by default, but we'll use exact matching
      const maxColors = settings.fastMode ? 128 : 256

      canvas.width = settings.width
      canvas.height = settings.height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) throw new Error('Could not create canvas context')

      const encoder = GIFEncoder()

      // Pass 1: sample a few frames and build one palette
      const samplesToTake = Math.min(settings.fastMode ? 3 : 15, numFrames)

      const samplePixels = await sampleFrames({
        videoUrl: url,
        totalFrames: numFrames,
        samplesToTake,
        fps: settings.fps,
        trimRange: settings.trimRange,
        crop,
        width: settings.width,
        height: settings.height,
        onProgress: (p) => setProgress(Math.round(p * 30)),
      })

      const totalLength = samplePixels.reduce((sum, arr) => sum + arr.length, 0)
      const combined = new Uint8ClampedArray(totalLength)
      let offset = 0

      for (const pixels of samplePixels) {
        combined.set(pixels, offset)
        offset += pixels.length
      }

      const globalPalette = quantize(combined, maxColors)

      // Share a single mapping cache across the entire video for extreme performance
      // while using exact 24-bit match instead of gifenc's 16-bit truncation
      const colorCache = new Map<number, number>()

      // Pass 2: encode every frame with the same palette
      for (let i = 0; i < numFrames; i++) {
        const time = settings.trimRange[0] + i / settings.fps
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
          crop.x,
          crop.y,
          crop.w,
          crop.h,
          0,
          0,
          settings.width,
          settings.height
        )

        const imageData = ctx.getImageData(
          0,
          0,
          settings.width,
          settings.height
        )

        const index = applyPaletteExact(
          imageData.data,
          globalPalette,
          colorCache
        )

        encoder.writeFrame(index, settings.width, settings.height, {
          palette: globalPalette,
          delay,
          repeat: 0,
        })

        setProgress(30 + Math.round(((i + 1) / numFrames) * 60))
      }

      setProgress(90)
      encoder.finish()

      const raw = encoder.bytes()
      const buf = new ArrayBuffer(raw.byteLength)
      new Uint8Array(buf).set(raw)

      const blob = new Blob([buf], { type: 'image/gif' })
      objectUrl = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = objectUrl
      link.download = (settings.filename || 'export') + '.gif'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setProgress(100)
      toast({
        title: 'Export Complete!',
        description: 'Your GIF has been generated and downloaded.',
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    } finally {
      cleanup()
      setIsExporting(false)
      setProgress(0)
    }
  }, [])

  return {
    exportGif,
    isExporting,
    progress,
  }
}
