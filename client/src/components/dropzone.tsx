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
    <div className="mx-auto w-full max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          'group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300',
          isDragging
            ? 'border-primary bg-primary/5 shadow-primary/10 scale-[1.02] shadow-2xl'
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

        <div className="from-primary/5 to-secondary/5 pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100" />

        <div className="relative z-10 flex flex-col items-center gap-6">
          <div
            className={cn(
              'flex size-20 items-center justify-center rounded-full transition-all duration-300',
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
            <h3 className="font-display text-2xl font-bold">
              {isDragging ? 'Drop video to start' : 'Upload a video'}
            </h3>
            <p className="text-muted-foreground mx-auto max-w-sm">
              Drag and drop or click to browse. Supports MP4, WebM, MOV up to
              500MB.
            </p>
          </div>

          <div className="text-muted-foreground mt-4 flex items-center gap-4 text-xs">
            <span className="bg-muted rounded px-2 py-1">H.264</span>
            <span className="bg-muted rounded px-2 py-1">VP9</span>
            <span className="bg-muted rounded px-2 py-1">ProRes</span>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-destructive/10 text-destructive mt-4 flex items-center gap-2 rounded-lg p-4 text-sm font-medium"
          >
            <AlertCircle className="size-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
