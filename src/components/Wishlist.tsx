import { motion } from './motion';
import { ChevronLeft, Heart, Trash2 } from './icons';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { AnimeCollection } from '../App';

type WishlistProps = {
  onBack: () => void;
  onSelectAnime: (animeId: string) => void;
  wishlist: string[];
  allCollections: AnimeCollection[];
  onRemoveFromWishlist: (animeId: string) => void;
};

export default function Wishlist({ onBack, onSelectAnime, wishlist, allCollections, onRemoveFromWishlist }: WishlistProps) {
  // Filter collections to only show wishlisted items
  const wishlistItems = allCollections.filter(anime => wishlist.includes(anime.id));

  const handleRemove = (id: string) => {
    onRemoveFromWishlist(id);
  };

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-purple-900 to-blue-900 border-b-2 border-cyan-400/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-xl text-center">찜 목록</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        {wishlistItems.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/50">찜한 쿠지가 없습니다</p>
          </div>
        ) : (
          wishlistItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 shadow-lg"
            >
              <div className="flex items-center gap-4 p-4">
                {/* Image */}
                <div
                  onClick={() => onSelectAnime(item.id)}
                  className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                >
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white text-lg mb-2">{item.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-white/60 text-sm">잔여</div>
                    <div className="text-yellow-400">{item.remainingKuji}</div>
                    <div className="text-white/50">/</div>
                    <div className="text-white/60">{item.totalKuji}</div>
                  </div>
                  <div className="text-white/40 text-xs">{item.prizes.length}개 등급</div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-full transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-5 h-5 text-red-300" />
                </button>
              </div>

              {/* Action Button */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => onSelectAnime(item.id)}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <div className="text-center">구매하러 가기</div>
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
