import { LayoutDashboard } from "lucide-react";

interface AdminDashboardProps {
    onNavigate: (screen: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
    return (
        <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
                <LayoutDashboard className="w-8 h-8 text-slate-800" />
                <h1 className="text-2xl font-bold text-slate-900">관리자 대시보드</h1>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 text-center">
                <p className="text-slate-500">관리자 대시보드 기능이 준비 중입니다.</p>
                <div className="mt-4 flex gap-2 justify-center flex-wrap">
                    <button onClick={() => onNavigate("noticeManagement")} className="px-4 py-2 bg-slate-100 text-slate-800 rounded-lg">공지사항 관리</button>
                    <button onClick={() => onNavigate("eventManagement")} className="px-4 py-2 bg-slate-100 text-slate-800 rounded-lg">이벤트 관리</button>
                    <button onClick={() => onNavigate("inquiryManagement")} className="px-4 py-2 bg-slate-100 text-slate-800 rounded-lg">문의 관리</button>
                    <button onClick={() => onNavigate("userManagement")} className="px-4 py-2 bg-slate-100 text-slate-800 rounded-lg">회원 관리</button>
                </div>
            </div>
        </div>
    );
}
