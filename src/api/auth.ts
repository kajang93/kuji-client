import { MemberProfileResponse } from "../shared-types";

import { getHeaders, API_HOST } from "./client";

const API_BASE_URL = `${API_HOST}/api/members`;

/**
 * 로그인 요청
 */
export const login = async (email: string, password: string): Promise<{token: string}> => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    // 400 에러 등의 경우 에러 메시지 추출 시도
    const errorText = await response.text();
    let message = "로그인에 실패했습니다.";
    try {
      const errorJson = JSON.parse(errorText);
      message = errorJson.message || message;
    } catch (e) {
      // JSON이 아닌 경우 문자열 그대로 사용
      message = errorText || message;
    }
    throw new Error(message);
  }

  // 서버가 순수 문자열 토큰을 리턴하므로 .text() 사용
  const token = await response.text();
  return { token };
};

/**
 * 카카오 로그인 요청 (백엔드 세션 발급)
 */
export const loginWithKakao = async (kakaoAccessToken: string): Promise<{token: string}> => {
  const response = await fetch(`${API_BASE_URL}/login/kakao`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kakaoAccessToken }),
  });
  if (!response.ok) {
    throw new Error("카카오 로그인에 실패했습니다.");
  }
  return response.json();
};

/**
 * 내 정보 조회
 */
export const fetchMyProfile = async (): Promise<MemberProfileResponse> => {
  const response = await fetch(`${API_BASE_URL}/me`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("사용자 정보를 불러올 수 없습니다.");
  }
  return response.json();
};

/**
 * 내 정보 수정
 */
export const updateMyProfile = async (formData: FormData): Promise<MemberProfileResponse> => {
  const headers = getHeaders();
  // Content-Type: multipart/form-data는 브라우저가 자동 설정하도록 제거
  delete headers["Content-Type"];

  const response = await fetch(`${API_BASE_URL}/me`, {
    method: "PATCH",
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error("프로필 정보 수정에 실패했습니다.");
  }
  return response.json();
};

/**
 * 회원가입 요청
 */
export const signup = async (data: any): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "회원가입에 실패했습니다.");
  }
};

/**
 * 이메일 중복 확인
 */
export const checkEmail = async (email: string): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URL}/check-email?email=${encodeURIComponent(email)}`);
  if (!response.ok) {
    throw new Error("이메일 중복 확인에 실패했습니다.");
  }
  const data = await response.json();
  return data.isAvailable;
};

/**
 * 인증문자 발송
 */
export const sendSms = async (phoneNumber: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/send-sms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "인증번호 발송에 실패했습니다.");
  }
};

/**
 * 인증번호 검증 (회원가입 등)
 */
export const verifySms = async (phoneNumber: string, code: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/verify-sms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber, code }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "인증번호가 일치하지 않거나 만료되었습니다.");
  }
};

/**
 * 아이디 찾기
 */
export const findId = async (phoneNumber: string, verificationCode: string): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/find-id`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber, verificationCode }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "해당 번호로 가입된 아이디를 찾을 수 없습니다.");
  }
  const text = await response.text();
  try {
    const json = JSON.parse(text);
    return json.email || json.id || text;
  } catch (e) {
    return text;
  }
};

/**
 * 비밀번호 재설정
 */
export const resetPassword = async (email: string, phoneNumber: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, phoneNumber }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "회원 정보를 확인할 수 없습니다.");
  }
};

/**
 * 사업자 프로필 조회
 */
export const fetchBusinessProfile = async (): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/business-profile`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("사업자 프로필을 불러올 수 없습니다.");
  }
  return response.json();
};
