import { Settings as SettingsIcon } from "lucide-react";

interface SettingsProps {
    onBack: () => void;
    user: any;
}

export default function Settings({ onBack, user }: SettingsProps) {
    return (
        <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
                <SettingsIcon className="w-8 h-8 text-indigo-600" />
                <h1 className="text-2xl font-bold text-slate-900">설정</h1>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
                <p className="text-slate-500 mb-4">설정 화면입니다.</p>
                <button onClick={onBack} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg">뒤로가기</button>
            </div>
        </div>
    );
}
