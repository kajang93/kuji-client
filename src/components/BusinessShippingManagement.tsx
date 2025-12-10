interface BusinessShippingManagementProps {
    onBack: () => void;
    winningHistory: any[];
    onUpdateShipping: (id: string, status: any, tracking?: string) => void;
}

export default function BusinessShippingManagement({ onBack, winningHistory, onUpdateShipping }: BusinessShippingManagementProps) {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-8">배송 관리</h1>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
                <p className="text-slate-500 mb-4">배송 현황 및 송장 입력 화면입니다.</p>
                <button onClick={onBack} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg">뒤로가기</button>
            </div>
        </div>
    );
}
