import React, { useEffect, useState } from 'react';
import { bookingService } from '../services/api';
import { CalendarCheck, Clock, Download, Building, Loader2, FileText, CheckCircle2 } from 'lucide-react';

export default function MyBookings({ currentUser }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm">Memuat daftar reservasi...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-8">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-4">
          <CalendarCheck className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Belum Ada Reservasi</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Anda belum memiliki reservasi aktif. Silakan pilih ruangan dari katalog untuk melakukan pemesanan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Riwayat Reservasi Saya</h2>
          <p className="text-xs text-slate-500">Daftar booking aktif akun {currentUser?.name}</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
          {bookings.length} Reservasi
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold text-[#326273] bg-[#eef6f8] px-2 py-0.5 rounded border border-[#5c9ead]/40">
                  {b.booking_code}
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-slate-400" />
                  {b.room?.name || 'Ruangan'}
                </h4>
              </div>

              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {b.status}
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl">
              <div className="flex justify-between">
                <span className="text-slate-400">Tanggal:</span>
                <span className="font-semibold">{b.booking_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Waktu:</span>
                <span className="font-semibold">{b.start_time} - {b.end_time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tipe Durasi:</span>
                <span className="font-semibold capitalize">{b.duration_type}</span>
              </div>
            </div>

            {b.proposal_path && (
              <a
                href={`http://localhost:8000/api/bookings/proposal/${b.booking_code}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Unduh Proposal PDF</span>
                <Download className="w-3 h-3 ml-0.5" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

