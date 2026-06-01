import { motion, AnimatePresence } from './motion';
import { ChevronLeft, CreditCard, Check, Sparkles } from './icons';
import { useState, useEffect } from 'react';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { preparePointCharge, fetchPointHistory, type PointHistory } from '../api/points';

type PointChargeProps = {
  currentPoints: number;
  onBack: () => void;
  onChargeComplete?: (newPoints: number) => void;
};

const PRESET_AMOUNTS = [
  { value: 10000, label: '1만원', bonus: 0 },
  { value: 30000, label: '3만원', bonus: 500 },
  { value: 50000, label: '5만원', bonus: 1500 },
  { value: 100000, label: '10만원', bonus: 5000 },
];

export default function PointCharge({ currentPoints, onBack, onChargeComplete }: PointChargeProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'charge' | 'history'>('charge');
  const [pointHistory, setPointHistory] = useState<PointHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      loadPointHistory();
    }
  }, [activeTab]);

  const loadPointHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const history = await fetchPointHistory();
      setPointHistory(history);
    } catch (error) {
      console.error('포인트 내역 로딩 실패:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const finalAmount = isCustom ? (parseInt(customAmount) || 0) : (selectedAmount || 0);
  const bonusPoints = isCustom ? 0 : (PRESET_AMOUNTS.find(a => a.value === selectedAmount)?.bonus || 0);

  const handleCharge = async () => {
    if (finalAmount < 1000) {
      alert('최소 충전 금액은 1,000원입니다.');
      return;
    }
    if (isProcessing) return;

    try {
      setIsProcessing(true);

      // 1. 백엔드에서 결제 세션 생성
      const prepareRes = await preparePointCharge({ amount: finalAmount });

      // 2. 리다이렉트 복구용 localStorage 저장
      localStorage.setItem('point_charge_pending', JSON.stringify({
        amount: prepareRes.amount,
        orderId: prepareRes.orderId,
      }));

      // 3. 토스페이먼츠 결제창 호출
      const clientKey = 'test_ck_yL0qZ4G1VOKP7BNe20MBVoWb2MQY';
      const tossPayments = await loadTossPayments(clientKey);

      await tossPayments.requestPayment('카드', {
        amount: prepareRes.amount,
        orderId: prepareRes.orderId,
        orderName: `쿠지 포인트 ${prepareRes.amount.toLocaleString()}P 충전`,
        customerName: '쿠지 유저',
        successUrl: `${window.location.origin}/?pointCharge=success`,
        failUrl: `${window.location.origin}/?pointCharge=fail`,
      });
    } catch (error) {
      console.error('충전 결제 오류:', error);
      alert('충전 결제 준비 중 오류가 발생했습니다.');
      setIsProcessing(false);
    }
  };

  const getHistoryIcon = (type: string) => {
    switch (type) {
      case 'CHARGE': return '💳';
      case 'USE': return '🎯';
      case 'REWARD': return '🎁';
      case 'REFUND': return '↩️';
      default: return '📝';
    }
  };

  const getHistoryColor = (type: string) => {
    switch (type) {
      case 'CHARGE': return 'text-green-400';
      case 'USE': return 'text-red-400';
      case 'REWARD': return 'text-yellow-400';
      case 'REFUND': return 'text-blue-400';
      default: return 'text-white/60';
    }
  };

  const getHistoryLabel = (type: string) => {
    switch (type) {
      case 'CHARGE': return '충전';
      case 'USE': return '사용';
      case 'REWARD': return '적립';
      case 'REFUND': return '환불';
      default: return type;
    }
  };

  return (
    <div className="min-h-full pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-purple-900 to-blue-900 border-b-2 border-cyan-400/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-xl text-center">포인트 충전</h1>
          <div className="w-10" />
        </div>

        {/* Tabs */}
        <div className="flex px-4 pb-0 gap-4 mt-2">
          <button
            onClick={() => setActiveTab('charge')}
            className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
              activeTab === 'charge' ? 'text-yellow-400' : 'text-white/60'
            }`}
          >
            충전하기
            {activeTab === 'charge' && (
              <motion.div layoutId="pointTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
              activeTab === 'history' ? 'text-yellow-400' : 'text-white/60'
            }`}
          >
            포인트 내역
            {activeTab === 'history' && (
              <motion.div layoutId="pointTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'charge' ? (
            <motion.div
              key="charge"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Current Balance Card */}
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30 shadow-lg">
                <div className="text-green-200 text-sm mb-1">현재 보유 포인트</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-white text-3xl font-black">{currentPoints.toLocaleString()}</span>
                  <span className="text-green-300 text-lg font-bold">P</span>
                </div>
              </div>

              {/* Preset Amount Buttons */}
              <div>
                <div className="text-white/80 text-sm font-medium mb-3">충전 금액 선택</div>
                <div className="grid grid-cols-2 gap-3">
                  {PRESET_AMOUNTS.map((preset) => {
                    const isSelected = !isCustom && selectedAmount === preset.value;
                    return (
                      <motion.button
                        key={preset.value}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          setSelectedAmount(preset.value);
                          setIsCustom(false);
                          setCustomAmount('');
                        }}
                        className={`relative p-4 rounded-2xl border-2 transition-all ${
                          isSelected
                            ? 'border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/10'
                            : 'border-white/10 bg-white/5 hover:border-white/30'
                        }`}
                      >
                        {/* Check mark */}
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-black" />
                            </div>
                          </div>
                        )}

                        <div className="text-left">
                          <div className={`text-xl font-bold ${isSelected ? 'text-yellow-400' : 'text-white'}`}>
                            {preset.label}
                          </div>
                          <div className="text-white/50 text-xs mt-1">
                            {preset.value.toLocaleString()}원
                          </div>
                          {preset.bonus > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              <Sparkles className="w-3 h-3 text-yellow-400" />
                              <span className="text-yellow-400 text-xs font-bold">
                                +{preset.bonus.toLocaleString()}P 보너스
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Amount Input */}
              <div>
                <button
                  onClick={() => {
                    setIsCustom(!isCustom);
                    setSelectedAmount(null);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-2xl border-2 transition-all ${
                    isCustom
                      ? 'border-yellow-400 bg-yellow-400/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <span className={`text-sm font-medium ${isCustom ? 'text-yellow-400' : 'text-white/60'}`}>
                    직접 입력
                  </span>
                </button>

                <AnimatePresence>
                  {isCustom && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 relative">
                        <input
                          type="number"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          placeholder="1,000원 이상 입력"
                          min={1000}
                          step={1000}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white text-lg placeholder:text-white/20 focus:outline-none focus:border-yellow-400 transition-colors"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-medium">원</span>
                      </div>
                      {parseInt(customAmount) > 0 && parseInt(customAmount) < 1000 && (
                        <p className="text-red-400 text-xs mt-2 ml-1">최소 1,000원 이상 충전 가능합니다.</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Summary Card */}
              <AnimatePresence>
                {finalAmount >= 1000 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-3"
                  >
                    <div className="text-white/60 text-sm font-medium">충전 요약</div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80 text-sm">결제 금액</span>
                      <span className="text-white font-bold">{finalAmount.toLocaleString()}원</span>
                    </div>
                    {bonusPoints > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-yellow-400/80 text-sm flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> 보너스 포인트
                        </span>
                        <span className="text-yellow-400 font-bold">+{bonusPoints.toLocaleString()}P</span>
                      </div>
                    )}
                    <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                      <span className="text-white text-sm font-medium">충전 후 예상 포인트</span>
                      <span className="text-green-400 font-black text-lg">
                        {(currentPoints + finalAmount + bonusPoints).toLocaleString()}P
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* History Tab */
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {isLoadingHistory ? (
                <div className="text-center py-20">
                  <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-white/50">내역을 불러오는 중...</p>
                </div>
              ) : pointHistory.length === 0 ? (
                <div className="text-center py-20">
                  <CreditCard className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/50">포인트 내역이 없습니다</p>
                </div>
              ) : (
                pointHistory.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg flex-shrink-0">
                      {getHistoryIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          item.type === 'CHARGE' ? 'bg-green-500/20 text-green-400' :
                          item.type === 'USE' ? 'bg-red-500/20 text-red-400' :
                          item.type === 'REWARD' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {getHistoryLabel(item.type)}
                        </span>
                      </div>
                      <p className="text-white/80 text-sm truncate">{item.description}</p>
                      <p className="text-white/30 text-[10px] mt-0.5">{item.createdAt}</p>
                    </div>
                    <div className={`text-right font-bold ${getHistoryColor(item.type)}`}>
                      {item.type === 'USE' ? '-' : '+'}{Math.abs(item.amount).toLocaleString()}P
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom CTA - Charge Tab Only */}
      {activeTab === 'charge' && (
        <div className="fixed bottom-0 left-0 right-0 px-6 pt-6 pb-[calc(env(safe-area-inset-bottom)+2rem)] z-40 bg-gradient-to-t from-purple-900 via-purple-900/95 to-transparent pointer-events-none">
          <div className="pointer-events-auto max-w-lg mx-auto">
            <motion.button
              whileHover={{ scale: finalAmount >= 1000 && !isProcessing ? 1.02 : 1 }}
              whileTap={{ scale: finalAmount >= 1000 && !isProcessing ? 0.98 : 1 }}
              onClick={handleCharge}
              disabled={finalAmount < 1000 || isProcessing}
              className={`w-full py-5 rounded-full text-xl shadow-2xl transition-all flex items-center justify-center gap-3 ${
                finalAmount >= 1000 && !isProcessing
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 hover:shadow-yellow-400/50'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-6 h-6 border-2 border-purple-900 border-t-transparent rounded-full animate-spin" />
                  <span className="font-bold">결제 처리 중...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-6 h-6" />
                  <span className="font-bold">
                    {finalAmount >= 1000
                      ? `${finalAmount.toLocaleString()}원 충전하기`
                      : '충전할 금액을 선택하세요'}
                  </span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
