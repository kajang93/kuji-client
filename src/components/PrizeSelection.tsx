interface PrizeSelectionProps {
    rank: string;
    prizeName: string;
    availableOptions: any[];
    onConfirm: (optionId: string) => void;
    onBack: () => void;
}

export default function PrizeSelection({ rank, prizeName, availableOptions, onConfirm, onBack }: PrizeSelectionProps) {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-8">상품 선택</h1>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
                <p className="text-slate-500 mb-4">{rank}상 상품 선택 화면입니다.</p>
                <button onClick={onBack} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg mr-2">취소</button>
            </div>
        </div>
    );
}
