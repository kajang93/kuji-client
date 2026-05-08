import { ShippingInfo } from '../shared-types';

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
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
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
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
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
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/admin`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
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
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/${shippingId}/tracking`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || '운송장 정보 등록에 실패했습니다.');
  }

  return response.json();
}
