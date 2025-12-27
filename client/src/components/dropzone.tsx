import { useState, useCallback } from 'react'
import { Upload, FileVideo, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'wouter'
import { cn } from '@/lib/utils'
import { setVideo } from '@/lib/video-state'

export function Dropzone() {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, setLocation] = useLocation()

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        const file = files[0]
        if (file.type.startsWith('video/')) {
          setVideo(file)
          setTimeout(() => setLocation('/editor'), 500)
        } else {
          setError('Please upload a valid video file (MP4, WebM, MOV).')
        }
      }
    },
    [setLocation]
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setVideo(files[0])
      setTimeout(() => setLocation('/editor'), 500)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          'relative group border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer overflow-hidden',
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.02] shadow-2xl shadow-primary/10'
            : 'border-border hover:border-primary/50 hover:bg-muted/30'
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept="video/*"
          onChange={handleFileInput}
        />

        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-6">
          <div
            className={cn(
              'size-20 rounded-full flex items-center justify-center transition-all duration-300',
              isDragging
                ? 'bg-primary text-background scale-110'
                : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
            )}
          >
            {isDragging ? (
              <FileVideo className="size-10 animate-pulse" />
            ) : (
              <Upload className="size-10" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-display font-bold">
              {isDragging ? 'Drop video to start' : 'Upload a video'}
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Drag and drop or click to browse. Supports MP4, WebM, MOV up to
              500MB.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4">
            <span className="bg-muted px-2 py-1 rounded">H.264</span>
            <span className="bg-muted px-2 py-1 rounded">VP9</span>
            <span className="bg-muted px-2 py-1 rounded">ProRes</span>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2 text-sm font-medium"
          >
            <AlertCircle className="size-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
