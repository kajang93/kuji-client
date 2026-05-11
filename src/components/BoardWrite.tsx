import { useState } from 'react';
import { motion } from './motion';
import { ChevronLeft, Send, Image as ImageIcon, Check } from './icons';
import { PostCategory, PostCreateRequest } from '../shared-types';
import { createPost } from '../api/community';
import { toast } from 'sonner';

interface BoardWriteProps {
  onBack: () => void;
  onSuccess: () => void;
}

const CATEGORIES: { label: string; value: PostCategory }[] = [
  { label: '자유게시판', value: 'FREE' },
  { label: '당첨인증', value: 'WINNING' },
  { label: 'Q&A', value: 'QNA' },
];

export default function BoardWrite({ onBack, onSuccess }: BoardWriteProps) {
  const [formData, setFormData] = useState<PostCreateRequest>({
    title: '',
    content: '',
    category: 'FREE'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error('제목을 입력해주세요.');
    if (!formData.content.trim()) return toast.error('내용을 입력해주세요.');

    setIsSubmitting(true);
    try {
      await createPost(formData);
      toast.success('게시글이 등록되었습니다!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 sticky top-0 bg-slate-900/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h2 className="text-white font-bold">글쓰기</h2>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-rose-600 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          등록
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Category Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">카테고리 선택</label>
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat.value })}
                className={`px-4 py-2 rounded-xl text-sm transition-all border ${
                  formData.category === cat.value
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                    : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">제목</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="제목을 입력하세요"
            className="w-full px-0 py-2 bg-transparent border-b border-white/10 text-xl font-bold text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
          />
        </div>

        {/* Content Input */}
        <div className="flex-1 flex flex-col min-h-[300px]">
          <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">내용</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="동료들과 나누고 싶은 이야기를 적어보세요."
            className="flex-1 w-full bg-transparent text-slate-200 placeholder-slate-600 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Action Bar (Mock for image upload) */}
        <div className="flex items-center gap-4 py-4 border-t border-white/5">
          <button type="button" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ImageIcon className="w-5 h-5" />
            <span className="text-sm">사진 추가</span>
          </button>
        </div>
      </form>
    </div>
  );
}
