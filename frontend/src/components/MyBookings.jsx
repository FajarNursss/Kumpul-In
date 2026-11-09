import React, { useEffect, useState } from 'react';
import { bookingService } from '../services/api';
import ReceiptModal from './ReceiptModal';
import {
  CalendarCheck, Clock, Download, Building, Loader2, FileText,
  CheckCircle2, Printer, Copy, Check, Filter, Search, QrCode
} from 'lucide-react';

export default function MyBookings({ currentUser, onShowToast }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'today' | 'proposal'

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
    if (filterStatus === 'today') return b.booking_date === todayStr;
    if (filterStatus === 'proposal') return !!b.proposal_path;
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
        <div role="tablist" aria-label="Filter status reservasi" className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold self-start sm:self-auto">
          <button
            type="button"
            role="tab"
            aria-selected={filterStatus === 'all'}
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-[#326273] ${
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
            aria-selected={filterStatus === 'today'}
            onClick={() => setFilterStatus('today')}
            className={`px-3 py-1.5 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-[#326273] ${
              filterStatus === 'today'
                ? 'bg-[#326273] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hari Ini
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filterStatus === 'proposal'}
            onClick={() => setFilterStatus('proposal')}
            className={`px-3 py-1.5 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-[#326273] ${
              filterStatus === 'proposal'
                ? 'bg-[#326273] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Proposal PDF
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
                    <Building className="w-4 h-4 text-slate-400" />
                    {b.room?.name || 'Ruangan Hub'}
                  </h4>
                  <span className="text-xs text-slate-500 block">
                    Kategori: {b.room?.category || 'Fasilitas Kampus'} • Kapasitas: {b.room?.capacity || '-'} Orang
                  </span>
                </div>

                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {b.status}
                </span>
              </div>

              {/* Time & Date Box */}
              <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3.5 rounded-2xl mt-3 border border-slate-200/80">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tanggal Booking:</span>
                  <span className="font-bold text-slate-800">{b.booking_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Jadwal Sesi:</span>
                  <span className="font-bold text-slate-800">{b.start_time} - {b.end_time} WIB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tipe Durasi:</span>
                  <span className="font-bold text-slate-800 capitalize">
                    {b.duration_type === 'daily' ? 'Harian Penuh (Daily)' : 'Per Jam (Hourly)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Voucher Modal & PDF Download */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedReceiptBooking(b)}
                aria-label={`Lihat voucher bukti reservasi ${b.booking_code}`}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-[#326273] hover:text-white transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#326273]"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Lihat Voucher</span>
              </button>

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
