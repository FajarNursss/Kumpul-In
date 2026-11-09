import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const bgStyles = {
    success: 'bg-[#326273] text-white border-[#5c9ead]',
    error: 'bg-rose-600 text-white border-rose-400',
    info: 'bg-slate-900 text-white border-slate-700',
    coral: 'bg-[#e39774] text-white border-[#d58560]',
  }[type] || 'bg-slate-900 text-white border-slate-700';

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
    coral: CheckCircle2,
  }[type] || Info;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-subtle flex items-center space-x-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-300 max-w-sm">
      <div className={`p-1 rounded-xl bg-white/20 text-white shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xs font-semibold leading-snug flex-1">{message}</p>
      <button
        onClick={onClose}
        className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
