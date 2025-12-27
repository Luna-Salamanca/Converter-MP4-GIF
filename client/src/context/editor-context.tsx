import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react'
import { useGifExport, ExportSettings } from '@/hooks/use-gif-export'
import { getVideo } from '@/lib/video-state'

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

  // Derived / Calculated
  estSize: string

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
  const [estSize, setEstSize] = useState('Calculating...')

  const { exportGif, isExporting, progress } = useGifExport()

  useEffect(() => {
    const { file } = getVideo()
    if (file && !filename) {
      setFilename(file.name.replace(/\.[^/.]+$/, ''))
    }
  }, [filename])

  // Size estimation logic
  useEffect(() => {
    const duration = Math.max(0.1, trimRange[1] - trimRange[0])
    const effectiveFps = fastMode ? Math.min(fps, 15) : fps
    const numFrames = duration * effectiveFps

    const originalWidth = videoDimensions.width
    const originalHeight = videoDimensions.height
    const cropW = Math.floor((crop.width / 100) * originalWidth)
    const cropH = Math.floor((crop.height / 100) * originalHeight)

    let currentGifWidth = cropW
    let currentGifHeight = cropH

    if (width !== 'original') {
      const targetWidth = parseInt(width)
      const ratio = cropH / cropW
      currentGifWidth = targetWidth
      currentGifHeight = Math.round(targetWidth * ratio)
    }

    const pixelCount = currentGifWidth * currentGifHeight
    const effectiveQuality = fastMode
      ? 30
      : Math.max(1, Math.floor(compression / 3))
    const compressionFactor = ((30 - effectiveQuality) / 29) * 1.5 + 0.5

    const bytes = numFrames * pixelCount * compressionFactor
    const mb = bytes / (1024 * 1024)

    setEstSize(mb < 1 ? `${(mb * 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`)
  }, [fps, trimRange, crop, videoDimensions, compression, width, fastMode])

  const triggerExport = () => {
    const originalWidth = videoDimensions.width
    const originalHeight = videoDimensions.height
    const cropW = Math.floor((crop.width / 100) * originalWidth)
    const cropH = Math.floor((crop.height / 100) * originalHeight)

    let gifWidth = cropW
    let gifHeight = cropH

    if (width !== 'original') {
      const targetWidth = parseInt(width)
      const ratio = cropH / cropW
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
