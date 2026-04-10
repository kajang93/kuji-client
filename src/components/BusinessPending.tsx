import { motion } from "./motion";
import { Shield, Clock, ChevronLeft } from "./icons";

type BusinessPendingProps = {
  onBack: () => void;
  user: { name: string; email: string } | null;
};

export default function BusinessPending({
  onBack,
  user,
}: BusinessPendingProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-800 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-12">
        <button
          onClick={onBack}
          className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-white text-xl font-bold">승인 대기 안내</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mb-6 border-2 border-amber-500/50"
        >
          <Clock className="w-12 h-12 text-amber-400" />
        </motion.div>

        <h2 className="text-white text-3xl font-bold mb-4">
          안녕하세요, {user?.name || "사업자"}님!
        </h2>
        
        <div className="max-w-md bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md mb-8">
          <p className="text-slate-300 leading-relaxed">
            현재 회원님의 계정은 <span className="text-amber-400 font-bold">관리자 승인 대기 중</span>입니다.<br /><br />
            이치방쿠지 서비스의 신뢰성을 위해 사업자 등록 정보를 검토하고 있습니다. 
            승인이 완료되면 대시보드 기능을 정상적으로 이용하실 수 있습니다.
          </p>
        </div>

        <div className="flex items-center gap-2 text-slate-400 mb-12">
          <Shield className="w-5 h-5" />
          <span>보통 1~2일 내에 승인이 완료됩니다.</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="px-12 py-4 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 rounded-xl font-bold shadow-xl"
        >
          홈으로 돌아가기
        </motion.button>
      </div>

      <div className="py-8 text-slate-500 text-sm">
        문의사항: {process.env.VITE_ADMIN_EMAIL || "admin@ichibankuji.com"}
      </div>
    </div>
  );
}
