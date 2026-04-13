import { useState, useEffect } from 'react';
import { motion } from './motion';
import { ChevronLeft, MessageSquare, Send, Edit2, Trash2, CheckCircle, Clock } from './icons';
import type { Inquiry } from '@/shared-types';

type SellerInquiriesProps = {
  onBack: () => void;
  inquiries: Inquiry[];
  onAddComment: (inquiryId: string, content: string) => void;
  onEditComment: (inquiryId: string, commentId: string, content: string) => void;
  onDeleteComment: (inquiryId: string, commentId: string) => void;
  onUpdateStatus: (inquiryId: string, status: 'pending' | 'answered' | 'closed') => void;
};

export default function SellerInquiries({ 
  onBack, 
  inquiries,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onUpdateStatus,
}: SellerInquiriesProps) {
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'answered'>('all');

  // Sort by most recent first
  const sortedInquiries = [...inquiries].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });

  const filteredInquiries = sortedInquiries.filter(inq => {
    if (filterStatus === 'all') return true;
    return inq.status === filterStatus;
  });

  // Auto-select first inquiry if none selected
  if (!selectedInquiry && filteredInquiries.length > 0) {
    setSelectedInquiry(filteredInquiries[0]);
  }

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

  const handleEditComment = (commentId: string) => {
    if (!selectedInquiry || !editCommentContent.trim()) return;
    onEditComment(selectedInquiry.id, commentId, editCommentContent);
    setEditingCommentId(null);
    setEditCommentContent('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pb-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 px-4 pt-4 pb-3">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={onBack}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-2xl text-white">문의 관리</h1>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition-all text-sm ${filterStatus === 'all' ? 'bg-white text-purple-900' : 'bg-white/20 text-white hover:bg-white/30'}`}
            >
              전체
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all text-sm ${filterStatus === 'pending' ? 'bg-yellow-400 text-purple-900' : 'bg-white/20 text-white hover:bg-white/30'}`}
            >
              미답변
            </button>
            <button
              onClick={() => setFilterStatus('answered')}
              className={`px-3 py-1.5 rounded-lg transition-all text-sm ${filterStatus === 'answered' ? 'bg-green-400 text-purple-900' : 'bg-white/20 text-white hover:bg-white/30'}`}
            >
              답변완료
            </button>
          </div>

          {/* Inquiry Tabs */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
            {filteredInquiries.map((inquiry) => (
              <button
                key={inquiry.id}
                onClick={() => setSelectedInquiry(inquiry)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg transition-all text-sm ${
                  selectedInquiry?.id === inquiry.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  {inquiry.status === 'pending' ? (
                    <Clock className="w-3 h-3 text-yellow-400" />
                  ) : (
                    <CheckCircle className="w-3 h-3 text-green-400" />
                  )}
                  <span className="whitespace-nowrap">{inquiry.subject}</span>
                  {inquiry.isNew && (
                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">NEW</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Inquiry Detail */}
        <div className="px-4">
          {selectedInquiry ? (
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg text-white">{selectedInquiry.subject}</h2>
                <select
                  value={selectedInquiry.status}
                  onChange={(e) => {
                    onUpdateStatus(selectedInquiry.id, e.target.value as any);
                    setSelectedInquiry({ ...selectedInquiry, status: e.target.value as any });
                  }}
                  className="px-2 py-1 rounded-lg bg-white/20 text-white border border-white/30 text-sm"
                >
                  <option value="pending" className="bg-purple-900">미답변</option>
                  <option value="answered" className="bg-purple-900">답변완료</option>
                  <option value="closed" className="bg-purple-900">종료</option>
                </select>
              </div>

              {/* Original Inquiry */}
              <div className="bg-white/10 rounded-xl p-3 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm">
                    {selectedInquiry.customerName[0]}
                  </div>
                  <div>
                    <div className="text-white text-sm">{selectedInquiry.customerName}</div>
                    <div className="text-white/60 text-xs">{selectedInquiry.createdAt}</div>
                  </div>
                </div>
                <div className="text-white text-sm">{selectedInquiry.content}</div>
                <div className="text-white/50 text-xs mt-1">주문번호: {selectedInquiry.orderNumber}</div>
              </div>

              {/* Comments */}
              <div className="space-y-2 mb-3 max-h-[50vh] overflow-y-auto">
                {selectedInquiry.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`rounded-xl p-3 ${
                      comment.author === 'seller'
                        ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 ml-6'
                        : 'bg-white/10 mr-6'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full ${
                          comment.author === 'seller' 
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                            : 'bg-gradient-to-br from-pink-400 to-purple-500'
                        } flex items-center justify-center text-white text-xs`}>
                          {comment.authorName[0]}
                        </div>
                        <div>
                          <div className="text-white text-sm">{comment.authorName}</div>
                          <div className="text-white/60 text-xs">{comment.date} {comment.time}</div>
                        </div>
                      </div>
                      {comment.author === 'seller' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditCommentContent(comment.content);
                            }}
                            className="p-1 hover:bg-white/20 rounded transition-colors"
                          >
                            <Edit2 className="w-3 h-3 text-white" />
                          </button>
                          <button
                            onClick={() => onDeleteComment(selectedInquiry.id, comment.id)}
                            className="p-1 hover:bg-white/20 rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {editingCommentId === comment.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editCommentContent}
                          onChange={(e) => setEditCommentContent(e.target.value)}
                          className="flex-1 px-3 py-2 bg-white/20 text-white rounded-lg border border-white/30 placeholder-white/50 text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && handleEditComment(comment.id)}
                        />
                        <button
                          onClick={() => handleEditComment(comment.id)}
                          className="px-3 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white transition-colors text-sm"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditCommentContent('');
                          }}
                          className="px-3 py-2 bg-gray-500 hover:bg-gray-600 rounded-lg text-white transition-colors text-sm"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <div className="text-white text-sm">{comment.content}</div>
                    )}
                  </div>
                ))}
              </div>

              {/* New Comment Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="답변을 입력하세요..."
                  className="flex-1 px-3 py-2.5 bg-white/20 text-white rounded-xl border border-white/30 placeholder-white/50 text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                />
                <button
                  onClick={handleSendComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span className="text-sm">전송</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <div className="flex items-center justify-center text-white/60">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <div className="text-sm">문의가 없습니다</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}