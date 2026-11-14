import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from './motion';
import { ChevronLeft, Bell, Vibrate, Volume2, Truck, Gift, X, Ticket } from './icons';
import { toast } from 'sonner';
import { requestFirebaseToken } from '../api/firebase';
import { openKakaoChannel } from '../constants/support';
import PolicyContent from './PolicyContent';
import { POLICY_OPERATOR } from '../constants/policies';
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
  marketingAgreed?: boolean;
};

type SettingsProps = {
  onBack: () => void;
  user?: { name: string; email: string; type: 'social' | 'business' | 'admin' } | null;
  settings: NotificationSettingsState;
  onUpdateSettings: (settings: NotificationSettingsState) => void;
};

// iOS 스타일 스위치: 켜짐은 파란색, 손잡이가 부드럽게 미끄러진다
function Switch({ checked, onChange, disabled, label }: { checked: boolean; onChange: () => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={'relative h-[30px] w-[50px] flex-shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 disabled:cursor-not-allowed ' + (checked ? 'bg-blue-500' : 'bg-white/25')}
    >
      <motion.span
        initial={false}
        animate={{ x: checked ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 600, damping: 35 }}
        className="absolute left-0 top-[2px] h-[26px] w-[26px] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
      />
    </button>
  );
}

export default function Settings({ onBack, user, settings, onUpdateSettings }: SettingsProps) {
  const [showModal, setShowModal] = useState<'privacy' | 'terms' | 'info' | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasDeviceToken, setHasDeviceToken] = useState(() => Boolean(localStorage.getItem('fcm_token')));
  const pushConnected = settings.pushEnabled && hasDeviceToken;

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
    if (isSyncing) return;
    if (['marketingOpen', 'marketingRestock', 'marketingEvent', 'nightPush'].includes(key)
        && settings.marketingAgreed !== true) {
      toast.info('마케팅 수신에 동의한 계정에서 혜택 알림을 설정할 수 있습니다.');
      return;
    }
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
    if (isSyncing) return;
    if (!user) {
      toast.info('로그인 후 푸시 알림을 설정해 주세요.');
      return;
    }
    setIsSyncing(true);
    try {
      if (!pushConnected) {
        const token = await requestFirebaseToken();
        if (!token) {
          toast.error('기기 알림 권한과 브라우저 지원 여부를 확인해 주세요.');
          return;
        }
        await registerDeviceToken(token);
        await updateNotificationSettings({ pushEnabled: true });
        localStorage.setItem('fcm_token', token);
        setHasDeviceToken(true);
        onUpdateSettings({ ...settings, pushEnabled: true });
        toast.success('앱 푸시 알림을 켰습니다.');
      } else {
        // 한 요청이 실패해도 서버 수신 설정과 기기 토큰을 각각 정리합니다.
        const results = await Promise.allSettled([
          updateNotificationSettings({ pushEnabled: false }),
          deleteDeviceToken(),
        ]);
        if (results.every(result => result.status === 'rejected')) {
          throw new Error('알림 설정을 저장하지 못했습니다.');
        }
        localStorage.removeItem('fcm_token');
        setHasDeviceToken(false);
        onUpdateSettings({ ...settings, pushEnabled: false });
        if (results.some(result => result.status === 'rejected')) {
          toast.error('일부 기기 설정을 저장하지 못했습니다. 잠시 후 다시 확인해 주세요.');
        } else {
          toast.success('앱 푸시 알림을 껐습니다.');
        }
      }
    } catch {
      toast.error('알림 설정을 저장하지 못했습니다. 기기 권한과 네트워크를 확인해 주세요.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-full pb-6">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-slate-900 to-indigo-950 border-b-2 border-teal-400/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="p-2 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-xl text-center">설정</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-2xl mx-auto space-y-6">

        {/* 푸시 알림: 배송 출발·배송 완료만 기기 알림으로 보낸다 */}
        <section className="space-y-3">
          <h2 className="px-1 text-sm font-semibold text-white/80">푸시 알림</h2>
          <div className="overflow-hidden rounded-3xl border border-white/15 bg-white/10 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-500/25">
                <Bell className="h-5 w-5 text-blue-200" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-white">이 기기로 알림 받기</div>
                <div className="text-sm text-white/60">{pushConnected ? '배송 소식을 기기 알림으로 보내드려요' : '알림 권한을 허용하면 배송 소식을 받을 수 있어요'}</div>
              </div>
              <Switch checked={pushConnected} onChange={handlePushToggle} disabled={isSyncing} label="이 기기로 알림 받기" />
            </div>
            <div className={'divide-y divide-white/10 border-t border-white/10 transition-opacity ' + (pushConnected ? '' : 'pointer-events-none opacity-40')}>
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <Truck className="h-4 w-4 text-blue-200" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-white">배송 출발 알림</div>
                  <div className="text-xs text-white/50">판매자가 운송장을 등록하면 알려드려요</div>
                </div>
                <Switch checked={settings.kakaoDelivery} onChange={() => toggleSetting('kakaoDelivery')} disabled={isSyncing || !pushConnected} label="배송 출발 알림" />
              </div>
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <Gift className="h-4 w-4 text-blue-200" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-white">배송 완료 알림</div>
                  <div className="text-xs text-white/50">상품이 도착 처리되면 알려드려요</div>
                </div>
                <Switch checked={settings.kakaoWinning} onChange={() => toggleSetting('kakaoWinning')} disabled={isSyncing || !pushConnected} label="배송 완료 알림" />
              </div>
            </div>
          </div>
          <p className="px-1 text-xs leading-5 text-white/45">배송 신청·문의 답변 등 다른 소식은 앱 안의 알림함에서 확인할 수 있어요.</p>
        </section>

        {/* 개봉 효과 */}
        <section className="space-y-3">
          <h2 className="px-1 text-sm font-semibold text-white/80">개봉 효과</h2>
          <div className="divide-y divide-white/10 overflow-hidden rounded-3xl border border-white/15 bg-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/10"><Vibrate className="h-4 w-4 text-blue-200" /></div>
              <div className="flex-1 text-sm font-medium text-white">진동</div>
              <Switch checked={settings.vibrationEnabled} onChange={() => toggleSetting('vibrationEnabled')} disabled={isSyncing} label="진동" />
            </div>
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/10"><Volume2 className="h-4 w-4 text-blue-200" /></div>
              <div className="flex-1 text-sm font-medium text-white">소리</div>
              <Switch checked={settings.soundEnabled} onChange={() => toggleSetting('soundEnabled')} disabled={isSyncing} label="소리" />
            </div>
          </div>
        </section>


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
                  className="p-2 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto text-white/80 space-y-4 text-sm">
                {(showModal === 'privacy' || showModal === 'terms') && (
                  <PolicyContent kind={showModal} />
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
                      <h3 className="text-white mb-1">운영사업자</h3>
                      <p className="text-white/60 mb-4">{POLICY_OPERATOR.businessName}</p>
                      <h3 className="text-white mb-2">고객센터</h3>
                      <button 
                        onClick={openKakaoChannel}
                        className="w-full py-3 bg-[#FEE500] text-[#191919] font-bold rounded-xl shadow-md hover:bg-[#F4DC00] transition-transform active:scale-95 flex items-center justify-center gap-2"
                      >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                          <path d="M12 3c-5.52 0-10 3.58-10 8 0 2.86 1.83 5.37 4.6 6.84l-1.07 3.92c-.12.44.38.77.74.52l4.63-3.11c.36.03.73.05 1.1.05 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
                        </svg>
                        카카오톡 채널 문의하기
                      </button>
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
