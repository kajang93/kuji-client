import type { Dispatch, SetStateAction } from "react";
import AdminDashboard from "../AdminDashboard";
import AdminNoticeManagement from "../AdminNoticeManagement";
import AdminEventManagement from "../AdminEventManagement";
import AdminInquiryManagement from "../AdminInquiryManagement";
import AdminMainBannerManagement from "../AdminMainBannerManagement";
import AdminUserManagement from "../AdminUserManagement";
import AdminPromotionManagement from "../AdminPromotionManagement";
import AdminStatistics from "../AdminStatistics";
import { Banner, ScreenType } from "../../shared-types";

type AdminScreensProps = {
  screen: ScreenType;
  setScreen: (screen: ScreenType) => void;
  setIsSidebarOpen: (open: boolean) => void;
  banners: Banner[];
  setBanners: Dispatch<SetStateAction<Banner[]>>;
};

// 관리자 전용 화면 그룹 (App.tsx에서 분리)
export default function AdminScreens({
  screen,
  setScreen,
  setIsSidebarOpen,
  banners,
  setBanners,
}: AdminScreensProps) {
  return (
    <>
      {screen === "adminDashboard" && (
        <AdminDashboard
          onNavigate={(target) => {
            if (target === "noticeManagement")
              setScreen("adminNoticeManagement");
            else if (target === "eventManagement")
              setScreen("adminEventManagement");
            else if (target === "inquiryManagement")
              setScreen("adminInquiryManagement");
            else if (target === "mainBanner")
              setScreen("adminMainBannerManagement");
            else if (target === "userManagement" || target === "users")
              setScreen("adminUserManagement");
            else if (target === "statistics")
              setScreen("adminStatistics");
          }}
        />
      )}
      {screen === "adminNoticeManagement" && (
        <AdminNoticeManagement onBack={() => setScreen("adminDashboard")} />
      )}
      {screen === "adminEventManagement" && (
        <AdminEventManagement onBack={() => setScreen("adminDashboard")} />
      )}
      {screen === "adminInquiryManagement" && (
        <AdminInquiryManagement onBack={() => setScreen("adminDashboard")} />
      )}
      {screen === "adminMainBannerManagement" && (
        <AdminMainBannerManagement
          onBack={() => setScreen("adminDashboard")}
          banners={banners}
          setBanners={setBanners}
        />
      )}
      {screen === "adminUserManagement" && (
        <AdminUserManagement
          onBack={() => {
            setScreen("adminDashboard");
            setIsSidebarOpen(false);
          }}
        />
      )}
      {screen === "adminPromotionManagement" && (
        <AdminPromotionManagement
          onBack={() => {
            setScreen("adminDashboard");
            setIsSidebarOpen(false);
          }}
        />
      )}
      {screen === "adminStatistics" && (
        <AdminStatistics onBack={() => setScreen("adminDashboard")} />
      )}
    </>
  );
}
