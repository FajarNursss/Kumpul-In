import React, { useEffect, useState } from 'react';
import { bookingService } from '../services/api';
import ReceiptModal from './ReceiptModal';
import ConfirmModal from './ConfirmModal';
import { formatDateIndo, formatTimeClean } from '../utils/formatters';
import {
  CalendarCheck, Clock, Download, Building, Loader2, FileText,
  CheckCircle2, Printer, Copy, Check, Filter, Search, QrCode,
  CalendarX, XCircle, AlertCircle, Share2, CalendarDays, RefreshCw, X
} from 'lucide-react';

const STANDARD_HOURLY_SLOTS = [
  { start_time: '08:00:00', end_time: '09:00:00', label: '08:00 - 09:00 WIB' },
  { start_time: '09:00:00', end_time: '10:00:00', label: '09:00 - 10:00 WIB' },
  { start_time: '10:00:00', end_time: '11:00:00', label: '10:00 - 11:00 WIB' },
  { start_time: '11:00:00', end_time: '12:00:00', label: '11:00 - 12:00 WIB' },
  { start_time: '12:00:00', end_time: '13:00:00', label: '12:00 - 13:00 WIB' },
  { start_time: '13:00:00', end_time: '14:00:00', label: '13:00 - 14:00 WIB' },
  { start_time: '14:00:00', end_time: '15:00:00', label: '14:00 - 15:00 WIB' },
  { start_time: '15:00:00', end_time: '16:00:00', label: '15:00 - 16:00 WIB' },
  { start_time: '16:00:00', end_time: '17:00:00', label: '16:00 - 17:00 WIB' },
  { start_time: '17:00:00', end_time: '18:00:00', label: '17:00 - 18:00 WIB' },
];

export default function MyBookings({ currentUser, onShowToast, onQuotaRecovered }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState(null);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'confirmed' | 'cancelled'

  // Reschedule state
  const [rescheduleBooking, setRescheduleBooking] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState(null);
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');

  // Checkin state
  const [checkingInId, setCheckingInId] = useState(null);

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

  useEffect(() => {
    fetchBookings();
  }, [currentUser]);

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

  const handleCheckIn = async (booking) => {
    try {
      setCheckingInId(booking.id);
      const res = await bookingService.checkIn(booking.id);
      if (res.success) {
        if (onShowToast) {
          onShowToast(`Check-In berhasil! Kehadiran Anda di ruangan ${booking.room?.name || ''} resmi terverifikasi.`, 'success');
        }
        fetchBookings();
      }
    } catch (err) {
      if (onShowToast) {
        onShowToast(err.customMessage || 'Gagal melakukan check-in ruangan.', 'error');
      }
    } finally {
      setCheckingInId(null);
    }
  };

  const handleOpenReschedule = (booking) => {
    setRescheduleBooking(booking);
    setNewDate(booking.booking_date || new Date().toISOString().split('T')[0]);
    setNewSlot({
      start_time: booking.start_time,
      end_time: booking.end_time,
    });
    setRescheduleError('');
  };

  const handleSaveReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleBooking || !newDate || !newSlot) return;

    try {
      setRescheduling(true);
      setRescheduleError('');
      const payload = {
        new_booking_date: newDate,
        new_start_time: newSlot.start_time,
        new_end_time: newSlot.end_time,
      };

      const res = await bookingService.rescheduleBooking(rescheduleBooking.id, payload);
      if (res.success) {
        if (onShowToast) {
          onShowToast(`Jadwal peminjaman ${rescheduleBooking.booking_code} berhasil diubah ke ${formatDateIndo(newDate)}!`, 'success');
        }
        setRescheduleBooking(null);
        fetchBookings();
      }
    } catch (err) {
      const msg = err.customMessage || err.response?.data?.message || 'Gagal mengubah jadwal peminjaman.';
      setRescheduleError(msg);
    } finally {
      setRescheduling(false);
    }
  };

  const handleShareWhatsApp = (b) => {
    const roomName = b.room?.name || 'Ruangan Kampus';
    const dateFormatted = formatDateIndo(b.booking_date);
    const sessionTime = `${formatTimeClean(b.start_time)} - ${formatTimeClean(b.end_time)} WIB`;
    const msg = `*RESERVASI RUANG KAMPUS KUMPUL-IN*
🏛️ Ruangan: ${roomName}
📅 Tanggal: ${dateFormatted}
⏰ Jam: ${sessionTime}
🔢 Kode Booking: ${b.booking_code}
🔑 Token Check-In: ${b.checkin_token || '-'}
Status: ${b.status === 'confirmed' ? 'Disetujui' : b.status === 'pending' ? 'Menunggu Verifikasi' : b.status}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    if (onShowToast) {
      onShowToast(`Kode booking ${code} berhasil disalin ke clipboard!`, 'success');
    }
    setTimeout(() => setCopiedCode(null), 2500);
  };

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

  const todayStr = new Date().toISOString().split('T')[0];

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
            <div className="space-y-3">
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
                      className="p-1 rounded text-slate-400 hover:text-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-[#326273] cursor-pointer"
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

              {/* Recurring & Rescheduled Badges */}
              <div className="flex flex-wrap gap-1.5">
                {b.recurring_group_id && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    🔄 Peminjaman Rutin Mingguan
                  </span>
                )}
                {b.rescheduled_at && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    📅 Jadwal Pernah Diubah (Rescheduled)
                  </span>
                )}
              </div>

              {/* Time & Date Box */}
              <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
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

              {/* Rejection Reason Alert if Rejected */}
              {b.status === 'rejected' && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs space-y-1 animate-fade-in">
                  <div className="font-bold text-rose-800 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Catatan Penolakan Biro Sarana:</span>
                  </div>
                  <p className="text-rose-700 leading-relaxed font-medium pl-5">
                    {b.rejection_reason || 'Tidak ada alasan khusus yang dicantumkan. Silakan hubungi admin atau ajukan ulang.'}
                  </p>
                </div>
              )}

              {/* Check-In Kehadiran Action & Status (for Confirmed Bookings) */}
              {b.status === 'confirmed' && (
                <div className="pt-1">
                  {b.checked_in_at ? (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Kehadiran Terverifikasi ({formatTimeClean(b.checked_in_at)} WIB)</span>
                      </span>
                      <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                        Hadir
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs flex items-center justify-between gap-2">
                      <div className="text-amber-800 text-[11px] font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Wajib check-in 15–30 mnt sejak jam mulai</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCheckIn(b)}
                        disabled={checkingInId === b.id}
                        className="px-3 py-1.5 rounded-xl bg-[#326273] hover:bg-[#264c5a] text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                      >
                        {checkingInId === b.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <QrCode className="w-3.5 h-3.5" />
                        )}
                        <span>Check-In Hadir</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions: Voucher Modal, Reschedule, Cancel, WhatsApp, & PDF */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedReceiptBooking(b)}
                  aria-label={`Lihat voucher bukti reservasi ${b.booking_code}`}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-[#326273] hover:text-white transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#326273] cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Lihat Bukti</span>
                </button>

                {/* Reschedule Button */}
                {(b.status === 'pending' || b.status === 'confirmed') && (
                  <button
                    type="button"
                    onClick={() => handleOpenReschedule(b)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#326273] bg-[#eef6f8] hover:bg-[#d8edf1] border border-[#5c9ead]/40 transition-all flex items-center gap-1 cursor-pointer"
                    title="Ubah Tanggal atau Jam Peminjaman"
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>Ubah Jadwal</span>
                  </button>
                )}

                {/* WhatsApp Share */}
                <button
                  type="button"
                  onClick={() => handleShareWhatsApp(b)}
                  className="p-1.5 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                  title="Bagikan via WhatsApp"
                  aria-label="Bagikan via WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>

                {(b.status === 'pending' || b.status === 'confirmed') && (
                  <button
                    type="button"
                    onClick={() => setBookingToCancel(b)}
                    aria-label={`Batalkan peminjaman ${b.booking_code}`}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-all flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
                  >
                    <CalendarX className="w-3.5 h-3.5" />
                    <span>{b.status === 'pending' ? 'Batalkan' : 'Batal'}</span>
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
                  <span>Proposal</span>
                  <Download className="w-3 h-3 ml-0.5" />
                </a>
              ) : (
                <span className="text-[10px] text-slate-400 italic">Tanpa Proposal</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reschedule Modal */}
      {rescheduleBooking && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        >
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative animate-scale-in">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#5c9ead] uppercase tracking-wider">Ubah Jadwal Peminjaman</span>
                <h3 className="text-base font-bold text-slate-900">Reschedule {rescheduleBooking.booking_code}</h3>
              </div>
              <button
                type="button"
                onClick={() => setRescheduleBooking(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReschedule} className="p-5 space-y-4">
              {rescheduleError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{rescheduleError}</span>
                </div>
              )}

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
                <span className="text-slate-400 block text-[11px]">Ruangan:</span>
                <strong className="text-slate-800 text-sm">{rescheduleBooking.room?.name}</strong>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Tanggal Baru:</label>
                <input
                  type="date"
                  min={todayStr}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:border-[#326273] focus:ring-1 focus:ring-[#326273] outline-none"
                />
              </div>

              {rescheduleBooking.duration_type === 'hourly' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Pilih Slot Sesi Jam:</label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-1">
                    {STANDARD_HOURLY_SLOTS.map((slot, idx) => {
                      const isSelected = newSlot?.start_time === slot.start_time;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewSlot({ start_time: slot.start_time, end_time: slot.end_time })}
                          className={`p-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-center ${
                            isSelected
                              ? 'bg-[#326273] text-white border-[#326273]'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {slot.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  <span className="font-bold text-slate-800">Durasi: Seharian Penuh (08:00 - 18:00 WIB)</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleBooking(null)}
                  disabled={rescheduling}
                  className="py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={rescheduling || !newDate}
                  className="py-2.5 rounded-xl text-xs font-bold bg-[#326273] hover:bg-[#264c5a] text-white transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {rescheduling ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan Jadwal Baru</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
