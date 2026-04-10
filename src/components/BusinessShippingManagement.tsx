import { useState } from 'react';
import { motion, AnimatePresence } from './motion';
import { ChevronLeft, Package, Truck, CheckCircle, ChevronRight, Save } from './icons';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { WinningItem } from '../App';

type BusinessShippingManagementProps = {
  onBack: () => void;
  winningHistory: WinningItem[];
  onUpdateShipping?: (winningId: string, status: 'preparing' | 'shipped' | 'delivered', trackingNumber?: string) => void;
};

type GroupedWinnings = {
  [seriesName: string]: WinningItem[];
};

export default function BusinessShippingManagement({ 
  onBack, 
  winningHistory,
  onUpdateShipping 
}: BusinessShippingManagementProps) {
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [trackingNumbers, setTrackingNumbers] = useState<Record<string, string>>({});

  // Group winnings by series
  const groupedWinnings: GroupedWinnings = winningHistory.reduce((acc, winning) => {
    const series = winning.animeName;
    if (!acc[series]) {
      acc[series] = [];
    }
    acc[series].push(winning);
    return acc;
  }, {} as GroupedWinnings);

  const getStatusInfo = (status: 'preparing' | 'shipped' | 'delivered') => {
    switch (status) {
      case 'preparing':
        return { label: '배송 준비중', color: 'bg-blue-500', textColor: 'text-blue-300', icon: Package };
      case 'shipped':
        return { label: '배송 중', color: 'bg-yellow-500', textColor: 'text-yellow-300', icon: Truck };
      case 'delivered':
        return { label: '배송 완료', color: 'bg-green-500', textColor: 'text-green-300', icon: CheckCircle };
    }
  };

  const getRankColor = (rank: string) => {
    const colors: Record<string, string> = {
      'A': 'from-yellow-400 to-yellow-600',
      'B': 'from-purple-400 to-purple-600',
      'C': 'from-blue-400 to-blue-600',
      'D': 'from-green-400 to-green-600',
      'E': 'from-pink-400 to-pink-600',
      'F': 'from-orange-400 to-orange-600',
      'G': 'from-teal-400 to-teal-600',
      'H': 'from-red-400 to-red-600',
    };
    return colors[rank] || 'from-gray-400 to-gray-600';
  };

  const handleTrackingNumberChange = (winningId: string, value: string) => {
    setTrackingNumbers(prev => ({
      ...prev,
      [winningId]: value
    }));
  };

  const handleUpdateStatus = (winningId: string, newStatus: 'preparing' | 'shipped' | 'delivered') => {
    const trackingNum = trackingNumbers[winningId]?.trim();
    
    if (newStatus === 'shipped' && !trackingNum) {
      alert('운송장 번호를 입력해주세요');
      return;
    }

    onUpdateShipping?.(winningId, newStatus, trackingNum || undefined);
    
    // Clear tracking number after update
    if (trackingNum) {
      setTrackingNumbers(prev => {
        const newState = { ...prev };
        delete newState[winningId];
        return newState;
      });
    }
  };

  const seriesNames = Object.keys(groupedWinnings);

  if (selectedSeries) {
    const seriesWinnings = groupedWinnings[selectedSeries] || [];
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-purple-800 pb-20">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-purple-900 to-blue-900 border-b-2 border-cyan-400/50 shadow-lg">
          <div className="flex items-center gap-4 p-4">
            <button
              onClick={() => setSelectedSeries(null)}
              className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="text-white text-xl">{selectedSeries}</h1>
              <p className="text-white/60 text-sm">{seriesWinnings.length}개 주문</p>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="p-4 space-y-3">
          {seriesWinnings.map((winning, index) => {
            const statusInfo = getStatusInfo(winning.deliveryStatus);
            const StatusIcon = statusInfo.icon;
            
            return (
              <motion.div
                key={winning.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg"
              >
                <div className="flex gap-4 mb-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-white/20">
                      <ImageWithFallback
                        src={winning.prizeImage}
                        alt={winning.prizeName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`px-2 py-0.5 bg-gradient-to-r ${getRankColor(winning.rank)} rounded text-white text-xs`}>
                        {winning.rank}상
                      </div>
                      <div className={`px-2 py-0.5 ${statusInfo.color} rounded text-white text-xs`}>
                        {statusInfo.label}
                      </div>
                    </div>
                    <div className="text-white mb-1">{winning.prizeName}</div>
                    <div className="text-white/60 text-sm">주문번호: {winning.id}</div>
                    <div className="text-white/60 text-sm">{winning.date}</div>
                  </div>
                </div>

                {/* Shipping Management */}
                {winning.deliveryStatus !== 'delivered' && (
                  <div className="space-y-3 border-t border-white/10 pt-3">
                    {/* Tracking Number Input */}
                    {winning.deliveryStatus === 'preparing' && (
                      <div>
                        <label className="text-white/70 text-sm block mb-2">운송장 번호</label>
                        <input
                          type="text"
                          value={trackingNumbers[winning.id] || winning.trackingNumber || ''}
                          onChange={(e) => handleTrackingNumberChange(winning.id, e.target.value)}
                          placeholder="운송장 번호 입력"
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-teal-400"
                        />
                      </div>
                    )}

                    {/* Display Tracking Number if exists */}
                    {winning.trackingNumber && winning.deliveryStatus !== 'preparing' && (
                      <div>
                        <label className="text-white/70 text-sm block mb-1">운송장 번호</label>
                        <div className="text-white">{winning.trackingNumber}</div>
                      </div>
                    )}

                    {/* Status Update Buttons */}
                    <div className="flex gap-2">
                      {winning.deliveryStatus === 'preparing' && (
                        <button
                          onClick={() => handleUpdateStatus(winning.id, 'shipped')}
                          className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 rounded-lg text-white text-sm transition-all flex items-center justify-center gap-2"
                        >
                          <Truck className="w-4 h-4" />
                          배송 시작
                        </button>
                      )}
                      {winning.deliveryStatus === 'shipped' && (
                        <button
                          onClick={() => handleUpdateStatus(winning.id, 'delivered')}
                          className="flex-1 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 rounded-lg text-white text-sm transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          배송 완료
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Delivered Status */}
                {winning.deliveryStatus === 'delivered' && winning.trackingNumber && (
                  <div className="border-t border-white/10 pt-3">
                    <div className="text-white/70 text-sm mb-1">운송장 번호</div>
                    <div className="text-white">{winning.trackingNumber}</div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // Series List View
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-purple-800 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-purple-900 to-blue-900 border-b-2 border-cyan-400/50 shadow-lg">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => setSelectedSeries(null)}
            className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-white text-xl">배송 관리</h1>
            <p className="text-white/60 text-sm">시리즈를 선택하여 배송을 관리하세요</p>
          </div>
        </div>
      </div>

      {/* Series List */}
      <div className="p-4 space-y-3">
        {seriesNames.length === 0 ? (
          <div className="text-center py-12 text-white/60">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>배송 관리할 주문이 없습니다</p>
          </div>
        ) : (
          seriesNames.map((seriesName, index) => {
            const seriesWinnings = groupedWinnings[seriesName];
            const preparingCount = seriesWinnings.filter(w => w.deliveryStatus === 'preparing').length;
            const shippedCount = seriesWinnings.filter(w => w.deliveryStatus === 'shipped').length;
            const deliveredCount = seriesWinnings.filter(w => w.deliveryStatus === 'delivered').length;
            
            return (
              <motion.button
                key={seriesName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedSeries(seriesName)}
                className="w-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg hover:border-teal-400/50 transition-all text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-white text-lg mb-1">{seriesName}</h3>
                    <p className="text-white/60 text-sm">총 {seriesWinnings.length}개 주문</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-white/60" />
                </div>

                {/* Status Summary */}
                <div className="flex gap-2">
                  {preparingCount > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 border border-blue-400/30 rounded text-blue-300 text-xs">
                      <Package className="w-3 h-3" />
                      <span>준비중 {preparingCount}</span>
                    </div>
                  )}
                  {shippedCount > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 border border-yellow-400/30 rounded text-yellow-300 text-xs">
                      <Truck className="w-3 h-3" />
                      <span>배송중 {shippedCount}</span>
                    </div>
                  )}
                  {deliveredCount > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-400/30 rounded text-green-300 text-xs">
                      <CheckCircle className="w-3 h-3" />
                      <span>완료 {deliveredCount}</span>
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })
        )}
      </div>

      {/* Info Tip */}
      {seriesNames.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mx-4 mt-4 bg-teal-500/20 border-2 border-teal-400/50 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <div className="text-xl">💡</div>
            <div className="text-white/70 text-sm">
              <p>시리즈를 선택하면 해당 시리즈의 모든 주문 상품을 확인하고 운송장 번호를 입력할 수 있습니다.</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}