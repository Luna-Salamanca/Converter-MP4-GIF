import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
} from 'react'
import { useGifExport, ExportSettings } from '@/hooks/use-gif-export'
import { useSizeEstimate } from '@/hooks/use-size-estimate'
import { getVideo } from '@/lib/video-state'
import { resolveCropRect } from '@/lib/crop-utils'
import type { EstimationResult } from '@/lib/gif-size-estimator'

interface EditorContextType {
  // Settings
  fps: number
  setFps: (fps: number) => void
  compression: number
  setCompression: (c: number) => void
  width: string
  setWidth: (w: string) => void
  filename: string
  setFilename: (n: string) => void
  fastMode: boolean
  setFastMode: (m: boolean) => void

  // Editor State
  trimRange: number[]
  setTrimRange: (range: number[]) => void
  crop: { x: number; y: number; width: number; height: number }
  setCrop: (crop: {
    x: number
    y: number
    width: number
    height: number
  }) => void
  videoDimensions: { width: number; height: number }
  setVideoDimensions: (dim: { width: number; height: number }) => void

  // Size estimation
  estSize: string
  estComplexity: EstimationResult['complexity'] | null
  estIsSampling: boolean
  estIsLargeWarning: boolean

  // Actions
  triggerExport: () => void
  isExporting: boolean
  progress: number
}

const EditorContext = createContext<EditorContextType | null>(null)

export function EditorProvider({ children }: { children: ReactNode }) {
  const [fps, setFps] = useState(60)
  const [compression, setCompression] = useState(30)
  const [width, setWidth] = useState('original')
  const [filename, setFilename] = useState('')
  const [fastMode, setFastMode] = useState(false)
  const [trimRange, setTrimRange] = useState([0, 60])
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 100, height: 100 })
  const [videoDimensions, setVideoDimensions] = useState({
    width: 1920,
    height: 1080,
  })

  const { exportGif, isExporting, progress } = useGifExport()

  useEffect(() => {
    const { file } = getVideo()
    if (file && !filename) {
      setFilename(file.name.replace(/\.[^/.]+$/, ''))
    }
  }, [filename])

  // Content-aware size estimation via sampled frames
  const estimateSettings = useMemo(
    () => ({
      fps,
      compression,
      width,
      trimRange: [trimRange[0], trimRange[1]] as [number, number],
      crop,
      videoDimensions,
      fastMode,
    }),
    [fps, compression, width, trimRange, crop, videoDimensions, fastMode]
  )

  const {
    label: estSize,
    complexity: estComplexity,
    isSampling: estIsSampling,
    isLargeWarning: estIsLargeWarning,
  } = useSizeEstimate(estimateSettings)

  const triggerExport = () => {
    const originalWidth = videoDimensions.width
    const originalHeight = videoDimensions.height
    const cropSafe = resolveCropRect(crop, originalWidth, originalHeight)

    let gifWidth = cropSafe.w
    let gifHeight = cropSafe.h

    if (width !== 'original') {
      const targetWidth = parseInt(width)
      const ratio = cropSafe.h / cropSafe.w
      gifWidth = targetWidth
      gifHeight = Math.round(targetWidth * ratio)
    }

    const settings: ExportSettings = {
      fps: fastMode ? Math.min(fps, 15) : fps,
      quality: fastMode ? 30 : Math.max(1, Math.floor(compression / 3)),
      width: gifWidth,
      height: gifHeight,
      crop,
      trimRange: [trimRange[0], trimRange[1]],
      filename,
      fastMode,
    }

    exportGif(settings)
  }

  return (
    <EditorContext.Provider
      value={{
        fps,
        setFps,
        compression,
        setCompression,
        width,
        setWidth,
        filename,
        setFilename,
        fastMode,
        setFastMode,
        trimRange,
        setTrimRange,
        crop,
        setCrop,
        videoDimensions,
        setVideoDimensions,
        estSize,
        estComplexity,
        estIsSampling,
        estIsLargeWarning,
        triggerExport,
        isExporting,
        progress,
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider')
  }
  return context
}
