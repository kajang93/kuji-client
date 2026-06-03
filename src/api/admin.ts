import { Inquiry, Post } from "../shared-types";
import { getHeaders } from "./client";

/**
 * [관리자] 모든 사용자 문의 목록 조회
 */
export const fetchAllInquiries = async (): Promise<Inquiry[]> => {
  const response = await fetch("/api/admin/inquiries", {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("문의 목록을 불러올 수 없습니다.");
  }
  return response.json();
};

/**
 * [관리자] 문의 답변 등록
 */
export const answerInquiry = async (id: number, answerContent: string): Promise<void> => {
  const response = await fetch(`/api/admin/inquiries/${id}/answer`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ answerContent }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "답변 등록에 실패했습니다.");
  }
};

/**
 * [관리자] 공지사항 목록 조회
 */
export const fetchNotices = async (): Promise<Post[]> => {
  const response = await fetch("/api/posts?category=NOTICE", {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("공지사항을 불러올 수 없습니다.");
  }
  const data = await response.json();
  return Array.isArray(data) ? data : data.content || [];
};

/**
 * [관리자] 공지사항 등록
 */
export const createNotice = async (title: string, content: string): Promise<void> => {
  const response = await fetch("/api/posts", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ title, content, category: "NOTICE" }),
  });
  if (!response.ok) {
    throw new Error("공지사항 등록에 실패했습니다.");
  }
};

/**
 * [관리자] 공지사항 수정
 */
export const updateNotice = async (id: number, title: string, content: string): Promise<void> => {
  const response = await fetch(`/api/posts/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ title, content, category: "NOTICE" }),
  });
  if (!response.ok) {
    throw new Error("공지사항 수정에 실패했습니다.");
  }
};

/**
 * [관리자] 공지사항 삭제
 */
export const deleteNotice = async (id: number): Promise<void> => {
  const response = await fetch(`/api/posts/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("공지사항 삭제에 실패했습니다.");
  }
};

/**
 * [관리자] 전체 회원 목록 조회
 */
export const fetchAdminMembers = async (): Promise<any[]> => {
  const response = await fetch("/api/admin/members", {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("회원 목록을 불러올 수 없습니다.");
  }
  return response.json();
};
