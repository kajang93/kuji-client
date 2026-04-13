import { motion, AnimatePresence } from './motion';
import { X, User, ShoppingBag, Heart, Settings, LogOut, History, MessageCircle, Users, Gift, ChevronDown, ChevronUp, Bell } from './icons';
import { useState } from 'react';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  user: { name: string; email: string; type: 'social' | 'business'; points?: number; profileImageUrl?: string } | null;
  onLogout: () => void;
  onLogin: () => void;
  onNavigate: (screen: 'profile' | 'purchase' | 'winning' | 'wishlist' | 'settings' | 'support' | 'community' | 'events' | 'notice') => void;
};

export default function Sidebar({ isOpen, onClose, user, onLogout, onLogin, onNavigate }: SidebarProps) {
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);

  const handleMenuClick = (screen: 'profile' | 'purchase' | 'winning' | 'wishlist' | 'settings' | 'support' | 'community' | 'events' | 'notice') => {
    if (screen === 'profile' && !user) {
      return; // Don't navigate if not logged in
    }
    onNavigate(screen);
    onClose();
  };

  const handleCommunityToggle = () => {
    setIsCommunityOpen(!isCommunityOpen);
  };

  const menuItems = [
    { icon: User, label: '내 프로필', screen: 'profile' as const, requireLogin: true },
    { icon: ShoppingBag, label: '구매내역', screen: 'purchase' as const, requireLogin: false },
    { icon: History, label: '당첨내역', screen: 'winning' as const, requireLogin: false },
    { icon: Heart, label: '찜 목록', screen: 'wishlist' as const, requireLogin: false },
    { icon: Gift, label: '이벤트', screen: 'events' as const, requireLogin: false },
    { icon: Settings, label: '설정', screen: 'settings' as const, requireLogin: false },
  ];

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-80 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-2xl">메뉴</h2>
                <button
                  onClick={onClose}
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* User Info */}
              {user && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    {user.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt={user.name} 
                        className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]" 
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="text-white">{user.name}</div>
                      <div className="text-purple-300 text-sm">{user.email}</div>
                      {user.type === 'business' && (
                        <div className="inline-block mt-1 px-2 py-0.5 bg-yellow-400/20 border border-yellow-400/50 rounded text-yellow-300 text-xs">
                          사업자
                        </div>
                      )}
                      {user.points !== undefined && (
                        <div className="inline-block mt-1 px-2 py-0.5 bg-green-400/20 border border-green-400/50 rounded text-green-300 text-xs">
                          포인트: {user.points}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div className="p-4">
              {!user ? (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={onLogin}
                  className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 rounded-xl hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg"
                >
                  <div className="text-center text-lg">로그인</div>
                </motion.button>
              ) : (
                menuItems.map((item, index) => {
                  const isDisabled = item.requireLogin && !user;
                  return (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleMenuClick(item.screen)}
                      disabled={isDisabled}
                      className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-colors text-white group mb-2 ${
                        isDisabled 
                          ? 'opacity-40 cursor-not-allowed' 
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 text-purple-300 transition-colors ${
                        !isDisabled && 'group-hover:text-amber-400'
                      }`} />
                      <span className="text-lg">{item.label}</span>
                      {isDisabled && <span className="ml-auto text-xs text-white/50">로그인 필요</span>}
                    </motion.button>
                  );
                })
              )}
            </div>

            {/* Community Menu */}
            <div className="p-4">
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: menuItems.length * 0.05 }}
                onClick={handleCommunityToggle}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-colors text-white group mb-2 hover:bg-white/10"
              >
                <Users className="w-5 h-5 text-purple-300 transition-colors group-hover:text-amber-400" />
                <span className="text-lg">커뮤니티</span>
                {isCommunityOpen ? <ChevronUp className="ml-auto w-5 h-5" /> : <ChevronDown className="ml-auto w-5 h-5" />}
              </motion.button>
              {isCommunityOpen && (
                <div className="pl-10">
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (menuItems.length + 1) * 0.05 }}
                    onClick={() => handleMenuClick('notice')}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors text-white group mb-2 hover:bg-white/10"
                  >
                    <Bell className="w-4 h-4 text-purple-300 transition-colors group-hover:text-amber-400" />
                    <span>공지사항</span>
                  </motion.button>
                  {user && (
                    <motion.button
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (menuItems.length + 2) * 0.05 }}
                      onClick={() => handleMenuClick('support')}
                      className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors text-white group hover:bg-white/10"
                    >
                      <MessageCircle className="w-4 h-4 text-purple-300 transition-colors group-hover:text-amber-400" />
                      <span>1:1 문의</span>
                    </motion.button>
                  )}
                </div>
              )}
            </div>

            {/* Logout Button */}
            {user && (
              <div className="p-4 border-t border-white/20">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 hover:bg-red-500/30 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-lg">로그아웃</span>
                </motion.button>
              </div>
            )}

            {/* Footer */}
            <div className="p-6 text-center text-purple-300 text-sm">
              <p>一番く지 App v1.0</p>
              <p className="mt-2 text-xs opacity-70">© 2024 All rights reserved</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}