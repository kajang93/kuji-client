import { motion } from './motion';
import { X, Home, Bell, Calendar, MessageSquare, Users, LogOut, Shield, ImageIcon, TrendingUp } from './icons';
import { APP_DISPLAY_VERSION } from '../constants/appInfo';

type AdminSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: any) => void;
  onLogout: () => void;
  user: { name: string; email: string; type: 'admin' };
  newInquiriesCount?: number;
};

export default function AdminSidebar({ isOpen, onClose, onNavigate, onLogout, user, newInquiriesCount = 0 }: AdminSidebarProps) {
  if (!isOpen) return null;

  const menuItems = [
    { id: 'adminDashboard', icon: Home, label: '대시보드' },
    { id: 'adminMainBannerManagement', icon: ImageIcon, label: '메인 화면 관리' },
    { id: 'adminNoticeManagement', icon: Bell, label: '공지사항 관리' },
    { id: 'adminEventManagement', icon: Calendar, label: '이벤트 관리' },
    { id: 'adminUserManagement', icon: Users, label: '사용자 관리' },
    { id: 'adminInquiryManagement', icon: MessageSquare, label: '1:1 문의 관리' },
    { id: 'adminStatistics', icon: TrendingUp, label: '통계/분석' },
  ];

  const handleNavigate = (screen: string) => {
    onNavigate(screen);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
      />

      {/* Sidebar */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 h-full w-[min(20rem,calc(100vw-env(safe-area-inset-left)))] bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 z-50 shadow-2xl overflow-y-auto overscroll-contain"
      >
        {/* Header */}
        <div className="p-5 pt-[max(1.25rem,env(safe-area-inset-top))] pr-[max(1.25rem,env(safe-area-inset-right))] border-b border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-xl">관리자 메뉴</h2>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          
          {/* Admin Profile */}
          <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white">{user.name}</div>
              <div className="text-white/60 text-sm">슈퍼 관리자</div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className="w-full flex items-center gap-3 p-3 text-white hover:bg-white/10 rounded-xl transition-colors group"
            >
              <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                <item.icon className="w-5 h-5" />
              </div>
              <span>{item.label}</span>
              {item.id === 'adminInquiryManagement' && newInquiriesCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {newInquiriesCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="mx-4 my-2 border-t border-white/20" />

        {/* Bottom Actions */}
        <div className="p-4 space-y-2">
          <button
            onClick={() => {
              onNavigate('main');
              onClose();
            }}
            className="w-full flex items-center gap-3 p-3 text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <div className="p-2 bg-white/10 rounded-lg">
              <Home className="w-5 h-5" />
            </div>
            <span>사용자 모드로 전환</span>
          </button>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors mt-2"
            >
            <div className="p-2 bg-white/10 rounded-lg">
              <LogOut className="w-5 h-5" />
            </div>
            <span>로그아웃</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center text-white/50 text-xs">
          Oshikuji Kuji Admin {APP_DISPLAY_VERSION}
        </div>
      </motion.div>
    </>
  );
}
