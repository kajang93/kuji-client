import { ShippingInfo } from '../shared-types';
import { getHeaders } from './client';

const API_BASE_URL = '/api/shipping';

/**
 * 1. 배송 신청 (사용자)
 */
export async function requestShipping(data: {
  drawHistoryIds: number[];
  recipientName: string;
  phone: string;
  zipcode: string;
  address: string;
  detailAddress: string;
  deliveryMessage?: string;
}) {
  const response = await fetch(`${API_BASE_URL}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || '배송 신청에 실패했습니다.');
  }

  return response.json();
}

/**
 * 2. 내 배송 내역 조회 (사용자)
 */
export async function fetchMyShippingList(): Promise<ShippingInfo[]> {
  const response = await fetch(`${API_BASE_URL}/me`, {
    headers: getHeaders()
  });

  if (!response.ok) {
    throw new Error('배송 내역을 불러오는 데 실패했습니다.');
  }

  return response.json();
}

/**
 * 3. 전체 배송 내역 조회 (관리자용)
 */
export async function fetchAllShippingList(): Promise<ShippingInfo[]> {
  const response = await fetch(`${API_BASE_URL}/admin`, {
    headers: getHeaders()
  });

  if (!response.ok) {
    throw new Error('전체 배송 내역을 불러오는 데 실패했습니다.');
  }

  return response.json();
}

/**
 * 4. 운송장 정보 등록 및 배송 시작 (관리자용)
 */
export async function updateTrackingInfo(shippingId: number, data: {
  courierName: string;
  trackingNumber: string;
}) {
  const response = await fetch(`${API_BASE_URL}/${shippingId}/tracking`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || '운송장 정보 등록에 실패했습니다.');
  }
}

/**
 * 5. 사업자용 배송 목록 조회 (판매자용)
 */
export async function fetchSellerShippingList(): Promise<ShippingInfo[]> {
  const response = await fetch(`${API_BASE_URL}/seller`, {
    headers: getHeaders()
  });

  if (!response.ok) {
    throw new Error('사업자 배송 내역을 불러오는 데 실패했습니다.');
  }

  return response.json();
}

/**
 * 6. 배송 완료 처리 (판매자용)
 */
export async function completeShipping(shippingId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${shippingId}/complete`, {
    method: 'PATCH',
    headers: getHeaders()
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || '배송 완료 처리에 실패했습니다.');
  }
}

export interface DeliveryStatus {
  date: string;
  time: string;
  location: string;
  status: string;
  isCompleted: boolean;
}

export interface TrackingResponse {
  orderNumber: string;
  trackingNumber: string;
  courier: string;
  recipientAddress: string;
  deliveryDriver: string;
  deliveryDriverPhone: string;
  history: DeliveryStatus[];
}

/**
 * 7. 배송 진행 상황(타임라인) 조회
 */
export async function fetchTrackingInfo(shippingId: number): Promise<TrackingResponse> {
  const response = await fetch(`${API_BASE_URL}/${shippingId}/tracking`, {
    headers: getHeaders()
  });

  if (!response.ok) {
    let errorMessage = '배송 진행 상황을 불러오는 데 실패했습니다.';
    try {
      const text = await response.text();
      try {
        const errorData = JSON.parse(text);
        errorMessage = errorData.message || errorData.error || text;
      } catch {
        errorMessage = text || errorMessage;
      }
    } catch (e) {
      // 무시
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
