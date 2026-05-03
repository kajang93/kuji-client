import { useState, useEffect } from 'react';
import { motion } from './motion';
import { ChevronLeft, Sparkles } from './icons';

type KujiSelectionProps = {
  totalKuji: number;
  purchaseCount: number;
  kujiStatus: boolean[];
  onConfirm: (selectedIndices: number[]) => void;
  onBack: () => void;
};

export default function KujiSelection({ totalKuji, purchaseCount, kujiStatus, onConfirm, onBack }: KujiSelectionProps) {
  const [selectedKuji, setSelectedKuji] = useState<number[]>([]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleKuji = (index: number) => {
    if (kujiStatus[index]) return; // Can't select opened kuji
    
    if (selectedKuji.includes(index)) {
      setSelectedKuji(selectedKuji.filter(i => i !== index));
    } else {
      // Only allow selecting up to purchaseCount
      if (selectedKuji.length < purchaseCount) {
        setSelectedKuji([...selectedKuji, index]);
      }
    }
  };

  const randomSelect = () => {
    const availableKuji = kujiStatus
      .map((isOpened, index) => ({ index, isOpened }))
      .filter(k => !k.isOpened)
      .map(k => k.index);
    
    if (availableKuji.length > 0) {
      // Select random kujis up to purchaseCount
      const shuffled = availableKuji.sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(purchaseCount, availableKuji.length));
      setSelectedKuji(selected);
    }
  };

  const handleConfirm = () => {
    if (selectedKuji.length === purchaseCount) {
      onConfirm(selectedKuji);
    }
  };

  // Auto-select if purchase count is reached
  useEffect(() => {
    if (selectedKuji.length === purchaseCount) {
      // Optional: could auto-proceed after a delay
    }
  }, [selectedKuji.length, purchaseCount]);

  // Create serrated edge path for kuji card
  const createSerratedPath = (width: number, height: number) => {
    const toothWidth = 4;
    const toothHeight = 3;
    const numTeeth = Math.floor(width / toothWidth);
    
    let path = `M 0,${toothHeight} `;
    
    for (let i = 0; i < numTeeth; i++) {
      const x = i * toothWidth;
      path += `L ${x + toothWidth / 2},0 L ${x + toothWidth},${toothHeight} `;
    }
    
    path += `L ${width},${toothHeight} L ${width},${height} L 0,${height} Z`;
    
    return path;
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-purple-900 to-blue-900 border-b-2 border-cyan-400/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-xl">쿠지 선택</h1>
          <div className="text-white text-right">
            <div className="text-sm opacity-80">선택됨</div>
            <div className="text-xl">
              <span className={selectedKuji.length === purchaseCount ? 'text-yellow-400' : 'text-white'}>
                {selectedKuji.length}
              </span>
              <span className="text-white/50"> / </span>
              <span>{purchaseCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Random Select Button */}
      <div className="p-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={randomSelect}
          className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl flex items-center justify-center gap-2 shadow-xl"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-lg">랜덤으로 {purchaseCount}개 선택</span>
        </motion.button>
      </div>

      {/* Info */}
      <div className="px-6 pb-4">
        <div className="bg-yellow-400/20 border border-yellow-400/50 rounded-xl p-3">
          <p className="text-yellow-200 text-center text-sm">
            {purchaseCount}개의 쿠지를 선택하세요 (오픈되지 않은 쿠지만 선택 가능)
          </p>
        </div>
      </div>

      {/* Kuji Grid */}
      <div className="px-6 pb-6 relative z-0">
        <div className="grid grid-cols-6 gap-3">
          {kujiStatus.map((isOpened, index) => {
            const isSelected = selectedKuji.includes(index);
            
            return (
              <motion.button
                key={index}
                whileHover={!isOpened ? { scale: 1.05, zIndex: 20 } : {}}
                whileTap={!isOpened ? { scale: 0.95 } : {}}
                animate={isSelected ? { 
                  scale: 1.15, 
                  y: -5,
                  rotate: [0, -1, 1, 0],
                  zIndex: 10,
                  filter: "drop-shadow(0 0 10px rgba(34, 211, 238, 0.6))" // Cyan glow matching selection
                } : { 
                  scale: 1, 
                  y: 0, 
                  rotate: 0, 
                  zIndex: 0,
                  filter: "none"
                }}
                onClick={() => toggleKuji(index)}
                disabled={isOpened}
                className={`relative transition-colors duration-300 ${
                  isOpened ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                }`}
                style={{ aspectRatio: '3/4' }}
              >
                {/* Selected Glow Background */}
                {isSelected && (
                   <motion.div
                     className="absolute -inset-2 bg-cyan-400/30 rounded-lg blur-md -z-10"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                   />
                )}

                <svg 
                  viewBox="0 0 60 80" 
                  className="w-full h-full drop-shadow-lg relative z-10"
                >
                  <defs>
                    <clipPath id={`kuji-clip-${index}`}>
                      <path d={createSerratedPath(60, 80)} />
                    </clipPath>
                    <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      {isOpened ? (
                        <>
                          <stop offset="0%" stopColor="#475569" />
                          <stop offset="100%" stopColor="#334155" />
                        </>
                      ) : isSelected ? (
                        <>
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="25%" stopColor="#0891b2" />
                          <stop offset="50%" stopColor="#0e7490" />
                          <stop offset="75%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#22d3ee" />
                        </>
                      ) : (
                        <>
                          <stop offset="0%" stopColor="#ec4899" />
                          <stop offset="25%" stopColor="#f472b6" />
                          <stop offset="50%" stopColor="#a855f7" />
                          <stop offset="75%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </>
                      )}
                    </linearGradient>
                    <pattern id={`dots-${index}`} x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="0.5" fill="white" opacity="0.2" />
                    </pattern>
                  </defs>
                  
                  <g clipPath={`url(#kuji-clip-${index})`}>
                    {/* Background */}
                    <rect width="60" height="80" fill={`url(#gradient-${index})`} />
                    <rect width="60" height="80" fill={`url(#dots-${index})`} />
                    
                    {!isOpened && (
                      <>
                        {/* Top bar */}
                        <rect width="60" height="10" fill="rgba(255, 255, 255, 0.15)" />
                        <text 
                          x="30" 
                          y="7" 
                          textAnchor="middle" 
                          fill="white" 
                          fontSize="3.5"
                          fontWeight="bold"
                        >
                          ★ 一番く지 ★
                        </text>
                        
                        {/* Border with dashed style - matching main kuji */}
                        <rect x="5" y="5" width="50" height="70" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="1.5,1" opacity="0.8" rx="2" />
                        
                        {/* Center Logo Area - matching main kuji */}
                        <rect x="12" y="20" width="36" height="38" rx="2" ry="2" fill="rgba(0, 0, 0, 0.3)" />
                        <rect x="13" y="21" width="34" height="36" rx="1.5" ry="1.5" fill="none" stroke="white" strokeWidth="0.3" opacity="0.6" />
                        
                        <text 
                          x="30" 
                          y="40" 
                          textAnchor="middle" 
                          fill="white" 
                          fontSize="7"
                          fontWeight="bold"
                          opacity="0.95"
                        >
                          KUJI
                        </text>
                        <line x1="17" y1="44" x2="43" y2="44" stroke="#a855f7" strokeWidth="0.6" />
                        <text 
                          x="30" 
                          y="52" 
                          textAnchor="middle" 
                          fill="white" 
                          fontSize="2.5"
                          opacity="0.8"
                        >
                          www.kuji.com
                        </text>
                        
                        {/* Bottom text */}
                        <text 
                          x="30" 
                          y="72" 
                          textAnchor="middle" 
                          fill="white" 
                          fontSize="3.5"
                          opacity="0.8"
                        >
                          何가当타る？
                        </text>
                        
                        {/* Star decorations */}
                        <text x="8" y="40" fill="white" fontSize="4" opacity="0.4">★</text>
                        <text x="52" y="40" fill="white" fontSize="4" opacity="0.4">★</text>
                      </>
                    )}
                    
                    {isOpened && (
                      <>
                        {/* Opened indicator */}
                        <text 
                          x="30" 
                          y="45" 
                          textAnchor="middle" 
                          fill="#64748b" 
                          fontSize="12"
                        >
                          오픈됨
                        </text>
                      </>
                    )}
                  </g>
                  
                  {/* Selection indicator */}
                  {isSelected && !isOpened && (
                    <g>
                      <circle cx="52" cy="8" r="6" fill="#fbbf24" />
                      <text x="52" y="11" textAnchor="middle" fill="#1e293b" fontSize="10" fontWeight="bold">
                        ✓
                      </text>
                    </g>
                  )}
                </svg>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Fixed Confirm Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-purple-900 via-purple-900/95 to-transparent">
        <motion.button
          whileHover={{ scale: selectedKuji.length === purchaseCount ? 1.02 : 1 }}
          whileTap={{ scale: selectedKuji.length === purchaseCount ? 0.98 : 1 }}
          onClick={handleConfirm}
          disabled={selectedKuji.length !== purchaseCount}
          className={`w-full py-5 rounded-full text-xl shadow-2xl transition-all ${
            selectedKuji.length === purchaseCount
              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 hover:shadow-yellow-400/50'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
          }`}
        >
          <div className="text-center">
            {selectedKuji.length === purchaseCount
              ? `복권 열기 (${purchaseCount}장)`
              : `${purchaseCount - selectedKuji.length}개 더 선택하세요`}
          </div>
        </motion.button>
      </div>
    </div>
  );
}