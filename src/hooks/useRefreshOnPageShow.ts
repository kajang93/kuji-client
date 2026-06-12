import { useEffect } from 'react';

/**
 * iOS Safari PWA에서 "pageshow"(복원) 혹은 "visibilitychange"(포그라운드 복귀) 이벤트가 발생하면
 * 전달받은 refresh 함수를 호출해 최신 데이터를 강제로 받아옵니다.
 *
 * @param refreshFn  새로고침 로직 (예: handleRefresh)
 */
export const useRefreshOnPageShow = (refreshFn: () => Promise<void>) => {
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        // 백그라운드에서 복원될 때 최신 데이터를 강제로 받아옵니다.
        void refreshFn();
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void refreshFn();
      }
    };

    window.addEventListener('pageshow', onPageShow);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('pageshow', onPageShow);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [refreshFn]);
};
