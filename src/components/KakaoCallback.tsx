import { useEffect, useRef, useState } from "react";
import SocialConsent, { type SocialAgreements } from "./SocialConsent";
import { motion } from "./motion";
import { Ticket } from "./icons";
import { loginWithKakao, completeSocialSignup, fetchMyProfile } from "../api/auth";

type KakaoCallbackProps = {
  onLoginSuccess: (token: string, userData: any) => void;
  onLoginFailure: (error: string) => void;
};

export default function KakaoCallback({
  onLoginSuccess,
  onLoginFailure,
}: KakaoCallbackProps) {
  const handled = useRef(false);
  // 신규 회원이면 약관 동의 화면을 띄우고, 동의하면 가입 표로 가입을 마친다
  const [signupTicket, setSignupTicket] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const finishLogin = async (token: string) => {
    localStorage.setItem("token", token);
    sessionStorage.removeItem("token");
    const userData = await fetchMyProfile();
    onLoginSuccess(token, userData);
  };

  const handleConsent = async (agreements: SocialAgreements) => {
    if (!signupTicket) return;
    setSubmitting(true);
    try {
      const data = await completeSocialSignup(signupTicket, agreements);
      await finishLogin(data.token);
    } catch (error: any) {
      onLoginFailure(error.response?.data?.message || error.message || "가입을 완료하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    const params = new URLSearchParams(window.location.search);
    window.history.replaceState({}, document.title, window.location.pathname);
    const code = params.get("code");
    const expectedState = sessionStorage.getItem("oauth_state_kakao");
    sessionStorage.removeItem("oauth_state_kakao");

    if (!expectedState || params.get("state") !== expectedState) {
      onLoginFailure("로그인 요청을 확인할 수 없습니다. 다시 시도해주세요.");
      return;
    }

    if (code) {
      handleKakaoLogin(code);
    } else {
      onLoginFailure("인가 코드를 찾을 수 없습니다.");
    }
  }, []);

  const handleKakaoLogin = async (code: string) => {
    try {
      const REDIRECT_URI = `${window.location.origin}/auth/kakao/callback`;
      // 인가 코드 교환은 비밀 키를 보관하는 서버에서 처리합니다.
      const data = await loginWithKakao(code, REDIRECT_URI);
      if (data.isNewUser && !data.token) {
        if ((data as any).signupTicket) { setSignupTicket((data as any).signupTicket); return; }
        throw new Error("가입 정보를 확인하지 못했습니다. 다시 로그인해 주세요.");
      }
      await finishLogin(data.token);
    } catch (error: any) {
      console.error("Kakao Login Error:", error);
      onLoginFailure(error.message || "서버 통신 중 오류가 발생했습니다.");
    }
  };

  if (signupTicket) {
    return <SocialConsent providerName="카카오" submitting={submitting} onSubmit={handleConsent} onCancel={() => onLoginFailure("약관에 동의해야 가입할 수 있어요.")} />;
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-800 p-6">
      <motion.div
        animate={{
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="mb-8"
      >
        <Ticket className="w-24 h-24 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]" />
      </motion.div>

      <h2 className="text-white text-2xl font-bold mb-2">카카오 로그인 중...</h2>
      <p className="text-slate-400 text-center">
        잠시만 기다려 주세요. 행운의 문이 열리고 있습니다.
      </p>

      {/* Loading bar */}
      <div className="w-64 h-2 bg-white/10 rounded-full mt-8 overflow-hidden">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-full h-full bg-gradient-to-r from-rose-500 to-amber-400"
        />
      </div>
    </div>
  );
}
