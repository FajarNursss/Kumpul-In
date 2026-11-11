import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import AdminDashboard from './components/AdminDashboard';
import NotFoundPage from './components/NotFoundPage';
import CategoryFilter from './components/RoomCatalog/CategoryFilter';
import RoomList from './components/RoomCatalog/RoomList';
import DateSelector from './components/BookingCalendar/DateSelector';
import SlotGrid from './components/BookingCalendar/SlotGrid';
import BookingForm from './components/BookingModal/BookingForm';
import SuccessModal from './components/BookingModal/SuccessModal';
import MyBookings from './components/MyBookings';
import Toast from './components/Toast';
import { authService, roomService } from './services/api';
import { ArrowRight, AlertTriangle, Menu, Shield, GraduationCap } from 'lucide-react';

// Route parser & validator for URL link handling
const resolveRoute = (pathname, hash) => {
  const cleanPath = (pathname || '/').replace(/\/+$/, '') || '/';
  const cleanHash = (hash || '').toLowerCase();

  // Root or in-page anchors on landing
  if (cleanPath === '/' || cleanPath === '') {
    if (['', '#', '#hero', '#fasilitas', '#alur-booking', '#faq', '#cara-kerja', '#main-content'].includes(cleanHash)) {
      return { view: 'landing', tab: 'catalog', isValid: true };
    }
    if (['#katalog', '#catalog', '#ruangan', '#fasilitas-kampus'].includes(cleanHash)) {
      return { view: 'dashboard', tab: 'catalog', isValid: true };
    }
    if (['#riwayat', '#peminjaman-saya', '#my-bookings', '#reservasi-saya'].includes(cleanHash)) {
      return { view: 'dashboard', tab: 'my-bookings', isValid: true };
    }
    if (['#admin', '#admin-overview'].includes(cleanHash)) {
      return { view: 'dashboard', tab: 'admin', isValid: true };
    }
    if (['#admin-riwayat', '#admin-bookings'].includes(cleanHash)) {
      return { view: 'dashboard', tab: 'admin-bookings', isValid: true };
    }
    if (['#admin-fasilitas', '#admin-rooms'].includes(cleanHash)) {
      return { view: 'dashboard', tab: 'admin-rooms', isValid: true };
    }
    if (['#admin-pengguna', '#admin-users'].includes(cleanHash)) {
      return { view: 'dashboard', tab: 'admin-users', isValid: true };
    }
    // Invalid hash link on root
    return { view: 'not-found', tab: 'catalog', isValid: false, badPath: cleanHash };
  }

  // Path based routing
  if (['/katalog', '/catalog', '/fasilitas', '/portal'].includes(cleanPath)) {
    return { view: 'dashboard', tab: 'catalog', isValid: true };
  }
  if (['/riwayat', '/peminjaman-saya', '/my-bookings', '/reservasi'].includes(cleanPath)) {
    return { view: 'dashboard', tab: 'my-bookings', isValid: true };
  }
  if (cleanPath === '/admin' || cleanPath === '/admin/overview') {
    return { view: 'dashboard', tab: 'admin', isValid: true };
  }
  if (['/admin/riwayat', '/admin/bookings', '/admin/reservasi'].includes(cleanPath)) {
    return { view: 'dashboard', tab: 'admin-bookings', isValid: true };
  }
  if (['/admin/fasilitas', '/admin/ruangan', '/admin/rooms'].includes(cleanPath)) {
    return { view: 'dashboard', tab: 'admin-rooms', isValid: true };
  }
  if (['/admin/pengguna', '/admin/users', '/admin/civitas'].includes(cleanPath)) {
    return { view: 'dashboard', tab: 'admin-users', isValid: true };
  }

  // Any other URL pathname is an invalid link ("salah ketik link")
  return { view: 'not-found', tab: 'catalog', isValid: false, badPath: cleanPath + (cleanHash || '') };
};

export default function App() {
  // Navigation & View Mode: 'landing' | 'dashboard' | 'not-found'
  const [viewMode, setViewMode] = useState('landing');

  // User & Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Dashboard Tab State: 'catalog' | 'my-bookings' | 'admin'
  const [activeTab, setActiveTab] = useState('catalog');

  // Room Catalog State
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minCapacity, setMinCapacity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Calendar & Slot State
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [availability, setAvailability] = useState(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [durationType, setDurationType] = useState('hourly'); // 'hourly' | 'daily'

  // Modals & Feedback State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [successBookingData, setSuccessBookingData] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [serverError, setServerError] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Sync route on mount and on popstate/hashchange
  useEffect(() => {
    const handleUrlChange = () => {
      const route = resolveRoute(window.location.pathname, window.location.hash);
      if (route.isValid) {
        setViewMode(route.view);
        if (route.view === 'dashboard') {
          setActiveTab(route.tab);
        }
      } else {
        setViewMode('not-found');
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Programmatic smooth navigation that syncs URL history
  const navigateTo = (target, category = null) => {
    if (category) {
      setSelectedCategory(category);
    }

    if (target === 'landing') {
      window.history.pushState(null, '', '/');
      setViewMode('landing');
    } else if (target === 'catalog') {
      window.history.pushState(null, '', '/katalog');
      setViewMode('dashboard');
      setActiveTab('catalog');
    } else if (target === 'my-bookings') {
      window.history.pushState(null, '', '/riwayat');
      setViewMode('dashboard');
      setActiveTab('my-bookings');
    } else if (target === 'admin') {
      window.history.pushState(null, '', '/admin');
      setViewMode('dashboard');
      setActiveTab('admin');
    } else if (target === 'admin-bookings') {
      window.history.pushState(null, '', '/admin/riwayat');
      setViewMode('dashboard');
      setActiveTab('admin-bookings');
    } else if (target === 'admin-rooms') {
      window.history.pushState(null, '', '/admin/fasilitas');
      setViewMode('dashboard');
      setActiveTab('admin-rooms');
    } else if (target === 'admin-users') {
      window.history.pushState(null, '', '/admin/pengguna');
      setViewMode('dashboard');
      setActiveTab('admin-users');
    }
  };

  // Check existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('kumpulin_token');
    if (token) {
      authService.getMe()
        .then((res) => {
          if (res.success) {
            setCurrentUser(res.data);
          }
        })
        .catch(() => {
          localStorage.removeItem('kumpulin_token');
        });
    }
  }, []);

  // Security Guard: Prevent non-admins from opening any admin tab
  useEffect(() => {
    const adminTabs = ['admin', 'admin-bookings', 'admin-rooms', 'admin-users'];
    if (adminTabs.includes(activeTab) && currentUser && currentUser.role !== 'admin') {
      navigateTo('catalog');
    }
  }, [activeTab, currentUser]);

  // Fetch Rooms
  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      setServerError(null);
      const res = await roomService.getRooms(selectedCategory, minCapacity);
      if (res.success) {
        setRooms(res.data);
        if (res.data.length > 0) {
          setSelectedRoom((prev) => {
            if (prev && res.data.some((r) => r.id === prev.id)) return prev;
            return res.data[0];
          });
        }
      }
    } catch (err) {
      console.error('Failed to load rooms:', err);
      setServerError(err.customMessage || 'Tidak dapat terhubung ke server backend Kumpul-In (Port 8000).');
    } finally {
      setLoadingRooms(false);
    }
  };

  // Fetch Availability
  const fetchAvailability = async () => {
    if (!selectedRoom) return;
    try {
      setLoadingAvailability(true);
      const res = await roomService.getAvailability(selectedRoom.id, selectedDate);
      if (res.success) {
        setAvailability(res);
      }
    } catch (err) {
      console.error('Failed to load availability:', err);
    } finally {
      setLoadingAvailability(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'dashboard') {
      fetchRooms();
    }
  }, [viewMode, selectedCategory, minCapacity]);

  useEffect(() => {
    if (viewMode === 'dashboard' && selectedRoom) {
      fetchAvailability();
      setSelectedSlot(null);
    }
  }, [selectedRoom, selectedDate]);

  // Filtered & Sorted Rooms (Client-side interactive polish)
  const filteredRooms = useMemo(() => {
    let result = [...rooms];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'capacity-desc') {
      result.sort((a, b) => b.capacity - a.capacity);
    } else if (sortBy === 'capacity-asc') {
      result.sort((a, b) => a.capacity - b.capacity);
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [rooms, searchQuery, sortBy]);

  // Auth Modal Triggers
  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    const roleLabel = user.role === 'admin' ? 'Biro Sarana Kampus' : 'Civitas Akademika';
    showToast(`Selamat datang, ${user.name}! Masuk sebagai ${roleLabel}.`, 'success');
    if (user.role === 'admin') {
      navigateTo('admin');
    } else {
      navigateTo('catalog');
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    navigateTo('landing');
    showToast('Berhasil keluar dari akun.', 'info');
  };

  // Slot clicked
  const handleSelectSlot = (slot) => {
    if (slot.is_booked) {
      showToast(`Slot ${slot.time} sudah dipesan. Pilih slot lain yang kosong.`, 'error');
      return;
    }
    if (!currentUser) {
      showToast('Silakan masuk terlebih dahulu untuk memesan fasilitas kampus.', 'info');
      handleOpenAuth('login');
      return;
    }
    setSelectedSlot(slot);
    setIsBookingModalOpen(true);
  };

  // Booking Success handler
  const handleBookingSuccess = (bookingData) => {
    setIsBookingModalOpen(false);
    setSuccessBookingData(bookingData);
    fetchAvailability();
    authService.getMe().then((res) => {
      if (res.success) setCurrentUser(res.data);
    });
    showToast(`Peminjaman sukses dikonfirmasi! Kode: ${bookingData.booking_code}`, 'success');
  };

  // Render 404 Not Found Page for invalid URLs / typos
  if (viewMode === 'not-found') {
    return (
      <NotFoundPage
        onNavigate={navigateTo}
        currentPath={window.location.pathname + window.location.hash}
      />
    );
  }

  // Render Landing Page View
  if (viewMode === 'landing') {
    return (
      <>
        {/* Backend Connection Error Banner */}
        {serverError && (
          <div role="alert" className="bg-[#fdf4f0] border-b border-[#e39774]/40 px-4 py-2.5 text-xs text-[#d58560] flex items-center justify-between">
            <div className="flex items-center gap-2 max-w-4xl mx-auto">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#e39774]" aria-hidden="true" />
              <span className="font-medium">{serverError}</span>
            </div>
            <button
              onClick={() => {
                setServerError(null);
                fetchRooms();
              }}
              className="px-3 py-1 rounded-lg bg-white border border-[#e39774]/40 text-[#d58560] font-bold text-[11px] hover:bg-[#fae6dc] transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        <LandingPage
          onExploreCatalog={(category) => {
            navigateTo('catalog', category);
          }}
          onOpenAuth={handleOpenAuth}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          defaultMode={authMode}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />

        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'info' })}
        />
      </>
    );
  }

  // Render Shared Dashboard Modals & Toast
  const renderSharedModals = () => (
    <>
      {/* Mobile Sticky Booking Bar */}
      {selectedSlot && (
        <div className="fixed bottom-4 left-4 right-4 sm:hidden z-30 bg-[#326273] text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-[#5c9ead]/40">
          <div>
            <div className="text-[10px] text-slate-300">Slot Terpilih:</div>
            <div className="text-xs font-bold font-mono">
              {selectedSlot.time} • {selectedRoom?.name}
            </div>
          </div>
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#e39774] text-white text-xs font-bold shadow-xs active:scale-95"
          >
            Lanjut Pesan
          </button>
        </div>
      )}

      {/* Booking Form Modal */}
      {isBookingModalOpen && (
        <BookingForm
          room={selectedRoom}
          date={selectedDate}
          slot={selectedSlot}
          durationType={durationType}
          currentUser={currentUser}
          onClose={() => setIsBookingModalOpen(false)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* Booking Success Modal */}
      {successBookingData && (
        <SuccessModal
          bookingData={successBookingData}
          onClose={() => setSuccessBookingData(null)}
        />
      )}

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        defaultMode={authMode}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Toast Feedback */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />
    </>
  );

  // Render Inner Dashboard Content (Admin / My Bookings / Catalog & Slots)
  const renderDashboardContent = () => {
    const adminTabs = ['admin', 'admin-bookings', 'admin-rooms', 'admin-users'];
    if (adminTabs.includes(activeTab) && currentUser?.role === 'admin') {
      return (
        <AdminDashboard
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (['admin', 'admin-bookings', 'admin-rooms', 'admin-users'].includes(tab)) {
              navigateTo(tab);
            } else {
              setActiveTab(tab);
            }
          }}
          onShowToast={showToast}
        />
      );
    }

    if (activeTab === 'my-bookings' && currentUser) {
      return (
        <MyBookings
          currentUser={currentUser}
          onShowToast={showToast}
          onQuotaRecovered={(newQuota) => {
            if (currentUser && typeof newQuota === 'number') {
              setCurrentUser((prev) => ({
                ...prev,
                booking_quota: newQuota,
              }));
            }
          }}
        />
      );
    }

    return (
      <>
        {/* User / Guest Welcome Banner (Hanya untuk Mahasiswa / Tamu; Admin langsung melihat header katalog) */}
        {currentUser?.role !== 'admin' ? (
          <div className="rounded-3xl bg-[#326273] text-white p-6 sm:p-8 shadow-sm border border-slate-700">
            <div className="max-w-3xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-white/90 border border-white/20">
                  <span>Portal Peminjaman Ruang Kampus</span>
                </span>
                {currentUser ? (
                  <span className="text-xs bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-3 py-1 rounded-full font-bold">
                    Civitas Aktif • Sisa Kuota: {currentUser.booking_quota} slot
                  </span>
                ) : (
                  <span className="text-xs bg-white/15 text-white/90 border border-white/20 px-3 py-1 rounded-full font-bold">
                    Akses Tamu / Publik
                  </span>
                )}
                <span className="text-xs bg-[#e39774]/30 text-amber-200 border border-[#e39774]/40 px-3 py-1 rounded-full font-bold">
                  ★ Fasilitas Akademik Bebas Biaya
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {currentUser ? `Halo, ${currentUser.name}!` : 'Katalog Fasilitas & Ruangan Kampus'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl">
                {currentUser
                  ? 'Pilih fasilitas Aula, Perpustakaan, Meeting Room, atau Ruang Belajar Mandiri. Cek transparansi ketersediaan slot waktu secara real-time dan ajukan peminjaman tanpa bentrok.'
                  : 'Anda sedang menjelajahi katalog fasilitas kampus sebagai Pengunjung/Tamu. Silakan cek ketersediaan slot waktu yang tersisa secara bebas. Masuk ke akun Civitas saat ingin melakukan peminjaman ruangan.'}
              </p>

              {!currentUser && (
                <div className="pt-2 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleOpenAuth('login')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#e39774] text-white hover:bg-[#d58560] shadow-sm transition-all cursor-pointer"
                  >
                    Masuk ke Akun
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenAuth('register')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
                  >
                    Daftar Mahasiswa Baru
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Header Bersih Khusus Biro Sarana Kampus */
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#5c9ead]/20 text-[#326273] border border-[#5c9ead]/40">
                  Panel Biro Sarana
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Katalog & Peminjaman Fasilitas Kampus
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih fasilitas kampus untuk reservasi ruangan atau tinjau transparansi ketersediaan slot jadwal secara real-time.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-[#eef6f8] text-[#326273] border border-[#5c9ead]/40 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-2xs">
                <Shield className="w-3.5 h-3.5 text-[#326273]" />
                <span>Akses Biro Sarana (Admin)</span>
              </span>
            </div>
          </div>
        )}

        {/* Catalog & Filter Section (US-01) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Katalog Fasilitas Kampus</h2>
              <p className="text-xs text-slate-500">Pilih kategori fasilitas kampus sesuai kebutuhan kegiatan akademik Anda</p>
            </div>
          </div>

          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            minCapacity={minCapacity}
            onChangeMinCapacity={setMinCapacity}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            totalRooms={filteredRooms.length}
          />

          <RoomList
            rooms={filteredRooms}
            selectedRoomId={selectedRoom?.id}
            onSelectRoom={(r) => {
              setSelectedRoom(r);
              showToast(`Ruangan ${r.name} dipilih. Jadwal slot diperbarui.`, 'info');
            }}
            loading={loadingRooms}
          />
        </section>

        {/* Interactive Calendar & Time Slots Section (US-02, US-03, US-04) */}
        {selectedRoom && (
          <section className="space-y-4 pt-6 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Jadwal & Ketersediaan Slot</h2>
                <p className="text-xs text-slate-500">
                  Pilih tanggal dan slot jam kosong untuk memesan ruangan secara instan
                </p>
              </div>

              {durationType === 'daily' && !availability?.has_daily_booking && (
                <button
                  onClick={() => {
                    if (!currentUser) {
                      showToast('Silakan masuk terlebih dahulu untuk memesan fasilitas kampus.', 'info');
                      handleOpenAuth('login');
                      return;
                    }
                    setIsBookingModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#e39774] text-white hover:bg-[#d58560] shadow-sm transition-all flex items-center space-x-1.5 self-start sm:self-auto active:scale-95 cursor-pointer"
                >
                  <span>Lanjut Booking Seharian</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            <DateSelector
              selectedDate={selectedDate}
              onSelectDate={(newDate) => {
                setSelectedDate(newDate);
                showToast(`Memeriksa jadwal untuk tanggal ${newDate}`, 'info');
              }}
            />

            <SlotGrid
              room={selectedRoom}
              availability={availability}
              loading={loadingAvailability}
              selectedSlot={selectedSlot}
              onSelectSlot={handleSelectSlot}
              durationType={durationType}
              onChangeDurationType={(type) => {
                setDurationType(type);
                showToast(
                  type === 'daily'
                    ? 'Mode peminjaman harian (08:00 - 18:00 WIB) dipilih.'
                    : 'Mode peminjaman per jam dipilih.',
                  'info'
                );
              }}
              currentUser={currentUser}
            />
          </section>
        )}
      </>
    );
  };

  // Case 1: LOGGED-IN USER & ADMIN -> DEDICATED SIDEBAR LAYOUT (NO TOP NAVBAR)
  if (currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans selection:bg-[#326273] selection:text-white">
        {/* Mobile Header Bar with Hamburger Menu (Only visible on screens < md) */}
        <header className="md:hidden sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Buka menu navigasi sidebar"
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-[#326273]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <img src="/logo-icon.png" alt="Logo Kumpul-In" className="h-7 w-auto object-contain" />
              <div className="flex flex-col">
                <span className="text-sm font-black text-[#326273] leading-none">Kumpul-In</span>
                <span className="text-[10px] font-semibold text-[#5c9ead] mt-0.5">
                  {activeTab === 'admin'
                    ? 'Dashboard Admin'
                    : activeTab === 'admin-bookings'
                    ? 'Riwayat Peminjaman'
                    : activeTab === 'admin-rooms'
                    ? 'Kelola Fasilitas'
                    : activeTab === 'admin-users'
                    ? 'Kelola Pengguna'
                    : activeTab === 'my-bookings'
                    ? 'Peminjaman Saya'
                    : 'Katalog Fasilitas'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold ${
                currentUser.role === 'admin' ? 'bg-[#326273]' : 'bg-[#5c9ead]'
              }`}
            >
              {currentUser.role === 'admin' ? (
                <Shield className="w-4 h-4" />
              ) : (
                <GraduationCap className="w-4 h-4" />
              )}
            </div>
          </div>
        </header>

        {/* Dedicated Sidebar for Logged-In User / Admin */}
        <Sidebar
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === 'catalog') navigateTo('catalog');
            else if (tab === 'my-bookings') navigateTo('my-bookings');
            else if (tab === 'admin') navigateTo('admin');
            else if (tab === 'admin-bookings') navigateTo('admin-bookings');
            else if (tab === 'admin-rooms') navigateTo('admin-rooms');
            else if (tab === 'admin-users') navigateTo('admin-users');
            else setActiveTab(tab);
          }}
          onLogout={handleLogout}
          onGoHome={() => navigateTo('landing')}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
        />

        {/* Main Content Area beside Sidebar */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Backend Connection Error Banner */}
          {serverError && (
            <div role="alert" className="bg-[#fdf4f0] border-b border-[#e39774]/40 px-4 py-2.5 text-xs text-[#d58560] flex items-center justify-between">
              <div className="flex items-center gap-2 max-w-4xl mx-auto">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#e39774]" aria-hidden="true" />
                <span className="font-medium">{serverError}</span>
              </div>
              <button
                onClick={() => {
                  setServerError(null);
                  fetchRooms();
                }}
                className="px-3 py-1 rounded-lg bg-white border border-[#e39774]/40 text-[#d58560] font-bold text-[11px] hover:bg-[#fae6dc] transition-colors"
              >
                Coba Sambungkan
              </button>
            </div>
          )}

          <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
            {renderDashboardContent()}
          </main>

          {/* Footer inside sidebar layout */}
          <footer className="mt-auto bg-white border-t border-slate-200 py-6 pb-20 sm:pb-8 text-center text-xs text-slate-500">
            <p>© 2026 Kumpul-In Kampus • Sistem Peminjaman Fasilitas & Ruang Kampus Terpadu. Seluruh hak cipta dilindungi.</p>
          </footer>
        </div>

        {/* Shared Modals & Toast */}
        {renderSharedModals()}
      </div>
    );
  }

  // Case 2: GUEST / UNREGISTERED VISITOR -> TOP NAVBAR LAYOUT (NO SIDEBAR)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-[#326273] selection:text-white">
      {/* Backend Connection Error Banner */}
      {serverError && (
        <div role="alert" className="bg-[#fdf4f0] border-b border-[#e39774]/40 px-4 py-2.5 text-xs text-[#d58560] flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#e39774]" aria-hidden="true" />
            <span className="font-medium">{serverError}</span>
          </div>
          <button
            onClick={() => {
              setServerError(null);
              fetchRooms();
            }}
            className="px-3 py-1 rounded-lg bg-white border border-[#e39774]/40 text-[#d58560] font-bold text-[11px] hover:bg-[#fae6dc] transition-colors"
          >
            Coba Sambungkan
          </button>
        </div>
      )}

      {/* Top Navigation for Visitors */}
      <Navbar
        currentUser={null}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'catalog') navigateTo('catalog');
          else setActiveTab(tab);
        }}
        onOpenAuth={handleOpenAuth}
        onGoHome={() => navigateTo('landing')}
      />

      {/* Main Container */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-5 sm:pt-8 pb-16 sm:pb-20 space-y-6 sm:space-y-8">
        {renderDashboardContent()}
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-6 pb-20 sm:pb-16 text-center text-xs text-slate-500">
        <p>© 2026 Kumpul-In Kampus • Sistem Peminjaman Fasilitas & Ruang Kampus Terpadu. Seluruh hak cipta dilindungi.</p>
      </footer>

      {/* Shared Modals & Toast */}
      {renderSharedModals()}
    </div>
  );
}
