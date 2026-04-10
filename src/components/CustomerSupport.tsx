import { useState } from 'react';
import { motion } from './motion';
import { ChevronLeft, Send, FileText } from './icons';
import { toast } from 'sonner@2.0.3';
import SupportHistory from './SupportHistory';

type CustomerSupportProps = {
  onBack: () => void;
};

export default function CustomerSupport({ onBack }: CustomerSupportProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [formData, setFormData] = useState({
    category: '주문/배송',
    title: '',
    content: '',
    email: '',
    phone: '',
  });

  const categories = [
    '주문/배송',
    '결제',
    '상품 문의',
    '회원 정보',
    '기타',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('제목을 입력해주세요.');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('문의 내용을 입력해주세요.');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('답변 받을 이메일을 입력해주세요.');
      return;
    }

    // Mock submission
    toast.success('문의가 접수되었습니다.\n빠른 시일 내에 답변 드리겠습니다.');
    
    // Reset form
    setFormData({
      category: '주문/배송',
      title: '',
      content: '',
      email: '',
      phone: '',
    });
  };

  if (showHistory) {
    return <SupportHistory onBack={() => setShowHistory(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-purple-900 to-blue-900 border-b-2 border-cyan-400/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-xl">1:1 문의</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Info Box */}
          <div className="bg-blue-500/20 border border-blue-400/50 rounded-2xl p-4 mb-6">
            <h3 className="text-blue-300 mb-2 flex items-center gap-2">
              <span>💬</span>
              <span>문의 안내</span>
            </h3>
            <ul className="text-white/80 text-sm space-y-1">
              <li>• 평일 09:00 ~ 18:00 운영 (주말/공휴일 휴무)</li>
              <li>• 문의 접수 후 1~2 영업일 내 답변 드립니다</li>
              <li>• 급한 문의는 고객센터(1588-0000)로 연락주세요</li>
            </ul>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category */}
            <div>
              <label className="block text-white mb-2">
                문의 유형 <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white focus:outline-none focus:border-yellow-400"
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-purple-900">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-white mb-2">
                제목 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="문의 제목을 입력하세요"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-white mb-2">
                문의 내용 <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="문의하실 내용을 자세히 작성해주세요"
                rows={8}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 resize-none"
                required
              />
              <p className="text-white/60 text-sm mt-1">
                {formData.content.length} / 1000자
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-white mb-2">
                답변 받을 이메일 <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@email.com"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
                required
              />
            </div>

            {/* Phone (Optional) */}
            <div>
              <label className="block text-white mb-2">연락처 (선택)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9]/g, '');
                  let formatted = cleaned;
                  if (cleaned.length <= 3) {
                    formatted = cleaned;
                  } else if (cleaned.length <= 7) {
                    formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
                  } else {
                    formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
                  }
                  setFormData({ ...formData, phone: formatted });
                }}
                placeholder="010-0000-0000"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
              />
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 rounded-xl shadow-xl flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              <span>문의 신청</span>
            </motion.button>

            {/* History Button */}
            <button
              type="button"
              onClick={() => setShowHistory(true)}
              className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/30 transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              <span>문의 내역 보기</span>
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
