import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from './motion';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Ticket, Sparkles, Trophy, Star, ChevronRight, X } from './icons';

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

  // Brochure Popup State
  const [showBrochure, setShowBrochure] = useState(false);
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);

  useEffect(() => {
    // Check localStorage to see if user opted out
    const hideBrochure = localStorage.getItem('hideBrochure');
    if (!hideBrochure) {
      setShowBrochure(true);
    }
  }, []);

  const closeBrochure = () => {
    if (doNotShowAgain) {
      localStorage.setItem('hideBrochure', 'true');
    }
    setShowBrochure(false);
  };

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const currentBanner = activeBanners[currentIndex] || {
    title: '오시쿠지',
    subtitle: '推しクジ',
    imageUrl: 'https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=1920',
    buttonText: '시작하기'
  };

  return (
    <div className="h-full w-full overflow-hidden relative aurora-bg text-white font-sans">
      {/* Background Slider */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
          animate={{ opacity: 0.6, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 mix-blend-screen"
        >
          <ImageWithFallback
            src={currentBanner.imageUrl}
            alt={currentBanner.title}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10" />
        </motion.div>
      </AnimatePresence>

      {/* Content Layer */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 text-center">
        {/* Animated Title */}
        <motion.div
          key={`text-${currentIndex}`}
          initial={{ y: 40, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8, type: "spring", bounce: 0.4 }}
          className="mb-12 glass-panel p-8 rounded-3xl shadow-2xl relative overflow-hidden"
        >
          {/* Subtle inner glow */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none" />
          
          <h2 className="text-cyan-400 text-xl md:text-2xl font-semibold mb-3 tracking-[0.3em] uppercase drop-shadow-md">
            {currentBanner.subtitle}
          </h2>
          <h1 className="text-white text-5xl md:text-7xl font-black tracking-tighter drop-shadow-2xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
            {currentBanner.title}
          </h1>
          <div className="w-20 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-600 mx-auto rounded-full shadow-[0_0_20px_rgba(34,211,238,0.8)]" />
        </motion.div>

        {/* Awesome Start Button */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, type: "spring", bounce: 0.5 }}
          className="relative group"
        >
          {/* Super Glow effect */}
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
          
          <button
            onClick={onStart}
            className="relative px-12 py-5 bg-black/80 backdrop-blur-md rounded-full leading-none flex items-center gap-4 overflow-hidden border border-white/20 hover:border-cyan-400/50 transition-colors duration-300"
          >
            <span className="flex items-center gap-3 text-white text-xl md:text-2xl font-bold tracking-wider uppercase group-hover:text-cyan-300 transition-colors duration-300">
              <Ticket className="w-6 h-6 md:w-8 md:h-8 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
              {currentBanner.buttonText || 'Start Kuji'}
            </span>
            <ChevronRight className="w-6 h-6 text-white/50 group-hover:translate-x-2 group-hover:text-cyan-300 transition-all duration-300" />
            
            {/* Fluid Shine effect */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shine" />
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


      {/* Brochure Popup */}
      <AnimatePresence>
        {showBrochure && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-3xl h-[85vh] bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-700"
            >
              {/* Header (상단 X 버튼 제거: 햄버거 버튼과 겹침. 닫기는 하단 '닫기' 버튼 사용) */}
              <div className="flex items-center justify-center px-4 py-3 bg-slate-800 border-b border-slate-700 shrink-0">
                <h3 className="text-white font-bold">🎉 서비스 오픈 안내</h3>
              </div>
              
              {/* iframe Container */}
              <div className="flex-1 w-full bg-black overflow-hidden relative">
                <iframe 
                  src="/brochure.html" 
                  className="absolute inset-0 w-full h-full border-0"
                  title="브로셔"
                />
              </div>
              
              {/* Footer */}
              <div className="px-4 py-3 bg-slate-800 border-t border-slate-700 shrink-0 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-white/70 hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={doNotShowAgain}
                    onChange={(e) => setDoNotShowAgain(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 text-pink-500 focus:ring-pink-500 focus:ring-offset-slate-800 bg-slate-700"
                  />
                  <span className="text-sm">다음에 안 띄우기</span>
                </label>
                <button
                  onClick={closeBrochure}
                  className="px-4 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-sm font-bold transition-colors"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
