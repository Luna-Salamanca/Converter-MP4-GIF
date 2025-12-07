import { Layout } from '@/components/layout'
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
import { useState } from 'react'

export default function Editor() {
  const { file } = getVideo()
  const filename = file?.name || 'demo_clip.mp4'

  // Default duration 60s if unknown, but will be updated by PreviewPlayer
  const [duration, setDuration] = useState(60)
  const [trimRange, setTrimRange] = useState([0, 60])
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 100, height: 100 })
  const [videoDimensions, setVideoDimensions] = useState({
    width: 1920,
    height: 1080,
  })

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration)
    // Reset trim to full duration when video loads
    setTrimRange([0, newDuration])
  }

  const handleDimensionsChange = (width: number, height: number) => {
    setVideoDimensions({ width, height })
  }

  const handleSeek = (time: number) => {
    setCurrentTime(time)
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Editor Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          </Link>
          <div className="h-6 w-px bg-border" />
          <span className="font-medium text-sm truncate max-w-[200px]">
            {filename}
          </span>
          <span className="text-xs text-muted-foreground border border-border px-1.5 py-0.5 rounded bg-muted/50">
            HD
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="font-medium bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Export GIF
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left: Preview & Timeline */}
          <ResizablePanel defaultSize={75} minSize={50}>
            <div className="h-full flex flex-col p-6 pb-10 gap-6 overflow-y-auto">
              {/* Preview Area */}
              <div className="flex-1 min-h-0 flex flex-col">
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
                <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                  Timeline & Trim
                </h3>
                <VideoTimeline
                  duration={duration}
                  value={trimRange}
                  onTrimChange={(start, end) => setTrimRange([start, end])}
                  isPlaying={isPlaying}
                  onPlayPause={setIsPlaying}
                  currentTime={currentTime}
                  onSeek={handleSeek}
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
            <SettingsPanel
              trimRange={trimRange}
              crop={crop}
              videoDimensions={videoDimensions}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
