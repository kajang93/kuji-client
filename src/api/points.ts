/**
 * 포인트 충전 API
 */
import axiosInstance from "./axiosInstance";
import { API_HOST } from "./client";

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
  const response = await axiosInstance.post(`${API_BASE_URL}/charge/prepare`, data);
  return response.data;
};

/**
 * 포인트 충전 확정 (PG 결제 완료 후 포인트 적립)
 */
export const confirmPointCharge = async (
  data: ConfirmChargeRequest
): Promise<ConfirmChargeResponse> => {
  const response = await axiosInstance.post(`${API_BASE_URL}/charge/confirm`, data);
  return response.data;
};

/**
 * 포인트 사용/충전 내역 조회
 */
export const fetchPointHistory = async (): Promise<PointHistory[]> => {
  const response = await axiosInstance.get(`${API_BASE_URL}/history`);
  return response.data;
};
