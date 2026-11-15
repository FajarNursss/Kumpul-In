import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Printer, CheckCircle2, Building, Calendar, Clock,
  User, ShieldCheck, Share2, Copy, Check, QrCode, AlertTriangle
} from 'lucide-react';
import { formatDateIndo, formatTimeClean } from '../utils/formatters';
import QrCodeSvg from './QrCodeSvg';

export default function ReceiptModal({ booking, onClose }) {
  const [copiedToken, setCopiedToken] = useState(false);

  // Close on Escape & prevent body scrolling
  useEffect(() => {
    if (!booking) return;

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
  }, [booking, onClose]);

  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyToken = () => {
    if (booking.checkin_token) {
      navigator.clipboard.writeText(booking.checkin_token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    const roomName = booking.room?.name || booking.room_name || 'Ruangan Kampus';
    const dateFormatted = formatDateIndo(booking.booking_date);
    const sessionTime = `${formatTimeClean(booking.start_time)} - ${formatTimeClean(booking.end_time)} WIB`;
    const message = `*VOUCHER BUKTI PEMINJAMAN RUANG KUMPUL-IN KAMPUS*
------------------------------------------------
🏛️ *Ruangan:* ${roomName}
📅 *Tanggal:* ${dateFormatted}
⏰ *Sesi Waktu:* ${sessionTime}
🔢 *Kode Booking:* ${booking.booking_code}
🔑 *Token Check-in:* ${booking.checkin_token || '-'}
👤 *Pemohon:* ${booking.user?.name || 'Civitas Kampus'}
✅ *Status:* Terkonfirmasi Resmi

_Peminjaman fasilitas ini resmi terdaftar di Sistem Biro Sarana & Fasilitas Kumpul-In Kampus._`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const isCheckedIn = !!booking.checked_in_at;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto print:p-0 print:bg-white"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-auto relative animate-scale-in max-h-[92vh] flex flex-col print:border-none print:shadow-none print:w-full print:max-h-none">
        {/* Modal Top Action (hidden on print) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden shrink-0">
          <span id="receipt-modal-title" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Surat Bukti Peminjaman Ruang Kampus
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#326273] text-white hover:bg-[#264c5a] transition-all flex items-center gap-1.5 shadow-sm focus-visible:ring-2 focus-visible:ring-[#326273] cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Cetak / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup voucher"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors focus-visible:ring-2 focus-visible:ring-[#326273] cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Receipt Voucher Body */}
        <div className="p-5 sm:p-7 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* Header Brand */}
          <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-300">
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
          <div className="text-center p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              KODE RESERVASI SAH
            </span>
            <div className="text-xl sm:text-2xl font-mono font-black text-[#326273] tracking-wider">
              {booking.booking_code}
            </div>
            {booking.recurring_group_id && (
              <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                🔄 Bagian Dari Reservasi Rutin Mingguan
              </span>
            )}
          </div>

          {/* QR Code Check-In Section */}
          <div className="p-4 rounded-2xl bg-[#f8fafc] border border-slate-200/90 flex flex-col items-center text-center space-y-2.5">
            <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200">
              <QrCodeSvg
                text={booking.checkin_token || booking.booking_code}
                size={140}
                fgColor="#326273"
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-[#326273]" />
                <span>QR Check-In Kehadiran Ruangan</span>
              </div>
              <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
                Scan kode QR ini di depan pintu ruangan dalam 15–30 menit sejak jam mulai. Sistem memberlakukan Auto-Release bila tidak ada check-in.
              </p>
            </div>

            {/* Token Copy & Check-in Badge */}
            {booking.checkin_token && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-mono font-semibold px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
                  {booking.checkin_token}
                </span>
                <button
                  type="button"
                  onClick={handleCopyToken}
                  className="px-2 py-1 rounded-lg text-[11px] font-bold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Salin Token Check-in"
                >
                  {copiedToken ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-500" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Check-in verification status banner */}
            {isCheckedIn ? (
              <div className="w-full p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Telah Terverifikasi Hadir di Ruangan</span>
              </div>
            ) : (
              <div className="w-full p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-medium flex items-center justify-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Belum Check-In • Wajib Scan Saat Hadir di Lokasi</span>
              </div>
            )}
          </div>

          {/* Details Table */}
          <div className="space-y-2.5 text-xs">
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
              <span className="font-bold text-slate-800">{formatDateIndo(booking.booking_date)}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#5c9ead]" aria-hidden="true" /> Jam Sesi
              </span>
              <span className="font-bold text-slate-800">
                {formatTimeClean(booking.start_time)} - {formatTimeClean(booking.end_time)} WIB
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
                {booking.user?.name || 'Civitas Akademika'}
              </span>
            </div>
          </div>

          {/* Verification Watermark */}
          <div className="pt-3 border-t border-dashed border-slate-300 flex items-center justify-between text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#326273]" aria-hidden="true" />
              <span>Divalidasi Real-Time via Kumpul-In API</span>
            </div>
            <span>Kumpul-In Kampus Official</span>
          </div>
        </div>

        {/* Modal Bottom Footer with WhatsApp Share & Close (hidden on print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 print:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Kirim Bukti WhatsApp</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-[#326273] cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
