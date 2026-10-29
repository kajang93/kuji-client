import { useState, useEffect, useRef } from 'react';
import { motion } from './motion';
import { ChevronLeft, Sparkles } from './icons';

import { prepareKujiPayment } from '../api/kuji';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { readPaymentRecovery } from '../utils/paymentRecovery';
import { playDrawHaptic } from '../utils/drawHaptics';
import { useReducedMotion } from 'framer-motion';

type KujiSelectionProps = {
  boardId: number;
  totalKuji: number;
  purchaseCount: number;
  pointsToUse: number;
  pricePerKuji: number;
  kujiStatus: boolean[];
  hasLastPrize?: boolean;
  lastPrizeAvailable?: boolean;
  onConfirm: (selectedIndices: number[]) => void | Promise<void>;
  onBack: () => void;
};

export default function KujiSelection({ boardId, purchaseCount, pointsToUse, pricePerKuji, kujiStatus, hasLastPrize = false, lastPrizeAvailable = false, onConfirm, onBack }: KujiSelectionProps) {
  const [selectedKuji, setSelectedKuji] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);
  const reducedMotion = useReducedMotion();

  const finalPrice = Math.max(0, purchaseCount * pricePerKuji - pointsToUse);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    const container = document.getElementById('main-scroll-container');
    if (container) {
      container.scrollTo(0, 0);
    }
  }, []);

  const toggleKuji = (index: number) => {
    if (kujiStatus[index] || processingRef.current) return; // Can't select opened kuji

    if (selectedKuji.includes(index)) {
      playDrawHaptic('select');
      setSelectedKuji(selectedKuji.filter(i => i !== index));
    } else {
      // Only allow selecting up to purchaseCount
      if (selectedKuji.length < purchaseCount) {
        playDrawHaptic('select');
        setSelectedKuji([...selectedKuji, index]);
      }
    }
  };

  const randomSelect = () => {
    if (processingRef.current) return;
    const availableKuji = kujiStatus
      .map((isOpened, index) => ({ index, isOpened }))
      .filter(k => !k.isOpened)
      .map(k => k.index);

    if (availableKuji.length > 0) {
      // Select random kujis up to purchaseCount
      const shuffled = availableKuji.sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(purchaseCount, availableKuji.length));
      setSelectedKuji(selected);
      playDrawHaptic('select');
    }
  };

  const handleConfirm = async () => {
    if (selectedKuji.length !== purchaseCount || processingRef.current) return;
    if (readPaymentRecovery()) {
      alert("이전 결제 결과를 먼저 확인해 주세요.");
      return;
    }

    if (finalPrice > 0) {
      const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY;
      if (!clientKey) {
        alert("결제 서비스가 설정되지 않았습니다. 고객센터에 문의해 주세요.");
        return;
      }
      try {
        processingRef.current = true;
        setIsProcessing(true);
        // 1. Prepare payment via Backend
        const prepareRes = await prepareKujiPayment(boardId, {
          count: purchaseCount,
          pointsUsed: pointsToUse 
        });

        // 2. Save session locally to recover after redirect
        localStorage.setItem("kuji_pending_payment", JSON.stringify({
          boardId,
          count: purchaseCount,
          orderId: prepareRes.orderId,
          amount: prepareRes.amount
        }));

        // 3. Load Toss SDK & Request Payment
        const tossPayments = await loadTossPayments(clientKey);

        await tossPayments.requestPayment("카드", {
          amount: prepareRes.amount,
          orderId: prepareRes.orderId,
          orderName: prepareRes.boardTitle || "쿠지 뽑기",
          customerName: "쿠지 유저",
          successUrl: `${window.location.origin}/?payment=success`,
          failUrl: `${window.location.origin}/?payment=fail`
        });
      } catch (error: any) {
        console.warn("Payment process aborted/error:", error);
        
        // Toss Payments throws an error when the user cancels the payment window
        if (error?.code === 'USER_CANCEL' || error?.message?.includes('취소')) {
          // It's just a user cancellation, we don't need to show a scary error
          setIsProcessing(false);
          return;
        }

        alert("결제 준비 중 오류가 발생했습니다.");
        setIsProcessing(false);
      } finally {
        processingRef.current = false;
        setIsProcessing(false);
      }
    } else {
      // Point only payment
      processingRef.current = true;
      setIsProcessing(true);
      try {
        await onConfirm(selectedKuji);
      } finally {
        processingRef.current = false;
        setIsProcessing(false);
      }
    }
  };

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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 pb-40">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-xl items-center justify-between p-4">
          <button
            onClick={onBack}
            disabled={isProcessing}
            aria-label="상품으로 돌아가기"
            className="rounded-full border border-white/10 bg-white/5 p-2 transition-colors hover:bg-white/10 disabled:opacity-40"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div className="text-center">
            <p className="mb-1 text-[10px] font-semibold tracking-[0.24em] text-amber-300/80">PICK YOUR LUCK</p>
            <h1 className="text-lg font-semibold text-white">마음이 가는 쿠지를 골라요</h1>
            <div className="mt-1 text-sm" aria-live="polite">
              <span className={selectedKuji.length === purchaseCount ? 'text-yellow-400 font-bold' : 'text-white/90'}>
                {selectedKuji.length}
              </span>
              <span className="text-white/50 mx-1">/</span>
              <span className="text-white/80">{purchaseCount} 개 선택됨</span>
            </div>
          </div>
          <div className="w-10" /> {/* Placeholder for right spacing to let the Menu button sit without overlap */}
        </div>
      </div>

      {hasLastPrize && (
        <div role="note" aria-label="라스트상 지급 안내" className="mx-auto mt-5 max-w-xl px-4 sm:px-6">
          <div className="rounded-2xl border border-amber-300/25 bg-amber-300/[0.07] p-4">
            <p className="text-sm font-semibold text-amber-200">{lastPrizeAvailable ? '마지막 일반 쿠지를 뽑으면 라스트상 추가 지급' : '이 시리즈의 라스트상은 지급 완료됐어요'}</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-100/70">
              {lastPrizeAvailable
                ? '일반 쿠지가 모두 소진되는 순간, 마지막 구매자에게 라스트상 1개를 함께 드려요. 선택할 티켓과 결제 금액에는 포함되지 않아요.'
                : '남은 일반 쿠지만 선택할 수 있으며 라스트상은 다시 지급되지 않아요.'}
            </p>
          </div>
        </div>
      )}

      {/* Random Select Button */}
      <div className="mx-auto max-w-xl px-4 pb-4 pt-6 sm:px-6">
        <motion.button
          whileHover={reducedMotion ? undefined : { scale: 1.01 }}
          whileTap={reducedMotion ? undefined : { scale: 0.98 }}
          onClick={randomSelect}
          disabled={isProcessing}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-300/20 bg-amber-300/5 py-3.5 text-amber-200 transition-colors hover:bg-amber-300/10 disabled:opacity-40"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-medium">랜덤으로 {purchaseCount}장 골라주기</span>
        </motion.button>
      </div>

      {/* Info */}
      <div className="mx-auto max-w-xl px-4 pb-6 sm:px-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
          <p className="text-center text-xs leading-relaxed text-slate-400">
            아직 열리지 않은 쿠지 {purchaseCount}장을 골라주세요.<br />선택을 마치면 한 장씩 직접 뜯어볼 수 있어요.
          </p>
        </div>
      </div>

      {/* Kuji Grid */}
      <div className="relative z-0 mx-auto max-w-xl px-4 pb-6 sm:px-6">
        <div className="grid grid-cols-4 gap-4 sm:grid-cols-6">
          {kujiStatus.map((isOpened, index) => {
            const isSelected = selectedKuji.includes(index);

            return (
              <motion.button
                key={index}
                type="button"
                aria-label={`${index + 1}번 쿠지${isOpened ? ', 개봉 완료' : isSelected ? ', 선택됨' : ''}`}
                aria-pressed={isSelected}
                whileHover={!isOpened && !reducedMotion ? { scale: 1.04, zIndex: 20 } : {}}
                whileTap={!isOpened && !reducedMotion ? { scale: 0.97 } : {}}
                animate={isSelected ? {
                  scale: reducedMotion ? 1 : 1.07,
                  y: reducedMotion ? 0 : -4,
                  rotate: 0,
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
                disabled={isOpened || isProcessing}
                className={`relative rounded-md transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-900 ${isOpened ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
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
                  aria-hidden="true"
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
                          <stop offset="0%" stopColor="#475569" />
                          <stop offset="25%" stopColor="#334155" />
                          <stop offset="50%" stopColor="#1e293b" />
                          <stop offset="75%" stopColor="#0f172a" />
                          <stop offset="100%" stopColor="#312e81" />
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
                          ★ 오시쿠지 ★
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
                          OSHI KUJI
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
                          행운을 열어보세요
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
                <span aria-hidden="true" className="pointer-events-none absolute bottom-1 right-1 z-20 rounded bg-slate-950/70 px-1 text-[10px] font-semibold tabular-nums text-white/80">{String(index + 1).padStart(2, '0')}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Fixed Confirm Button */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-8 sm:px-6">
        <div className="pointer-events-auto mx-auto max-w-xl">
          <motion.button
            whileHover={{ scale: selectedKuji.length === purchaseCount && !isProcessing && !reducedMotion ? 1.02 : 1 }}
            whileTap={{ scale: selectedKuji.length === purchaseCount && !isProcessing && !reducedMotion ? 0.98 : 1 }}
            onClick={handleConfirm}
            disabled={selectedKuji.length !== purchaseCount || isProcessing}
            className={`w-full rounded-2xl py-4 text-base shadow-2xl transition-all ${selectedKuji.length === purchaseCount && !isProcessing
              ? 'bg-gradient-to-r from-amber-200 to-amber-400 text-slate-950 hover:shadow-amber-400/20'
              : 'cursor-not-allowed bg-slate-800 text-slate-500'
              }`}
          >
            <div className="text-center font-bold">
              {isProcessing ? "처리 중..." :
                selectedKuji.length === purchaseCount
                  ? (finalPrice > 0 ? `₩${finalPrice.toLocaleString()} 결제하고 뽑기` : `포인트로 뽑기 (${purchaseCount}장)`)
                  : `${purchaseCount - selectedKuji.length}개 더 선택하세요`}
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
