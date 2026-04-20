import { useState } from 'react';
import { motion, AnimatePresence } from './motion';
import { ChevronLeft, Bell, Pin, X } from './icons';

type NoticeProps = {
  onBack: () => void;
};

type NoticeItem = {
  id: string;
  title: string;
  content: string;
  date: string;
  isPinned?: boolean;
  isNew?: boolean;
};

export default function Notice({ onBack }: NoticeProps) {
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);

  const notices: NoticeItem[] = [];

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-blue-900 to-cyan-900 border-b-2 border-cyan-400/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-xl text-center">공지사항</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-2xl mx-auto space-y-3">
        {notices.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/50">공지사항이 없습니다</p>
          </div>
        ) : (
          notices.map((notice, index) => (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedNotice(notice)}
              className={`bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-2xl border shadow-lg hover:shadow-2xl transition-all cursor-pointer ${
                notice.isPinned
                  ? 'border-yellow-400/50 hover:border-yellow-400'
                  : 'border-white/20 hover:border-cyan-400/50'
              }`}
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  {/* Pin or Bell Icon */}
                  {notice.isPinned ? (
                    <div className="w-8 h-8 bg-yellow-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Pin className="w-4 h-4 text-yellow-300" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-cyan-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bell className="w-4 h-4 text-cyan-300" />
                    </div>
                  )}

                  {/* Title & Badge */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white text-lg flex-1">{notice.title}</h3>
                      {notice.isNew && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full flex-shrink-0">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-white/60 text-sm">{notice.date}</p>
                  </div>
                </div>

                {/* Preview */}
                <div className="text-white/70 text-sm line-clamp-2 pl-11">
                  {notice.content.split('\n')[0]}
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedNotice(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-lg w-full border-2 border-cyan-400/50 shadow-2xl relative max-h-[80vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedNotice(null)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  {selectedNotice.isPinned ? (
                    <div className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-full">
                      <div className="flex items-center gap-1 text-yellow-300 text-sm">
                        <Pin className="w-3 h-3" />
                        <span>고정</span>
                      </div>
                    </div>
                  ) : null}
                  {selectedNotice.isNew && (
                    <span className="px-3 py-1 bg-red-500 text-white text-sm rounded-full">
                      NEW
                    </span>
                  )}
                </div>
                <h2 className="text-white text-2xl mb-3">{selectedNotice.title}</h2>
                <div className="text-white/60 text-sm">{selectedNotice.date}</div>
              </div>

              {/* Content */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="text-white/90 whitespace-pre-line leading-relaxed">
                  {selectedNotice.content}
                </div>
              </div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedNotice(null)}
                className="w-full mt-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl hover:from-cyan-400 hover:to-blue-400 transition-colors"
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
