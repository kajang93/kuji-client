import {
    User,
    LogOut,
    LogIn,
    ShoppingBag,
    Gift,
    Heart,
    Settings,
    HelpCircle,
    MessageSquare,
    Calendar,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        nickname: string;
        email: string;
        type: "social" | "business" | "admin";
        profileImageUrl?: string;
        points?: number;
    } | null;
    onLogout: () => void;
    onLogin: () => void;
    onNavigate: (
        screen:
            | "profile"
            | "purchase"
            | "winning"
            | "wishlist"
            | "settings"
            | "support"
            | "community"
            | "events"
    ) => void;
}

export default function Sidebar({
    isOpen,
    onClose,
    user,
    onLogout,
    onLogin,
    onNavigate,
}: SidebarProps) {
    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Drawer */}
            <div
                className={cn(
                    "fixed top-0 right-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl overflow-y-auto",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-slate-900">메뉴</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-slate-500" />
                        </button>
                    </div>

                    {/* User Profile Section */}
                    <div className="mb-8 p-4 bg-slate-50 rounded-xl">
                        {user ? (
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden">
                                        {user.profileImageUrl ? (
                                            <img src={user.profileImageUrl} alt={user.nickname} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-5 h-5 text-indigo-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{user.nickname}</p>
                                        <p className="text-xs text-slate-500">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200">
                                    <span className="text-sm text-slate-600">보유 포인트</span>
                                    <span className="font-bold text-indigo-600">
                                        {user.points?.toLocaleString() || 0} P
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-slate-600 mb-4">로그인이 필요합니다</p>
                                <button
                                    onClick={onLogin}
                                    className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <LogIn className="w-4 h-4" />
                                    로그인 / 회원가입
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Navigation Links */}
                    <nav className="space-y-2">
                        {user && (
                            <>
                                <button
                                    onClick={() => {
                                        onNavigate("profile");
                                        onClose();
                                    }}
                                    className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    <User className="w-5 h-5" />
                                    내 정보
                                </button>
                                <button
                                    onClick={() => {
                                        onNavigate("purchase");
                                        onClose();
                                    }}
                                    className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    <ShoppingBag className="w-5 h-5" />
                                    구매 내역
                                </button>
                                <button
                                    onClick={() => {
                                        onNavigate("winning");
                                        onClose();
                                    }}
                                    className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    <Gift className="w-5 h-5" />
                                    당첨 내역
                                </button>
                                <button
                                    onClick={() => {
                                        onNavigate("wishlist");
                                        onClose();
                                    }}
                                    className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    <Heart className="w-5 h-5" />
                                    찜한 목록
                                </button>
                                <div className="my-4 border-t border-slate-100" />
                            </>
                        )}

                        <button
                            onClick={() => {
                                onNavigate("community");
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            <MessageSquare className="w-5 h-5" />
                            커뮤니티
                        </button>
                        <button
                            onClick={() => {
                                onNavigate("events");
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            <Calendar className="w-5 h-5" />
                            이벤트
                        </button>
                        <button
                            onClick={() => {
                                onNavigate("support");
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            <HelpCircle className="w-5 h-5" />
                            고객센터
                        </button>
                        <button
                            onClick={() => {
                                onNavigate("settings");
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            <Settings className="w-5 h-5" />
                            설정
                        </button>

                        {user && (
                            <button
                                onClick={onLogout}
                                className="w-full flex items-center gap-3 p-3 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors mt-4"
                            >
                                <LogOut className="w-5 h-5" />
                                로그아웃
                            </button>
                        )}
                    </nav>
                </div>
            </div>
        </>
    );
}
