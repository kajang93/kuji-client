import { KujiBoard, BoardStatus, BoardImageType, KujiItemResponse } from "../shared-types";

import axiosInstance from "./axiosInstance";
import { API_HOST, toAbsoluteUrl } from "./client";

const API_BASE_URL = `${API_HOST}/api/kuji`;

/** API 응답 객체의 모든 이미지 URL을 절대경로로 변환 */
const normalizeImageUrls = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(normalizeImageUrls);
  if (obj && typeof obj === "object") {
    const result = { ...obj };
    if (result.imageUrl)      result.imageUrl      = toAbsoluteUrl(result.imageUrl);
    if (result.itemImageUrl)  result.itemImageUrl  = toAbsoluteUrl(result.itemImageUrl);
    if (result.profileImageUrl) result.profileImageUrl = toAbsoluteUrl(result.profileImageUrl);
    if (Array.isArray(result.imageUrls))
      result.imageUrls = result.imageUrls.map((u: string) => toAbsoluteUrl(u));
    if (Array.isArray(result.images))
      result.images = result.images.map(normalizeImageUrls);
    if (Array.isArray(result.prizes))
      result.prizes = result.prizes.map(normalizeImageUrls);
    return result;
  }
  return obj;
};

export const fetchKujiBoards = async (): Promise<KujiBoard[]> => {
  const response = await axiosInstance.get(API_BASE_URL);
  return normalizeImageUrls(response.data);
};

export const fetchSellerKujiBoards = async (): Promise<KujiBoard[]> => {
  const response = await axiosInstance.get(`${API_BASE_URL}/seller`);
  return normalizeImageUrls(response.data);
};

export const deleteKujiBoard = async (boardId: number): Promise<void> => {
  await axiosInstance.delete(`${API_BASE_URL}/${boardId}`);
  // axios throws on non-2xx, so explicit error handling not needed
};

export interface CreateKujiBoardRequest {
  title: string;
  pricePerDraw: number;
  status: BoardStatus;
  rewardRate: number;
}

export const createKujiBoard = async (data: CreateKujiBoardRequest): Promise<number> => {
  const response = await axiosInstance.post(API_BASE_URL, data);
  return response.data; // service returns the ID
};

export const uploadBoardImages = async (
  boardId: number,
  type: BoardImageType,
  files: File[]
): Promise<void> => {
  const formData = new FormData();
  formData.append("type", type);
  files.forEach((file) => {
    formData.append("files", file);
  });
  await axiosInstance.post(`${API_BASE_URL}/${boardId}/images`, formData);
  // axios handles errors via thrown exception
};

export const updateKujiBoardStatus = async (
  boardId: number,
  status: BoardStatus
): Promise<void> => {
  await axiosInstance.patch(`${API_BASE_URL}/${boardId}/status?status=${status}`);
  // error handling via axios
};

export const updateKujiBoardRewardRate = async (
  boardId: number,
  rewardRate: number
): Promise<void> => {
  await axiosInstance.patch(`${API_BASE_URL}/${boardId}/reward-rate?rewardRate=${rewardRate}`);
};

export const updateKujiBoardTitle = async (boardId: number, title: string): Promise<void> => {
  await axiosInstance.patch(`${API_BASE_URL}/${boardId}/title`, { title });
};

/**
 * Register multiple items for a kuji board with images.
 */
// 한 번의 요청이 서버 업로드 한도(요청당 20MB)를 넘지 않도록 상품을 나눠 보낸다.
const MAX_BATCH_BYTES = 15 * 1024 * 1024;
const MAX_BATCH_ITEMS = 15;

export const registerBoardItems = async (
  boardId: number,
  itemsData: any[],
  files: File[]
): Promise<void> => {
  const batches: Array<{ items: any[]; files: File[] }> = [];
  let current = { items: [] as any[], files: [] as File[], bytes: 0 };
  itemsData.forEach((item, index) => {
    const file = files[index];
    const size = file?.size ?? 0;
    if (current.items.length > 0 && (current.items.length >= MAX_BATCH_ITEMS || current.bytes + size > MAX_BATCH_BYTES)) {
      batches.push({ items: current.items, files: current.files });
      current = { items: [], files: [], bytes: 0 };
    }
    current.items.push(item);
    current.files.push(file);
    current.bytes += size;
  });
  if (current.items.length) batches.push({ items: current.items, files: current.files });

  // 서버는 같은 판에 상품을 이어서 추가하므로 순서대로 보낸다 (실패하면 호출한 쪽에서 판을 정리한다)
  for (const batch of batches) {
    const formData = new FormData();
    formData.append("items", new Blob([JSON.stringify(batch.items)], { type: 'application/json' }));
    batch.files.forEach((file) => formData.append("files", file));
    await axiosInstance.post(`${API_BASE_URL}/${boardId}/items`, formData);
  }
};

/**
 * Fetch detailed information of items for a board.
 */
export const fetchKujiBoardDetail = async (boardId: number): Promise<KujiItemResponse[]> => {
  const response = await axiosInstance.get(`${API_BASE_URL}/${boardId}`);
  return normalizeImageUrls(response.data);
};

/**
 * Update a specific kuji item.
 */
export const updateKujiItem = async (
  itemId: number,
  data: { grade?: string; name?: string; totalQty?: number }
): Promise<void> => {
  await axiosInstance.patch(`${API_BASE_URL}/items/${itemId}`, data);
  // axios handles errors
};

/**
 * Update a specific kuji item's image.
 */
export const updateKujiItemImage = async (
  itemId: number,
  file: File
): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);
  await axiosInstance.post(`${API_BASE_URL}/items/${itemId}/images`, formData);
  // axios error handling
};

/**
 * Delete a specific kuji item.
 */
export const deleteKujiItem = async (itemId: number): Promise<void> => {
  await axiosInstance.delete(`${API_BASE_URL}/items/${itemId}`);
  // axios throws on error
};
export interface PreparePaymentRequest {
  count: number;
  pointsUsed?: number;
}

export interface PreparePaymentResponse {
  orderId: string;
  amount: number;
  boardTitle: string;
}

/**
 * 결제 준비 API (PG 결제 전 고유 orderId 발급)
 */
export const prepareKujiPayment = async (
  boardId: number,
  data: PreparePaymentRequest
): Promise<PreparePaymentResponse> => {
  const response = await axiosInstance.post(`${API_BASE_URL}/${boardId}/payment/prepare`, data);
  return response.data;
};

export interface DrawKujiRequest {
  count: number;
  paymentType: "POINT" | "PG";
  paymentKey?: string;
  orderId?: string;
  amount?: number;
}

/**
 * Execute a kuji draw (POINT or PG completion).
 */
export const drawKuji = async (
  boardId: number,
  request: DrawKujiRequest
): Promise<{ results: any[]; totalRemaining: number }> => {
  const response = await axiosInstance.post(`${API_BASE_URL}/${boardId}/draw`, request);
  return normalizeImageUrls(response.data);
};

/**
 * Fetch the user's personal winning history (storage).
 */
export const fetchMyDrawHistory = async (): Promise<any[]> => {
  const response = await axiosInstance.get(`${API_BASE_URL}/draw-history/me`);
  if (!response.data) return [];
  
  const data = normalizeImageUrls(response.data);
  return Array.isArray(data) ? data : (data.content || []);
};

/**
 * 전역 최근 당첨 내역 조회 (티커용, 퍼블릭)
 */
export const fetchRecentDrawHistory = async (): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/draw-history/recent`);
  if (!response.ok) {
    // 티커는 부가 기능이므로 에러 시 빈 배열 반환하여 메인 로직에 지장 없게 함
    return [];
  }
  return response.json();
};
