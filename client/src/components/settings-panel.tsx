import { useState, useEffect } from 'react'
import {
  Settings,
  Sliders,
  Monitor,
  Download,
  Share2,
  FileVideo,
  Palette,
  Zap,
  FilePenLine,
  Gauge,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
// @ts-ignore
import GIF from 'gif.js'

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
  const [fps, setFps] = useState([60])
  const [compression, setCompression] = useState([30]) // 0-100, where 100 is max compression
  const [isExporting, setIsExporting] = useState(false)
  const [width, setWidth] = useState('original')
  const [filename, setFilename] = useState('')
  const [fastMode, setFastMode] = useState(false)

  const [progress, setProgress] = useState(0)
  const [estSize, setEstSize] = useState('Calculating...')

  useEffect(() => {
    const { file } = getVideo()
    if (file && !filename) {
      setFilename(file.name.replace(/\.[^/.]+$/, ''))
    }
  }, [])

  useEffect(() => {
    const duration = Math.max(0.1, trimRange[1] - trimRange[0]);
    const numFrames = duration * fps[0];

    const originalWidth = videoDimensions.width;
    const originalHeight = videoDimensions.height;

    const cropW = Math.floor((crop.width / 100) * originalWidth);
    const cropH = Math.floor((crop.height / 100) * originalHeight);

    let currentGifWidth = cropW;
    let currentGifHeight = cropH;

    if (width !== 'original') {
      const targetWidth = parseInt(width);
      const ratio = cropH / cropW;
      currentGifWidth = targetWidth;
      currentGifHeight = Math.round(targetWidth * ratio);
    }

    const pixelCount = currentGifWidth * currentGifHeight;

    // Determine the effective quality based on fastMode and compression settings
    const effectiveQuality = fastMode ? 30 : Math.max(1, Math.floor(compression[0] / 3));

    // Heuristic for GIF size estimation
    // Invert the quality scale for compressionFactor:
    // gif.js quality: 1 (best) -> 30 (worst/fastest)
    // est. size compressionFactor: 2.0 (largest size) -> 0.5 (smallest size)
    // A simple linear mapping: (30 - effectiveQuality) / 29 * (2.0 - 0.5) + 0.5
    const compressionFactor = ((30 - effectiveQuality) / 29) * 1.5 + 0.5;

    const bytes = numFrames * pixelCount * compressionFactor;
    const mb = bytes / (1024 * 1024);

    setEstSize(mb < 1 ? `${(mb * 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`);
  }, [fps, trimRange, crop, videoDimensions, compression, width, fastMode]);

  const handleExport = async () => {
    console.log('Starting export process.');
    const { url, file } = getVideo();

    if (!url) {
      toast({
        title: 'Export Failed',
        description: 'No video source found to export.',
        variant: 'destructive',
      });
      console.error('Export Failed: No video source URL found.');
      return;
    }

    setIsExporting(true);
    setProgress(0);
    toast({
      title: 'Starting Export...',
      description: fastMode
        ? 'Generating fast preview...'
        : 'Processing your video frames. This may take a moment.',
    });

    const tempVideo = document.createElement('video');
    tempVideo.src = url;
    tempVideo.crossOrigin = 'anonymous';
    tempVideo.muted = true;
    tempVideo.playsInline = true;

    console.log('Loading video metadata...');
    await new Promise<void>((resolve, reject) => {
      tempVideo.onloadedmetadata = () => {
        console.log('Video metadata loaded.');
        resolve();
      };
      tempVideo.onerror = (e) => {
        console.error('Failed to load video metadata:', e);
        reject('Could not load video metadata');
      };
    }).catch((error) => {
      setIsExporting(false);
      toast({
        title: 'Export Failed',
        description: error,
        variant: 'destructive',
      });
      return;
    });

    const originalWidth = tempVideo.videoWidth;
    const originalHeight = tempVideo.videoHeight;
    console.log(`Original video dimensions: ${originalWidth}x${originalHeight}`);

    const cropX = Math.floor((crop.x / 100) * originalWidth);
    const cropY = Math.floor((crop.y / 100) * originalHeight);
    const cropW = Math.floor((crop.width / 100) * originalWidth);
    const cropH = Math.floor((crop.height / 100) * originalHeight);
    console.log(`Crop dimensions: X:${cropX}, Y:${cropY}, W:${cropW}, H:${cropH}`);

    let gifWidth = cropW;
    let gifHeight = cropH;

    if (width !== 'original') {
      const targetWidth = parseInt(width);
      const ratio = cropH / cropW;
      gifWidth = targetWidth;
      gifHeight = Math.round(targetWidth * ratio);
    }
    console.log(`GIF output dimensions: ${gifWidth}x${gifHeight}`);

    if (gifWidth <= 0 || gifHeight <= 0) {
      setIsExporting(false);
      toast({
        title: 'Export Failed',
        description: 'Invalid dimensions. Please check your crop settings.',
        variant: 'destructive',
      });
      console.error('Export Failed: Invalid GIF dimensions.');
      return;
    }

    const duration = Math.max(0.1, trimRange[1] - trimRange[0]);
    const numFrames = Math.max(1, Math.floor(duration * fps[0]));
    const delay = 1000 / fps[0]; // Delay in ms

    const quality = fastMode ? 30 : Math.max(1, Math.floor(compression[0] / 3));
    console.log(`GIF settings: numFrames=${numFrames}, delay=${delay}, quality=${quality}`);

    console.log('Initializing GIF worker...');
    const gif = new GIF({
      workers: navigator.hardwareConcurrency || 4, // Use all available cores
      quality: quality,
      width: gifWidth,
      height: gifHeight,
      workerScript: import.meta.env.BASE_URL + 'gif.worker.js',
    });

    gif.on('progress', (p: number) => {
      const currentProgress = Math.round(p * 100);
      console.log(`GIF worker progress: ${currentProgress}%`);
      setProgress(currentProgress);
    });

    gif.on('finished', (blob: Blob) => {
      console.log('GIF worker finished encoding.');
      setIsExporting(false);
      setProgress(0);

      const image = URL.createObjectURL(blob);
      const animatedImage = document.createElement('a');
      animatedImage.href = image;
      animatedImage.download = (filename || 'export') + '.gif';
      document.body.appendChild(animatedImage);
      animatedImage.click();
      document.body.removeChild(animatedImage);

      onExport?.();
      toast({
        title: 'Export Complete!',
        description: 'Your GIF has been generated and downloaded.',
        variant: 'default',
        action: (
          <Button size="sm" onClick={() => window.open(image, '_blank')}>
            View
          </Button>
        ),
      });
    });

    // Frame capture loop
    const canvas = document.createElement('canvas');
    canvas.width = gifWidth;
    canvas.height = gifHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true }); // Optimize for readback

    if (!ctx) {
      setIsExporting(false);
      toast({
        title: 'Error',
        description: 'Could not create canvas context',
        variant: 'destructive',
      });
      console.error('Export Failed: Could not create canvas context.');
      return;
    }

    try {
      console.log('Starting frame capture loop...');
      for (let i = 0; i < numFrames; i++) {
        const time = trimRange[0] + i / fps[0];
        tempVideo.currentTime = time;

        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            tempVideo.removeEventListener('seeked', onSeeked);
            resolve();
          };
          tempVideo.addEventListener('seeked', onSeeked);
        });

        ctx.drawImage(
          tempVideo,
          cropX,
          cropY,
          cropW,
          cropH, // Source crop
          0,
          0,
          gifWidth,
          gifHeight // Destination size
        );

        gif.addFrame(ctx, { copy: true, delay: delay });

        // Update progress for capture phase (first 50%)
        setProgress(Math.round((i / numFrames) * 50));
        console.log(`Captured frame ${i + 1}/${numFrames}. Progress: ${Math.round((i / numFrames) * 50)}%`);
      }
      console.log('Frame capture loop completed. Initiating GIF render...');

      gif.render();
    } catch (err) {
      console.error('Error during frame capture or GIF rendering:', err);
      setIsExporting(false);
      toast({
        title: 'Error',
        description: 'Failed to process video frames',
        variant: 'destructive',
      });
    }
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
                const originalWidth = videoDimensions.width;
                const originalHeight = videoDimensions.height;
                const cropW = Math.floor((crop.width / 100) * originalWidth);
                const cropH = Math.floor((crop.height / 100) * originalHeight);

                let currentGifWidth = cropW;
                let currentGifHeight = cropH;

                if (width !== 'original') {
                  const targetWidth = parseInt(width);
                  const ratio = cropH / cropW;
                  currentGifWidth = targetWidth;
                  currentGifHeight = Math.round(targetWidth * ratio);
                }
                return width === 'original' ? `${originalWidth}x${originalHeight} (Original)` : `${currentGifWidth}x${currentGifHeight}`;
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

        {/* Compression / Optimization */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <FileVideo className="size-4 text-muted-foreground" />
              Compression
            </label>
            <span className="text-xs text-muted-foreground">
              {compression[0] < 30
                ? 'High Quality'
                : compression[0] < 70
                  ? 'Balanced'
                  : 'Small Size'}
            </span>
          </div>

          <Slider
            value={compression}
            onValueChange={setCompression}
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
              Reduces color sampling for faster export. Great for testing.
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
          onClick={handleExport}
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
