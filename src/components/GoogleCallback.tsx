import { useEffect } from "react";
import { motion } from "./motion";
import { Ticket } from "./icons";
import { loginWithGoogle, fetchMyProfile } from "../api/auth";

type GoogleCallbackProps = {
  onLoginSuccess: (token: string, userData: any) => void;
  onLoginFailure: (error: string) => void;
};

export default function GoogleCallback({
  onLoginSuccess,
  onLoginFailure,
}: GoogleCallbackProps) {
  useEffect(() => {
    // URL 해시(#) 파싱: #access_token=...&state=...&token_type=bearer&expires_in=3599
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const error = hashParams.get("error");
    const errorDescription = hashParams.get("error_description");

    if (error) {
      onLoginFailure(`구글 로그인 에러: ${errorDescription || error}`);
      return;
    }

    if (accessToken) {
      // 해시 값 제거 (보안 목적)
      window.history.replaceState({}, document.title, window.location.pathname);
      handleGoogleLogin(accessToken);
    } else {
      onLoginFailure("인가 토큰을 찾을 수 없습니다.");
    }
  }, []);

  const handleGoogleLogin = async (googleAccessToken: string, isTermsAgreed?: boolean, isPrivacyAgreed?: boolean, isMarketingAgreed?: boolean) => {
    try {
      const data = await loginWithGoogle(googleAccessToken, isTermsAgreed, isPrivacyAgreed, isMarketingAgreed);

      // 신규 회원 → 약관 동의 필요
      if ((data as any).isNewUser && !(data as any).token) {
        const agreed = confirm(
          `[구글 로그인 - 약관 동의]\n\n` +
          `오시쿠지 서비스 이용을 위해 약관에 동의해 주세요.\n\n` +
          `• [필수] 이용약관 동의\n` +
          `• [필수] 개인정보 처리방침 동의\n\n` +
          `확인을 누르시면 동의하고 가입이 완료됩니다.`
        );
        if (!agreed) {
          onLoginFailure("약관 동의가 필요합니다.");
          return;
        }
        // 약관 동의 후 재시도
        await handleGoogleLogin(googleAccessToken, true, true, false);
        return;
      }

      localStorage.setItem("token", data.token);
      const userData = await fetchMyProfile();
      onLoginSuccess(data.token, userData);
    } catch (error: any) {
      console.error("Google Login Error:", error);
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
        <Ticket className="w-24 h-24 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
      </motion.div>

      <h2 className="text-white text-2xl font-bold mb-2">구글 로그인 중...</h2>
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
          className="w-full h-full bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500"
        />
      </div>
    </div>
  );
}
