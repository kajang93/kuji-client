import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import TermsConsentModal from './TermsConsentModal';

export default function KakaoCallback() {
    const hasProcessed = useRef(false);
    const isFetching = useRef(false); // 💡 백엔드 전송 중인지 확인용 깃발 (중복 전송 방지!)
    
    // 💡 약관 동의 관련 상태
    const [showTerms, setShowTerms] = useState(false);
    const [kakaoToken, setKakaoToken] = useState<string | null>(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        
        if (hasProcessed.current) return;
        
        if (code) {
            hasProcessed.current = true;
            
            // 💡 핵심 해결사: 백엔드 가기 전에 브라우저 주소창에서 '?code=...'를 지워버립니다!
            // 이렇게 하면 컴포넌트가 다시 그려져도 더 이상 'code'가 없어서 함수가 호출되지 않습니다.
            window.history.replaceState({}, '', window.location.pathname);
            
            processKakaoLogin(code);
        } else {
            console.error("No code found in URL");
            alert("로그인 코드를 찾을 수 없습니다.");
            window.location.href = "/";
        }
    }, []);

    const processKakaoLogin = async (code: string) => {
        console.count("API CALL"); // 💡 브라우저 콘솔에서 호출 횟수 확인용
        try {
            // [STEP 1] 프론트엔드 ➡️ 카카오 : "코드 줄 테니까 카카오 토큰 내놔!"
            const REST_API_KEY = "3050c3bedc5ae2c5f9100cf869556c4a";
            const CLIENT_SECRET = "RMBwZwdl4zFX8eloNYqXikpMH8R8yF40"; // 💡 카카오 콘솔에서 확인된 시크릿 키!
            const REDIRECT_URI = "http://localhost:5173/auth/kakao/callback";

            const kakaoTokenRes = await axios.post("https://kauth.kakao.com/oauth/token", null, {
                params: {
                    grant_type: "authorization_code",
                    client_id: REST_API_KEY,
                    client_secret: CLIENT_SECRET,
                    redirect_uri: REDIRECT_URI,
                    code: code
                },
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            });

            const kakaoAccessToken = kakaoTokenRes.data.access_token;
            setKakaoToken(kakaoAccessToken); // 동의 팝업 후 재사용을 위해 저장

            // [STEP 2] 프론트엔드 ➡️ 우리 백엔드 : "이 토큰으로 로그인/가입 시켜줘!"
            await handleBackendLogin(kakaoAccessToken);

        } catch (error: any) {
            handleError(error);
        }
    };

    // 💡 백엔드 로그인 처리 엔진
    const handleBackendLogin = async (accessToken: string, agreements?: any) => {
        if (isFetching.current) return; // 💡 이미 요청 중이라면 무시!
        isFetching.current = true; // 💡 요청 시작 표시

        try {
            const ourBackendRes = await axios.post("http://localhost:8080/api/members/login/kakao", {
                kakaoAccessToken: accessToken,
                ...agreements // 약관 동의 데이터 (있을 경우만)
            });

            const data = ourBackendRes.data;

            // 만약 신규 회원이라 약관 동의가 필요하다면? (전략 B)
            if (data.isNewUser && !data.token) {
                console.log("🔔 [Kakao-Callback] 신규 회원 감지 - 약관 동의 팝업 오픈");
                setShowTerms(true);
                return;
            }

            // 가입/로그인 성공 시
            const kujiJwtToken = data.token;
            localStorage.setItem("token", kujiJwtToken);
            
            alert(data.isNewUser ? "회원가입 및 로그인이 완료되었습니다!" : "카카오 로그인 성공!");
            window.location.href = "/";

        } catch (error: any) {
            handleError(error);
        }
    };

    // 약관 동의 완료 시 호출
    const handleTermsConfirm = (agreements: any) => {
        setShowTerms(false);
        if (kakaoToken) {
            handleBackendLogin(kakaoToken, agreements);
        }
    };

    const handleError = (error: any) => {
        console.error("❌ 에러 발생:", error);
        let errorMessage = "로그인 중 오류가 발생했습니다.";
        if (error.response) {
            console.error("상태:", error.response.status, "데이터:", error.response.data);
            errorMessage += ` (코드: ${error.response.status})`;
        }
        alert(errorMessage);
        window.location.href = "/";
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-rose-200 opacity-20 rounded-full"></div>
            </div>

            <h2 className="text-2xl font-bold text-center mb-2 animate-pulse">
                {showTerms ? "약관 동의 대기 중" : "카카오 로그인 처리 중"}
            </h2>
            <p className="text-slate-400 text-center">
                {showTerms ? "서비스 이용을 위해 약관에 동의해 주세요." : "잠시만 기다려주세요. 안전하게 로그인 중입니다..."}
            </p>

            {/* 💡 약관 동의 팝업 모달 */}
            <TermsConsentModal 
                isOpen={showTerms}
                onClose={() => window.location.href = "/"}
                onConfirm={handleTermsConfirm}
            />
        </div>
    );
}
