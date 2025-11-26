import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Prize } from '../App';

type KujiRevealProps = {
  prizes: Prize[];
  onComplete: () => void;
};

export default function KujiReveal({ prizes, onComplete }: KujiRevealProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stage, setStage] = useState<'ready' | 'tearing' | 'revealed'>('ready');
  const [showInstruction, setShowInstruction] = useState(true);

  const currentPrize = prizes[currentIndex];

  // Motion values for drag
  const x = useMotionValue(0);
  const topOpacity = useTransform(x, [0, 150], [1, 0]);
  const topRotation = useTransform(x, [0, 200], [0, 15]);

  useEffect(() => {
    // Hide instruction after 2 seconds
    const timer = setTimeout(() => {
      setShowInstruction(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 120) {
      // Dragged right enough to tear
      setStage('tearing');
      setTimeout(() => {
        setStage('revealed');
      }, 600);
    } else {
      // Reset position
      x.set(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < prizes.length - 1) {
      // Move to next kuji
      setCurrentIndex(currentIndex + 1);
      setStage('ready');
      setShowInstruction(true);
      x.set(0);
    } else {
      // All done
      onComplete();
    }
  };

  const rankColors = {
    'A': { bg: 'from-yellow-500 to-orange-600', text: 'text-yellow-900' },
    'B': { bg: 'from-blue-500 to-blue-700', text: 'text-blue-900' },
    'C': { bg: 'from-orange-500 to-red-600', text: 'text-orange-900' },
    'D': { bg: 'from-purple-500 to-purple-700', text: 'text-purple-900' },
    'E': { bg: 'from-green-500 to-green-700', text: 'text-green-900' },
    'F': { bg: 'from-pink-500 to-pink-700', text: 'text-pink-900' },
    'G': { bg: 'from-cyan-500 to-cyan-700', text: 'text-cyan-900' },
    'H': { bg: 'from-red-500 to-red-700', text: 'text-red-900' },
  };

  const prizeColor = rankColors[currentPrize.rank as keyof typeof rankColors] || rankColors['G'];

  // Serrated edge SVG path for top and bottom
  const createSerratedPath = (width: number, height: number, isTop: boolean) => {
    const toothWidth = 12;
    const toothHeight = 8;
    const numTeeth = Math.floor(width / toothWidth);
    
    let path = isTop ? `M 0,${toothHeight} ` : `M 0,0 `;
    
    for (let i = 0; i < numTeeth; i++) {
      const x = i * toothWidth;
      if (isTop) {
        path += `L ${x + toothWidth / 2},0 L ${x + toothWidth},${toothHeight} `;
      } else {
        path += `L ${x + toothWidth / 2},${height} L ${x + toothWidth},${height - toothHeight} `;
      }
    }
    
    if (isTop) {
      path += `L ${width},${toothHeight} L ${width},${height} L 0,${height} Z`;
    } else {
      path += `L ${width},${height - toothHeight} L ${width},0 L 0,0 Z`;
    }
    
    return path;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0">
        {stage === 'revealed' && (
          <>
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: '50%', 
                  y: '50%', 
                  scale: 0,
                  opacity: 1 
                }}
                animate={{ 
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  scale: Math.random() * 2 + 0.5,
                  opacity: 0
                }}
                transition={{ 
                  duration: Math.random() * 2 + 1,
                  ease: 'easeOut'
                }}
                className="absolute w-3 h-3 bg-yellow-400 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Counter */}
      {prizes.length > 1 && (
        <div className="absolute top-8 right-8 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
          <span className="text-white text-xl">
            {currentIndex + 1} / {prizes.length}
          </span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {(stage === 'ready' || stage === 'tearing') && (
          <motion.div
            key="kuji-card"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative"
          >
            {/* Instruction */}
            <AnimatePresence>
              {showInstruction && stage === 'ready' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="absolute -top-20 left-1/2 -translate-x-1/2 whitespace-nowrap z-50"
                >
                  <div className="bg-white/90 text-purple-900 px-6 py-3 rounded-full shadow-lg">
                    <motion.div
                      animate={{ x: [3, -3, 3] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="flex items-center gap-2"
                    >
                      <span>→</span>
                      <span>오른쪽으로 슬라이드하여 뜯기</span>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Kuji Card - Two Layer Structure */}
            <div className="w-96 h-56 relative">
              {/* Bottom Layer - Prize Result */}
              <div className="absolute inset-0 overflow-hidden">
                <svg width="384" height="224" className="absolute inset-0">
                  <defs>
                    <clipPath id="bottom-clip">
                      <path d={createSerratedPath(384, 224, true)} />
                    </clipPath>
                  </defs>
                  <g clipPath="url(#bottom-clip)">
                    <rect width="384" height="224" className={`fill-current bg-gradient-to-br ${prizeColor.bg}`} fill="url(#gradient-bottom)" />
                    <defs>
                      <linearGradient id="gradient-bottom" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" className="text-current" style={{ stopColor: prizeColor.bg.includes('yellow') ? '#eab308' : prizeColor.bg.includes('blue') ? '#3b82f6' : prizeColor.bg.includes('orange') ? '#f97316' : prizeColor.bg.includes('purple') ? '#a855f7' : prizeColor.bg.includes('green') ? '#22c55e' : prizeColor.bg.includes('pink') ? '#ec4899' : prizeColor.bg.includes('cyan') ? '#06b6d4' : '#ef4444' }} />
                        <stop offset="100%" className="text-current" style={{ stopColor: prizeColor.bg.includes('yellow') ? '#ea580c' : prizeColor.bg.includes('blue') ? '#1d4ed8' : prizeColor.bg.includes('orange') ? '#dc2626' : prizeColor.bg.includes('purple') ? '#7e22ce' : prizeColor.bg.includes('green') ? '#15803d' : prizeColor.bg.includes('pink') ? '#be185d' : prizeColor.bg.includes('cyan') ? '#0e7490' : '#b91c1c' }} />
                      </linearGradient>
                    </defs>
                  </g>
                </svg>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white drop-shadow-2xl">
                    <div className="text-9xl mb-2">{currentPrize.rank}</div>
                    <div className="text-4xl opacity-90">{currentPrize.rank}賞</div>
                  </div>
                </div>
              </div>

              {/* Top Layer - Tearable Cover */}
              <motion.div
                drag={stage === 'ready' ? 'x' : false}
                dragConstraints={{ left: 0, right: 300 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                style={{ 
                  x: stage === 'tearing' ? 350 : x,
                  opacity: stage === 'tearing' ? topOpacity : 1,
                  rotateZ: stage === 'tearing' ? topRotation : 0,
                }}
                className={`absolute inset-0 ${stage === 'ready' ? 'cursor-grab active:cursor-grabbing' : ''}`}
              >
                <svg width="384" height="224" className="absolute inset-0 drop-shadow-2xl">
                  <defs>
                    <clipPath id="top-clip">
                      <path d={createSerratedPath(384, 224, true)} />
                    </clipPath>
                  </defs>
                  <g clipPath="url(#top-clip)">
                    {/* Main background */}
                    <rect width="384" height="224" fill="#1e293b" />
                    
                    {/* Top bar */}
                    <rect width="384" height="32" fill="#0f172a" />
                    <text x="192" y="20" textAnchor="middle" fill="#60a5fa" fontSize="14" fontWeight="bold">
                      店舗ひきとり用
                    </text>
                    
                    {/* Instructions text */}
                    <text x="8" y="48" fill="#3b82f6" fontSize="10">
                      株券の誤領得引き取制限上、商品をお渡しください
                    </text>
                    
                    {/* Main content - Large rank letter */}
                    <text x="80" y="140" fill="#475569" fontSize="96" fontWeight="bold" opacity="0.3">
                      {currentPrize.rank}
                    </text>
                    <text x="160" y="140" fill="#cbd5e1" fontSize="32">
                      賞
                    </text>
                    <text x="210" y="140" fill="#94a3b8" fontSize="24">
                      ラバーストラップ
                    </text>
                    
                    {/* Bottom notice */}
                    <text x="8" y="208" fill="#475569" fontSize="10">
                      ※購入店舗の保有別
                    </text>
                    
                    {/* Perforated line */}
                    <g>
                      {[...Array(28)].map((_, i) => (
                        <circle key={i} cx={64} cy={8 + i * 8} r="1.5" fill="#334155" />
                      ))}
                    </g>
                  </g>
                </svg>

                {/* Tear indicator arrow */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
                  <motion.div
                    animate={{ x: [0, 8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-4xl"
                  >
                    ☞
                  </motion.div>
                </div>
              </motion.div>

              {/* Tearing particles */}
              {stage === 'tearing' && (
                <>
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ 
                        x: 64 + Math.random() * 50,
                        y: Math.random() * 224,
                        opacity: 1,
                        scale: 1,
                        rotate: 0
                      }}
                      animate={{ 
                        x: 250 + Math.random() * 200,
                        y: Math.random() * 224 + (Math.random() - 0.5) * 150,
                        opacity: 0,
                        scale: 0,
                        rotate: Math.random() * 720 - 360
                      }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="absolute w-4 h-4 bg-slate-700 shadow-lg"
                      style={{
                        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
                      }}
                    />
                  ))}
                </>
              )}
            </div>
          </motion.div>
        )}

        {stage === 'revealed' && (
          <motion.div
            key="revealed"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10"
          >
            {/* Prize Card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className={`w-80 bg-gradient-to-br ${prizeColor.bg} rounded-3xl shadow-2xl p-8 border-4 border-white/30`}
            >
              {/* Sparkle effect */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-6 -right-6"
              >
                <Sparkles className="w-12 h-12 text-yellow-300" />
              </motion.div>

              {/* Prize Rank */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="inline-block"
                >
                  <div className="text-white text-8xl drop-shadow-2xl">{currentPrize.rank}</div>
                  <div className="text-white text-2xl mt-2 opacity-90">상 당첨!</div>
                </motion.div>
              </div>

              {/* Prize Image */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 150 }}
                className="w-full h-48 rounded-2xl overflow-hidden mb-4 bg-white/20 border-2 border-white/30"
              >
                <ImageWithFallback
                  src={currentPrize.image}
                  alt={currentPrize.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Prize Name */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <div className="text-white text-xl mb-4">{currentPrize.name}</div>
                <div className="text-white/80 text-sm">축하합니다!</div>
              </motion.div>
            </motion.div>

            {/* Continue Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="mt-8 w-full py-4 bg-white text-purple-900 rounded-full text-xl shadow-2xl"
            >
              {currentIndex < prizes.length - 1 
                ? `다음 쿠지 뜯기 (${prizes.length - currentIndex - 1}개 남음)` 
                : '메인으로 돌아가기'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
