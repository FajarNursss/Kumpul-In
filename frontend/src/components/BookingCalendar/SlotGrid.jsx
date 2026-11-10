import React from 'react';
import SlotItem from './SlotItem';
import { Loader2, AlertCircle, CalendarX, Clock, CheckCircle2, Info } from 'lucide-react';

export default function SlotGrid({
  room,
  availability,
  loading,
  selectedSlot,
  onSelectSlot,
  durationType,
  onChangeDurationType,
  currentUser,
}) {
  if (!room) {
    return (
      <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
        <p className="text-sm font-medium text-slate-500">
          Silakan pilih ruangan di katalog untuk melihat ketersediaan jadwal slot waktu.
        </p>
      </div>
    );
  }

  const isDailyBooked = availability?.has_daily_booking;

  const totalSlots = availability?.slots?.length || 10;
  const bookedCount = availability?.slots?.filter((s) => s.is_booked)?.length || 0;
  const availableCount = totalSlots - bookedCount;
  const percentOccupied = Math.round((bookedCount / totalSlots) * 100);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
      {/* Header Info & Duration Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <span className="text-xs font-bold text-[#5c9ead] uppercase tracking-wider block">
            Jadwal Slot Ruangan
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">{room.name}</h2>
          <p className="text-xs text-slate-500">
            Kategori: <strong className="text-slate-700">{room.category}</strong> • Kapasitas: <strong className="text-slate-700">{room.capacity} Orang</strong>
          </p>
        </div>

        {/* Duration Type Toggle (Hourly vs Daily) */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => onChangeDurationType('hourly')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              durationType === 'hourly'
                ? 'bg-[#326273] text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pinjam Per Jam
          </button>
          <button
            type="button"
            onClick={() => onChangeDurationType('daily')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              durationType === 'daily'
                ? 'bg-[#e39774] text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Pinjam Seharian Penuh</span>
          </button>
        </div>
      </div>

      {/* Admin Notice */}
      {currentUser?.role === 'admin' && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Mode Pratinjau Administrator:</strong> Anda sedang meninjau transparansi slot publik. Akun Biro Sarana tidak dapat melakukan reservasi peminjaman ruangan.
          </span>
        </div>
      )}

      {/* Visual Occupancy Progress Bar */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-600 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#5c9ead]" />
            Tingkat Keterisian Jadwal:
          </span>
          <span className="text-slate-800">
            <strong className="text-emerald-700">{availableCount}</strong> dari {totalSlots} Slot Tersedia ({100 - percentOccupied}% Kosong)
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-[#326273] transition-all duration-500"
            style={{ width: `${percentOccupied}%` }}
            title={`${bookedCount} Slot Terisi (${percentOccupied}%)`}
          />
          <div
            className="h-full bg-emerald-400 transition-all duration-500"
            style={{ width: `${100 - percentOccupied}%` }}
            title={`${availableCount} Slot Kosong (${100 - percentOccupied}%)`}
          />
        </div>
      </div>

      {/* Daily Mode Notification */}
      {durationType === 'daily' && (
        <div className="p-4 rounded-2xl border text-xs leading-relaxed flex items-start gap-3 bg-[#eef6f8] border-[#5c9ead]/40 text-[#326273]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#326273]" />
          <div>
            <span className="font-bold block mb-0.5">Mode Peminjaman Seharian Penuh (08:00 - 18:00 WIB)</span>
            <p>
              Peminjaman harian otomatis mengunci seluruh 10 slot waktu untuk kegiatan seminar, workshop, atau acara ormawa. Khusus untuk kategori <strong>Aula</strong>, wajib melampirkan file proposal atau surat permohonan izin kegiatan (format PDF).
            </p>
          </div>
        </div>
      )}

      {/* Daily Lock Warning */}
      {isDailyBooked && (
        <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-start gap-2.5">
          <CalendarX className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div>
            <strong className="block text-rose-900">Ruangan Dipesan Penuh (Daily Booking)</strong>
            Ruangan ini sudah dipesan seharian penuh oleh pengguna lain pada tanggal ini. Seluruh slot otomatis terkunci demi mencegah bentrok. Silakan pilih tanggal lain.
          </div>
        </div>
      )}

      {/* Grid of Slots */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 animate-pulse h-20 flex flex-col justify-between"
            >
              <div className="h-3 w-16 bg-slate-200 rounded" />
              <div className="h-3 w-12 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {availability?.slots?.map((slot, idx) => (
              <SlotItem
                key={idx}
                slot={slot}
                isSelected={selectedSlot?.time === slot.time && durationType === 'hourly'}
                onSelect={() => onSelectSlot(slot)}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5c9ead]" /> Tersedia
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Terisi / Terkunci
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#326273]" /> Terpilih
              </span>
            </div>

            <span className="text-[11px] text-slate-400">
              *Jam operasional: 08:00 - 18:00 WIB (10 Sesi)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
