import React, { useState } from 'react';
import {
  Clock, ShieldCheck, ArrowRight,
  Users, Building, Coffee, Wifi, Monitor, FileText, ChevronRight,
  Sparkles, CheckCircle2, Calendar, HelpCircle, ChevronDown, Check,
  Calculator, Layers, Award, Shield, PhoneCall, ExternalLink, Menu, X
} from 'lucide-react';

const SIMULATOR_ROOMS = [
  {
    id: 2,
    name: 'Meeting Pod Alpha',
    category: 'Meeting Pod',
    capacity: 4,
    price: 50000,
    features: ['Kedap Suara', 'Smart TV Display', 'Whiteboard'],
    slots: [
      { time: '09:00 - 10:00', status: 'available' },
      { time: '10:00 - 11:00', status: 'booked', code: 'CHB-20261109-8421' },
      { time: '11:00 - 12:00', status: 'available' },
      { time: '13:00 - 14:00', status: 'available' },
      { time: '14:00 - 15:00', status: 'booked', code: 'CHB-20261109-9132' },
      { time: '15:00 - 16:00', status: 'available' },
    ],
  },
  {
    id: 1,
    name: 'Open Desk 01 (Ergonomis)',
    category: 'Open Desk',
    capacity: 1,
    price: 15000,
    features: ['Stopkontak Tiap Meja', 'Wi-Fi 100Mbps', 'Free Flow Kopi'],
    slots: [
      { time: '08:00 - 09:00', status: 'available' },
      { time: '09:00 - 10:00', status: 'available' },
      { time: '10:00 - 11:00', status: 'available' },
      { time: '13:00 - 14:00', status: 'booked', code: 'CHB-20261109-1144' },
      { time: '14:00 - 15:00', status: 'available' },
      { time: '16:00 - 17:00', status: 'available' },
    ],
  },
  {
    id: 5,
    name: 'Event Space Main Hall',
    category: 'Event Space',
    capacity: 50,
    price: 350000,
    features: ['Sound System Pro', 'Dual Wireless Mic', 'Wajib Proposal PDF'],
    slots: [
      { time: '08:00 - 10:00', status: 'booked', code: 'CHB-20261109-0012' },
      { time: '10:00 - 12:00', status: 'available' },
      { time: '13:00 - 15:00', status: 'available' },
      { time: '15:00 - 17:00', status: 'available' },
    ],
  },
];

const FAQS = [
  {
    q: 'Bagaimana sistem Kumpul-In mencegah reservasi bentrok (Double Booking)?',
    a: 'Sistem Kumpul-In menerapkan validasi interval matematika di tingkat database: (start_baru < end_terdaftar) && (end_baru > start_terdaftar). Validasi ini dibungkus dalam Database Atomic Transaction (DB::transaction). Jika dua orang memesan slot yang sama di detik yang sama, hanya transaksi pertama yang diterima dan transaksi kedua ditolak secara otomatis.',
  },
  {
    q: 'Apa perbedaan antara akun Guest dan akun Member?',
    a: 'Pengguna Guest memiliki kuota reservasi 2 slot dan hanya dapat memesan dengan durasi per jam. Sedangkan pengguna Member memiliki kuota hingga 10 slot dan mendapatkan hak istimewa untuk memesan sewa harian penuh (Daily) dari jam 08:00 hingga 18:00 WIB.',
  },
  {
    q: 'Mengapa pemesanan Event Space membutuhkan unggahan proposal PDF?',
    a: 'Event Space merupakan ruangan berkapasitas besar (hingga 50 orang) yang digunakan untuk gathering dan seminar komunitas. Sistem mewajibkan pengelola memvalidasi susunan acara dan kebutuhan kelistrikan/sound melalui file proposal PDF (maksimal 2MB) sebelum ruangan dapat dikonfirmasi.',
  },
  {
    q: 'Bagaimana cara sewa seharian penuh (Daily Booking)?',
    a: 'Masuk dengan akun Member, pilih ruangan yang diinginkan di katalog, kemudian ubah opsi durasi menjadi "Sewa Harian (Daily)". Sistem akan otomatis memvalidasi bahwa tidak ada satu pun slot yang sudah terisi pada tanggal tersebut, lalu mengunci seluruh 10 slot (08:00 - 18:00) sekaligus.',
  },
  {
    q: 'Apakah saya bisa langsung mencoba demo aplikasi tanpa repot mendaftar?',
    a: 'Tentu saja! Di tombol "Akses Cepat Demo Praktikum" atau modal login, tersedia opsi 1-klik untuk masuk langsung sebagai Admin (pengelola sistem), Member (kuota 10 slot & sewa harian), atau Guest (kuota 2 slot).',
  },
];

const TESTIMONIALS = [
  {
    name: 'Fajar Pratama',
    role: 'Lead Google Developer Student Clubs',
    text: 'Sangat terbantu untuk reservasi aula gathering bulanan GDSC. Dulu sering bentrok sama divisi lain, sekarang tinggal buka Kumpul-In, slot transparan dan kode booking langsung keluar detik itu juga.',
  },
  {
    name: 'Annisa Rahmawati',
    role: 'UI/UX Designer & Freelancer',
    text: 'Meeting Pod-nya beneran kedap suara dan booking per jamnya praktis banget buat interview user atau client call. Tampilannya bersih, simpel, dan nggak ribet.',
  },
  {
    name: 'Rian Hidayat',
    role: 'Mahasiswa Informatika (Semester 5)',
    text: 'Fitur 1-click quick demo-nya ngebantu banget pas presentasi praktikum bab Scrum. Dosen penguji langsung bisa lihat perbedaan hak akses Guest, Member, dan Admin secara real-time.',
  },
];

export default function LandingPage({ onExploreCatalog, onOpenAuth }) {
  // Simulator State
  const [activeSimRoomIndex, setActiveSimRoomIndex] = useState(0);
  const [selectedSimSlot, setSelectedSimSlot] = useState(SIMULATOR_ROOMS[0].slots[0]);

  // Interactive Calculator State
  const [calcHours, setCalcHours] = useState(3);
  const [calcRoomType, setCalcRoomType] = useState('Meeting Pod');
  const [calcIsMember, setCalcIsMember] = useState(true);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Facilities Tab Filter
  const [facilityFilter, setFacilityFilter] = useState('All');

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentSimRoom = SIMULATOR_ROOMS[activeSimRoomIndex];

  // Calculator computation
  const calcRate = calcRoomType === 'Open Desk' ? 15000 : calcRoomType === 'Meeting Pod' ? 50000 : 350000;
  const rawTotal = calcRate * calcHours;
  const discount = calcIsMember && calcHours >= 4 ? 0.15 * rawTotal : 0;
  const finalTotal = rawTotal - discount;

  const formattedFinalTotal = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(finalTotal);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-[#326273] selection:text-white">
      {/* Top Notification Bar */}
      <div className="bg-[#326273] text-white py-2 px-4 text-center text-xs font-semibold tracking-wide flex items-center justify-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
        <span>Sistem Reservasi Real-Time Kumpul-In Aktif • Tugas Praktikum Rekayasa Perangkat Lunak Bab 4</span>
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo */}
            <div
              className="flex items-center cursor-pointer py-1"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <img
                src="/logo.png"
                alt="Kumpul-In Community Hub"
                className="h-9 sm:h-11 w-auto object-contain hover:opacity-95 transition-opacity"
              />
            </div>

            {/* Desktop Menu Links */}
            <nav className="hidden lg:flex items-center space-x-8 text-sm font-semibold text-slate-600">
              <a href="#simulator" className="hover:text-[#326273] transition-colors">Simulator Slot</a>
              <a href="#kalkulator" className="hover:text-[#326273] transition-colors">Kalkulator Biaya</a>
              <a href="#fasilitas" className="hover:text-[#326273] transition-colors">Pilihan Ruang</a>
              <a href="#cara-kerja" className="hover:text-[#326273] transition-colors">Alur Booking</a>
              <a href="#faq" className="hover:text-[#326273] transition-colors">FAQ</a>
            </nav>

            {/* Auth Actions */}
            <div className="hidden sm:flex items-center space-x-3">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-[#326273] hover:bg-slate-100 transition-colors"
              >
                Masuk
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#e39774] text-white hover:bg-[#d58560] shadow-sm hover:shadow transition-all flex items-center space-x-1.5 active:scale-95"
              >
                <span>Daftar Akun</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile Menu Hamburger Button */}
            <div className="flex sm:hidden items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-xl">
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
              <a
                href="#simulator"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100"
              >
                Simulator Slot
              </a>
              <a
                href="#kalkulator"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100"
              >
                Kalkulator Biaya
              </a>
              <a
                href="#fasilitas"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100"
              >
                Pilihan Ruang
              </a>
              <a
                href="#faq"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100"
              >
                Tanya Jawab (FAQ)
              </a>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center space-x-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAuth('login');
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 text-center"
              >
                Masuk
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAuth('register');
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#e39774] text-white text-center shadow-sm"
              >
                Daftar Akun
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section with Live Simulator */}
      <section id="simulator" className="relative pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#eef6f8] border border-[#5c9ead]/40 text-[#326273] text-xs font-semibold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#5c9ead] animate-pulse" />
                <span>Community Hub & Coworking Space Booking</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Pesan Meja Kerja & Ruang Rapat Komunitas, <span className="text-[#326273]">Tanpa Jadwal Bentrok</span>.
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Dari meja personal ergonomis, meeting pod kedap suara, hingga aula gathering 50 orang. Sistem memvalidasi ketersediaan jam secara transparan dengan penerbitan bukti kode booking instan.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={onExploreCatalog}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-bold bg-[#326273] text-white hover:bg-[#264c5a] shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-95"
                >
                  <span>Buka Katalog Ruangan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onOpenAuth('login')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center space-x-2 active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-[#e39774]" />
                  <span>Akses Cepat Demo Praktikum</span>
                </button>
              </div>

              {/* Real Value Metrics */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-100 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#326273]">10 Slot</div>
                  <div className="text-[11px] text-slate-500 font-medium">08:00 - 18:00 WIB</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#326273]">100% Real-Time</div>
                  <div className="text-[11px] text-slate-500 font-medium">Kunci Bebas Bentrok</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#e39774]">Instan</div>
                  <div className="text-[11px] text-slate-500 font-medium">Kode CHB-2026***</div>
                </div>
              </div>
            </div>

            {/* Right Card: LIVE INTERACTIVE SIMULATOR */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-200 space-y-5 transition-all">
                {/* Simulator Header & Room Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <img src="/logo-icon.png" alt="Icon" className="h-8 w-auto object-contain" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c9ead]">
                          Live Interactive Simulator
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        Simulasi Pilih Ruang & Jam
                      </h3>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
                    Koneksi Real-Time
                  </span>
                </div>

                {/* Interactive Room Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs font-bold">
                  {SIMULATOR_ROOMS.map((r, idx) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setActiveSimRoomIndex(idx);
                        setSelectedSimSlot(r.slots.find((s) => s.status === 'available') || r.slots[0]);
                      }}
                      className={`flex-1 py-2 px-2.5 rounded-lg whitespace-nowrap transition-all ${
                        activeSimRoomIndex === idx
                          ? 'bg-[#326273] text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      {r.category}
                    </button>
                  ))}
                </div>

                {/* Room Info Detail */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{currentSimRoom.name}</h4>
                    <p className="text-xs text-slate-500">
                      Kapasitas {currentSimRoom.capacity} Orang • {currentSimRoom.features.join(' • ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Tarif</span>
                    <span className="text-sm font-extrabold text-[#326273]">
                      Rp {currentSimRoom.price.toLocaleString('id-ID')}
                      <span className="text-[10px] font-normal text-slate-500"> /jam</span>
                    </span>
                  </div>
                </div>

                {/* Interactive Slots Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span>Pilih Salah Satu Slot Waktu (Klik untuk Uji):</span>
                    <span className="text-emerald-700 font-bold">● Hijau = Siap Dipesan</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {currentSimRoom.slots.map((slot, sIdx) => {
                      const isBooked = slot.status === 'booked';
                      const isSelected = selectedSimSlot?.time === slot.time && !isBooked;

                      let style = 'bg-[#eef6f8] border-[#5c9ead]/40 text-[#326273] hover:border-[#5c9ead] cursor-pointer';
                      if (isBooked) {
                        style = 'bg-rose-50 border-rose-200 text-rose-500 cursor-not-allowed opacity-80';
                      } else if (isSelected) {
                        style = 'bg-[#326273] border-[#326273] text-white shadow-md ring-2 ring-[#326273]/30 font-bold';
                      }

                      return (
                        <button
                          key={sIdx}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setSelectedSimSlot(slot)}
                          className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${style}`}
                        >
                          <span className="text-[11px] font-bold block">{slot.time}</span>
                          <span className="text-[10px] font-semibold mt-1">
                            {isBooked ? 'Terisi (Terkunci)' : isSelected ? 'Slot Terpilih' : 'Tersedia'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Instant Calculation Output & CTA */}
                <div className="p-4 rounded-2xl bg-[#fdf4f0] border border-[#e39774]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Estimasi Pilihan Slot
                    </span>
                    <div className="text-sm font-bold text-slate-900">
                      {selectedSimSlot ? selectedSimSlot.time : 'Pilih slot kosong'} •{' '}
                      <span className="text-[#326273] font-mono">
                        Rp {currentSimRoom.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={onExploreCatalog}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#e39774] text-white hover:bg-[#d58560] shadow-sm transition-all flex items-center justify-center space-x-1.5 active:scale-95"
                  >
                    <span>Pesan di Katalog</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Cost Calculator Section */}
      <section id="kalkulator" className="py-16 bg-[#f8fafc] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#5c9ead] uppercase tracking-wider flex items-center justify-center gap-1">
              <Calculator className="w-3.5 h-3.5" /> Kalkulator Estimasi Komunitas
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hitung Kebutuhan Waktu & Anggaran Sewa
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Transparan tanpa biaya tersembunyi. Dapatkan diskon 15% untuk durasi 4 jam ke atas bagi Member.
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Selector Kategori */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Tipe Ruangan yang Dibutuhkan:</label>
                <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                  {['Open Desk', 'Meeting Pod', 'Event Space'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCalcRoomType(type)}
                      className={`p-2.5 rounded-xl border transition-all text-center ${
                        calcRoomType === type
                          ? 'bg-[#326273] text-white border-[#326273] shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Switch Status Member */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Status Akun Pemesan:</label>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setCalcIsMember(false)}
                    className={`p-2.5 rounded-xl border transition-all text-center ${
                      !calcIsMember
                        ? 'bg-[#326273] text-white border-[#326273] shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Guest (Umum)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcIsMember(true)}
                    className={`p-2.5 rounded-xl border transition-all text-center flex items-center justify-center gap-1 ${
                      calcIsMember
                        ? 'bg-[#5c9ead] text-white border-[#5c9ead] shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Member Kumpul-In</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Slider Durasi */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Durasi Pemakaian Ruangan:</span>
                <span className="text-sm font-extrabold text-[#326273] bg-[#eef6f8] px-3 py-1 rounded-full border border-[#5c9ead]/30">
                  {calcHours} Jam {calcHours === 10 ? '(Sewa Harian Penuh)' : ''}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={calcHours}
                onChange={(e) => setCalcHours(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#326273]"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-1">
                <span>1 Jam</span>
                <span>3 Jam</span>
                <span>5 Jam</span>
                <span>8 Jam</span>
                <span>10 Jam (Full Day)</span>
              </div>
            </div>

            {/* Total Display */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500 font-medium">Estimasi Biaya Transparan:</span>
                <div className="text-2xl font-black text-slate-900 mt-0.5">
                  {formattedFinalTotal}
                </div>
                {discount > 0 && (
                  <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                    ✓ Hemat 15% (Diskon durasi panjang akun Member)
                  </p>
                )}
              </div>

              <button
                onClick={onExploreCatalog}
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-[#326273] text-white hover:bg-[#264c5a] shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Cek Jadwal Tanggal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Section with Filter Tabs */}
      <section id="fasilitas" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#5c9ead] uppercase tracking-wider">Kategori Ruangan</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pilihan Ruang Sesuai Skala Kebutuhan Komunitas
            </h2>
          </div>

          {/* Interactive Filter Pills */}
          <div className="flex justify-center gap-2">
            {['All', 'Open Desk', 'Meeting Pod', 'Event Space'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFacilityFilter(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  facilityFilter === cat
                    ? 'bg-[#326273] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {cat === 'All' ? 'Semua Ruang' : cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Open Desk Card */}
            {(facilityFilter === 'All' || facilityFilter === 'Open Desk') && (
              <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                <div className="h-2.5 bg-[#5c9ead]" />
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#eef6f8] text-[#326273] border border-[#5c9ead]/30">
                      Open Desk
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">Maks 2 Orang</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#326273] transition-colors">
                    Meja Kerja Fokus Personal
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Meja kerja ergonomis individu dengan stopkontak tiap meja dan Wi-Fi super cepat untuk coding, skripsi, atau remote working.
                  </p>
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2"><Wifi className="w-4 h-4 text-[#5c9ead]" /> Wi-Fi 100Mbps Dedicated</div>
                    <div className="flex items-center gap-2"><Coffee className="w-4 h-4 text-[#5c9ead]" /> Free Flow Kopi & Air Mineral</div>
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#5c9ead]" /> Colokan Listrik Ergonomis</div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">TARIF SEWA</span>
                    <span className="text-base font-extrabold text-slate-900">
                      Rp 15.000 <span className="text-xs font-normal text-slate-500">/jam</span>
                    </span>
                  </div>
                  <button onClick={onExploreCatalog} className="text-xs font-bold text-[#326273] hover:underline flex items-center gap-1">
                    Cek Slot <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Meeting Pod Card */}
            {(facilityFilter === 'All' || facilityFilter === 'Meeting Pod') && (
              <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                <div className="h-2.5 bg-[#326273]" />
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-[#326273] border border-slate-200">
                      Meeting Pod
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">4 - 8 Orang</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#326273] transition-colors">
                    Ruang Rapat Kedap Suara
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Pod akustik ber-AC dilengkapi Smart TV Display HDMI dan whiteboard. Sangat ideal untuk meeting tim, sprint review, atau wawancara kerja.
                  </p>
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#326273]" /> Akustik Kedap Suara & AC Dingin</div>
                    <div className="flex items-center gap-2"><Monitor className="w-4 h-4 text-[#326273]" /> Smart TV 43" & HDMI Adapter</div>
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#326273]" /> Magnetic Whiteboard + Spidol</div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">TARIF SEWA</span>
                    <span className="text-base font-extrabold text-slate-900">
                      Rp 50.000 <span className="text-xs font-normal text-slate-500">/jam</span>
                    </span>
                  </div>
                  <button onClick={onExploreCatalog} className="text-xs font-bold text-[#326273] hover:underline flex items-center gap-1">
                    Cek Slot <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Event Space Card */}
            {(facilityFilter === 'All' || facilityFilter === 'Event Space') && (
              <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                <div className="h-2.5 bg-[#e39774]" />
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#fdf4f0] text-[#d58560] border border-[#e39774]/30">
                      Event Space
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">Hingga 50 Orang</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#326273] transition-colors">
                    Grand Hall Gathering Serbaguna
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Aula luas serbaguna untuk workshop, seminar, atau meetup komunitas. Dilengkapi sound system profesional (Wajib melampirkan proposal PDF).
                  </p>
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-[#e39774]" /> Wajib Lampirkan Proposal PDF</div>
                    <div className="flex items-center gap-2"><Building className="w-4 h-4 text-[#e39774]" /> Sound System & Wireless Mic</div>
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#e39774]" /> Opsi Sewa Harian Penuh (Daily)</div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">TARIF SEWA</span>
                    <span className="text-base font-extrabold text-slate-900">
                      Rp 350.000 <span className="text-xs font-normal text-slate-500">/jam</span>
                    </span>
                  </div>
                  <button onClick={onExploreCatalog} className="text-xs font-bold text-[#326273] hover:underline flex items-center gap-1">
                    Cek Slot <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials / Social Proof Section */}
      <section className="py-16 bg-[#f8fafc] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#5c9ead] uppercase tracking-wider">Testimoni Pengguna</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Dipercaya oleh Komunitas & Mahasiswa Kampus
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                  "{t.text}"
                </p>
                <div className="pt-3 border-t border-slate-100 flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-[#eef6f8] text-[#326273] font-bold text-xs flex items-center justify-center border border-[#5c9ead]/30">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{t.name}</h5>
                    <p className="text-[10px] text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive FAQ Accordion Section */}
      <section id="faq" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#5c9ead] uppercase tracking-wider flex items-center justify-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> Pertanyaan Umum
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Pertanyaan yang Sering Diajukan
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                    className="w-full p-4 sm:p-5 text-left font-bold text-slate-900 text-sm flex items-center justify-between gap-4 hover:bg-slate-100/80 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#326273]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-[#326273] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-white/90 border border-white/20">
            <span>Siap Memulai Kolaborasi?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Booking Ruang Komunitas Anda Sekarang Juga
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 max-w-xl mx-auto leading-relaxed">
            Tanpa perlu menunggu konfirmasi admin secara manual. Validasi instan bebas bentrok dengan kode reservasi langsung di layar Anda.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onExploreCatalog}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold bg-[#e39774] text-white hover:bg-[#d58560] shadow-md transition-all active:scale-95"
            >
              Mulai Pilih Ruangan
            </button>
            <button
              onClick={() => onOpenAuth('login')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-bold bg-white/10 text-white hover:bg-white/20 border border-white/30 transition-all active:scale-95"
            >
              Masuk Akun Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <img src="/logo-icon.png" alt="Logo" className="h-6 w-auto object-contain" />
            <span className="font-bold text-slate-800">Kumpul-In Community Hub</span>
          </div>
          <p>© 2026 Kumpul-In • Praktikum Rekayasa Perangkat Lunak (Bab 4: Agile & Scrum)</p>
        </div>
      </footer>
    </div>
  );
}
