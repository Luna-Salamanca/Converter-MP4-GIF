import { useState, useCallback } from 'react'
import { toast } from '@/hooks/use-toast'
import { getVideo } from '@/lib/video-state'
import { GIFEncoder, quantize, applyPalette } from 'gifenc'

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

      const cropX = Math.floor((settings.crop.x / 100) * originalWidth)
      const cropY = Math.floor((settings.crop.y / 100) * originalHeight)
      const cropW = Math.floor((settings.crop.width / 100) * originalWidth)
      const cropH = Math.floor((settings.crop.height / 100) * originalHeight)

      if (settings.width <= 0 || settings.height <= 0) {
        throw new Error('Invalid output dimensions')
      }

      const duration = Math.max(
        0.1,
        settings.trimRange[1] - settings.trimRange[0]
      )
      const numFrames = Math.max(1, Math.floor(duration * settings.fps))
      const delay = Math.round(1000 / settings.fps)

      const maxColors = Math.max(
        32,
        Math.round(256 - (settings.quality - 1) * (224 / 29))
      )

      canvas.width = settings.width
      canvas.height = settings.height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) throw new Error('Could not create canvas context')

      const encoder = GIFEncoder()

      // Pass 1: sample a few frames and build one palette
      const samplesToTake = Math.min(settings.fastMode ? 3 : 5, numFrames)
      const sampleStep = Math.max(1, Math.floor(numFrames / samplesToTake))
      const samplePixels: Uint8ClampedArray[] = []

      for (
        let s = 0;
        s < numFrames && samplePixels.length < samplesToTake;
        s += sampleStep
      ) {
        const time = settings.trimRange[0] + s / settings.fps
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
          settings.width,
          settings.height
        )

        samplePixels.push(
          ctx.getImageData(0, 0, settings.width, settings.height).data
        )

        setProgress(Math.round((samplePixels.length / samplesToTake) * 30))
      }

      const totalLength = samplePixels.reduce((sum, arr) => sum + arr.length, 0)
      const combined = new Uint8ClampedArray(totalLength)
      let offset = 0

      for (const pixels of samplePixels) {
        combined.set(pixels, offset)
        offset += pixels.length
      }

      const globalPalette = quantize(combined, maxColors)

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
          cropX,
          cropY,
          cropW,
          cropH,
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
        const index = applyPalette(imageData.data, globalPalette)

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
