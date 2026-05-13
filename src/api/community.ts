import { Post, PostCreateRequest } from "../shared-types";
import { getHeaders } from "./client";

const API_BASE_URL = "/api/posts";

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
export const createPost = async (data: PostCreateRequest): Promise<number> => {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
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
export const updatePost = async (id: number, data: PostCreateRequest): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
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
