import DaumPostcode, { Address } from 'react-daum-postcode';
import { motion, AnimatePresence } from './motion';
import { X, MapPin } from './icons';

interface AddressResult {
  address: string;
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
}

interface AddressSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (result: AddressResult) => void;
  title?: string;
  description?: string;
}

export default function AddressSearchModal({
  isOpen,
  onClose,
  onComplete,
  title = '주소 검색',
  description = '검색할 도로명 또는 지번 주소를 입력하세요',
}: AddressSearchModalProps) {
  const handleComplete = (data: Address) => {
    onComplete({
      address: data.address,
      zonecode: data.zonecode,
      roadAddress: data.roadAddress,
      jibunAddress: data.jibunAddress,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-3xl p-6 max-w-md w-full border-2 border-cyan-400/50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-cyan-400/20 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-cyan-300" />
                </div>
                <h2 className="text-white text-xl font-semibold">{title}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <p className="text-white/60 text-xs mb-4">{description}</p>

            {/* Daum Postcode */}
            <div className="rounded-2xl overflow-hidden border border-cyan-400/20 shadow-inner">
              <DaumPostcode
                onComplete={handleComplete}
                style={{ height: 460, display: 'block' }}
                scriptUrl="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
