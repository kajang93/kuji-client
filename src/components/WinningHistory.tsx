import { motion, AnimatePresence } from './motion';
import { ChevronLeft, Trophy, Calendar, Package, Gift, Sparkles, Truck, X, Check, CheckCircle, ShoppingBag, Info } from './icons';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { WinningItem } from '@/shared-types';
import { useState, useEffect } from 'react';
import DeliveryTracking from './DeliveryTracking';

// Type Migration: WinningHistory updated.

type WinningHistoryProps = {
  onBack: () => void;
  onSelectPrizeOption?: (winningId: string, rank: string) => void;
  winningHistory: WinningItem[];
  onSubmitInquiry?: (sellerId: string, sellerName: string, orderNumber: string, inquiryType: string, subject: string, content: string) => void;
  onRequestShipping?: (winningIds: string[]) => void; // 배송 신청 콜백 추가
};

export default function WinningHistory({ onBack, onSelectPrizeOption, winningHistory, onSubmitInquiry, onRequestShipping }: WinningHistoryProps) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'shipping'>('inventory');
  const [selectedDeliveryItem, setSelectedDeliveryItem] = useState<WinningItem | null>(null);
  const [certificatePopup, setCertificatePopup] = useState<WinningItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showShippingModal, setShowShippingModal] = useState(false);

  // Auto-trigger option selection for new winnings
  useEffect(() => {
    const newItemNeedingOption = winningHistory.find(
      (item) => item.isNew && item.needsOptionSelection
    );

    if (newItemNeedingOption && onSelectPrizeOption) {
      const timer = setTimeout(() => {
        onSelectPrizeOption(newItemNeedingOption.id, newItemNeedingOption.rank);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [winningHistory, onSelectPrizeOption]);

  
  // Mock seller info mapping (since it's not in WinningItem yet)
  const getSellerInfo = (animeName: string) => {
    if (animeName.includes('원피스')) return { id: 'seller1', name: '원피스 전문샵' };
    if (animeName.includes('귀멸')) return { id: 'seller2', name: '애니굿즈샵' };
    return { id: 'seller1', name: '원피스 전문샵' }; // Default
  };

  // Filter items by tab
  const inventoryItems = winningHistory.filter(item => item.deliveryStatus === 'stored' || !item.deliveryStatus);
  const shippingItems = winningHistory.filter(item => ['preparing', 'shipped', 'delivered'].includes(item.deliveryStatus));

  const toggleSelection = (id: string) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) return prev.filter(item => item !== id);
      
      // Same Seller Check logic
      const targetItem = winningHistory.find(w => w.id === id);
      if (!targetItem) return prev;
      
      const targetSeller = getSellerInfo(targetItem.animeName).id;
      
      // Check if any existing selection has different seller
      const hasDifferentSeller = prev.some(existingId => {
        const existingItem = winningHistory.find(w => w.id === existingId);
        if (!existingItem) return false;
        return getSellerInfo(existingItem.animeName).id !== targetSeller;
      });

      if (hasDifferentSeller) {
        // In a real app, show toast here
        alert("같은 판매자의 상품만 묶음 배송이 가능합니다.");
        return prev;
      }

      return [...prev, id];
    });
  };

  const handleRequestShipping = () => {
    if (selectedItems.length === 0) return;
    
    // Check if any item needs option selection
    const needsOption = selectedItems.some(id => {
      const item = winningHistory.find(w => w.id === id);
      return item?.needsOptionSelection;
    });

    if (needsOption) {
      alert("옵션 선택이 필요한 상품이 있습니다.");
      return;
    }

    setShowShippingModal(true);
  };

  const confirmShipping = () => {
    if (onRequestShipping) {
      onRequestShipping(selectedItems);
    }
    setShowShippingModal(false);
    setSelectedItems([]);
    setActiveTab('shipping');
  };

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

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500/20 border-green-500/50 text-green-300';
      case 'shipped': return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
      case 'preparing': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
    }
  };

  const getDeliveryStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return '배송완료';
      case 'shipped': return '배송중';
      case 'preparing': return '배송준비중';
      default: return '알 수 없음';
    }
  };

  return (
    <div className="min-h-full pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-purple-900 to-blue-900 border-b-2 border-cyan-400/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-xl text-center">당첨 내역</h1>
          <div className="w-10" />
        </div>

        {/* Tabs */}
        <div className="flex px-4 pb-0 gap-4 mt-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
              activeTab === 'inventory' ? 'text-yellow-400' : 'text-white/60'
            }`}
          >
            보관함 ({inventoryItems.length})
            {activeTab === 'inventory' && (
              <motion.div layoutId="tabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
              activeTab === 'shipping' ? 'text-yellow-400' : 'text-white/60'
            }`}
          >
            배송 내역 ({shippingItems.length})
            {activeTab === 'shipping' && (
              <motion.div layoutId="tabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        <AnimatePresence mode="wait">
          {activeTab === 'inventory' ? (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
               {/* Bulk Selection Control */}
               {inventoryItems.length > 0 && (
                 <div className="flex justify-end px-1">
                   <button 
                     onClick={() => {
                       const allSameSellerItems = (() => {
                          if (inventoryItems.length === 0) return [];
                          // If selection exists, use that seller. If not, use first item's seller.
                          const targetSellerId = selectedItems.length > 0 
                             ? getSellerInfo(winningHistory.find(w => w.id === selectedItems[0])?.animeName || '').id
                             : getSellerInfo(inventoryItems[0].animeName).id;
                          
                          return inventoryItems
                             .filter(item => getSellerInfo(item.animeName).id === targetSellerId)
                             .map(item => item.id);
                       })();

                       const areAllTargetSelected = allSameSellerItems.every(id => selectedItems.includes(id));

                       if (areAllTargetSelected) {
                         setSelectedItems([]);
                       } else {
                         setSelectedItems(allSameSellerItems);
                       }
                     }}
                     className="text-xs text-white/70 flex items-center gap-1.5 hover:text-white px-3 py-1.5 bg-white/5 rounded-full border border-white/10 transition-colors"
                   >
                     <CheckCircle className="w-3.5 h-3.5" />
                     {selectedItems.length > 0 && inventoryItems.filter(i => getSellerInfo(i.animeName).id === getSellerInfo(winningHistory.find(w => w.id === selectedItems[0])?.animeName || '').id).every(i => selectedItems.includes(i.id)) 
                        ? '선택 해제' 
                        : '전체 선택 (동일 판매자)'}
                   </button>
                 </div>
               )}

               {/* Info Box */}
               <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex gap-3">
                <Info className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-100/80">
                  <p className="mb-1">📦 <strong>묶음 배송 안내</strong></p>
                  <p>같은 판매자의 상품은 한 번에 묶음 배송 신청이 가능합니다. 배송비를 절약해보세요!</p>
                </div>
              </div>

              {inventoryItems.length === 0 ? (
                <div className="text-center py-20">
                  <Package className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/50">보관 중인 상품이 없습니다</p>
                </div>
              ) : (
                inventoryItems.map((winning, index) => {
                  const bgGradient = rankColors[winning.rank as keyof typeof rankColors] || 'from-gray-600 to-gray-700';
                  const isSelected = selectedItems.includes(winning.id);
                  const seller = getSellerInfo(winning.animeName);

                  return (
                    <motion.div
                      key={winning.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl shadow-lg border transition-all ${
                        isSelected ? 'border-yellow-400 ring-1 ring-yellow-400/50' : 'border-white/10'
                      }`}
                      onClick={() => toggleSelection(winning.id)}
                    >
                      {/* Checkbox */}
                      <div className="absolute top-4 right-4 z-10">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-yellow-400 border-yellow-400' : 'border-white/30 bg-black/20'
                        }`}>
                          {isSelected && <Check className="w-4 h-4 text-black" />}
                        </div>
                      </div>

                      <div className="p-4 flex items-center gap-4">
                         {/* Rank Badge - Unified Style */}
                         <div className={`w-12 h-12 rounded-lg bg-gradient-to-br shadow-md flex flex-col items-center justify-center flex-shrink-0 border border-white/20 ${
                            winning.rank === 'A' ? 'from-yellow-400 to-orange-600' :
                            winning.rank === 'B' ? 'from-blue-400 to-indigo-600' :
                            winning.rank === 'C' ? 'from-orange-400 to-red-600' :
                            winning.rank === 'D' ? 'from-purple-400 to-purple-700' :
                            winning.rank === 'E' ? 'from-green-400 to-emerald-700' :
                            winning.rank === 'F' ? 'from-pink-400 to-rose-700' :
                            'from-gray-400 to-slate-700'
                         }`}>
                           <span className="text-white font-black text-xl leading-none drop-shadow-sm">{winning.rank}</span>
                           <span className="text-white/90 text-[9px] font-bold -mt-0.5">상</span>
                         </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-white/60 border border-white/10">
                              {seller.name}
                            </span>
                            {winning.isNew && (
                              <span className="text-yellow-400 text-[10px] font-bold flex items-center gap-0.5">
                                <Sparkles className="w-3 h-3" /> NEW
                              </span>
                            )}
                          </div>
                          <h3 className="text-white font-medium truncate">{winning.prizeName}</h3>
                          <p className="text-white/50 text-xs truncate">{winning.animeName}</p>
                          
                          {winning.needsOptionSelection && (
                             <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               onSelectPrizeOption?.(winning.id, winning.rank);
                             }}
                             className="mt-3 w-full py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-200 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                           >
                             <Gift className="w-3 h-3" /> 옵션 선택 필요
                           </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          ) : (
            <motion.div
              key="shipping"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {shippingItems.length === 0 ? (
                <div className="text-center py-20">
                  <Truck className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/50">배송 내역이 없습니다</p>
                </div>
              ) : (
                shippingItems.map((winning, index) => {
                  const bgGradient = rankColors[winning.rank as keyof typeof rankColors] || 'from-gray-600 to-gray-700';
                  
                  return (
                    <motion.div
                      key={winning.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl shadow-lg border border-white/10 overflow-hidden"
                    >
                      {/* Status Badge (Top Right) */}
                      <div className="absolute top-4 right-4">
                         <div className={`px-2 py-1 rounded-full text-[10px] font-bold border ${getDeliveryStatusColor(winning.deliveryStatus)}`}>
                            {getDeliveryStatusText(winning.deliveryStatus)}
                         </div>
                      </div>

                      <div className="p-4 flex items-center gap-4">
                         {/* Rank Badge - Unified Style */}
                         <div className={`w-12 h-12 rounded-lg bg-gradient-to-br shadow-md flex flex-col items-center justify-center flex-shrink-0 border border-white/20 ${
                            winning.rank === 'A' ? 'from-yellow-400 to-orange-600' :
                            winning.rank === 'B' ? 'from-blue-400 to-indigo-600' :
                            winning.rank === 'C' ? 'from-orange-400 to-red-600' :
                            winning.rank === 'D' ? 'from-purple-400 to-purple-700' :
                            winning.rank === 'E' ? 'from-green-400 to-emerald-700' :
                            winning.rank === 'F' ? 'from-pink-400 to-rose-700' :
                            'from-gray-400 to-slate-700'
                         }`}>
                           <span className="text-white font-black text-xl leading-none drop-shadow-sm">{winning.rank}</span>
                           <span className="text-white/90 text-[9px] font-bold -mt-0.5">상</span>
                         </div>

                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex items-center gap-2 mb-1">
                             {/* Seller Name (Mock) */}
                            <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-white/60 border border-white/10">
                              {getSellerInfo(winning.animeName).name}
                            </span>
                          </div>
                          <h3 className="text-white font-medium truncate">{winning.prizeName}</h3>
                          <p className="text-white/50 text-xs truncate mb-3">{winning.animeName}</p>
                          
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setSelectedDeliveryItem(winning)}
                              className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 text-xs font-medium transition-colors flex items-center justify-center gap-1"
                            >
                              <Truck className="w-3 h-3" /> 배송 조회
                            </button>
                            <button
                              onClick={() => setCertificatePopup(winning)}
                              className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 text-xs font-medium transition-colors flex items-center justify-center gap-1"
                            >
                              <Trophy className="w-3 h-3" /> 당첨증서
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Action Bar (Inventory Only) */}
      <AnimatePresence>
        {activeTab === 'inventory' && selectedItems.length > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/90 backdrop-blur-md border-t border-white/10 z-30"
          >
            <div className="max-w-2xl mx-auto flex items-center gap-4">
              <div className="flex-1">
                <div className="text-white/60 text-xs">선택한 상품</div>
                <div className="text-white font-bold text-lg">{selectedItems.length}개</div>
              </div>
              <button
                onClick={handleRequestShipping}
                className="flex-[2] py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 rounded-xl font-bold shadow-lg hover:shadow-yellow-400/20 transition-all"
              >
                배송 신청하기
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delivery Tracking Modal */}
      {selectedDeliveryItem && (
        <DeliveryTracking
          winning={selectedDeliveryItem}
          sellerName={getSellerInfo(selectedDeliveryItem.animeName).name}
          sellerId={getSellerInfo(selectedDeliveryItem.animeName).id}
          deliveryDriverPhone="010-1234-5678"
          onClose={() => setSelectedDeliveryItem(null)}
          onSubmitInquiry={onSubmitInquiry}
        />
      )}

      {/* Shipping Request Modal */}
      <AnimatePresence>
        {showShippingModal && (
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             onClick={() => setShowShippingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-white/10 shadow-2xl"
            >
              <h3 className="text-xl text-white font-bold mb-4 text-center">배송 신청 확인</h3>
              <div className="space-y-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/60">선택 상품</span>
                    <span className="text-white font-medium">{selectedItems.length}건</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">배송비</span>
                    <span className="text-green-400 font-medium">무료 (묶음배송)</span>
                  </div>
                </div>
                <p className="text-center text-white/50 text-xs">
                  신청 후에는 보관함에서 배송 내역으로 이동됩니다.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowShippingModal(false)}
                  className="flex-1 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors font-medium"
                >
                  취소
                </button>
                <button
                  onClick={confirmShipping}
                  className="flex-1 py-3 bg-yellow-400 text-slate-900 rounded-xl hover:bg-yellow-300 transition-colors font-bold"
                >
                  확정
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Certificate Popup (Same as before) */}
      <AnimatePresence>
        {certificatePopup && (() => {
           const bgGradient = rankColors[certificatePopup.rank as keyof typeof rankColors] || 'from-gray-600 to-gray-700';
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6"
              onClick={() => setCertificatePopup(null)}
            >
               <motion.div
                initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                exit={{ scale: 0.8, opacity: 0, rotateY: 90 }}
                transition={{ type: 'spring', damping: 20 }}
                className="relative max-w-md w-full"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCertificatePopup(null);
                  }}
                  className="absolute -top-3 -right-3 z-20 p-3 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full transition-all shadow-2xl border-4 border-white"
                >
                  <X className="w-6 h-6 text-white" />
                </button>

                <div className="relative z-20 w-full max-w-xs bg-[#fffcf5] rounded-sm shadow-2xl overflow-hidden mx-auto">
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
                      
                      {/* Rank Icon (Square Style) */}
                      <div className="relative mb-6 mt-2">
                        <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br shadow-xl flex flex-col items-center justify-center border-2 border-white/30 mx-auto ${
                             certificatePopup.rank === 'A' ? 'from-yellow-400 to-orange-600' :
                             certificatePopup.rank === 'B' ? 'from-blue-400 to-indigo-600' :
                             certificatePopup.rank === 'C' ? 'from-orange-400 to-red-600' :
                             certificatePopup.rank === 'D' ? 'from-purple-400 to-purple-700' :
                             certificatePopup.rank === 'E' ? 'from-green-400 to-emerald-700' :
                             certificatePopup.rank === 'F' ? 'from-pink-400 to-rose-700' :
                             'from-gray-400 to-slate-700'
                          }`}>
                            <span className="text-white font-black text-5xl leading-none drop-shadow-md">{certificatePopup.rank}</span>
                            <span className="text-white/90 text-sm font-bold mt-1">상</span>
                        </div>
                      </div>
                      
                      <div className="text-lg font-bold text-gray-800 mb-6 px-2 leading-tight break-keep">
                         {certificatePopup.prizeName}
                      </div>
                      
                      {/* Image (if available) */}
                      {(certificatePopup as any).image && (
                          <div className="w-28 h-28 rounded border-4 border-gray-200 shadow-inner bg-white mb-6 overflow-hidden">
                             <ImageWithFallback src={(certificatePopup as any).image} className="w-full h-full object-contain" />
                          </div>
                      )}
                      
                      <div className="text-xs text-gray-500 font-serif italic mb-2">
                         귀하께서는 위 상품에<br/>당첨되셨음을 증명합니다.
                      </div>

                      <div className="text-[10px] text-gray-400 mt-2 font-mono">
                        {certificatePopup.id}<br/>{certificatePopup.date}
                      </div>
                   </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
