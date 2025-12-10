import { MessageSquare } from "lucide-react";

interface CommunityProps {
    onBack: () => void;
    onNavigateToNotice: () => void;
    onNavigateToSupport: () => void;
    user: any;
}

export default function Community({ onBack, onNavigateToNotice, onNavigateToSupport, user }: CommunityProps) {
    return (
        <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
                <MessageSquare className="w-8 h-8 text-indigo-600" />
                <h1 className="text-2xl font-bold text-slate-900">커뮤니티</h1>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
                <p className="text-slate-500 mb-4">커뮤니티 화면입니다.</p>
                <button onClick={onBack} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg mr-2">뒤로가기</button>
                <button onClick={onNavigateToNotice} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg mr-2">공지사항</button>
                <button onClick={onNavigateToSupport} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg">고객센터</button>
            </div>
        </div>
    );
}
