import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from './motion';
import { ChevronLeft, Clock, CheckCircle, MessageCircle, X } from './icons';
import { fetchMyInquiries } from '../api/inquiry';
import { Inquiry } from '../shared-types';
import { toast } from 'sonner';

type SupportHistoryProps = {
  onBack: () => void;
};

export default function SupportHistory({ onBack }: SupportHistoryProps) {
  const [selectedTicket, setSelectedTicket] = useState<Inquiry | null>(null);
  const [tickets, setTickets] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMyInquiries();
      setTickets(data);
    } catch (error: any) {
      toast.error(error.message || '문의 내역을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-purple-900 to-blue-900 border-b-2 border-cyan-400/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-xl">문의 내역</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-white/60">문의 내역을 불러오는 중...</p>
            </div>
          ) : tickets.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <MessageCircle className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/60">문의 내역이 없습니다</p>
            </motion.div>
          ) : (
            tickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedTicket(ticket)}
                className="bg-white/10 rounded-2xl p-4 hover:bg-white/20 transition-colors cursor-pointer border border-white/20"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-purple-500/50 text-white rounded">
                      {ticket.categoryDescription}
                    </span>
                    {ticket.status === 'COMPLETED' ? (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <CheckCircle className="w-3 h-3" />
                        {ticket.statusDescription}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-yellow-400">
                        <Clock className="w-3 h-3" />
                        {ticket.statusDescription}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-white/60">#{ticket.id}</span>
                </div>

                <h3 className="text-white mb-2 font-bold">{ticket.title}</h3>
                <p className="text-white/50 text-xs">
                  {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTicket(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col border-2 border-cyan-400/50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-purple-500/50 text-white rounded">
                    {selectedTicket.categoryDescription}
                  </span>
                  {selectedTicket.status === 'COMPLETED' ? (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <CheckCircle className="w-3 h-3" />
                      {selectedTicket.statusDescription}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-yellow-400">
                      <Clock className="w-3 h-3" />
                      {selectedTicket.statusDescription}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto space-y-4">
                {/* Question */}
                <div className="bg-white/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white text-sm opacity-60">문의 내용</h3>
                    <span className="text-xs text-white/60">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                  </div>
                  <h4 className="text-yellow-400 font-bold mb-3">{selectedTicket.title}</h4>
                  <p className="text-white/80 whitespace-pre-wrap">{selectedTicket.content}</p>
                </div>

                {/* Answer */}
                {selectedTicket.status === 'COMPLETED' && selectedTicket.answerContent && (
                  <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-400/30 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-green-400 flex items-center gap-2 font-bold">
                        <CheckCircle className="w-5 h-5" />
                        답변
                      </h3>
                      <span className="text-xs text-white/60">
                        {selectedTicket.answeredAt && new Date(selectedTicket.answeredAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-white/90 whitespace-pre-wrap">{selectedTicket.answerContent}</p>
                  </div>
                )}

                {selectedTicket.status === 'WAITING' && (
                  <div className="bg-yellow-900/30 border border-yellow-400/30 rounded-2xl p-4 text-center">
                    <Clock className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                    <p className="text-yellow-400 font-bold">답변 대기 중입니다</p>
                    <p className="text-white/70 text-sm mt-1">
                      접수된 문의는 최대한 빠른 시일 내에 답변 드리겠습니다.
                    </p>
                  </div>
                )}

                {/* Ticket Info */}
                <div className="bg-white/5 rounded-2xl p-4">
                  <p className="text-white/60 text-sm">문의 번호: {selectedTicket.id}</p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedTicket(null)}
                className="mt-4 w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all"
              >
                닫기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
