export interface FrameSampleOptions {
  videoUrl: string
  totalFrames: number
  samplesToTake: number
  fps: number
  trimRange: [number, number]
  crop: { x: number; y: number; w: number; h: number }
  width: number
  height: number
  onProgress?: (progress: number) => void
  signal?: AbortSignal
}

let cachedHash: string | null = null
let cachedSamples: Uint8ClampedArray[] | null = null
let cachedVideoUrl: string | null = null

export function clearSampleCache(url?: string) {
  if (!url || url === cachedVideoUrl) {
    cachedHash = null
    cachedSamples = null
    cachedVideoUrl = null
  }
}

function computeHash(options: FrameSampleOptions): string {
  const { totalFrames, samplesToTake, fps, trimRange, crop, width, height } =
    options
  return JSON.stringify({
    totalFrames,
    samplesToTake,
    fps,
    trimRange,
    crop,
    width,
    height,
  })
}

export async function sampleFrames(
  options: FrameSampleOptions
): Promise<Uint8ClampedArray[]> {
  const hash = computeHash(options)

  if (
    cachedHash === hash &&
    cachedVideoUrl === options.videoUrl &&
    cachedSamples
  ) {
    if (options.onProgress) options.onProgress(1)
    return cachedSamples
  }

  const {
    videoUrl,
    totalFrames,
    samplesToTake,
    fps,
    trimRange,
    crop,
    width,
    height,
    signal,
    onProgress,
  } = options

  const tempVideo = document.createElement('video')
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('No canvas context')

  tempVideo.src = videoUrl
  tempVideo.crossOrigin = 'anonymous'
  tempVideo.muted = true
  tempVideo.playsInline = true

  await new Promise<void>((resolve, reject) => {
    tempVideo.onloadedmetadata = () => resolve()
    tempVideo.onerror = (e) => reject(e)
  })

  if (signal?.aborted) return []

  const sampleStep = Math.max(1, Math.floor(totalFrames / samplesToTake))
  const samplePixels: Uint8ClampedArray[] = []

  for (
    let i = 0;
    i < totalFrames && samplePixels.length < samplesToTake;
    i += sampleStep
  ) {
    if (signal?.aborted) break

    const time = trimRange[0] + i / fps
    tempVideo.currentTime = time

    await new Promise<void>((resolve) => {
      const onSeeked = () => {
        tempVideo.removeEventListener('seeked', onSeeked)
        resolve()
      }
      tempVideo.addEventListener('seeked', onSeeked)
    })

    ctx.drawImage(
      tempVideo,
      crop.x,
      crop.y,
      crop.w,
      crop.h,
      0,
      0,
      width,
      height
    )
    samplePixels.push(ctx.getImageData(0, 0, width, height).data)

    if (onProgress) {
      onProgress(samplePixels.length / samplesToTake)
    }
  }

  tempVideo.removeAttribute('src')
  tempVideo.load()
  canvas.width = 0
  canvas.height = 0

  if (signal?.aborted) {
    return []
  }

  cachedHash = hash
  cachedSamples = samplePixels
  cachedVideoUrl = videoUrl

  return samplePixels
}
