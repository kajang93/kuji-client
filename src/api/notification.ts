import axiosInstance from "./axiosInstance";
import { API_HOST } from "./client";
import { v4 as uuidv4 } from 'uuid';

export interface NotificationSettingDto {
  pushEnabled: boolean;
  kakaoWinning: boolean;
  kakaoDelivery: boolean;
  kakaoInquiry: boolean;
  marketingOpen: boolean;
  marketingRestock: boolean;
  marketingEvent: boolean;
  nightPush: boolean;
}

export interface NotificationResponse {
  id: number;
  title: string;
  body: string;
  type: 'COMMENT' | 'SHIPPING' | 'SYSTEM';
  targetId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

/**
 * Get or create a unique device ID for this browser.
 * This is used to differentiate devices for push notifications.
 */
export const getDeviceId = (): string => {
  const STORAGE_KEY = 'kuji_device_id';
  let deviceId = localStorage.getItem(STORAGE_KEY);
  
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem(STORAGE_KEY, deviceId);
  }
  
  return deviceId;
};

/**
 * 1. FCM 기기 토큰 등록 (알림 켜기)
 * - 브라우저에서 토큰을 발급받은 직후 호출합니다.
 * @param token Firebase에서 발급받은 FCM 토큰
 */
export const registerDeviceToken = async (token: string) => {
  const deviceId = getDeviceId();
  const response = await axiosInstance.post('/api/notifications/token', {
    token: token,
    platform: 'WEB',
    deviceId: deviceId,
  });
  return response.data ?? null;
};

/**
 * 2. 기기 토큰 삭제 (알림 끄기 / 로그아웃)
 * - 유저가 설정에서 알림을 끄거나 로그아웃할 때 호출합니다.
 */
export const deleteDeviceToken = async () => {
  const deviceId = getDeviceId();
  const response = await axiosInstance.delete(`/api/notifications/token/${deviceId}`);
  return response.data ?? null;
};

/**
 * 3. 내 알림 목록 조회 (인앱 알림 센터)
 * - 상단 🔔 종 모양 아이콘을 클릭했을 때 알림 리스트를 불러옵니다.
 * @param page 페이지 번호 (0부터 시작)
 * @param size 가져올 개수 (기본 10)
 */
export const getMyNotifications = async (page: number = 0, size: number = 10) => {
  const response = await axiosInstance.get(`/api/notifications`, {
    params: { page, size },
  });
  return response.data as PageResponse<NotificationResponse>;
};

/**
 * 4. 알림 단건 읽음 처리
 * - 유저가 특정 알림을 클릭해서 해당 페이지로 이동할 때 호출합니다.
 * @param notificationId 알림 ID
 */
export const readNotification = async (notificationId: number) => {
  const response = await axiosInstance.patch(`/api/notifications/${notificationId}/read`);
  return response.data ?? null;
};

/**
 * 5. 알림 전체 읽음 처리
 * - '모두 읽음' 버튼을 눌렀을 때 호출합니다.
 */
/**
 * 6. 내 알림 수신 설정 조회
 * - 설정 화면 진입 시 서버에서 현재 토글 상태를 불러옵니다.
 */
export const getNotificationSettings = async (): Promise<NotificationSettingDto> => {
  const response = await axiosInstance.get('/api/notifications/settings');
  return response.data;
};

/**
 * 7. 알림 수신 설정 업데이트
 * - 사용자가 토글을 변경할 때마다 서버에 저장합니다.
 */
export const updateNotificationSettings = async (settings: Partial<NotificationSettingDto>): Promise<void> => {
  const response = await axiosInstance.patch('/api/notifications/settings', settings);
  // axios throws on error
}

export const readAllNotifications = async () => {
  const response = await axiosInstance.patch('/api/notifications/read-all');
  return response.data ?? null;
};
