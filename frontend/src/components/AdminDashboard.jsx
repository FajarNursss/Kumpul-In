import React, { useState, useEffect, useMemo } from 'react';
import { adminService, roomService } from '../services/api';
import ConfirmModal from './ConfirmModal';
import { formatDateIndo, formatTimeClean } from '../utils/formatters';
import {
  Shield, Users, Building2, CalendarCheck, Clock, CheckCircle2,
  XCircle, Plus, Trash2, ToggleLeft, ToggleRight, Loader2,
  FileText, Download, AlertCircle, RefreshCw, AlertTriangle,
  Edit3, Search, Filter, History, UserPlus, Key, Mail, X
} from 'lucide-react';

export default function AdminDashboard({ currentUser, activeTab = 'admin', setActiveTab, onShowToast }) {
  // Stats, Bookings, Rooms, Users state
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Riwayat Peminjaman Filter
  const [statusFilter, setStatusFilter] = useState('');

  // Kelola Fasilitas Filter & Search
  const [roomSearchQuery, setRoomSearchQuery] = useState('');
  const [roomCategoryFilter, setRoomCategoryFilter] = useState('all');
  const [roomStatusFilter, setRoomStatusFilter] = useState('all');

  // Kelola Pengguna Filter & Search
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userQuotaFilter, setUserQuotaFilter] = useState('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Confirmation Modal State
  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    title: '',
    description: '',
    confirmText: '',
    variant: 'primary',
    isLoading: false,
    onConfirm: null,
  });

  // Add Room Modal State
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomCategory, setNewRoomCategory] = useState('Ruang Belajar');
  const [newRoomCapacity, setNewRoomCapacity] = useState('10');
  const [savingRoom, setSavingRoom] = useState(false);

  // Edit Room Modal State
  const [editingRoom, setEditingRoom] = useState(null);
  const [editRoomName, setEditRoomName] = useState('');
  const [editRoomCategory, setEditRoomCategory] = useState('Ruang Belajar');
  const [editRoomCapacity, setEditRoomCapacity] = useState('10');
  const [savingEditRoom, setSavingEditRoom] = useState(false);

  // Add User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('mahasiswa');
  const [newUserQuota, setNewUserQuota] = useState('5');
  const [savingUser, setSavingUser] = useState(false);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserPassword, setEditUserPassword] = useState('');
  const [editUserRole, setEditUserRole] = useState('mahasiswa');
  const [editUserQuota, setEditUserQuota] = useState('5');
  const [savingEditUser, setSavingEditUser] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const userParams = {};
      if (userRoleFilter && userRoleFilter !== 'all') userParams.role = userRoleFilter;
      if (userSearchQuery.trim()) userParams.q = userSearchQuery.trim();

      const [statsRes, bookingsRes, roomsRes, usersRes] = await Promise.all([
        adminService.getStats(),
        adminService.getBookings(statusFilter ? { status: statusFilter } : {}),
        roomService.getRooms(),
        adminService.getUsers(userParams),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (bookingsRes.success) setBookings(bookingsRes.data);
      if (roomsRes.success) setRooms(roomsRes.data);
      if (usersRes.success) setUsersList(usersRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      if (onShowToast) onShowToast(err.customMessage || 'Gagal memuat data administrator.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [statusFilter, userRoleFilter]);

  // Handle Search Users with debounce for server sync
  useEffect(() => {
    const timer = setTimeout(() => {
      adminService.getUsers({
        role: userRoleFilter !== 'all' ? userRoleFilter : undefined,
        q: userSearchQuery.trim() || undefined,
      }).then((res) => {
        if (res.success) setUsersList(res.data);
      }).catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearchQuery]);

  // Interactive Spin Refresh Handler
  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await fetchAdminData();
      if (onShowToast) onShowToast('Data dashboard berhasil disegarkan.', 'success');
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 750);
    }
  };

  // Filtered Rooms for Kelola Fasilitas
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (roomSearchQuery.trim()) {
        const q = roomSearchQuery.toLowerCase().trim();
        const matchName = room.name.toLowerCase().includes(q);
        const matchCat = room.category.toLowerCase().includes(q);
        if (!matchName && !matchCat) return false;
      }
      if (roomCategoryFilter !== 'all' && room.category !== roomCategoryFilter) {
        return false;
      }
      if (roomStatusFilter === 'active' && !room.is_active) {
        return false;
      }
      if (roomStatusFilter === 'inactive' && room.is_active) {
        return false;
      }
      return true;
    });
  }, [rooms, roomSearchQuery, roomCategoryFilter, roomStatusFilter]);

  // Filtered Users for Kelola Pengguna
  const filteredUsersList = useMemo(() => {
    return usersList.filter((user) => {
      if (userSearchQuery.trim()) {
        const q = userSearchQuery.toLowerCase().trim();
        const matchName = user.name?.toLowerCase().includes(q);
        const matchEmail = user.email?.toLowerCase().includes(q);
        if (!matchName && !matchEmail) return false;
      }
      if (userRoleFilter !== 'all' && user.role !== userRoleFilter) {
        return false;
      }
      if (userQuotaFilter === 'has_quota' && user.booking_quota <= 0 && user.role !== 'admin') {
        return false;
      }
      if (userQuotaFilter === 'zero_quota' && (user.booking_quota > 0 || user.role === 'admin')) {
        return false;
      }
      return true;
    });
  }, [usersList, userSearchQuery, userRoleFilter, userQuotaFilter]);

  // Status Change Confirmation (Setujui, Tolak, Batalkan)
  const handleUpdateBookingStatus = (booking, newStatus) => {
    let title = '';
    let description = '';
    let confirmText = '';
    let variant = 'primary';

    if (newStatus === 'confirmed') {
      title = booking.status === 'pending' ? 'Setujui Permohonan Peminjaman' : 'Konfirmasi Ulang Reservasi';
      description = `Apakah Anda yakin ingin menyetujui peminjaman ${booking.booking_code} (${booking.room?.name}) untuk ${booking.user?.name}? Jadwal ruangan akan resmi terkonfirmasi untuk mahasiswa.`;
      confirmText = 'Ya, Setujui Permohonan';
      variant = 'primary';
    } else if (newStatus === 'rejected') {
      title = 'Tolak Permohonan Peminjaman';
      description = `Apakah Anda yakin ingin menolak permohonan ${booking.booking_code} (${booking.room?.name}) oleh ${booking.user?.name}? Kuota peminjaman mahasiswa akan otomatis dipulihkan (+1).`;
      confirmText = 'Ya, Tolak Permohonan';
      variant = 'danger';
    } else if (newStatus === 'cancelled') {
      title = 'Batalkan Reservasi Peminjaman';
      description = `Apakah Anda yakin ingin membatalkan reservasi ${booking.booking_code}? Kuota peminjaman mahasiswa akan otomatis dipulihkan (+1).`;
      confirmText = 'Ya, Batalkan Reservasi';
      variant = 'danger';
    }

    setConfirmModalState({
      isOpen: true,
      title,
      description,
      confirmText,
      variant,
      isLoading: false,
      onConfirm: async () => {
        try {
          setConfirmModalState((prev) => ({ ...prev, isLoading: true }));
          const res = await adminService.updateBookingStatus(booking.id, newStatus);
          if (res.success) {
            const statusLabel = newStatus === 'confirmed' ? 'disetujui' : newStatus === 'rejected' ? 'ditolak' : 'dibatalkan';
            if (onShowToast) {
              onShowToast(
                `Permohonan reservasi ${booking.booking_code} berhasil ${statusLabel}.`,
                'success'
              );
            }
            setConfirmModalState({ isOpen: false });
            fetchAdminData();
          }
        } catch (err) {
          if (onShowToast) onShowToast(err.customMessage || 'Gagal mengubah status reservasi.', 'error');
          setConfirmModalState((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  // Toggle Room Active Status
  const handleToggleRoomActive = async (room) => {
    try {
      const res = await adminService.updateRoom(room.id, { is_active: !room.is_active });
      if (res.success) {
        if (onShowToast) {
          onShowToast(`Status ruangan "${room.name}" diubah menjadi ${!room.is_active ? 'Aktif' : 'Non-Aktif'}.`, 'info');
        }
        fetchAdminData();
      }
    } catch (err) {
      if (onShowToast) onShowToast(err.customMessage || 'Gagal mengubah status ruangan.', 'error');
    }
  };

  // Delete Room
  const handleDeleteRoom = (room) => {
    setConfirmModalState({
      isOpen: true,
      title: 'Hapus Fasilitas Ruangan Kampus',
      description: `Apakah Anda yakin ingin menghapus fasilitas "${room.name}"? Peringatan: Seluruh data riwayat peminjaman yang tertaut pada ruangan ini akan ikut terhapus dari sistem secara permanen.`,
      confirmText: 'Ya, Hapus Fasilitas',
      variant: 'danger',
      isLoading: false,
      onConfirm: async () => {
        try {
          setConfirmModalState((prev) => ({ ...prev, isLoading: true }));
          const res = await adminService.deleteRoom(room.id);
          if (res.success) {
            if (onShowToast) onShowToast(`Fasilitas "${room.name}" berhasil dihapus dari sistem.`, 'success');
            setConfirmModalState({ isOpen: false });
            fetchAdminData();
          }
        } catch (err) {
          if (onShowToast) onShowToast(err.customMessage || 'Gagal menghapus fasilitas ruangan.', 'error');
          setConfirmModalState((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  // Add Room Submit
  const handleAddRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingRoom(true);
      const res = await adminService.createRoom({
        name: newRoomName.trim(),
        category: newRoomCategory,
        capacity: parseInt(newRoomCapacity, 10),
        price_per_hour: 0,
        is_active: true,
      });

      if (res.success) {
        setIsAddRoomOpen(false);
        setNewRoomName('');
        setNewRoomCapacity('10');
        if (onShowToast) onShowToast(`Ruangan "${res.data.name}" berhasil ditambahkan.`, 'success');
        fetchAdminData();
      }
    } catch (err) {
      if (onShowToast) onShowToast(err.customMessage || 'Gagal menambahkan ruangan.', 'error');
    } finally {
      setSavingRoom(false);
    }
  };

  // Open Edit Room Modal
  const handleOpenEditRoom = (room) => {
    setEditingRoom(room);
    setEditRoomName(room.name);
    setEditRoomCategory(room.category);
    setEditRoomCapacity(room.capacity.toString());
  };

  // Edit Room Submit
  const handleEditRoomSubmit = async (e) => {
    e.preventDefault();
    if (!editingRoom) return;
    try {
      setSavingEditRoom(true);
      const res = await adminService.updateRoom(editingRoom.id, {
        name: editRoomName.trim(),
        category: editRoomCategory,
        capacity: parseInt(editRoomCapacity, 10),
      });

      if (res.success) {
        setEditingRoom(null);
        if (onShowToast) onShowToast(`Data fasilitas "${res.data.name}" berhasil diperbarui.`, 'success');
        fetchAdminData();
      }
    } catch (err) {
      if (onShowToast) onShowToast(err.customMessage || 'Gagal memperbarui data ruangan.', 'error');
    } finally {
      setSavingEditRoom(false);
    }
  };

  // Add User Submit
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingUser(true);
      const res = await adminService.createUser({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword,
        role: newUserRole,
        booking_quota: parseInt(newUserQuota, 10) || (newUserRole === 'admin' ? 999 : 5),
      });

      if (res.success) {
        setIsAddUserOpen(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserRole('mahasiswa');
        setNewUserQuota('5');
        if (onShowToast) onShowToast(`Pengguna "${res.data.name}" berhasil didaftarkan.`, 'success');
        fetchAdminData();
      }
    } catch (err) {
      if (onShowToast) onShowToast(err.customMessage || 'Gagal menambahkan pengguna.', 'error');
    } finally {
      setSavingUser(false);
    }
  };

  // Open Edit User Modal
  const handleOpenEditUser = (user) => {
    setEditingUser(user);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserPassword('');
    setEditUserRole(user.role);
    setEditUserQuota(user.booking_quota.toString());
  };

  // Edit User Submit
  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setSavingEditUser(true);
      const payload = {
        name: editUserName.trim(),
        email: editUserEmail.trim(),
        role: editUserRole,
        booking_quota: parseInt(editUserQuota, 10),
      };
      if (editUserPassword.trim()) {
        payload.password = editUserPassword.trim();
      }

      const res = await adminService.updateUser(editingUser.id, payload);
      if (res.success) {
        setEditingUser(null);
        if (onShowToast) onShowToast(`Data pengguna "${res.data.name}" berhasil diperbarui.`, 'success');
        fetchAdminData();
      }
    } catch (err) {
      if (onShowToast) onShowToast(err.customMessage || 'Gagal memperbarui data pengguna.', 'error');
    } finally {
      setSavingEditUser(false);
    }
  };

  // Delete User
  const handleDeleteUser = (user) => {
    if (user.id === currentUser?.id) {
      if (onShowToast) onShowToast('Anda tidak dapat menghapus akun Anda sendiri.', 'error');
      return;
    }

    setConfirmModalState({
      isOpen: true,
      title: 'Hapus Akun Pengguna',
      description: `Apakah Anda yakin ingin menghapus akun ${user.name} (${user.email})? Seluruh riwayat reservasi yang bersangkutan akan terhapus dari sistem. Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Ya, Hapus Pengguna',
      variant: 'danger',
      isLoading: false,
      onConfirm: async () => {
        try {
          setConfirmModalState((prev) => ({ ...prev, isLoading: true }));
          const res = await adminService.deleteUser(user.id);
          if (res.success) {
            if (onShowToast) onShowToast(`Pengguna "${user.name}" berhasil dihapus dari sistem.`, 'success');
            setConfirmModalState({ isOpen: false });
            fetchAdminData();
          }
        } catch (err) {
          if (onShowToast) onShowToast(err.customMessage || 'Gagal menghapus pengguna.', 'error');
          setConfirmModalState((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  if (loading && !stats) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#326273] mb-2" />
        <p className="text-sm font-medium">Memuat Dashboard Biro Sarana...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner with Personalized Greeting on Dashboard */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#326273] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-slate-700">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0 border border-white/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-[#5c9ead] border border-[#5c9ead]/40">
                Pusat Kendali Biro Sarana
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e39774]/20 text-amber-200 border border-[#e39774]/30">
                Administrator
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-1 tracking-tight">
              Halo, {currentUser?.name || 'Biro Sarana Kampus'}!
            </h1>
            <p className="text-xs text-slate-200 mt-0.5 max-w-2xl">
              Selamat datang di Dashboard Biro Sarana & Fasilitas Kampus. Pantau permohonan peminjaman, kelola ruangan & fasilitas, serta atur akun civitas kampus.
            </p>
          </div>
        </div>

        {/* Segarkan Data Button with Animated Spin */}
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="self-start sm:self-auto px-4 py-2.5 rounded-2xl text-xs font-bold bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-all flex items-center gap-2 border border-white/20 shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-white shrink-0"
          title="Segarkan data terbaru dari server"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Menyegarkan...' : 'Segarkan Data'}</span>
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
          <div className="p-2.5 rounded-2xl bg-[#5c9ead]/15 text-[#326273] shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Reservasi</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{stats?.total_bookings || 0}</div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-amber-200/80 shadow-xs flex items-center space-x-3.5">
          <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Menunggu Verifikasi</div>
            <div className="text-xl sm:text-2xl font-black text-amber-700 mt-0.5">{stats?.pending_bookings || 0}</div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
          <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Disetujui</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">{stats?.confirmed_bookings || 0}</div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
          <div className="p-2.5 rounded-2xl bg-[#5c9ead]/15 text-[#326273] shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Ruangan Aktif</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {stats?.active_rooms || 0} <span className="text-xs font-normal text-slate-400">/ {stats?.total_rooms || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3.5 col-span-2 md:col-span-1">
          <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Civitas Terdaftar</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{stats?.total_users || 0}</div>
          </div>
        </div>
      </div>

      {/* Internal Sub-Tabs Navigation (Order: Dashboard -> Kelola Fasilitas -> Kelola Pengguna -> Riwayat di paling bawah) */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-6 text-xs sm:text-sm font-bold overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('admin')}
          className={`pb-3.5 transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'admin'
              ? 'border-[#326273] text-[#326273]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Ringkasan Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('admin-rooms')}
          className={`pb-3.5 transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'admin-rooms'
              ? 'border-[#326273] text-[#326273]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Kelola Fasilitas</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {rooms.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('admin-users')}
          className={`pb-3.5 transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'admin-users'
              ? 'border-[#326273] text-[#326273]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Kelola Pengguna</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {usersList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('admin-bookings')}
          className={`pb-3.5 transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'admin-bookings'
              ? 'border-[#326273] text-[#326273]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Riwayat Peminjaman</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {bookings.length}
          </span>
        </button>
      </div>

      {/* SECTION 1: RINGKASAN DASHBOARD (OVERVIEW) */}
      {activeTab === 'admin' && (
        <div className="space-y-6">
          {/* Attention Callout for Pending Approvals */}
          {stats?.pending_bookings > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                    Ada {stats.pending_bookings} Permohonan Peminjaman Menunggu Verifikasi
                  </h4>
                  <p className="text-[11px] sm:text-xs text-amber-700">
                    Tinjau proposal dan setujui atau tolak reservasi ruangan agar civitas kampus mendapatkan kepastian jadwal.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('pending');
                  setActiveTab('admin-bookings');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
              >
                Tinjau Sekarang →
              </button>
            </div>
          )}

          {/* Quick Monitoring Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Bookings Box */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Aktivitas Peminjaman Terkini</h3>
                  <p className="text-xs text-slate-500">Daftar peminjaman terbaru yang diajukan oleh civitas kampus</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('admin-bookings')}
                  className="text-xs font-bold text-[#326273] hover:text-[#264c5a] flex items-center gap-1 cursor-pointer"
                >
                  <span>Lihat Seluruh Riwayat</span>
                  <span>→</span>
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400">
                  Belum ada aktivitas reservasi yang tercatat.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {bookings.slice(0, 5).map((b) => (
                    <div key={b.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#326273]">{b.booking_code}</span>
                          <span className="text-xs font-semibold text-slate-800 truncate">• {b.room?.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {b.user?.name} ({b.user?.email}) • {formatDateIndo(b.booking_date)}
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : b.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {b.status === 'confirmed' && <CheckCircle2 className="w-3 h-3" />}
                          {b.status === 'pending' && <Clock className="w-3 h-3" />}
                          {b.status === 'rejected' && <XCircle className="w-3 h-3" />}
                          {b.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                          {b.status === 'confirmed'
                            ? 'Disetujui'
                            : b.status === 'pending'
                            ? 'Menunggu'
                            : b.status === 'rejected'
                            ? 'Ditolak'
                            : 'Dibatalkan'}
                        </span>

                        {b.status === 'pending' && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateBookingStatus(b, 'confirmed')}
                              className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors cursor-pointer"
                              title="Setujui permohonan ini"
                            >
                              Setujui
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateBookingStatus(b, 'rejected')}
                              className="px-2 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-[10px] transition-colors cursor-pointer"
                              title="Tolak permohonan ini"
                            >
                              Tolak
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Facilities Summary Box */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Status Fasilitas</h3>
                  <p className="text-xs text-slate-500">Ringkasan ketersediaan</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('admin-rooms')}
                  className="text-xs font-bold text-[#326273] hover:text-[#264c5a] flex items-center gap-1 cursor-pointer"
                >
                  <span>Kelola</span>
                  <span>→</span>
                </button>
              </div>

              <div className="space-y-3">
                {rooms.slice(0, 5).map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-xs py-1">
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-slate-800 truncate">{r.name}</div>
                      <div className="text-[11px] text-slate-400">{r.category} • Kapasitas {r.capacity} Orang</div>
                    </div>
                    <span className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      r.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {r.is_active ? 'Aktif' : 'Non-Aktif'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: KELOLA FASILITAS (ROOM CRUD WITH SEARCH & FILTER) */}
      {activeTab === 'admin-rooms' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Daftar & Pengelolaan Fasilitas Kampus</h3>
              <p className="text-xs text-slate-500">
                Kelola data fasilitas ruangan, aktifkan atau nonaktifkan jadwal, serta tambahkan sarana baru.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddRoomOpen(true)}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-[#326273] text-white hover:bg-[#264c5a] shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Fasilitas Baru</span>
            </button>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
              {/* Search Room */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama fasilitas atau ruangan..."
                  value={roomSearchQuery}
                  onChange={(e) => setRoomSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:border-[#326273] focus:ring-1 focus:ring-[#326273] outline-none"
                />
                {roomSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setRoomSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Kategori */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-400">Kategori:</span>
                <select
                  value={roomCategoryFilter}
                  onChange={(e) => setRoomCategoryFilter(e.target.value)}
                  className="text-xs rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 font-medium focus:border-[#326273] focus:ring-1 focus:ring-[#326273] outline-none"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="Aula">Aula</option>
                  <option value="Perpustakaan">Perpustakaan</option>
                  <option value="Meeting Room">Meeting Room</option>
                  <option value="Ruang Belajar">Ruang Belajar</option>
                </select>
              </div>

              {/* Filter Status Aktif */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-400">Status:</span>
                <select
                  value={roomStatusFilter}
                  onChange={(e) => setRoomStatusFilter(e.target.value)}
                  className="text-xs rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 font-medium focus:border-[#326273] focus:ring-1 focus:ring-[#326273] outline-none"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Hanya Aktif</option>
                  <option value="inactive">Hanya Non-Aktif</option>
                </select>
              </div>

              {/* Reset Filter Button */}
              {(roomSearchQuery || roomCategoryFilter !== 'all' || roomStatusFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setRoomSearchQuery('');
                    setRoomCategoryFilter('all');
                    setRoomStatusFilter('all');
                  }}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline px-2 py-1"
                >
                  Reset Filter
                </button>
              )}
            </div>

            <div className="text-xs text-slate-400 font-medium">
              Menampilkan <strong className="text-slate-700">{filteredRooms.length}</strong> dari {rooms.length} fasilitas
            </div>
          </div>

          {/* Rooms Grid */}
          {filteredRooms.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-600">
                Tidak ada fasilitas yang cocok dengan pencarian atau filter yang dipilih.
              </p>
              <button
                type="button"
                onClick={() => {
                  setRoomSearchQuery('');
                  setRoomCategoryFilter('all');
                  setRoomStatusFilter('all');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-[#326273] hover:bg-slate-200 cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {room.category}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleRoomActive(room)}
                        className="flex items-center gap-1 text-xs font-semibold cursor-pointer"
                        title="Klik untuk toggle status aktif"
                      >
                        {room.is_active ? (
                          <span className="text-emerald-600 flex items-center gap-1 font-bold">
                            <ToggleRight className="w-5 h-5 text-emerald-600" /> Aktif
                          </span>
                        ) : (
                          <span className="text-slate-400 flex items-center gap-1 font-semibold">
                            <ToggleLeft className="w-5 h-5 text-slate-400" /> Non-Aktif
                          </span>
                        )}
                      </button>
                    </div>

                    <h4 className="text-base font-bold text-slate-900">{room.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Kapasitas: <strong className="text-slate-800">{room.capacity} Orang</strong> •{' '}
                      <span className="text-emerald-700 font-semibold">Fasilitas Bebas Biaya</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditRoom(room)}
                      className="p-2 rounded-xl text-slate-500 hover:text-[#326273] hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Ubah Data Fasilitas"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRoom(room)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus Fasilitas Ruangan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: KELOLA PENGGUNA (USER CRUD WITH SEARCH & FILTER) */}
      {activeTab === 'admin-users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          {/* Header & Controls */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Kelola Pengguna Sistem</h3>
              <p className="text-xs text-slate-500">
                Manajemen akun Civitas Mahasiswa dan Administrator Biro Sarana serta kuota peminjaman aktif.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddUserOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#326273] text-white hover:bg-[#264c5a] shadow-xs transition-all flex items-center gap-1.5 self-start md:self-auto cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Pengguna Baru</span>
            </button>
          </div>

          {/* Filter Toolbar for Users */}
          <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau email civitas..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:border-[#326273] focus:ring-1 focus:ring-[#326273] outline-none"
                />
                {userSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setUserSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Role Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-400">Peran:</span>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="text-xs rounded-xl border border-slate-200 bg-white py-1.5 px-3 font-medium focus:border-[#326273] focus:ring-1 focus:ring-[#326273] outline-none"
                >
                  <option value="all">Semua Peran</option>
                  <option value="mahasiswa">Civitas Mahasiswa</option>
                  <option value="admin">Biro Sarana (Admin)</option>
                </select>
              </div>

              {/* Quota Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-400">Kuota:</span>
                <select
                  value={userQuotaFilter}
                  onChange={(e) => setUserQuotaFilter(e.target.value)}
                  className="text-xs rounded-xl border border-slate-200 bg-white py-1.5 px-3 font-medium focus:border-[#326273] focus:ring-1 focus:ring-[#326273] outline-none"
                >
                  <option value="all">Semua Kuota</option>
                  <option value="has_quota">Kuota Tersedia (&gt; 0)</option>
                  <option value="zero_quota">Kuota Habis (0 Slot)</option>
                </select>
              </div>

              {/* Reset Filter Button */}
              {(userSearchQuery || userRoleFilter !== 'all' || userQuotaFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setUserSearchQuery('');
                    setUserRoleFilter('all');
                    setUserQuotaFilter('all');
                  }}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline px-2 py-1"
                >
                  Reset Filter
                </button>
              )}
            </div>

            <div className="text-xs text-slate-400 font-medium">
              Menampilkan <strong className="text-slate-700">{filteredUsersList.length}</strong> dari {usersList.length} pengguna
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                  <th scope="col" className="py-3 px-4">Nama Civitas</th>
                  <th scope="col" className="py-3 px-4">Alamat Email</th>
                  <th scope="col" className="py-3 px-4">Peran Sistem</th>
                  <th scope="col" className="py-3 px-4">Sisa Kuota</th>
                  <th scope="col" className="py-3 px-4">Total Peminjaman</th>
                  <th scope="col" className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsersList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Tidak ada data pengguna yang sesuai dengan filter atau pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredUsersList.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{u.name}</span>
                            {isSelf && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                                Akun Anda
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono">
                          {u.email}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            u.role === 'admin'
                              ? 'bg-[#326273]/15 text-[#326273]'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {u.role === 'admin' ? 'Biro Sarana (Admin)' : 'Civitas Mahasiswa'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold">
                          {u.role === 'admin' ? (
                            <span className="text-slate-400 font-normal">Tak Terbatas</span>
                          ) : (
                            <span className={u.booking_quota > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                              {u.booking_quota} Slot
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-semibold">
                          {u.bookings_count ?? 0} Kali
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditUser(u)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#326273] hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Ubah Data Pengguna"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {!isSelf && (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Hapus Pengguna"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100 text-right text-xs text-slate-400">
            Total {usersList.length} pengguna terdaftar pada sistem
          </div>
        </div>
      )}

      {/* SECTION 4: RIWAYAT PEMINJAMAN (HISTORY / ACTIVITY - DI PALING BAWAH) */}
      {activeTab === 'admin-bookings' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          {/* Header & Filter Bar */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Riwayat & Aktivitas Peminjaman</h3>
              <p className="text-xs text-slate-500">
                Pantau seluruh log reservasi fasilitas, status verifikasi, dan dokumen proposal permohonan.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-[#5c9ead]" /> Filter Status:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 font-medium focus:border-[#326273] focus:ring-1 focus:ring-[#326273] outline-none"
              >
                <option value="">Semua Status</option>
                <option value="pending">Menunggu Verifikasi</option>
                <option value="confirmed">Disetujui</option>
                <option value="rejected">Ditolak</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                  <th scope="col" className="py-3 px-4">Kode Reservasi</th>
                  <th scope="col" className="py-3 px-4">Civitas Pemesan</th>
                  <th scope="col" className="py-3 px-4">Fasilitas Ruangan</th>
                  <th scope="col" className="py-3 px-4">Jadwal Penggunaan</th>
                  <th scope="col" className="py-3 px-4">Durasi & Proposal</th>
                  <th scope="col" className="py-3 px-4">Status</th>
                  <th scope="col" className="py-3 px-4 text-right">Aksi Kendali</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Tidak ada data peminjaman yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#326273]">
                        {b.booking_code}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{b.user?.name}</div>
                        <div className="text-[11px] text-slate-400">{b.user?.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{b.room?.name}</span>
                        <span className="block text-[11px] text-slate-400">{b.room?.category}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{formatDateIndo(b.booking_date)}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {formatTimeClean(b.start_time)} - {formatTimeClean(b.end_time)} WIB
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-700 block">
                          {b.duration_type === 'daily' ? 'Seharian Penuh' : 'Sesi Jam'}
                        </span>
                        {b.proposal_path ? (
                          <a
                            href={`http://localhost:8000/api/bookings/proposal/${b.booking_code}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-[#326273] hover:text-[#264c5a] font-bold mt-0.5"
                          >
                            <FileText className="w-3 h-3 text-[#5c9ead]" />
                            <span>Unduh PDF</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400">Tanpa Proposal</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : b.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {b.status === 'confirmed' && <CheckCircle2 className="w-3 h-3" />}
                          {b.status === 'pending' && <Clock className="w-3 h-3" />}
                          {b.status === 'rejected' && <XCircle className="w-3 h-3" />}
                          {b.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                          {b.status === 'confirmed'
                            ? 'Disetujui'
                            : b.status === 'pending'
                            ? 'Menunggu Verifikasi'
                            : b.status === 'rejected'
                            ? 'Ditolak'
                            : 'Dibatalkan'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {b.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateBookingStatus(b, 'confirmed')}
                              className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-2xs"
                              title="Setujui permohonan reservasi ini"
                            >
                              Setujui
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateBookingStatus(b, 'rejected')}
                              className="px-2.5 py-1 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors font-bold text-[11px] cursor-pointer"
                              title="Tolak permohonan reservasi ini (kuota otomatis dipulihkan)"
                            >
                              Tolak
                            </button>
                          </div>
                        ) : b.status === 'confirmed' ? (
                          <button
                            type="button"
                            onClick={() => handleUpdateBookingStatus(b, 'cancelled')}
                            className="px-2.5 py-1 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors font-bold text-[11px] cursor-pointer"
                            title="Batalkan reservasi dan pulihkan kuota civitas"
                          >
                            Batalkan
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleUpdateBookingStatus(b, 'confirmed')}
                            className="px-2.5 py-1 rounded-xl text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition-colors font-bold text-[11px] cursor-pointer"
                            title="Setujui ulang reservasi ini"
                          >
                            Setujui Ulang
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100 text-right text-xs text-slate-400">
            Total {bookings.length} data riwayat peminjaman tercatat
          </div>
        </div>
      )}

      {/* MODAL 1: Tambah Fasilitas Ruangan */}
      {isAddRoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
        >
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Tambah Fasilitas Baru</h3>
              <button
                type="button"
                onClick={() => setIsAddRoomOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRoomSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Ruangan</label>
                <input
                  type="text"
                  required
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Contoh: Aula Rektorat Utama"
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 bg-slate-50 focus:border-[#326273] focus:ring-1 focus:ring-[#326273] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori Fasilitas</label>
                <select
                  value={newRoomCategory}
                  onChange={(e) => setNewRoomCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 bg-slate-50 focus:border-[#326273] focus:ring-1 focus:ring-[#326273] outline-none"
                >
                  <option value="Aula">Aula</option>
                  <option value="Perpustakaan">Perpustakaan</option>
                  <option value="Meeting Room">Meeting Room</option>
                  <option value="Ruang Belajar">Ruang Belajar</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kapasitas Maksimal (Orang)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newRoomCapacity}
                  onChange={(e) => setNewRoomCapacity(e.target.value)}
                  placeholder="30"
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 bg-slate-50 focus:border-[#326273] focus:ring-1 focus:ring-[#326273] outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddRoomOpen(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingRoom}
                  className="flex-1 py-2.5 rounded-xl font-bold bg-[#326273] text-white hover:bg-[#264c5a] shadow-xs cursor-pointer"
                >
                  {savingRoom ? 'Menyimpan...' : 'Simpan Ruangan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Ubah Data Fasilitas Ruangan */}
      {editingRoom && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
        >
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Ubah Data Fasilitas</h3>
              <button
                type="button"
                onClick={() => setEditingRoom(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditRoomSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Ruangan</label>
                <input
                  type="text"
                  required
                  value={editRoomName}
                  onChange={(e) => setEditRoomName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 bg-slate-50 focus:border-[#326273] focus:ring-1 focus:ring-[#326273] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori Fasilitas</label>
                <select
                  value={editRoomCategory}
                  onChange={(e) => setNewRoomCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 bg-slate-50 focus:border-[#326273] focus:ring-1 focus:ring-[#326273] outline-none"
                >
                  <option value="Aula">Aula</option>
                  <option value="Perpustakaan">Perpustakaan</option>
                  <option value="Meeting Room">Meeting Room</option>
                  <option value="Ruang Belajar">Ruang Belajar</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kapasitas Maksimal (Orang)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editRoomCapacity}
                  onChange={(e) => setEditRoomCapacity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 bg-slate-50 focus:border-[#326273] focus:ring-1 focus:ring-[#326273] outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="flex-1 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingEditRoom}
                  className="flex-1 py-2.5 rounded-xl font-bold bg-[#326273] text-white hover:bg-[#264c5a] shadow-xs cursor-pointer"
                >
                  {savingEditRoom ? 'Menyimpan...' : 'Perbarui Ruangan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Tambah Pengguna Baru */}
      {isAddUserOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
        >
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Tambah Pengguna Baru</h3>
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Contoh: Muhammad Farhan"
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 bg-slate-50 focus:border-[#326273] focus:ring-1 focus:ring-[#326273] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Kampus / Pribadi</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="farhan@mahasiswa.kampus.ac.id"
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 bg-slate-50 focus:border-[#326273] focus:ring-1 focus:ring-[#326273] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kata Sandi (Min. 6 Karakter)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 bg-slate-50 focus:border-[#326273] focus:ring-1 focus:ring-[#326273] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Peran Pengguna</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => {
                      const r = e.target.value;
                      setNewUserRole(r);
                      setNewUserQuota(r === 'admin' ? '999' : '5');
                    }}
                    className="w-full rounded-xl border border-slate-200 py-2 px-3 bg-slate-50 focus:border-[#326273] focus:ring-1 focus:ring-[#326273] outline-none"
                  >
                    <option value="mahasiswa">Civitas Mahasiswa</option>
                    <option value="admin">Biro Sarana (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kuota Reservasi</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newUserQuota}
                    onChange={(e) => setNewUserQuota(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-2 px-3 bg-slate-50 focus:border-[#326273] focus:ring-1 focus:ring-[#326273] outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="flex-1 py-2.5 rounded-xl font-bold bg-[#326273] text-white hover:bg-[#264c5a] shadow-xs cursor-pointer"
                >
                  {savingUser ? 'Mendaftarkan...' : 'Tambah Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Ubah Data Pengguna */}
      {editingUser && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
        >
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Ubah Data Pengguna</h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 bg-slate-50 focus:border-[#326273] focus:ring-1 focus:ring-[#326273] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 bg-slate-50 focus:border-[#326273] focus:ring-1 focus:ring-[#326273] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kata Sandi Baru <span className="text-slate-400 font-normal">(Kosongkan bila tidak diganti)</span>
                </label>
                <input
                  type="password"
                  minLength={6}
                  value={editUserPassword}
                  onChange={(e) => setEditUserPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 bg-slate-50 focus:border-[#326273] focus:ring-1 focus:ring-[#326273] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Peran</label>
                  <select
                    value={editUserRole}
                    onChange={(e) => setEditUserRole(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-2 px-3 bg-slate-50 focus:border-[#326273] focus:ring-1 focus:ring-[#326273] outline-none"
                  >
                    <option value="mahasiswa">Civitas Mahasiswa</option>
                    <option value="admin">Biro Sarana (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kuota Booking</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editUserQuota}
                    onChange={(e) => setEditUserQuota(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-2 px-3 bg-slate-50 focus:border-[#326273] focus:ring-1 focus:ring-[#326273] outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingEditUser}
                  className="flex-1 py-2.5 rounded-xl font-bold bg-[#326273] text-white hover:bg-[#264c5a] shadow-xs cursor-pointer"
                >
                  {savingEditUser ? 'Memperbarui...' : 'Perbarui Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        description={confirmModalState.description}
        confirmText={confirmModalState.confirmText}
        variant={confirmModalState.variant}
        isLoading={confirmModalState.isLoading}
        onClose={() => setConfirmModalState({ isOpen: false })}
        onConfirm={confirmModalState.onConfirm}
      />
    </div>
  );
}
