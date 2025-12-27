import { useState, useRef, useEffect, useCallback, memo } from 'react'
import { PhotoItem } from '../cassie-content'

const isVideoFile = (url: string): boolean => {
  return /\.(mp4|webm|ogg|mov)$/i.test(url)
}

export interface PhotoCarouselProps {
  photo: PhotoItem
  onImageClick: (url: string) => void
}

export const PhotoCarousel = memo(
  ({ photo, onImageClick }: PhotoCarouselProps) => {
    const images = photo.images || (photo.imageUrl ? [photo.imageUrl] : [])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set([0]))
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
      if (images.length <= 1) return

      const preloadMedia = (index: number) => {
        if (imagesLoaded.has(index)) return

        const url = images[index]

        if (isVideoFile(url)) {
          setImagesLoaded((prev) => new Set([...prev, index]))
        } else {
          const img = new Image()
          img.src = url
          img.onload = () => {
            setImagesLoaded((prev) => new Set([...prev, index]))
          }
        }
      }

      const nextIndex = (currentIndex + 1) % images.length
      const prevIndex = (currentIndex - 1 + images.length) % images.length

      preloadMedia(currentIndex)
      preloadMedia(nextIndex)
      preloadMedia(prevIndex)
    }, [currentIndex, images, imagesLoaded])

    useEffect(() => {
      if (images.length <= 1 || photo.autoRotate === false) return

      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
      }, photo.rotateInterval || 3000)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }, [images.length, photo.autoRotate, photo.rotateInterval])

    const handleMouseEnter = useCallback(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }, [])

    const handleMouseLeave = useCallback(() => {
      if (images.length > 1 && photo.autoRotate !== false) {
        intervalRef.current = setInterval(() => {
          setCurrentIndex((prev) => (prev + 1) % images.length)
        }, photo.rotateInterval || 3000)
      }
    }, [images.length, photo.autoRotate, photo.rotateInterval])

    const goToNext = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation()
        setCurrentIndex((prev) => (prev + 1) % images.length)
      },
      [images.length]
    )

    const goToPrev = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation()
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
      },
      [images.length]
    )

    const handleImageClick = useCallback(() => {
      onImageClick(images[currentIndex])
    }, [images, currentIndex, onImageClick])

    if (images.length === 0) {
      return <>{photo.placeholder}</>
    }

    const currentMedia = images[currentIndex]
    const isVideo = isVideoFile(currentMedia)

    return (
      <div
        className="photo-carousel"
        onClick={handleImageClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: 'zoom-in' }}
      >
        {isVideo ? (
          <video
            ref={videoRef}
            src={currentMedia}
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '15px',
            }}
          />
        ) : (
          <img
            src={currentMedia}
            alt={photo.alt || photo.placeholder}
            loading="lazy"
            decoding="async"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '15px',
            }}
          />
        )}
        {images.length > 1 && (
          <>
            <button
              className="carousel-btn carousel-prev"
              onClick={goToPrev}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              className="carousel-btn carousel-next"
              onClick={goToNext}
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}
      </div>
    )
  }
)

PhotoCarousel.displayName = 'PhotoCarousel'
