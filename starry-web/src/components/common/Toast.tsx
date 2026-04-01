import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  msg: string;
  type: 'ok' | 'err';
  onClose: () => void;
}

export function Toast({ msg, type, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
        type === 'ok'
          ? 'bg-green-900/80 border-green-500/30 text-green-300'
          : 'bg-red-900/80 border-red-500/30 text-red-300'
      }`}
    >
      {type === 'ok' ? <Check size={16} /> : <AlertCircle size={16} />}
      <span className="text-sm font-medium">{msg}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </motion.div>
  );
}
