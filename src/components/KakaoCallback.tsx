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
      // [STEP 1] 프런트엔드 ➡️ 카카오 : "인가 코드 줄 테니까 액세스 토큰 내놔!"
      const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
      const CLIENT_SECRET = import.meta.env.VITE_KAKAO_CLIENT_SECRET;
      const REDIRECT_URI = `${window.location.origin}/auth/kakao/callback`;

      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('client_id', REST_API_KEY);
      params.append('client_secret', CLIENT_SECRET);
      params.append('redirect_uri', REDIRECT_URI);
      params.append('code', code);

      const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });

      if (!tokenResponse.ok) {
        throw new Error("카카오 토큰 발급에 실패했습니다.");
      }

      const tokenData = await tokenResponse.json();
      const kakaoAccessToken = tokenData.access_token;

      // [STEP 2] 프런트엔드 ➡️ 우리 백엔드 : "이 토큰(kakaoAccessToken)으로 로그인시켜줘!"
      const response = await fetch("/api/members/login/kakao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          kakaoAccessToken: kakaoAccessToken 
        }),
      });

      if (!response.ok) {
        throw new Error("서비스 로그인 요청에 실패했습니다.");
      }

      const data = await response.json();
      
      // 토큰으로 실제 사용자 상세 정보(/api/members/me) 가져오기
      const infoResponse = await fetch("/api/members/me", {
        headers: { "Authorization": `Bearer ${data.token}` },
      });
      
      if (!infoResponse.ok) throw new Error("사용자 정보를 불러오는데 실패했습니다.");
      
      const userData = await infoResponse.json();
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
