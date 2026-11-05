// 로그인한 사용자의 결제 처리 상태를 조회한다.
import axiosInstance from "./axiosInstance";
import type { PaymentStatus } from "../utils/paymentRecovery";
import type { KujiItemResponse } from "../shared-types";
export type { PaymentStatus } from "../utils/paymentRecovery";

export async function fetchPaymentStatus(orderId: string): Promise<PaymentStatus> {
  const { data } = await axiosInstance.get<{ status: PaymentStatus }>(`/api/payments/${encodeURIComponent(orderId)}/status`);
  if (!["PENDING", "COMPLETED", "RECOVERING", "CANCELLED", "FAILED"].includes(data.status)) {
    throw new Error("결제 상태를 확인할 수 없습니다.");
  }
  return data.status;
}

export interface CompletedKujiResult {
  boardId: number;
  count: number;
  results: KujiItemResponse[];
  totalRemaining: number;
}

export async function fetchCompletedKujiResult(orderId: string): Promise<CompletedKujiResult> {
  const { data } = await axiosInstance.get<{
    sessionType: string; boardId: number; count: number;
    result: { results: KujiItemResponse[]; totalRemaining: number };
  }>(`/api/payments/${encodeURIComponent(orderId)}/result`);
  if (data.sessionType !== "KUJI_DRAW" || !Number.isSafeInteger(data.boardId) || data.boardId < 1
      || !Number.isSafeInteger(data.count) || data.count < 1 || !Array.isArray(data.result?.results)
      || data.result.results.length < data.count || data.result.results.length > data.count + 1
      || !Number.isSafeInteger(data.result.totalRemaining) || data.result.totalRemaining < 0) {
    throw new Error("결제한 쿠지의 개봉 결과를 확인할 수 없습니다.");
  }
  return { boardId: data.boardId, count: data.count, ...data.result };
}
