import { useLocation, useNavigate } from 'react-router-dom';
import { ScreenType } from '../shared-types';

const SCREEN_PATHS: Record<ScreenType, string> = {
  main: '/',
  list: '/list',
  detail: '/detail',
  login: '/login',
  selection: '/selection',
  reveal: '/reveal',
  profile: '/profile',
  profileEdit: '/profile/edit',
  purchase: '/profile/purchase',
  winning: '/profile/winning',
  wishlist: '/wishlist',
  settings: '/settings',
  support: '/support',
  prizeSelection: '/prize-selection',
  businessDashboard: '/biz',
  businessProfile: '/biz/profile',
  businessProducts: '/biz/products',
  businessProductEdit: '/biz/products/edit',
  businessRegister: '/biz/register',
  businessShipping: '/biz/shipping',
  businessInquiries: '/biz/inquiries',
  businessPending: '/biz/pending',
  community: '/community',
  communityDetail: '/community/detail',
  communityWrite: '/community/write',
  notice: '/notice',
  events: '/events',
  adminDashboard: '/admin',
  adminNoticeManagement: '/admin/notice',
  adminEventManagement: '/admin/events',
  adminInquiryManagement: '/admin/inquiries',
  adminMainBannerManagement: '/admin/banners',
  adminUserManagement: '/admin/users',
  adminPromotionManagement: '/admin/promotions',
  adminStatistics: '/admin/statistics',
  pointCharge: '/point-charge',
  kakaoCallback: '/oauth/kakao',
  naverCallback: '/oauth/naver',
  googleCallback: '/oauth/google',
};

const PATH_TO_SCREEN = Object.fromEntries(
  Object.entries(SCREEN_PATHS).map(([k, v]) => [v, k as ScreenType])
);
PATH_TO_SCREEN['/auth/kakao/callback'] = 'kakaoCallback';
PATH_TO_SCREEN['/auth/naver/callback'] = 'naverCallback';
PATH_TO_SCREEN['/auth/google/callback'] = 'googleCallback';

export function useScreen(): [ScreenType, (newScreenOrUpdater: ScreenType | ((prev: ScreenType) => ScreenType)) => void] {
  const location = useLocation();
  const navigate = useNavigate();
  
  // URL에서 screen 타입 파싱. 매칭되지 않으면 'main'으로 기본값
  let currentScreen: ScreenType = 'main';
  for (const [path, screenVal] of Object.entries(PATH_TO_SCREEN)) {
    if (location.pathname === path) {
      currentScreen = screenVal as ScreenType;
      break;
    }
  }

  const setScreen = (newScreenOrUpdater: ScreenType | ((prev: ScreenType) => ScreenType)) => {
    let targetScreen: ScreenType;
    if (typeof newScreenOrUpdater === 'function') {
      targetScreen = newScreenOrUpdater(currentScreen);
    } else {
      targetScreen = newScreenOrUpdater;
    }
    const path = SCREEN_PATHS[targetScreen] || '/';
    navigate(path);
  };
  
  return [currentScreen, setScreen];
}
