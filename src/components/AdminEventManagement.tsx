import { useState } from 'react';
import { motion, AnimatePresence } from './motion';
import { ChevronLeft, Plus, Edit2, Trash2, Calendar as CalendarIcon, Search } from './icons';

type Event = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'ended';
  participants: number;
};

type AdminEventManagementProps = {
  onBack: () => void;
};

export default function AdminEventManagement({ onBack }: AdminEventManagementProps) {
  const [events, setEvents] = useState<Event[]>([
    {
      id: 'E001',
      title: '신규 가입 이벤트',
      description: '신규 가입 시 5,000 포인트 지급',
      startDate: '2024-11-01',
      endDate: '2024-12-31',
      status: 'ongoing',
      participants: 456,
    },
    {
      id: 'E002',
      title: '원피스 특별 이벤트',
      description: '원피스 시리즈 구매 시 추가 포인트 적립',
      startDate: '2024-11-15',
      endDate: '2024-11-30',
      status: 'ongoing',
      participants: 234,
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const getEventStatus = (startDate: string, endDate: string): 'upcoming' | 'ongoing' | 'ended' => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'ongoing';
  };

  const handleCreate = () => {
    const status = getEventStatus(formData.startDate, formData.endDate);
    const newEvent: Event = {
      id: `E${String(events.length + 1).padStart(3, '0')}`,
      title: formData.title,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status,
      participants: 0,
    };
    setEvents([newEvent, ...events]);
    setFormData({ title: '', description: '', startDate: '', endDate: '' });
    setShowCreateModal(false);
  };

  const handleUpdate = () => {
    if (!editingEvent) return;
    const status = getEventStatus(formData.startDate, formData.endDate);
    setEvents(events.map(e => 
      e.id === editingEvent.id 
        ? { ...editingEvent, ...formData, status }
        : e
    ));
    setEditingEvent(null);
    setFormData({ title: '', description: '', startDate: '', endDate: '' });
  };

  const handleDelete = (id: string) => {
    if (confirm('정말로 삭제하시겠습니까?')) {
      setEvents(events.filter(e => e.id !== id));
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded">예정</span>;
      case 'ongoing':
        return <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded">진행중</span>;
      case 'ended':
        return <span className="px-2 py-0.5 bg-gray-500 text-white text-xs rounded">종료</span>;
      default:
        return null;
    }
  };

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pb-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <h1 className="text-white text-2xl">이벤트 관리</h1>
            </div>
            <button
              onClick={() => {
                setFormData({ title: '', description: '', startDate: '', endDate: '' });
                setEditingEvent(null);
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>새 이벤트 등록</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="이벤트 검색..."
              className="w-full pl-12 pr-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Event List */}
        <div className="px-6 space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="bg-white/10 rounded-2xl p-12 text-center">
              <p className="text-white/50">이벤트가 없습니다</p>
            </div>
          ) : (
            filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(event.status)}
                      <h3 className="text-white text-lg">{event.title}</h3>
                    </div>
                    <p className="text-white/70 text-sm mb-3">{event.description}</p>
                    <div className="flex items-center gap-4 text-white/50 text-xs">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {event.startDate} ~ {event.endDate}
                      </span>
                      <span>참여자: {event.participants.toLocaleString()}명</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(event)}
                      className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || editingEvent) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowCreateModal(false);
              setEditingEvent(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
            >
              <h2 className="text-white text-xl mb-6">
                {editingEvent ? '이벤트 수정' : '새 이벤트 등록'}
              </h2>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">이벤트 제목</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="이벤트 제목을 입력하세요"
                    className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">설명</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="이벤트 설명을 입력하세요"
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">시작일</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">종료일</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingEvent(null);
                  }}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                >
                  취소
                </button>
                <button
                  onClick={editingEvent ? handleUpdate : handleCreate}
                  disabled={!formData.title.trim() || !formData.description.trim() || !formData.startDate || !formData.endDate}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingEvent ? '수정' : '등록'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
