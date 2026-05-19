import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from './motion';
import { ChevronLeft, MoreVertical, Trash2, Eye, User, Calendar, Share2, Edit2, Heart, Star, MessageSquare, Send } from './icons';
import { Post, PostComment } from '../shared-types';
import { 
  fetchPostDetail, deletePost, 
  togglePostLike, togglePostWishlist, 
  fetchComments, createComment, updateComment, deleteComment 
} from '../api/community';
import { toast } from 'sonner';

interface BoardDetailProps {
  postId: number;
  user: any;
  onBack: () => void;
  onEdit: () => void;
}

export default function BoardDetail({ postId, user, onBack, onEdit }: BoardDetailProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  
  // Comment states
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');

  const isAuthor = user && post && user.email === post.authorEmail;

  useEffect(() => {
    loadPostData();
  }, [postId]);

  const loadPostData = async () => {
    setIsLoading(true);
    try {
      const [postData, commentsData] = await Promise.all([
        fetchPostDetail(postId),
        fetchComments(postId)
      ]);
      setPost(postData);
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to load post data:', error);
      toast.error('데이터를 불러올 수 없습니다.');
      onBack();
    } finally {
      setIsLoading(false);
    }
  };

  const reloadComments = async () => {
    try {
      const commentsData = await fetchComments(postId);
      setComments(commentsData);
      // update comment count in post
      if (post) {
        setPost({ ...post, commentCount: commentsData.length });
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
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

  const handleLike = async () => {
    if (!user) return toast.error('로그인이 필요합니다.');
    if (!post) return;
    
    // Optimistic UI
    const originalLiked = post.isLiked;
    const originalCount = post.likeCount || 0;
    setPost({
      ...post,
      isLiked: !originalLiked,
      likeCount: originalLiked ? Math.max(0, originalCount - 1) : originalCount + 1
    });

    try {
      await togglePostLike(postId);
    } catch (error: any) {
      toast.error(error.message);
      // Revert on fail
      setPost({ ...post, isLiked: originalLiked, likeCount: originalCount });
    }
  };

  const handleWish = async () => {
    if (!user) return toast.error('로그인이 필요합니다.');
    if (!post) return;
    
    const originalWished = post.isWished;
    setPost({ ...post, isWished: !originalWished });

    try {
      await togglePostWishlist(postId);
      toast.success(!originalWished ? '게시글을 찜했습니다.' : '찜하기를 취소했습니다.');
    } catch (error: any) {
      toast.error(error.message);
      setPost({ ...post, isWished: originalWished });
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error('로그인이 필요합니다.');
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      await createComment(postId, newComment.trim());
      setNewComment('');
      toast.success('댓글이 등록되었습니다.');
      await reloadComments();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentEditSubmit = async (commentId: number) => {
    if (!editCommentContent.trim()) return;
    try {
      await updateComment(postId, commentId, editCommentContent.trim());
      setEditingCommentId(null);
      toast.success('댓글이 수정되었습니다.');
      await reloadComments();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCommentDelete = async (commentId: number) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await deleteComment(postId, commentId);
      toast.success('댓글이 삭제되었습니다.');
      await reloadComments();
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
    <div className="flex flex-col h-full bg-slate-900 relative">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 sticky top-0 bg-slate-900/80 backdrop-blur-md z-10">
        <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <Share2 className="w-5 h-5 text-slate-400" />
          </button>
          
          {isAuthor && (
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
                    onClick={onEdit}
                    className="w-full px-4 py-3 flex items-center gap-2 text-white hover:bg-white/5 text-sm"
                  >
                    <Edit2 className="w-4 h-4 text-cyan-400" />
                    수정하기
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="w-full px-4 py-3 flex items-center gap-2 text-rose-400 hover:bg-white/5 text-sm border-t border-white/5"
                  >
                    <Trash2 className="w-4 h-4" />
                    삭제하기
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="p-6">
          <div className="mb-6">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 inline-block">
                {post.category}
              </span>
            </div>
            
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
            className="text-slate-300 leading-relaxed whitespace-pre-wrap mb-8"
          >
            {post.content}
          </motion.div>

          {/* Images */}
          {post.imageUrls && post.imageUrls.length > 0 && (
            <div className="mb-8 space-y-4">
              {post.imageUrls.map((url, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-2xl overflow-hidden border border-white/10 shadow-lg"
                >
                  <img 
                    src={url} 
                    alt={`Post image ${idx + 1}`} 
                    className="w-full h-auto object-cover"
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Action Buttons (Like / Wish) */}
          <div className="flex gap-4 mb-8 pt-4 border-t border-white/5">
            <button 
              onClick={handleLike}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                post.isLiked 
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
            >
              <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
              <span className="font-medium">좋아요 {post.likeCount || 0}</span>
            </button>
            <button 
              onClick={handleWish}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                post.isWished 
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
            >
              <Star className={`w-5 h-5 ${post.isWished ? 'fill-current' : ''}`} />
              <span className="font-medium">찜하기</span>
            </button>
          </div>

          {/* Comments Section */}
          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              댓글 <span className="text-slate-400 text-sm font-normal">{comments.length}개</span>
            </h3>
            
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm bg-white/5 rounded-2xl">
                  첫 번째 댓글을 남겨보세요!
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-white/5 rounded-2xl p-4 flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                      {comment.authorName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-white">{comment.authorName}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      
                      {editingCommentId === comment.id ? (
                        <div className="mt-2">
                          <textarea
                            value={editCommentContent}
                            onChange={(e) => setEditCommentContent(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/20 rounded-xl p-3 text-sm text-white resize-none focus:outline-none focus:border-cyan-400"
                            rows={3}
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button 
                              onClick={() => setEditingCommentId(null)}
                              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                            >
                              취소
                            </button>
                            <button 
                              onClick={() => handleCommentEditSubmit(comment.id)}
                              className="px-3 py-1.5 text-xs bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30"
                            >
                              수정 완료
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                            {comment.content}
                          </p>
                          {user && user.email === comment.authorEmail && (
                            <div className="flex gap-3 mt-3">
                              <button 
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setEditCommentContent(comment.content);
                                }}
                                className="text-[10px] text-slate-500 hover:text-cyan-400 flex items-center gap-1"
                              >
                                <Edit2 className="w-3 h-3" /> 수정
                              </button>
                              <button 
                                onClick={() => handleCommentDelete(comment.id)}
                                className="text-[10px] text-slate-500 hover:text-rose-400 flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" /> 삭제
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comment Input Sticky Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-900/90 backdrop-blur-lg border-t border-white/10 z-20">
        {user ? (
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요..."
              className="flex-1 bg-white/10 border border-white/20 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
            />
            <button
              type="submit"
              disabled={isSubmittingComment || !newComment.trim()}
              className="w-12 h-12 flex-shrink-0 bg-cyan-500 rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:bg-slate-600 transition-colors shadow-lg shadow-cyan-500/30"
            >
              {isSubmittingComment ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5 ml-1" />
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-3 text-slate-400 text-sm">
            댓글을 남기려면 <button onClick={onBack} className="text-cyan-400 hover:underline">로그인</button>이 필요합니다.
          </div>
        )}
      </div>
    </div>
  );
}
