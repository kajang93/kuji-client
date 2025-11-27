import { ImageWithFallback } from './figma/ImageWithFallback';
import { ChevronLeft, Heart } from './icons';
import { useEffect } from 'react';
import { motion } from './motion';
import type { AnimeCollection } from '../App';

type AnimeListProps = {
  collections: AnimeCollection[];
  onSelect: (anime: AnimeCollection) => void;
  onBack: () => void;
  wishlist: string[];
  onToggleWishlist: (animeId: string) => void;
};

export default function AnimeList({ collections, onSelect, onBack, wishlist, onToggleWishlist }: AnimeListProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        {collections.map((anime, index) => {
          const isWishlisted = wishlist.includes(anime.id);
          
          return (
            <motion.div
              key={anime.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl hover:shadow-yellow-400/30 hover:border-yellow-400/50 transition-all h-64"
            >
              {/* Background Image with Overlay */}
              <div className="absolute inset-0">
                <ImageWithFallback
                  src={anime.image}
                  alt={anime.name}
                  className="w-full h-full object-cover"
                />
                {/* Dark gradient overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
              </div>

              {/* Wishlist Heart Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWishlist(anime.id);
                }}
                className="absolute top-4 right-4 z-10 p-3 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
              >
                <Heart 
                  className={`w-6 h-6 transition-colors ${
                    isWishlisted 
                      ? 'fill-pink-500 text-pink-500' 
                      : 'text-white/70 hover:text-pink-300'
                  }`}
                />
              </button>

              {/* Content */}
              <div 
                onClick={() => onSelect(anime)}
                className="relative h-full flex flex-col justify-end p-6 cursor-pointer"
              >
                {/* Series Name */}
                <h2 className="text-white text-3xl mb-3 drop-shadow-lg" style={{ fontWeight: 800 }}>{anime.name}</h2>
                
                {/* Stats */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                    <div className="flex items-center gap-2 text-white/90">
                      <span className="text-sm">잔여</span>
                      <span className="text-yellow-400 text-lg" style={{ fontWeight: 700 }}>{anime.remainingKuji}</span>
                      <span className="text-white/60">/</span>
                      <span className="text-lg">{anime.totalKuji}</span>
                    </div>
                  </div>
                  <div className="bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                    <span className="text-white/90 text-sm">{anime.prizes.length}개 등급</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="h-2 bg-black/40 backdrop-blur-sm rounded-full overflow-hidden border border-white/20">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 shadow-lg"
                      style={{ width: `${(anime.remainingKuji / anime.totalKuji) * 100}%` }}
                    />
                  </div>
                  <div className="text-white/60 text-xs mt-1 text-right">
                    {Math.round((anime.remainingKuji / anime.totalKuji) * 100)}% 남음
                  </div>
                </div>

                {/* Arrow Indicator */}
                <div className="absolute bottom-6 right-6 text-white/50 text-5xl">
                  ›
                </div>
              </div>
            </motion.div>
          );
        })}
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
