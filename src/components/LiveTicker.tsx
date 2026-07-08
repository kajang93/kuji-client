import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from './motion';
import { Trophy, Zap } from './icons';
import { fetchRecentDrawHistory } from '../api/kuji';
import { BASE_URL } from '../api/axiosInstance';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface RecentDraw {
  maskedNickname: string;
  boardTitle: string;
  grade: string;
  itemName: string;
  createdAt: string;
}

export default function LiveTicker() {
  const [winnings, setWinnings] = useState<RecentDraw[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // 초기 로드
    loadWinnings();

    // 운영에서는 현재 도메인(BASE_URL) 기준으로 /ws 프록시에 연결 (localhost 고정 시 모바일에서 연결 불가)
    const socketUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8080' : BASE_URL);
    
    const client = new Client({
      webSocketFactory: () => new SockJS(`${socketUrl}/ws`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('Connected to WebSocket Ticker');
        client.subscribe('/topic/draw-ticker', (message) => {
          if (message.body) {
            const newDraw = JSON.parse(message.body) as RecentDraw;
            setWinnings(prev => {
              const newWinnings = [newDraw, ...prev].slice(0, 20); // 최대 20개 유지
              return newWinnings;
            });
            // 새 당첨 내역이 들어오면 즉시 화면에 표시
            setCurrentIndex(0);
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
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
      // 실제 당첨 내역만 표시 (가상 목데이터 없음 → 없으면 안내 문구 노출)
      setWinnings(data && data.length > 0 ? data : []);
    } catch (error) {
      console.error('Failed to load winnings:', error);
    }
  };

  const current = winnings.length > 0 ? winnings[currentIndex] : null;

  return (
    <div className="h-10 bg-slate-900/80 backdrop-blur-md border-b border-white/5 overflow-hidden flex items-center px-4 relative w-full z-20">
      <div className="flex items-center gap-2 text-xs font-bold text-amber-400 shrink-0 mr-4">
        <Zap className="w-3.5 h-3.5 fill-amber-400 animate-pulse" />
        <span className="hidden sm:inline uppercase tracking-wider">LIVE WINNINGS</span>
      </div>

      <div className="flex-1 h-full relative overflow-hidden">
        {current === null ? (
          <div className="absolute inset-0 flex items-center">
            <p className="text-xs sm:text-sm text-slate-400 truncate">
              아직 당첨 소식이 없어요. 첫 번째 주인공이 되어보세요! 🎉
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-0 flex items-center"
            >
              <p className="text-xs sm:text-sm text-slate-300 truncate">
                <span className="text-white font-medium">{current.maskedNickname}</span>님
                <span className="mx-2 text-rose-400 font-bold">{current.grade}</span> 당첨!
                <span className="mx-1 text-slate-600">|</span>
                <span className="text-indigo-300">{current.boardTitle}</span>
                <span className="ml-1 text-slate-400 text-[10px] sm:text-xs font-normal">({current.itemName})</span>
              </p>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-2">
        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
        <span className="text-[10px] text-rose-500 font-bold uppercase hidden xs:inline">Realtime</span>
      </div>
    </div>
  );
}
