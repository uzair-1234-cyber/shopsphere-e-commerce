import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Banner } from '../types';

interface HeroProps {
  banners: Banner[];
  onActionClick: (link: string) => void;
}

export default function Hero({ banners, onActionClick }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  if (banners.length === 0) return null;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const activeBanner = banners[currentSlide];

  return (
    <div id="hero-slider" className="relative h-[480px] w-full overflow-hidden bg-zinc-950 rounded-3xl mt-4 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 dark:shadow-none">
      {/* Background Slides */}
      <div className="absolute inset-0 transition-all duration-700 ease-in-out">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent z-10" />
        <img
          src={activeBanner.image}
          alt={activeBanner.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-all duration-1000 scale-105"
        />
      </div>

      {/* Content Layer */}
      <div className="absolute inset-0 z-20 flex items-center pl-6 sm:pl-16 md:pl-20 lg:pl-24">
        <div className="max-w-2xl w-full text-white">
          {/* Tagline Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-bold tracking-wider mb-6 backdrop-blur-md uppercase">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
            <span>EXCLUSIVELY ON SHOPSPHERE</span>
          </div>
          
          {/* Hero Title */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1] drop-shadow-md select-none">
            {activeBanner.title}
          </h1>
          
          {/* Subtitle */}
          <p className="font-sans mt-4 text-base sm:text-lg text-zinc-300 leading-relaxed max-w-lg font-normal">
            {activeBanner.subtitle}
          </p>
          
          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => onActionClick(activeBanner.link)}
              className="group relative bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-3.5 rounded-2xl text-sm font-bold tracking-wide transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-indigo-600/30 active:translate-y-0 flex items-center gap-2 overflow-hidden"
            >
              <span className="relative z-10">Explore Collection</span>
              <ChevronRight className="h-4 w-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
            </button>
            
            <button
              onClick={() => onActionClick('/shop')}
              className="px-6 py-3.5 rounded-2xl text-sm font-bold tracking-wide text-zinc-300 hover:text-white border border-zinc-700/60 hover:border-zinc-500 bg-black/10 hover:bg-white/5 backdrop-blur-sm transition-all"
            >
              View All Offers
            </button>
          </div>
        </div>
      </div>

      {/* Slider Controls */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white backdrop-blur-sm transition-all"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white backdrop-blur-sm transition-all"
            aria-label="Next Slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
