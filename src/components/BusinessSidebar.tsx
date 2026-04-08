import {
    User,
    LogOut,
    LayoutDashboard,
    Package,
    PlusCircle,
    Truck,
    MessageSquare,
    Settings,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BusinessSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        nickname: string;
        email: string;
        type: "social" | "business" | "admin";
        profileImageUrl?: string;
    } | null;
    onLogout: () => void;
    onNavigate: (
        screen:
            | "businessDashboard"
            | "businessProducts"
            | "businessRegister"
            | "businessShipping"
            | "businessProfile"
            | "settings"
            | "businessInquiries"
    ) => void;
    newInquiriesCount: number;
}

export default function BusinessSidebar({
    isOpen,
    onClose,
    user,
    onLogout,
    onNavigate,
    newInquiriesCount,
}: BusinessSidebarProps) {
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
                    "fixed top-0 right-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl overflow-y-auto border-l-4 border-indigo-500",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <span className="text-indigo-600">비즈니스</span> 메뉴
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-slate-500" />
                        </button>
                    </div>

                    {/* User Profile Section */}
                    <div className="mb-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                        {user && (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center overflow-hidden">
                                    {user.profileImageUrl ? (
                                        <img src={user.profileImageUrl} alt={user.nickname} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-5 h-5 text-indigo-700" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{user.nickname}</p>
                                    <p className="text-xs text-slate-500">판매자 계정</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Links */}
                    <nav className="space-y-2">
                        <button
                            onClick={() => {
                                onNavigate("businessDashboard");
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            대시보드
                        </button>
                        <button
                            onClick={() => {
                                onNavigate("businessProducts");
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                        >
                            <Package className="w-5 h-5" />
                            상품 관리
                        </button>
                        <button
                            onClick={() => {
                                onNavigate("businessRegister");
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                        >
                            <PlusCircle className="w-5 h-5" />
                            상품 등록
                        </button>
                        <button
                            onClick={() => {
                                onNavigate("businessShipping");
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                        >
                            <Truck className="w-5 h-5" />
                            배송 관리
                        </button>
                        <button
                            onClick={() => {
                                onNavigate("businessInquiries");
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <MessageSquare className="w-5 h-5" />
                                문의 관리
                            </div>
                            {newInquiriesCount > 0 && (
                                <span className="bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                    {newInquiriesCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => {
                                onNavigate("businessProfile");
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                        >
                            <User className="w-5 h-5" />
                            프로필 관리
                        </button>
                        <button
                            onClick={() => {
                                onNavigate("settings");
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                        >
                            <Settings className="w-5 h-5" />
                            설정
                        </button>

                        <div className="my-4 border-t border-slate-100" />

                        <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-3 p-3 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            로그아웃
                        </button>
                    </nav>
                </div>
            </div>
        </>
    );
}
