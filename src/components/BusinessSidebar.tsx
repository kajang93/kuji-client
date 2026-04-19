import { motion, AnimatePresence } from './motion';
import { X, Package, PlusCircle, Truck, User, Settings as SettingsIcon, LogOut, MessageSquare } from './icons';

type BusinessSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  user: { name: string; email: string; type: 'social' | 'business' } | null;
  onLogout: () => void;
  onNavigate: (screen: 'businessDashboard' | 'businessProducts' | 'businessRegister' | 'businessShipping' | 'businessProfile' | 'settings' | 'businessInquiries') => void;
  newInquiriesCount?: number;
};

export default function BusinessSidebar({ isOpen, onClose, user, onLogout, onNavigate, newInquiriesCount }: BusinessSidebarProps) {
  const menuItems = [
    { id: 'businessDashboard' as const, icon: SettingsIcon, label: '대시보드', color: 'from-teal-500 to-teal-600' },
    { id: 'businessProducts' as const, icon: Package, label: '등록된 상품 조회', color: 'from-blue-500 to-blue-600' },
    { id: 'businessRegister' as const, icon: PlusCircle, label: '쿠지 상품 등록', color: 'from-green-500 to-green-600' },
    { id: 'businessShipping' as const, icon: Truck, label: '배송 관리', color: 'from-orange-500 to-orange-600' },
    { id: 'businessInquiries' as const, icon: MessageSquare, label: 'C/S 문의', color: 'from-pink-500 to-pink-600', badge: newInquiriesCount },
    { id: 'businessProfile' as const, icon: User, label: '사업자 프로필', color: 'from-purple-500 to-purple-600' },
    { id: 'settings' as const, icon: SettingsIcon, label: '설정', color: 'from-gray-500 to-gray-600' },
  ];

  const handleMenuClick = (screenId: typeof menuItems[number]['id']) => {
    onNavigate(screenId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl text-white">사업자 메뉴</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* User Info */}
              {user && (
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-xl">
                      {user.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="text-white">{user.name}</div>
                      <div className="text-white/60 text-sm">{user.email}</div>
                      <div className="text-xs bg-orange-500/30 text-orange-300 px-2 py-0.5 rounded-full inline-block mt-1">
                        사업자 계정
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleMenuClick(item.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${item.color} hover:opacity-90 transition-all shadow-lg hover:shadow-xl group`}
                    >
                      <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-white">{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <div className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">
                          {item.badge}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Logout Button - Consistent with regular Sidebar */}
            {user && (
              <div className="p-4 border-t border-white/20">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 hover:bg-red-500/30 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-lg">로그아웃</span>
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}