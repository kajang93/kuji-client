import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from './motion';
import { Trophy, Zap } from './icons';
import { fetchRecentDrawHistory } from '../api/kuji';

interface RecentDraw {
  maskedNickname: string;
  boardTitle: string;
  grade: string;
  itemName: string;
  createdAt: string;
}

export default function WinningTicker() {
  const [winnings, setWinnings] = useState<RecentDraw[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // 초기 로드
    loadWinnings();

    // 1분마다 당첨 내역 갱신
    const interval = setInterval(loadWinnings, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (winnings.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % winnings.length);
      }, 5000); // 5초마다 다음 당첨 소식으로 전환
      return () => clearInterval(timer);
    }
  }, [winnings]);

  const loadWinnings = async () => {
    try {
      const data = await fetchRecentDrawHistory();
      if (data && data.length > 0) {
        setWinnings(data);
      } else {
        // 데이터가 없을 경우 표시할 가상 데이터 (개발용/초기용)
        setWinnings([
          { maskedNickname: 'stars***', boardTitle: '원피스 에그헤드편', grade: 'A상', itemName: '루피 피규어', createdAt: '' },
          { maskedNickname: 'ka****', boardTitle: '마법학원 아스테리아', grade: 'B상', itemName: '아스테리아 교복 피규어', createdAt: '' },
          { maskedNickname: 'kuji***', boardTitle: '드래곤볼 Z', grade: 'Last One상', itemName: '신룡 피규어', createdAt: '' },
        ]);
      }
    } catch (error) {
      console.error('Failed to load winnings:', error);
    }
  };

  if (winnings.length === 0) return null;

  const current = winnings[currentIndex];

  return (
    <div className="h-10 bg-slate-900/80 backdrop-blur-md border-b border-white/5 overflow-hidden flex items-center px-4 relative">
      <div className="flex items-center gap-2 text-xs font-bold text-amber-400 shrink-0 mr-4">
        <Zap className="w-3.5 h-3.5 fill-amber-400 animate-pulse" />
        <span className="uppercase tracking-wider">LIVE WINNINGS</span>
      </div>

      <div className="flex-1 h-full relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0 flex items-center"
          >
            <p className="text-sm text-slate-300 truncate">
              <span className="text-white font-medium">{current.maskedNickname}</span>님 축하합니다! 
              <span className="mx-2 text-slate-500">|</span>
              <span className="text-rose-400 font-bold">{current.grade}</span> 당첨!
              <span className="mx-2 text-slate-500">|</span>
              <span className="text-indigo-300">{current.boardTitle}</span>
              <span className="ml-2 text-slate-400 text-xs font-normal">({current.itemName})</span>
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-4">
        <div className="w-1 h-1 rounded-full bg-rose-500 animate-ping" />
        <span className="text-[10px] text-rose-500 font-bold uppercase">Realtime</span>
      </div>
    </div>
  );
}
