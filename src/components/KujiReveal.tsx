import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from './motion';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Prize } from '../App';

type KujiRevealProps = {
  prizes: Prize[];
  onComplete: () => void;
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

  // Initialize Audio Context
  useEffect(() => {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      audioContextRef.current = new AudioContext();
    }
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const currentPrize = prizes[currentIndex];
  const dragThreshold = 150;

  // Play tearing sound effect
  const playTearSound = () => {
    const now = Date.now();
    // Play sound every 15ms for faster "드드득" effect
    if (now - lastTearSoundTime.current < 15) return;
    lastTearSoundTime.current = now;

    if (!audioContextRef.current) return;
    
    const audioContext = audioContextRef.current;
    
    // Create noise buffer for ripping sound
    const bufferSize = audioContext.sampleRate * 0.03; // 30ms - shorter burst
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    
    // Add gain for volume control
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.03);
    
    // Add filter for more realistic paper sound
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

  // Create fireworks during dragging
  useEffect(() => {
    if (isDragging && dragX > 20) {
      const interval = setInterval(() => {
        createFirework(Math.random() * 400 - 50, Math.random() * 250 - 50);
      }, 80);
      
      return () => clearInterval(interval);
    }
  }, [isDragging, dragX]);

  // Massive fireworks when tearing - especially when prize shows (tearProgress > 0.6)
  useEffect(() => {
    if (stage === 'tearing') {
      // Initial burst
      const positions = [
        { x: -80, y: -60 }, { x: 460, y: -60 }, { x: -80, y: 280 }, { x: 460, y: 280 },
        { x: 180, y: -80 }, { x: 180, y: 300 }, { x: -100, y: 110 }, { x: 480, y: 110 },
        { x: -60, y: 0 }, { x: 440, y: 0 }, { x: -60, y: 220 }, { x: 440, y: 220 },
        { x: 100, y: -70 }, { x: 280, y: -70 }, { x: 100, y: 290 }, { x: 280, y: 290 },
        { x: -90, y: 50 }, { x: 470, y: 50 }, { x: -90, y: 170 }, { x: 470, y: 170 },
        { x: 50, y: -60 }, { x: 330, y: -60 }, { x: 50, y: 280 }, { x: 330, y: 280 },
        { x: -70, y: 30 }, { x: 450, y: 30 }, { x: -70, y: 190 }, { x: 450, y: 190 },
        { x: 190, y: -50 }, { x: 190, y: 270 }
      ];

      positions.forEach((pos, idx) => {
        setTimeout(() => {
          createFirework(pos.x, pos.y, true);
        }, idx * 50);
      });

      // MASSIVE EXPLOSION when prize is about to be revealed (after 700ms)
      setTimeout(() => {
        // Center mega explosion
        for (let i = 0; i < 50; i++) {
          setTimeout(() => {
            const angle = (i / 50) * Math.PI * 2;
            const distance = 150 + Math.random() * 200;
            const x = 192 + Math.cos(angle) * (distance * 0.3);
            const y = 112 + Math.sin(angle) * (distance * 0.3);
            createFirework(x, y, true);
          }, i * 20);
        }
      }, 700);
    }
  }, [stage]);

  const createFirework = (x: number, y: number, isBig: boolean = false) => {
    const colors = ['#fbbf24', '#f59e0b', '#ec4899', '#a855f7', '#06b6d4', '#10b981', '#f97316', '#8b5cf6'];
    const newParticles: Particle[] = [];
    const count = isBig ? 16 : 8;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      newParticles.push({
        id: particleIdRef.current++,
        x,
        y,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle,
        size: isBig ? Math.random() * 12 + 12 : Math.random() * 8 + 8,
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
    
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 2000);
  };

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
      
      // 진동: 약하게 시작해서 점점 강하게
      if (navigator.vibrate && newDragX > 10) {
        const vibrationProgress = Math.min(newDragX / dragThreshold, 1);
        // 0 ~ 1 범위를 10ms ~ 30ms로 매핑
        const vibrationIntensity = Math.floor(10 + vibrationProgress * 20);
        navigator.vibrate(vibrationIntensity);
      }
      
      // Play tearing sound
      playTearSound();
    }
  };

  const handleMouseUp = () => {
    if (!isDragging || stage !== 'ready') return;
    setIsDragging(false);
    
    if (dragX > dragThreshold) {
      setStage('tearing');
      setTimeout(() => {
        setStage('revealed');
      }, 1500);
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
      setParticles([]);
    } else {
      onComplete();
    }
  };

  const handleManualOpen = () => {
    // Simulate drag to open
    setStage('tearing');
    setTimeout(() => {
      setStage('revealed');
    }, 1500);
  };

  const handleAutoOpen = async () => {
    setIsAutoMode(true);
    
    // Auto-open all remaining prizes
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
    onComplete();
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

  const createSerratedPath = (width: number, height: number, isTop: boolean) => {
    const toothWidth = 12;
    const toothHeight = 8;
    const numTeeth = Math.floor(width / toothWidth);
    
    let path = isTop ? \`M 0,\${toothHeight} \` : \`M 0,0 \`;
    
    for (let i = 0; i < numTeeth; i++) {
      const x = i * toothWidth;
      if (isTop) {
        path += \`L \${x + toothWidth / 2},0 L \${x + toothWidth},\${toothHeight} \`;
      } else {
        path += \`L \${x + toothWidth / 2},\${height} L \${x + toothWidth},\${height - toothHeight} \`;
      }
    }
    
    if (isTop) {
      path += \`L \${width},\${toothHeight} L \${width},\${height} L 0,\${height} Z\`;
    } else {
      path += \`L \${width},\${height - toothHeight} L \${width},0 L 0,0 Z\`;
    }
    
    return path;
  };

  const tearProgress = Math.min(dragX / dragThreshold, 1);
  const easedProgress = tearProgress < 0.7 ? tearProgress : 0.7 + (tearProgress - 0.7) * 0.3;

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
    >
      <style>{\`
        @keyframes slideRight {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(60px); }
        }
        .arrow-slide {
          animation: slideRight 1.2s ease-in-out infinite;
        }
        
        @keyframes particleBurst {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(0);
            opacity: 0;
          }
        }
        
        .particle {
          animation: particleBurst 2s ease-out forwards;
        }
        
        @keyframes paperShred {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) rotate(var(--rot));
            opacity: 0;
          }
        }
        
        .paper-shred {
          animation: paperShred 0.8s ease-out forwards;
        }
        
        @keyframes starBurst {
          0% {
            transform: translate(0, 0) scale(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translate(calc(var(--tx) * 0.5), calc(var(--ty) * 0.5)) scale(3) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(0) rotate(360deg);
            opacity: 0;
          }
        }
        
        .star-burst {
          animation: starBurst 2.5s ease-out forwards;
        }
        
        @keyframes confettiFall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        .confetti {
          animation: confettiFall 3s linear forwards;
        }
      \`}</style>

      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Background sparkles for ready stage */}
        {stage === 'ready' && (
          <>
            {[...Array(30)].map((_, i) => (
              <div
                key={\`bg-sparkle-\${i}\`}
                className="absolute w-2 h-2 bg-white rounded-full"
                style={{
                  left: \`\${20 + Math.random() * 60}%\`,
                  top: \`\${20 + Math.random() * 60}%\`,
                  animation: \`confettiFall \${3 + Math.random() * 2}s ease-in-out \${Math.random() * 3}s infinite alternate\`,
                }}
              />
            ))}
          </>
        )}
        
        {/* Revealed stage - golden rain */}
        {stage === 'revealed' && (
          <>
            {[...Array(100)].map((_, i) => (
              <div
                key={\`gold-confetti-\${i}\`}
                className="absolute rounded"
                style={{
                  left: \`\${Math.random() * 100}%\`,
                  top: '-20px',
                  width: \`\${Math.random() * 8 + 4}px\`,
                  height: \`\${Math.random() * 8 + 4}px\`,
                  backgroundColor: ['#fbbf24', '#f59e0b', '#fde047', '#facc15', '#fb923c'][Math.floor(Math.random() * 5)],
                  animation: \`confettiFall \${2 + Math.random() * 3}s linear \${Math.random() * 2}s infinite\`,
                }}
              />
            ))}
          </>
        )}
      </div>

      {prizes.length > 1 && (
        <div className="absolute top-8 right-8 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30 z-50">
          <span className="text-white text-xl">
            {currentIndex + 1} / {prizes.length}
          </span>
        </div>
      )}

      <AnimatePresence>
        {(stage === 'ready' || stage === 'tearing') && (
          <motion.div
            key="kuji-card"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative"
          >
            <AnimatePresence>
              {showInstruction && stage === 'ready' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="absolute -top-20 left-1/2 -translate-x-1/2 whitespace-nowrap z-50"
                >
                  <div className="px-6 py-3 rounded-full shadow-lg bg-white/90 text-purple-900">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl arrow-slide">→</span>
                      <span>오른쪽으로 슬라이드하여 뜯기</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="w-96 h-56 relative">
              {/* Particle system - BEHIND kuji */}
              <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                {particles.slice(0, Math.floor(particles.length / 2)).map((particle) => {
                  const distance = 250 + Math.random() * 400;
                  const tx = Math.cos(particle.angle) * distance;
                  const ty = Math.sin(particle.angle) * distance;
                  
                  return (
                    <div
                      key={particle.id}
                      className="particle absolute rounded-full"
                      style={{
                        left: particle.x,
                        top: particle.y,
                        width: particle.size,
                        height: particle.size,
                        backgroundColor: particle.color,
                        '--tx': \`\${tx}px\`,
                        '--ty': \`\${ty}px\`,
                      } as any}
                    />
                  );
                })}
              </div>

              {/* Giant star bursts during tearing - BEHIND */}
              {stage === 'tearing' && (
                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                  {[...Array(25)].map((_, i) => {
                    const tx = (Math.random() - 0.5) * 800;
                    const ty = (Math.random() - 0.5) * 600;
                    return (
                      <div
                        key={\`star-back-\${i}\`}
                        className="star-burst absolute text-4xl"
                        style={{
                          left: '192px',
                          top: '112px',
                          '--tx': \`\${tx}px\`,
                          '--ty': \`\${ty}px\`,
                          animationDelay: \`\${Math.random() * 0.5}s\`,
                        } as any}
                      >
                        {['⭐', '✨', '💫', '🌟', '✦', '★'][Math.floor(Math.random() * 6)]}
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Bottom Layer - Prize result (stays in place) */}
              <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 1 }}>
                <svg width="384" height="224" className="absolute inset-0">
                  <defs>
                    <clipPath id="bottom-clip">
                      <path d={createSerratedPath(384, 224, true)} />
                    </clipPath>
                    <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#fde047" />
                      <stop offset="50%" stopColor="#facc15" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                  <g clipPath="url(#bottom-clip)">
                    <rect width="384" height="224" className={\`bg-gradient-to-br \${prizeColor.bg}\`} fill="url(#gradient-bottom)" />
                    <defs>
                      <linearGradient id="gradient-bottom" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: prizeColor.bg.includes('yellow') ? '#eab308' : prizeColor.bg.includes('blue') ? '#3b82f6' : prizeColor.bg.includes('orange') ? '#f97316' : prizeColor.bg.includes('purple') ? '#a855f7' : prizeColor.bg.includes('green') ? '#22c55e' : prizeColor.bg.includes('pink') ? '#ec4899' : prizeColor.bg.includes('cyan') ? '#06b6d4' : '#ef4444' }} />
                        <stop offset="100%" style={{ stopColor: prizeColor.bg.includes('yellow') ? '#ea580c' : prizeColor.bg.includes('blue') ? '#1d4ed8' : prizeColor.bg.includes('orange') ? '#dc2626' : prizeColor.bg.includes('purple') ? '#7e22ce' : prizeColor.bg.includes('green') ? '#15803d' : prizeColor.bg.includes('pink') ? '#be185d' : prizeColor.bg.includes('cyan') ? '#0e7490' : '#b91c1c' }} />
                      </linearGradient>
                    </defs>
                  </g>
                </svg>
                
                <div 
                  className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
                  style={{ opacity: Math.max(0, easedProgress - 0.3) * 2 }}
                >
                  <div className="text-center">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-9xl blur-xl" style={{ color: '#fbbf24' }}>{currentPrize.rank}</div>
                    </div>
                    <svg width="200" height="180" className="relative" style={{ filter: 'drop-shadow(0 4px 20px rgba(251, 191, 36, 0.8))' }}>
                      <defs>
                        <linearGradient id="gold-text-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#fde047" />
                          <stop offset="50%" stopColor="#facc15" />
                          <stop offset="100%" stopColor="#f59e0b" />
                        </linearGradient>
                      </defs>
                      <text x="100" y="90" textAnchor="middle" fontSize="120" fontWeight="900" fill="url(#gold-text-gradient)" stroke="#d97706" strokeWidth="3">
                        {currentPrize.rank}
                      </text>
                      <text x="100" y="140" textAnchor="middle" fontSize="40" fontWeight="bold" fill="url(#gold-text-gradient)" stroke="#d97706" strokeWidth="1.5">
                        {currentPrize.rank}賞
                      </text>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Red Frame Border - STATIC (always visible, doesn't move) */}
              <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
                <svg width="384" height="224" className="absolute inset-0">
                  <defs>
                    <linearGradient id="frame-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="25%" stopColor="#f472b6" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="75%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                    
                    {/* Mask to create frame effect - hollow center */}
                    <mask id="frame-mask">
                      {/* White = visible, Black = transparent */}
                      <rect x="0" y="0" width="384" height="224" fill="white" />
                      {/* Cut out the center */}
                      <rect x="16" y="16" width="352" height="192" rx="8" ry="8" fill="black" />
                    </mask>
                  </defs>
                  
                  {/* Frame with hollow center using mask */}
                  <rect 
                    x="0" y="0" 
                    width="384" height="224" 
                    fill="url(#frame-gradient)" 
                    rx="12" ry="12"
                    mask="url(#frame-mask)"
                  />
                  
                  {/* Inner decorative border */}
                  <rect 
                    x="18" y="18" 
                    width="348" height="188" 
                    fill="none" 
                    stroke="rgba(255,255,255,0.4)" 
                    strokeWidth="1.5" 
                    rx="8" ry="8"
                  />
                </svg>
              </div>

              {/* Top Layer - Center Content (slides to the right) */}
              <div
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
                style={{ 
                  transform: \`translateX(\${stage === 'tearing' ? '400px' : dragX}px)\`,
                  transition: stage === 'tearing' ? 'transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'none',
                  zIndex: 5,
                }}
                className={\`absolute inset-0 \${stage === 'ready' ? 'cursor-grab active:cursor-grabbing' : ''}\`}
              >
                <svg width="384" height="224" className="drop-shadow-2xl">
                  <defs>
                    <linearGradient id="kuji-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="25%" stopColor="#f472b6" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="75%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                    <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="10" cy="10" r="1.5" fill="white" opacity="0.15" />
                    </pattern>
                  </defs>
                  
                  {/* Background for center area */}
                  <rect x="16" y="16" width="352" height="192" rx="8" ry="8" fill="url(#kuji-gradient)" />
                  <rect x="16" y="16" width="352" height="192" rx="8" ry="8" fill="url(#dots)" />
                  
                  {/* Main Card Border with Rounded Corners */}
                  <rect x="32" y="32" width="320" height="160" rx="16" ry="16" fill="none" stroke="white" strokeWidth="3" strokeDasharray="8,6" opacity="0.8" />
                  
                  {/* Top Label */}
                  <rect x="32" y="24" width="320" height="28" rx="8" ry="8" fill="rgba(255, 255, 255, 0.25)" />
                  <text x="192" y="44" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" letterSpacing="1">
                    ★ 一番く지 ★
                  </text>
                  
                  {/* Center Logo/Text Area */}
                  <rect x="80" y="72" width="224" height="108" rx="12" ry="12" fill="rgba(0, 0, 0, 0.3)" />
                  <rect x="84" y="76" width="216" height="100" rx="10" ry="10" fill="none" stroke="white" strokeWidth="2" opacity="0.6" />
                  
                  <text x="192" y="120" textAnchor="middle" fill="white" fontSize="32" fontWeight="bold" opacity="0.95">
                    KUJI
                  </text>
                  <line x1="120" y1="135" x2="264" y2="135" stroke="#a855f7" strokeWidth="4" />
                  <text x="192" y="160" textAnchor="middle" fill="white" fontSize="14" opacity="0.8">
                    www.kuji.com
                  </text>
                  
                  {/* Decorative Stars */}
                  <text x="50" y="120" fill="white" fontSize="24" opacity="0.4">★</text>
                  <text x="334" y="120" fill="white" fontSize="24" opacity="0.4">★</text>
                </svg>

                {/* Drag Instruction Arrow */}
                {stage === 'ready' && (
                  <div className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none arrow-slide">
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full">
                      <span className="text-white text-sm" style={{ fontWeight: 600 }}>오른쪽으로 드래그</span>
                      <span className="text-yellow-300 text-3xl drop-shadow-lg">→</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Paper shreds during tearing */}
              {stage === 'tearing' && (
                <>
                  {[...Array(30)].map((_, i) => {
                    const tx = 200 + Math.random() * 400;
                    const ty = (Math.random() - 0.5) * 500;
                    const rot = Math.random() * 1440 - 720;
                    return (
                      <div
                        key={\`shred-\${i}\`}
                        className="paper-shred absolute"
                        style={{
                          left: \`\${Math.random() * 384}px\`,
                          top: \`\${Math.random() * 224}px\`,
                          width: \`\${Math.random() * 15 + 8}px\`,
                          height: \`\${Math.random() * 25 + 12}px\`,
                          background: 'linear-gradient(135deg, #ec4899, #a855f7)',
                          clipPath: 'polygon(20% 0%, 80% 0%, 100% 40%, 90% 100%, 10% 100%, 0% 40%)',
                          '--tx': \`\${tx}px\`,
                          '--ty': \`\${ty}px\`,
                          '--rot': \`\${rot}deg\`,
                          animationDelay: \`\${i * 0.02}s\`,
                          zIndex: 6,
                        } as any}
                      />
                    );
                  })}
                </>
              )}

              {/* Particle system - IN FRONT of kuji */}
              <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
                {particles.slice(Math.floor(particles.length / 2)).map((particle) => {
                  const distance = 250 + Math.random() * 400;
                  const tx = Math.cos(particle.angle) * distance;
                  const ty = Math.sin(particle.angle) * distance;
                  
                  return (
                    <div
                      key={particle.id}
                      className="particle absolute rounded-full"
                      style={{
                        left: particle.x,
                        top: particle.y,
                        width: particle.size,
                        height: particle.size,
                        backgroundColor: particle.color,
                        '--tx': \`\${tx}px\`,
                        '--ty': \`\${ty}px\`,
                      } as any}
                    />
                  );
                })}
              </div>

              {/* Giant star bursts during tearing - IN FRONT */}
              {stage === 'tearing' && (
                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
                  {[...Array(25)].map((_, i) => {
                    const tx = (Math.random() - 0.5) * 800;
                    const ty = (Math.random() - 0.5) * 600;
                    return (
                      <div
                        key={\`star-front-\${i}\`}
                        className="star-burst absolute text-4xl"
                        style={{
                          left: '192px',
                          top: '112px',
                          '--tx': \`\${tx}px\`,
                          '--ty': \`\${ty}px\`,
                          animationDelay: \`\${Math.random() * 0.5}s\`,
                        } as any}
                      >
                        {['⭐', '✨', '💫', '🌟', '✦', '★'][Math.floor(Math.random() * 6)]}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {stage === 'revealed' && (
          <motion.div
            key="revealed"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="relative z-10"
          >
            <div className="absolute inset-0 -m-32">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 bg-gradient-radial from-yellow-400/50 via-orange-400/30 to-transparent blur-3xl"
              />
            </div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-80 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-600 rounded-3xl shadow-2xl p-8 border-4 border-yellow-300/50"
            >
              <div className="absolute inset-0 rounded-3xl">
                <motion.div
                  animate={{ 
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 rounded-3xl border-4 border-yellow-200 blur-md"
                />
              </div>

              <div className="text-center mb-6 relative">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="text-9xl blur-2xl bg-gradient-to-b from-yellow-200 to-orange-400 bg-clip-text text-transparent">
                    {currentPrize.rank}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: 1,
                    rotate: 0
                  }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 10 }}
                  className="relative inline-block"
                >
                  <motion.div
                    animate={{ 
                      filter: [
                        'drop-shadow(0 0 20px rgba(251, 191, 36, 0.8))',
                        'drop-shadow(0 0 40px rgba(251, 191, 36, 1))',
                        'drop-shadow(0 0 20px rgba(251, 191, 36, 0.8))',
                      ]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-white"
                    style={{ 
                      fontSize: '12rem',
                      lineHeight: 1,
                      fontWeight: 900,
                    }}
                  >
                    {currentPrize.rank}
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-white text-3xl mt-4 drop-shadow-lg"
                    style={{ fontWeight: 700 }}
                  >
                    상 당첨!
                  </motion.div>
                </motion.div>
              </div>

              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 150 }}
                className="relative w-full h-48 rounded-2xl overflow-hidden mb-4 bg-white/20 border-4 border-yellow-300/50 shadow-xl"
              >
                <motion.div
                  animate={{ 
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-t from-yellow-400/50 to-transparent z-10"
                />
                
                <ImageWithFallback
                  src={currentPrize.image}
                  alt={currentPrize.name}
                  className="w-full h-full object-cover relative z-0"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center relative"
              >
                <div className="text-white text-xl mb-4 drop-shadow-lg" style={{ fontWeight: 700 }}>
                  {currentPrize.name}
                </div>
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-yellow-100 text-lg"
                  style={{ fontWeight: 600 }}
                >
                  🎊 축하합니다! 🎊
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="mt-8 w-full py-5 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 text-purple-900 rounded-full text-xl shadow-2xl relative overflow-hidden"
              style={{ fontWeight: 700 }}
            >
              <motion.div
                animate={{ 
                  x: ['-100%', '200%']
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              />
              
              <div className="text-center relative z-10">
                {currentIndex < prizes.length - 1 
                  ? `다음 쿠지 뜯기 (${prizes.length - currentIndex - 1}개 남음)` 
                  : '🏆 당첨내역으로 가기'}
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual/Auto Open Buttons - Fixed at bottom */}
      {stage === 'ready' && prizes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 left-0 right-0 z-50 flex gap-4 justify-center px-6"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleManualOpen}
            className="flex-1 max-w-xs py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-2xl shadow-2xl flex items-center justify-center gap-2"
            style={{ fontWeight: 700 }}
          >
            <span className="text-2xl">👆</span>
            <span>쿠지 오픈</span>
          </motion.button>

          {prizes.length > 1 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAutoOpen}
              disabled={isAutoMode}
              className="flex-1 max-w-xs py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontWeight: 700 }}
            >
              <span className="text-2xl">⚡</span>
              <span>자동 오픈</span>
            </motion.button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
