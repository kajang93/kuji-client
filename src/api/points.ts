/**
 * 포인트 충전 API
 */
import { getHeaders, API_HOST } from "./client";

const API_BASE_URL = `${API_HOST}/api/points`;

// ── 타입 정의 ──────────────────────────────

export interface PrepareChargeRequest {
  amount: number;
}

export interface PrepareChargeResponse {
  orderId: string;
  amount: number;
  bonusPoints: number;
}

export interface ConfirmChargeRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface ConfirmChargeResponse {
  pointsCharged: number;
  bonusPoints: number;
  totalPoints: number;
}

export interface PointHistory {
  id: number;
  type: "CHARGE" | "USE" | "REWARD" | "REFUND";
  amount: number;
  description: string;
  createdAt: string;
}

// ── API 함수 ──────────────────────────────

/**
 * 포인트 충전 준비 (PG 결제 전 orderId 발급)
 */
export const preparePointCharge = async (
  data: PrepareChargeRequest
): Promise<PrepareChargeResponse> => {
  const response = await fetch(`${API_BASE_URL}/charge/prepare`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "충전 준비에 실패했습니다." }));
    throw new Error(errorData.message || "충전 준비에 실패했습니다.");
  }
  return response.json();
};

/**
 * 포인트 충전 확정 (PG 결제 완료 후 포인트 적립)
 */
export const confirmPointCharge = async (
  data: ConfirmChargeRequest
): Promise<ConfirmChargeResponse> => {
  const response = await fetch(`${API_BASE_URL}/charge/confirm`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "충전 확인에 실패했습니다." }));
    throw new Error(errorData.message || "충전 확인에 실패했습니다.");
  }
  return response.json();
};

/**
 * 포인트 사용/충전 내역 조회
 */
export const fetchPointHistory = async (): Promise<PointHistory[]> => {
  const response = await fetch(`${API_BASE_URL}/history`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("포인트 내역 조회에 실패했습니다.");
  }
  return response.json();
};
