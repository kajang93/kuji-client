import { useState, useRef, useEffect } from 'react';
import { motion } from './motion';
import { ChevronLeft, Upload, Save, X, Plus, Check } from './icons';
import { ImageWithFallback } from './figma/ImageWithFallback';

type BusinessProductRegisterProps = {
  onBack: () => void;
  onComplete?: () => void;
  onTempSave?: (message: string) => void;
};

type ProductItem = {
  id: string;
  image: string | null;
  name: string;
  stock: number;
};

type RankData = {
  rank: string;
  products: ProductItem[];
};

export default function BusinessProductRegister({ onBack, onComplete, onTempSave }: BusinessProductRegisterProps) {
  const [seriesName, setSeriesName] = useState('');
  const [seriesImage, setSeriesImage] = useState<string | null>(null);
  const [selectedRank, setSelectedRank] = useState<string>('A');
  const [rankData, setRankData] = useState<Record<string, ProductItem[]>>({});
  
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const seriesImageInputRef = useRef<HTMLInputElement>(null);

  const ranks = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

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

  const handleSeriesImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSeriesImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductImageUpload = (productId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRankData(prev => ({
          ...prev,
          [selectedRank]: prev[selectedRank]?.map(p =>
            p.id === productId ? { ...p, image: reader.result as string } : p
          ) || []
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = () => {
    const newProduct: ProductItem = {
      id: `${selectedRank}-${Date.now()}`,
      image: null,
      name: '',
      stock: 0
    };

    setRankData(prev => ({
      ...prev,
      [selectedRank]: [...(prev[selectedRank] || []), newProduct]
    }));
  };

  const handleRemoveProduct = (productId: string) => {
    setRankData(prev => ({
      ...prev,
      [selectedRank]: prev[selectedRank]?.filter(p => p.id !== productId) || []
    }));
  };

  const handleProductChange = (productId: string, field: 'name' | 'stock', value: string | number) => {
    setRankData(prev => ({
      ...prev,
      [selectedRank]: prev[selectedRank]?.map(p =>
        p.id === productId ? { ...p, [field]: value } : p
      ) || []
    }));
  };

  const handleRegister = () => {
    if (!seriesName.trim()) {
      alert('시리즈명을 입력해주세요');
      return;
    }

    // Validate that all ranks have at least one product
    const hasProducts = Object.keys(rankData).length > 0 && 
      Object.values(rankData).some(products => products.length > 0);

    if (!hasProducts) {
      alert('최소 1개 이상의 상품을 등록해주세요');
      return;
    }

    // In real app, save data here
    console.log('Registering:', { seriesName, seriesImage, rankData });
    
    // Navigate to product list
    onComplete?.();
  };

  const handleTempSave = () => {
    if (!seriesName.trim()) {
      alert('시리즈명을 입력해주세요');
      return;
    }

    // Validate that all ranks have at least one product
    const hasProducts = Object.keys(rankData).length > 0 && 
      Object.values(rankData).some(products => products.length > 0);

    if (!hasProducts) {
      alert('최소 1개 이상의 상품을 등록해주세요');
      return;
    }

    // In real app, save data here
    console.log('Temp Saving:', { seriesName, seriesImage, rankData });
    
    // Notify the parent component
    onTempSave?.('임시 저장되었습니다');
  };

  const currentProducts = rankData[selectedRank] || [];
  const totalProductCount = Object.values(rankData).reduce((sum, products) => sum + products.length, 0);

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
          <h1 className="text-white text-xl">쿠지 상품 등록</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        {/* Series Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg mb-4"
        >
          <h2 className="text-white text-lg mb-4">시리즈 정보</h2>
          
          {/* Series Image */}
          <div className="mb-4">
            <label className="text-white/70 text-sm block mb-2">시리즈 이미지</label>
            <label className="cursor-pointer">
              <div className="w-full h-48 bg-white/10 rounded-xl border-2 border-dashed border-white/30 hover:border-teal-400 transition-colors overflow-hidden">
                {seriesImage ? (
                  <img src={seriesImage} alt="Series" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <Upload className="w-8 h-8 text-white/40 mb-2" />
                    <span className="text-white/60 text-sm">클릭하여 이미지 업로드</span>
                  </div>
                )}
              </div>
              <input
                ref={seriesImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleSeriesImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Series Name */}
          <div>
            <label className="text-white/70 text-sm block mb-2">시리즈명</label>
            <input
              type="text"
              value={seriesName}
              onChange={(e) => setSeriesName(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-teal-400"
              placeholder="예: 원피스 쿠지 시리즈 Vol.1"
            />
          </div>
        </motion.div>

        {/* Rank Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg mb-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white">등급 선택</h2>
            <div className="text-teal-300 text-sm">
              총 {totalProductCount}개 상품
            </div>
          </div>
          
          <div className="grid grid-cols-8 gap-2">
            {ranks.map((rank) => {
              const productCount = rankData[rank]?.length || 0;
              const isSelected = selectedRank === rank;
              
              return (
                <button
                  key={rank}
                  onClick={() => setSelectedRank(rank)}
                  className={`relative aspect-square rounded-xl transition-all ${
                    isSelected
                      ? `bg-gradient-to-br ${rankColors[rank]} shadow-lg scale-110`
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className={`text-xl ${isSelected ? 'text-white' : 'text-white/60'}`}>
                      {rank}
                    </span>
                    {productCount > 0 && (
                      <span className={`text-xs ${isSelected ? 'text-white' : 'text-white/60'}`}>
                        {productCount}
                      </span>
                    )}
                  </div>
                  {productCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900" />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Product Entry */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg mb-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${rankColors[selectedRank]} rounded-xl flex items-center justify-center shadow-lg`}>
                <span className="text-white text-xl">{selectedRank}</span>
              </div>
              <h2 className="text-white text-lg">{selectedRank}상 상품 등록</h2>
            </div>
            <button
              onClick={handleAddProduct}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white text-sm flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              상품 추가
            </button>
          </div>

          {currentProducts.length === 0 ? (
            <div className="text-center py-12 text-white/60">
              <p className="mb-2">등록된 상품이 없습니다</p>
              <p className="text-sm">상품 추가 버튼을 눌러 상품을 등록하세요</p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentProducts.map((product) => (
                <div key={product.id} className="bg-white/10 rounded-xl p-4 border border-white/10">
                  <div className="flex items-start gap-4">
                    {/* Image Upload */}
                    <div className="flex-shrink-0">
                      <label className="cursor-pointer">
                        <div className="w-24 h-24 bg-white/10 rounded-lg border-2 border-dashed border-white/30 hover:border-teal-400 transition-colors overflow-hidden">
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
                          onChange={(e) => handleProductImageUpload(product.id, e)}
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
                          onChange={(e) => handleProductChange(product.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-teal-400"
                          placeholder="상품명 입력"
                        />
                      </div>
                      <div>
                        <label className="text-white/60 text-xs block mb-1">재고</label>
                        <input
                          type="number"
                          value={product.stock || ''}
                          onChange={(e) => handleProductChange(product.id, 'stock', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-teal-400"
                          placeholder="재고 수량"
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveProduct(product.id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {/* Temp Save Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleTempSave}
            className="py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl shadow-xl flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            <span>임시 저장</span>
          </motion.button>

          {/* Register Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRegister}
            className="py-4 bg-gradient-to-r from-teal-400 to-blue-500 text-white rounded-xl shadow-xl flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            <span>상품 등록</span>
          </motion.button>
        </div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 bg-amber-500/20 border-2 border-amber-400/50 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <div className="text-xl">💡</div>
            <div className="text-white/70 text-sm">
              <p className="mb-1">각 등급별로 여러 상품을 등록할 수 있습니다.</p>
              <p>등급을 선택하고 상품 추가 버튼을 눌러 상품을 등록하세요.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}