import { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from '@/hooks/use-toast'
import { getVideo } from '@/lib/video-state'
import { resolveCropRect } from '@/lib/crop-utils'
import { sampleFrames } from '@/lib/export-frame-sampler'
import type { WorkerRequest, WorkerResponse } from '../workers/export.types'

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
 * Pre-flight validation. Throws a user-friendly Error if something
 * is obviously wrong.
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
      `Invalid output dimensions (${settings.width}×${settings.height}).`
    )
  }
  const { x, y, width, height } = settings.crop
  if (width <= 0 || height <= 0) {
    throw new Error('Crop area has zero width or height.')
  }
  if (x < 0 || y < 0 || x + width > 100.1 || y + height > 100.1) {
    throw new Error('Crop rectangle is outside the video bounds.')
  }
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useGifExport() {
  const [isExporting, setIsExportingState] = useState(false)
  const [progress, setProgress] = useState(0)

  const isExportingRef = useRef(false)
  const workerRef = useRef<Worker | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const setIsExporting = useCallback((val: boolean) => {
    isExportingRef.current = val
    setIsExportingState(val)
  }, [])

  const teardownWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      teardownWorker()
    }
  }, [teardownWorker])

  const cancelExport = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    teardownWorker()
    setIsExporting(false)
    setProgress(0)
    toast({
      title: 'Export Cancelled',
      description: 'The GIF export was cleanly aborted.',
    })
  }, [teardownWorker, setIsExporting])

  const exportGif = useCallback(
    async (settings: ExportSettings) => {
      const { url } = getVideo()
      if (!url) {
        toast({
          title: 'Export Failed',
          description: 'No video source found.',
          variant: 'destructive',
        })
        return
      }

      if (isExportingRef.current) return

      setIsExporting(true)
      setProgress(0)

      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal

      toast({
        title: 'Starting Export...',
        description: settings.fastMode
          ? 'Generating fast preview...'
          : 'Processing your video frames. This may take a moment.',
      })

      const tempVideo = document.createElement('video')
      const canvas = document.createElement('canvas')
      let objectUrl: string | null = null

      // Ensure pristine worker
      teardownWorker()
      const worker = new Worker(
        new URL('../workers/export.worker.ts', import.meta.url),
        { type: 'module' }
      )
      workerRef.current = worker

      const cleanup = () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl)
          objectUrl = null
        }
        tempVideo.removeAttribute('src')
        tempVideo.load()
        canvas.width = 0
        canvas.height = 0
        teardownWorker()
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

        if (signal.aborted) throw new Error('Aborted')

        const originalWidth = tempVideo.videoWidth
        const originalHeight = tempVideo.videoHeight

        validateExportInputs(settings, originalWidth, originalHeight)
        const crop = resolveCropRect(
          settings.crop,
          originalWidth,
          originalHeight
        )

        const duration = Math.max(
          0.1,
          settings.trimRange[1] - settings.trimRange[0]
        )
        const numFrames = Math.max(1, Math.floor(duration * settings.fps))
        const delay = Math.round(1000 / settings.fps)
        const maxColors = settings.fastMode ? 128 : 256

        canvas.width = settings.width
        canvas.height = settings.height
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) throw new Error('Could not create canvas context')

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
          signal,
        })

        if (signal.aborted) throw new Error('Aborted')

        // Helper to wrap worker messages in Promises matching specific type
        const sendToWorker = <TResponse extends WorkerResponse>(
          message: WorkerRequest,
          expectedType: TResponse['type'],
          transfer: Transferable[] = []
        ): Promise<TResponse> => {
          return new Promise((resolve, reject) => {
            const handler = (e: MessageEvent<WorkerResponse>) => {
              const data = e.data
              if (data.type === 'ERROR') {
                worker.removeEventListener('message', handler)
                reject(new Error(data.payload.error))
                return
              }
              if (data.type === expectedType) {
                worker.removeEventListener('message', handler)
                resolve(data as TResponse)
              }
            }
            worker.addEventListener('message', handler)
            worker.postMessage(message, transfer)
          })
        }

        await sendToWorker(
          {
            type: 'INIT_PALETTE',
            payload: { samples: samplePixels, maxColors },
          },
          'PALETTE_READY'
        )

        if (signal.aborted) throw new Error('Aborted')

        // Pass 2: Iterate strictly lock-step to limit memory consumption
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

          if (signal.aborted) throw new Error('Aborted')

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

          await sendToWorker(
            {
              type: 'ENCODE_FRAME',
              payload: {
                frameData: imageData.data,
                width: settings.width,
                height: settings.height,
                delay,
                index: i,
              },
            },
            'FRAME_ENCODED'
          )

          if (signal.aborted) throw new Error('Aborted')

          setProgress(30 + Math.round(((i + 1) / numFrames) * 60))
        }

        setProgress(90)

        const finishedResponse = await sendToWorker<{
          type: 'FINISHED'
          payload: { buffer: ArrayBuffer }
        }>({ type: 'FINISH' }, 'FINISHED')

        if (signal.aborted) throw new Error('Aborted')

        const buffer = finishedResponse.payload.buffer
        const blob = new Blob([buffer], { type: 'image/gif' })
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
      } catch (error: any) {
        if (error.message !== 'Aborted') {
          console.error('Export error:', error)
          toast({
            title: 'Export Failed',
            description:
              error instanceof Error ? error.message : 'Unknown error',
            variant: 'destructive',
          })
        }
      } finally {
        cleanup()
        setIsExporting(false)
        setProgress(0)
      }
    },
    [teardownWorker, setIsExporting]
  )

  return {
    exportGif,
    cancelExport,
    isExporting,
    progress,
  }
}
