import { useEffect, useRef, useState, useCallback, memo } from 'react';
import '@/styles/cassie.css';
import { cassiePageContent, PhotoItem } from './cassie-content';
import PasswordUnlock from '@/components/password-unlock';
import { STORAGE_KEY } from './cassie-config';

const isVideoFile = (url: string): boolean => {
  return /\.(mp4|webm|ogg|mov)$/i.test(url);
};

const PhotoCarousel = memo(({ photo, onImageClick }: { photo: PhotoItem, onImageClick: (url: string) => void }) => {
  const images = photo.images || (photo.imageUrl ? [photo.imageUrl] : []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set([0]));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (images.length <= 1) return;

    const preloadMedia = (index: number) => {
      if (imagesLoaded.has(index)) return;
      
      const url = images[index];
      
      if (isVideoFile(url)) {
        setImagesLoaded(prev => new Set([...prev, index]));
      } else {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          setImagesLoaded(prev => new Set([...prev, index]));
        };
      }
    };

    const nextIndex = (currentIndex + 1) % images.length;
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    
    preloadMedia(currentIndex);
    preloadMedia(nextIndex);
    preloadMedia(prevIndex);
  }, [currentIndex, images, imagesLoaded]);

  useEffect(() => {
    if (images.length <= 1 || photo.autoRotate === false) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, photo.rotateInterval || 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [images.length, photo.autoRotate, photo.rotateInterval]);

  const handleMouseEnter = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (images.length > 1 && photo.autoRotate !== false) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, photo.rotateInterval || 3000);
    }
  }, [images.length, photo.autoRotate, photo.rotateInterval]);

  const goToNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleImageClick = useCallback(() => {
    onImageClick(images[currentIndex]);
  }, [images, currentIndex, onImageClick]);

  if (images.length === 0) {
    return <>{photo.placeholder}</>;
  }

  const currentMedia = images[currentIndex];
  const isVideo = isVideoFile(currentMedia);

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
  );
});

PhotoCarousel.displayName = 'PhotoCarousel';

const Lightbox = memo(({ imageUrl, onClose }: { imageUrl: string, onClose: () => void }) => {
  const isVideo = isVideoFile(imageUrl);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleEscape);
    
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

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
  );
});

Lightbox.displayName = 'Lightbox';

export default function CassiePage() {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const daysRef = useRef<HTMLSpanElement>(null);
  const hoursRef = useRef<HTMLSpanElement>(null);
  const minutesRef = useRef<HTMLSpanElement>(null);
  const secondsRef = useRef<HTMLSpanElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const handleImageClick = useCallback((url: string) => {
    setSelectedImage(url);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const handleUnlock = useCallback(() => {
    setIsUnlocked(true);
    setShowPasswordModal(false);
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

    let lastUpdate = 0;
    function updateCountdown(timestamp: number) {
      if (timestamp - lastUpdate < 1000) {
        animationFrameRef.current = requestAnimationFrame(updateCountdown);
        return;
      }
      lastUpdate = timestamp;

      const { year, month, day } = cassiePageContent.countdown.birthday;
      const birthday = new Date(year, month, day);
      const now = new Date();

      if (now > birthday) {
        birthday.setFullYear(birthday.getFullYear() + 1);
      }

      const diff = birthday.getTime() - now.getTime();

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (daysRef.current) daysRef.current.textContent = days.toString();
      if (hoursRef.current) hoursRef.current.textContent = hours.toString();
      if (minutesRef.current) minutesRef.current.textContent = minutes.toString();
      if (secondsRef.current) secondsRef.current.textContent = seconds.toString();

      animationFrameRef.current = requestAnimationFrame(updateCountdown);
    }

    animationFrameRef.current = requestAnimationFrame(updateCountdown);

    let sparkleInterval: NodeJS.Timeout | null = null;
    
    if (isUnlocked) {
      let sparkleCount = 0;
      const maxSparkles = 5;

      function createSparkle() {
        if (sparkleCount >= maxSparkles) return;

        sparkleCount++;
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.animationDelay = Math.random() * 2 + 's';
        document.body.appendChild(sparkle);

        setTimeout(() => {
          sparkle.remove();
          sparkleCount--;
        }, 2000);
      }

      sparkleInterval = setInterval(createSparkle, 4000);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (sparkleInterval) {
        clearInterval(sparkleInterval);
      }
      observer.disconnect();
    };
  }, []);

  const renderText = useCallback((text: string) => {
    return text
      .replace(/"/g, '&ldquo;')
      .replace(/"/g, '&rdquo;')
      .replace(/'/g, '&rsquo;')
      .replace(/—/g, '&mdash;');
  }, []);

  const CountdownSection = () => (
    <section>
      <div className="countdown">
        <h2>{cassiePageContent.countdown.sectionTitle}</h2>
        <div className="timer-grid">
          <div className="timer-block">
            <span className="timer-number" ref={daysRef}>0</span>
            <span className="timer-label">Days</span>
          </div>
          <div className="timer-block">
            <span className="timer-number" ref={hoursRef}>0</span>
            <span className="timer-label">Hours</span>
          </div>
          <div className="timer-block">
            <span className="timer-number" ref={minutesRef}>0</span>
            <span className="timer-label">Minutes</span>
          </div>
          <div className="timer-block">
            <span className="timer-number" ref={secondsRef}>0</span>
            <span className="timer-label">Seconds</span>
          </div>
        </div>
        <p style={{ marginTop: '2rem', fontSize: '1.1rem', opacity: 0.9 }}>
          {cassiePageContent.countdown.subtitle}
        </p>
        
        {!isUnlocked && (
          <button 
            onClick={() => setShowPasswordModal(true)}
            style={{
              marginTop: '1.5rem',
              padding: '0.4rem 1rem',
              fontSize: '0.75rem',
              background: 'transparent',
              color: 'rgba(255, 255, 255, 0.4)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 400,
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
            }}
          >
            unlock early
          </button>
        )}
      </div>
    </section>
  );

  return (
    <div className="cassie-page">
      {!isUnlocked && <CountdownSection />}

      {showPasswordModal && (
        <PasswordUnlock 
          onUnlock={handleUnlock} 
          onClose={() => setShowPasswordModal(false)}
        />
      )}

      {isUnlocked && (
        <>
          {/* Hero Section */}
          <div className="hero">
            <div className="hero-content">
              <h1>{cassiePageContent.hero.title}</h1>
              <p className="subtitle">{cassiePageContent.hero.subtitle}</p>
            </div>
          </div>

          {/* Our Promise Section */}
          <section>
        <div className="promise fade-in">
          <p 
            className="promise-text" 
            dangerouslySetInnerHTML={{ 
              __html: `&ldquo;${renderText(cassiePageContent.promise.text)}&rdquo;` 
            }} 
          />
          <p className="promise-subtext">{cassiePageContent.promise.subtext}</p>
        </div>
      </section>

          {/* Memories Section */}
          <section>
        <h2>{cassiePageContent.memories.sectionTitle}</h2>
        <div className="memory-grid">
          {cassiePageContent.memories.cards.map((card, index) => (
            <div key={index} className="memory-card fade-in">
              <span className="memory-icon">{card.icon}</span>
              <h3 className="memory-title">{card.title}</h3>
              <p 
                className="memory-description" 
                dangerouslySetInnerHTML={{ __html: renderText(card.description) }} 
              />
            </div>
          ))}
        </div>
      </section>

          {/* Photo Gallery */}
          <section className="fade-in">
        <div className="photo-gallery">
          <h2>{cassiePageContent.photoGallery.sectionTitle}</h2>
          <div className="photo-grid">
            {cassiePageContent.photoGallery.photos.map((photo, index) => (
              <div key={index} className="photo-placeholder">
                <PhotoCarousel photo={photo} onImageClick={handleImageClick} />
              </div>
            ))}
          </div>
          <p
            style={{
              textAlign: 'center',
              marginTop: '2rem',
              color: 'var(--warm-gray)',
              fontStyle: 'italic',
            }}
          >
            {cassiePageContent.photoGallery.helpText}
          </p>
        </div>
      </section>

          {/* Reasons I Love You */}
          <section className="reasons">
        <h2>{cassiePageContent.reasons.sectionTitle}</h2>
        <div className="reasons-list">
          {cassiePageContent.reasons.items.map((reason, index) => (
            <div key={index} className="reason-item fade-in">
              <div className="reason-number">{reason.number}</div>
              <p 
                className="reason-text" 
                dangerouslySetInnerHTML={{ __html: renderText(reason.text) }} 
              />
            </div>
          ))}
        </div>
      </section>

          {/* Love Letter */}
          <section className="fade-in">
        <div className="love-letter">
          <h2>{cassiePageContent.loveLetter.greeting}</h2>
          <div className="letter-content">
            {cassiePageContent.loveLetter.paragraphs.map((paragraph, index) => (
              <p 
                key={index} 
                dangerouslySetInnerHTML={{ __html: renderText(paragraph.text) }} 
              />
            ))}
          </div>
          <p 
            className="signature" 
            dangerouslySetInnerHTML={{ __html: cassiePageContent.loveLetter.signature }} 
          />
        </div>
      </section>

          {/* Countdown Timer - shown at bottom when unlocked */}
          <CountdownSection />

          {/* Footer */}
          <footer>
        <p 
          className="footer-message" 
          dangerouslySetInnerHTML={{ 
            __html: `&ldquo;${renderText(cassiePageContent.footer.message)}&rdquo;` 
          }} 
        />
        <p className="footer-small">{cassiePageContent.footer.credit}</p>
      </footer>

          {/* Lightbox Overlay */}
          {selectedImage && (
            <Lightbox imageUrl={selectedImage} onClose={handleCloseLightbox} />
          )}
        </>
      )}
    </div>
  );
}