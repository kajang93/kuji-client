import { MemberProfileResponse } from "../shared-types";
import { API_HOST, extractErrorMessage } from "./client";
import axiosInstance from "./axiosInstance";

const API_BASE_URL = `${API_HOST}/api/members`;

/**
 * 로그인 요청
 */
export const login = async (email: string, password: string): Promise<any> => {
  const response = await axiosInstance.post(`${API_BASE_URL}/login`, { email, password });
  return response.data;
};

/**
 * 카카오 로그인 요청 (백엔드 세션 발급)
 */
export const loginWithKakao = async (kakaoAccessToken: string): Promise<{token: string}> => {
  const response = await axiosInstance.post(`${API_BASE_URL}/login/kakao`, { kakaoAccessToken });
  return response.data;
};

/**
 * 네이버 로그인 요청
 */
export const loginWithNaver = async (
  naverAccessToken: string,
  isTermsAgreed?: boolean,
  isPrivacyAgreed?: boolean,
  isMarketingAgreed?: boolean
): Promise<{token: string; isNewUser?: boolean}> => {
  const response = await axiosInstance.post(`${API_BASE_URL}/login/naver`, {
    naverAccessToken,
    isTermsAgreed,
    isPrivacyAgreed,
    isMarketingAgreed,
  });
  return response.data;
};

/**
 * 내 정보 조회
 */
export const fetchMyProfile = async (): Promise<MemberProfileResponse> => {
  const response = await axiosInstance.get(`${API_BASE_URL}/me`);
  return response.data;
};

/**
 * 내 정보 수정
 */
export const updateMyProfile = async (formData: FormData): Promise<MemberProfileResponse> => {
  const response = await axiosInstance.patch(`${API_BASE_URL}/me`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * 회원가입 요청
 */
export const signup = async (data: any): Promise<void> => {
  await axiosInstance.post(`${API_BASE_URL}/signup`, data);
};

/**
 * 이메일 중복 확인
 */
export const checkEmail = async (email: string): Promise<boolean> => {
  const response = await axiosInstance.get(`${API_BASE_URL}/check-email`, {
    params: { email },
  });
  return response.data.isAvailable;
};

/**
 * 인증문자 발송
 */
export const sendSms = async (phoneNumber: string): Promise<void> => {
  await axiosInstance.post(`${API_BASE_URL}/send-sms`, { phoneNumber });
};

/**
 * 인증번호 검증 (회원가입 등)
 */
export const verifySms = async (phoneNumber: string, code: string): Promise<void> => {
  await axiosInstance.post(`${API_BASE_URL}/verify-sms`, { phoneNumber, code });
};

/**
 * 아이디 찾기
 */
export const findId = async (phoneNumber: string, verificationCode: string): Promise<string> => {
  const response = await axiosInstance.post(`${API_BASE_URL}/find-id`, { phoneNumber, verificationCode });
  const data = response.data;
  if (typeof data === 'string') return data;
  return data.email || data.id || JSON.stringify(data);
};

/**
 * 비밀번호 재설정
 */
export const resetPassword = async (email: string, phoneNumber: string): Promise<void> => {
  await axiosInstance.post(`${API_BASE_URL}/reset-password`, { email, phoneNumber });
};

/**
 * 사업자 프로필 조회
 */
export const fetchBusinessProfile = async (): Promise<any> => {
  const response = await axiosInstance.get(`${API_BASE_URL}/business-profile`);
  return response.data;
};
