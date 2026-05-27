import { MemberProfileResponse } from "../shared-types";

import { getHeaders } from "./client";

const API_BASE_URL = "/api/members";

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
