import { useState } from 'react';
import { motion, AnimatePresence } from './motion';
import { Check, X } from './icons';
import { ImageWithFallback } from './figma/ImageWithFallback';

export default function PrizeSelectionDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Demo data
  const rank = 'G';
  const options = [
    { id: 'G1', name: '루피 아크릴 스탠드', image: 'https://images.unsplash.com/photo-1658233427916-2351b655618f?w=300', description: '높이 10cm' },
    { id: 'G2', name: '조로 아크릴 스탠드', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300', description: '높이 10cm' },
    { id: 'G3', name: '나미 아크릴 스탠드', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300', description: '높이 10cm' },
    { id: 'G4', name: '우솝 아크릴 스탠드', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300', description: '높이 10cm' },
    { id: 'G5', name: '상디 아크릴 스탠드', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300', description: '높이 10cm' },
    { id: 'G6', name: '쵸파 아크릴 스탠드', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300', description: '높이 10cm' },
  ];

  const steps = [
    { title: '1단계', description: '원하는 상품을 클릭하세요' },
    { title: '2단계', description: '선택 완료 버튼을 누르세요' },
    { title: '완료', description: '상품이 선택되었습니다!' },
  ];

  const handleSelectOption = (id: string) => {
    if (currentStep === 0) {
      setSelectedOption(id);
      setTimeout(() => setCurrentStep(1), 300);
    }
  };

  const handleConfirm = () => {
    if (selectedOption && currentStep === 1) {
      setCurrentStep(2);
      setTimeout(() => {
        setCurrentStep(0);
        setSelectedOption(null);
      }, 3000);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSelectedOption(null);
  };

  return (
    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-400/30 rounded-2xl p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-amber-300 text-lg">💡 상품 선택 데모</h3>
          <p className="text-white/60 text-sm mt-1">{steps[currentStep].description}</p>
        </div>
        <button
          onClick={handleReset}
          className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
        >
          다시하기
        </button>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-4">
        {steps.map((step, index) => (
          <div key={index} className="flex-1">
            <div className={`h-2 rounded-full transition-all ${
              index <= currentStep ? 'bg-amber-400' : 'bg-white/20'
            }`} />
            <div className={`text-xs mt-1 transition-colors ${
              index === currentStep ? 'text-amber-300' : 'text-white/40'
            }`}>
              {step.title}
            </div>
          </div>
        ))}
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {options.slice(0, 6).map((option, index) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleSelectOption(option.id)}
            disabled={currentStep >= 2}
            className={`relative rounded-xl overflow-hidden transition-all ${
              selectedOption === option.id
                ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-400/50'
                : 'ring-1 ring-white/20 hover:ring-white/40'
            } ${currentStep >= 2 ? 'opacity-50' : ''}`}
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
            <div className="bg-gradient-to-t from-black/80 to-transparent p-2">
              <div className="text-white text-xs line-clamp-1">
                {option.name}
              </div>
            </div>

            {/* Selected Indicator */}
            <AnimatePresence>
              {selectedOption === option.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-1 right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Check className="w-4 h-4 text-slate-900" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      {/* Confirm Button */}
      <AnimatePresence>
        {currentStep === 1 && selectedOption && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirm}
            className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 rounded-xl shadow-xl hover:from-amber-300 hover:to-amber-400 transition-all animate-pulse"
          >
            <div className="text-center">✨ 선택 완료</div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {currentStep === 2 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex items-center justify-center gap-2 py-3 bg-green-500/20 border border-green-400/50 rounded-xl"
          >
            <Check className="w-5 h-5 text-green-300" />
            <span className="text-green-300">선택이 완료되었습니다!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
