import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from './motion';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Ticket, ChevronRight } from './icons';
import { trackFunnelEvent } from '../utils/funnelAnalytics';

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
  onExperience: () => void;
  banners: Banner[];
};

export default function MainScreen({ onStart, onExperience, banners }: MainScreenProps) {
  const activeBanners = banners.filter(b => b.isActive).sort((a, b) => a.order - b.order);
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => { trackFunnelEvent('LANDING_VIEW'); }, []);

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
    buttonText: '쿠지 구경하기'
  };

  return (
    <div className="h-full w-full relative aurora-bg text-white font-sans">
      <section aria-label="오시쿠지 시작" className="relative flex min-h-full flex-col overflow-hidden">
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

      {/* 하단 가장자리를 기본 배경색(#1d4391)으로 맞춰 아이폰 하단 툴바·홈 바와의 경계선을 없앤다 */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-32 bg-gradient-to-t from-[#1d4391] via-[#1d4391]/70 to-transparent" />

      {/* Content Layer */}
      <div className="relative z-20 flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        {/* Animated Title */}
        <motion.div
          key={`text-${currentIndex}`}
          initial={{ y: 40, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8, type: "spring", bounce: 0.4 }}
          className="mb-8 glass-panel p-8 rounded-3xl shadow-2xl relative overflow-hidden"
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
            onClick={onExperience}
            className="relative px-12 py-5 bg-black/80 backdrop-blur-md rounded-full leading-none flex items-center gap-4 overflow-hidden border border-white/20 hover:border-cyan-400/50 transition-colors duration-300"
          >
            <span className="flex items-center gap-3 text-white text-xl md:text-2xl font-bold tracking-wider uppercase group-hover:text-cyan-300 transition-colors duration-300">
              <Ticket className="w-6 h-6 md:w-8 md:h-8 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
              무료 쿠지 체험
            </span>
            <ChevronRight className="w-6 h-6 text-white/50 group-hover:translate-x-2 group-hover:text-cyan-300 transition-all duration-300" />
            
            {/* Fluid Shine effect */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shine" />
          </button>
        </motion.div>

        <p className="mt-5 text-sm text-slate-300">회원가입 없이, 마음껏 뜯어보세요.</p>
        <p className="mt-2 text-xs text-slate-400">가상 구매부터 개봉까지 · 결제·포인트 차감 없음</p>
        <button onClick={onStart} className="mt-5 rounded-full border border-white/15 bg-white/5 px-6 py-2 text-sm text-slate-200 hover:bg-white/10">기존 상품 둘러보기</button>
        <a href="/brochure.html" className="mt-4 text-xs text-slate-400 underline underline-offset-4 transition-colors hover:text-cyan-300">
          판매자 입점 안내
        </a>

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
      </section>
    </div>
  );
}
