import { useState, useEffect } from 'react';
import { motion } from './motion';
import { ChevronLeft, Send, Image as ImageIcon, Check, X } from './icons';
import { PostCategory, PostCreateRequest } from '../shared-types';
import { useRef } from 'react';
import { createPost, fetchPostDetail, updatePost } from '../api/community';
import { validateImageFile, compressImageFile } from '../api/client';
import { toast } from 'sonner';

interface BoardWriteProps {
  postId?: number;
  onBack: () => void;
  onSuccess: () => void;
}

const CATEGORIES: { label: string; value: PostCategory }[] = [
  { label: '자유게시판', value: 'FREE' },
  { label: '당첨인증', value: 'WINNING' },
  { label: 'Q&A', value: 'QNA' },
];

export default function BoardWrite({ postId, onBack, onSuccess }: BoardWriteProps) {
  const [formData, setFormData] = useState<PostCreateRequest>({
    title: '',
    content: '',
    category: 'FREE'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (postId) {
      loadOriginalPost();
    }
  }, [postId]);

  const loadOriginalPost = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPostDetail(postId!);
      setFormData({
        title: data.title,
        content: data.content,
        category: data.category
      });
      setExistingImageUrls(data.imageUrls || []);
    } catch (error) {
      toast.error('기존 내용을 불러올 수 없습니다.');
      onBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (existingImageUrls.length + images.length + files.length > 3) {
      toast.error('사진은 최대 3장까지 등록 가능합니다.');
      return;
    }

    const validFiles: File[] = [];
    for (const file of files) {
      // 1차 자동 압축 (1MB 이하로)
      const compressedFile = await compressImageFile(file);
      
      const errorMsg = validateImageFile(compressedFile, 10);
      if (errorMsg) {
        toast.error(errorMsg);
      } else {
        validFiles.push(compressedFile);
      }
    }

    if (validFiles.length === 0) return;

    const newImages = [...images, ...validFiles];
    setImages(newImages);

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    // Revoke object URL to prevent memory leak
    URL.revokeObjectURL(previews[index]);
    
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error('제목을 입력해주세요.');
    if (!formData.content.trim()) return toast.error('내용을 입력해주세요.');

    setIsSubmitting(true);
    try {
      const formDataObj = new FormData();
      
      // JSON data (request)
      const requestBlob = new Blob([JSON.stringify(formData)], { type: 'application/json' });
      formDataObj.append('request', requestBlob);
      
      // 새 파일을 선택한 경우 서버는 기존 이미지를 새 이미지로 교체하고, 없으면 기존 이미지를 유지합니다.
      images.forEach(image => {
        formDataObj.append('files', image);
      });

      if (postId) {
        await updatePost(postId, formDataObj);
        toast.success('게시글이 수정되었습니다!');
      } else {
        await createPost(formDataObj);
        toast.success('게시글이 등록되었습니다!');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-900">
        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm mt-4">내용을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pr-[max(1rem,env(safe-area-inset-right))] border-b border-white/5 sticky top-0 bg-slate-900/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h2 className="text-white font-bold">{postId ? '글 수정하기' : '글쓰기'}</h2>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-rose-600 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-rose-500/20"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          {postId ? '수정 완료' : '등록'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
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

        {/* Action Bar & Previews */}
        <div className="space-y-4 py-4 border-t border-white/5">
          {/* Previews */}
          {(existingImageUrls.length > 0 || previews.length > 0) && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {existingImageUrls.map((preview, idx) => (
                <div key={`existing-${idx}`} className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-cyan-400/40 bg-white/5">
                  <img src={preview} alt={`기존 이미지 ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  <span className="absolute left-1 bottom-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-cyan-200">
                    기존
                  </span>
                </div>
              ))}
              {previews.map((preview, idx) => (
                <div key={idx} className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-white/10">
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImageChange}
            multiple 
            accept="image/*"
            className="hidden"
          />
          
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ImageIcon className="w-5 h-5" />
            <span className="text-sm">사진 추가 ({existingImageUrls.length + images.length}/3)</span>
          </button>
          {postId && existingImageUrls.length > 0 && images.length === 0 && (
            <div className="text-[10px] text-cyan-300/80">
              새 사진을 선택하지 않으면 기존 사진이 그대로 유지됩니다.
            </div>
          )}
          <div className="text-[10px] text-slate-500 mt-2">
            ※ 최대 10MB 이하의 이미지 파일만 업로드 가능합니다.
          </div>
        </div>
      </form>
    </div>
  );
}
