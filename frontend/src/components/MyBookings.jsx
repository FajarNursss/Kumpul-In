import React, { useEffect, useState } from 'react';
import { bookingService } from '../services/api';
import ReceiptModal from './ReceiptModal';
import ConfirmModal from './ConfirmModal';
import { formatDateIndo, formatTimeClean } from '../utils/formatters';
import {
  CalendarCheck, Clock, Download, Building, Loader2, FileText,
  CheckCircle2, Printer, Copy, Check, Filter, Search, QrCode,
  CalendarX, XCircle
} from 'lucide-react';

export default function MyBookings({ currentUser, onShowToast, onQuotaRecovered }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState(null);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'confirmed' | 'cancelled'

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getMyBookings();
      if (res.success) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    try {
      setCancelling(true);
      const res = await bookingService.cancelBooking(bookingToCancel.id);
      if (res.success) {
        if (onShowToast) {
          onShowToast(`Peminjaman ${bookingToCancel.room?.name || 'ruangan'} berhasil dibatalkan. Kuota 1 slot dipulihkan.`, 'success');
        }
        if (onQuotaRecovered) {
          onQuotaRecovered(res.data?.remaining_quota);
        }
        setBookingToCancel(null);
        fetchBookings();
      }
    } catch (err) {
      if (onShowToast) {
        onShowToast(err.customMessage || 'Gagal membatalkan peminjaman.', 'error');
      }
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentUser]);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    if (onShowToast) {
      onShowToast(`Kode booking ${code} berhasil disalin ke clipboard!`, 'success');
    }
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'pending') return b.status === 'pending';
    if (filterStatus === 'confirmed') return b.status === 'confirmed';
    if (filterStatus === 'cancelled') return b.status === 'cancelled' || b.status === 'rejected';
    return true;
  });

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#326273] mb-2" />
        <p className="text-sm font-semibold">Memuat riwayat reservasi Anda...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-8 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-[#eef6f8] text-[#326273] flex items-center justify-center mx-auto border border-[#5c9ead]/30">
          <CalendarCheck className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Belum Ada Reservasi Aktif</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Akun Anda belum memiliki jadwal pemesanan ruangan. Buka tab <strong>Katalog Ruangan</strong> untuk memilih meja kerja atau ruang diskusi sesuai kebutuhan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Overview Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#5c9ead] uppercase tracking-wider block">
            Panel Reservasi Pribadi
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
            Daftar Reservasi Anda
          </h2>
          <p className="text-xs text-slate-500">
            Dikelola dengan akun <strong>{currentUser?.name}</strong> ({currentUser?.role})
          </p>
        </div>

        {/* Quick Filter Pills */}
        <div role="tablist" aria-label="Filter status reservasi" className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold self-start sm:self-auto">
          <button
            type="button"
            role="tab"
            aria-selected={filterStatus === 'all'}
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#326273] ${
              filterStatus === 'all'
                ? 'bg-[#326273] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({bookings.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filterStatus === 'pending'}
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#326273] ${
              filterStatus === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-800 hover:text-amber-950'
            }`}
          >
            Menunggu Verifikasi ({bookings.filter(b => b.status === 'pending').length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filterStatus === 'confirmed'}
            onClick={() => setFilterStatus('confirmed')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#326273] ${
              filterStatus === 'confirmed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Disetujui ({bookings.filter(b => b.status === 'confirmed').length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filterStatus === 'cancelled'}
            onClick={() => setFilterStatus('cancelled')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#326273] ${
              filterStatus === 'cancelled'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dibatalkan / Ditolak
          </button>
        </div>
      </div>

      {/* Bookings Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredBookings.map((b) => (
          <div
            key={b.id}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
          >
            <div>
              {/* Header: Code & Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#326273] bg-[#eef6f8] px-2.5 py-1 rounded-lg border border-[#5c9ead]/40">
                      {b.booking_code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(b.booking_code)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-[#326273]"
                      title="Salin Kode Booking"
                      aria-label={`Salin kode booking ${b.booking_code}`}
                    >
                      {copiedCode === b.booking_code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                    </button>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5 pt-1">
                    <Building className="w-4 h-4 text-[#326273]" />
                    {b.room?.name || 'Fasilitas Kampus'}
                  </h4>
                  <span className="text-xs text-slate-500 block">
                    Kategori: {b.room?.category || 'Fasilitas Kampus'} • Kapasitas: {b.room?.capacity || '-'} Orang
                  </span>
                </div>

                {/* Status Badge */}
                {b.status === 'pending' && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 shrink-0 bg-amber-50 text-amber-800 border-amber-200 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Menunggu Verifikasi</span>
                  </span>
                )}
                {b.status === 'confirmed' && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 shrink-0 bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Disetujui</span>
                  </span>
                )}
                {b.status === 'rejected' && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 shrink-0 bg-rose-50 text-rose-800 border-rose-200 shadow-2xs">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Ditolak Admin</span>
                  </span>
                )}
                {b.status === 'cancelled' && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 shrink-0 bg-slate-100 text-slate-600 border-slate-200 shadow-2xs">
                    <XCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>Dibatalkan</span>
                  </span>
                )}
              </div>

              {/* Time & Date Box */}
              <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3.5 rounded-2xl mt-3 border border-slate-200/80">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tanggal Booking:</span>
                  <span className="font-bold text-slate-800">{formatDateIndo(b.booking_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Jadwal Sesi:</span>
                  <span className="font-bold text-slate-800 font-mono">{formatTimeClean(b.start_time)} - {formatTimeClean(b.end_time)} WIB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tipe Durasi:</span>
                  <span className="font-bold text-slate-800">
                    {b.duration_type === 'daily' ? 'Seharian Penuh' : 'Sesi Jam'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Voucher Modal, Cancel Validation, & PDF Download */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReceiptBooking(b)}
                  aria-label={`Lihat voucher bukti reservasi ${b.booking_code}`}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-[#326273] hover:text-white transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#326273] cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Lihat Bukti</span>
                </button>

                {(b.status === 'pending' || b.status === 'confirmed') && (
                  <button
                    type="button"
                    onClick={() => setBookingToCancel(b)}
                    aria-label={`Batalkan peminjaman ${b.booking_code}`}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
                  >
                    <CalendarX className="w-3.5 h-3.5" />
                    <span>{b.status === 'pending' ? 'Batalkan Permohonan' : 'Batalkan Reservasi'}</span>
                  </button>
                )}
              </div>

              {b.proposal_path ? (
                <a
                  href={`http://localhost:8000/api/bookings/proposal/${b.booking_code}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-[#326273] hover:underline bg-[#eef6f8] px-2.5 py-1.5 rounded-xl border border-[#5c9ead]/30"
                >
                  <FileText className="w-3.5 h-3.5 text-[#5c9ead]" />
                  <span>Proposal PDF</span>
                  <Download className="w-3 h-3 ml-0.5" />
                </a>
              ) : (
                <span className="text-[10px] text-slate-400 italic">Tanpa Proposal</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Cancel Booking Validation Modal */}
      <ConfirmModal
        isOpen={!!bookingToCancel}
        title="Batalkan Peminjaman Fasilitas"
        description={`Apakah Anda yakin ingin membatalkan peminjaman ${bookingToCancel?.room?.name || 'ruangan'} pada tanggal ${bookingToCancel?.booking_date || ''} (${bookingToCancel?.start_time} - ${bookingToCancel?.end_time} WIB)? Slot waktu ini akan dibuka kembali dan 1 kuota peminjaman Anda akan dipulihkan.`}
        confirmText="Ya, Batalkan Peminjaman"
        cancelText="Kembali"
        variant="danger"
        icon={CalendarX}
        isLoading={cancelling}
        onClose={() => setBookingToCancel(null)}
        onConfirm={handleConfirmCancel}
      />

      {/* Printable Voucher Receipt Modal */}
      {selectedReceiptBooking && (
        <ReceiptModal
          booking={selectedReceiptBooking}
          onClose={() => setSelectedReceiptBooking(null)}
        />
      )}
    </div>
  );
}
