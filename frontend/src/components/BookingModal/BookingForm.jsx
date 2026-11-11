import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ProposalUpload from './ProposalUpload';
import { X, Calendar, Clock, Building, AlertCircle, Loader2, CheckCircle2, ShieldCheck, Check } from 'lucide-react';
import { bookingService } from '../../services/api';

export default function BookingForm({
  room,
  date,
  slot,
  durationType,
  currentUser,
  onClose,
  onSuccess,
}) {
  const [proposalFile, setProposalFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Close on Escape key & prevent body scrolling
  useEffect(() => {
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
  }, [onClose]);

  if (!room) return null;

  const isAula = room.category === 'Aula';
  const isDaily = durationType === 'daily';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (currentUser?.booking_quota <= 0) {
      setErrorMessage('Sisa kuota peminjaman Anda telah habis. Harap hubungi Biro Sarana Kampus.');
      return;
    }

    if (isAula && !proposalFile) {
      setErrorMessage('Peminjaman Aula kampus mewajibkan unggah dokumen proposal atau surat izin kegiatan (PDF).');
      return;
    }

    const formData = new FormData();
    formData.append('room_id', room.id);
    formData.append('booking_date', date);
    formData.append('duration_type', durationType);

    if (isDaily) {
      formData.append('start_time', '08:00:00');
      formData.append('end_time', '18:00:00');
    } else {
      if (!slot) {
        setErrorMessage('Silakan pilih salah satu slot jam.');
        return;
      }
      formData.append('start_time', slot.start_time);
      formData.append('end_time', slot.end_time);
    }

    if (proposalFile) {
      formData.append('proposal_file', proposalFile);
    }

    try {
      setLoading(true);
      const res = await bookingService.createBooking(formData, true);
      if (res.success) {
        onSuccess(res.data);
      } else {
        setErrorMessage(res.message || 'Gagal memproses peminjaman ruangan.');
      }
    } catch (err) {
      const serverMsg = err.customMessage || err.response?.data?.message || 'Terjadi kesalahan pada server saat memproses peminjaman.';
      setErrorMessage(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-form-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] my-auto relative animate-scale-in">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#5c9ead] uppercase tracking-wider">Formulir Peminjaman Kampus</span>
            <h2 id="booking-form-title" className="text-lg font-bold text-slate-900">Konfirmasi Peminjaman Ruang</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup form peminjaman"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-[#326273] focus-visible:outline-none"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Error Alert */}
          {errorMessage && (
            <div role="alert" className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" aria-hidden="true" />
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          {/* User info banner */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Civitas Peminjam:</span>
              <strong className="text-slate-800 text-sm">{currentUser?.name}</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Sisa Kuota:</span>
              <span className="font-extrabold text-emerald-700 text-sm">
                {currentUser?.role === 'admin' ? 'Tanpa Batas (Biro Sarana)' : `${currentUser?.booking_quota} slot`}
              </span>
            </div>
          </div>

          {/* Room Details Card */}
          <div className="p-4 rounded-2xl bg-[#eef6f8] border border-[#5c9ead]/40 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Building className="w-4 h-4 text-[#326273]" aria-hidden="true" />
                {room.name}
              </h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white text-[#326273] border border-[#5c9ead]/40">
                {room.category}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1 border-t border-[#5c9ead]/20">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#5c9ead]" aria-hidden="true" />
                <span>{date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#5c9ead]" aria-hidden="true" />
                <span>{isDaily ? '08:00 - 18:00 (Seharian)' : slot?.time}</span>
              </div>
            </div>
          </div>

          {/* Proposal Upload (Mandatory for Aula Kampus - exempted for Biro Sarana) */}
          {isAula && currentUser?.role !== 'admin' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Proposal / Izin Kegiatan Ormawa</span>
                <span className="text-[10px] text-rose-500 font-semibold">*Wajib format PDF</span>
              </div>
              <ProposalUpload
                file={proposalFile}
                onSelectFile={setProposalFile}
                error={!proposalFile && errorMessage ? 'File proposal / surat izin diperlukan' : ''}
              />
            </div>
          )}

          {/* Verification Notice */}
          {currentUser?.role !== 'admin' ? (
            <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex items-start space-x-2.5">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-xs text-amber-900 space-y-0.5">
                <span className="font-bold block">Verifikasi Persetujuan Biro Sarana</span>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Permohonan peminjaman ruangan ini akan diproses dengan status <strong>Menunggu Persetujuan</strong> hingga diverifikasi dan disetujui oleh admin Biro Sarana Kampus.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 flex items-start space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-xs text-emerald-900 space-y-0.5">
                <span className="font-bold block">Reservasi Resmi Biro Sarana</span>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Peminjaman oleh akun Biro Sarana otomatis langsung terkonfirmasi tanpa memerlukan verifikasi lanjutan.
                </p>
              </div>
            </div>
          )}

          {/* Campus Facility Policy Card (Non-Commercial / Free) */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs space-y-1">
              <div className="font-bold text-emerald-900">
                Fasilitas Kampus Bebas Biaya (Gratis)
              </div>
              <p className="text-emerald-700 leading-relaxed text-[11px]">
                Fasilitas ini disediakan untuk menunjang kegiatan akademik, riset, diskusi kelompok, dan kegiatan organisasi mahasiswa.
              </p>
            </div>
          </div>

          {/* Action Buttons - Perfectly Consistent Sizing */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-11 px-4 rounded-xl font-bold text-xs sm:text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors focus-visible:ring-2 focus-visible:ring-[#326273] cursor-pointer flex items-center justify-center"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || (currentUser?.role !== 'admin' && currentUser?.booking_quota <= 0)}
              className="h-11 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#326273] text-white hover:bg-[#264c5a] shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#326273] cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
                  <span>Mengajukan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{currentUser?.role === 'admin' ? 'Konfirmasi Booking' : 'Kirim Permohonan'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
