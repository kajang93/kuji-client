import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from './motion';
import { ChevronLeft, Plus, Edit2, Trash2, Eye, Search } from './icons';
import { fetchNotices, createNotice, updateNotice, deleteNotice } from '../api/admin';
import { Post } from '../shared-types';
import { toast } from 'sonner';

type AdminNoticeManagementProps = {
  onBack: () => void;
};

export default function AdminNoticeManagement({ onBack }: AdminNoticeManagementProps) {
  const [notices, setNotices] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Post | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    setIsLoading(true);
    try {
      const data = await fetchNotices();
      setNotices(data);
    } catch (error: any) {
      toast.error(error.message || '공지사항을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await createNotice(formData.title, formData.content);
      toast.success('공지사항이 등록되었습니다.');
      setShowCreateModal(false);
      setFormData({ title: '', content: '' });
      loadNotices();
    } catch (error: any) {
      toast.error(error.message || '등록 중 오류가 발생했습니다.');
    }
  };

  const handleUpdate = async () => {
    if (!editingNotice) return;
    try {
      await updateNotice(editingNotice.id, formData.title, formData.content);
      toast.success('공지사항이 수정되었습니다.');
      setEditingNotice(null);
      setFormData({ title: '', content: '' });
      loadNotices();
    } catch (error: any) {
      toast.error(error.message || '수정 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말로 삭제하시겠습니까?')) return;
    try {
      await deleteNotice(id);
      toast.success('삭제되었습니다.');
      loadNotices();
    } catch (error: any) {
      toast.error(error.message || '삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = (notice: Post) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
    });
  };

  const filteredNotices = notices.filter(n =>
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 pb-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <h1 className="text-white text-2xl font-bold">공지사항 관리</h1>
            </div>
            <button
              onClick={() => {
                setFormData({ title: '', content: '' });
                setEditingNotice(null);
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl hover:shadow-[0_0_20px_rgba(225,29,72,0.3)] transition-all font-bold"
            >
              <Plus className="w-5 h-5" />
              <span>새 공지 작성</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="공지사항 검색..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 text-white rounded-xl border border-white/10 placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            />
          </div>
        </div>

        {/* Notice List */}
        <div className="px-6 py-8 space-y-4">
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500">공지사항을 불러오는 중...</p>
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="bg-white/5 rounded-3xl p-20 text-center border border-white/5">
              <p className="text-slate-500">등록된 공지사항이 없습니다</p>
            </div>
          ) : (
            filteredNotices.map((notice, index) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/5 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white text-xl font-bold mb-2 group-hover:text-rose-400 transition-colors">
                      {notice.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">{notice.content}</p>
                    <div className="flex items-center gap-4 text-slate-500 text-xs font-medium">
                      <span className="bg-white/5 px-2 py-1 rounded">#{notice.id}</span>
                      <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {notice.viewCount?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(notice)}
                      className="p-3 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-white rounded-xl transition-all"
                      title="수정"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(notice.id)}
                      className="p-3 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl transition-all"
                      title="삭제"
                    >
                      <Trash2 className="w-5 h-5" />
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
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
              className="bg-slate-900 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl"
            >
              <h2 className="text-white text-2xl font-bold mb-8">
                {editingNotice ? '공지사항 수정' : '새 공지사항 작성'}
              </h2>

              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">제목</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="공지사항 제목을 입력하세요"
                    className="w-full px-5 py-4 bg-white/5 text-white rounded-2xl border border-white/10 placeholder-white/20 focus:outline-none focus:border-rose-500 transition-all"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">내용</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="공지사항 내용을 입력하세요"
                    rows={10}
                    className="w-full px-5 py-4 bg-white/5 text-white rounded-2xl border border-white/10 placeholder-white/20 focus:outline-none focus:border-rose-500 resize-none transition-all"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 mt-10">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingNotice(null);
                  }}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all font-bold"
                >
                  취소
                </button>
                <button
                  onClick={editingNotice ? handleUpdate : handleCreate}
                  disabled={!formData.title.trim() || !formData.content.trim()}
                  className="flex-1 py-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg shadow-rose-500/20"
                >
                  {editingNotice ? '수정하기' : '등록하기'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
