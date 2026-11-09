import React, { useState, useEffect } from 'react';
import { CheckCircle2, Copy, Check, Calendar, Clock, Building, ArrowRight } from 'lucide-react';

export default function SuccessModal({ bookingData, onClose }) {
  const [copied, setCopied] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!bookingData) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingData.booking_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 transform transition-all p-6 sm:p-8 space-y-6">
        {/* Top Celebration Icon */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" aria-hidden="true" />
          </div>
          <h2 id="success-modal-title" className="text-xl font-bold text-slate-900">Reservasi Berhasil!</h2>
          <p className="text-xs text-slate-500">
            Pemesanan Anda telah dikonfirmasi secara instan oleh sistem Kumpul-In.
          </p>
        </div>

        {/* Booking Code Box */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-center space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Kode Booking Resmi
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
              <Building className="w-3.5 h-3.5" aria-hidden="true" /> Ruangan
            </span>
            <span className="font-bold text-slate-800">{bookingData.room_name} ({bookingData.category})</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" /> Jadwal Waktu
            </span>
            <span className="font-bold text-slate-800">{bookingData.schedule}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-400">Tipe Sewa</span>
            <span className="font-semibold text-slate-700 capitalize">{bookingData.duration_type}</span>
          </div>

          <div className="flex items-center justify-between py-1.5">
            <span className="text-slate-400">Sisa Kuota Reservasi</span>
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
    </div>
  );
}
