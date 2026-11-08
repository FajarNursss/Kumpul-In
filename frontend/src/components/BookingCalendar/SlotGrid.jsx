import React from 'react';
import SlotItem from './SlotItem';
import { Loader2, AlertCircle, Sparkles, CalendarX, ShieldCheck } from 'lucide-react';

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
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
        <p className="text-sm font-medium text-slate-500">
          Silakan pilih ruangan di katalog sebelah kiri/atas terlebih dahulu untuk melihat ketersediaan jadwal slot waktu.
        </p>
      </div>
    );
  }

  const isDailyBooked = availability?.has_daily_booking;
  const isMember = currentUser?.role === 'member';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Jadwal Slot Ruangan</span>
          <h2 className="text-xl font-bold text-slate-900">{room.name}</h2>
          <p className="text-xs text-slate-500">
            Kategori: <strong className="text-slate-700">{room.category}</strong> • Kapasitas: <strong className="text-slate-700">{room.capacity} Orang</strong>
          </p>
        </div>

        {/* Duration Type Toggle (Hourly vs Daily) */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => onChangeDurationType('hourly')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              durationType === 'hourly'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sewa Per Jam
          </button>
          <button
            type="button"
            onClick={() => onChangeDurationType('daily')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 ${
              durationType === 'daily'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sewa Harian (Daily)</span>
          </button>
        </div>
      </div>

      {/* Daily Mode Notification / Restriction */}
      {durationType === 'daily' && (
        <div className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-3 ${
          isMember
            ? 'bg-blue-50/70 border-blue-200 text-blue-900'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Mode Reservasi Harian (08:00 - 18:00 WIB)</span>
            {isMember ? (
              <p>
                Sebagai akun <strong>Member</strong>, Anda dapat memesan ruangan seharian penuh sekaligus. Seluruh slot pada tanggal yang dipilih akan dikunci otomatis.
              </p>
            ) : (
              <p>
                <strong>Perhatian:</strong> Akun Guest tidak diizinkan menyewa harian. Silakan beralih ke akun <strong>Member</strong> di Navbar atas untuk menggunakan fitur ini.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Daily Lock Warning if Date is Already Booked as Daily */}
      {isDailyBooked && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-start gap-2.5">
          <CalendarX className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div>
            <strong className="block text-rose-900">Ruangan Telah Dipesan Penuh (Daily Booking)</strong>
            Ruangan ini sudah dipesan seharian penuh oleh pengguna lain pada tanggal ini. Seluruh slot terkunci. Silakan pilih tanggal lain.
          </div>
        </div>
      )}

      {/* Grid of Slots */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-7 h-7 animate-spin text-blue-600 mb-2" />
          <p className="text-xs">Memeriksa ketersediaan slot...</p>
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
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Tersedia
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Terisi / Terkunci
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Terpilih
              </span>
            </div>

            <span className="text-[11px] text-slate-400">
              *Jam operasional: 08:00 - 18:00 WIB
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
