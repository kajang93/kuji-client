import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from './motion';
import { Ticket, Sparkles, Trophy, Star, ChevronRight } from './icons';
import { ImageWithFallback } from './figma/ImageWithFallback';

type Banner = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  link?: string;
  buttonText?: string;
  createdAt: string;
  updatedAt: string;
};

type MainScreenProps = {
  onStart: () => void;
  banners: Banner[];
};

export default function MainScreen({ onStart, banners }: MainScreenProps) {
  const activeBanners = banners.filter(b => b.isActive).sort((a, b) => a.order - b.order);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const currentBanner = activeBanners[currentIndex] || {
    title: '이치방쿠지',
    subtitle: '一番くじ',
    imageUrl: 'https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=1920',
    buttonText: '시작하기'
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-black">
      {/* Background Slider */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-black/40 z-10" /> {/* Dim overlay */}
          <ImageWithFallback
            src={currentBanner.imageUrl}
            alt={currentBanner.title}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-10" />
        </motion.div>
      </AnimatePresence>

      {/* Content Layer */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 text-center">
        {/* Animated Title */}
        <motion.div
          key={`text-${currentIndex}`}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-amber-400 text-2xl md:text-4xl font-bold mb-2 tracking-widest uppercase">
            {currentBanner.subtitle}
          </h2>
          <h1 className="text-white text-5xl md:text-8xl font-black tracking-tight drop-shadow-2xl mb-6">
            {currentBanner.title}
          </h1>
          <div className="w-24 h-1 bg-amber-500 mx-auto rounded-full shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
        </motion.div>

        {/* Awesome Start Button */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="relative group"
        >
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 via-amber-500 to-blue-600 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
          
          <button
            onClick={onStart}
            className="relative px-16 py-6 bg-black rounded-full leading-none flex items-center gap-4 overflow-hidden"
          >
            <span className="flex items-center gap-3 text-white text-2xl md:text-3xl font-bold tracking-wide uppercase group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-amber-500 transition-all duration-300">
              <Ticket className="w-8 h-8 md:w-10 md:h-10 text-amber-500" />
              {currentBanner.buttonText || 'Start'}
            </span>
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white/50 group-hover:translate-x-2 transition-transform duration-300" />
            
            {/* Shine effect */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-shine" />
          </button>
        </motion.div>

        {/* Slide Indicators */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-10 flex gap-3">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-8 bg-amber-500' : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Decoration Elements - Non-intrusive */}
      <div className="absolute top-10 right-10 z-20 hidden md:block">
        <div className="flex items-center gap-2 text-white/60 text-sm bg-black/20 backdrop-blur px-4 py-2 rounded-full border border-white/10">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Premium Collection</span>
        </div>
      </div>
      
      <div className="absolute bottom-10 left-10 z-20 hidden md:block">
        <div className="flex items-center gap-2 text-white/60 text-sm bg-black/20 backdrop-blur px-4 py-2 rounded-full border border-white/10">
          <Star className="w-4 h-4 text-yellow-400" />
          <span>Official License</span>
        </div>
      </div>
    </div>
  );
}
