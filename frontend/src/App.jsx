import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
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
import { ArrowRight, AlertTriangle } from 'lucide-react';

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
    if (['#admin'].includes(cleanHash)) {
      return { view: 'dashboard', tab: 'admin', isValid: true };
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
  if (cleanPath === '/admin') {
    return { view: 'dashboard', tab: 'admin', isValid: true };
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

  // Fetch Rooms
  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      setServerError(null);
      const res = await roomService.getRooms(selectedCategory, minCapacity);
      if (res.success) {
        setRooms(res.data);
        if (!selectedRoom && res.data.length > 0) {
          setSelectedRoom(res.data[0]);
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
          onExploreCatalog={() => {
            navigateTo('catalog');
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

  // Dashboard / App View
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

      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'catalog') navigateTo('catalog');
          else if (tab === 'my-bookings') navigateTo('my-bookings');
          else if (tab === 'admin') navigateTo('admin');
          else setActiveTab(tab);
        }}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onGoHome={() => navigateTo('landing')}
      />

      {/* Main Container */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 space-y-8">
        {activeTab === 'admin' && currentUser?.role === 'admin' ? (
          /* Admin Dashboard */
          <AdminDashboard currentUser={currentUser} onShowToast={showToast} />
        ) : activeTab === 'my-bookings' ? (
          /* My Bookings Tab with Realtime Quota Recovery */
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
        ) : (
          /* User Catalog & Reservation Tab (US-01 to US-04) */
          <>
            {/* User Welcome Banner */}
            <div className="rounded-3xl bg-[#326273] text-white p-6 sm:p-8 shadow-sm border border-slate-700">
              <div className="max-w-3xl space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-white/90 border border-white/20">
                    <span>Portal Peminjaman Ruang Kampus</span>
                  </span>
                  {currentUser && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-3 py-1 rounded-full font-bold">
                      Sisa Kuota: {currentUser.booking_quota} slot aktif
                    </span>
                  )}
                  <span className="text-xs bg-[#e39774]/30 text-amber-200 border border-[#e39774]/40 px-3 py-1 rounded-full font-bold">
                    ★ Fasilitas Akademik Bebas Biaya
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Halo, {currentUser?.name || 'Civitas Akademika Kampus'}!
                </h1>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl">
                  Pilih fasilitas Aula, Perpustakaan, Meeting Room, atau Ruang Belajar Mandiri. Cek transparansi ketersediaan slot waktu secara real-time dan ajukan peminjaman tanpa bentrok.
                </p>
              </div>
            </div>

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
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#e39774] text-white hover:bg-[#d58560] shadow-sm transition-all flex items-center space-x-1.5 self-start sm:self-auto active:scale-95"
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
        )}
      </main>

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

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-6 pb-20 sm:pb-16 text-center text-xs text-slate-500">
        <p>© 2026 Kumpul-In Kampus • Sistem Peminjaman Fasilitas & Ruang Kampus Terpadu. Seluruh hak cipta dilindungi.</p>
      </footer>
    </div>
  );
}
