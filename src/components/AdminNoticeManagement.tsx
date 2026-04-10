import { useState } from 'react';
import { motion, AnimatePresence } from './motion';
import { ChevronLeft, Plus, Edit2, Trash2, Eye, Search } from './icons';

type Notice = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  views: number;
  isImportant: boolean;
};

type AdminNoticeManagementProps = {
  onBack: () => void;
};

export default function AdminNoticeManagement({ onBack }: AdminNoticeManagementProps) {
  const [notices, setNotices] = useState<Notice[]>([
    {
      id: 'N001',
      title: '시스템 점검 안내',
      content: '2024년 11월 30일 새벽 2시부터 4시까지 시스템 점검이 예정되어 있습니다.',
      createdAt: '2024-11-20',
      views: 1234,
      isImportant: true,
    },
    {
      id: 'N002',
      title: '새로운 피규어 시리즈 출시',
      content: '원피스 신규 시리즈가 출시되었습니다.',
      createdAt: '2024-11-18',
      views: 856,
      isImportant: false,
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isImportant: false,
  });

  const handleCreate = () => {
    const newNotice: Notice = {
      id: `N${String(notices.length + 1).padStart(3, '0')}`,
      title: formData.title,
      content: formData.content,
      createdAt: new Date().toISOString().split('T')[0],
      views: 0,
      isImportant: formData.isImportant,
    };
    setNotices([newNotice, ...notices]);
    setFormData({ title: '', content: '', isImportant: false });
    setShowCreateModal(false);
  };

  const handleUpdate = () => {
    if (!editingNotice) return;
    setNotices(notices.map(n => 
      n.id === editingNotice.id 
        ? { ...editingNotice, ...formData }
        : n
    ));
    setEditingNotice(null);
    setFormData({ title: '', content: '', isImportant: false });
  };

  const handleDelete = (id: string) => {
    if (confirm('정말로 삭제하시겠습니까?')) {
      setNotices(notices.filter(n => n.id !== id));
    }
  };

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      isImportant: notice.isImportant,
    });
  };

  const filteredNotices = notices.filter(n =>
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
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
              <h1 className="text-white text-2xl">공지사항 관리</h1>
            </div>
            <button
              onClick={() => {
                setFormData({ title: '', content: '', isImportant: false });
                setEditingNotice(null);
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>새 공지 작성</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="공지사항 검색..."
              className="w-full pl-12 pr-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Notice List */}
        <div className="px-6 space-y-3">
          {filteredNotices.length === 0 ? (
            <div className="bg-white/10 rounded-2xl p-12 text-center">
              <p className="text-white/50">공지사항이 없습니다</p>
            </div>
          ) : (
            filteredNotices.map((notice, index) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {notice.isImportant && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded">
                          중요
                        </span>
                      )}
                      <h3 className="text-white text-lg">{notice.title}</h3>
                    </div>
                    <p className="text-white/70 text-sm mb-3 line-clamp-2">{notice.content}</p>
                    <div className="flex items-center gap-4 text-white/50 text-xs">
                      <span>작성일: {notice.createdAt}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {notice.views.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(notice)}
                      className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => handleDelete(notice.id)}
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
        {(showCreateModal || editingNotice) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowCreateModal(false);
              setEditingNotice(null);
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
                {editingNotice ? '공지사항 수정' : '새 공지사항 작성'}
              </h2>

              <div className="space-y-4">
                {/* Important Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isImportant"
                    checked={formData.isImportant}
                    onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20"
                  />
                  <label htmlFor="isImportant" className="text-white">중요 공지로 표시</label>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">제목</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="공지사항 제목을 입력하세요"
                    className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">내용</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="공지사항 내용을 입력하세요"
                    rows={8}
                    className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingNotice(null);
                  }}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                >
                  취소
                </button>
                <button
                  onClick={editingNotice ? handleUpdate : handleCreate}
                  disabled={!formData.title.trim() || !formData.content.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingNotice ? '수정' : '등록'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
