import { useState } from "react";
import { X } from "lucide-react";

interface LoginProps {
    onLogin: (userData: {
        name: string;
        email: string;
        type: "social" | "business" | "admin";
    }) => void;
    onBack: () => void;
}

export default function Login({ onLogin, onBack }: LoginProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
            <div className="bg-white rounded-xl p-8 max-w-md w-full relative">
                <button
                    onClick={onBack}
                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full"
                >
                    <X className="w-6 h-6 text-slate-500" />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-center">로그인</h2>
                <div className="space-y-4">
                    <button
                        onClick={() =>
                            onLogin({
                                name: "홍길동",
                                email: "user@example.com",
                                type: "social",
                            })
                        }
                        className="w-full py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500"
                    >
                        카카오로 시작하기
                    </button>
                    <button
                        onClick={() =>
                            onLogin({
                                name: "판매자",
                                email: "seller@example.com",
                                type: "business",
                            })
                        }
                        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700"
                    >
                        판매자 로그인
                    </button>
                    <button
                        onClick={() =>
                            onLogin({
                                name: "관리자",
                                email: "admin@example.com",
                                type: "admin",
                            })
                        }
                        className="w-full py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900"
                    >
                        관리자 로그인
                    </button>
                </div>
            </div>
        </div>
    );
}
