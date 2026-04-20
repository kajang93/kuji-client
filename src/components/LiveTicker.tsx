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
  const [winners, setWinners] = useState<Winner[]>([]);
  // Mock generation disabled to keep data clean as requested
  useEffect(() => {
    // Real-time winner logic will be implemented here later
    return () => {};
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
