import { Inquiry, InquiryCreateRequest } from "../shared-types";
import axiosInstance from "./axiosInstance";
import { API_HOST } from "./client";

const API_BASE_URL = `${API_HOST}/api/inquiries`;

/**
 * 1:1 문의 등록
 */
export const createInquiry = async (data: InquiryCreateRequest): Promise<void> => {
  const response = await axiosInstance.post(API_BASE_URL, data);
  // axios throws on error
};

/**
 * 나의 문의 목록 조회
 */
export const fetchMyInquiries = async (): Promise<Inquiry[]> => {
  const response = await axiosInstance.get(`${API_BASE_URL}/my`);
  return response.data;
};

/**
 * 문의 상세 조회
 */
export const fetchInquiryDetail = async (id: number): Promise<Inquiry> => {
  const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
  return response.data;
};
