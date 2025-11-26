import { useState } from 'react';

export default function KujiSelection({
                                          totalKuji,
                                          purchaseCount,
                                          kujiStatus,
                                          onConfirm,
                                          onBack,
                                      }: {
    totalKuji: number;
    purchaseCount: number;
    kujiStatus: boolean[];
    onConfirm: (kujiIndices: number[]) => void;
    onBack: () => void;
}) {
    const [selected, setSelected] = useState<number[]>([]);

    const toggle = (index: number) => {
        setSelected((prev) =>
            prev.includes(index)
                ? prev.filter((i) => i !== index)
                : prev.length < purchaseCount
                    ? [...prev, index]
                    : prev
        );
    };

    return (
        <div className="p-6 text-white">
            <button onClick={onBack} className="text-sm mb-4 opacity-70 hover:opacity-100">← 상세로</button>
            <h2 className="text-2xl font-bold mb-4">🎟️ 쿠지 선택</h2>
            <p className="mb-4 opacity-80">뽑기 {purchaseCount}개 선택하세요</p>

            <div className="grid grid-cols-10 gap-2">
                {Array.from({ length: totalKuji }).map((_, i) => (
                    <div
                        key={i}
                        onClick={() => !kujiStatus[i] && toggle(i)}
                        className={`w-8 h-8 rounded-md text-xs flex items-center justify-center cursor-pointer ${
                            kujiStatus[i]
                                ? 'bg-gray-600'
                                : selected.includes(i)
                                    ? 'bg-yellow-400 text-black font-bold'
                                    : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                    >
                        {i + 1}
                    </div>
                ))}
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={() => onConfirm(selected)}
                    disabled={selected.length !== purchaseCount}
                    className="bg-green-500 hover:bg-green-600 disabled:opacity-50 px-6 py-3 rounded-2xl font-semibold"
                >
                    결과 보기
                </button>
            </div>
        </div>
    );
}
