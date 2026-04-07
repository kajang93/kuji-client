import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import TermsConsentModal from './TermsConsentModal';

export default function KakaoCallback() {
    const hasProcessed = useRef(false);
    const isFetching = useRef(false); // 💡 백엔드 전송 중인지 확인용 깃발 (중복 전송 방지!)

    // 💡 약관 동의 및 성공 처리 상태
    const [showTerms, setShowTerms] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false); // 💡 성공 화면 표시용
    const [kakaoToken, setKakaoToken] = useState<string | null>(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (hasProcessed.current) return;

        if (code) {
            hasProcessed.current = true;

            // 💡 핵심 해결사: 백엔드 가기 전에 브라우저 주소창에서 '?code=...'를 지워버립니다!
            window.history.replaceState({}, '', window.location.pathname);

            processKakaoLogin(code);
        } else {
            console.error("No code found in URL");
            alert("로그인 코드를 찾을 수 없습니다.");
            window.location.href = "/";
        }
    }, []);

    const processKakaoLogin = async (code: string) => {
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

            // 💡 UX 개편: alert 대신 성공 화면을 띄우고 1.5초 뒤 이동합니다.
            setIsSuccess(true);
            setTimeout(() => {
                window.location.href = "/";
            }, 1500);

        } catch (error: any) {
            handleError(error);
        } finally {
            // 💡 중요: 요청이 끝났으므로(성공/실패/팝업) 깃발을 내려서 다음 요청이 가능하게 합니다.
            isFetching.current = false;
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

    // Case 1: 로그인 성공 (Celebration!)
    if (isSuccess) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-4 font-sans animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-rose-500 rounded-full flex items-center justify-center mb-10 shadow-2xl shadow-rose-500/40 animate-bounce">
                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-white mb-4 tracking-tighter">
                    로그인 성공!
                </h2>
                <p className="text-slate-400 font-medium">잠시 후 메인 화면으로 이동합니다...</p>
                
                {/* Decorative particles */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-rose-500 rounded-full animate-ping delay-300" />
            </div>
        );
    }

    // Case 2: 약관 동의가 필요한 신규 회원인 경우
    if (showTerms) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-4 font-sans animate-in fade-in duration-500">
                <div className="flex flex-col items-center zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mb-8 border border-indigo-500/20">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-400 mb-4 tracking-tight">
                        본인 인증 대기 중
                    </h2>
                    <p className="text-slate-600 font-medium text-center max-w-[280px] mb-8">
                        서비스 이용을 위해<br />팝업창에서 동의를 진행해 주세요.
                    </p>
                </div>

                <TermsConsentModal
                    isOpen={showTerms}
                    onClose={() => window.location.href = "/"}
                    onConfirm={handleTermsConfirm}
                />
            </div>
        );
    }

    // Case 2: 일반적인 로딩/처리 중인 경우
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-4 font-sans">
            <div className="flex flex-col items-center animate-in fade-in duration-700">
                <div className="relative mb-8">
                    <div className="w-20 h-20 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
                    <div className="absolute inset-0 bg-rose-500/10 blur-2xl rounded-full animate-pulse" />
                </div>
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-400 mb-4 tracking-tight text-center">
                    카카오 로그인 처리 중
                </h2>
                <p className="text-slate-500 font-medium text-center">
                    잠시만 기다려주세요. 안전하게 로그인 중입니다...
                </p>
            </div>
        </div>
    );
}
