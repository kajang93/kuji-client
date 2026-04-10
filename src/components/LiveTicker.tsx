import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from './motion';
import { Trophy, Bell } from './icons';

type Winner = {
  id: string;
  user: string;
  prize: string;
  rank: string;
  time: string;
};

export default function LiveTicker() {
  const [winners, setWinners] = useState<Winner[]>([
    { id: '1', user: 'happy**', prize: 'A상 루피 피규어', rank: 'A', time: '방금 전' },
    { id: '2', user: 'lucky7**', prize: 'Last One상 샹크스', rank: 'Last One', time: '방금 전' },
    { id: '3', user: 'winner**', prize: 'B상 조로 피규어', rank: 'B', time: '1분 전' },
    { id: '4', user: 'kuji_king**', prize: 'A상 에이스 피규어', rank: 'A', time: '2분 전' },
    { id: '5', user: 'otaku1**', prize: 'C상 쵸파 인형', rank: 'C', time: '3분 전' },
    { id: '6', user: 'gacha**', prize: 'A상 나루토 피규어', rank: 'A', time: '5분 전' },
    { id: '7', user: 'onepiece**', prize: 'Last One상 카이도우', rank: 'Last One', time: '7분 전' },
    { id: '8', user: 'love_ani**', prize: 'B상 사스케 피규어', rank: 'B', time: '10분 전' },
    { id: '9', user: 'zoro_fan**', prize: 'D상 텀블러', rank: 'D', time: '12분 전' },
    { id: '10', user: 'nami_swan**', prize: 'E상 타올', rank: 'E', time: '15분 전' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Add mock new winner every 5-10 seconds
      if (Math.random() > 0.3) {
        const newWinner = {
          id: Date.now().toString(),
          user: `user${Math.floor(Math.random() * 9000) + 1000}**`,
          prize: ['A상', 'B상', 'Last One상'][Math.floor(Math.random() * 3)] + ' 피규어',
          rank: ['A', 'B', 'Last One'][Math.floor(Math.random() * 3)],
          time: '방금 전'
        };
        setWinners(prev => [newWinner, ...prev.slice(0, 4)]);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 border-b border-white/10 overflow-hidden relative h-8 flex items-center w-full max-w-[100vw]">
      <div className="absolute left-0 z-10 bg-slate-900 px-3 h-full flex items-center border-r border-white/10">
        <div className="flex items-center gap-1.5 text-yellow-400 text-xs font-bold uppercase tracking-wider">
          <Bell className="w-3 h-3 animate-pulse" />
          <span className="hidden sm:inline">Live</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden relative flex items-center h-full">
        {/* CSS Based Marquee for smoother infinite loop */}
        <div className="flex animate-ticker whitespace-nowrap items-center">
           {/* Render items multiple times to ensure smooth looping even on wide screens */}
          {[...winners, ...winners, ...winners].map((winner, idx) => (
            <div key={`${winner.id}-${idx}`} className="flex items-center gap-2 text-xs sm:text-sm px-4 flex-shrink-0">
              <span className="text-white/60 text-[10px]">{winner.time}</span>
              <span className="text-cyan-300 font-medium">{winner.user}님</span>
              <span className={`${
                winner.rank === 'Last One' ? 'text-red-400' : 'text-yellow-400'
              } font-bold`}>
                {winner.prize} 당첨!
              </span>
              <Trophy className="w-3 h-3 text-white/20" />
            </div>
          ))}
        </div>
        
        <style>{`
          @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.33%); } 
          }
          .animate-ticker {
            animation: ticker 60s linear infinite;
            /* Ensure animation doesn't pause on hover if not desired */
          }
        `}</style>
      </div>
      
      <div className="absolute right-0 z-10 bg-gradient-to-l from-slate-900 to-transparent w-10 h-full pointer-events-none" />
    </div>
  );
}
