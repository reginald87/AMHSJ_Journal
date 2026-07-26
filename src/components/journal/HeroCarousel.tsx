'use client';

import { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CarouselSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaHref?: string;
}

interface HeroCarouselProps {
  slides: CarouselSlide[];
}

export function HeroCarousel({ slides: initialSlides = [] }: HeroCarouselProps) {
  const [slides] = useState<CarouselSlide[]>(() => initialSlides || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // No need for effect - initial value is set via lazy initialization

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % (slides.length || 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + (slides.length || 1)) % (slides.length || 1));
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    if (slides.length > 0) {
      setCurrentIndex(index % slides.length);
    }
  }, [slides.length]);

  useEffect(() => {
    if (!isPlaying || slides.length === 0) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isPlaying, nextSlide, slides.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null || slides.length === 0) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    setTouchStart(null);
  };

  const currentSlide = slides[currentIndex];

  if (!currentSlide || slides.length === 0) return null;

  return (
    <section
      className="relative overflow-hidden gradient-navy -mt-16 pt-16"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-900/50 to-navy-800/50" />

      <div className="relative h-[70vh] min-h-[500px] max-h-[800px] flex items-center">
        <div
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${currentSlide.image})`,
            opacity: 1,
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/70 via-navy-800/50 to-navy-900/30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl animate-fade-in">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/20 text-gold-300 text-sm font-medium border border-gold-500/30 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500"></span>
              </span>
              {currentSlide.subtitle.split('.')[0]}
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              {currentSlide.title}
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl">
              {currentSlide.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {currentSlide.ctaText && currentSlide.ctaHref && (
                <a
                  href={currentSlide.ctaHref}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gold-400 text-navy-950 rounded-lg font-semibold text-lg hover:bg-gold-300 transition-colors group"
                >
                  {currentSlide.ctaText}
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </a>
              )}
              <a
                href="/journal"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors"
              >
                Browse Archive
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'w-3 h-3 rounded-full transition-all duration-300',
                index === currentIndex
                  ? 'bg-gold-400 w-8'
                  : 'bg-white/40 hover:bg-white/60'
              )}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            />
          ))}
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors lg:hidden"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors lg:hidden"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute right-8 bottom-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          aria-label={isPlaying ? 'Pause carousel' : 'Play carousel'}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}