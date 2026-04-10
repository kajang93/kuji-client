import { useState } from 'react';
import { motion, AnimatePresence } from './motion';
import { ChevronLeft, Clock, CheckCircle, MessageCircle, X } from './icons';

type SupportTicket = {
  id: string;
  category: string;
  title: string;
  content: string;
  status: 'pending' | 'answered';
  createdAt: string;
  answer?: string;
  answeredAt?: string;
};

type SupportHistoryProps = {
  onBack: () => void;
};

export default function SupportHistory({ onBack }: SupportHistoryProps) {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Mock support tickets
  const tickets: SupportTicket[] = [
    {
      id: 'INQ-2024-001',
      category: '주문/배송',
      title: '배송 주소 변경 문의',
      content: '주문한 상품의 배송 주소를 변경하고 싶습니다. 가능한가요?',
      status: 'answered',
      createdAt: '2024-11-18 14:30',
      answer: '안녕하세요. 배송 전이라면 주소 변경이 가능합니다. 고객센터(1588-0000)로 연락 주시면 빠르게 처리해드리겠습니다.',
      answeredAt: '2024-11-18 16:20',
    },
    {
      id: 'INQ-2024-002',
      category: '상품 문의',
      title: '피규어 재입고 일정',
      content: '원피스 A상 피규어 재입고 예정이 언제인가요?',
      status: 'answered',
      createdAt: '2024-11-17 10:15',
      answer: '원피스 A상은 다음 주 화요일(11/26) 재입고 예정입니다. 재입고 알림을 설정하시면 입고 시 바로 알려드립니다.',
      answeredAt: '2024-11-17 14:50',
    },
    {
      id: 'INQ-2024-003',
      category: '결제',
      title: '결제 오류 문의',
      content: '결제 시도 중 오류가 발생했습니다. 확인 부탁드립니다.',
      status: 'pending',
      createdAt: '2024-11-19 09:00',
    },
  ];

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
          {tickets.length === 0 ? (
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
                      {ticket.category}
                    </span>
                    {ticket.status === 'answered' ? (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <CheckCircle className="w-3 h-3" />
                        답변 완료
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-yellow-400">
                        <Clock className="w-3 h-3" />
                        답변 대기
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-white/60">{ticket.id}</span>
                </div>

                <h3 className="text-white mb-2">{ticket.title}</h3>
                <p className="text-white/70 text-sm line-clamp-2 mb-2">
                  {ticket.content}
                </p>
                <p className="text-white/50 text-xs">{ticket.createdAt}</p>
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
                    {selectedTicket.category}
                  </span>
                  {selectedTicket.status === 'answered' ? (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <CheckCircle className="w-3 h-3" />
                      답변 완료
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-yellow-400">
                      <Clock className="w-3 h-3" />
                      답변 대기
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
                    <h3 className="text-white">문의 내용</h3>
                    <span className="text-xs text-white/60">{selectedTicket.createdAt}</span>
                  </div>
                  <h4 className="text-yellow-400 mb-3">{selectedTicket.title}</h4>
                  <p className="text-white/80 whitespace-pre-wrap">{selectedTicket.content}</p>
                </div>

                {/* Answer */}
                {selectedTicket.status === 'answered' && selectedTicket.answer && (
                  <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-400/30 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-green-400 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        답변
                      </h3>
                      <span className="text-xs text-white/60">{selectedTicket.answeredAt}</span>
                    </div>
                    <p className="text-white/90 whitespace-pre-wrap">{selectedTicket.answer}</p>
                  </div>
                )}

                {selectedTicket.status === 'pending' && (
                  <div className="bg-yellow-900/30 border border-yellow-400/30 rounded-2xl p-4 text-center">
                    <Clock className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                    <p className="text-yellow-400">답변 대기 중입니다</p>
                    <p className="text-white/70 text-sm mt-1">
                      1~2 영업일 내에 답변 드리겠습니다
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
                className="mt-4 w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 rounded-xl hover:from-yellow-300 hover:to-yellow-400 transition-all"
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
