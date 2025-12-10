interface BusinessProductRegisterProps {
    onBack: () => void;
    onComplete: () => void;
    onTempSave: (msg: string) => void;
}

export default function BusinessProductRegister({ onBack, onComplete, onTempSave }: BusinessProductRegisterProps) {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-8">상품 등록</h1>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
                <p className="text-slate-500 mb-4">새 상품 등록 화면입니다.</p>
                <button onClick={onBack} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg mr-2">취소</button>
                <button onClick={() => onTempSave("임시 저장됨")} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg mr-2">임시저장</button>
                <button onClick={onComplete} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">등록완료</button>
            </div>
        </div>
    );
}
