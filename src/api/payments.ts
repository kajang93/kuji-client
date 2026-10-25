// 로그인한 사용자의 결제 처리 상태를 조회한다.
import axiosInstance from "./axiosInstance";
import type { PaymentStatus } from "../utils/paymentRecovery";
export type { PaymentStatus } from "../utils/paymentRecovery";

export async function fetchPaymentStatus(orderId: string): Promise<PaymentStatus> {
  const { data } = await axiosInstance.get<{ status: PaymentStatus }>(`/api/payments/${encodeURIComponent(orderId)}/status`);
  if (!["PENDING", "COMPLETED", "RECOVERING", "CANCELLED", "FAILED"].includes(data.status)) {
    throw new Error("결제 상태를 확인할 수 없습니다.");
  }
  return data.status;
}
