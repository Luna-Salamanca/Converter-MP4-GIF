import { motion } from 'framer-motion'
import { Maximize2, Image as ImageIcon, Crop } from 'lucide-react'
import { getVideo } from '@/lib/video-state'
import { useEffect, useState, useRef } from 'react'
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
  const isSeekedFromOutside = useRef(false)
  const [isCropping, setIsCropping] = useState(false)
  const [videoDimensions, setVideoDimensions] = useState({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    const { url } = getVideo()
    if (url) {
      setVideoUrl(url)
    }
  }, [])

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
    <div className="relative w-full h-full flex items-center justify-center bg-black/20 rounded-xl overflow-hidden border border-border/50 backdrop-blur-sm group">
      {/* Mock Video Content */}
      <div
        ref={containerRef}
        className="aspect-video w-full max-w-4xl bg-black relative overflow-hidden rounded-lg shadow-2xl flex items-center justify-center"
      >
        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              // controls // Remove native controls to rely on custom ones or sync them properly
              autoPlay={isPlaying}
              loop
              muted // Muted for autoplay to work reliably in browsers
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={(e) => {
                const video = e.currentTarget
                onDurationChange?.(video.duration)
                setVideoDimensions({
                  width: video.videoWidth,
                  height: video.videoHeight,
                })
                onDimensionsChange?.(video.videoWidth, video.videoHeight)
              }}
              onPlay={() => onPlayPause?.(true)}
              onPause={() => onPlayPause?.(false)}
              onClick={() => onPlayPause?.(!isPlaying)}
            />
            {onCropChange && (
              <CropOverlay
                visible={isCropping}
                value={crop}
                onChange={onCropChange}
                containerRef={containerRef}
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Abstract Video Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-90" />
            <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />

            <motion.div
              className="relative z-10 size-32 rounded-full bg-primary/20 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="relative z-10 size-48 rounded-full bg-secondary/10 blur-3xl -ml-12"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            />
          </div>
        )}

        {/* Overlay Info */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
          <div className="bg-black/50 backdrop-blur text-xs px-2 py-1 rounded text-white border border-white/10 flex items-center">
            Original:{' '}
            {videoDimensions.width > 0
              ? `${videoDimensions.width}x${videoDimensions.height}`
              : 'Loading...'}
          </div>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              'h-8 w-8 bg-black/50 backdrop-blur hover:bg-white/20 text-white transition-colors',
              isCropping &&
                'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
            onClick={() => setIsCropping(!isCropping)}
            title="Crop Video"
          >
            <Crop className="size-4" />
          </Button>
          <button className="p-1.5 bg-black/50 backdrop-blur rounded hover:bg-white/20 text-white transition-colors pointer-events-auto">
            <Maximize2 className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
