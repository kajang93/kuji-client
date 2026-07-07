import { ImageWithFallback } from './figma/ImageWithFallback';
import { ChevronLeft, Heart } from './icons';
import { useEffect } from 'react';
import { motion } from './motion';
import type { AnimeCollection } from '@/shared-types';
import { Tilt } from 'react-tilt';

type AnimeListProps = {
  collections: AnimeCollection[];
  onSelect: (anime: AnimeCollection) => void;
  onBack: () => void;
  onToggleWishlist: (anime: AnimeCollection) => void;
};

export default function AnimeList({ collections, onSelect, onBack, onToggleWishlist }: AnimeListProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 glass-panel border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center p-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors backdrop-blur-md"
          >
            <ChevronLeft className="w-6 h-6 text-cyan-100" />
          </button>
          <h1 className="flex-1 text-center text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-white text-2xl font-bold tracking-widest uppercase mr-10 drop-shadow-md">
            시리즈
          </h1>
        </div>
      </div>

      {/* Collection List */}
      <div className="p-6 space-y-4">
        {collections.map((anime, index) => {
          const isWishlisted = anime.isWished;
          
          return (
            <motion.div
              key={anime.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: "spring", bounce: 0.4 }}
              className="relative"
            >
              <Tilt options={{ max: 15, scale: 1.02, speed: 400, glare: true, "max-glare": 0.3 }}>
                <div className="relative rounded-3xl overflow-hidden glass-panel hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:border-cyan-400/50 transition-all duration-300 h-64 group">
                  {/* Background Image with Overlay */}
                  <div className="absolute inset-0">
                    <ImageWithFallback
                      src={anime.image}
                      alt={anime.name}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/70 to-transparent" />
                  </div>

                  {/* Wishlist Heart Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(anime);
                    }}
                    className="absolute top-4 right-4 z-10 p-3 glass-panel rounded-full hover:bg-white/10 transition-colors shadow-lg"
                  >
                    <Heart 
                      className={`w-5 h-5 transition-colors ${
                        isWishlisted 
                          ? 'fill-pink-500 text-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]' 
                          : 'text-white/70 hover:text-pink-300'
                      }`}
                    />
                  </button>

                  {/* Content */}
                  <div 
                    onClick={() => onSelect(anime)}
                    className="relative h-full flex flex-col justify-end p-6 cursor-pointer"
                  >
                    <h2 className="text-white text-2xl mb-3 font-black tracking-tight drop-shadow-xl line-clamp-1 group-hover:text-cyan-300 transition-colors">
                      {anime.name}
                    </h2>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className="glass-panel rounded-full px-4 py-1.5 shadow-inner">
                        <div className="flex items-center gap-2 text-white/90">
                          <span className="text-xs uppercase tracking-wider text-cyan-200">재고</span>
                          <span className="text-cyan-400 text-lg font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">{anime.remainingKuji}</span>
                          <span className="text-white/40">/</span>
                          <span className="text-sm text-white/60">{anime.totalKuji}</span>
                        </div>
                      </div>
                      
                      <div className="glass-panel rounded-full px-4 py-1.5">
                        <span className="text-indigo-200 text-xs font-medium tracking-wide">
                          {anime.gradeCount !== undefined 
                            ? `${anime.gradeCount}개 등급` 
                            : '로딩중...'}
                        </span>
                      </div>
                    </div>

                    <div className="h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5 relative">
                      {/* Neon Glow beneath progress */}
                      <div className="absolute inset-0 bg-cyan-500 blur-sm opacity-50" style={{ width: `${(anime.remainingKuji / (anime.totalKuji || 1)) * 100}%` }} />
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(anime.remainingKuji / (anime.totalKuji || 1)) * 100}%` }}
                        className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-teal-300 relative z-10"
                      />
                    </div>
                    <div className="text-cyan-400/80 text-[10px] uppercase tracking-widest mt-2 text-right font-bold">
                      {Math.round((anime.remainingKuji / (anime.totalKuji || 1)) * 100)}% 남음
                    </div>
                  </div>
                </div>
              </Tilt>
            </motion.div>
          );
        })}
      </div>

      {/* Info Banner */}
      <div className="p-6 pb-20">
        <div className="bg-yellow-400/20 border border-yellow-400/50 rounded-xl p-4">
          <p className="text-yellow-200 text-center text-sm">
            원하는 시리즈를 선택하여 복권을 구매하세요
          </p>
        </div>
      </div>
    </div>
  );
}
