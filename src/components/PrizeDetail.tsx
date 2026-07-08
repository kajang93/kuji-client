import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from './motion';
import { ChevronLeft, X, Plus, Minus, ChevronRight } from './icons';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { AnimeCollection, Prize } from '@/shared-types';

type PrizeDetailProps = {
  anime: AnimeCollection;
  onBack: () => void;
  onPurchase: (count: number, pointsUsed?: number) => void;
  user?: { name: string; email: string; points: number; type: 'social' | 'customer' | 'business' | 'admin' } | null;
};

const normalizeRank = (rank: string) => {
  const trimmedRank = rank?.trim().toUpperCase() || '';
  if (trimmedRank.includes('LAST') || trimmedRank.includes('라스트')) return 'LAST';
  return trimmedRank.replace(/상/g, '');
};

export default function PrizeDetail({ anime, onBack, onPurchase, user }: PrizeDetailProps) {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseCount, setPurchaseCount] = useState(1);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{ [key: string]: number }>({});
  const [imagePopup, setImagePopup] = useState<{ images: string[]; currentIndex: number; prizeName: string } | null>(null);
  const pricePerKuji = anime.pricePerDraw || 15000; // 1장당 가격 (백엔드 기본값 매핑)
  const groupedPrizes = anime.prizes.reduce((acc, prize) => {
    const rank = normalizeRank(prize.rank);
    if (!acc[rank]) acc[rank] = [];
    acc[rank].push(prize);
    return acc;
  }, {} as Record<string, Prize[]>);
  const sortedRanks = Object.keys(groupedPrizes).sort((a, b) => {
    if (a === 'LAST') return 1;
    if (b === 'LAST') return -1;
    return a.localeCompare(b);
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showPurchaseModal || imagePopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [showPurchaseModal, imagePopup]);

  const handlePurchaseClick = () => {
    setShowPurchaseModal(true);
  };

  const handleConfirmPurchase = () => {
    setShowPurchaseModal(false);
    onPurchase(purchaseCount, pointsToUse);
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

  const nextImage = (prizeId: string, totalImages: number) => {
    setCurrentImageIndexes(prev => ({
      ...prev,
      [prizeId]: ((prev[prizeId] || 0) + 1) % totalImages
    }));
  };

  const prevImage = (prizeId: string, totalImages: number) => {
    setCurrentImageIndexes(prev => ({
      ...prev,
      [prizeId]: ((prev[prizeId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  const openImagePopup = (images: string[], currentIndex: number, prizeName: string) => {
    setImagePopup({ images, currentIndex, prizeName });
  };

  const nextPopupImage = () => {
    if (imagePopup) {
      setImagePopup({
        ...imagePopup,
        currentIndex: (imagePopup.currentIndex + 1) % imagePopup.images.length
      });
    }
  };

  const prevPopupImage = () => {
    if (imagePopup) {
      setImagePopup({
        ...imagePopup,
        currentIndex: (imagePopup.currentIndex - 1 + imagePopup.images.length) % imagePopup.images.length
      });
    }
  };

  return (
    <div className="min-h-full pb-44 pt-[140px]">
      {/* Header - Fixed Position */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-r from-purple-900 to-blue-900 border-b-2 border-cyan-400/50 shadow-lg pt-safe-top pb-0">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto w-full">
          <button
            onClick={onBack}
            className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-xl text-center">{anime.name}</h1>
          <div className="w-10" />
        </div>
        {/* Kuji Count - Moved below header */}
        <div className="px-4 pb-3 text-center">
          <div className="inline-block bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
            <div className="text-white/70 text-xs mb-1">잔여 / 총수량</div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-xl">{anime.remainingKuji}</span>
              <span className="text-white/50">/</span>
              <span className="text-white text-xl">{anime.totalKuji}</span>
            </div>
          </div>
        </div>
        

      </div>

      {/* Status Board (현황판) */}
      <div className="px-4 mt-4">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <span className="text-yellow-400">📊</span> 현황판
            </h3>

          </div>
          
          <div className="space-y-3">
            {sortedRanks.map((rank) => {
              const rankPrizes = groupedPrizes[rank];
              const totalCount = rankPrizes.reduce((sum, prize) => sum + prize.totalCount, 0);
              const remainingCount = rankPrizes.reduce((sum, prize) => sum + prize.remainingCount, 0);

              return (
                <div key={rank} className="py-3 border-b border-white/5 last:border-0">
                  {/* Rank Badge - Smaller & Compact */}
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br shadow-md flex flex-col items-center justify-center flex-shrink-0 border border-white/20 ${
                       rank === 'A' ? 'from-yellow-400 to-orange-600' :
                       rank === 'B' ? 'from-blue-400 to-indigo-600' :
                       rank === 'C' ? 'from-orange-400 to-red-600' :
                       rank === 'D' ? 'from-purple-400 to-purple-700' :
                       rank === 'E' ? 'from-green-400 to-emerald-700' :
                       rank === 'F' ? 'from-pink-400 to-rose-700' :
                       rank === 'LAST' ? 'from-yellow-300 to-amber-600' :
                       'from-gray-400 to-slate-700'
                    }`}>
                      <span className={`${rank === 'LAST' ? 'text-black' : 'text-white'} font-black text-lg leading-none drop-shadow-sm`}>{rank}</span>
                      <span className={`${rank === 'LAST' ? 'text-black/70' : 'text-white/90'} text-[8px] font-bold -mt-0.5`}>상</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <div className="text-white font-bold truncate">
                            {rank === 'LAST' ? '라스트상' : `${rank}상`} {rankPrizes.length}종
                          </div>
                          <div className="text-white/50 text-xs truncate">
                            {rankPrizes.map((prize) => prize.name).join(', ')}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-cyan-200 text-sm font-bold">{remainingCount}/{totalCount}</div>
                          <div className="text-white/40 text-[10px]">남은 수량</div>
                        </div>
                      </div>

                      {/* Cells */}
                      <div className="grid grid-cols-4 gap-2">
                        {rankPrizes.map((prize) => {
                          const isRemaining = prize.remainingCount > 0;

                          return (
                          <motion.button
                            whileHover={isRemaining ? { scale: 1.1, zIndex: 10 } : {}}
                            whileTap={isRemaining ? { scale: 0.95 } : {}}
                            key={prize.id}
                            onClick={() => openImagePopup([prize.image], 0, `${rank}상 - ${prize.name}`)}
                            className={`
                              aspect-square rounded-lg border flex items-center justify-center relative overflow-hidden transition-all
                              ${isRemaining
                                ? 'border-white/20 shadow-sm cursor-pointer hover:shadow-md hover:border-white/50'
                                : 'bg-slate-900/80 border-white/5 opacity-20 cursor-default'}
                            `}
                          >
                            {/* Product Image Only - No Badge Inside */}
                            <div className={`w-full h-full ${!isRemaining ? 'grayscale opacity-20' : ''}`}>
                               <ImageWithFallback
                                 src={prize.image}
                                 alt={prize.name}
                                 className="w-full h-full object-cover"
                               />
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 bg-black/65 px-1 py-0.5 text-[10px] text-white font-semibold leading-none">
                              {prize.remainingCount}/{prize.totalCount}
                            </div>

                            {/* Sold Out Overlay */}
                            {!isRemaining && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <div className="w-full h-px bg-white/30 rotate-45 absolute" />
                                <div className="w-full h-px bg-white/30 -rotate-45 absolute" />
                              </div>
                            )}
                          </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="px-6 py-3">
        <div className="bg-gradient-to-r from-purple-800 to-blue-800 rounded-xl p-4 text-center border border-cyan-400/30">
          <p className="text-cyan-200 text-sm">
            구매 전 남은 경품 수량을 꼭 확인해 주세요.
          </p>
        </div>
      </div>

      {/* Fixed Purchase Section */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-purple-900 via-purple-900/98 to-purple-900/90 border-t border-white/10 shadow-2xl">
        <div className="p-4 space-y-3">
          {/* Quantity Selector */}
          <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
            <span className="text-white/70">구매 수량</span>
            <div className="flex items-center gap-3">
              <button
                onClick={decrementCount}
                disabled={purchaseCount <= 1}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center border border-white/20"
              >
                <Minus className="w-4 h-4 text-white" />
              </button>
              
              <div className="w-16 text-center">
                <div className="text-white text-2xl font-semibold">{purchaseCount}</div>
                <div className="text-white/50 text-xs">장</div>
              </div>

              <button
                onClick={incrementCount}
                disabled={purchaseCount >= anime.remainingKuji}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center border border-white/20"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Price & Purchase Button */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/20">
              <div className="text-white/60 text-xs mb-0.5">총 금액</div>
              <div className="text-yellow-400 text-xl font-semibold">
                ₩{(pricePerKuji * purchaseCount).toLocaleString()}
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePurchaseClick}
              className="flex-1 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-yellow-400/50 transition-shadow"
            >
              구매하기
            </motion.button>
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Modal */}
      <AnimatePresence>
        {showPurchaseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            onClick={() => setShowPurchaseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-purple-800 to-blue-900 rounded-3xl max-w-md w-full border-2 border-cyan-400/50 shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Close Button - Fixed Position */}
              <div className="absolute top-4 right-4 z-20">
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="p-2 bg-black/20 hover:bg-white/10 backdrop-blur-md rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Scrollable Content Area */}
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">

              {/* Cute Character - Smaller */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 10,
                  delay: 0.2 
                }}
                className="flex justify-center mb-3"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-yellow-400 shadow-lg bg-white">
                  <ImageWithFallback
                    src={anime.image}
                    alt={anime.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>

              <h2 className="text-white text-xl mb-1 text-center font-semibold">구매 확인</h2>
              <p className="text-white/60 text-center mb-4 text-xs">선택하신 수량을 확인해주세요</p>

              {/* Important Notice - Compact */}
              <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-3 mb-4">
                <div className="flex items-start gap-2">
                  <div className="text-red-300 text-lg flex-shrink-0">⚠️</div>
                  <div>
                    <div className="text-red-300 text-xs mb-0.5">유의사항</div>
                    <p className="text-red-200/90 text-xs leading-snug">
                      추첨 후 <strong>환불 및 취소 불가</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Purchase Summary - Compact */}
              <div className="bg-white/10 rounded-2xl p-4 mb-4 border border-white/20 space-y-3">
                <div className="text-center pb-3 border-b border-white/20">
                  <div className="text-white/60 text-xs mb-1">구매 시리즈</div>
                  <div className="text-white font-medium">{anime.name}</div>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/70">단가</span>
                  <span className="text-white">₩{pricePerKuji.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/70">수량</span>
                  <span className="text-white font-semibold">{purchaseCount}장</span>
                </div>
                
                <div className="h-px bg-white/20" />
                
                {/* Points Section - Compact */}
                {user && (user.type === 'customer' || user.type === 'social') && (
                  <>
                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-3 border border-green-400/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">💰</span>
                          <div>
                            <div className="text-green-200 text-xs">보유</div>
                            <div className="text-white text-sm" style={{ fontWeight: 700 }}>
                              {user.points.toLocaleString()}P
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-1.5">
                        <input
                          type="number"
                          value={pointsToUse || ''}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            const maxPoints = Math.min(user.points, pricePerKuji * purchaseCount);
                            setPointsToUse(Math.max(0, Math.min(value, maxPoints)));
                          }}
                          placeholder="0"
                          className="flex-1 min-w-0 px-2 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-center text-sm placeholder-white/40 focus:outline-none focus:border-green-400"
                        />
                        <button
                          onClick={() => {
                            const maxPoints = Math.min(user.points, pricePerKuji * purchaseCount);
                            setPointsToUse(maxPoints);
                          }}
                          className="flex-shrink-0 whitespace-nowrap px-3 py-1.5 bg-green-500/30 hover:bg-green-500/40 text-green-200 rounded-lg text-xs transition-colors border border-green-400/30"
                        >
                          전액
                        </button>
                      </div>
                      
                      <div className="text-green-200 text-xs">
                        💡 최대 {Math.min(user.points, pricePerKuji * purchaseCount).toLocaleString()}P
                      </div>
                    </div>
                    
                    <div className="h-px bg-white/20" />
                  </>
                )}
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white font-medium">소계</span>
                  <span className="text-white font-bold">
                    ₩{(pricePerKuji * purchaseCount).toLocaleString()}
                  </span>
                </div>
                
                {pointsToUse > 0 && (
                  <div className="flex justify-between items-center text-green-400 text-sm">
                    <span className="font-medium">포인트</span>
                    <span className="font-bold">-₩{pointsToUse.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="h-px bg-yellow-400/30" />
                
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">최종</span>
                  <span className="text-yellow-400 text-xl font-bold">
                    ₩{Math.max(0, pricePerKuji * purchaseCount - pointsToUse).toLocaleString()}
                  </span>
                </div>
                
                {/* Points to earn - Compact */}
                <div className="bg-amber-500/20 rounded-lg p-2 border border-amber-400/30">
                  <div className="text-amber-200 text-xs text-center">
                    ⭐ <span className="font-bold">{purchaseCount * (anime.rewardRate || 0)}P</span> 적립 예정
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 py-2.5 bg-white/10 border border-white/30 text-white rounded-2xl hover:bg-white/20 transition-colors text-sm"
                >
                  취소
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirmPurchase}
                  className="flex-1 py-2.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 rounded-2xl font-semibold shadow-xl text-sm"
                >
                  구매하기
                </motion.button>
              </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Popup */}
      <AnimatePresence>
        {imagePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4"
            onClick={() => setImagePopup(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button - Fixed to top right of screen */}
              <button
                onClick={() => setImagePopup(null)}
                className="fixed top-4 right-4 z-[70] p-3 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full border border-white/20 transition-colors shadow-lg"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Image */}
              <div className="relative bg-white/5 rounded-2xl overflow-hidden border border-white/20">
                <ImageWithFallback
                  src={imagePopup.images[imagePopup.currentIndex]}
                  alt={imagePopup.prizeName}
                  className="w-full h-auto max-h-[70vh] object-contain"
                />

                {/* Navigation Arrows */}
                {imagePopup.images.length > 1 && (
                  <>
                    <button
                      onClick={prevPopupImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 hover:bg-black/80 rounded-full transition-colors flex items-center justify-center"
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <button
                      onClick={nextPopupImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 hover:bg-black/80 rounded-full transition-colors flex items-center justify-center"
                    >
                      <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                  </>
                )}

                {/* Image Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <div className="text-white text-lg font-medium mb-1">{imagePopup.prizeName}</div>
                  {imagePopup.images.length > 1 && (
                    <div className="text-white/60 text-sm">
                      {imagePopup.currentIndex + 1} / {imagePopup.images.length}
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {imagePopup.images.length > 1 && (
                <div className="flex gap-2 mt-4 justify-center overflow-x-auto pb-2">
                  {imagePopup.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setImagePopup({ ...imagePopup, currentIndex: idx })}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === imagePopup.currentIndex
                          ? 'border-yellow-400 scale-110'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      <ImageWithFallback
                        src={img}
                        alt={`${imagePopup.prizeName} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
