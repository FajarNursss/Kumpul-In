import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Copy, Check, Calendar, Clock, Building, ArrowRight } from 'lucide-react';

export default function SuccessModal({ bookingData, onClose }) {
  const [copied, setCopied] = useState(false);

  // Close on Escape & prevent background scrolling
  useEffect(() => {
    if (!bookingData) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [bookingData, onClose]);

  if (!bookingData) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingData.booking_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 p-6 sm:p-8 space-y-6 my-auto relative animate-scale-in">
        {/* Top Celebration Icon */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" aria-hidden="true" />
          </div>
          <h2 id="success-modal-title" className="text-xl font-bold text-slate-900">Peminjaman Berhasil!</h2>
          <p className="text-xs text-slate-500">
            Permohonan peminjaman Anda telah dikonfirmasi secara instan oleh sistem Kumpul-In Kampus.
          </p>
        </div>

        {/* Booking Code Box */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-center space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Kode Peminjaman Sah
          </span>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-lg sm:text-xl font-mono font-black text-[#326273] tracking-wide">
              {bookingData.booking_code}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors focus-visible:ring-2 focus-visible:ring-[#326273]"
              title="Salin Kode Booking"
              aria-label="Salin Kode Booking Resmi"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
          {copied && <p className="text-[11px] text-emerald-600 font-semibold">Berhasil disalin ke clipboard!</p>}
        </div>

        {/* Summary Details */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#5c9ead]" aria-hidden="true" /> Fasilitas
            </span>
            <span className="font-bold text-slate-800">{bookingData.room_name} ({bookingData.category})</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#5c9ead]" aria-hidden="true" /> Jadwal Waktu
            </span>
            <span className="font-bold text-slate-800">{bookingData.schedule}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-400">Tipe Peminjaman</span>
            <span className="font-semibold text-slate-700 capitalize">
              {bookingData.duration_type === 'daily' ? 'Harian Penuh (Daily)' : 'Per Jam (Hourly)'}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5">
            <span className="text-slate-400">Sisa Kuota Peminjaman</span>
            <span className="font-bold text-emerald-700">{bookingData.remaining_quota} slot</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#326273] text-white hover:bg-[#264c5a] shadow-md transition-all flex items-center justify-center space-x-2 focus-visible:ring-2 focus-visible:ring-[#326273]"
        >
          <span>Selesai & Tutup</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>,
    document.body
  );
}
