import { getHeaders } from "./client";
import { KujiBoard } from "../shared-types";

/**
 * 찜하기 토글 (등록 시 {wished: true}, 해제 시 {wished: false} 반환)
 */
export const toggleWishlist = async (boardId: number): Promise<{ wished: boolean }> => {
  const response = await fetch(`/api/wishlist/${boardId}`, {
    method: "POST",
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "찜하기 처리에 실패했습니다.");
  }
  
  return response.json();
};

/**
 * 나의 찜 목록 가져오기
 */
export const fetchMyWishlist = async (): Promise<KujiBoard[]> => {
  const response = await fetch("/api/wishlist/me", {
    method: "GET",
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "찜 목록을 불러오지 못했습니다.");
  }
  
  return response.json();
};
