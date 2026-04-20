import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from './motion';
import { ChevronLeft, Package, Calendar, CreditCard, X, Clock, Menu } from './icons';
import { useSwipeNavigation } from './useSwipeNavigation';

type PurchaseHistoryProps = {
  onBack: () => void;
};

type PurchaseItem = {
  id: string;
  date: string;
  animeName: string;
  quantity: number;
  totalPrice: number;
  status: 'completed' | 'pending' | 'cancelled';
};

export default function PurchaseHistory({ onBack }: PurchaseHistoryProps) {
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseItem | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Scroll detection - use scrollTop for the specific container
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      setIsScrolled(scrollTop > 50);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Swipe navigation - Right swipe goes back
  useSwipeNavigation({
    onSwipeRight: onBack,
    threshold: 100,
  });

  // Mock purchase history data
  const purchases: PurchaseItem[] = [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 border-green-500/50 text-green-300';
      case 'pending':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      case 'cancelled':
        return 'bg-red-500/20 border-red-500/50 text-red-300';
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '구매완료';
      case 'pending':
        return '처리중';
      case 'cancelled':
        return '취소됨';
      default:
        return '알 수 없음';
    }
  };

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-purple-900 to-blue-900 border-b-2 border-cyan-400/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-xl text-center">구매내역</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Floating Hamburger Menu - appears when scrolled */}
      <AnimatePresence>
        {isScrolled && (
          <motion.button
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={() => setShowMenu(!showMenu)}
            className="fixed top-20 right-4 z-30 p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full shadow-lg hover:shadow-2xl transition-shadow"
          >
            <Menu className="w-6 h-6 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        {purchases.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/50">구매 내역이 없습니다</p>
          </div>
        ) : (
          purchases.map((purchase, index) => (
            <motion.div
              key={purchase.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/20 shadow-lg"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-white/60 text-sm mb-1">주문번호: {purchase.id}</div>
                  <div className="text-white text-lg">{purchase.animeName}</div>
                </div>
                <div className={`px-3 py-1 rounded-full border text-sm ${getStatusColor(purchase.status)}`}>
                  {getStatusText(purchase.status)}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-white/70">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{purchase.date}</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Package className="w-4 h-4" />
                  <span className="text-sm">수량: {purchase.quantity}장</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-sm">총 금액: ₩{purchase.totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setSelectedPurchase(purchase)}
                className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
              >
                <div className="text-center">상세보기</div>
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedPurchase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPurchase(null)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-purple-800 to-blue-900 rounded-2xl p-5 w-full max-w-md border border-white/20 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-xl">구매 상세</h2>
                <button
                  onClick={() => setSelectedPurchase(null)}
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Order Number & Anime Name - Combined */}
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="text-white/60 text-xs mb-1">주문번호</div>
                  <div className="text-white text-sm mb-2">{selectedPurchase.id}</div>
                  <div className="text-white/60 text-xs mb-1">상품명</div>
                  <div className="text-white">{selectedPurchase.animeName}</div>
                </div>

                {/* Date & Quantity & Price - Combined */}
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-white/60 text-xs mb-1">구매 일시</div>
                      <div className="flex items-center gap-1 text-white text-sm">
                        <Clock className="w-4 h-4 text-cyan-400" />
                        <span>{selectedPurchase.date}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-white/60 text-xs mb-1">구매 수량</div>
                      <div className="flex items-center gap-1 text-white text-sm">
                        <Package className="w-4 h-4 text-green-400" />
                        <span>{selectedPurchase.quantity}장</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="text-white/60 text-xs mb-1">총 결제 금액</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4 text-yellow-400" />
                        <span className="text-white text-lg">₩{selectedPurchase.totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="text-white/50 text-xs">
                        (장당 ₩{(selectedPurchase.totalPrice / selectedPurchase.quantity).toLocaleString()})
                      </div>
                    </div>
                  </div>
                </div>

                {/* Points Earned - Compact */}
                <div className="bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-xl p-3 border-2 border-green-400/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">💰</span>
                      <div className="text-green-200 text-sm">포인트 적립</div>
                    </div>
                    <div className="text-white text-lg" style={{ fontWeight: 700 }}>
                      +{(selectedPurchase.quantity * 100).toLocaleString()}P
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between bg-white/10 rounded-xl p-3">
                  <div className="text-white/60 text-sm">상태</div>
                  <div className={`inline-flex px-3 py-1 rounded-full border text-sm ${getStatusColor(selectedPurchase.status)}`}>
                    {getStatusText(selectedPurchase.status)}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedPurchase(null)}
                className="w-full mt-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <div className="text-center">닫기</div>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}