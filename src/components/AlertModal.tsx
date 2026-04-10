import { motion, AnimatePresence } from './motion';
import { AlertCircle, CheckCircle, XCircle, Info } from './icons';

type AlertModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
};

export default function AlertModal({ isOpen, onClose, title, message, type = 'info' }: AlertModalProps) {
  const config = {
    success: {
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-400/50',
    },
    error: {
      icon: XCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-400/50',
    },
    warning: {
      icon: AlertCircle,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
      borderColor: 'border-amber-400/50',
    },
    info: {
      icon: Info,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-400/50',
    },
  };

  const currentConfig = config[type];
  const Icon = currentConfig.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 max-w-md w-full border-2 border-teal-400/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 ${currentConfig.bgColor} border-2 ${currentConfig.borderColor} rounded-full flex items-center justify-center mb-4`}>
                <Icon className={`w-8 h-8 ${currentConfig.color}`} />
              </div>
              
              {title && (
                <h3 className="text-white text-xl mb-2">{title}</h3>
              )}
              
              <p className="text-white/80 mb-6">{message}</p>

              <button
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 rounded-xl hover:from-amber-300 hover:to-amber-400 transition-all"
              >
                확인
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


