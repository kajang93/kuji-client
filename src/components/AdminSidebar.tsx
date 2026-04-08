import {
    User,
    LogOut,
    LayoutDashboard,
    Bell,
    Calendar,
    MessageSquare,
    Image,
    Users,
    BarChart,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
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
            | "adminDashboard"
            | "adminNoticeManagement"
            | "adminEventManagement"
            | "adminInquiryManagement"
            | "adminMainBannerManagement"
            | "adminUserManagement"
            | "adminStatistics"
    ) => void;
    newInquiriesCount: number;
}

export default function AdminSidebar({
    isOpen,
    onClose,
    user,
    onLogout,
    onNavigate,
    newInquiriesCount,
}: AdminSidebarProps) {
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
                    "fixed top-0 right-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl overflow-y-auto border-l-4 border-slate-800",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <span className="text-slate-800">관리자</span> 메뉴
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-slate-500" />
                        </button>
                    </div>

                    {/* User Profile Section */}
                    <div className="mb-8 p-4 bg-slate-100 rounded-xl border border-slate-200">
                        {user && (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center overflow-hidden">
                                    {user.profileImageUrl ? (
                                        <img src={user.profileImageUrl} alt={user.nickname} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-5 h-5 text-white" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{user.nickname}</p>
                                    <p className="text-xs text-slate-500">관리자 계정</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Links */}
                    <nav className="space-y-2">
                        <button
                            onClick={() => {
                                onNavigate("adminDashboard");
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            대시보드
                        </button>
                        <button
                            onClick={() => {
                                onNavigate("adminNoticeManagement");
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
                        >
                            <Bell className="w-5 h-5" />
                            공지사항 관리
                        </button>
                        <button
                            onClick={() => {
                                onNavigate("adminEventManagement");
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
                        >
                            <Calendar className="w-5 h-5" />
                            이벤트 관리
                        </button>
                        <button
                            onClick={() => {
                                onNavigate("adminInquiryManagement");
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors justify-between"
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
                                onNavigate("adminMainBannerManagement");
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
                        >
                            <Image className="w-5 h-5" />
                            메인 배너 관리
                        </button>
                        <button
                            onClick={() => {
                                onNavigate("adminUserManagement");
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
                        >
                            <Users className="w-5 h-5" />
                            회원 관리
                        </button>
                        <button
                            onClick={() => {
                                onNavigate("adminStatistics");
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
                        >
                            <BarChart className="w-5 h-5" />
                            통계
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
