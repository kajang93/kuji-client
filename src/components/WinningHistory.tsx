import { Gift } from "lucide-react";

interface WinningHistoryProps {
    onBack: () => void;
    onSelectPrizeOption: (id: string, rank: string) => void;
    winningHistory: any[];
    onSubmitInquiry: (sellerId: string, sellerName: string, orderNumber: string, type: any, subject: string, content: string) => void;
}

export default function WinningHistory({ onBack, onSelectPrizeOption, winningHistory, onSubmitInquiry }: WinningHistoryProps) {
    return (
        <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
                <Gift className="w-8 h-8 text-indigo-600" />
                <h1 className="text-2xl font-bold text-slate-900">당첨 내역</h1>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
                <p className="text-slate-500 mb-4">당첨 내역 화면입니다.</p>
                <button onClick={onBack} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg">뒤로가기</button>
            </div>
        </div>
    );
}
