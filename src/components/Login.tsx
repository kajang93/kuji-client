import React, { useState } from "react";
import { X, Mail, Lock, ChevronRight, LayoutDashboard, ShieldCheck } from "lucide-react";
import axios from "axios";

interface LoginProps {
    onLogin: (userData: {
        name: string;
        email: string;
        type: "social" | "business" | "admin";
    }) => void;
    onBack: () => void;
    onSignUp: () => void;
}

export default function Login({ onLogin, onBack, onSignUp }: LoginProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showStaffLogin, setShowStaffLogin] = useState(false);

    const handleKakaoLogin = () => {
        const REST_API_KEY = "3050c3bedc5ae2c5f9100cf869556c4a";
        const REDIRECT_URI = "http://localhost:5173/auth/kakao/callback";
        const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
        window.location.href = kakaoAuthUrl;
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await axios.post("http://localhost:8080/api/members/login", {
                email,
                password,
            });
            const token = response.data;
            localStorage.setItem("token", token);
            
            // In a real app, you'd decode JWT to get name/type or call /api/members/me
            // For now, satisfy the onLogin expectation
            onLogin({
                name: email.split("@")[0],
                email: email,
                type: "social" // Regular user type
            });
        } catch (err: any) {
            setError("이메일 또는 비밀번호가 일치하지 않습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-rose-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />

            <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 max-w-md w-full relative shadow-3xl">
                <button
                    onClick={onBack}
                    className="absolute top-8 right-8 p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-10">
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-3 tracking-tight">
                        환영합니다!
                    </h2>
                    <p className="text-slate-400 text-sm font-medium">KUJI에서 당신만의 행운을 찾아보세요</p>
                </div>

                <div className="space-y-6">
                    {/* Social Login Section */}
                    <button
                        onClick={handleKakaoLogin}
                        className="w-full py-4 bg-[#FEE500] text-[#191919] font-bold rounded-2xl hover:bg-[#FDD835] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 shadow-xl shadow-yellow-500/10"
                    >
                        <img src="https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_medium.png" alt="Kakao" className="w-6 h-6" />
                        카카오로 1초 만에 시작하기
                    </button>

                    <div className="relative flex items-center gap-4 py-2">
                        <div className="h-px bg-white/5 flex-1" />
                        <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">또는 이메일로 로그인</span>
                        <div className="h-px bg-white/5 flex-1" />
                    </div>

                    {/* Email Login Form */}
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        {error && <p className="text-rose-400 text-xs text-center font-medium bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">{error}</p>}
                        
                        <div className="space-y-3">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-rose-400 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-800/40 border border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all font-medium"
                                    placeholder="이메일"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-800/40 border border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium"
                                    placeholder="비밀번호"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-white text-slate-950 font-bold rounded-2xl hover:bg-slate-200 active:scale-[0.98] transition-all duration-300 shadow-xl"
                        >
                            {loading ? "로그인 중..." : "로그인"}
                        </button>
                    </form>

                    <div className="flex justify-center items-center gap-2 text-sm">
                        <span className="text-slate-500">계정이 없으신가요?</span>
                        <button
                            onClick={onSignUp}
                            className="text-white font-bold hover:text-rose-400 transition-colors flex items-center"
                        >
                            회원가입 <ChevronRight className="w-4 h-4 ml-0.5" />
                        </button>
                    </div>
                </div>

                {/* Staff Login Subtle Section */}
                <div className="mt-12 pt-8 border-t border-white/5">
                    {!showStaffLogin ? (
                        <button
                            onClick={() => setShowStaffLogin(true)}
                            className="w-full text-slate-600 text-xs hover:text-slate-400 transition-colors flex items-center justify-center gap-1.5 font-medium"
                        >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            업무용 계정으로 로그인 (판매자/관리자)
                        </button>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <button
                                onClick={() => onLogin({ name: "판매자", email: "seller@example.com", type: "business" })}
                                className="py-2.5 bg-slate-800/60 text-slate-300 text-xs font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <LayoutDashboard className="w-3.5 h-3.5" />
                                판매자 센터
                            </button>
                            <button
                                onClick={() => onLogin({ name: "관리자", email: "admin@example.com", type: "admin" })}
                                className="py-2.5 bg-slate-800/60 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                시스템 관리
                            </button>
                            <button
                                onClick={() => setShowStaffLogin(false)}
                                className="col-span-2 text-[10px] text-slate-600 mt-1 hover:underline"
                            >
                                돌아가기
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
