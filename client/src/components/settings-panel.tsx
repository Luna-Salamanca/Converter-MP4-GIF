import {
  Sliders,
  Monitor,
  Download,
  Share2,
  FileVideo,
  FilePenLine,
  Gauge,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEditor } from '@/context/editor-context'

export function SettingsPanel() {
  const {
    fps, setFps,
    compression, setCompression,
    width, setWidth,
    filename, setFilename,
    fastMode, setFastMode,
    videoDimensions,
    crop,
    estSize,
    triggerExport,
    isExporting,
    progress
  } = useEditor()

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      <div className="p-4 border-b border-border">
        <h2 className="font-display font-bold text-lg flex items-center gap-2">
          <Sliders className="size-4 text-primary" />
          Export Settings
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {/* Filename Input */}
        <div className="space-y-4">
          <label className="text-sm font-medium flex items-center gap-2">
            <FilePenLine className="size-4 text-muted-foreground" />
            Filename
          </label>
          <div className="flex items-center gap-2">
            <Input
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter filename"
              className="font-mono text-sm bg-background"
            />
            <span className="text-sm text-muted-foreground font-mono">
              .gif
            </span>
          </div>
        </div>

        <Separator />

        {/* FPS Control */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <ZapIcon className="size-4 text-muted-foreground" />
              Frame Rate
            </label>
            <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">
              {fastMode && fps > 15 ? (
                <>
                  <span className="line-through opacity-50 mr-2">{fps} FPS</span>
                  <span>15 FPS (Draft)</span>
                </>
              ) : (
                <>{fps} FPS</>
              )}
            </span>
          </div>
          <Slider
            value={[fps]}
            onValueChange={([val]) => setFps(val)}
            max={60}
            min={5}
            step={1}
            disabled={fastMode}
            className={fastMode ? 'opacity-50' : '[&>.range]:bg-primary'}
          />
        </div>

        <Separator />

        {/* Resolution */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <Monitor className="size-4 text-muted-foreground" />
              Dimensions
            </label>
            <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">
              {(() => {
                const originalWidth = videoDimensions.width;
                const originalHeight = videoDimensions.height; // Unused but kept for clarity/expansion
                const cropW = Math.floor((crop.width / 100) * originalWidth);
                const cropH = Math.floor((crop.height / 100) * videoDimensions.height);

                let currentGifWidth = cropW;
                let currentGifHeight = cropH;

                if (width !== 'original') {
                  const targetWidth = parseInt(width);
                  const ratio = cropH / cropW;
                  currentGifWidth = targetWidth;
                  currentGifHeight = Math.round(targetWidth * ratio);
                }
                return width === 'original' ? `${videoDimensions.width}x${videoDimensions.height} (Original)` : `${currentGifWidth}x${currentGifHeight}`;
              })()}
            </span>
          </div>
          <Select
            value={width}
            onValueChange={setWidth}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="original">
                Original ({videoDimensions.width}x{videoDimensions.height})
              </SelectItem>
              <SelectItem value="720">HD (720px Width)</SelectItem>
              <SelectItem value="480">Social (480px Width)</SelectItem>
              <SelectItem value="360">Mobile (360px Width)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Compression / Optimization */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <FileVideo className="size-4 text-muted-foreground" />
              Compression
            </label>
            <span className="text-xs text-muted-foreground">
              {compression < 30
                ? 'High Quality'
                : compression < 70
                  ? 'Balanced'
                  : 'Small Size'}
            </span>
          </div>

          <Slider
            value={[compression]}
            onValueChange={([val]) => setCompression(val)}
            max={100}
            step={1}
            disabled={fastMode}
            className={fastMode ? 'opacity-50' : 'py-2'}
          />

          <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
            <span>Best Quality</span>
            <span>Small Size</span>
          </div>
        </div>

        <Separator />

        {/* Optimization / Draft Mode */}
        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-1">
            <Label htmlFor="fast-mode" className="flex items-center gap-2">
              <Gauge className="size-4 text-muted-foreground" />
              Draft Mode (Fast)
            </Label>
            <p className="text-[10px] text-muted-foreground max-w-[200px]">
              Reduces color sampling and caps FPS at 15 for faster export. Great for testing.
            </p>
          </div>
          <Switch
            id="fast-mode"
            checked={fastMode}
            onCheckedChange={setFastMode}
          />
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-4 bg-muted/10 border-t border-border space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Est. Size:</span>
          <span className="font-mono font-bold text-foreground">{estSize}</span>
        </div>
        <Button
          className="w-full gap-2 font-bold"
          size="lg"
          onClick={triggerExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <div className="size-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              {progress === 100
                ? 'Finalizing...'
                : progress > 0
                  ? `Processing ${progress}%`
                  : 'Processing...'}
            </>
          ) : (
            <>
              <Download className="size-4" />
              Export GIF
            </>
          )}
        </Button>
        <Button variant="outline" className="w-full gap-2">
          <Share2 className="size-4" />
          Share
        </Button>
      </div>
    </div>
  )
}

function ZapIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

