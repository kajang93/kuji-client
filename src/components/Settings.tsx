import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from './motion';
import { ChevronLeft, Bell, Vibrate, Volume2, MessageCircle, Truck, AlertCircle, Moon, Gift, BellRing, X, ChevronDown, Ticket } from './icons';
import { toast } from 'sonner';
import { requestFirebaseToken } from '../api/firebase';
import { registerDeviceToken, deleteDeviceToken, getNotificationSettings, updateNotificationSettings } from '../api/notification';

export type NotificationSettingsState = {
  pushEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  kakaoWinning: boolean;
  kakaoDelivery: boolean;
  kakaoInquiry: boolean;
  kakaoBizOrder: boolean;
  kakaoBizCancel: boolean;
  kakaoBizInquiry: boolean;
  marketingOpen: boolean;
  marketingRestock: boolean;
  marketingEvent: boolean;
  nightPush: boolean;
};

type SettingsProps = {
  onBack: () => void;
  user?: { name: string; email: string; type: 'social' | 'business' | 'admin' } | null;
  settings: NotificationSettingsState;
  onUpdateSettings: (settings: NotificationSettingsState) => void;
};

export default function Settings({ onBack, user, settings, onUpdateSettings }: SettingsProps) {
  const [showModal, setShowModal] = useState<'privacy' | 'terms' | 'info' | null>(null);
  const [isKakaoExpanded, setIsKakaoExpanded] = useState(true);
  const [isMarketingExpanded, setIsMarketingExpanded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // 설정 화면 진입 시 서버에서 현재 알림 설정 불러오기
  useEffect(() => {
    if (!user) return; // 비로그인 시 스킵
    getNotificationSettings()
      .then((serverSettings) => {
        onUpdateSettings({ ...settings, ...serverSettings });
      })
      .catch((err) => {
        console.warn('알림 설정 로드 실패 (서버 미연결 등):', err);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // 토글 클릭 → 로컬 즉시 반영 + 백엔드 동기화
  const toggleSetting = async (key: keyof NotificationSettingsState) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    onUpdateSettings(newSettings); // 즉시 UI 반영 (낙관적 업데이트)

    if (!user) return; // 비로그인 시 API 호출 안 함
    setIsSyncing(true);
    try {
      await updateNotificationSettings({ [key]: newSettings[key] });
    } catch (err) {
      console.error('알림 설정 저장 실패:', err);
      // 실패 시 원래 값으로 롤백
      onUpdateSettings(settings);
      toast.error('설정 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePushToggle = async () => {
    const isTurningOn = !settings.pushEnabled;
    
    if (isTurningOn) {
      try {
        // 브라우저 알림 권한 요청
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          toast.success("알림 권한이 허용되었습니다. 토큰을 발급합니다...");
          const token = await requestFirebaseToken();
          
          if (token) {
            try {
              // 백엔드로 토큰 전송
              await registerDeviceToken(token);
              // notification_setting 테이블에도 pushEnabled=true 동기화
              await updateNotificationSettings({ pushEnabled: true });
              localStorage.setItem('fcm_token', token);
              toast.success("푸시 알림 설정이 완료되었습니다! 🎉");
              onUpdateSettings({ ...settings, pushEnabled: true });
            } catch (apiError) {
              console.error("백엔드 토큰 등록 실패:", apiError);
              toast.error("서버에 알림 정보를 등록하지 못했습니다. 다시 로그인 후 시도해주세요.");
            }
          } else {
            toast.error("토큰 발급에 실패했습니다.");
          }
        } else {
          toast.error("알림 권한이 차단되어 있습니다. 브라우저 설정에서 허용해주세요.");
        }
      } catch (error) {
        console.error("알림 권한 요청 중 오류:", error);
        toast.error("알림을 설정하는 중 오류가 발생했습니다.");
      }
    } else {
      // 알림 끄기 — API 실패해도 로컬 토큰은 반드시 삭제 (best-effort)
      localStorage.removeItem('fcm_token');
      onUpdateSettings({ ...settings, pushEnabled: false });
      try {
        await deleteDeviceToken();
        await updateNotificationSettings({ pushEnabled: false });
        toast.success("앱 푸시 알림을 껐습니다.");
      } catch (apiError) {
        console.error("백엔드 토큰 삭제 실패:", apiError);
        // 로컬은 이미 지웠으므로 UI는 꺼진 상태 유지, 서버 오류만 알림
        toast.error("서버 동기화에 실패했습니다. 다시 로그인 후 확인해주세요.");
      }
    }
  };


  const isBusiness = user?.type === 'business';

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-slate-900 to-indigo-950 border-b-2 border-teal-400/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="p-2 bg-rose-500 rounded-full hover:bg-rose-600 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-xl text-center">설정</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        
        {/* 1. System Push Settings */}
        <div className="space-y-3">
          <h2 className="text-white/80 text-sm font-medium px-2">기본 설정</h2>
          
          {/* Master Push Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden"
          >
            <div className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bell className="w-6 h-6 text-indigo-300" />
              </div>
              <div className="flex-1">
                <div className="text-white mb-1">앱 푸시 알림</div>
                <div className="text-white/60 text-sm">기기 알림을 받습니다</div>
              </div>
              <button
                onClick={handlePushToggle}
                className={`relative w-16 h-10 rounded-xl transition-colors ${
                  settings.pushEnabled ? 'bg-indigo-500' : 'bg-white/20'
                }`}
              >
                <motion.div
                  animate={{ x: settings.pushEnabled ? 28 : 4 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`absolute top-1 w-8 h-8 rounded-lg shadow-lg ${
                    settings.pushEnabled ? 'bg-white' : 'bg-white/60'
                  }`}
                />
              </button>
            </div>

          </motion.div>

          {/* Sound & Vibrate */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
            >
              <div className="flex flex-col h-full justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-rose-500/30 rounded-lg flex items-center justify-center">
                    <Vibrate className="w-5 h-5 text-rose-300" />
                  </div>
                  <button
                    onClick={() => toggleSetting('vibrationEnabled')}
                    className={`relative w-10 h-6 rounded-full transition-colors ${
                      settings.vibrationEnabled ? 'bg-rose-500' : 'bg-white/20'
                    }`}
                  >
                    <motion.div
                      animate={{ x: settings.vibrationEnabled ? 22 : 2 }}
                      className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                    />
                  </button>
                </div>
                <span className="text-white text-sm">진동</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
            >
              <div className="flex flex-col h-full justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-amber-500/30 rounded-lg flex items-center justify-center">
                    <Volume2 className="w-5 h-5 text-amber-300" />
                  </div>
                  <button
                    onClick={() => toggleSetting('soundEnabled')}
                    className={`relative w-10 h-6 rounded-full transition-colors ${
                      settings.soundEnabled ? 'bg-amber-500' : 'bg-white/20'
                    }`}
                  >
                    <motion.div
                      animate={{ x: settings.soundEnabled ? 22 : 2 }}
                      className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                    />
                  </button>
                </div>
                <span className="text-white text-sm">소리</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* 2. KakaoTalk Notification Settings */}
        <div className="space-y-3 pt-4">
          <h2 className="text-white/80 text-sm font-medium px-2">카카오톡 알림 설정</h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-[#FAE100]/20 to-[#FAE100]/5 backdrop-blur-sm rounded-2xl border border-[#FAE100]/30 shadow-lg overflow-hidden"
          >
            <div className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#FAE100] rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-[#371D1E]" />
              </div>
              <div className="flex-1">
                <div className="text-white mb-1">알림톡 설정</div>
                <div className="text-white/60 text-sm">주요 정보를 카카오톡으로 받습니다</div>
              </div>
              <button
                onClick={() => setIsKakaoExpanded(!isKakaoExpanded)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <motion.div
                  animate={{ rotate: isKakaoExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-white" />
                </motion.div>
              </button>
            </div>

            <AnimatePresence>
              {isKakaoExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 space-y-4 border-t border-white/10 pt-4">
                    {/* Winning/Order Notification */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                          <Gift className="w-4 h-4 text-[#FAE100]" />
                        </div>
                        <div>
                          <div className="text-white text-sm">
                            {user?.type === 'business' ? '신규 주문 접수 알림' : '당첨 내역 알림'}
                          </div>
                          <div className="text-white/40 text-xs">
                            {user?.type === 'business' ? '고객의 새로운 배송 요청 접수 시' : '쿠지 당첨 시 실시간 알림'}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSetting(isBusiness ? 'kakaoBizOrder' : 'kakaoWinning')}
                        className={`relative w-10 h-6 rounded-full transition-colors ${
                          (isBusiness ? settings.kakaoBizOrder : settings.kakaoWinning) ? 'bg-[#FAE100]' : 'bg-white/20'
                        }`}
                      >
                        <motion.div
                          animate={{ x: (isBusiness ? settings.kakaoBizOrder : settings.kakaoWinning) ? 22 : 2 }}
                          className={`absolute top-1 w-4 h-4 rounded-full shadow-sm ${
                            (isBusiness ? settings.kakaoBizOrder : settings.kakaoWinning) ? 'bg-[#371D1E]' : 'bg-white/60'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Delivery/Cancellation Notification */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                          <Truck className="w-4 h-4 text-[#FAE100]" />
                        </div>
                        <div>
                          <div className="text-white text-sm">
                            {user?.type === 'business' ? '취소/반품 접수 알림' : '배송 현황 알림'}
                          </div>
                          <div className="text-white/40 text-xs">
                            {user?.type === 'business' ? '고객의 취소 및 반품 요청 발생 시' : '배송 시작/완료 알림'}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSetting(isBusiness ? 'kakaoBizCancel' : 'kakaoDelivery')}
                        className={`relative w-10 h-6 rounded-full transition-colors ${
                          (isBusiness ? settings.kakaoBizCancel : settings.kakaoDelivery) ? 'bg-[#FAE100]' : 'bg-white/20'
                        }`}
                      >
                        <motion.div
                          animate={{ x: (isBusiness ? settings.kakaoBizCancel : settings.kakaoDelivery) ? 22 : 2 }}
                          className={`absolute top-1 w-4 h-4 rounded-full shadow-sm ${
                            (isBusiness ? settings.kakaoBizCancel : settings.kakaoDelivery) ? 'bg-[#371D1E]' : 'bg-white/60'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Inquiry Notification */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                          <MessageCircle className="w-4 h-4 text-[#FAE100]" />
                        </div>
                        <div>
                          <div className="text-white text-sm">
                            {user?.type === 'business' ? '신규 고객 문의 알림' : '문의 답변 알림'}
                          </div>
                          <div className="text-white/40 text-xs">
                            {user?.type === 'business' ? '내 상품에 1:1 문의 등록 시' : '1:1 문의 답변 등록 시'}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSetting(isBusiness ? 'kakaoBizInquiry' : 'kakaoInquiry')}
                        className={`relative w-10 h-6 rounded-full transition-colors ${
                          (isBusiness ? settings.kakaoBizInquiry : settings.kakaoInquiry) ? 'bg-[#FAE100]' : 'bg-white/20'
                        }`}
                      >
                        <motion.div
                          animate={{ x: (isBusiness ? settings.kakaoBizInquiry : settings.kakaoInquiry) ? 22 : 2 }}
                          className={`absolute top-1 w-4 h-4 rounded-full shadow-sm ${
                            (isBusiness ? settings.kakaoBizInquiry : settings.kakaoInquiry) ? 'bg-[#371D1E]' : 'bg-white/60'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* 3. Marketing & Event Settings */}
        <div className="space-y-3 pt-4">
          <h2 className="text-white/80 text-sm font-medium px-2">마케팅 및 혜택</h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 shadow-lg overflow-hidden"
          >
             <div className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <Gift className="w-6 h-6 text-purple-300" />
              </div>
              <div className="flex-1">
                <div className="text-white mb-1">혜택 알림</div>
                <div className="text-white/60 text-sm">이벤트 및 오픈 소식 받기</div>
              </div>
              <button
                onClick={() => setIsMarketingExpanded(!isMarketingExpanded)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <motion.div
                  animate={{ rotate: isMarketingExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-white" />
                </motion.div>
              </button>
            </div>

             <AnimatePresence>
              {isMarketingExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 space-y-4 border-t border-white/10 pt-4">
                    {/* Open Notification */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                          <BellRing className="w-4 h-4 text-purple-300" />
                        </div>
                        <div>
                          <div className="text-white text-sm">관심 상품 오픈 알림</div>
                          <div className="text-white/40 text-xs">찜한 상품 판매 시작 시</div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSetting('marketingOpen')}
                        className={`relative w-10 h-6 rounded-full transition-colors ${
                          settings.marketingOpen ? 'bg-purple-500' : 'bg-white/20'
                        }`}
                      >
                        <motion.div
                          animate={{ x: settings.marketingOpen ? 22 : 2 }}
                          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                        />
                      </button>
                    </div>

                    {/* Restock Notification */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 text-purple-300" />
                        </div>
                        <div>
                          <div className="text-white text-sm">재입고/마감임박 알림</div>
                          <div className="text-white/40 text-xs">재고 10개 미만 시 알림</div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSetting('marketingRestock')}
                        className={`relative w-10 h-6 rounded-full transition-colors ${
                          settings.marketingRestock ? 'bg-purple-500' : 'bg-white/20'
                        }`}
                      >
                        <motion.div
                          animate={{ x: settings.marketingRestock ? 22 : 2 }}
                          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                        />
                      </button>
                    </div>

                    {/* Night Notification */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                          <Moon className="w-4 h-4 text-purple-300" />
                        </div>
                        <div>
                          <div className="text-white text-sm">야간 알림 허용</div>
                          <div className="text-white/40 text-xs">21:00 ~ 08:00 알림 수신</div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSetting('nightPush')}
                        className={`relative w-10 h-6 rounded-full transition-colors ${
                          settings.nightPush ? 'bg-purple-500' : 'bg-white/20'
                        }`}
                      >
                        <motion.div
                          animate={{ x: settings.nightPush ? 22 : 2 }}
                          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Additional Settings Section */}
        <div className="mt-8 space-y-3">
          <h2 className="text-white text-lg mb-4 px-2">기타 설정</h2>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal('privacy')}
            className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-white transition-colors"
          >
            개인정보 처리방침
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal('terms')}
            className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-white transition-colors"
          >
            서비스 이용약관
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal('info')}
            className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-white transition-colors"
          >
            앱 정보
          </motion.button>
        </div>

        {/* Version Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center text-white/40 text-sm"
        >
          <p>오시쿠지 App</p>
          <p className="mt-1">Version 1.0.0</p>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] border-2 border-teal-400/50 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-xl">
                  {showModal === 'privacy' && '개인정보 처리방침'}
                  {showModal === 'terms' && '서비스 이용약관'}
                  {showModal === 'info' && '앱 정보'}
                </h2>
                <button
                  onClick={() => setShowModal(null)}
                  className="p-2 bg-rose-500 rounded-full hover:bg-rose-600 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto text-white/80 space-y-4 text-sm">
                {showModal === 'privacy' && (
                  <div className="space-y-4">
                    <section>
                      <h3 className="font-semibold text-yellow-400 mb-2">개인정보 처리방침</h3>
                      <p className="mb-2">회사는 개인정보보호법에 따라 이용자의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.</p>
                      <p className="text-white/70">수집하는 개인정보 항목: 이메일, 휴대폰번호, 배송주소, 결제정보, 사업자등록증 등</p>
                      <p className="text-white/70 mt-1">보유 및 이용기간: 회원 탈퇴 시까지 (단, 관계 법령에 따라 보존할 필요가 있는 경우 해당 기간 동안 보관)</p>
                    </section>
                    <section>
                      <h3 className="font-semibold text-yellow-400 mb-2">개인정보의 제3자 제공</h3>
                      <p>회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 상품 배송을 위해 배송업체에 성명, 연락처, 주소가 제공됩니다.</p>
                    </section>
                  </div>
                )}
                
                {showModal === 'terms' && (
                  <div className="space-y-4">
                    <section>
                      <h3 className="font-semibold text-yellow-400 mb-2">제1조 (목적)</h3>
                      <p>본 약관은 일본 오시쿠지 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
                    </section>
                    <section>
                      <h3 className="font-semibold text-yellow-400 mb-2">제2조 (서비스의 제공)</h3>
                      <p>회사는 다음과 같은 서비스를 제공합니다:</p>
                      <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                        <li>일본 애니메이션 관련 쿠지 복권 판매</li>
                        <li>당첨 결과 확인 및 배송 서비스</li>
                        <li>상품 구매 내역 및 당첨 내역 관리</li>
                        <li>찜 목록 및 알림 서비스</li>
                      </ul>
                    </section>
                    <section>
                      <h3 className="font-semibold text-yellow-400 mb-2">제5조 (환불 및 교환)</h3>
                      <p>쿠지 복권의 특성상 구매 후 환불 및 교환이 불가능합니다. 단, 상품 하자 또는 배송 오류가 있는 경우 교환이 가능합니다.</p>
                    </section>
                  </div>
                )}

                 {showModal === 'info' && (
                  <>
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        <Ticket className="w-24 h-24 text-amber-400" />
                      </div>
                      <h3 className="text-white text-2xl mb-2">오시쿠지</h3>
                      <p className="text-white/60 mb-4">가장 빠른 온라인 샵, 오시쿠지</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 mt-4">
                      <h3 className="text-white mb-1">앱 버전</h3>
                      <p className="text-white/60 mb-4">Version 1.0.0 (최신 버전입니다)</p>
                      <h3 className="text-white mb-1">개발사</h3>
                      <p className="text-white/60 mb-4">Oshikuji Kuji Korea</p>
                      <h3 className="text-white mb-1">고객센터</h3>
                      <p className="text-white/60">help@oshikuji.com</p>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => setShowModal(null)}
                className="mt-4 w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 rounded-xl hover:from-amber-300 hover:to-amber-400 transition-all"
              >
                닫기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
