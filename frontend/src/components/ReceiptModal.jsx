import React, { useEffect } from 'react';
import { X, Printer, CheckCircle2, Building, Calendar, Clock, User, ShieldCheck } from 'lucide-react';

export default function ReceiptModal({ booking, onClose }) {
  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white"
    >
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden print:border-none print:shadow-none print:w-full">
        {/* Modal Top Action (hidden on print) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
          <span id="receipt-modal-title" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Surat Bukti Peminjaman Ruang Kampus
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#326273] text-white hover:bg-[#264c5a] transition-all flex items-center gap-1.5 shadow-sm focus-visible:ring-2 focus-visible:ring-[#326273]"
            >
              <Printer className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Cetak / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup voucher"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors focus-visible:ring-2 focus-visible:ring-[#326273]"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Receipt Voucher Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Brand */}
          <div className="flex items-center justify-between pb-4 border-b border-dashed border-slate-300">
            <div className="flex items-center space-x-2.5">
              <img src="/logo-icon.png" alt="" className="h-8 w-auto object-contain" aria-hidden="true" />
              <div>
                <h3 className="font-black text-slate-900 text-base tracking-tight">Kumpul-In Kampus</h3>
                <p className="text-[10px] text-slate-400">Sistem Peminjaman Fasilitas Kampus</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Terkonfirmasi
              </span>
            </div>
          </div>

          {/* Booking Code Section */}
          <div className="text-center p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              KODE RESERVASI SAH
            </span>
            <div className="text-2xl font-mono font-black text-[#326273] tracking-wider">
              {booking.booking_code}
            </div>
            <p className="text-[10px] text-slate-400">
              Tunjukkan kode ini kepada resepsionis / pengelola saat check-in di lokasi
            </p>
          </div>

          {/* Details Table */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#5c9ead]" aria-hidden="true" /> Ruangan
              </span>
              <span className="font-bold text-slate-800 text-right">
                {booking.room?.name || booking.room_name || 'Ruangan'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#5c9ead]" aria-hidden="true" /> Tanggal
              </span>
              <span className="font-bold text-slate-800">{booking.booking_date}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#5c9ead]" aria-hidden="true" /> Jam Sesi
              </span>
              <span className="font-bold text-slate-800">
                {booking.start_time} - {booking.end_time} WIB
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Tipe Durasi</span>
              <span className="font-semibold text-slate-700 capitalize">
                {booking.duration_type === 'daily' ? 'Harian Penuh (Daily)' : 'Per Jam (Hourly)'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#5c9ead]" aria-hidden="true" /> Pemesan
              </span>
              <span className="font-semibold text-slate-800">
                {booking.user?.name || 'Member Terverifikasi'}
              </span>
            </div>
          </div>

          {/* Verification Watermark */}
          <div className="pt-4 border-t border-dashed border-slate-300 flex items-center justify-between text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#326273]" aria-hidden="true" />
              <span>Divalidasi Real-Time via Kumpul-In API</span>
            </div>
            <span>Kumpul-In Official System</span>
          </div>
        </div>

        {/* Modal Bottom Footer (hidden on print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 print:hidden text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-[#326273]"
          >
            Tutup Voucher
          </button>
        </div>
      </div>
    </div>
  );
}
