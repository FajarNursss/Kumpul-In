import React, { useState, useEffect } from 'react';
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
import { authService, roomService } from './services/api';
import { Sparkles, Calendar, ArrowRight, CheckCircle2, Shield, User, Award } from 'lucide-react';

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
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Calendar & Slot State
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [availability, setAvailability] = useState(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [durationType, setDurationType] = useState('hourly'); // 'hourly' | 'daily'

  // Modals State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [successBookingData, setSuccessBookingData] = useState(null);

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

  // Auth Modal Triggers
  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setViewMode('dashboard');
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
        if (role === 'admin') {
          setActiveTab('admin');
        } else {
          if (activeTab === 'admin') setActiveTab('catalog');
          if (selectedRoom) fetchAvailability();
        }
      }
    } catch (err) {
      console.error('Failed to switch role:', err);
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
  };

  // Slot clicked
  const handleSelectSlot = (slot) => {
    if (slot.is_booked) return;
    if (!currentUser) {
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
  };

  // If on Landing Page view
  if (viewMode === 'landing') {
    return (
      <>
        <LandingPage
          onExploreCatalog={() => {
            // If already logged in or not, transition to dashboard view
            if (!currentUser) {
              // Automatically sign in as Member for seamless demo or let them browse
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
      </>
    );
  }

  // Dashboard / App View
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
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
          <AdminDashboard currentUser={currentUser} />
        ) : activeTab === 'my-bookings' ? (
          /* My Bookings Tab */
          <MyBookings currentUser={currentUser} />
        ) : (
          /* User Catalog & Reservation Tab (US-01 to US-04) */
          <>
            {/* User Welcome Banner */}
            <div className="relative rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 text-white p-6 sm:p-8 shadow-xl overflow-hidden">
              <div className="relative z-10 max-w-3xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-100 border border-white/20">
                    <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                    <span>Dashboard Reservasi {currentUser?.role === 'member' ? 'Member' : 'Guest'}</span>
                  </span>
                  {currentUser && (
                    <span className="text-xs bg-emerald-500/30 text-emerald-100 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-bold">
                      Sisa Kuota: {currentUser.booking_quota} slot
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                  Halo, {currentUser?.name || 'Kawan Kumpul-In'}!
                </h1>
                <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-2xl">
                  Pilih ruangan kerja atau ruang diskusi yang Anda butuhkan. Cek ketersediaan slot waktu secara real-time dan pesan tanpa risiko jadwal bentrok.
                </p>
              </div>

              {/* Decorative Background Circles */}
              <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute right-32 -top-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />
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
              />

              <RoomList
                rooms={rooms}
                selectedRoomId={selectedRoom?.id}
                onSelectRoom={(r) => setSelectedRoom(r)}
                loading={loadingRooms}
              />
            </section>

            {/* Interactive Calendar & Time Slots Section (US-02, US-03, US-04) */}
            {selectedRoom && (
              <section className="space-y-4 pt-4 border-t border-slate-200">
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
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
                    >
                      <span>Lanjut Booking Seharian</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <DateSelector
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />

                <SlotGrid
                  room={selectedRoom}
                  availability={availability}
                  loading={loadingAvailability}
                  selectedSlot={selectedSlot}
                  onSelectSlot={handleSelectSlot}
                  durationType={durationType}
                  onChangeDurationType={setDurationType}
                  currentUser={currentUser}
                />
              </section>
            )}
          </>
        )}
      </main>

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

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Kumpul-In • Praktikum Rekayasa Perangkat Lunak (Bab 4: Agile & Scrum)</p>
      </footer>
    </div>
  );
}
