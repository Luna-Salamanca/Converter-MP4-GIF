import { useState, useCallback } from 'react'
import { toast } from '@/hooks/use-toast'
import { getVideo } from '@/lib/video-state'
// @ts-ignore
import GIF from 'gif.js'

export interface ExportSettings {
  fps: number
  quality: number // 1-30 (1 is best)
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
    console.log('Starting export process with settings:', settings)
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

    try {
      const tempVideo = document.createElement('video')
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

      // Validate dimensions
      if (settings.width <= 0 || settings.height <= 0) {
        throw new Error('Invalid output dimensions')
      }

      const duration = Math.max(
        0.1,
        settings.trimRange[1] - settings.trimRange[0]
      )
      const numFrames = Math.max(1, Math.floor(duration * settings.fps))
      const delay = 1000 / settings.fps

      const gif = new GIF({
        workers: navigator.hardwareConcurrency || 4,
        quality: settings.quality,
        width: settings.width,
        height: settings.height,
        workerScript: import.meta.env.BASE_URL + 'gif.worker.js',
      })

      gif.on('progress', (p: number) => {
        setProgress(Math.round(p * 100))
      })

      gif.on('finished', (blob: Blob) => {
        setIsExporting(false)
        setProgress(0)

        const image = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = image
        link.download = (settings.filename || 'export') + '.gif'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast({
          title: 'Export Complete!',
          description: 'Your GIF has been generated and downloaded.',
        })
      })

      const canvas = document.createElement('canvas')
      canvas.width = settings.width
      canvas.height = settings.height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })

      if (!ctx) throw new Error('Could not create canvas context')

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

        gif.addFrame(ctx, { copy: true, delay: delay })
        setProgress(Math.round((i / numFrames) * 50)) // Capture phase is first 50%
      }

      gif.render()
    } catch (error) {
      console.error('Export error:', error)
      setIsExporting(false)
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    }
  }, [])

  return {
    exportGif,
    isExporting,
    progress,
  }
}
