import type { AnimeCollection } from '../App';

export default function AnimeList({
                                      collections,
                                      onSelect,
                                      onBack,
                                  }: {
    collections: AnimeCollection[];
    onSelect: (anime: AnimeCollection) => void;
    onBack: () => void;
}) {
    return (
        <div className="p-6 text-white">
            <button onClick={onBack} className="text-sm mb-4 opacity-70 hover:opacity-100">← 메인으로</button>
            <h2 className="text-3xl font-bold mb-6">🎬 애니메이션 목록</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {collections.map((anime) => (
                    <div
                        key={anime.id}
                        onClick={() => onSelect(anime)}
                        className="cursor-pointer bg-gray-800 hover:bg-gray-700 rounded-xl overflow-hidden shadow-lg transition-all"
                    >
                        <img src={anime.image} alt={anime.name} className="w-full h-40 object-cover" />
                        <div className="p-4">
                            <h3 className="text-xl font-semibold">{anime.name}</h3>
                            <p className="text-sm opacity-80">{anime.remainingKuji} / {anime.totalKuji} 남음</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
