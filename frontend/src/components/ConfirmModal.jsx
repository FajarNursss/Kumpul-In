import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, AlertCircle, LogOut, CheckCircle2, Loader2, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'Konfirmasi Tindakan',
  description = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'primary', // 'primary' | 'danger' | 'warning'
  isLoading = false,
  onConfirm,
  onClose,
  icon: CustomIcon,
}) {
  useEffect(() => {
    if (!isOpen) return;

    // Prevent background scrolling while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  // Icon & theme styling mapped to project palette
  const variantStyles = {
    danger: {
      iconBg: 'bg-[#fdf4f0] text-[#d58560] border-[#e39774]/40',
      confirmBtn: 'bg-[#e39774] hover:bg-[#d58560] text-white focus-visible:ring-[#e39774]',
      defaultIcon: AlertTriangle,
    },
    warning: {
      iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
      confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white focus-visible:ring-amber-500',
      defaultIcon: AlertCircle,
    },
    primary: {
      iconBg: 'bg-[#eef6f8] text-[#326273] border-[#5c9ead]/40',
      confirmBtn: 'bg-[#326273] hover:bg-[#264c5a] text-white focus-visible:ring-[#326273]',
      defaultIcon: CheckCircle2,
    },
  };

  const currentTheme = variantStyles[variant] || variantStyles.primary;
  const DisplayIcon = CustomIcon || currentTheme.defaultIcon;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col p-6 space-y-5 animate-scale-in my-auto relative">
        {/* Header with Icon */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${currentTheme.iconBg}`}>
              <DisplayIcon className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 id="confirm-modal-title" className="text-base font-bold text-slate-900 leading-tight">
                {title}
              </h3>
              <p id="confirm-modal-desc" className="text-xs text-slate-500 mt-1 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Tutup jendela konfirmasi"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-[#326273]"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="h-11 px-4 rounded-xl font-bold text-xs sm:text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors focus-visible:ring-2 focus-visible:ring-[#326273] cursor-pointer flex items-center justify-center"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`h-11 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:outline-none ${currentTheme.confirmBtn}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
