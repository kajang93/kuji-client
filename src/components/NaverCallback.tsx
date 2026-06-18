import { useEffect } from "react";
import { motion } from "./motion";
import { Ticket } from "./icons";
import { loginWithNaver, fetchMyProfile } from "../api/auth";

type NaverCallbackProps = {
  onLoginSuccess: (token: string, userData: any) => void;
  onLoginFailure: (error: string) => void;
};

export default function NaverCallback({
  onLoginSuccess,
  onLoginFailure,
}: NaverCallbackProps) {
  useEffect(() => {
    // URL 해시(#) 파싱: #access_token=...&state=...&token_type=bearer&expires_in=3600
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const error = hashParams.get("error");
    const errorDescription = hashParams.get("error_description");

    if (error) {
      onLoginFailure(`네이버 로그인 에러: ${errorDescription || error}`);
      return;
    }

    if (accessToken) {
      // 해시 값 제거 (보안 목적)
      window.history.replaceState({}, document.title, window.location.pathname);
      handleNaverLogin(accessToken);
    } else {
      onLoginFailure("인가 토큰을 찾을 수 없습니다.");
    }
  }, []);

  const handleNaverLogin = async (naverAccessToken: string) => {
    try {
      // 카카오와 동일하게 무조건 필수 약관 동의를 true로 넘겨서 가입 처리
      const data = await loginWithNaver(naverAccessToken, true, true, false);

      if ((data as any).isNewUser && !(data as any).token) {
        throw new Error("신규 가입 처리에 실패했습니다. 약관 동의를 다시 확인해주세요.");
      }

      localStorage.setItem("token", data.token);
      const userData = await fetchMyProfile();
      onLoginSuccess(data.token, userData);
    } catch (error: any) {
      console.error("Naver Login Error:", error);
      const errorMessage = error.response?.data?.message || error.message || "서버 통신 중 오류가 발생했습니다.";
      onLoginFailure(errorMessage);
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
        <Ticket className="w-24 h-24 text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]" />
      </motion.div>

      <h2 className="text-white text-2xl font-bold mb-2">네이버 로그인 중...</h2>
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
          className="w-full h-full bg-gradient-to-r from-green-500 to-green-300"
        />
      </div>
    </div>
  );
}
