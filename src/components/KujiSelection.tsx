import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Sparkles } from 'lucide-react';

type KujiSelectionProps = {
  totalKuji: number;
  purchaseCount: number;
  kujiStatus: boolean[];
  onConfirm: (selectedIndices: number[]) => void;
  onBack: () => void;
};

export default function KujiSelection({ totalKuji, purchaseCount, kujiStatus, onConfirm, onBack }: KujiSelectionProps) {
  const [selectedKuji, setSelectedKuji] = useState<number[]>([]);

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
      <div className="px-6 pb-6">
        <div className="grid grid-cols-6 gap-3">
          {kujiStatus.map((isOpened, index) => (
            <motion.button
              key={index}
              whileHover={!isOpened ? { scale: 1.05 } : {}}
              whileTap={!isOpened ? { scale: 0.95 } : {}}
              onClick={() => toggleKuji(index)}
              disabled={isOpened}
              className={`relative ${
                isOpened ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              }`}
              style={{ aspectRatio: '3/4' }}
            >
              <svg 
                viewBox="0 0 60 80" 
                className="w-full h-full drop-shadow-lg"
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
                    ) : selectedKuji.includes(index) ? (
                      <>
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </>
                    ) : (
                      <>
                        <stop offset="0%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#0f172a" />
                      </>
                    )}
                  </linearGradient>
                </defs>
                
                <g clipPath={`url(#kuji-clip-${index})`}>
                  {/* Background */}
                  <rect width="60" height="80" fill={`url(#gradient-${index})`} />
                  
                  {!isOpened && (
                    <>
                      {/* Top bar */}
                      <rect width="60" height="8" fill={selectedKuji.includes(index) ? '#f97316' : '#0f172a'} />
                      
                      {/* Center text */}
                      <text 
                        x="30" 
                        y="45" 
                        textAnchor="middle" 
                        fill={selectedKuji.includes(index) ? '#fff' : '#475569'} 
                        fontSize="24"
                        fontWeight="bold"
                      >
                        くじ
                      </text>
                      
                      {/* Perforated line */}
                      {[...Array(10)].map((_, i) => (
                        <circle 
                          key={i} 
                          cx={12} 
                          cy={8 + i * 7} 
                          r="0.8" 
                          fill={selectedKuji.includes(index) ? '#fbbf24' : '#334155'} 
                        />
                      ))}
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
                {selectedKuji.includes(index) && !isOpened && (
                  <g>
                    <circle cx="52" cy="8" r="6" fill="#fbbf24" />
                    <text x="52" y="11" textAnchor="middle" fill="#1e293b" fontSize="10" fontWeight="bold">
                      ✓
                    </text>
                  </g>
                )}
              </svg>
            </motion.button>
          ))}
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
          {selectedKuji.length === purchaseCount
            ? `복권 열기 (${purchaseCount}장)`
            : `${purchaseCount - selectedKuji.length}개 더 선택하세요`}
        </motion.button>
      </div>
    </div>
  );
}
