import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, ChevronLeft, ChevronRight, Scissors } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface VideoTimelineProps {
  duration?: number // in seconds
  value?: number[] // [start, end]
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
    // Parse MM:SS.ms
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

    // Clamp
    newTime = Math.max(0, Math.min(newTime, duration))

    // Only commit if valid
    if (!isNaN(newTime)) {
      onCommit(newTime)
    } else {
      // Revert
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
          'bg-transparent border-b border-primary text-primary font-medium w-[70px] outline-none text-center p-0 h-auto leading-none',
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
        'text-primary font-medium cursor-text hover:bg-white/10 px-1 rounded transition-colors',
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

  // Smooth playback logic
  const [smoothTime, setSmoothTime] = useState(currentTime)
  const lastTimeRef = useRef<number>(currentTime)
  const requestRef = useRef<number | null>(null)
  const lastTimestampRef = useRef<number | null>(null)

  // Sync smoothTime with currentTime when it changes significantly (seek) or pauses
  useEffect(() => {
    // Sync if drift is large OR if we are not playing (so paused seeks are immediate)
    if (Math.abs(smoothTime - currentTime) > 0.5 || !playing) {
      setSmoothTime(currentTime)
      lastTimeRef.current = currentTime
    }
  }, [currentTime, playing])

  // Animation loop for smooth playback
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

      const deltaTime = (timestamp - lastTimestampRef.current) / 1000 // seconds
      lastTimestampRef.current = timestamp

      setSmoothTime((prev) => {
        let nextTime = prev + deltaTime
        // Loop or stop at end logic could go here, but we rely on parent to loop/stop
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

  // Dragging logic
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

  // Generate ruler ticks
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
          className="absolute top-0 bottom-0 pointer-events-none flex flex-col items-center"
          style={{ left: `${left}%` }}
        >
          {/* Tick Mark */}
          <div className={cn('w-px bg-white/20', isMajor ? 'h-3' : 'h-1.5')} />

          {/* Time Label */}
          {isMajor && (
            <span className="text-[10px] text-muted-foreground font-mono mt-1 -translate-x-1/2 select-none">
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
    // Optional: Pause when editing time manually?
    // onPlayPause?.(false);
  }

  return (
    <div className="space-y-4 bg-card/50 border border-border/50 rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayPause}
            className="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
          >
            {playing ? (
              <Pause className="size-5 fill-current" />
            ) : (
              <Play className="size-5 fill-current ml-0.5" />
            )}
          </button>
          <div className="flex gap-1">
            <button
              onClick={() => handleStep(-1)}
              className="p-2 hover:bg-white/10 rounded-md text-muted-foreground hover:text-foreground transition-colors"
              title="Back 1s"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => handleStep(1)}
              className="p-2 hover:bg-white/10 rounded-md text-muted-foreground hover:text-foreground transition-colors"
              title="Forward 1s"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        <div className="font-mono text-sm bg-black/40 px-3 py-1.5 rounded-md border border-white/10 shadow-inner flex items-center gap-2 tabular-nums">
          <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
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
        className="relative h-28 group select-none"
        onMouseDown={handleTimelineMouseDown}
      >
        {/* Background Container - Dark Track */}
        <div className="absolute inset-0 bg-[#0A0A0A] rounded-lg overflow-hidden border border-white/5 shadow-inner">
          {/* Ruler Area */}
          <div className="absolute top-0 left-0 right-0 h-8 border-b border-white/5 bg-white/[0.02] z-10 overflow-hidden">
            <RulerTicks />
          </div>

          {/* Video Track / Frames Strip */}
          <div className="absolute inset-0 top-8 bottom-0 flex pointer-events-none bg-neutral-900/50">
            {/* We can use a repeating gradient to simulate frames if we don't have real thumbnails */}
            <div
              className="w-full h-full opacity-20"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, transparent 0, transparent 1px, rgba(255,255,255,0.05) 1px, rgba(255,255,255,0.05) 100px)',
              }}
            />
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 w-full bg-blue-500/10 border-y border-blue-500/20" />
          </div>

          {/* Trim Overlay - Left (Darkened Area) */}
          <div
            className="absolute top-8 bottom-0 left-0 bg-black/80 z-20 backdrop-blur-[1px] pointer-events-none border-r border-yellow-500/50"
            style={{ width: `${(trimRange[0] / duration) * 100}%` }}
          />

          {/* Trim Overlay - Right (Darkened Area) */}
          <div
            className="absolute top-8 bottom-0 right-0 bg-black/80 z-20 backdrop-blur-[1px] pointer-events-none border-l border-yellow-500/50"
            style={{ width: `${100 - (trimRange[1] / duration) * 100}%` }}
          />

          {/* Active Area Selection Highlight */}
          <div
            className="absolute top-8 bottom-0 bg-primary/5 z-10 pointer-events-none"
            style={{
              left: `${(trimRange[0] / duration) * 100}%`,
              width: `${((trimRange[1] - trimRange[0]) / duration) * 100}%`,
            }}
          />
        </div>

        {/* Scrubber Playhead - Smooth Red Line */}
        <div
          className="absolute top-0 bottom-0 w-px bg-red-500 z-40 pointer-events-none shadow-[0_0_10px_rgba(239,68,68,0.8)]"
          style={{ left: `${(smoothTime / duration) * 100}%` }}
        >
          {/* Playhead Handle Top */}
          <div className="absolute -top-1 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-red-500 drop-shadow-sm" />

          {/* Line Glow */}
          <div className="absolute inset-y-0 -left-px w-[3px] bg-red-500/20 blur-[1px]" />
        </div>

        {/* Trim Handles */}
        <div className="absolute inset-0 top-8 z-30 pointer-events-none">
          {/* Left Handle */}
          <div
            className="absolute top-0 bottom-0 w-4 -ml-2 cursor-ew-resize flex items-center justify-center group/handle pointer-events-auto hover:z-50"
            style={{ left: `${(trimRange[0] / duration) * 100}%` }}
            onMouseDown={(e) => {
              e.stopPropagation()
              setIsDragging('left')
            }}
          >
            <div className="h-full w-1.5 bg-yellow-500 rounded-l-sm shadow-lg relative group-hover/handle:w-2 transition-all">
              <div className="absolute top-1/2 -translate-y-1/2 -left-1 opacity-0 group-hover/handle:opacity-100 transition-opacity">
                <div className="text-[9px] font-mono bg-black text-white px-1 rounded mb-1 whitespace-nowrap">
                  {formatTime(trimRange[0])}
                </div>
              </div>
            </div>
          </div>

          {/* Right Handle */}
          <div
            className="absolute top-0 bottom-0 w-4 -ml-2 cursor-ew-resize flex items-center justify-center group/handle pointer-events-auto hover:z-50"
            style={{ left: `${(trimRange[1] / duration) * 100}%` }}
            onMouseDown={(e) => {
              e.stopPropagation()
              setIsDragging('right')
            }}
          >
            <div className="h-full w-1.5 bg-yellow-500 rounded-r-sm shadow-lg relative group-hover/handle:w-2 transition-all">
              <div className="absolute top-1/2 -translate-y-1/2 -right-1 opacity-0 group-hover/handle:opacity-100 transition-opacity">
                <div className="text-[9px] font-mono bg-black text-white px-1 rounded mb-1 whitespace-nowrap">
                  {formatTime(trimRange[1])}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
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
