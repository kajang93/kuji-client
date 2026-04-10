import { useState } from 'react';
import { motion } from './motion';
import { ChevronLeft, Save, Upload, X, Plus } from './icons';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { AnimeCollection } from '../App';

type BusinessProductEditProps = {
  onBack: () => void;
  collection: AnimeCollection;
  onSave: (updatedCollection: AnimeCollection) => void;
};

type PrizeProduct = {
  id: string;
  name: string;
  image: string;
  stock: number;
};

export default function BusinessProductEdit({ onBack, collection, onSave }: BusinessProductEditProps) {
  const [seriesName, setSeriesName] = useState(collection.name);
  const [seriesImage, setSeriesImage] = useState(collection.image);
  const [operationStatus, setOperationStatus] = useState<'scheduled' | 'active' | 'ended'>(collection.operationStatus || 'scheduled');
  
  // Check if editing is allowed (only scheduled products can be edited)
  const isEditingAllowed = collection.operationStatus === 'scheduled' || !collection.operationStatus;
  
  // Initialize prizes with products
  const [prizes, setPrizes] = useState<Record<string, PrizeProduct[]>>(
    collection.prizes.reduce((acc, prize) => {
      acc[prize.rank] = [{
        id: prize.id,
        name: prize.name,
        image: prize.image,
        stock: prize.remainingCount
      }];
      return acc;
    }, {} as Record<string, PrizeProduct[]>)
  );

  const ranks = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  const handleAddProduct = (rank: string) => {
    setPrizes(prev => ({
      ...prev,
      [rank]: [
        ...(prev[rank] || []),
        {
          id: `${rank}-${Date.now()}`,
          name: '',
          image: '',
          stock: 0
        }
      ]
    }));
  };

  const handleRemoveProduct = (rank: string, index: number) => {
    setPrizes(prev => ({
      ...prev,
      [rank]: prev[rank].filter((_, i) => i !== index)
    }));
  };

  const handleProductChange = (rank: string, index: number, field: keyof PrizeProduct, value: string | number) => {
    setPrizes(prev => ({
      ...prev,
      [rank]: prev[rank].map((product, i) => 
        i === index ? { ...product, [field]: value } : product
      )
    }));
  };

  const handleImageUpload = (rank: string, index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleProductChange(rank, index, 'image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Convert prizes back to collection format
    const updatedPrizes = Object.entries(prizes).flatMap(([rank, products]) =>
      products.map(product => ({
        id: product.id,
        rank: rank as any,
        name: product.name,
        image: product.image,
        totalCount: product.stock || 0,
        remainingCount: product.stock || 0,
        opened: new Array(Math.max(0, product.stock || 0)).fill(false)
      }))
    );

    const updatedCollection: AnimeCollection = {
      ...collection,
      name: seriesName,
      image: seriesImage,
      prizes: updatedPrizes,
      operationStatus: operationStatus
    };

    onSave(updatedCollection);
  };

  const rankColors: Record<string, string> = {
    A: 'from-yellow-400 to-yellow-600',
    B: 'from-purple-400 to-purple-600',
    C: 'from-blue-400 to-blue-600',
    D: 'from-green-400 to-green-600',
    E: 'from-pink-400 to-pink-600',
    F: 'from-orange-400 to-orange-600',
    G: 'from-teal-400 to-teal-600',
    H: 'from-red-400 to-red-600',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-purple-800 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-purple-900 to-blue-900 border-b-2 border-cyan-400/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-xl">상품 수정</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        {/* Editing Warning for Active Products */}
        {!isEditingAllowed && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-red-500/20 border-2 border-red-400/50 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">🚫</div>
              <div>
                <h3 className="text-red-200 mb-1">수정 불가</h3>
                <p className="text-red-300/80 text-sm">
                  이 상품은 현재 <strong>{collection.operationStatus === 'active' ? '운영중' : '운영종료'}</strong> 상태입니다.
                  운영중이거나 운영이 종료된 상품은 수정할 수 없습니다.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Series Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg mb-4"
        >
          <h2 className="text-white text-lg mb-4">시리즈 정보</h2>
          <div className="space-y-4">
            {/* Operation Status */}
            <div>
              <label className="text-white/70 text-sm block mb-2">운영 상태</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setOperationStatus('scheduled')}
                  disabled={!isEditingAllowed}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                    operationStatus === 'scheduled'
                      ? 'bg-blue-500/30 border-blue-400/50 text-blue-200'
                      : 'bg-white/5 border-white/20 text-white/60'
                  } ${!isEditingAllowed ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400/50'}`}
                >
                  운영예정
                </button>
                <button
                  onClick={() => setOperationStatus('active')}
                  disabled={!isEditingAllowed}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                    operationStatus === 'active'
                      ? 'bg-green-500/30 border-green-400/50 text-green-200'
                      : 'bg-white/5 border-white/20 text-white/60'
                  } ${!isEditingAllowed ? 'opacity-50 cursor-not-allowed' : 'hover:border-green-400/50'}`}
                >
                  운영중
                </button>
                <button
                  onClick={() => setOperationStatus('ended')}
                  disabled={!isEditingAllowed}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                    operationStatus === 'ended'
                      ? 'bg-gray-500/30 border-gray-400/50 text-gray-300'
                      : 'bg-white/5 border-white/20 text-white/60'
                  } ${!isEditingAllowed ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400/50'}`}
                >
                  운영종료
                </button>
              </div>
              <p className="text-cyan-300 text-xs mt-2 flex items-center gap-1">
                💡 운영중이나 운영종료로 변경하면 더 이상 수정할 수 없습니다
              </p>
            </div>

            <div>
              <label className="text-white/70 text-sm block mb-2">시리즈명</label>
              <input
                type="text"
                value={seriesName}
                onChange={(e) => setSeriesName(e.target.value)}
                disabled={!isEditingAllowed}
                className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 ${
                  !isEditingAllowed ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                placeholder="시리즈명 입력"
              />
            </div>
          </div>
        </motion.div>

        {/* Prizes by Rank */}
        <div className="space-y-4">
          {ranks.map((rank, rankIndex) => {
            const products = prizes[rank] || [];
            if (products.length === 0) return null;

            return (
              <motion.div
                key={rank}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rankIndex * 0.05 }}
                className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${rankColors[rank]} rounded-xl flex items-center justify-center shadow-lg`}>
                      <span className="text-white text-xl">{rank}</span>
                    </div>
                    <h3 className="text-white text-lg">{rank}상 상품</h3>
                  </div>
                  <button
                    onClick={() => handleAddProduct(rank)}
                    disabled={!isEditingAllowed}
                    className={`px-3 py-1 rounded-lg text-white text-sm flex items-center gap-1 transition-colors ${
                      isEditingAllowed
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-gray-500 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    추가
                  </button>
                </div>

                <div className="space-y-3">
                  {products.map((product, productIndex) => (
                    <div key={product.id} className="bg-white/10 rounded-xl p-4 border border-white/10">
                      <div className="flex items-start gap-4">
                        {/* Image Upload */}
                        <div className="flex-shrink-0">
                          <label className={isEditingAllowed ? 'cursor-pointer' : 'cursor-not-allowed'}>
                            <div className="w-24 h-24 bg-white/10 rounded-lg border-2 border-dashed border-white/30 hover:border-cyan-400 transition-colors overflow-hidden">
                              {product.image ? (
                                <ImageWithFallback
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center">
                                  <Upload className="w-6 h-6 text-white/40 mb-1" />
                                  <span className="text-white/40 text-xs">이미지</span>
                                </div>
                              )}
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(rank, productIndex, e)}
                              disabled={!isEditingAllowed}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 space-y-3">
                          <div>
                            <label className="text-white/60 text-xs block mb-1">상품명</label>
                            <input
                              type="text"
                              value={product.name}
                              onChange={(e) => handleProductChange(rank, productIndex, 'name', e.target.value)}
                              disabled={!isEditingAllowed}
                              className={`w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-cyan-400 ${
                                !isEditingAllowed ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              placeholder="상품명 입력"
                            />
                          </div>
                          <div>
                            <label className="text-white/60 text-xs block mb-1">재고</label>
                            <input
                              type="number"
                              value={product.stock}
                              onChange={(e) => handleProductChange(rank, productIndex, 'stock', parseInt(e.target.value) || 0)}
                              disabled={!isEditingAllowed}
                              className={`w-full px-3 py-2 border border-white/20 rounded-lg text-sm ${
                                isEditingAllowed
                                  ? 'bg-white/10 text-white focus:outline-none focus:border-cyan-400'
                                  : 'bg-white/5 text-white/50 cursor-not-allowed'
                              }`}
                              placeholder="재고 수량"
                              min="0"
                            />
                            {isEditingAllowed ? (
                              <p className="text-cyan-300 text-xs mt-1 flex items-center gap-1">
                                💡 운영예정 상태에서만 재고 수정 가능
                              </p>
                            ) : (
                              <p className="text-amber-300 text-xs mt-1 flex items-center gap-1">
                                ⚠️ 운영중/종료 상품은 재고 조작 방지를 위해 수정 불가
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Remove Button */}
                        {products.length > 1 && isEditingAllowed && (
                          <button
                            onClick={() => handleRemoveProduct(rank, productIndex)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Save Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="w-full mt-6 py-4 bg-gradient-to-r from-teal-400 to-blue-500 text-white rounded-xl shadow-xl flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          <span>저장하기</span>
        </motion.button>
      </div>
    </div>
  );
}