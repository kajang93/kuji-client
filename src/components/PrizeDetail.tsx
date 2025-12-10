import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, X, Plus, Minus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { AnimeCollection } from '../App';

type PrizeDetailProps = {
  anime: AnimeCollection;
  onBack: () => void;
  onPurchase: (count: number) => void;
};

export default function PrizeDetail({ anime, onBack, onPurchase }: PrizeDetailProps) {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseCount, setPurchaseCount] = useState(1);
  const pricePerKuji = 650; // 1장당 650원

  const handlePurchaseClick = () => {
    setShowPurchaseModal(true);
  };

  const handleConfirmPurchase = () => {
    setShowPurchaseModal(false);
    onPurchase(purchaseCount);
  };

  const incrementCount = () => {
    if (purchaseCount < anime.remainingKuji) {
      setPurchaseCount(prev => prev + 1);
    }
  };

  const decrementCount = () => {
    if (purchaseCount > 1) {
      setPurchaseCount(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-purple-900 to-blue-900 border-b-2 border-cyan-400/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-xl">{anime.name}</h1>
          <div className="text-white text-right">
            <div className="text-sm opacity-80">잔여 / 총수량</div>
            <div className="text-xl">
              <span className="text-yellow-400">{anime.remainingKuji}</span>
              <span className="text-white/50"> / </span>
              <span>{anime.totalKuji}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtitle */}
      <div className="bg-gradient-to-r from-blue-800 to-purple-800 py-3 px-6 text-center">
        <p className="text-white">원 수당 해적단</p>
      </div>

      {/* Prize List */}
      <div className="p-4 space-y-3">
        {anime.prizes.map((prize, index) => {
          const rankColors = {
            'A': 'from-yellow-600 to-yellow-700',
            'B': 'from-blue-600 to-blue-700',
            'C': 'from-orange-600 to-orange-700',
            'D': 'from-purple-600 to-purple-700',
            'E': 'from-green-600 to-green-700',
            'F': 'from-pink-600 to-pink-700',
            'G': 'from-cyan-600 to-cyan-700',
            'H': 'from-red-600 to-red-700',
          };

          const bgGradient = rankColors[prize.rank as keyof typeof rankColors] || 'from-gray-600 to-gray-700';

          return (
            <motion.div
              key={prize.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 shadow-lg"
            >
              <div className="flex items-center gap-3 p-3">
                {/* Rank Badge */}
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${bgGradient} flex items-center justify-center flex-shrink-0 border-2 border-white/30 shadow-lg relative`}>
                  <div className="text-white text-center">
                    <div className="text-2xl">{prize.rank}</div>
                    <div className="text-xs opacity-80">상</div>
                  </div>
                </div>

                {/* Prize Image & Name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
                    <ImageWithFallback
                      src={prize.image}
                      alt={prize.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white/60 text-sm">원피스 원 수당 해적단</div>
                    <div className="text-white">{prize.name}</div>
                    <div className="text-white/50 text-sm">잔여 {prize.remainingCount}개</div>
                  </div>
                </div>

                {/* Kuji Status Dots */}
                <div className="flex flex-wrap gap-1 max-w-20 flex-shrink-0">
                  {prize.opened.slice(0, 12).map((isOpened, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-sm ${
                        isOpened ? 'bg-red-400' : 'bg-orange-400'
                      }`}
                      title={isOpened ? '당첨됨' : '미당첨'}
                    />
                  ))}
                  {prize.opened.length > 12 && (
                    <div className="text-white/50 text-xs w-full text-center">
                      +{prize.opened.length - 12}
                    </div>
                  )}
                </div>

                {/* Count Badge */}
                <div className="text-white/70 text-lg flex-shrink-0 text-right min-w-8">
                  {prize.totalCount}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="px-3 pb-3">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all"
                    style={{ width: `${((prize.totalCount - prize.remainingCount) / prize.totalCount) * 100}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Banner */}
      <div className="px-6 py-3">
        <div className="bg-gradient-to-r from-purple-800 to-blue-800 rounded-xl p-4 text-center border border-cyan-400/30">
          <p className="text-cyan-200 text-sm">
            상품을 대신하여 상품번호를 확인할 수 있습니다.
          </p>
        </div>
      </div>

      {/* Fixed Purchase Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-purple-900 via-purple-900/95 to-transparent">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePurchaseClick}
          className="w-full py-5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 rounded-full text-xl shadow-2xl hover:shadow-yellow-400/50 transition-shadow"
        >
          구매하기
        </motion.button>
      </div>

      {/* Purchase Modal */}
      <AnimatePresence>
        {showPurchaseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowPurchaseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-purple-800 to-blue-900 rounded-3xl p-8 max-w-md w-full border-2 border-cyan-400/50 shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              <h2 className="text-white text-2xl mb-8 text-center">구매 수량 선택</h2>

              {/* Counter */}
              <div className="flex items-center justify-center gap-6 mb-8">
                <button
                  onClick={decrementCount}
                  disabled={purchaseCount <= 1}
                  className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors border border-white/20"
                >
                  <Minus className="w-6 h-6 text-white" />
                </button>
                
                <div className="w-32 text-center">
                  <div className="text-5xl text-white">{purchaseCount}</div>
                  <div className="text-white/50 mt-1">장</div>
                </div>

                <button
                  onClick={incrementCount}
                  disabled={purchaseCount >= anime.remainingKuji}
                  className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors border border-white/20"
                >
                  <Plus className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Price Info */}
              <div className="bg-white/10 rounded-2xl p-6 mb-8 border border-white/20">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white/70">단가</span>
                  <span className="text-white text-xl">₩{pricePerKuji.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white/70">수량</span>
                  <span className="text-white text-xl">{purchaseCount}장</span>
                </div>
                <div className="h-px bg-white/20 my-4" />
                <div className="flex justify-between items-center">
                  <span className="text-white">총 금액</span>
                  <span className="text-yellow-400 text-3xl">
                    ₩{(pricePerKuji * purchaseCount).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Confirm Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirmPurchase}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 rounded-full text-xl shadow-2xl"
              >
                구매하기
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
