import { useState, useEffect } from 'react';
import { motion } from './motion';
import { Search, PenLine, ChevronRight, Eye, MessageSquare, Filter, Heart } from './icons';
import { Post, PostCategory } from '../shared-types';
import { fetchPosts } from '../api/community';

interface BoardListProps {
  user: any;
  onWrite: () => void;
  onDetail: (id: number) => void;
}

const CATEGORIES: { label: string; value: PostCategory | "ALL" }[] = [
  { label: '전체', value: 'ALL' },
  { label: '자유게시판', value: 'FREE' },
  { label: '당첨인증', value: 'WINNING' },
  { label: 'Q&A', value: 'QNA' },
  { label: '공지사항', value: 'NOTICE' },
];

export default function BoardList({ user, onWrite, onDetail }: BoardListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostType, setSelectedPostType] = useState<PostCategory | "ALL">('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, [selectedPostType]);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const typeParam = selectedPostType === 'ALL' ? undefined : selectedPostType;
      const data = await fetchPosts(typeParam);
      
      // 서버 응답이 배열이 아닐 경우(Page 객체 등)를 대비한 방어 로직
      if (Array.isArray(data)) {
        setPosts(data);
      } else if (data && typeof data === 'object' && Array.isArray((data as any).content)) {
        setPosts((data as any).content);
      } else {
        console.warn('Unexpected data format from server:', data);
        setPosts([]);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryLabel = (type: string) => {
    return CATEGORIES.find(c => c.value === type)?.label || type;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 pb-20">
      {/* Header */}
      <div className="p-6 pb-2">
        <h1 className="text-2xl font-bold text-white mb-2">커뮤니티</h1>
        <p className="text-slate-400 text-sm">유저들과 자유롭게 소통해보세요.</p>
      </div>

      {/* Category Filter */}
      <div className="px-6 py-4 overflow-x-auto flex gap-2 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedPostType(cat.value)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
              selectedPostType === cat.value
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Post List */}
      <div className="flex-1 px-6 space-y-3 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 text-sm">게시글을 불러오는 중...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
            <p>등록된 게시글이 없습니다.</p>
          </div>
        ) : (
          posts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onDetail(post.id)}
              className="group p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-rose-500/30 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400">
                  {getCategoryLabel(post.category)}
                </span>
                <span className="text-[10px] text-slate-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-white font-medium mb-2 group-hover:text-rose-400 transition-colors line-clamp-1">
                {post.title}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{post.authorName}</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Eye className="w-3 h-3" />
                    {post.viewCount}
                  </div>
                  {post.likeCount !== undefined && (
                    <div className="flex items-center gap-1 text-[10px] text-rose-400">
                      <Heart className="w-3 h-3" />
                      {post.likeCount}
                    </div>
                  )}
                  {post.commentCount !== undefined && (
                    <div className="flex items-center gap-1 text-[10px] text-cyan-400">
                      <MessageSquare className="w-3 h-3" />
                      {post.commentCount}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Floating Write Button */}
      {user && (
        <button
          onClick={onWrite}
          className="fixed bottom-24 right-6 w-14 h-14 bg-rose-500 rounded-full shadow-2xl shadow-rose-500/40 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all z-10"
        >
          <PenLine className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
