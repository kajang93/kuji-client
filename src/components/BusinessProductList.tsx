import { motion } from './motion';
import { ChevronLeft, Edit, Package, TrendingUp, TrendingDown, Menu } from './icons';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { AnimeCollection } from '@/shared-types';

type BusinessProductListProps = {
  onBack: () => void;
  collections: AnimeCollection[];
  onEdit?: (id: string) => void;
  onOpenSidebar?: () => void;
};

export default function BusinessProductList({ onBack, collections, onEdit, onOpenSidebar }: BusinessProductListProps) {
  const getStockStatus = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100;
    if (percentage > 50) return { color: 'text-green-400', icon: TrendingUp, label: '재고 충분' };
    if (percentage > 20) return { color: 'text-yellow-400', icon: TrendingDown, label: '재고 부족' };
    return { color: 'text-red-400', icon: TrendingDown, label: '재고 매우 부족' };
  };

  const getOperationStatusBadge = (status?: 'scheduled' | 'active' | 'ended') => {
    switch (status) {
      case 'scheduled':
        return { label: '운영예정', bgColor: 'bg-blue-500/30', textColor: 'text-blue-200', borderColor: 'border-blue-400/50' };
      case 'active':
        return { label: '운영중', bgColor: 'bg-green-500/30', textColor: 'text-green-200', borderColor: 'border-green-400/50' };
      case 'ended':
        return { label: '운영종료', bgColor: 'bg-gray-500/30', textColor: 'text-gray-300', borderColor: 'border-gray-400/50' };
      default:
        return { label: '미운영', bgColor: 'bg-orange-500/30', textColor: 'text-orange-200', borderColor: 'border-orange-400/50' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-purple-800 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-purple-900/80 backdrop-blur-md border-b border-white/10">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <h1 className="text-2xl text-white">등록된 상품 조회</h1>
            </div>
            <button
              onClick={onOpenSidebar}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
          </div>
          <div className="text-white/60 text-sm ml-14">
            총 {collections.length}개 시리즈 등록됨
          </div>
        </div>
      </div>

      {/* Collections List */}
      <div className="p-4 space-y-4">
        {collections.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-20 h-20 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 text-lg">등록된 상품이 없습니다</p>
            <p className="text-white/40 text-sm mt-2">쿠지 상품 등록 메뉴에서 새 상품을 등록하세요</p>
          </div>
        ) : (
          collections.map((collection, index) => {
            const stockStatus = getStockStatus(collection.remainingKuji, collection.totalKuji);
            const StatusIcon = stockStatus.icon;
            const operationStatus = getOperationStatusBadge(collection.operationStatus);

            return (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 shadow-lg"
              >
                {/* Collection Header */}
                <div className="p-5">
                  <div className="flex gap-4 mb-4">
                    {/* Collection Image */}
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-white/10">
                      <ImageWithFallback
                        src={collection.image}
                        alt={collection.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Collection Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl text-white">{collection.name}</h3>
                        {/* Operation Status Badge */}
                        <div className={`px-2 py-1 rounded-lg border text-xs ${operationStatus.bgColor} ${operationStatus.textColor} ${operationStatus.borderColor}`}>
                          {operationStatus.label}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`flex items-center gap-1 ${stockStatus.color} text-sm`}>
                          <StatusIcon className="w-4 h-4" />
                          <span>{stockStatus.label}</span>
                        </div>
                      </div>
                      <div className="text-white/60 text-sm">
                        재고: {collection.remainingKuji}/{collection.totalKuji}
                      </div>
                      <div className="mt-2 bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${
                            collection.remainingKuji / collection.totalKuji > 0.5
                              ? 'bg-green-400'
                              : collection.remainingKuji / collection.totalKuji > 0.2
                              ? 'bg-yellow-400'
                              : 'bg-red-400'
                          }`}
                          style={{ width: `${(collection.remainingKuji / collection.totalKuji) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Prize List */}
                  <div className="border-t border-white/10 pt-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-white/60 text-sm">상품 목록</div>
                      <div className="text-white/40 text-xs">총 {collection.prizes.length}개 항목</div>
                    </div>
                    {collection.prizes.length === 0 ? (
                      <div className="text-center py-4 bg-white/5 rounded-xl border border-dashed border-white/10">
                        <p className="text-white/30 text-xs">수정 버튼을 눌러 경품을 등록하세요</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {collection.prizes.map((prize) => (
                          <div
                            key={prize.id}
                            className="bg-white/5 rounded-lg p-2 border border-white/10 flex items-center gap-3"
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
                              <ImageWithFallback
                                src={prize.image}
                                alt={prize.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className={`text-[10px] px-1 rounded-sm font-bold text-white ${
                                  prize.rank === 'A' ? 'bg-yellow-500' :
                                  prize.rank === 'B' ? 'bg-blue-500' :
                                  prize.rank === 'C' ? 'bg-orange-500' :
                                  'bg-purple-500'
                                }`}>
                                  {prize.rank}
                                </span>
                                <div className="text-white text-xs truncate">
                                  {prize.name}
                                </div>
                              </div>
                              <div className="text-white/50 text-[10px]">
                                {prize.remainingCount}/{prize.totalCount}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <button
                    onClick={() => onEdit?.(collection.id)}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    상품 수정
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}