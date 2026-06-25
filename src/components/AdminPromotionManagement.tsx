import React, { useState, useEffect } from 'react';
import { motion } from './motion';
import { fetchPromotions, createPromotion } from '../api/admin';
import { ChevronLeft, Plus, Calendar, Users, Clock } from './icons';

type Promotion = {
  id: number;
  title: string;
  startAt: string;
  endAt: string;
  maxLimit: number;
  currentCount: number;
  freeMonths: number;
  active: boolean;
};

type Props = {
  onBack: () => void;
};

export default function AdminPromotionManagement({ onBack }: Props) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  const [newPromo, setNewPromo] = useState({
    title: '',
    startAt: '',
    endAt: '',
    maxLimit: 50,
    freeMonths: 6,
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      const data = await fetchPromotions();
      setPromotions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // API expects ISO strings
      const payload = {
        ...newPromo,
        startAt: new Date(newPromo.startAt).toISOString(),
        endAt: new Date(newPromo.endAt).toISOString(),
      };
      await createPromotion(payload);
      alert('프로모션이 성공적으로 생성되었습니다.');
      setIsCreating(false);
      loadPromotions();
    } catch (e) {
      console.error(e);
      alert('프로모션 생성에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pb-6">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-white text-3xl font-bold">수수료 프로모션 관리</h1>
              <p className="text-white/70">가입 혜택(수수료 면제) 이벤트 예약 및 관리</p>
            </div>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl shadow-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            새 프로모션 생성
          </button>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {promotions.map((promo) => {
            const progress = (promo.currentCount / promo.maxLimit) * 100;
            return (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-white text-xl font-bold">{promo.title}</h3>
                  {promo.active ? (
                    <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-500/30">
                      진행중
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-white/20 text-white/60 rounded-full text-sm border border-white/30">
                      종료/대기
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-white/80">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span>{new Date(promo.startAt).toLocaleDateString()} ~ {new Date(promo.endAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <span>가입 후 {promo.freeMonths}개월 무료</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm text-white/80 mb-2">
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> 선착순 가입 현황</span>
                    <span>{promo.currentCount} / {promo.maxLimit} 명</span>
                  </div>
                  <div className="w-full bg-black/40 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-cyan-300 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Create Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-2xl p-6 max-w-lg w-full border border-white/20"
            >
              <h3 className="text-white text-xl font-bold mb-6">새 프로모션 생성</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-white/80 mb-2">프로모션 제목</label>
                  <input
                    required
                    type="text"
                    value={newPromo.title}
                    onChange={(e) => setNewPromo({ ...newPromo, title: e.target.value })}
                    className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400"
                    placeholder="예: 오픈 기념 6개월 무료 이벤트"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 mb-2">시작일</label>
                    <input
                      required
                      type="datetime-local"
                      value={newPromo.startAt}
                      onChange={(e) => setNewPromo({ ...newPromo, startAt: e.target.value })}
                      className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2">종료일</label>
                    <input
                      required
                      type="datetime-local"
                      value={newPromo.endAt}
                      onChange={(e) => setNewPromo({ ...newPromo, endAt: e.target.value })}
                      className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 mb-2">선착순 인원</label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={newPromo.maxLimit}
                      onChange={(e) => setNewPromo({ ...newPromo, maxLimit: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2">무료 혜택 개월 수</label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={newPromo.freeMonths}
                      onChange={(e) => setNewPromo({ ...newPromo, freeMonths: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-8">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:opacity-90 transition-opacity font-bold"
                  >
                    생성하기
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                  >
                    취소
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
