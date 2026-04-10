import { useState } from 'react';
import { motion, AnimatePresence } from './motion';
import { Users, MessageSquare, Bell, Calendar, FileText, Settings as SettingsIcon, BarChart, Layout, Plus, Send, ChevronLeft, X } from './icons';

type AdminDashboardProps = {
  onNavigate: (screen: 'noticeManagement' | 'eventManagement' | 'inquiryManagement' | 'users' | 'statistics' | 'mainBanner' | 'userManagement') => void;
};

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [activeQuickAction, setActiveQuickAction] = useState<'notice' | 'event' | 'inquiry' | null>(null);

  // Quick Notice State
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', isImportant: false });

  // Quick Event State
  const [eventForm, setEventForm] = useState({ title: '', description: '', startDate: '', endDate: '' });

  // Quick Inquiry State
  const [inquiryReply, setInquiryReply] = useState('');
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);

  // Mock Pending Inquiries for Quick Action
  const [quickInquiries, setQuickInquiries] = useState([
    { id: '1', user: '김철수', subject: '배송 언제 되나요?', date: '2024-11-27', content: '주문번호 12345 배송 조회 부탁드립니다.' },
    { id: '2', user: '박영희', subject: '포인트 적립 문의', date: '2024-11-26', content: '어제 구매했는데 포인트가 아직 안 들어왔어요.' },
    { id: '3', user: '이민수', subject: '상품 불량 신고', date: '2024-11-25', content: '도착한 상품 박스가 찌그러져 있습니다.' },
  ]);

  const stats = [
    { label: '전체 사용자', value: '1,234', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: '미답변 문의', value: String(quickInquiries.length), icon: MessageSquare, color: 'from-yellow-500 to-orange-500' },
    { label: '진행중 이벤트', value: '5', icon: Calendar, color: 'from-purple-500 to-pink-500' },
    { label: '공지사항', value: '12', icon: Bell, color: 'from-green-500 to-emerald-500' },
  ];

  const menuItems = [
    { 
      id: 'noticeManagement' as const, 
      label: '공지사항 관리', 
      icon: Bell, 
      description: '공지사항 등록 및 수정',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      id: 'eventManagement' as const, 
      label: '이벤트 관리', 
      icon: Calendar, 
      description: '이벤트 등록 및 수정',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      id: 'inquiryManagement' as const, 
      label: '1:1 문의 관리', 
      icon: MessageSquare, 
      description: '고객 문의 답변',
      color: 'from-yellow-500 to-orange-500'
    },
    { 
      id: 'users' as const, 
      label: '사용자 관리', 
      icon: Users, 
      description: '회원 정보 관리',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      id: 'statistics' as const, 
      label: '통계 및 분석', 
      icon: BarChart, 
      description: '사용자/매출 통계',
      color: 'from-red-500 to-pink-500'
    },
    { 
      id: 'mainBanner' as const, 
      label: '메인 배너 관리', 
      icon: Layout, 
      description: '메인 배너 등록 및 수정',
      color: 'from-indigo-500 to-violet-500'
    },
    { 
      id: 'userManagement' as const, 
      label: '사용자 권한 관리', 
      icon: SettingsIcon, 
      description: '사용자 권한 설정',
      color: 'from-gray-500 to-gray-900'
    },
  ];

  const handleNoticeSubmit = () => {
    alert('공지사항이 등록되었습니다.');
    setNoticeForm({ title: '', content: '', isImportant: false });
    setActiveQuickAction(null);
  };

  const handleEventSubmit = () => {
    alert('이벤트가 등록되었습니다.');
    setEventForm({ title: '', description: '', startDate: '', endDate: '' });
    setActiveQuickAction(null);
  };

  const handleInquirySubmit = () => {
    if (!selectedInquiryId) return;
    alert('답변이 전송되었습니다.');
    setQuickInquiries(prev => prev.filter(i => i.id !== selectedInquiryId));
    setSelectedInquiryId(null);
    setInquiryReply('');
    // If no more inquiries, close modal? Or stay? keeping it open for next one is better but maybe clear selection
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pb-6">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-3xl mb-2">관리자 대시보드</h1>
          <p className="text-white/70">앱 운영 관리 및 모니터링</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 shadow-lg`}
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="w-8 h-8 text-white" />
                <div className="text-white text-3xl" style={{ fontWeight: 700 }}>
                  {stat.value}
                </div>
              </div>
              <div className="text-white/90 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              onClick={() => onNavigate(item.id)}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 bg-gradient-to-br ${item.color} rounded-xl group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-lg mb-1">{item.label}</h3>
                  <p className="text-white/60 text-sm">{item.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h3 className="text-white text-lg mb-4">빠른 작업</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button 
              onClick={() => setActiveQuickAction('notice')}
              className="py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <div className="text-center">공지사항 작성</div>
            </button>
            <button 
              onClick={() => setActiveQuickAction('event')}
              className="py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <div className="text-center">이벤트 등록</div>
            </button>
            <button 
              onClick={() => setActiveQuickAction('inquiry')}
              className="py-3 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <div className="text-center">문의 답변하기</div>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Modals */}
      <AnimatePresence>
        {activeQuickAction && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setActiveQuickAction(null)}>
            
            {/* Notice Modal */}
            {activeQuickAction === 'notice' && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-6 max-w-2xl w-full border border-white/20 max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-white text-xl">빠른 공지사항 작성</h2>
                  <button onClick={() => setActiveQuickAction(null)} className="p-2 hover:bg-white/10 rounded-full">
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="quick-important"
                      checked={noticeForm.isImportant}
                      onChange={(e) => setNoticeForm({ ...noticeForm, isImportant: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20"
                    />
                    <label htmlFor="quick-important" className="text-white">중요 공지로 표시</label>
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">제목</label>
                    <input
                      type="text"
                      value={noticeForm.title}
                      onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="공지 제목 입력"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">내용</label>
                    <textarea
                      value={noticeForm.content}
                      onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                      rows={5}
                      className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                      placeholder="공지 내용 입력"
                    />
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setActiveQuickAction(null)} className="flex-1 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20">취소</button>
                    <button 
                      onClick={handleNoticeSubmit}
                      disabled={!noticeForm.title.trim() || !noticeForm.content.trim()}
                      className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl disabled:opacity-50"
                    >
                      등록
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Event Modal */}
            {activeQuickAction === 'event' && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-2xl p-6 max-w-2xl w-full border border-white/20 max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-white text-xl">빠른 이벤트 등록</h2>
                  <button onClick={() => setActiveQuickAction(null)} className="p-2 hover:bg-white/10 rounded-full">
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">이벤트 제목</label>
                    <input
                      type="text"
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="이벤트 제목 입력"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">설명</label>
                    <textarea
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                      placeholder="이벤트 설명 입력"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 text-sm mb-2">시작일</label>
                      <input
                        type="date"
                        value={eventForm.startDate}
                        onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm mb-2">종료일</label>
                      <input
                        type="date"
                        value={eventForm.endDate}
                        onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setActiveQuickAction(null)} className="flex-1 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20">취소</button>
                    <button 
                      onClick={handleEventSubmit}
                      disabled={!eventForm.title || !eventForm.startDate || !eventForm.endDate}
                      className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl disabled:opacity-50"
                    >
                      등록
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Inquiry Modal */}
            {activeQuickAction === 'inquiry' && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-purple-900 to-orange-900 rounded-2xl p-6 max-w-4xl w-full border border-white/20 max-h-[90vh] overflow-y-auto flex flex-col md:flex-row gap-6"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex-1 space-y-4 border-r border-white/10 pr-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-white text-xl">미답변 문의 ({quickInquiries.length})</h2>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {quickInquiries.length === 0 ? (
                      <p className="text-white/50 text-center py-8">미답변 문의가 없습니다.</p>
                    ) : (
                      quickInquiries.map(inquiry => (
                        <button
                          key={inquiry.id}
                          onClick={() => setSelectedInquiryId(inquiry.id)}
                          className={`w-full text-left p-3 rounded-xl transition-all ${selectedInquiryId === inquiry.id ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-white/10 hover:bg-white/20 border border-transparent'}`}
                        >
                          <div className="flex justify-between mb-1">
                            <span className="text-white font-bold">{inquiry.user}</span>
                            <span className="text-white/50 text-xs">{inquiry.date}</span>
                          </div>
                          <div className="text-white/90 text-sm truncate">{inquiry.subject}</div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex-1 flex flex-col h-full">
                  <div className="flex justify-end mb-2 md:hidden">
                    <button onClick={() => setActiveQuickAction(null)} className="p-2 hover:bg-white/10 rounded-full">
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  {selectedInquiryId ? (
                    <>
                      <div className="bg-white/10 rounded-xl p-4 mb-4 flex-1">
                        <h3 className="text-white font-bold mb-2">
                          {quickInquiries.find(i => i.id === selectedInquiryId)?.subject}
                        </h3>
                        <p className="text-white/80 text-sm whitespace-pre-wrap">
                          {quickInquiries.find(i => i.id === selectedInquiryId)?.content}
                        </p>
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">답변 내용</label>
                        <textarea
                          value={inquiryReply}
                          onChange={(e) => setInquiryReply(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none mb-4"
                          placeholder="답변을 입력하세요..."
                        />
                        <button 
                          onClick={handleInquirySubmit}
                          disabled={!inquiryReply.trim()}
                          className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl disabled:opacity-50 hover:shadow-lg transition-all"
                        >
                          답변 전송
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-white/50">
                      <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
                      <p>문의를 선택해주세요</p>
                    </div>
                  )}
                  <button onClick={() => setActiveQuickAction(null)} className="mt-4 w-full py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 md:block hidden">
                    닫기
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}