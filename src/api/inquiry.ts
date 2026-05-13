import { Inquiry, InquiryCreateRequest } from "../shared-types";
import { getHeaders } from "./client";

const API_BASE_URL = "/api/inquiries";

/**
 * 1:1 문의 등록
 */
export const createInquiry = async (data: InquiryCreateRequest): Promise<void> => {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "문의 등록에 실패했습니다.");
  }
};

/**
 * 나의 문의 목록 조회
 */
export const fetchMyInquiries = async (): Promise<Inquiry[]> => {
  const response = await fetch(`${API_BASE_URL}/my`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("문의 목록을 불러올 수 없습니다.");
  }
  return response.json();
};

/**
 * 문의 상세 조회
 */
export const fetchInquiryDetail = async (id: number): Promise<Inquiry> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("문의 상세 정보를 불러올 수 없습니다.");
  }
  return response.json();
};
