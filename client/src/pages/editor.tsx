import { VideoTimeline } from '@/components/video-timeline'
import { SettingsPanel } from '@/components/settings-panel'
import { PreviewPlayer } from '@/components/preview-player'
import { ArrowLeft, Download } from 'lucide-react'
import { Link } from 'wouter'
import { Button } from '@/components/ui/button'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { getVideo } from '@/lib/video-state'
import { EditorProvider, useEditor } from '@/context/editor-context'
import { useState } from 'react'

export default function Editor() {
  return (
    <EditorProvider>
      <EditorContent />
    </EditorProvider>
  )
}

function EditorContent() {
  const { file } = getVideo()
  const filename = file?.name || 'demo_clip.mp4'

  const {
    trimRange,
    setTrimRange,
    crop,
    setCrop,
    setVideoDimensions,
    triggerExport,
    isExporting,
  } = useEditor()

  // Local UI state for playback specific to this view
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)

  // Duration is local because it's not needed by settings usually,
  // though SettingsPanel calculates estimation based on trimRange.
  // The context relies on trimRange which is initialized based on duration here.
  const [duration, setDuration] = useState(60)

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration)
    // Initialize trim range to full duration on load/change
    setTrimRange([0, newDuration])
  }

  const handleDimensionsChange = (width: number, height: number) => {
    setVideoDimensions({ width, height })
  }

  return (
    <div className="bg-background flex h-screen flex-col overflow-hidden">
      {/* Editor Header */}
      <header className="border-border bg-card flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          </Link>
          <div className="bg-border h-6 w-px" />
          <span className="max-w-[200px] truncate text-sm font-medium">
            {filename}
          </span>
          <span className="text-muted-foreground border-border bg-muted/50 rounded border px-1.5 py-0.5 text-xs">
            HD
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={triggerExport}
            disabled={isExporting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-medium"
          >
            <Download className="size-4" />
            Export GIF
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left: Preview & Timeline */}
          <ResizablePanel defaultSize={75} minSize={50}>
            <div className="flex h-full flex-col gap-6 overflow-y-auto p-6 pb-10">
              {/* Preview Area */}
              <div className="flex min-h-0 flex-1 flex-col">
                <PreviewPlayer
                  trimStart={trimRange[0]}
                  trimEnd={trimRange[1]}
                  onDurationChange={handleDurationChange}
                  onDimensionsChange={handleDimensionsChange}
                  isPlaying={isPlaying}
                  onPlayPause={setIsPlaying}
                  currentTime={currentTime}
                  onTimeUpdate={setCurrentTime}
                  crop={crop}
                  onCropChange={setCrop}
                />
              </div>

              {/* Timeline Area */}
              <div className="shrink-0">
                <h3 className="text-muted-foreground mb-3 text-sm font-medium">
                  Timeline & Trim
                </h3>
                <VideoTimeline
                  duration={duration}
                  value={trimRange}
                  onTrimChange={(start, end) => setTrimRange([start, end])}
                  isPlaying={isPlaying}
                  onPlayPause={setIsPlaying}
                  currentTime={currentTime}
                  onSeek={setCurrentTime}
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right: Settings */}
          <ResizablePanel
            defaultSize={25}
            minSize={20}
            maxSize={40}
            className="min-w-[300px]"
          >
            <SettingsPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
