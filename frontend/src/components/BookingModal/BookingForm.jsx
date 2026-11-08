import React, { useState } from 'react';
import ProposalUpload from './ProposalUpload';
import { X, Calendar, Clock, Building, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
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

  if (!room) return null;

  const isEventSpace = room.category === 'Event Space';
  const isDaily = durationType === 'daily';
  const isGuest = currentUser?.role === 'guest';

  // Cost calculation
  const hoursCount = isDaily ? 10 : 1;
  const estimatedCost = room.price_per_hour * hoursCount;
  const formattedCost = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(estimatedCost);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (currentUser?.booking_quota <= 0) {
      setErrorMessage('Sisa kuota reservasi Anda telah habis.');
      return;
    }

    if (isDaily && isGuest) {
      setErrorMessage('Pengguna dengan peran Guest tidak diizinkan menyewa harian (Daily).');
      return;
    }

    if (isEventSpace && !proposalFile) {
      setErrorMessage('Dokumen proposal (PDF) wajib diunggah untuk pemesanan Event Space.');
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
        setErrorMessage(res.message || 'Gagal membuat reservasi.');
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message || 'Terjadi kesalahan pada server saat membuat booking.';
      setErrorMessage(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Konfirmasi Reservasi</span>
            <h3 className="text-lg font-bold text-slate-900">Detail Pemesanan Ruangan</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* User info banner */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block">Pemesan:</span>
              <strong className="text-slate-800">{currentUser?.name}</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block">Sisa Kuota:</span>
              <span className="font-bold text-emerald-700">{currentUser?.booking_quota} slot</span>
            </div>
          </div>

          {/* Room Details Card */}
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                {room.name}
              </h4>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {room.category}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1 border-t border-blue-100/60">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>{date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>{isDaily ? '08:00 - 18:00 (Harian)' : slot?.time}</span>
              </div>
            </div>
          </div>

          {/* Proposal Upload (Mandatory for Event Space) */}
          {isEventSpace && (
            <ProposalUpload
              file={proposalFile}
              onSelectFile={setProposalFile}
              error={!proposalFile && errorMessage ? 'File proposal diperlukan' : ''}
            />
          )}

          {/* Price Summary */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500">Estimasi Biaya ({isDaily ? '10 Jam' : '1 Jam'})</span>
              <div className="text-lg font-black text-slate-900">{formattedCost}</div>
            </div>
            <span className="text-[11px] font-medium text-slate-400 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              {isDaily ? 'Paket Full Day' : 'Tarif Normal'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || currentUser?.booking_quota <= 0 || (isDaily && isGuest)}
              className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Konfirmasi Reservasi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

