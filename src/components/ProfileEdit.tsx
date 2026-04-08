import React, { useState } from "react";
import { User as UserIcon, Camera, ChevronLeft, Save } from "lucide-react";

interface ProfileEditProps {
    user: {
        nickname: string;
        email: string;
        profileImageUrl?: string;
    };
    onBack: () => void;
    onSave: (data: any) => void;
}

export default function ProfileEdit({ user, onBack, onSave }: ProfileEditProps) {
    const [nickname, setNickname] = useState(user.nickname);
    const [profileImageUrl, setProfileImageUrl] = useState(user.profileImageUrl || "");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ nickname, profileImageUrl });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <button onClick={onBack} className="p-2 hover:bg-white rounded-full transition-colors mr-2">
                        <ChevronLeft className="w-6 h-6 text-slate-400" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900">프로필 수정</h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 p-8">
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative group">
                            <div className="w-28 h-28 bg-slate-100 rounded-3xl overflow-hidden border-4 border-white shadow-lg flex items-center justify-center">
                                {profileImageUrl ? (
                                    <img src={profileImageUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-12 h-12 text-slate-300" />
                                )}
                            </div>
                            <button 
                                type="button"
                                className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-700 transition-all group-hover:scale-110 active:scale-95"
                            >
                                <Camera className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="mt-4 text-xs text-slate-400 font-medium">프로필 사진은 URL로 입력해 주세요.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">닉네임</label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                placeholder="닉네임을 입력하세요"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">프로필 이미지 URL</label>
                            <input
                                type="text"
                                value={profileImageUrl}
                                onChange={(e) => setProfileImageUrl(e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                placeholder="https://example.com/image.png"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">이메일 (수정 불가)</label>
                            <input
                                type="email"
                                value={user.email}
                                disabled
                                className="w-full px-5 py-4 bg-slate-100 border border-slate-100 rounded-2xl text-slate-400 cursor-not-allowed font-medium"
                            />
                        </div>

                        <div className="flex gap-3 pt-6">
                            <button
                                type="button"
                                onClick={onBack}
                                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                            >
                                <Save className="w-5 h-5" />
                                저장하기
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
