import { Post, PostCreateRequest, PostComment } from "../shared-types";
import axiosInstance from "./axiosInstance";
import { API_HOST } from "./client";

const API_BASE_URL = `${API_HOST}/api/posts`;

/**
 * 게시글 목록 조회
 */
export const fetchPosts = async (category?: string): Promise<Post[]> => {
  const url = category ? `${API_BASE_URL}?category=${category}` : API_BASE_URL;
  const response = await axiosInstance.get(url);
  return response.data;
};

/**
 * 게시글 상세 조회
 */
export const fetchPostDetail = async (id: number): Promise<Post> => {
  const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
  return response.data;
};

/**
 * 게시글 작성
 */
export const createPost = async (formData: FormData): Promise<number> => {
  const response = await axiosInstance.post(API_BASE_URL, formData);
  return response.data;
};

/**
 * 게시글 수정
 */
export const updatePost = async (id: number, formData: FormData): Promise<void> => {
  const response = await axiosInstance.put(`${API_BASE_URL}/${id}`, formData);
  // axios throws on error
};

/**
 * 게시글 삭제
 */
export const deletePost = async (id: number): Promise<void> => {
  const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
  // axios throws on error
};

/**
 * 1. 게시글 좋아요 토글 (누를 때마다 추가/취소 반전)
 * POST /api/posts/{postId}/like
 */
export const togglePostLike = async (postId: number): Promise<void> => {
  const response = await axiosInstance.post(`${API_BASE_URL}/${postId}/like`);
  // axios throws on error
};

/**
 * 2. 게시글 찜하기 토글
 * POST /api/posts/{postId}/wish
 */
export const togglePostWishlist = async (postId: number): Promise<void> => {
  const response = await axiosInstance.post(`${API_BASE_URL}/${postId}/wish`);
  // axios throws on error
};

/**
 * 3. 특정 게시글의 모든 댓글 불러오기
 * GET /api/posts/{postId}/comments
 */
export const fetchComments = async (postId: number): Promise<PostComment[]> => {
  const response = await axiosInstance.get(`${API_BASE_URL}/${postId}/comments`);
  return response.data;
};

/**
 * 4. 새 댓글 작성하기
 * POST /api/posts/{postId}/comments
 */
export const createComment = async (postId: number, content: string): Promise<void> => {
  const response = await axiosInstance.post(`${API_BASE_URL}/${postId}/comments`, { content });
  // axios throws on error
};

/**
 * 5. 내가 쓴 댓글 내용 수정하기
 * PUT /api/posts/{postId}/comments/{commentId}
 */
export const updateComment = async (postId: number, commentId: number, content: string): Promise<void> => {
  const response = await axiosInstance.put(`${API_BASE_URL}/${postId}/comments/${commentId}`, { content });
  // axios throws on error
};

/**
 * 6. 내가 쓴 댓글 삭제하기
 * DELETE /api/posts/{postId}/comments/{commentId}
 */
export const deleteComment = async (postId: number, commentId: number): Promise<void> => {
  const response = await axiosInstance.delete(`${API_BASE_URL}/${postId}/comments/${commentId}`);
  // axios throws on error
};
