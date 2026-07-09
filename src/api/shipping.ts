import { ShippingInfo } from '../shared-types';
import axiosInstance from "./axiosInstance";
import { API_HOST } from "./client";

const API_BASE_URL = `${API_HOST}/api/shipping`;

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
  const response = await axiosInstance.post(API_BASE_URL, data);
  return response.data;
}

/**
 * 2. 내 배송 내역 조회 (사용자)
 */
export async function fetchMyShippingList(): Promise<ShippingInfo[]> {
  const response = await axiosInstance.get(`${API_BASE_URL}/me`);
  return response.data;
}

/**
 * 3. 전체 배송 내역 조회 (관리자용)
 */
export async function fetchAllShippingList(): Promise<ShippingInfo[]> {
  const response = await axiosInstance.get(`${API_BASE_URL}/admin`);
  return response.data;
}

/**
 * 4. 운송장 정보 등록 및 배송 시작 (관리자용)
 */
export async function updateTrackingInfo(shippingId: number, data: {
  courierName: string;
  trackingNumber: string;
  courierPhone?: string;
}) {
  await axiosInstance.patch(`${API_BASE_URL}/${shippingId}/tracking`, data);
}

/**
 * 5. 사업자용 배송 목록 조회 (판매자용)
 */
export async function fetchSellerShippingList(): Promise<ShippingInfo[]> {
  const response = await axiosInstance.get(`${API_BASE_URL}/seller`);
  return response.data;
}

/**
 * 6. 배송 완료 처리 (판매자용)
 */
export async function completeShipping(shippingId: number): Promise<void> {
  await axiosInstance.patch(`${API_BASE_URL}/${shippingId}/complete`);
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
  const response = await axiosInstance.get(`${API_BASE_URL}/${shippingId}/tracking`);
  return response.data;
}
