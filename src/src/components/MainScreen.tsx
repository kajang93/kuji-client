import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

type MainScreenProps = {
  onStart: () => void;
};

export default function MainScreen({ onStart }: MainScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-pink-400 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-blue-400 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center"
      >
        {/* Logo/Title */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-12"
        >
          <h1 className="text-6xl text-white mb-4">이치방쿠지</h1>
          <div className="flex items-center justify-center gap-2 text-yellow-300">
            <div className="h-1 w-20 bg-yellow-300" />
            <span className="text-2xl">一番くじ</span>
            <div className="h-1 w-20 bg-yellow-300" />
          </div>
        </motion.div>

        {/* Featured Image */}
        <motion.div
          initial={{ rotateY: 0 }}
          animate={{ rotateY: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-12 mx-auto w-80 h-80 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-3xl blur-xl opacity-50" />
          <div className="relative w-full h-full bg-white/10 backdrop-blur-sm rounded-3xl overflow-hidden border-4 border-yellow-400/50 shadow-2xl">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=400"
              alt="이치방쿠지"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Description */}
        <p className="text-white/90 text-xl mb-12 max-w-md mx-auto">
          인기 애니메이션 캐릭터 피규어를<br />
          복권으로 만나보세요!
        </p>

        {/* Start Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="px-16 py-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 rounded-full text-2xl shadow-2xl hover:shadow-yellow-400/50 transition-shadow relative overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-white/30"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
          <span className="relative z-10">시작하기</span>
        </motion.button>

        {/* Info text */}
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-8 text-white/60"
        >
          터치하여 복권을 시작하세요
        </motion.p>
      </motion.div>
    </div>
  );
}
