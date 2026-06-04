import { getHeaders, API_HOST } from "./client";

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
 * 어드민 전체 요약 통계 조회 (임시 하드코딩 + 백엔드 연동 준비)
 */
export async function fetchAdminSummary(): Promise<AdminSummary> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/summary`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) throw new Error('Summary fetch failed');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch admin summary:', error);
    throw error;
  }
}

/**
 * 어드민 일자별 매출 통계 조회 (기본 7일)
 */
export async function fetchAdminDailySales(days = 7): Promise<DailySales[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/daily-sales?days=${days}`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) throw new Error('Daily sales fetch failed');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch admin daily sales:', error);
    throw error;
  }
}

// ================================
// Business(Seller) Statistics API
// ================================

/**
 * 판매자 요약 통계 조회
 */
export async function fetchSellerSummary(): Promise<SellerSummary> {
  try {
    const response = await fetch(`${API_BASE_URL}/seller/summary`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) throw new Error('Seller summary fetch failed');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch seller summary:', error);
    throw error;
  }
}

/**
 * 판매자 일자별 매출 통계 조회 (기본 7일)
 */
export async function fetchSellerDailySales(days = 7): Promise<DailySales[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/seller/daily-sales?days=${days}`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) throw new Error('Seller daily sales fetch failed');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch seller daily sales:', error);
    throw error;
  }
}
