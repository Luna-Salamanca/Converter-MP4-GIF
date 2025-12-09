import { useState, useEffect, useRef } from 'react'
import {
  Settings,
  Sliders,
  Monitor,
  Download,
  Share2,
  FileVideo,
  Zap,
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
import { toast } from '@/hooks/use-toast'
import { getVideo } from '@/lib/video-state'
import { Label } from '@/components/ui/label'

interface SettingsPanelProps {
  onExport?: () => void
  trimRange?: number[]
  crop?: { x: number; y: number; width: number; height: number }
  videoDimensions?: { width: number; height: number }
}

export function SettingsPanel({
  onExport,
  trimRange = [0, 5],
  crop = { x: 0, y: 0, width: 100, height: 100 },
  videoDimensions = { width: 1920, height: 1080 },
}: SettingsPanelProps) {
  const [fps, setFps] = useState([15])
  const [isExporting, setIsExporting] = useState(false)
  const [width, setWidth] = useState('original')
  const [filename, setFilename] = useState('')
  const [fastMode, setFastMode] = useState(true)

  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState('')
  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    const { file } = getVideo()
    if (file && !filename) {
      setFilename(file.name.replace(/\.[^/.]+$/, ''))
    }
  }, [])

  useEffect(() => {
    // Initialize the worker
    workerRef.current = new Worker(new URL('../lib/ffmpeg.worker.ts', import.meta.url), {
      type: 'module',
    });

    // Handle messages from the worker
    workerRef.current.onmessage = (event) => {
      const { type, progress, data, error, message } = event.data;
      if (type === 'progress') {
        setProgress(progress);
      } else if (type === 'info') {
        setStatusMessage(message);
      } else if (type === 'done') {
        setIsExporting(false);
        setProgress(0);
        setStatusMessage('');

        const blob = new Blob([data], { type: 'image/gif' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (filename || 'export') + '.gif';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        onExport?.();
        toast({
          title: 'Export Complete!',
          description: 'Your GIF has been generated and downloaded.',
          variant: 'default',
          action: (
            <Button size="sm" onClick={() => window.open(url, '_blank')}>
              View
            </Button>
          ),
        });
      } else if (type === 'error') {
        setIsExporting(false);
        toast({
          title: 'Export Failed',
          description: error || 'An unknown error occurred in the worker.',
          variant: 'destructive',
        });
      }
    };

    // Cleanup
    return () => {
      workerRef.current?.terminate();
    };
  }, [filename, onExport]);


  const handleExport = () => {
    const { file } = getVideo();

    if (!file) {
      toast({
        title: 'Export Failed',
        description: 'No video source found to export.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    setProgress(0);
    setStatusMessage('Preparing export...');

    // These crop values are percentages, convert them to pixels for ffmpeg
    const cropInPixels = {
      width: Math.floor(videoDimensions.width * (crop.width / 100)),
      height: Math.floor(videoDimensions.height * (crop.height / 100)),
      x: Math.floor(videoDimensions.width * (crop.x / 100)),
      y: Math.floor(videoDimensions.height * (crop.y / 100)),
    };
    
    workerRef.current?.postMessage({
      file,
      trimRange,
      crop: cropInPixels,
      fps: fps[0],
      width: width,
      fastMode,
    });
  };

  const getButtonText = () => {
    if (!isExporting) return 'Export GIF';
    if (statusMessage) return statusMessage;
    if (progress > 0) return `Processing ${Math.round(progress * 100)}%`;
    return 'Processing...';
  }

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
              <Zap className="size-4 text-muted-foreground" />
              Frame Rate
            </label>
            <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">
              {fps} FPS
            </span>
          </div>
          <Slider
            value={fps}
            onValueChange={setFps}
            max={60}
            min={5}
            step={1}
            className="[&>.range]:bg-primary"
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
                const cropW = Math.floor((crop.width / 100) * videoDimensions.width);
                const cropH = Math.floor((crop.height / 100) * videoDimensions.height);

                if (width === 'original') {
                  return `${cropW}x${cropH}`;
                }
                const targetWidth = parseInt(width);
                const ratio = cropH / cropW;
                const currentGifHeight = Math.round(targetWidth * ratio);
                return `${targetWidth}x${currentGifHeight}`;
              })()}
            </span>
          </div>
          <Select
            defaultValue="original"
            onValueChange={setWidth}
            value={width}
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

        {/* Optimization / Draft Mode */}
        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-1">
            <Label htmlFor="fast-mode" className="flex items-center gap-2">
              <Gauge className="size-4 text-muted-foreground" />
              Fast Mode
            </Label>
            <p className="text-[10px] text-muted-foreground max-w-[200px]">
              Uses a faster, single-pass encoding. Good for previews. Uncheck for higher quality.
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
        <Button
          className="w-full gap-2 font-bold"
          size="lg"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting && (
            <div className="size-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
          )}
          {getButtonText()}
        </Button>
        <Button variant="outline" className="w-full gap-2">
          <Share2 className="size-4" />
          Share
        </Button>
      </div>
    </div>
  )
}
