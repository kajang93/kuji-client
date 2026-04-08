import { User as UserIcon, Mail, Shield, UserCircle } from "lucide-react";

interface ProfileProps {
    user: {
        nickname: string;
        email: string;
        role: string;
        profileImageUrl?: string;
    };
    onBack: () => void;
    onEdit: () => void;
}

export default function Profile({ user, onBack, onEdit }: ProfileProps) {
    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <button onClick={onBack} className="p-2 hover:bg-white rounded-full transition-colors mr-2">
                        <UserCircle className="w-6 h-6 text-slate-400" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900">내 정보</h1>
                </div>

                <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
                    {/* Header/Cover Placeholder */}
                    <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600" />
                    
                    <div className="px-8 pb-8">
                        <div className="relative -mt-12 mb-6">
                            <div className="w-24 h-24 bg-white rounded-2xl p-1 shadow-lg">
                                <div className="w-full h-full bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center">
                                    {user.profileImageUrl ? (
                                        <img src={user.profileImageUrl} alt={user.nickname} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-10 h-10 text-slate-300" />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">{user.nickname}</h2>
                                <p className="text-slate-500">회원님, 반갑습니다!</p>
                            </div>

                            <div className="grid gap-4 py-6 border-y border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium">이메일</p>
                                        <p className="text-slate-700 font-semibold">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium">회원 등급</p>
                                        <p className="text-slate-700 font-semibold">{user.role}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button 
                                    onClick={onEdit} 
                                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                                >
                                    프로필 수정하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
