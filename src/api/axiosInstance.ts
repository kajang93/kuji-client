import axios from 'axios';
import { toast } from 'sonner';

/**
 * 토큰 조회 헬퍼: localStorage → sessionStorage 순으로 확인
 * 로그인유지 체크 시 localStorage, 미체크 시 sessionStorage에 저장됨
 */
export const getToken = (): string | null => {
  const tokens = [localStorage.getItem('token'), sessionStorage.getItem('token')];
  return tokens.find((token) => token && token !== 'undefined' && token !== 'null') || null;
};

// Auto-detect environment: DEV uses proxy (empty string), PROD uses real domain
export const BASE_URL = import.meta.env.DEV ? '' : 'https://kujishop.shop';

// Create axios instance with credentials
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || BASE_URL,
  withCredentials: true,
});

// Helper to get CSRF token from cookies (double submit cookie pattern)
const getCsrfTokenFromCookie = () => {
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : undefined;
};

// Request interceptor: add X‑CSRF‑Token header for state‑changing requests
axiosInstance.interceptors.request.use((config) => {
  const method = (config.method || 'get').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const token = getCsrfTokenFromCookie();
    if (token) {
      config.headers['X-CSRF-Token'] = token;
    }
  }
  // Add Authorization header if token is stored
  const token = getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// 동시에 만료된 요청들은 하나의 갱신 요청을 공유합니다.
let refreshRequest: Promise<string> | null = null;
let logoutRequest: Promise<void> | null = null;

const refreshAccessToken = (): Promise<string> => {
  if (!refreshRequest) {
    refreshRequest = axios.post<string | { token?: string }>(
      `${import.meta.env.VITE_API_BASE_URL || BASE_URL}/api/members/refresh`,
      {},
      { withCredentials: true },
    ).then(({ data }) => {
      const token = typeof data === 'string' ? data : data.token;
      if (!token) throw new Error('로그인 토큰을 갱신하지 못했습니다.');
      const localToken = localStorage.getItem('token');
      const storage = localToken && localToken === getToken() ? localStorage : sessionStorage;
      storage.setItem('token', token);
      return token;
    }).catch((error) => {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      toast.error('로그인이 만료되었습니다. 다시 로그인해주세요.');
      throw error;
    }).finally(() => {
      refreshRequest = null;
    });
  }
  return refreshRequest;
};

// 갱신 중인 요청을 먼저 마친 뒤 서버 세션을 폐기해 토큰이 다시 저장되는 경쟁을 막습니다.
export const logoutSession = (): Promise<void> => {
  if (!logoutRequest) {
    logoutRequest = (async () => {
      await refreshRequest?.catch(() => undefined);
      const deviceId = localStorage.getItem('kuji_device_id');
      const requestLogout = () => axiosInstance.post('/api/members/logout', { deviceId });
      try {
        await requestLogout();
      } catch (error) {
        if (!axios.isAxiosError(error) || error.response?.status !== 401 || !getToken()) {
          throw error;
        }
        // 만료된 액세스 토큰도 갱신 후 즉시 폐기할 수 있도록 로그아웃 흐름에서만 재시도합니다.
        await refreshAccessToken();
        await requestLogout();
      }
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('fcm_token');
    })().finally(() => {
      logoutRequest = null;
    });
  }
  return logoutRequest;
};

// Response interceptor: auto‑refresh on 401 (unauthorized)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    if (error?.response?.status === 401 && originalRequest && !originalRequest._retry && getToken() && !logoutRequest) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken();
        if (logoutRequest) throw new Error('로그아웃 중이므로 요청을 다시 보내지 않습니다.');
        // Retry original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    // 글로벌 에러 메시지 정제: 백엔드에서 넘겨주는 JSON 에러 메시지가 있다면 최우선으로 적용
    // 없다면 브라우저 기본 에러(Network Error, Request failed with status 401 등) 대신 한글 안내 문구 적용
    if (error?.response?.data?.message) {
      error.message = error.response.data.message;
    } else if (error?.response?.status === 403) {
      error.message = '이 작업을 수행할 권한이 없습니다.';
    } else if (error?.response?.status === 401) {
      error.message = '로그인이 필요합니다. 다시 로그인해 주세요.';
    } else if (error?.response?.status === 404) {
      error.message = '요청한 내용을 찾을 수 없습니다.';
    } else if (error?.message?.includes('status code') || error?.message?.includes('Network Error')) {
      error.message = '서버 통신 중 오류가 발생했습니다.';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
