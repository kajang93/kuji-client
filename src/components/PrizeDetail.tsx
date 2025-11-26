import type { AnimeCollection } from '../App';

export default function PrizeDetail({
                                        anime,
                                        onBack,
                                        onPurchase,
                                    }: {
    anime: AnimeCollection;
    onBack: () => void;
    onPurchase: (count: number) => void;
}) {
    return (
        <div className="p-6 text-white">
            <button onClick={onBack} className="text-sm mb-4 opacity-70 hover:opacity-100">← 목록으로</button>

            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold">{anime.name}</h2>
                <img src={anime.image} alt={anime.name} className="mx-auto my-4 w-64 h-64 rounded-xl object-cover" />
                <p>남은 쿠지: {anime.remainingKuji} / {anime.totalKuji}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {anime.prizes.map((prize) => (
                    <div key={prize.id} className="bg-gray-800 p-3 rounded-lg shadow hover:bg-gray-700 transition-all">
                        <img src={prize.image} alt={prize.name} className="w-full h-32 object-cover rounded-md mb-2" />
                        <h4 className="font-semibold">{prize.rank}상</h4>
                        <p className="text-sm opacity-80">{prize.name}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={() => onPurchase(1)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded-2xl shadow-lg"
                >
                    🎟️ 1회 뽑기
                </button>
            </div>
        </div>
    );
}
