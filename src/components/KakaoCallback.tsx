import { useEffect, useRef } from "react";
import { motion } from "./motion";
import { Ticket } from "./icons";
import { loginWithKakao, fetchMyProfile } from "../api/auth";

type KakaoCallbackProps = {
  onLoginSuccess: (token: string, userData: any) => void;
  onLoginFailure: (error: string) => void;
};

export default function KakaoCallback({
  onLoginSuccess,
  onLoginFailure,
}: KakaoCallbackProps) {
  const handled = useRef(false);

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
      const data = await loginWithKakao(code, REDIRECT_URI, true, true, false);
      
      if (data.isNewUser && !data.token) {
        throw new Error("신규 가입 처리에 실패했습니다. 약관 동의를 다시 확인해주세요.");
      }

      // 토큰으로 실제 사용자 상세 정보 가져오기
      localStorage.setItem("token", data.token);
      sessionStorage.removeItem("token");
      const userData = await fetchMyProfile();
      
      onLoginSuccess(data.token, userData);
    } catch (error: any) {
      console.error("Kakao Login Error:", error);
      onLoginFailure(error.message || "서버 통신 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-800 p-6">
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
