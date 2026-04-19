import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from './motion';
import { ChevronLeft, Mail, Building2, Users, Eye, EyeOff, X, Ticket } from './icons';
import { toast } from 'sonner';
import Signup from './Signup';

// Auth Migration: Login.tsx updated.



type LoginProps = {
  onLogin: (user: { name: string; email: string; type: 'social' | 'business' }) => void;
  onBack: () => void;
};

export default function Login({ onLogin, onBack }: LoginProps) {
  const [activeTab, setActiveTab] = useState<'customer' | 'business'>('customer');
  const [showSignup, setShowSignup] = useState(false);
  const [userId, setUserId] = useState('');
  const [userPw, setUserPw] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showFindId, setShowFindId] = useState(false);
  const [showFindPw, setShowFindPw] = useState(false);
  const [findEmail, setFindEmail] = useState('');
  const [findPhone, setFindPhone] = useState('');
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Refs for input fields
  const customerPwRef = useRef<HTMLInputElement>(null);
  const businessPwRef = useRef<HTMLInputElement>(null);
  const adminPwRef = useRef<HTMLInputElement>(null);

  const handleSocialLogin = (provider: 'kakao' | 'naver' | 'google') => {
    if (provider === 'kakao') {
      const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY || "YOUR_KAKAO_REST_API_KEY";
      const REDIRECT_URI = `${window.location.origin}/auth/kakao/callback`;
      const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;

      window.location.href = KAKAO_AUTH_URL;
      return;
    }

    // Other providers mock
    toast.info(`${provider} 로그인은 준비 중입니다.`);
  };

  const handleIdPwLogin = async (e: React.FormEvent, type: 'customer' | 'business') => {
    e.preventDefault();
    if (!userId || !userPw) return;

    try {
      const response = await fetch("/api/members/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userId, password: userPw }),
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || "로그인에 실패했습니다.");
      }

      const token = await response.text();
      localStorage.setItem("token", token);

      // Fetch user info to get role and status
      const infoResponse = await fetch("/api/members/me", {
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!infoResponse.ok) throw new Error("사용자 정보를 불러오는데 실패했습니다.");

      const userData = await infoResponse.json();
      const userRole = userData.role || "USER";
      onLogin({
        name: userData.nickname || userData.name,
        email: userData.email,
        type: (userRole === "BIZ" ? "business" : userRole === "ADMIN" ? "admin" : "social") as any,
        isActive: userData.isActive !== undefined ? userData.isActive : true
      } as any);

      toast.success("로그인 성공!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const handleSignupComplete = (type: 'registered' | 'requested') => {
    setShowSignup(false);
    setActiveTab('customer');
  };

  const handleFindId = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock find ID
    toast.success(`입력하신 이메일/휴대폰으로 이메일 정보를 전송했습니다.\n이메일: user123`);
    setShowFindId(false);
    setFindEmail('');
    setFindPhone('');
  };

  const handleFindPw = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock find password
    toast.success(`입력하신 이메일/휴대폰으로 임시 비밀번호를 전송했습니다.`);
    setShowFindPw(false);
    setFindEmail('');
    setFindPhone('');
  };

  const handleLogoClick = () => {
    setLogoClickCount(prev => prev + 1);
    if (logoClickCount + 1 >= 7) {
      setShowAdminLogin(true);
      setLogoClickCount(0);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Admin credentials: admin / admin1234
    if (userId === 'admin' && userPw === 'admin1234') {
      setTimeout(() => {
        onLogin({
          name: '시스템 관리자',
          email: 'admin@ichiban.com',
          type: 'admin' as any
        });
      }, 500);
    } else {
      toast.error('관리자 인증에 실패했습니다.');
    }
  };

  if (showSignup) {
    return (
      <Signup
        userType={activeTab}
        onBack={() => setShowSignup(false)}
        onComplete={handleSignupComplete}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-slate-900 to-indigo-950 border-b-2 border-teal-400/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="p-2 bg-rose-500 rounded-full hover:bg-rose-600 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-xl">로그인</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md"
        >
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <motion.button
              onClick={handleLogoClick}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-4 flex justify-center mx-auto"
            >
              <Ticket className="w-24 h-24 text-amber-400" />
            </motion.button>
            <h2 className="text-white text-3xl mb-2">一番쿠지</h2>
            <p className="text-slate-300">로그인하고 쿠지를 구매하세요</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setActiveTab('customer');
                setUserId('');
                setUserPw('');
              }}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${activeTab === 'customer'
                  ? 'bg-gradient-to-r from-rose-500 to-indigo-600 text-white shadow-lg'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
            >
              <Users className="w-5 h-5" />
              <span>일반 고객</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('business');
                setUserId('');
                setUserPw('');
              }}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${activeTab === 'business'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 shadow-lg'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
            >
              <Building2 className="w-5 h-5" />
              <span>사업자</span>
            </button>
          </div>

          {activeTab === 'customer' ? (
            /* Customer Login */
            <motion.div
              key="customer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* ID/PW Login Form */}
              <form onSubmit={(e: React.FormEvent) => handleIdPwLogin(e, 'customer')} className="space-y-3 mb-6">
                <input
                  type="text"
                  value={userId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserId(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      customerPwRef.current?.focus();
                    }
                  }}
                  placeholder="이메일"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-pink-400"
                  required
                />
                <input
                  type="password"
                  value={userPw}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserPw(e.target.value)}
                  placeholder="비밀번호"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-pink-400"
                  required
                  ref={customerPwRef}
                />

                {/* Remember Me Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/30 bg-white/10 text-pink-500 focus:ring-pink-400 focus:ring-offset-0"
                  />
                  <label htmlFor="rememberMe" className="text-white/80 text-sm cursor-pointer select-none">
                    로그인 유지
                  </label>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-rose-500 to-indigo-600 text-white rounded-xl shadow-xl"
                >
                  <div className="text-center">로그인</div>
                </motion.button>
              </form>

              <div className="flex justify-between text-sm mb-6">
                <button
                  type="button"
                  onClick={() => setShowFindId(true)}
                  className="text-purple-300 hover:text-white"
                >
                  이메일 찾기
                </button>
                <button
                  type="button"
                  onClick={() => setShowFindPw(true)}
                  className="text-purple-300 hover:text-white"
                >
                  비밀번호 찾기
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/30"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gradient-to-b from-purple-900 via-blue-900 to-purple-800 text-white/60">
                    간편 로그인
                  </span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3">
                {/* Kakao Login */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSocialLogin('kakao')}
                  className="w-full py-3 bg-[#FEE500] text-[#000000] rounded-xl flex items-center justify-center gap-3 shadow-xl"
                >
                  <div className="w-5 h-5 bg-[#000000] rounded-full flex items-center justify-center text-[#FEE500] text-xs">
                    K
                  </div>
                  <span>카카오 로그인</span>
                </motion.button>

                {/* Naver Login */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSocialLogin('naver')}
                  className="w-full py-3 bg-[#03C75A] text-white rounded-xl flex items-center justify-center gap-3 shadow-xl"
                >
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-[#03C75A] text-xs">
                    N
                  </div>
                  <span>네이버 로그인</span>
                </motion.button>

                {/* Google Login */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSocialLogin('google')}
                  className="w-full py-3 bg-white text-gray-700 rounded-xl flex items-center justify-center gap-3 shadow-xl"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>구글 로그인</span>
                </motion.button>
              </div>

              <div className="text-center text-white/50 text-xs mt-4">
                ※ OAuth 연동은 데모 환경에서 모의 로그인으로 처리됩니다
              </div>

              {/* Signup Button */}
              <div className="pt-6 border-t border-white/20 mt-6">
                <div className="text-center mb-3">
                  <span className="text-white/70 text-sm">아직 회원이 아니신가요?</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSignup(true)}
                  className="w-full py-3 bg-white/10 border border-pink-400/50 text-pink-300 rounded-xl hover:bg-white/20 transition-colors"
                >
                  <div className="text-center">회원가입</div>
                </motion.button>
              </div>
            </motion.div>
          ) : (
            /* Business Login */
            <motion.form
              key="business"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={(e: React.FormEvent) => handleIdPwLogin(e, 'business')}
              className="space-y-4"
            >
              <div>
                <label className="block text-white mb-2">이메일</label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserId(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      businessPwRef.current?.focus();
                    }
                  }}
                  placeholder="이메일을 입력하세요"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">비밀번호</label>
                <input
                  type="password"
                  value={userPw}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserPw(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
                  required
                  ref={businessPwRef}
                />
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMeBusiness"
                  checked={rememberMe}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/30 bg-white/10 text-yellow-500 focus:ring-yellow-400 focus:ring-offset-0"
                />
                <label htmlFor="rememberMeBusiness" className="text-white/80 text-sm cursor-pointer select-none">
                  로그인 유지
                </label>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 rounded-xl text-lg shadow-xl mt-6"
              >
                <div className="text-center">사업자 로그인</div>
              </motion.button>

              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setShowFindId(true)}
                  className="text-yellow-400 hover:underline"
                >
                  이메일 찾기
                </button>
                <button
                  type="button"
                  onClick={() => setShowFindPw(true)}
                  className="text-yellow-400 hover:underline"
                >
                  비밀번호 찾기
                </button>
              </div>

              <div className="pt-6 border-t border-white/20 mt-6">
                <div className="text-center mb-3">
                  <span className="text-white/70 text-sm">아직 사업자 등록이 안되셨나요?</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setShowSignup(true)}
                  className="w-full py-3 bg-white/10 border border-yellow-400/50 text-yellow-300 rounded-xl hover:bg-white/20 transition-colors"
                >
                  <div className="text-center">사업자 등록 신청</div>
                </motion.button>
              </div>
            </motion.form>
          )}
        </motion.div>
      </div>

      {/* Find ID Modal */}
      <AnimatePresence>
        {showFindId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFindId(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                className="bg-gradient-to-br from-purple-800 to-blue-900 rounded-2xl p-6 w-full max-w-md border border-white/20 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white text-xl">이메일 찾기</h2>
                  <button
                    onClick={() => setShowFindId(false)}
                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                <form onSubmit={handleFindId} className="space-y-4">
                  <div>
                    <label className="block text-white mb-2">이메일</label>
                    <input
                      type="email"
                      value={findEmail}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFindEmail(e.target.value)}
                      placeholder="이메일을 입력하세요"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-pink-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">휴대폰 번호</label>
                    <input
                      type="tel"
                      value={findPhone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFindPhone(e.target.value)}
                      placeholder="010-0000-0000"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-pink-400"
                      required
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl shadow-xl mt-4"
                  >
                    <div className="text-center">이메일 찾기</div>
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Find Password Modal */}
      <AnimatePresence>
        {showFindPw && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFindPw(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                className="bg-gradient-to-br from-purple-800 to-blue-900 rounded-2xl p-6 w-full max-w-md border border-white/20 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white text-xl">비밀번호 찾기</h2>
                  <button
                    onClick={() => setShowFindPw(false)}
                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                <form onSubmit={handleFindPw} className="space-y-4">
                  <div>
                    <label className="block text-white mb-2">이메일</label>
                    <input
                      type="text"
                      placeholder="이메일을 입력하세요"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-pink-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">이메일</label>
                    <input
                      type="email"
                      value={findEmail}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFindEmail(e.target.value)}
                      placeholder="이메일을 입력하세요"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-pink-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">휴대폰 번호</label>
                    <input
                      type="tel"
                      value={findPhone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFindPhone(e.target.value)}
                      placeholder="010-0000-0000"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-pink-400"
                      required
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl shadow-xl mt-4"
                  >
                    <div className="text-center">비밀번호 찾기</div>
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdminLogin(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                className="bg-gradient-to-br from-purple-800 to-blue-900 rounded-2xl p-6 w-full max-w-md border border-white/20 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white text-xl">관리자 로그인</h2>
                  <button
                    onClick={() => setShowAdminLogin(false)}
                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="block text-white mb-2">이메일</label>
                    <input
                      type="text"
                      value={userId}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserId(e.target.value)}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                          e.preventDefault();
                          adminPwRef.current?.focus();
                        }
                      }}
                      placeholder="이메일을 입력하세요"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-pink-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">비밀번호</label>
                    <input
                      type="password"
                      value={userPw}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserPw(e.target.value)}
                      placeholder="비밀번호를 입력하세요"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-pink-400"
                      required
                      ref={adminPwRef}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl shadow-xl mt-4"
                  >
                    <div className="text-center">이메일 로그인</div>
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}