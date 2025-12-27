import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface CropOverlayProps {
  visible: boolean
  value: { x: number; y: number; width: number; height: number }
  onChange: (value: {
    x: number
    y: number
    width: number
    height: number
  }) => void
  containerRef: React.RefObject<HTMLDivElement | null>
}

export function CropOverlay({
  visible,
  value,
  onChange,
  containerRef,
}: CropOverlayProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragHandle, setDragHandle] = useState<string | null>(null)
  const startPos = useRef({ x: 0, y: 0 })
  const startVal = useRef(value)

  const getPercentage = (e: MouseEvent | React.MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 }
    const rect = containerRef.current.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    }
  }

  const handleMouseDown = (e: React.MouseEvent, handle: string | null) => {
    e.stopPropagation()
    e.preventDefault()
    setIsDragging(true)
    setDragHandle(handle)
    startPos.current = { x: e.clientX, y: e.clientY }
    startVal.current = { ...value }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const deltaX = ((e.clientX - startPos.current.x) / rect.width) * 100
      const deltaY = ((e.clientY - startPos.current.y) / rect.height) * 100

      let newValue = { ...startVal.current }

      if (dragHandle === 'move') {
        newValue.x = Math.max(
          0,
          Math.min(100 - newValue.width, newValue.x + deltaX)
        )
        newValue.y = Math.max(
          0,
          Math.min(100 - newValue.height, newValue.y + deltaY)
        )
      } else if (dragHandle === 'se') {
        newValue.width = Math.max(
          10,
          Math.min(100 - newValue.x, newValue.width + deltaX)
        )
        newValue.height = Math.max(
          10,
          Math.min(100 - newValue.y, newValue.height + deltaY)
        )
      } else if (dragHandle === 'sw') {
        const maxDeltaX = newValue.x + newValue.width - 10 // Keep min width 10
        const constrainedDeltaX = Math.max(
          -newValue.x,
          Math.min(newValue.width - 10, deltaX)
        )
        newValue.x += constrainedDeltaX
        newValue.width -= constrainedDeltaX
        newValue.height = Math.max(
          10,
          Math.min(100 - newValue.y, newValue.height + deltaY)
        )
      } else if (dragHandle === 'ne') {
        newValue.width = Math.max(
          10,
          Math.min(100 - newValue.x, newValue.width + deltaX)
        )
        const constrainedDeltaY = Math.max(
          -newValue.y,
          Math.min(newValue.height - 10, deltaY)
        )
        newValue.y += constrainedDeltaY
        newValue.height -= constrainedDeltaY
      } else if (dragHandle === 'nw') {
        const constrainedDeltaX = Math.max(
          -newValue.x,
          Math.min(newValue.width - 10, deltaX)
        )
        newValue.x += constrainedDeltaX
        newValue.width -= constrainedDeltaX

        const constrainedDeltaY = Math.max(
          -newValue.y,
          Math.min(newValue.height - 10, deltaY)
        )
        newValue.y += constrainedDeltaY
        newValue.height -= constrainedDeltaY
      }

      onChange(newValue)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setDragHandle(null)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragHandle, onChange, containerRef])

  if (!visible) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {/* Dimmed Background */}
      <div className="absolute inset-0 bg-black/50">
        {/* Cutout */}
        <div
          className="absolute bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
          style={{
            left: `${value.x}%`,
            top: `${value.y}%`,
            width: `${value.width}%`,
            height: `${value.height}%`,
          }}
        />
      </div>

      {/* Crop Box */}
      <div
        className="border-primary pointer-events-auto absolute cursor-move border-2"
        style={{
          left: `${value.x}%`,
          top: `${value.y}%`,
          width: `${value.width}%`,
          height: `${value.height}%`,
        }}
        onMouseDown={(e) => handleMouseDown(e, 'move')}
      >
        {/* Grid Lines */}
        <div className="pointer-events-none absolute inset-0 flex flex-col opacity-30">
          <div className="border-primary/50 flex-1 border-b" />
          <div className="border-primary/50 flex-1 border-b" />
          <div className="flex-1" />
        </div>
        <div className="pointer-events-none absolute inset-0 flex opacity-30">
          <div className="border-primary/50 flex-1 border-r" />
          <div className="border-primary/50 flex-1 border-r" />
          <div className="flex-1" />
        </div>

        {/* Handles */}
        <div
          className="bg-primary absolute -top-1.5 -left-1.5 size-3 cursor-nw-resize border border-white"
          onMouseDown={(e) => handleMouseDown(e, 'nw')}
        />
        <div
          className="bg-primary absolute -top-1.5 -right-1.5 size-3 cursor-ne-resize border border-white"
          onMouseDown={(e) => handleMouseDown(e, 'ne')}
        />
        <div
          className="bg-primary absolute -bottom-1.5 -left-1.5 size-3 cursor-sw-resize border border-white"
          onMouseDown={(e) => handleMouseDown(e, 'sw')}
        />
        <div
          className="bg-primary absolute -right-1.5 -bottom-1.5 size-3 cursor-se-resize border border-white"
          onMouseDown={(e) => handleMouseDown(e, 'se')}
        />
      </div>
    </div>
  )
}
