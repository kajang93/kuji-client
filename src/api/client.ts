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
