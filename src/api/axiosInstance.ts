import axios from 'axios';
import { toast } from 'sonner';

/**
 * 토큰 조회 헬퍼: localStorage → sessionStorage 순으로 확인
 * 로그인유지 체크 시 localStorage, 미체크 시 sessionStorage에 저장됨
 */
export const getToken = (): string | null => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Create axios instance with credentials
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
});

// Helper to get CSRF token from cookies (double submit cookie pattern)
const getCsrfTokenFromCookie = () => {
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : undefined;
};

// Request interceptor: add X‑CSRF‑Token header for state‑changing requests
axiosInstance.interceptors.request.use((config) => {
  // Ensure config is an object even when axiosInstance.get(url) is called without a config arg
  config = config || {} as any;
  const method = (config.method || 'get').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const token = getCsrfTokenFromCookie();
    if (token) {
      config.headers = config.headers || {};
      // @ts-ignore – allow custom header
      config.headers['X-CSRF-Token'] = token;
    }
  }
  // Add Authorization header if token is stored
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    // @ts-ignore – custom header
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor: auto‑refresh on 401 (unauthorized)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    if (error?.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Call refresh endpoint; server reads HttpOnly cookie and returns new access token
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL || ''}/api/members/refresh`, {}, { withCredentials: true });
        
        // 서버에서 이제 LoginResponse (객체) 를 반환하므로 token 필드를 추출해야 함
        const newToken = typeof res.data === 'string' ? res.data : res.data?.token;
        
        if (newToken) {
          if (localStorage.getItem('token')) {
            localStorage.setItem('token', newToken);
          } else {
            sessionStorage.setItem('token', newToken);
          }
        }

        // Retry original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed – force logout flow
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        toast.error('로그인이 만료되었습니다. 다시 로그인해주세요.');
        // Optionally you could redirect to login screen here
        // window.location.href = '/?action=login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
