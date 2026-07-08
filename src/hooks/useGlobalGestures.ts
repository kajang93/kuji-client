import { useEffect } from 'react';

/**
 * Global gesture handling for PWA mode.
 * - 오른쪽 스와이프(좌측 가장자리에서 시작) → 뒤로가기
 * - Pull-to-Refresh는 PullToRefresh 컴포넌트가 담당
 */

// 화면별 뒤로가기 목적지 (없으면 스와이프 백 미동작)
const BACK_TARGETS: Record<string, string> = {
  // 고객 화면
  list: 'main',
  detail: 'list',
  selection: 'detail',
  community: 'main',
  communityWrite: 'community',
  communityDetail: 'community',
  profile: 'main',
  profileEdit: 'profile',
  purchase: 'main',
  winning: 'main',
  wishlist: 'main',
  settings: 'main',
  support: 'main',
  notice: 'main',
  events: 'main',
  pointCharge: 'main',
  // 사업자 화면
  businessProfile: 'businessDashboard',
  businessProducts: 'businessDashboard',
  businessProductEdit: 'businessProducts',
  businessRegister: 'businessDashboard',
  businessShipping: 'businessDashboard',
  businessInquiries: 'businessDashboard',
  // 관리자 화면
  adminNoticeManagement: 'adminDashboard',
  adminEventManagement: 'adminDashboard',
  adminInquiryManagement: 'adminDashboard',
  adminMainBannerManagement: 'adminDashboard',
  adminUserManagement: 'adminDashboard',
  adminPromotionManagement: 'adminDashboard',
  adminStatistics: 'adminDashboard',
};

export const useGlobalGestures = (
  screen: string,
  setScreen: (s: string) => void,
  returnToScreen: string | null,
  setReturnToScreen: (s: string | null) => void,
) => {
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleBack = () => {
      if (screen === 'login') {
        setScreen(returnToScreen || 'main');
        return;
      }
      // reveal(뽑기 연출) 등 매핑에 없는 화면은 스와이프 백 미동작
      const target = BACK_TARGETS[screen];
      if (target) {
        setScreen(target);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = endX - startX;
      const diffY = Math.abs(endY - startY);

      // 왼쪽 가장자리(50px)에서 시작해 오른쪽으로 70px 이상, 수직 움직임은 50px 이하일 때 뒤로가기
      if (startX < 50 && diffX > 70 && diffY < 50) {
        handleBack();
      }
    };

    const attach = () => {
      window.addEventListener('touchstart', onTouchStart);
      window.addEventListener('touchend', onTouchEnd);
    };
    const detach = () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };

    attach();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        detach();
        attach();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      detach();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [screen, returnToScreen]);
};
