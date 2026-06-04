import { Post, PostCreateRequest, PostComment } from "../shared-types";
import { getHeaders, API_HOST } from "./client";

const API_BASE_URL = `${API_HOST}/api/posts`;

/**
 * 게시글 목록 조회
 */
export const fetchPosts = async (category?: string): Promise<Post[]> => {
  const url = category ? `${API_BASE_URL}?category=${category}` : API_BASE_URL;
  const response = await fetch(url, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("게시글 목록을 불러올 수 없습니다.");
  }
  return response.json();
};

/**
 * 게시글 상세 조회
 */
export const fetchPostDetail = async (id: number): Promise<Post> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("게시글 상세 내용을 불러올 수 없습니다.");
  }
  return response.json();
};

/**
 * 게시글 작성
 */
export const createPost = async (formData: FormData): Promise<number> => {
  const token = localStorage.getItem("token");
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "게시글 작성에 실패했습니다.");
  }
  return response.json();
};

/**
 * 게시글 수정
 */
export const updatePost = async (id: number, formData: FormData): Promise<void> => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "게시글 수정에 실패했습니다.");
  }
};

/**
 * 게시글 삭제
 */
export const deletePost = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("게시글 삭제에 실패했습니다.");
  }
};

/**
 * 1. 게시글 좋아요 토글 (누를 때마다 추가/취소 반전)
 * POST /api/posts/{postId}/like
 */
export const togglePostLike = async (postId: number): Promise<void> => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/${postId}/like`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("좋아요 처리에 실패했습니다.");
};

/**
 * 2. 게시글 찜하기 토글
 * POST /api/posts/{postId}/wish
 */
export const togglePostWishlist = async (postId: number): Promise<void> => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/${postId}/wish`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("찜하기 처리에 실패했습니다.");
};

/**
 * 3. 특정 게시글의 모든 댓글 불러오기
 * GET /api/posts/{postId}/comments
 */
export const fetchComments = async (postId: number): Promise<PostComment[]> => {
  const response = await fetch(`${API_BASE_URL}/${postId}/comments`, {
    headers: { "Content-Type": "application/json" }, // (GET요청 시 토큰은 선택사항)
  });
  if (!response.ok) throw new Error("댓글 목록을 불러올 수 없습니다.");
  return response.json();
};

/**
 * 4. 새 댓글 작성하기
 * POST /api/posts/{postId}/comments
 */
export const createComment = async (postId: number, content: string): Promise<void> => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/${postId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error("댓글 작성에 실패했습니다.");
};

/**
 * 5. 내가 쓴 댓글 내용 수정하기
 * PUT /api/posts/{postId}/comments/{commentId}
 */
export const updateComment = async (postId: number, commentId: number, content: string): Promise<void> => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/${postId}/comments/${commentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error("댓글 수정에 실패했습니다.");
};

/**
 * 6. 내가 쓴 댓글 삭제하기
 * DELETE /api/posts/{postId}/comments/{commentId}
 */
export const deleteComment = async (postId: number, commentId: number): Promise<void> => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/${postId}/comments/${commentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("댓글 삭제에 실패했습니다.");
};
