/**
 * API 공통 헤더 및 통신 설정
 */

import imageCompression from 'browser-image-compression';

export const API_HOST = import.meta.env.VITE_API_BASE_URL || "";

export const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
