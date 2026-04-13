import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from './motion';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowRight, Package, RefreshCw, Home, Sparkles, Trophy } from './icons';
import type { Prize } from '@/shared-types';

type KujiRevealProps = {
  prizes: Prize[];
  onComplete: (destination?: "winning" | "detail") => void;
};

type Particle = {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  size: number;
};

export default function KujiReveal({ prizes, onComplete }: KujiRevealProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stage, setStage] = useState<'ready' | 'tearing' | 'revealed'>('ready');
  const [showInstruction, setShowInstruction] = useState(true);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const startX = useRef(0);
  const particleIdRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastTearSoundTime = useRef(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      audioContextRef.current = new AudioContext();
    }
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const currentPrize = prizes[currentIndex];
  const dragThreshold = 150;

  // Massive fireworks logic restored
  const createFirework = (x: number, y: number, isBig: boolean = false) => {
    const colors = ['#fbbf24', '#f59e0b', '#ec4899', '#a855f7', '#06b6d4', '#10b981', '#f97316', '#8b5cf6'];
    const newParticles: Particle[] = [];
    const count = isBig ? 20 : 10;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      newParticles.push({
        id: particleIdRef.current++,
        x,
        y,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle,
        size: isBig ? Math.random() * 10 + 8 : Math.random() * 6 + 4,
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
    
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1500);
  };

  // Fireworks during tearing and revealed
  useEffect(() => {
    if (stage === 'tearing') {
      // Initial burst
      const positions = [
        { x: -50, y: 50 }, { x: 400, y: 50 }, 
        { x: -50, y: 200 }, { x: 400, y: 200 },
        { x: 192, y: -50 }, { x: 192, y: 300 }
      ];
      
      positions.forEach((pos, idx) => {
        setTimeout(() => createFirework(pos.x, pos.y, true), idx * 100);
      });

      // Continuous sparks
      const interval = setInterval(() => {
        createFirework(Math.random() * 384, Math.random() * 224);
      }, 100);

      return () => clearInterval(interval);
    }
    
    if (stage === 'revealed') {
      // Massive celebration loop
      const interval = setInterval(() => {
         createFirework(Math.random() * window.innerWidth, Math.random() * window.innerHeight, true);
      }, 300);
      return () => clearInterval(interval);
    }
  }, [stage]);

  const playTearSound = () => {
    const now = Date.now();
    if (now - lastTearSoundTime.current < 15) return;
    lastTearSoundTime.current = now;

    if (!audioContextRef.current) return;
    
    const audioContext = audioContextRef.current;
    const bufferSize = audioContext.sampleRate * 0.03;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.03);
    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2500 + Math.random() * 1500, audioContext.currentTime);
    filter.Q.value = 2;
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    source.start();
    source.stop(audioContext.currentTime + 0.03);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstruction(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (stage !== 'ready') return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startX.current = clientX - dragX;
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || stage !== 'ready') return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const newDragX = clientX - startX.current;
    if (newDragX >= 0 && newDragX <= 300) {
      setDragX(newDragX);
      if (navigator.vibrate && newDragX > 10) {
        const vibrationProgress = Math.min(newDragX / dragThreshold, 1);
        const vibrationIntensity = Math.floor(10 + vibrationProgress * 20);
        navigator.vibrate(vibrationIntensity);
      }
      playTearSound();
      
      if (Math.random() > 0.7) {
         createFirework(Math.random() * 300, Math.random() * 200);
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDragging || stage !== 'ready') return;
    setIsDragging(false);
    
    if (dragX > dragThreshold) {
      setStage('tearing');
      setTimeout(() => {
        setStage('revealed');
      }, 1000);
    } else {
      setDragX(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < prizes.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setStage('ready');
      setShowInstruction(true);
      setDragX(0);
    } else {
      onComplete('detail');
    }
  };
  
  const handleManualOpen = () => {
    setStage('tearing');
    setTimeout(() => {
      setStage('revealed');
    }, 1000);
  };

  const handleAutoOpen = async () => {
    setIsAutoMode(true);
    
    for (let i = currentIndex; i < prizes.length; i++) {
      if (i > currentIndex) {
        setCurrentIndex(i);
        setStage('ready');
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      setStage('tearing');
      await new Promise(resolve => setTimeout(resolve, 800));
      setStage('revealed');
      await new Promise(resolve => setTimeout(resolve, 1200));
    }
    
    setIsAutoMode(false);
    onComplete('winning');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-900"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
    >
      <style>{`
         @keyframes slideRight {
           0%, 100% { transform: translateX(0px); }
           50% { transform: translateX(60px); }
         }
         .arrow-slide {
           animation: slideRight 1.2s ease-in-out infinite;
         }
         @keyframes particleBurst {
           0% { transform: translate(0, 0) scale(1); opacity: 1; }
           100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
         }
         .particle {
           animation: particleBurst 1.5s ease-out forwards;
         }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
         {/* Particles Overlay */}
         {particles.map(p => {
             const distance = 100 + Math.random() * 100;
             const tx = Math.cos(p.angle) * distance;
             const ty = Math.sin(p.angle) * distance;
             return (
               <div
                 key={p.id}
                 className="particle absolute rounded-full"
                 style={{
                   left: p.x,
                   top: p.y,
                   width: p.size,
                   height: p.size,
                   backgroundColor: p.color,
                   '--tx': `${tx}px`,
                   '--ty': `${ty}px`,
                   zIndex: 100
                 } as any}
               />
             );
         })}
      </div>

      {/* Full Screen Reveal Overlay */}
      <AnimatePresence>
        {stage === 'revealed' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-black/80 backdrop-blur-sm p-4"
          >
            {/* Full Background Image */}
            <div className="absolute inset-0 opacity-40">
              <ImageWithFallback 
                src={currentPrize.image} 
                alt=""
                className="w-full h-full object-cover blur-md scale-110"
              />
            </div>

             {/* Particles in revealed stage */}
            {particles.map(p => {
                 const distance = 200 + Math.random() * 300;
                 const tx = Math.cos(p.angle) * distance;
                 const ty = Math.sin(p.angle) * distance;
                 return (
                   <div
                     key={`rev-${p.id}`}
                     className="particle absolute rounded-full"
                     style={{
                       left: '50%',
                       top: '50%',
                       width: p.size * 1.5,
                       height: p.size * 1.5,
                       backgroundColor: p.color,
                       '--tx': `${tx}px`,
                       '--ty': `${ty}px`,
                       zIndex: 10
                     } as any}
                   />
                 );
             })}

            {/* Certificate Card (Traditional Design) */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="relative z-20 w-full max-w-xs bg-[#fffcf5] rounded-sm shadow-2xl overflow-hidden"
            >
               {/* Gold Frame Border */}
               <div className="absolute inset-2 border-4 border-double border-yellow-600 pointer-events-none z-10" />
               
               {/* Corner Decorations */}
               <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-yellow-600 z-10" />
               <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-yellow-600 z-10" />
               <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-yellow-600 z-10" />
               <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-yellow-600 z-10" />

               <div className="p-8 flex flex-col items-center text-center">
                  <div className="mb-4">
                     <Trophy className="w-12 h-12 text-yellow-600 drop-shadow-sm" />
                  </div>
                  
                  <h2 className="text-3xl font-black text-gray-900 font-serif mb-1 tracking-tight">당첨 증서</h2>
                  <div className="text-[10px] text-yellow-700 font-serif tracking-[0.2em] mb-6 uppercase font-bold">Certificate of Winning</div>
                  
                  <div className="relative mb-6 mt-2">
                    <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br shadow-xl flex flex-col items-center justify-center border-2 border-white/30 mx-auto ${
                         currentPrize.rank === 'A' ? 'from-yellow-400 to-orange-600' :
                         currentPrize.rank === 'B' ? 'from-blue-400 to-indigo-600' :
                         currentPrize.rank === 'C' ? 'from-orange-400 to-red-600' :
                         currentPrize.rank === 'D' ? 'from-purple-400 to-purple-700' :
                         currentPrize.rank === 'E' ? 'from-green-400 to-emerald-700' :
                         currentPrize.rank === 'F' ? 'from-pink-400 to-rose-700' :
                         'from-gray-400 to-slate-700'
                      }`}>
                        <span className="text-white font-black text-5xl leading-none drop-shadow-md">{currentPrize.rank}</span>
                        <span className="text-white/90 text-sm font-bold mt-1">상</span>
                    </div>
                  </div>
                  
                  <div className="text-lg font-bold text-gray-800 mb-6 px-2 leading-tight break-keep">
                     {currentPrize.name}
                  </div>
                  
                  <div className="w-28 h-28 rounded border-4 border-gray-200 shadow-inner bg-white mb-6 overflow-hidden">
                     <ImageWithFallback src={currentPrize.image} className="w-full h-full object-contain" />
                  </div>
                  
                  <div className="text-xs text-gray-500 font-serif italic">
                     귀하께서는 위 상품에<br/>당첨되셨음을 증명합니다.
                  </div>
               </div>
            </motion.div>

            {/* Buttons (Below Certificate) */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.5 }}
               className="mt-8 w-full max-w-xs flex flex-col gap-3 relative z-30"
            >
               {!isAutoMode && currentIndex < prizes.length - 1 ? (
                  <button 
                    onClick={handleNext}
                    className="w-full py-3.5 bg-white text-black rounded-full font-bold text-base hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-xl"
                  >
                    <RefreshCw className="w-5 h-5" />
                    다음 쿠지 뜯기
                  </button>
                ) : !isAutoMode && (
                  <div className="space-y-3 w-full">
                    <button 
                      onClick={() => onComplete('winning')}
                      className="w-full py-3.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-bold text-base shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all flex items-center justify-center gap-2"
                    >
                      <Package className="w-5 h-5" />
                      보관함으로 바로 이동
                    </button>
                    <button 
                      onClick={() => onComplete('detail')}
                      className="w-full py-3.5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full font-medium hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                    >
                       <Home className="w-5 h-5" />
                       다시 뽑기
                    </button>
                  </div>
                )}
                
                {isAutoMode && (
                   <div className="text-white/90 text-sm font-medium bg-black/40 px-4 py-2 rounded-full animate-pulse">
                     자동으로 다음 쿠지를 개봉합니다...
                   </div>
                )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kuji Card (Ready/Tearing Stage) */}
      <AnimatePresence>
        {stage !== 'revealed' && (
          <motion.div
            key="kuji-card"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative"
          >
            {/* Instruction */}
            <AnimatePresence>
              {showInstruction && stage === 'ready' && !isAutoMode && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute -top-24 left-1/2 -translate-x-1/2 whitespace-nowrap z-50"
                >
                  <div className="px-6 py-3 rounded-full shadow-lg bg-white/90 text-purple-900 flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 arrow-slide" />
                    <span className="font-bold">오른쪽으로 밀어서 뜯기</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="w-80 h-48 sm:w-96 sm:h-56 relative shadow-2xl">
              {/* Bottom Layer (Inside Paper Texture + Image) */}
              <div className="absolute inset-0 overflow-hidden bg-white rounded-xl" style={{ zIndex: 1 }}>
                <svg width="100%" height="100%" viewBox="0 0 384 224" className="absolute inset-0" preserveAspectRatio="none">
                   <defs>
                    <filter id="paper-noise">
                      <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
                      <feColorMatrix type="saturate" values="0" />
                      <feComponentTransfer>
                         <feFuncA type="linear" slope="0.2" />
                      </feComponentTransfer>
                    </filter>
                    <linearGradient id="bottom-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                       <stop offset="0%" stopColor="#f8fafc" />
                       <stop offset="100%" stopColor="#e2e8f0" />
                    </linearGradient>
                  </defs>
                  
                  <rect width="384" height="224" fill="url(#bottom-gradient)" />
                  
                  {/* Restored Image inside - with opacity and grayscale for "paper print" look */}
                  <image 
                    href={currentPrize.image} 
                    x="0" y="0" width="384" height="224" 
                    preserveAspectRatio="xMidYMid slice" 
                    opacity="0.25" 
                    style={{ filter: 'grayscale(100%) contrast(1.2)' }}
                  />

                  <rect width="384" height="224" filter="url(#paper-noise)" opacity="0.4" />
                  
                  {/* Rank Text inside paper */}
                  <text 
                    x="192" 
                    y="130" 
                    textAnchor="middle" 
                    fill="#0f172a" 
                    fontSize="60" 
                    fontWeight="900"
                    opacity="0.8"
                    style={{ letterSpacing: '-0.05em' }}
                  >
                    {currentPrize.rank}상
                  </text>
                </svg>
              </div>

              {/* Top Layer (Cover) */}
              <div
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
                style={{ 
                  transform: `translateX(${stage === 'tearing' ? '110%' : dragX}px)`,
                  transition: stage === 'tearing' ? 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
                  zIndex: 5,
                }}
                className={`absolute inset-0 ${stage === 'ready' && !isAutoMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
              >
                <svg width="100%" height="100%" viewBox="0 0 384 224" className="drop-shadow-xl" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="kuji-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                    <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="10" cy="10" r="1.5" fill="white" opacity="0.15" />
                    </pattern>
                  </defs>
                  
                  {/* Card Body */}
                  <rect x="0" y="0" width="384" height="224" rx="12" ry="12" fill="url(#kuji-gradient)" />
                  <rect x="0" y="0" width="384" height="224" rx="12" ry="12" fill="url(#dots)" />
                  
                  {/* Decorative elements */}
                  <rect x="20" y="20" width="344" height="184" rx="8" ry="8" fill="none" stroke="white" strokeWidth="2" strokeDasharray="6,6" opacity="0.6" />
                  
                  <text x="192" y="100" textAnchor="middle" fill="white" fontSize="36" fontWeight="bold">KUJI</text>
                  <text x="192" y="140" textAnchor="middle" fill="white" fontSize="16" opacity="0.8">一番くじ</text>
                </svg>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Bottom Controls (Restored Buttons) */}
      {stage === 'ready' && !isAutoMode && (
         <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-4 px-6 z-40">
            <button 
              className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-medium hover:bg-white/20 transition-colors shadow-lg"
              onClick={handleManualOpen}
            >
              바로 뜯기
            </button>
            {prizes.length > 1 && (
              <button 
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full text-white text-sm font-bold hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/30"
                onClick={handleAutoOpen}
              >
                모두 자동 오픈
              </button>
            )}
         </div>
      )}
    </div>
  );
}