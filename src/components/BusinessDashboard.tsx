import { LayoutDashboard } from "lucide-react";

interface BusinessDashboardProps {
    onNavigate: (screen: string) => void;
}

export default function BusinessDashboard({ onNavigate }: BusinessDashboardProps) {
    return (
        <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
                <LayoutDashboard className="w-8 h-8 text-indigo-600" />
                <h1 className="text-2xl font-bold text-slate-900">비즈니스 대시보드</h1>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 text-center">
                <p className="text-slate-500">대시보드 기능이 준비 중입니다.</p>
                <div className="mt-4 flex gap-2 justify-center">
                    <button onClick={() => onNavigate("productList")} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg">상품 관리</button>
                    <button onClick={() => onNavigate("shipping")} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg">배송 관리</button>
                </div>
            </div>
        </div>
    );
}
