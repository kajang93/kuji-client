import React, { useState } from "react";
import { X, Mail, Lock, User, Calendar, CheckCircle2 } from "lucide-react";
import axios from "axios";

interface SignUpProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function SignUp({ onBack, onSuccess }: SignUpProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nickname: "",
    birthDate: "",
    isTermsAgreed: false,
    isPrivacyAgreed: false,
    isMarketingAgreed: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.isTermsAgreed || !formData.isPrivacyAgreed) {
      setError("필수 약관에 동의해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post("http://localhost:8080/api/members/signup", {
        ...formData,
        birthDate: formData.birthDate || null,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans">
      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md w-full relative shadow-2xl overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/20 blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/20 blur-[100px]" />

        <button
          onClick={onBack}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-400 mb-2">
            회원가입
          </h2>
          <p className="text-slate-400 text-sm">KUJI의 새로운 멤버가 되어보세요!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-rose-400 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-white/5 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all"
                placeholder="이메일 주소"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-rose-400 transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-white/5 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all"
                placeholder="비밀번호"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {/* Nickname */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                required
                className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-white/5 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                placeholder="닉네임"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              />
            </div>

            {/* BirthDate */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <Calendar className="w-5 h-5" />
              </div>
              <input
                type="date"
                required
                className={`w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all appearance-none
                          ${!formData.birthDate ? "text-transparent" : "text-white"}
                          /* 💡 크롬/사파리에서 기본 연도-월-일 텍스트를 숨깁니다 */
                          [&::-webkit-datetime-edit]:text-transparent
                          ${formData.birthDate ? "[&::-webkit-datetime-edit]:text-white" : ""}`}
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                style={{
                  colorScheme: "dark",
                }}
              />
              {!formData.birthDate && (
                <span className="absolute left-12 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-sm font-medium">
                  생년월일 (선택)
                </span>
              )}
            </div>
          </div>

          {/* Agreements */}
          <div className="space-y-3 pt-2">
            {[
              { id: "terms", label: "[필수] 서비스 이용약관 동의", key: "isTermsAgreed" },
              { id: "privacy", label: "[필수] 개인정보 수집 및 이용 동의", key: "isPrivacyAgreed" },
              { id: "marketing", label: "[선택] 마케팅 정보 수신 동의", key: "isMarketingAgreed" },
            ].map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-3 cursor-pointer group select-none"
              >
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={(formData as any)[item.key]}
                    onChange={(e) =>
                      setFormData({ ...formData, [item.key]: e.target.checked })
                    }
                  />
                  <div className="w-5 h-5 border border-white/10 rounded group-hover:border-white/30 transition-all peer-checked:bg-indigo-500 peer-checked:border-indigo-500 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                </div>
                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                  {item.label}
                </span>
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-4 bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-bold rounded-2xl hover:from-rose-600 hover:to-indigo-700 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-rose-500/20"
          >
            {loading ? "가입 중..." : "가입하기"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={onBack}
            className="text-slate-500 text-sm hover:text-slate-300 transition-colors"
          >
            이미 계정이 있으신가요? <span className="text-indigo-400 font-medium">로그인</span>
          </button>
        </div>
      </div>
    </div>
  );
}
