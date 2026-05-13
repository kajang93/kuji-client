import { useState, useEffect } from 'react';
import { motion } from './motion';
import { ChevronLeft, MessageSquare, Send, CheckCircle, Clock, Search } from './icons';
import type { Inquiry } from '../shared-types';
import { fetchAllInquiries, answerInquiry } from '../api/admin';
import { toast } from 'sonner';

type AdminInquiryManagementProps = {
  onBack: () => void;
};

export default function AdminInquiryManagement({ onBack }: AdminInquiryManagementProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [newComment, setNewComment] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'WAITING' | 'COMPLETED'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAllInquiries();
  }, []);

  const loadAllInquiries = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllInquiries();
      setInquiries(data);
      if (data.length > 0) {
        setSelectedInquiry(data[0]);
      }
    } catch (error: any) {
      toast.error(error.message || '문의 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInquiries = inquiries.filter(inq => {
    const matchesStatus = filterStatus === 'all' || inq.status === filterStatus;
    const matchesSearch = inq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (inq.content || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleSendComment = async () => {
    if (!selectedInquiry || !newComment.trim()) return;
    
    try {
      await answerInquiry(selectedInquiry.id, newComment);
      toast.success('답변이 등록되었습니다.');
      setNewComment('');
      // Refresh list to show updated status and answer
      await loadAllInquiries();
    } catch (error: any) {
      toast.error(error.message || '답변 등록에 실패했습니다.');
    }
  };

  const pendingCount = inquiries.filter(i => i.status === 'WAITING').length;

  return (
    <div className="min-h-screen bg-slate-900 pb-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={onBack}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-white text-2xl font-bold">1:1 문의 관리</h1>
              <p className="text-slate-400 text-sm">
                답변대기 {pendingCount}건 / 전체 {inquiries.length}건
              </p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="제목, 내용으로 검색..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 text-white rounded-xl border border-white/10 placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg transition-all text-sm font-bold ${filterStatus === 'all' ? 'bg-rose-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
              >
                전체
              </button>
              <button
                onClick={() => setFilterStatus('WAITING')}
                className={`px-4 py-2 rounded-lg transition-all text-sm font-bold ${filterStatus === 'WAITING' ? 'bg-amber-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
              >
                답변대기 ({pendingCount})
              </button>
              <button
                onClick={() => setFilterStatus('COMPLETED')}
                className={`px-4 py-2 rounded-lg transition-all text-sm font-bold ${filterStatus === 'COMPLETED' ? 'bg-cyan-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
              >
                답변완료
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inquiry List */}
          <div className="lg:col-span-1 space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto no-scrollbar">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500 text-sm">로딩 중...</p>
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="bg-white/5 rounded-xl p-8 text-center border border-white/5">
                <MessageSquare className="w-12 h-12 text-white/10 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">문의가 없습니다</p>
              </div>
            ) : (
              filteredInquiries.map((inquiry) => (
                <button
                  key={inquiry.id}
                  onClick={() => setSelectedInquiry(inquiry)}
                  className={`w-full text-left p-4 rounded-2xl transition-all border ${
                    selectedInquiry?.id === inquiry.id
                      ? 'bg-rose-500/20 border-rose-500 shadow-lg shadow-rose-500/10'
                      : 'bg-white/5 border-transparent hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {inquiry.status === 'WAITING' ? (
                        <Clock className="w-4 h-4 text-amber-500" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-cyan-500" />
                      )}
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        inquiry.status === 'WAITING' ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'
                      }`}>
                        {inquiry.statusDescription}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">#{inquiry.id}</span>
                  </div>
                  <div className="text-white text-sm font-bold mb-1 truncate">{inquiry.title}</div>
                  <div className="text-slate-400 text-xs truncate mb-2">{inquiry.content}</div>
                  <div className="text-slate-500 text-[10px]">{new Date(inquiry.createdAt).toLocaleString()}</div>
                </button>
              ))
            )}
          </div>

          {/* Inquiry Detail */}
          <div className="lg:col-span-2">
            {selectedInquiry ? (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm h-full flex flex-col">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded">
                        {selectedInquiry.categoryDescription}
                      </span>
                      <h2 className="text-white text-xl font-bold">{selectedInquiry.title}</h2>
                    </div>
                    <p className="text-slate-500 text-xs">
                      작성일: {new Date(selectedInquiry.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedInquiry.status === 'WAITING' ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'
                  }`}>
                    {selectedInquiry.statusDescription}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 mb-8 pr-2 no-scrollbar">
                  {/* Original Inquiry Content */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-4">문의 내용</div>
                    <div className="text-white leading-relaxed whitespace-pre-wrap">{selectedInquiry.content}</div>
                  </div>

                  {/* Answer Section */}
                  {selectedInquiry.answerContent ? (
                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-rose-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          관리자 답변
                        </div>
                        <span className="text-slate-500 text-[10px]">
                          {selectedInquiry.answeredAt && new Date(selectedInquiry.answeredAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-white leading-relaxed whitespace-pre-wrap">{selectedInquiry.answerContent}</div>
                    </div>
                  ) : (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-8 text-center">
                      <Clock className="w-8 h-8 text-amber-500/50 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">아직 등록된 답변이 없습니다.</p>
                    </div>
                  )}
                </div>

                {/* New Answer Input */}
                <div className="mt-auto pt-6 border-t border-white/5">
                  <div className="flex gap-3 items-stretch">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={selectedInquiry.status === 'COMPLETED' ? "답변을 수정하시겠습니까?" : "답변 내용을 입력하세요..."}
                      className="flex-1 px-5 py-4 bg-white/5 text-white rounded-2xl border border-white/10 placeholder-white/20 focus:outline-none focus:border-rose-500 resize-none transition-all"
                      rows={3}
                    />
                    <button
                      onClick={handleSendComment}
                      disabled={!newComment.trim()}
                      className="shrink-0 px-8 py-4 bg-rose-500 hover:bg-rose-600 rounded-2xl text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-1 shadow-lg shadow-rose-500/20"
                    >
                      <Send className="w-5 h-5" />
                      <span className="text-xs">전송</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-12 h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <MessageSquare className="w-10 h-10 text-white/10" />
                </div>
                <h3 className="text-white text-lg font-bold mb-2">선택된 문의가 없습니다</h3>
                <p className="text-slate-500 text-sm">왼쪽 목록에서 관리할 문의를 선택해주세요.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
