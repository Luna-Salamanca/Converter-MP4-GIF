import { useEffect, memo } from 'react'

const isVideoFile = (url: string): boolean => {
  return /\.(mp4|webm|ogg|mov)$/i.test(url)
}

export interface LightboxProps {
  imageUrl: string
  onClose: () => void
}

export const Lightbox = memo(({ imageUrl, onClose }: LightboxProps) => {
  const isVideo = isVideoFile(imageUrl)

  useEffect(() => {
    document.body.style.overflow = 'hidden'

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button
        className="lightbox-close"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        ×
      </button>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        {isVideo ? (
          <video
            src={imageUrl}
            controls
            autoPlay
            loop
            muted
            playsInline
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
            }}
          />
        ) : (
          <img
            src={imageUrl}
            alt="Enlarged memory"
            loading="eager"
            decoding="async"
          />
        )}
      </div>
    </div>
  )
})

Lightbox.displayName = 'Lightbox'
