import axiosInstance from "./axiosInstance";
import { KujiBoard } from "../shared-types";

/**
 * 찜하기 토글 (등록 시 {wished: true}, 해제 시 {wished: false} 반환)
 */
export const toggleWishlist = async (boardId: number): Promise<{ wished: boolean }> => {
  const response = await axiosInstance.post(`/api/wishlist/${boardId}`);
  return response.data;
};

/**
 * 나의 찜 목록 가져오기
 */
export const fetchMyWishlist = async (): Promise<KujiBoard[]> => {
  const response = await axiosInstance.get("/api/wishlist/me");
  return response.data;
};
