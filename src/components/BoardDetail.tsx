import { useState, useEffect } from 'react';
import { motion } from './motion';
import { ChevronLeft, MoreVertical, Trash2, Eye, User, Calendar, Share2 } from './icons';
import { Post } from '../shared-types';
import { fetchPostDetail, deletePost } from '../api/community';
import { toast } from 'sonner';

interface BoardDetailProps {
  postId: number;
  onBack: () => void;
}

export default function BoardDetail({ postId, onBack }: BoardDetailProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPostDetail(postId);
      setPost(data);
    } catch (error) {
      console.error('Failed to load post:', error);
      toast.error('게시글을 불러올 수 없습니다.');
      onBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 이 게시글을 삭제하시겠습니까?')) return;
    
    try {
      await deletePost(postId);
      toast.success('게시글이 삭제되었습니다.');
      onBack();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-900">
        <div className="w-10 h-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 sticky top-0 bg-slate-900/80 backdrop-blur-md z-10">
        <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <Share2 className="w-5 h-5 text-slate-400" />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-slate-400" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20">
                <button 
                  onClick={handleDelete}
                  className="w-full px-4 py-3 flex items-center gap-2 text-rose-400 hover:bg-white/5 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  삭제하기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 mb-3 inline-block">
            {post.category}
          </span>
          <h1 className="text-2xl font-bold text-white mb-4 leading-tight">{post.title}</h1>
          
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl">
            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{post.authorName}</div>
              <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-0.5">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  조회 {post.viewCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-slate-300 leading-relaxed whitespace-pre-wrap min-h-[300px]"
        >
          {post.content}
        </motion.div>

        {/* Bottom Padding */}
        <div className="h-20" />
      </div>
    </div>
  );
}
