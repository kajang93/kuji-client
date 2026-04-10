import { useState } from 'react';
import { motion, AnimatePresence } from './motion';
import { X, Send } from './icons';

type InquiryType = '주문' | '배송' | '결제' | '상품문의' | '기타';

type SellerInquiryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (inquiryType: InquiryType, subject: string, content: string) => void;
  orderNumber: string;
  sellerName: string;
};

export default function SellerInquiryModal({
  isOpen,
  onClose,
  onSubmit,
  orderNumber,
  sellerName,
}: SellerInquiryModalProps) {
  const [inquiryType, setInquiryType] = useState<InquiryType>('주문');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  const inquiryTypes: InquiryType[] = ['주문', '배송', '결제', '상품문의', '기타'];

  const handleSubmit = () => {
    if (!subject.trim() || !content.trim()) return;
    onSubmit(inquiryType, subject, content);
    setInquiryType('주문');
    setSubject('');
    setContent('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-3xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-white">판매자 문의</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Info */}
          <div className="bg-white/10 rounded-xl p-4 mb-4">
            <div className="text-white/70 text-sm mb-1">판매자</div>
            <div className="text-white mb-3">{sellerName}</div>
            <div className="text-white/70 text-sm mb-1">주문번호</div>
            <div className="text-white">{orderNumber}</div>
          </div>

          {/* Inquiry Type Selection */}
          <div className="mb-4">
            <label className="block text-white/70 text-sm mb-2">문의 타입</label>
            <select
              value={inquiryType}
              onChange={(e) => setInquiryType(e.target.value as InquiryType)}
              className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {inquiryTypes.map((type) => (
                <option key={type} value={type} className="bg-purple-900 text-white">
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Input */}
          <div className="mb-4">
            <label className="block text-white/70 text-sm mb-2">문의 제목</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="문의 제목을 입력해주세요"
              className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Content Input */}
          <div className="mb-6">
            <label className="block text-white/70 text-sm mb-2">문의 내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="문의하실 내용을 상세히 입력해주세요"
              rows={5}
              className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/20 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={!subject.trim() || !content.trim()}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>문의 전송</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}