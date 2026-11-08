import React, { useState, useEffect } from 'react';
import { adminService, roomService } from '../services/api';
import {
  Shield, Users, Building, CalendarCheck, Clock, CheckCircle2,
  XCircle, Plus, Trash2, ToggleLeft, ToggleRight, Loader2,
  FileText, Download, AlertCircle, RefreshCw
} from 'lucide-react';

export default function AdminDashboard({ currentUser }) {
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'rooms'
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Add Room Modal State
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomCategory, setNewRoomCategory] = useState('Meeting Pod');
  const [newRoomCapacity, setNewRoomCapacity] = useState('4');
  const [newRoomPrice, setNewRoomPrice] = useState('50000');
  const [savingRoom, setSavingRoom] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, bookingsRes, roomsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getBookings(statusFilter ? { status: statusFilter } : {}),
        roomService.getRooms(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (bookingsRes.success) setBookings(bookingsRes.data);
      if (roomsRes.success) setRooms(roomsRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [statusFilter]);

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    if (!window.confirm(`Yakin ingin mengubah status booking menjadi ${newStatus}?`)) return;
    try {
      const res = await adminService.updateBookingStatus(bookingId, newStatus);
      if (res.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert('Gagal mengubah status booking.');
    }
  };

  const handleToggleRoomActive = async (room) => {
    try {
      const res = await adminService.updateRoom(room.id, { is_active: !room.is_active });
      if (res.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert('Gagal mengubah status ruangan.');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Hapus ruangan ini? Semua booking terkait akan ikut terhapus.')) return;
    try {
      const res = await adminService.deleteRoom(roomId);
      if (res.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert('Gagal menghapus ruangan.');
    }
  };

  const handleAddRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingRoom(true);
      const res = await adminService.createRoom({
        name: newRoomName,
        category: newRoomCategory,
        capacity: parseInt(newRoomCapacity),
        price_per_hour: parseFloat(newRoomPrice),
        is_active: true,
      });

      if (res.success) {
        setIsAddRoomOpen(false);
        setNewRoomName('');
        fetchAdminData();
      }
    } catch (err) {
      alert('Gagal menambahkan ruangan.');
    } finally {
      setSavingRoom(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#326273] mb-2" />
        <p className="text-sm font-medium">Memuat Dashboard Administrator...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#326273] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-[#5c9ead] border border-[#5c9ead]/40">
                Pusat Kendali Admin
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold mt-1">Dashboard Pengelola Kumpul-In</h1>
            <p className="text-xs text-slate-300">Pantau seluruh reservasi, kelola ketersediaan ruangan, dan kelola kuota pengguna.</p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Total Reservasi</div>
            <div className="text-xl font-black text-slate-900">{stats?.total_bookings || 0}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Terkonfirmasi</div>
            <div className="text-xl font-black text-emerald-600">{stats?.confirmed_bookings || 0}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Ruangan Aktif</div>
            <div className="text-xl font-black text-slate-900">
              {stats?.active_rooms || 0} <span className="text-xs font-normal text-slate-400">/ {stats?.total_rooms || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Pengguna Komunitas</div>
            <div className="text-xl font-black text-slate-900">{stats?.total_users || 0}</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-4 text-sm font-bold">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'border-[#326273] text-[#326273]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Daftar Seluruh Reservasi</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {bookings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('rooms')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'rooms'
              ? 'border-[#326273] text-[#326273]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Kelola Ruangan Hub</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {rooms.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Bookings Management */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs rounded-xl border-slate-200 bg-slate-50 py-1.5 px-3 focus:border-purple-500"
              >
                <option value="">Semua Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <span className="text-xs text-slate-400">Total {bookings.length} data</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Kode Booking</th>
                  <th className="py-3 px-4">Pemesan</th>
                  <th className="py-3 px-4">Ruangan</th>
                  <th className="py-3 px-4">Jadwal Reservasi</th>
                  <th className="py-3 px-4">Tipe & Proposal</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      {b.booking_code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{b.user?.name}</div>
                      <div className="text-[11px] text-slate-400">{b.user?.email} ({b.user?.role})</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{b.room?.name}</span>
                      <span className="block text-[11px] text-slate-400">{b.room?.category}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{b.booking_date}</div>
                      <div className="text-[11px] text-slate-500">{b.start_time} - {b.end_time}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize font-semibold text-slate-700 block">{b.duration_type}</span>
                      {b.proposal_path ? (
                        <a
                          href={`http://localhost:8000/api/bookings/proposal/${b.booking_code}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium mt-0.5"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Unduh PDF</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-400">Tidak ada file</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {b.status === 'confirmed' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {b.status === 'confirmed' ? (
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                          className="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors font-medium text-[11px]"
                          title="Batalkan reservasi dan pulihkan kuota pengguna"
                        >
                          Batalkan
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                          className="px-2.5 py-1 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition-colors font-medium text-[11px]"
                        >
                          Konfirmasi Ulang
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Rooms Management */}
      {activeTab === 'rooms' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Daftar Ruangan Komunitas</h3>
            <button
              onClick={() => setIsAddRoomOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#326273] text-white hover:bg-[#264c5a] shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Ruangan Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {room.category}
                    </span>
                    <button
                      onClick={() => handleToggleRoomActive(room)}
                      className="flex items-center gap-1 text-xs font-semibold"
                      title="Klik untuk toggle status aktif"
                    >
                      {room.is_active ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <ToggleRight className="w-5 h-5 text-emerald-600" /> Aktif
                        </span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1">
                          <ToggleLeft className="w-5 h-5 text-slate-400" /> Non-Aktif
                        </span>
                      )}
                    </button>
                  </div>

                  <h4 className="text-base font-bold text-slate-900">{room.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Kapasitas: <strong className="text-slate-800">{room.capacity} Orang</strong> • Tarif:{' '}
                    <strong className="text-slate-800">Rp {parseInt(room.price_per_hour).toLocaleString('id-ID')} /jam</strong>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Hapus Ruangan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {isAddRoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Tambah Ruangan Baru</h3>
              <button
                onClick={() => setIsAddRoomOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRoomSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Ruangan</label>
                <input
                  type="text"
                  required
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Contoh: Meeting Pod Beta"
                  className="w-full rounded-xl border-slate-200 py-2 px-3 bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                <select
                  value={newRoomCategory}
                  onChange={(e) => setNewRoomCategory(e.target.value)}
                  className="w-full rounded-xl border-slate-200 py-2 px-3 bg-slate-50"
                >
                  <option value="Open Desk">Open Desk</option>
                  <option value="Meeting Pod">Meeting Pod</option>
                  <option value="Event Space">Event Space</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kapasitas (Orang)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newRoomCapacity}
                    onChange={(e) => setNewRoomCapacity(e.target.value)}
                    className="w-full rounded-xl border-slate-200 py-2 px-3 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tarif Sewa (Rp/Jam)</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    required
                    value={newRoomPrice}
                    onChange={(e) => setNewRoomPrice(e.target.value)}
                    className="w-full rounded-xl border-slate-200 py-2 px-3 bg-slate-50"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddRoomOpen(false)}
                  className="flex-1 py-2 rounded-xl font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingRoom}
                  className="flex-1 py-2 rounded-xl font-bold bg-[#326273] text-white hover:bg-[#264c5a] shadow-sm"
                >
                  {savingRoom ? 'Menyimpan...' : 'Simpan Ruangan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

