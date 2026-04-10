import { useState } from 'react';
import { useEffect } from 'react';
import { motion, AnimatePresence } from './motion';
import { Check, X, ChevronLeft } from './icons';
import { ImageWithFallback } from './figma/ImageWithFallback';

export type PrizeOption = {
  id: string;
  name: string;
  image: string;
  description: string;
};

type PrizeSelectionProps = {
  rank: string;
  prizeName: string;
  availableOptions: PrizeOption[];
  onConfirm: (optionId: string) => void;
  onBack: () => void;
};

export default function PrizeSelection({ rank, prizeName, availableOptions, onConfirm, onBack }: PrizeSelectionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSelectOption = (id: string) => {
    setSelectedOption(id);
  };

  const handleConfirm = () => {
    if (selectedOption) {
      onConfirm(selectedOption);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-900 via-blue-900 to-purple-800">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-purple-900 to-blue-900 border-b-2 border-cyan-400/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-xl text-center">🎁 {prizeName} 당첨!</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Info Alert */}
        {availableOptions.length === 0 ? (
          <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4 mb-4">
            <p className="text-red-300 text-center">
              죄송합니다. 현재 선택 가능한 옵션이 없습니다.
            </p>
          </div>
        ) : (
          <div className="bg-amber-500/20 border border-amber-400/50 rounded-xl p-3 mb-4">
            <p className="text-amber-200 text-center text-sm">
              옵션 선택 가능: {availableOptions.length}개
            </p>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {availableOptions.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleSelectOption(option.id)}
              className={`relative rounded-2xl overflow-hidden transition-all ${
                selectedOption === option.id
                  ? 'ring-4 ring-cyan-400 shadow-lg shadow-cyan-400/50 scale-105'
                  : 'ring-2 ring-white/20 hover:ring-white/40 hover:scale-102'
              }`}
            >
              {/* Image */}
              <div className="aspect-square bg-white/10">
                <ImageWithFallback
                  src={option.image}
                  alt={option.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="bg-gradient-to-t from-black/90 to-transparent p-3">
                <div className="text-white line-clamp-2 mb-1">
                  {option.name}
                </div>
                <div className="text-white/60 text-xs">
                  {option.description}
                </div>
              </div>

              {/* Selected Indicator */}
              <AnimatePresence>
                {selectedOption === option.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-2 right-2 w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Check className="w-6 h-6 text-slate-900" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Shine effect when selected */}
              {selectedOption === option.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Warning if no selection */}
        {!selectedOption && availableOptions.length > 0 && (
          <div className="text-center text-white/40 text-sm mt-4">
            상품을 선택해주세요
          </div>
        )}
      </div>

      {/* Sticky Bottom Button */}
      <div className="sticky bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-purple-900 via-purple-900 to-transparent">
        {selectedOption ? (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirm}
            className="w-full py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-2xl shadow-xl hover:from-cyan-300 hover:to-blue-400 transition-all"
          >
            <div className="text-center text-lg">
              ✨ 이 상품으로 선택 완료
            </div>
          </motion.button>
        ) : (
          <button
            disabled
            className="w-full py-4 bg-white/10 text-white/40 rounded-2xl cursor-not-allowed"
          >
            <div className="text-center text-lg">
              상품을 선택해주세요
            </div>
          </button>
        )}
      </div>
    </div>
  );
}