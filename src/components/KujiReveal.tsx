import type { Prize } from '../App';
import { motion, AnimatePresence } from 'framer-motion';

export default function KujiReveal({
                                       prizes,
                                       onComplete,
                                   }: {
    prizes: Prize[];
    onComplete: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center text-white p-8">
            <h2 className="text-3xl font-bold mb-6">🎊 결과 발표!</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <AnimatePresence>
                    {prizes.map((prize, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ delay: i * 0.2 }}
                            className="bg-gray-800 p-4 rounded-xl text-center shadow-lg"
                        >
                            <img
                                src={prize.image}
                                alt={prize.name}
                                className="w-40 h-40 mx-auto object-cover rounded-lg mb-3"
                            />
                            <h4 className="text-xl font-bold">{prize.rank}상</h4>
                            <p className="opacity-80">{prize.name}</p>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <button
                onClick={onComplete}
                className="mt-10 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded-2xl shadow-lg"
            >
                다시 메인으로
            </button>
        </div>
    );
}
