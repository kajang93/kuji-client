import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from './motion';
import { ChevronLeft, Bell, Pin, X } from './icons';
import { fetchPosts } from '../api/community';
import { Post } from '../shared-types';
import { toast } from 'sonner';

type NoticeProps = {
  onBack: () => void;
};

export default function Notice({ onBack }: NoticeProps) {
  const [selectedNotice, setSelectedNotice] = useState<Post | null>(null);
  const [notices, setNotices] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPosts('NOTICE');
      
      let fetchedNotices: Post[] = [];
      // 서버 응답이 배열이 아닐 경우(Page 객체 등) 대응
      if (Array.isArray(data)) {
        fetchedNotices = data;
      } else if (data && typeof data === 'object' && Array.isArray((data as any).content)) {
        fetchedNotices = (data as any).content;
      }
      
      const brochureNotice: Post = {
        id: 'brochure' as any,
        title: '🎉 온라인 쿠지 플랫폼 오픈 안내 (브로셔)',
        content: '온라인 쿠지 플랫폼 서비스 안내 브로셔입니다.',
        type: 'NOTICE',
        authorId: 0,
        viewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setNotices([brochureNotice, ...fetchedNotices]);
    } catch (error) {
      toast.error('공지사항을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-6">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-blue-900 to-cyan-900 border-b-2 border-cyan-400/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-xl text-center font-bold">공지사항</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-2xl mx-auto space-y-3">
        {isLoading ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">공지사항 로딩 중...</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <p className="text-white/30">공지사항이 없습니다</p>
          </div>
        ) : (
          notices.map((notice, index) => (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedNotice(notice)}
              className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-lg hover:border-cyan-400/50 transition-all cursor-pointer group"
            >
              <div className="p-5">
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-500/40 transition-colors">
                    <Bell className="w-5 h-5 text-cyan-300" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white text-lg font-bold flex-1 truncate group-hover:text-cyan-300 transition-colors">
                        {notice.title}
                      </h3>
                    </div>
                    <p className="text-slate-500 text-xs">
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="text-slate-400 text-sm line-clamp-2 pl-14">
                  {notice.content}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Notice Detail Modal */}
      <AnimatePresence>
        {selectedNotice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedNotice(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 rounded-3xl p-8 max-w-lg w-full border-2 border-cyan-400/50 shadow-2xl relative max-h-[80vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedNotice(null)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              <div className="mb-8">
                <div className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">공지사항</div>
                <h2 className="text-white text-2xl font-bold mb-3">{selectedNotice.title}</h2>
                <div className="text-slate-500 text-sm">
                  {new Date(selectedNotice.createdAt).toLocaleString()}
                </div>
              </div>

              {selectedNotice.id === 'brochure' ? (
                <div className="w-full h-[60vh] bg-black rounded-2xl overflow-hidden border border-white/10">
                  <iframe 
                    src="/brochure.html" 
                    className="w-full h-full border-0"
                    title="온라인 쿠지 플랫폼 브로셔"
                  />
                </div>
              ) : (
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="text-white/90 whitespace-pre-line leading-relaxed">
                    {selectedNotice.content}
                  </div>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedNotice(null)}
                className="w-full mt-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
              >
                닫기
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
