import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CategoryFilter from './components/RoomCatalog/CategoryFilter';
import RoomList from './components/RoomCatalog/RoomList';
import DateSelector from './components/BookingCalendar/DateSelector';
import SlotGrid from './components/BookingCalendar/SlotGrid';
import BookingForm from './components/BookingModal/BookingForm';
import SuccessModal from './components/BookingModal/SuccessModal';
import MyBookings from './components/MyBookings';
import { authService, roomService } from './services/api';
import { Sparkles, Calendar, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function App() {
  // User & Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Navigation State
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'my-bookings'

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

  // Initialize: default login as Member or Guest
  const initUser = async (role = 'member') => {
    try {
      setLoadingUser(true);
      const res = await authService.quickLogin(role);
      if (res.success) {
        setCurrentUser(res.data.user);
      }
    } catch (err) {
      console.error('Failed to initialize user session:', err);
    } finally {
      setLoadingUser(false);
    }
  };

  // Fetch Rooms
  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      const res = await roomService.getRooms(selectedCategory, minCapacity);
      if (res.success) {
        setRooms(res.data);
        // Default select first room if none selected
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

  // Fetch Availability for selectedRoom and selectedDate
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

  // Initial mount
  useEffect(() => {
    initUser('member');
  }, []);

  // When category / minCapacity filter changes
  useEffect(() => {
    fetchRooms();
  }, [selectedCategory, minCapacity]);

  // When selectedRoom or selectedDate changes
  useEffect(() => {
    if (selectedRoom) {
      fetchAvailability();
      setSelectedSlot(null);
    }
  }, [selectedRoom, selectedDate]);

  // Switch role handler (Guest vs Member)
  const handleSwitchRole = async (role) => {
    await initUser(role);
    if (selectedRoom) {
      fetchAvailability();
    }
  };

  // Slot clicked
  const handleSelectSlot = (slot) => {
    if (slot.is_booked) return;
    setSelectedSlot(slot);
    setIsBookingModalOpen(true);
  };

  // Booking Success handler
  const handleBookingSuccess = (bookingData) => {
    setIsBookingModalOpen(false);
    setSuccessBookingData(bookingData);
    // Refresh availability & user profile (quota)
    fetchAvailability();
    authService.getMe().then((res) => {
      if (res.success) setCurrentUser(res.data);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        loadingUser={loadingUser}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'catalog' ? (
          <>
            {/* Hero / Intro Banner */}
            <div className="relative rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 text-white p-6 sm:p-10 shadow-xl overflow-hidden">
              <div className="relative z-10 max-w-2xl space-y-3">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-100 border border-white/20">
                  <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                  <span>Sistem Reservasi Community Hub Real-Time</span>
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  Ruang Kolaborasi Fleksibel untuk Komunitas Anda
                </h1>
                <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                  Pilih ruangan favorit mulai dari Open Desk, Meeting Pod, hingga Grand Hall Event Space. Transparansi slot jadwal seketika tanpa bentrok.
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
                  <h2 className="text-xl font-bold text-slate-900">Katalog Ruangan</h2>
                  <p className="text-xs text-slate-500">Pilih kategori ruangan sesuai kebutuhan kapasitas kegiatan</p>
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
        ) : (
          <MyBookings currentUser={currentUser} />
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

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Kumpul-In • Praktikum Rekayasa Perangkat Lunak (Bab 4: Agile & Scrum)</p>
      </footer>
    </div>
  );
}
