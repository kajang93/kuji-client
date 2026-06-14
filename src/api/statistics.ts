import axiosInstance from "./axiosInstance";
import { API_HOST } from "./client";

const API_BASE_URL = `${API_HOST}/api/statistics`;

// ================================
// Types
// ================================

export interface AdminSummary {
  totalChargedPoints: number;
  totalKujiSalesPoints: number;
  totalMembers: number;
  newMembersToday: number;
}

export interface DailySales {
  date: string;
  totalAmount: number;
}

export interface SellerSummary {
  totalSalesPoints: number;
  estimatedSettlement: number;
  appliedFeeRate: number;
  isFirstMonthFree: boolean;
  pendingShippingCount: number;
}

// ================================
// Admin Statistics API
// ================================

/**
 * 어드민 전체 요약 통계 조회
 */
export async function fetchAdminSummary(): Promise<AdminSummary> {
  const response = await axiosInstance.get(`${API_BASE_URL}/admin/summary`);
  return response.data;
}

/**
 * 어드민 일자별 매출 통계 조회 (기본 7일)
 */
export async function fetchAdminDailySales(days = 7): Promise<DailySales[]> {
  const response = await axiosInstance.get(`${API_BASE_URL}/admin/daily-sales`, {
    params: { days },
  });
  return response.data;
}

// ================================
// Business(Seller) Statistics API
// ================================

/**
 * 판매자 요약 통계 조회
 */
export async function fetchSellerSummary(): Promise<SellerSummary> {
  const response = await axiosInstance.get(`${API_BASE_URL}/seller/summary`);
  return response.data;
}

/**
 * 판매자 일자별 매출 통계 조회 (기본 7일)
 */
export async function fetchSellerDailySales(days = 7): Promise<DailySales[]> {
  const response = await axiosInstance.get(`${API_BASE_URL}/seller/daily-sales`, {
    params: { days },
  });
  return response.data;
}
