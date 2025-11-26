import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { AnimeCollection } from '../App';

type AnimeListProps = {
  collections: AnimeCollection[];
  onSelect: (anime: AnimeCollection) => void;
  onBack: () => void;
};

export default function AnimeList({ collections, onSelect, onBack }: AnimeListProps) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-purple-900 to-blue-900 border-b border-white/20 shadow-lg">
        <div className="flex items-center p-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="flex-1 text-center text-white text-2xl mr-10">시리즈 선택</h1>
        </div>
      </div>

      {/* Collection List */}
      <div className="p-6 space-y-4">
        {collections.map((anime, index) => (
          <motion.div
            key={anime.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(anime)}
            className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 shadow-xl cursor-pointer hover:shadow-2xl hover:border-yellow-400/50 transition-all"
          >
            <div className="flex items-center p-4 gap-4">
              {/* Image */}
              <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 border-2 border-white/20">
                <ImageWithFallback
                  src={anime.image}
                  alt={anime.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1">
                <h2 className="text-white text-2xl mb-2">{anime.name}</h2>
                <div className="flex items-center gap-4 text-white/70">
                  <div className="flex items-center gap-2">
                    <span>잔여</span>
                    <span className="text-yellow-400">{anime.remainingKuji}</span>
                    <span>/</span>
                    <span>{anime.totalKuji}</span>
                  </div>
                  <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden max-w-32">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                      style={{ width: `${(anime.remainingKuji / anime.totalKuji) * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-white/50 mt-2">{anime.prizes.length}개 등급</p>
              </div>

              {/* Arrow */}
              <div className="text-white/30 text-3xl flex-shrink-0">›</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info Banner */}
      <div className="p-6">
        <div className="bg-yellow-400/20 border border-yellow-400/50 rounded-xl p-4">
          <p className="text-yellow-200 text-center">
            원하는 시리즈를 선택하여 복권을 구매하세요
          </p>
        </div>
      </div>
    </div>
  );
}
