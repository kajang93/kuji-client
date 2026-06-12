import { useEffect } from 'react';

/**
 * Global gesture handling for PWA mode.
 * - 오른쪽 스와이프(좌측 가장자리에서 시작) → 뒤로가기
 * - Pull-to-Refresh는 PullToRefresh 컴포넌트가 담당
 */
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
      switch (screen) {
        case 'list':
        case 'myPage':
        case 'businessProducts':
        case 'businessOrders':
        case 'inquiries':
        case 'businessInquiries':
        case 'community':
          setScreen('main');
          break;
        case 'detail':
          setScreen('list');
          break;
        case 'login':
          setScreen(returnToScreen || 'main');
          break;
        case 'communityWrite':
        case 'communityDetail':
          setScreen('community');
          break;
        case 'pointCharge':
          setScreen('myPage');
          break;
        default:
          break;
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
