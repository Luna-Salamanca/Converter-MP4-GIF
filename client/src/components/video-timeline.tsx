import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, ChevronLeft, ChevronRight, Scissors } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface VideoTimelineProps {
  duration?: number
  value?: number[]
  onTrimChange?: (start: number, end: number) => void
  isPlaying?: boolean
  onPlayPause?: (isPlaying: boolean) => void
  currentTime?: number
  onSeek?: (time: number) => void
}

const TimeInput = ({
  value,
  duration,
  onCommit,
  className,
}: {
  value: number
  duration: number
  onCommit: (val: number) => void
  className?: string
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const formatTimeFull = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 100)
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (!isEditing) {
      setInputValue(formatTimeFull(value))
    }
  }, [value, isEditing])

  const handleBlur = () => {
    setIsEditing(false)
    const parts = inputValue.split(':')
    let newTime = 0

    if (parts.length === 2) {
      const mins = parseFloat(parts[0])
      const secs = parseFloat(parts[1])
      if (!isNaN(mins) && !isNaN(secs)) {
        newTime = mins * 60 + secs
      }
    } else if (parts.length === 1) {
      const secs = parseFloat(parts[0])
      if (!isNaN(secs)) {
        newTime = secs
      }
    }

    newTime = Math.max(0, Math.min(newTime, duration))

    if (!isNaN(newTime)) {
      onCommit(newTime)
    } else {
      setInputValue(formatTimeFull(value))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
  }

  if (isEditing) {
    return (
      <input
        className={cn(
          'border-primary text-primary h-auto w-[70px] border-b bg-transparent p-0 text-center leading-none font-medium outline-none',
          className
        )}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
      />
    )
  }

  return (
    <span
      className={cn(
        'text-primary cursor-text rounded px-1 font-medium transition-colors hover:bg-white/10',
        className
      )}
      onClick={() => setIsEditing(true)}
    >
      {formatTimeFull(value)}
    </span>
  )
}

export function VideoTimeline({
  duration = 60,
  value,
  onTrimChange,
  isPlaying = false,
  onPlayPause,
  currentTime = 0,
  onSeek,
}: VideoTimelineProps) {
  const [internalIsPlaying, setInternalIsPlaying] = useState(false)
  const [internalTrim, setInternalTrim] = useState([0, duration])
  const progressBarRef = useRef<HTMLDivElement>(null)

  const trimRange = value || internalTrim
  const playing = onPlayPause ? isPlaying : internalIsPlaying

  const [isDragging, setIsDragging] = useState<
    'left' | 'right' | 'scrub' | null
  >(null)

  const [smoothTime, setSmoothTime] = useState(currentTime)
  const lastTimeRef = useRef<number>(currentTime)
  const requestRef = useRef<number | null>(null)
  const lastTimestampRef = useRef<number | null>(null)

  useEffect(() => {
    if (Math.abs(smoothTime - currentTime) > 0.5 || !playing) {
      setSmoothTime(currentTime)
      lastTimeRef.current = currentTime
    }
  }, [currentTime, playing])

  useEffect(() => {
    if (!playing) {
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current)
      lastTimestampRef.current = null
      return
    }

    const animate = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp
      }

      const deltaTime = (timestamp - lastTimestampRef.current) / 1000
      lastTimestampRef.current = timestamp

      setSmoothTime((prev) => {
        let nextTime = prev + deltaTime
        if (nextTime > duration) nextTime = duration
        return nextTime
      })

      requestRef.current = requestAnimationFrame(animate)
    }

    requestRef.current = requestAnimationFrame(animate)

    return () => {
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current)
    }
  }, [playing, duration])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !progressBarRef.current) return

      const rect = progressBarRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const width = rect.width
      const percentage = Math.max(0, Math.min(1, x / width))
      const newTime = percentage * duration

      if (isDragging === 'left') {
        const newStart = Math.min(newTime, trimRange[1] - 0.1)
        const newTrim = [newStart, trimRange[1]]
        if (!value) setInternalTrim(newTrim)
        onTrimChange?.(newTrim[0], newTrim[1])
      } else if (isDragging === 'right') {
        const newEnd = Math.max(newTime, trimRange[0] + 0.1)
        const newTrim = [trimRange[0], newEnd]
        if (!value) setInternalTrim(newTrim)
        onTrimChange?.(newTrim[0], newTrim[1])
      } else if (isDragging === 'scrub') {
        onSeek?.(newTime)
        setSmoothTime(newTime)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(null)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, duration, trimRange, onTrimChange, value, onSeek])

  const handlePlayPause = () => {
    if (onPlayPause) {
      onPlayPause(!playing)
    } else {
      setInternalIsPlaying(!playing)
    }
  }

  const handleStep = (amount: number) => {
    const newTime = Math.max(0, Math.min(duration, smoothTime + amount))
    onSeek?.(newTime)
    setSmoothTime(newTime)
  }

  const handleTimelineMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !onSeek) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width
    const percentage = Math.max(0, Math.min(1, x / width))
    const newTime = percentage * duration

    onSeek(newTime)
    setSmoothTime(newTime)
    setIsDragging('scrub')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 100)
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }

  const RulerTicks = () => {
    // We want major ticks every 5 seconds, minor ticks every 1 second
    const totalSeconds = Math.ceil(duration)
    const ticks = []
    // Just drawing ticks for every second might be too dense for long videos,
    // but for <60s clips it's fine.
    // Let's adapt based on duration.
    const step = duration > 120 ? 10 : duration > 60 ? 5 : 1
    const majorStep = step * 5

    for (let i = 0; i <= totalSeconds; i += step) {
      const isMajor = i % majorStep === 0
      const left = (i / duration) * 100

      if (left > 100) break

      ticks.push(
        <div
          key={i}
          className="pointer-events-none absolute top-0 bottom-0 flex flex-col items-center"
          style={{ left: `${left}%` }}
        >
          {/* Tick Mark */}
          <div className={cn('w-px bg-white/20', isMajor ? 'h-3' : 'h-1.5')} />

          {/* Time Label */}
          {isMajor && (
            <span className="text-muted-foreground mt-1 -translate-x-1/2 font-mono text-[10px] select-none">
              {formatTime(i).split('.')[0]}
            </span>
          )}
        </div>
      )
    }
    return <>{ticks}</>
  }

  const handleManualTimeCommit = (val: number) => {
    onSeek?.(val)
    setSmoothTime(val)
  }

  return (
    <div className="bg-card/50 border-border/50 space-y-4 rounded-xl border p-4 backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayPause}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 flex size-10 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            {playing ? (
              <Pause className="size-5 fill-current" />
            ) : (
              <Play className="ml-0.5 size-5 fill-current" />
            )}
          </button>
          <div className="flex gap-1">
            <button
              onClick={() => handleStep(-1)}
              className="text-muted-foreground hover:text-foreground rounded-md p-2 transition-colors hover:bg-white/10"
              title="Back 1s"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => handleStep(1)}
              className="text-muted-foreground hover:text-foreground rounded-md p-2 transition-colors hover:bg-white/10"
              title="Forward 1s"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-sm tabular-nums shadow-inner">
          <span className="text-muted-foreground text-[10px] tracking-wider uppercase">
            Timecode
          </span>

          <TimeInput
            value={smoothTime}
            duration={duration}
            onCommit={handleManualTimeCommit}
          />

          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">
            {formatTime(trimRange[1])}
          </span>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div
        ref={progressBarRef}
        className="group relative h-28 select-none"
        onMouseDown={handleTimelineMouseDown}
      >
        {/* Background Container - Dark Track */}
        <div className="absolute inset-0 overflow-hidden rounded-lg border border-white/5 bg-[#0A0A0A] shadow-inner">
          {/* Ruler Area */}
          <div className="absolute top-0 right-0 left-0 z-10 h-8 overflow-hidden border-b border-white/5 bg-white/[0.02]">
            <RulerTicks />
          </div>

          {/* Video Track / Frames Strip */}
          <div className="pointer-events-none absolute inset-0 top-8 bottom-0 flex bg-neutral-900/50">
            {/* We can use a repeating gradient to simulate frames if we don't have real thumbnails */}
            <div
              className="h-full w-full opacity-20"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, transparent 0, transparent 1px, rgba(255,255,255,0.05) 1px, rgba(255,255,255,0.05) 100px)',
              }}
            />
            <div className="absolute inset-x-0 top-1/2 h-8 w-full -translate-y-1/2 border-y border-blue-500/20 bg-blue-500/10" />
          </div>

          {/* Trim Overlay - Left (Darkened Area) */}
          <div
            className="pointer-events-none absolute top-8 bottom-0 left-0 z-20 border-r border-yellow-500/50 bg-black/80 backdrop-blur-[1px]"
            style={{ width: `${(trimRange[0] / duration) * 100}%` }}
          />

          {/* Trim Overlay - Right (Darkened Area) */}
          <div
            className="pointer-events-none absolute top-8 right-0 bottom-0 z-20 border-l border-yellow-500/50 bg-black/80 backdrop-blur-[1px]"
            style={{ width: `${100 - (trimRange[1] / duration) * 100}%` }}
          />

          {/* Active Area Selection Highlight */}
          <div
            className="bg-primary/5 pointer-events-none absolute top-8 bottom-0 z-10"
            style={{
              left: `${(trimRange[0] / duration) * 100}%`,
              width: `${((trimRange[1] - trimRange[0]) / duration) * 100}%`,
            }}
          />
        </div>

        {/* Scrubber Playhead - Smooth Red Line */}
        <div
          className="pointer-events-none absolute top-0 bottom-0 z-40 w-px bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
          style={{ left: `${(smoothTime / duration) * 100}%` }}
        >
          {/* Playhead Handle Top */}
          <div className="absolute -top-1 h-0 w-0 -translate-x-1/2 border-t-[8px] border-r-[6px] border-l-[6px] border-t-red-500 border-r-transparent border-l-transparent drop-shadow-sm" />

          {/* Line Glow */}
          <div className="absolute inset-y-0 -left-px w-[3px] bg-red-500/20 blur-[1px]" />
        </div>

        {/* Trim Handles */}
        <div className="pointer-events-none absolute inset-0 top-8 z-30">
          {/* Left Handle */}
          <div
            className="group/handle pointer-events-auto absolute top-0 bottom-0 -ml-2 flex w-4 cursor-ew-resize items-center justify-center hover:z-50"
            style={{ left: `${(trimRange[0] / duration) * 100}%` }}
            onMouseDown={(e) => {
              e.stopPropagation()
              setIsDragging('left')
            }}
          >
            <div className="relative h-full w-1.5 rounded-l-sm bg-yellow-500 shadow-lg transition-all group-hover/handle:w-2">
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 opacity-0 transition-opacity group-hover/handle:opacity-100">
                <div className="mb-1 rounded bg-black px-1 font-mono text-[9px] whitespace-nowrap text-white">
                  {formatTime(trimRange[0])}
                </div>
              </div>
            </div>
          </div>

          {/* Right Handle */}
          <div
            className="group/handle pointer-events-auto absolute top-0 bottom-0 -ml-2 flex w-4 cursor-ew-resize items-center justify-center hover:z-50"
            style={{ left: `${(trimRange[1] / duration) * 100}%` }}
            onMouseDown={(e) => {
              e.stopPropagation()
              setIsDragging('right')
            }}
          >
            <div className="relative h-full w-1.5 rounded-r-sm bg-yellow-500 shadow-lg transition-all group-hover/handle:w-2">
              <div className="absolute top-1/2 -right-1 -translate-y-1/2 opacity-0 transition-opacity group-hover/handle:opacity-100">
                <div className="mb-1 rounded bg-black px-1 font-mono text-[9px] whitespace-nowrap text-white">
                  {formatTime(trimRange[1])}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Scissors className="size-3" />
          <span>
            Selection Duration:{' '}
            <span className="text-foreground font-medium">
              {formatTime(trimRange[1] - trimRange[0])}
            </span>
          </span>
        </div>
        <span>~{Math.floor((trimRange[1] - trimRange[0]) * 30)} Frames</span>
      </div>
    </div>
  )
}
