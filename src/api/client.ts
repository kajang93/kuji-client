/**
 * API 공통 헤더 및 통신 설정
 */

import imageCompression from 'browser-image-compression';

export const API_HOST = import.meta.env.VITE_API_BASE_URL || "";

export const getHeaders = () => {
  // Token is now handled via HttpOnly cookies; no Authorization header needed
  return {
    "Content-Type": "application/json",
  };
};

/**
 * 이미지 URL 절대경로 변환
 */
export const toAbsoluteUrl = (url: string | undefined | null): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_HOST}${url}`;
};

/**
 * 이미지 파일 유효성 검사 (확장자 및 용량 제한)
 */
export const validateImageFile = (file: File, maxSizeMB: number = 10): string | null => {
  const MAX_SIZE = maxSizeMB * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return `파일 크기가 너무 큽니다. (최대 ${maxSizeMB}MB)`;
  }
  if (!file.type.startsWith("image/")) {
    return "이미지 파일만 업로드 가능합니다.";
  }
  return null;
};

/**
 * 프론트엔드 이미지 자동 압축
 * 최대 해상도 1920x1920, 최대 용량 1MB 이하로 압축 시도 (WebP 지원 시 자동 변환)
 */
export const compressImageFile = async (file: File): Promise<File> => {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') {
    // 이미지가 아니거나 GIF인 경우 원본 반환 (압축 제외)
    return file;
  }
  try {
    const options = {
      maxSizeMB: 1,           // 1MB 이하로 압축
      maxWidthOrHeight: 1920, // 최대 해상도
      useWebWorker: true,     // 브라우저 메인 스레드 멈춤 방지
      fileType: 'image/jpeg', // JPEG 또는 WEBP 등 (브라우저 호환성을 위해 JPEG 선호 가능)
    };
    const compressedBlob = await imageCompression(file, options);
    // Blob을 File 객체로 변환하여 기존 코드와 호환되게 유지
    return new File([compressedBlob], file.name, {
      type: compressedBlob.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("Image compression failed:", error);
    return file; // 실패 시 원본 파일 반환
  }
};

/**
 * 에러 텍스트 파싱 헬퍼
 * 백엔드에서 내려주는 JSON 에러 응답(e.g. {"message": "에러 내용", "status": 400})에서
 * 순수 텍스트 메시지만 추출합니다.
 */
export const extractErrorMessage = (text: string, fallback: string): string => {
  if (!text) return fallback;
  try {
    const json = JSON.parse(text);
    return json.message || text;
  } catch {
    return text;
  }
};

/**
 * 공통 비밀번호 규칙 검증
 * 1. 최소 8자 이상
 * 2. 영문 대/소문자, 숫자, 특수문자 중 3가지 이상 조합
 * 3. 흔한 비밀번호(금지어) 차단
 */
export const validatePasswordRules = (password: string): string | null => {
  if (!password || password.length === 0) {
    return null; // Empty case, usually handled by 'required'
  }
  
  if (password.length < 8) {
    return '비밀번호는 최소 8자 이상이어야 합니다.';
  }

  const forbiddenPasswords = ['12345678', 'password', 'kuji1234', 'qwertyui', '12341234'];
  const lowerPw = password.toLowerCase();
  if (forbiddenPasswords.includes(lowerPw)) {
    return '보안에 취약한 흔한 비밀번호는 사용할 수 없습니다.';
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const validCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;
  
  if (validCount < 3) {
    return '영문 대/소문자, 숫자, 특수문자 중 3가지 이상을 조합해주세요.';
  }

  return null; // Valid
};

