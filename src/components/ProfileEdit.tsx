interface ProfileEditProps {
    user: any;
    onBack: () => void;
    onSave: (data: any) => void;
}

export default function ProfileEdit({ user, onBack, onSave }: ProfileEditProps) {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-8">프로필 수정</h1>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
                <p className="text-slate-500 mb-4">프로필 수정 화면입니다.</p>
                <button onClick={onBack} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg mr-2">취소</button>
                <button onClick={() => onSave({})} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">저장</button>
            </div>
        </div>
    );
}
