import { useEffect } from "react";
import { motion } from "./motion";
import { Ticket } from "./icons";

type KakaoCallbackProps = {
  onLoginSuccess: (token: string, userData: any) => void;
  onLoginFailure: (error: string) => void;
};

export default function KakaoCallback({
  onLoginSuccess,
  onLoginFailure,
}: KakaoCallbackProps) {
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");

    if (code) {
      handleKakaoLogin(code);
    } else {
      onLoginFailure("인가 코드를 찾을 수 없습니다.");
    }
  }, []);

  const handleKakaoLogin = async (code: string) => {
    try {
      // 1. 카카오 인가 코드를 우리 백엔드로 전달
      const response = await fetch("/api/members/login/kakao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error("로그인 요청에 실패했습니다.");
      }

      const data = await response.json();
      // 백엔드 응답 구조에 따라 수정 필요 (예: data.accessToken, data.user)
      onLoginSuccess(data.token, data.user);
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
