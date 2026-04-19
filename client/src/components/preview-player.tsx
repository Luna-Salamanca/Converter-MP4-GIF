import { Maximize2, Crop } from 'lucide-react'
import { getVideo } from '@/lib/video-state'
import { useEffect, useState, useRef, useCallback } from 'react'
import { CropOverlay } from './crop-overlay'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

interface PreviewPlayerProps {
  trimStart?: number
  trimEnd?: number
  onDurationChange?: (duration: number) => void
  onDimensionsChange?: (width: number, height: number) => void
  isPlaying?: boolean
  onPlayPause?: (isPlaying: boolean) => void
  currentTime?: number
  onTimeUpdate?: (time: number) => void
  crop?: { x: number; y: number; width: number; height: number }
  onCropChange?: (value: {
    x: number
    y: number
    width: number
    height: number
  }) => void
}

export function PreviewPlayer({
  trimStart = 0,
  trimEnd = 0,
  onDurationChange,
  onDimensionsChange,
  isPlaying = true,
  onPlayPause,
  currentTime,
  onTimeUpdate,
  crop = { x: 0, y: 0, width: 100, height: 100 },
  onCropChange,
}: PreviewPlayerProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const videoAreaRef = useRef<HTMLDivElement>(null)
  const isSeekedFromOutside = useRef(false)
  const [isCropping, setIsCropping] = useState(false)
  const [videoDimensions, setVideoDimensions] = useState({
    width: 0,
    height: 0,
  })

  /**
   * Compute the actual rendered video rectangle inside the container.
   * Because the <video> uses `object-contain`, it may be letterboxed.
   * We position an invisible overlay div to exactly cover the rendered
   * video area so the crop overlay measures percentages correctly.
   */
  const updateVideoArea = useCallback(() => {
    const video = videoRef.current
    const overlay = videoAreaRef.current
    if (!video || !overlay) return

    const containerRect = video.getBoundingClientRect()
    const videoW = video.videoWidth
    const videoH = video.videoHeight
    if (videoW === 0 || videoH === 0) return

    const containerAR = containerRect.width / containerRect.height
    const videoAR = videoW / videoH

    let renderW: number
    let renderH: number

    if (videoAR > containerAR) {
      // Video is wider than container → letterbox top/bottom
      renderW = containerRect.width
      renderH = containerRect.width / videoAR
    } else {
      // Video is taller than container → letterbox left/right
      renderH = containerRect.height
      renderW = containerRect.height * videoAR
    }

    const offsetX = (containerRect.width - renderW) / 2
    const offsetY = (containerRect.height - renderH) / 2

    overlay.style.left = `${offsetX}px`
    overlay.style.top = `${offsetY}px`
    overlay.style.width = `${renderW}px`
    overlay.style.height = `${renderH}px`
  }, [])

  useEffect(() => {
    const { url } = getVideo()
    if (url) {
      setVideoUrl(url)
    }
  }, [])

  // Recalculate video area on window resize
  useEffect(() => {
    const handleResize = () => updateVideoArea()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [updateVideoArea])

  // Also recalculate after layout changes via ResizeObserver
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver(() => updateVideoArea())
    observer.observe(container)
    return () => observer.disconnect()
  }, [updateVideoArea])

  // Sync current time from outside (seeking)
  useEffect(() => {
    const video = videoRef.current
    if (
      video &&
      currentTime !== undefined &&
      Math.abs(video.currentTime - currentTime) > 0.5
    ) {
      // Avoid update loops if the update came from the video itself
      if (!isSeekedFromOutside.current) {
        video.currentTime = currentTime
      }
    }
    isSeekedFromOutside.current = false
  }, [currentTime])

  // Sync play/pause state
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.play().catch(() => {
        // Handle autoplay block or other errors
      })
    } else {
      video.pause()
    }
  }, [isPlaying])

  // Handle time updates to loop within trim range
  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (!video) return

    isSeekedFromOutside.current = true
    onTimeUpdate?.(video.currentTime)

    if (video.currentTime < trimStart) {
      video.currentTime = trimStart
    }

    if (trimEnd > 0 && video.currentTime >= trimEnd) {
      video.currentTime = trimStart
      if (isPlaying) video.play()
    }
  }

  // Effect to jump to start when trimStart changes significantly
  useEffect(() => {
    const video = videoRef.current
    if (video && Math.abs(video.currentTime - trimStart) > 0.5) {
      video.currentTime = trimStart
    }
  }, [trimStart])

  return (
    <div className="border-border/50 group relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border bg-black/20 backdrop-blur-sm">
      {/* Mock Video Content */}
      <div
        ref={containerRef}
        className="relative flex aspect-video w-full max-w-4xl items-center justify-center overflow-hidden rounded-lg bg-black shadow-2xl"
      >
        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              className="h-full w-full object-contain"
              autoPlay={isPlaying}
              loop
              muted
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={(e) => {
                const video = e.currentTarget
                onDurationChange?.(video.duration)
                setVideoDimensions({
                  width: video.videoWidth,
                  height: video.videoHeight,
                })
                onDimensionsChange?.(video.videoWidth, video.videoHeight)
                // Compute the actual rendered video rect once metadata is loaded
                requestAnimationFrame(() => updateVideoArea())
              }}
              onPlay={() => onPlayPause?.(true)}
              onPause={() => onPlayPause?.(false)}
              onClick={() => onPlayPause?.(!isPlaying)}
            />
            {/* Invisible overlay sized to the actual video render rect */}
            <div
              ref={videoAreaRef}
              className="pointer-events-none absolute"
              style={{ top: 0, left: 0 }}
            >
              {onCropChange && (
                <CropOverlay
                  visible={isCropping}
                  value={crop}
                  onChange={onCropChange}
                  containerRef={videoAreaRef}
                />
              )}
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Abstract Video Placeholder */}
            <div className="absolute inset-0 bg-linear-to-br from-gray-900 to-black opacity-90" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 brightness-100 contrast-150" />

            {/* CSS pulsing blobs replacing framer-motion animations */}
            <div className="bg-primary/20 relative z-10 size-32 animate-[blob-pulse_4s_ease-in-out_infinite] rounded-full blur-3xl" />
            <div className="bg-secondary/10 relative z-10 -ml-12 size-48 animate-[blob-pulse_5s_ease-in-out_1s_infinite] rounded-full blur-3xl" />
          </div>
        )}

        {/* Overlay Info */}
        <div className="absolute top-4 right-4 z-30 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex items-center rounded border border-white/10 bg-black/50 px-2 py-1 text-xs text-white backdrop-blur">
            Original:{' '}
            {videoDimensions.width > 0
              ? `${videoDimensions.width}x${videoDimensions.height}`
              : 'Loading...'}
          </div>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              'h-8 w-8 bg-black/50 text-white backdrop-blur transition-colors hover:bg-white/20',
              isCropping &&
                'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
            onClick={() => setIsCropping(!isCropping)}
            title="Crop Video"
          >
            <Crop className="size-4" />
          </Button>
          <button className="pointer-events-auto rounded bg-black/50 p-1.5 text-white backdrop-blur transition-colors hover:bg-white/20">
            <Maximize2 className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
