import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import AdminDashboard from './components/AdminDashboard';
import CategoryFilter from './components/RoomCatalog/CategoryFilter';
import RoomList from './components/RoomCatalog/RoomList';
import DateSelector from './components/BookingCalendar/DateSelector';
import SlotGrid from './components/BookingCalendar/SlotGrid';
import BookingForm from './components/BookingModal/BookingForm';
import SuccessModal from './components/BookingModal/SuccessModal';
import MyBookings from './components/MyBookings';
import Toast from './components/Toast';
import { authService, roomService } from './services/api';
import { Sparkles, Calendar, ArrowRight, CheckCircle2, Shield, User, Award, Clock } from 'lucide-react';

export default function App() {
  // Navigation & View Mode: 'landing' | 'dashboard'
  const [viewMode, setViewMode] = useState('landing');

  // User & Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
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

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Check existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('kumpulin_token');
    if (token) {
      authService.getMe()
        .then((res) => {
          if (res.success) {
            setCurrentUser(res.data);
            if (res.data.role === 'admin') {
              setActiveTab('admin');
            }
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
      const res = await roomService.getRooms(selectedCategory, minCapacity);
      if (res.success) {
        setRooms(res.data);
        if (!selectedRoom && res.data.length > 0) {
          setSelectedRoom(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load rooms:', err);
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

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price_per_hour - b.price_per_hour);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price_per_hour - a.price_per_hour);
    } else if (sortBy === 'capacity-desc') {
      result.sort((a, b) => b.capacity - a.capacity);
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
    setViewMode('dashboard');
    showToast(`Selamat datang, ${user.name}! Masuk sebagai ${user.role}.`, 'success');
    if (user.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('catalog');
    }
  };

  // Switch role handler (Demo Switcher: Guest, Member, Admin)
  const handleSwitchRole = async (role) => {
    try {
      setLoadingUser(true);
      const res = await authService.quickLogin(role);
      if (res.success) {
        setCurrentUser(res.data.user);
        showToast(
          `Beralih ke akun ${res.data.user.role.toUpperCase()} (Sisa Kuota: ${res.data.user.booking_quota} slot)`,
          'info'
        );
        if (role === 'admin') {
          setActiveTab('admin');
        } else {
          if (activeTab === 'admin') setActiveTab('catalog');
          if (selectedRoom) fetchAvailability();
        }
      }
    } catch (err) {
      console.error('Failed to switch role:', err);
      showToast('Gagal beralih role demo.', 'error');
    } finally {
      setLoadingUser(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setViewMode('landing');
    setActiveTab('catalog');
    showToast('Berhasil keluar dari akun.', 'info');
  };

  // Slot clicked
  const handleSelectSlot = (slot) => {
    if (slot.is_booked) {
      showToast(`Slot ${slot.time} sudah dipesan. Pilih slot lain yang kosong.`, 'error');
      return;
    }
    if (!currentUser) {
      showToast('Silakan masuk terlebih dahulu untuk memesan slot.', 'info');
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
    showToast(`Reservasi sukses dikonfirmasi! Kode: ${bookingData.booking_code}`, 'success');
  };

  // If on Landing Page view
  if (viewMode === 'landing') {
    return (
      <>
        <LandingPage
          onExploreCatalog={() => {
            if (!currentUser) {
              authService.quickLogin('member').then((res) => {
                if (res.success) setCurrentUser(res.data.user);
              });
            }
            setViewMode('dashboard');
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
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        loadingUser={loadingUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onGoHome={() => setViewMode('landing')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'admin' && currentUser?.role === 'admin' ? (
          /* Admin Dashboard */
          <AdminDashboard currentUser={currentUser} onShowToast={showToast} />
        ) : activeTab === 'my-bookings' ? (
          /* My Bookings Tab */
          <MyBookings currentUser={currentUser} onShowToast={showToast} />
        ) : (
          /* User Catalog & Reservation Tab (US-01 to US-04) */
          <>
            {/* User Welcome Banner */}
            <div className="rounded-3xl bg-[#326273] text-white p-6 sm:p-8 shadow-sm border border-slate-700">
              <div className="max-w-3xl space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-white/90 border border-white/20">
                    <span>Dashboard Reservasi {currentUser?.role === 'member' ? 'Member' : 'Guest'}</span>
                  </span>
                  {currentUser && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-3 py-1 rounded-full font-bold">
                      Sisa Kuota: {currentUser.booking_quota} slot
                    </span>
                  )}
                  {currentUser?.role === 'member' && (
                    <span className="text-xs bg-[#e39774]/30 text-amber-200 border border-[#e39774]/40 px-3 py-1 rounded-full font-bold">
                      ★ Hak Istimewa Sewa Harian (Daily) Aktif
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Halo, {currentUser?.name || 'Kawan Kumpul-In'}!
                </h1>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl">
                  Pilih ruangan kerja atau ruang diskusi yang Anda butuhkan. Cek ketersediaan slot waktu secara transparan dan pesan tanpa risiko jadwal bentrok.
                </p>
              </div>
            </div>

            {/* Catalog & Filter Section (US-01) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Katalog Ruangan Hub</h2>
                  <p className="text-xs text-slate-500">Pilih kategori ruangan sesuai kebutuhan kegiatan Anda</p>
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
                      onClick={() => setIsBookingModalOpen(true)}
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
                        ? 'Mode sewa harian (08:00 - 18:00 WIB) dipilih.'
                        : 'Mode sewa per jam dipilih.',
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

      {/* Floating Demo Role Switcher Toolbar (Bottom Center) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl border border-slate-200 hidden sm:flex items-center space-x-2 text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#e39774]" /> Demo Praktikum:
        </span>
        <button
          onClick={() => handleSwitchRole('guest')}
          className={`px-3 py-1 rounded-xl font-bold transition-all ${
            currentUser?.role === 'guest'
              ? 'bg-[#326273] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Guest (2 Kuota)
        </button>
        <button
          onClick={() => handleSwitchRole('member')}
          className={`px-3 py-1 rounded-xl font-bold transition-all ${
            currentUser?.role === 'member'
              ? 'bg-[#5c9ead] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Member (10 Kuota + Daily)
        </button>
        <button
          onClick={() => handleSwitchRole('admin')}
          className={`px-3 py-1 rounded-xl font-bold transition-all ${
            currentUser?.role === 'admin'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Admin (Pusat Kendali)
        </button>
      </div>

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
      <footer className="mt-auto bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Kumpul-In • Praktikum Rekayasa Perangkat Lunak (Bab 4: Agile & Scrum)</p>
      </footer>
    </div>
  );
}
