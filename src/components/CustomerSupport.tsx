import { useState } from 'react';
import { motion } from './motion';
import { ChevronLeft, Send, FileText } from './icons';
import { toast } from 'sonner';
import SupportHistory from './SupportHistory';
import { createInquiry } from '../api/inquiry';
import { InquiryType } from '../shared-types';

type CustomerSupportProps = {
  onBack: () => void;
};

const INQUIRY_CATEGORIES: { label: string; value: InquiryType }[] = [
  { label: '주문/배송', value: 'SHIPPING' },
  { label: '상품 문의', value: 'PRODUCT' },
  { label: '계정/인증', value: 'ACCOUNT' },
  { label: '기타', value: 'ETC' },
];

export default function CustomerSupport({ onBack }: CustomerSupportProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    inquiryType: 'SHIPPING' as InquiryType,
    title: '',
    content: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('제목을 입력해주세요.');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('문의 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createInquiry(formData);
      toast.success('문의가 성공적으로 접수되었습니다!');
      
      // Reset form
      setFormData({
        inquiryType: 'SHIPPING',
        title: '',
        content: '',
      });
      
      // 내역 화면으로 이동 권장
      setShowHistory(true);
    } catch (error: any) {
      toast.error(error.message || '문의 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showHistory) {
    return <SupportHistory onBack={() => setShowHistory(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-purple-900 to-blue-900 border-b-2 border-cyan-400/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-xl font-bold">1:1 문의</h1>
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
          <div className="bg-blue-500/10 border border-blue-400/30 rounded-2xl p-5 mb-6">
            <h3 className="text-blue-300 font-bold mb-3 flex items-center gap-2">
              <span className="text-lg">💬</span>
              <span>문의 안내</span>
            </h3>
            <ul className="text-white/70 text-sm space-y-2 leading-relaxed">
              <li>• 평일 09:00 ~ 18:00 운영 (주말/공휴일 휴무)</li>
              <li>• 문의 접수 후 1~2 영업일 내 답변 드립니다.</li>
              <li>• 본인 확인을 위해 답변 알림이 발송될 수 있습니다.</li>
            </ul>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category */}
            <div>
              <label className="block text-white/60 text-xs font-bold mb-3 uppercase tracking-wider">
                문의 유형 <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {INQUIRY_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, inquiryType: cat.value })}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                      formData.inquiryType === cat.value
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-white/60 text-xs font-bold mb-3 uppercase tracking-wider">
                제목 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="제목을 입력하세요"
                className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 transition-colors"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-white/60 text-xs font-bold mb-3 uppercase tracking-wider">
                문의 내용 <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="문의하실 내용을 자세히 작성해주세요"
                rows={5}
                className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 resize-none transition-colors"
                required
              />
              <div className="flex justify-end mt-2">
                <span className={`text-xs ${formData.content.length > 900 ? 'text-rose-500' : 'text-white/30'}`}>
                  {formData.content.length} / 1000
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 space-y-3">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 font-bold rounded-xl shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100 transition-all"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span>문의 신청하기</span>
              </motion.button>

              {/* History Button */}
              <button
                type="button"
                onClick={() => setShowHistory(true)}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5 opacity-60" />
                <span>나의 문의 내역</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
