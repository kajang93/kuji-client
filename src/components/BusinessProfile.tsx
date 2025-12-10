import { User } from "lucide-react";

interface BusinessProfileProps {
    user: any;
    onBack: () => void;
    onEdit: () => void;
}

export default function BusinessProfile({ user, onBack, onEdit }: BusinessProfileProps) {
    return (
        <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
                <User className="w-8 h-8 text-indigo-600" />
                <h1 className="text-2xl font-bold text-slate-900">비즈니스 프로필</h1>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
                <p className="text-slate-500 mb-4">프로필 관리 화면입니다.</p>
                <button onClick={onBack} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg mr-2">뒤로가기</button>
                <button onClick={onEdit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">수정하기</button>
            </div>
        </div>
    );
}
