/**
 * API 공통 헤더 및 통신 설정
 */

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
 * - /uploads/... 같은 상대경로 → http://localhost:8080/uploads/...
 * - 이미 http://로 시작하면 그대로 반환
 */
export const toAbsoluteUrl = (url: string | undefined | null): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_HOST}${url}`;
};
