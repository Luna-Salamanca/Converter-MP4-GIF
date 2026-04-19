import { createContext, useContext } from 'react'
import type { EstimationResult } from '@/lib/gif-size-estimator'

export interface EditorContextType {
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
  estIsSampling: boolean
  estIsLargeWarning: boolean

  // Actions
  triggerExport: () => void
  isExporting: boolean
  progress: number
}

export const EditorContext = createContext<EditorContextType | null>(null)

export function useEditor() {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider')
  }
  return context
}
