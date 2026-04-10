import { useState, useEffect } from 'react';
import { motion } from './motion';
import { ChevronLeft, MessageSquare, Send, CheckCircle, Clock, Search } from './icons';
import type { Inquiry } from '../App';

type AdminInquiryManagementProps = {
  onBack: () => void;
  inquiries: Inquiry[];
  onAddComment: (inquiryId: string, content: string) => void;
  onUpdateStatus: (inquiryId: string, status: 'pending' | 'answered' | 'closed') => void;
};

export default function AdminInquiryManagement({ 
  onBack, 
  inquiries,
  onAddComment,
  onUpdateStatus 
}: AdminInquiryManagementProps) {
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [newComment, setNewComment] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'answered'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Sort by most recent first
  const sortedInquiries = [...inquiries].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });

  const filteredInquiries = sortedInquiries.filter(inq => {
    const matchesStatus = filterStatus === 'all' || inq.status === filterStatus;
    const matchesSearch = inq.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inq.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inq.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Auto-select first inquiry if none selected
  useEffect(() => {
    if (!selectedInquiry && filteredInquiries.length > 0) {
      setSelectedInquiry(filteredInquiries[0]);
    }
  }, [filteredInquiries]);

  // Sync selectedInquiry with updated inquiries data
  useEffect(() => {
    if (selectedInquiry) {
      const updated = inquiries.find(inq => inq.id === selectedInquiry.id);
      if (updated) {
        setSelectedInquiry(updated);
      }
    }
  }, [inquiries]);

  const handleSendComment = () => {
    if (!selectedInquiry || !newComment.trim()) return;
    onAddComment(selectedInquiry.id, newComment);
    setNewComment('');
    // Update status to answered
    if (selectedInquiry.status === 'pending') {
      onUpdateStatus(selectedInquiry.id, 'answered');
    }
  };

  const pendingCount = inquiries.filter(i => i.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pb-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={onBack}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-white text-2xl">1:1 문의 관리</h1>
              <p className="text-white/60 text-sm">
                미답변 {pendingCount}건 / 전체 {inquiries.length}건
              </p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="문의 검색..."
                className="w-full pl-12 pr-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg transition-all text-sm ${filterStatus === 'all' ? 'bg-white text-purple-900' : 'bg-white/20 text-white hover:bg-white/30'}`}
              >
                전체 ({inquiries.length})
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-lg transition-all text-sm ${filterStatus === 'pending' ? 'bg-yellow-400 text-purple-900' : 'bg-white/20 text-white hover:bg-white/30'}`}
              >
                미답변 ({pendingCount})
              </button>
              <button
                onClick={() => setFilterStatus('answered')}
                className={`px-4 py-2 rounded-lg transition-all text-sm ${filterStatus === 'answered' ? 'bg-green-400 text-purple-900' : 'bg-white/20 text-white hover:bg-white/30'}`}
              >
                답변완료 ({inquiries.filter(i => i.status === 'answered').length})
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Inquiry List */}
          <div className="lg:col-span-1 space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
            {filteredInquiries.length === 0 ? (
              <div className="bg-white/10 rounded-xl p-8 text-center">
                <MessageSquare className="w-12 h-12 text-white/30 mx-auto mb-3" />
                <p className="text-white/50 text-sm">문의가 없습니다</p>
              </div>
            ) : (
              filteredInquiries.map((inquiry) => (
                <button
                  key={inquiry.id}
                  onClick={() => setSelectedInquiry(inquiry)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    selectedInquiry?.id === inquiry.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {inquiry.status === 'pending' ? (
                        <Clock className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                      <span className="text-white text-sm">{inquiry.customerName}</span>
                      {inquiry.isNew && (
                        <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">NEW</span>
                      )}
                    </div>
                  </div>
                  <div className="text-white text-sm mb-1">{inquiry.subject}</div>
                  <div className="text-white/60 text-xs truncate">{inquiry.content}</div>
                  <div className="text-white/50 text-xs mt-2">{inquiry.createdAt}</div>
                </button>
              ))
            )}
          </div>

          {/* Inquiry Detail */}
          <div className="lg:col-span-2">
            {selectedInquiry ? (
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-cyan-500 text-white text-xs rounded">
                        {selectedInquiry.inquiryType}
                      </span>
                      <h2 className="text-white text-xl">{selectedInquiry.subject}</h2>
                    </div>
                    <p className="text-white/60 text-sm">
                      {selectedInquiry.customerName} · {selectedInquiry.createdAt}
                    </p>
                  </div>
                  <select
                    value={selectedInquiry.status}
                    onChange={(e) => {
                      onUpdateStatus(selectedInquiry.id, e.target.value as any);
                    }}
                    className="px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30 text-sm"
                  >
                    <option value="pending" className="bg-purple-900">미답변</option>
                    <option value="answered" className="bg-purple-900">답변완료</option>
                    <option value="closed" className="bg-purple-900">종료</option>
                  </select>
                </div>

                {/* Original Inquiry */}
                <div className="bg-white/10 rounded-xl p-4 mb-4">
                  <div className="text-white/70 text-sm mb-2">문의 내용</div>
                  <div className="text-white">{selectedInquiry.content}</div>
                  <div className="text-white/50 text-xs mt-2">
                    주문번호: {selectedInquiry.orderNumber}
                  </div>
                </div>

                {/* Comments */}
                <div className="space-y-3 mb-4 max-h-[40vh] overflow-y-auto">
                  {selectedInquiry.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`rounded-xl p-4 ${
                        comment.author === 'seller'
                          ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 ml-8'
                          : 'bg-white/10 mr-8'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-full ${
                          comment.author === 'seller' 
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                            : 'bg-gradient-to-br from-pink-400 to-purple-500'
                        } flex items-center justify-center text-white text-sm`}>
                          {comment.authorName[0]}
                        </div>
                        <div>
                          <div className="text-white text-sm">{comment.authorName}</div>
                          <div className="text-white/60 text-xs">{comment.date} {comment.time}</div>
                        </div>
                      </div>
                      <div className="text-white">{comment.content}</div>
                    </div>
                  ))}
                </div>

                {/* New Comment Input */}
                <div className="flex gap-3 items-stretch">
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="답변을 입력하세요..."
                      className="w-full px-4 py-3 bg-white/20 text-white rounded-xl border border-white/30 placeholder-white/50 h-full"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                    />
                  </div>
                  <button
                    onClick={handleSendComment}
                    disabled={!newComment.trim()}
                    className="shrink-0 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                  >
                    <Send className="w-4 h-4" />
                    <span>전송</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 rounded-2xl p-12 backdrop-blur-sm text-center">
                <MessageSquare className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/50">문의를 선택해주세요</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
