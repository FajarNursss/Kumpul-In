import React, { useState } from 'react';
import {
  Clock, ShieldCheck, ArrowRight,
  Users, Building, Coffee, Wifi, Monitor, FileText, ChevronRight,
  Sparkles, CheckCircle2, Calendar, HelpCircle, ChevronDown, Check,
  Layers, Award, Shield, PhoneCall, ExternalLink, Menu, X
} from 'lucide-react';

const ROOM_SPECS = [
  {
    category: 'Open Desk',
    name: 'Meja Kerja Fokus Personal',
    capacity: '1 - 2 Orang',
    rate: 'Rp 15.000',
    rateUnit: '/jam',
    stripeColor: 'bg-[#5c9ead]',
    badgeStyle: 'bg-[#eef6f8] text-[#326273] border-[#5c9ead]/40',
    description: 'Area kerja hening individu dengan meja ergonomis dan stopkontak terdedikasi.',
    facilities: [
      'Stopkontak tiap meja kerja',
      'Wi-Fi berkecepatan 100 Mbps',
      'Air mineral & area pantry',
      'Akses jam kerja 08:00 - 18:00',
    ],
  },
  {
    category: 'Meeting Pod',
    name: 'Ruang Rapat Kedap Suara',
    capacity: '4 - 8 Orang',
    rate: 'Rp 50.000',
    rateUnit: '/jam',
    stripeColor: 'bg-[#326273]',
    badgeStyle: 'bg-slate-100 text-[#326273] border-slate-200',
    description: 'Ruang diskusi tertutup dengan isolasi akustik untuk rapat tim atau interview terarah.',
    facilities: [
      'Akustik kedap suara ber-AC',
      'Smart TV Display 43" & kabel HDMI',
      'Magnetic whiteboard + spidol',
      'Meja bundar kolaborasi tim',
    ],
  },
  {
    category: 'Event Space',
    name: 'Grand Hall Serbaguna',
    capacity: 'Hingga 50 Orang',
    rate: 'Rp 350.000',
    rateUnit: '/jam',
    stripeColor: 'bg-[#e39774]',
    badgeStyle: 'bg-[#fdf4f0] text-[#d58560] border-[#e39774]/40',
    description: 'Aula berkapasitas besar untuk workshop, seminar, dan gathering komunitas resmi.',
    facilities: [
      'Sound system & dual wireless microphone',
      'Proyektor & layar presentasi lebar',
      'Opsi sewa harian penuh (Daily 08:00 - 18:00)',
      'Wajib melampirkan proposal kegiatan PDF',
    ],
  },
];

const FAQS = [
  {
    q: 'Bagaimana sistem Kumpul-In mencegah jadwal bentrok (Double Booking)?',
    a: 'Sistem Kumpul-In menerapkan validasi interval matematis ketat di tingkat database: (start_baru < end_terdaftar) && (end_baru > start_terdaftar). Validasi ini dibungkus dalam Database Atomic Transaction (DB::transaction). Apabila dua pengguna melakukan checkout slot pada detik yang sama, hanya transaksi pertama yang diterima dan transaksi kedua otomatis ditolak dengan pesan error yang jelas.',
  },
  {
    q: 'Apa perbedaan izin akses akun Guest dan akun Member?',
    a: 'Akun Guest ditujukan untuk pengguna umum dengan jatah kuota 2 slot aktif dan hanya dapat memesan dengan durasi per jam. Akun Member ditujukan untuk anggota komunitas terverifikasi dengan jatah kuota hingga 10 slot serta memiliki hak istimewa memesan sewa harian penuh (Daily) dari pukul 08:00 hingga 18:00 WIB.',
  },
  {
    q: 'Mengapa pemesanan Event Space mewajibkan unggah proposal PDF?',
    a: 'Event Space merupakan fasilitas berskala besar dengan kapasitas hingga 50 orang. Sistem mewajibkan pengelola memverifikasi susunan acara dan kebutuhan peralatan teknis melalui dokumen proposal kegiatan format PDF (maksimal 2MB) sebelum status reservasi diterbitkan.',
  },
  {
    q: 'Bagaimana alur pembatalan reservasi oleh Administrator?',
    a: 'Administrator memiliki kendali penuh melalui Dashboard Admin untuk membatalkan reservasi jika terjadi kendala teknis darurat. Saat admin membatalkan suatu booking, sistem secara otomatis mengembalikan (restore) kuota reservasi ke akun pengguna yang bersangkutan.',
  },
];

export default function LandingPage({ onExploreCatalog, onOpenAuth }) {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-[#326273] selection:text-white">
      {/* System Status Topbar */}
      <div className="bg-[#326273] text-white py-2 px-4 text-center text-xs font-semibold tracking-wide flex items-center justify-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" aria-hidden="true" />
        <span>Sistem Reservasi Community Hub & Coworking Space Terpadu</span>
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo */}
            <a
              href="#main-content"
              className="flex items-center space-x-3 cursor-pointer py-1 focus-visible:ring-2 focus-visible:ring-[#326273] focus-visible:outline-none rounded-xl"
              aria-label="Kumpul-In Community Hub Beranda"
            >
              <img
                src="/logo-icon.png"
                alt="Logo Kumpul-In"
                className="h-9 sm:h-10 w-auto object-contain hover:opacity-90 transition-opacity"
              />
              <div className="flex flex-col select-none">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl font-black text-[#326273] tracking-tight leading-none">
                    Kumpul-In
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#e39774]/20 text-[#d58560] uppercase tracking-wider">
                    Hub
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 tracking-normal leading-tight mt-0.5">
                  Community Hub & Coworking
                </span>
              </div>
            </a>

            {/* Desktop Menu Links */}
            <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600" aria-label="Menu Utama">
              <a href="#fasilitas" className="hover:text-[#326273] transition-colors focus-visible:ring-2 focus-visible:ring-[#326273] rounded-md px-1 py-0.5">
                Pilihan Ruang
              </a>
              <a href="#alur-booking" className="hover:text-[#326273] transition-colors focus-visible:ring-2 focus-visible:ring-[#326273] rounded-md px-1 py-0.5">
                Alur Reservasi
              </a>
              <a href="#faq" className="hover:text-[#326273] transition-colors focus-visible:ring-2 focus-visible:ring-[#326273] rounded-md px-1 py-0.5">
                Tanya Jawab (FAQ)
              </a>
              <button
                type="button"
                onClick={onExploreCatalog}
                className="hover:text-[#326273] transition-colors focus-visible:ring-2 focus-visible:ring-[#326273] rounded-md px-1 py-0.5 font-bold text-[#326273]"
              >
                Katalog Lengkap
              </button>
            </nav>

            {/* Auth Actions */}
            <div className="hidden sm:flex items-center space-x-3">
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-[#326273] hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-[#326273] focus-visible:outline-none"
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#e39774] text-white hover:bg-[#d58560] shadow-sm transition-all flex items-center space-x-1.5 focus-visible:ring-2 focus-visible:ring-[#326273] focus-visible:outline-none"
              >
                <span>Daftar Akun</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex sm:hidden items-center">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#326273]"
                aria-label={isMobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg">
            <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-700" aria-label="Menu Mobile">
              <a
                href="#fasilitas"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-slate-100"
              >
                Pilihan Ruang & Fasilitas
              </a>
              <a
                href="#alur-booking"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-slate-100"
              >
                Alur Reservasi
              </a>
              <a
                href="#faq"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-xl hover:bg-slate-100"
              >
                Tanya Jawab (FAQ)
              </a>
            </nav>

            <div className="pt-2 border-t border-slate-100 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAuth('login');
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 text-center"
              >
                Masuk
              </button>
              <button
                type="button"
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

      {/* Main Content Landmark for Accessibility */}
      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section aria-labelledby="hero-heading" className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#eef6f8] border border-[#5c9ead]/40 text-[#326273] text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#5c9ead]" aria-hidden="true" />
                  <span>Sistem Informasi Reservasi Ruang Komunitas Real-Time</span>
                </div>

                <h1 id="hero-heading" className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  Pemesanan Meja & Ruang Komunitas, <span className="text-[#326273]">Bebas Jadwal Bentrok</span>.
                </h1>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Sistem reservasi transparan untuk meja kerja personal, meeting pod kedap suara, hingga aula gathering 50 orang. Validasi slot waktu berbasis database atomic transaction dengan penerbitan bukti kode booking instan.
                </p>

                {/* Primary CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onExploreCatalog}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-bold bg-[#326273] text-white hover:bg-[#264c5a] shadow-md transition-all flex items-center justify-center space-x-2 focus-visible:ring-2 focus-visible:ring-[#326273] focus-visible:outline-none"
                  >
                    <span>Buka Katalog & Jadwal Slot</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenAuth('login')}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center space-x-2 focus-visible:ring-2 focus-visible:ring-[#326273] focus-visible:outline-none"
                  >
                    <Sparkles className="w-4 h-4 text-[#e39774]" aria-hidden="true" />
                    <span>Masuk ke Akun Anda</span>
                  </button>
                </div>

                {/* Technical System Specs */}
                <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-100 max-w-lg mx-auto lg:mx-0 text-left">
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-[#326273]">10 Sesi</div>
                    <div className="text-[11px] text-slate-500 font-medium">08:00 - 18:00 WIB</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-[#326273]">Anti Bentrok</div>
                    <div className="text-[11px] text-slate-500 font-medium">Formula Interval Valid</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-[#e39774]">Format Kode</div>
                    <div className="text-[11px] text-slate-500 font-medium">CHB-YYYYMMDD-***</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Grounded Visual Preview Card */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-slate-200 space-y-5">
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <img src="/logo-icon.png" alt="" className="h-8 w-auto object-contain" aria-hidden="true" />
                      <div>
                        <h2 className="font-extrabold text-slate-900 text-sm">Meeting Pod Alpha</h2>
                        <p className="text-[11px] text-slate-500">Kapasitas 4 Orang • Rp 50.000 / jam</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Aktif Siap Pakai
                    </span>
                  </div>

                  {/* Operational Time Slots Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <span>Status Sesi Jam Hari Ini:</span>
                      <span className="text-slate-400">Total 10 Sesi Tersedia</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-800 font-medium flex items-center justify-between">
                        <span>09:00 - 10:00</span>
                        <span className="text-[10px] text-emerald-700 font-bold">Tersedia</span>
                      </div>
                      <div className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/70 text-rose-700 font-medium flex items-center justify-between">
                        <span>10:00 - 11:00</span>
                        <span className="text-[10px] text-rose-700 font-bold">Terisi</span>
                      </div>
                      <div className="p-2.5 rounded-xl border border-[#326273] bg-[#326273] text-white font-medium flex items-center justify-between shadow-xs">
                        <span>11:00 - 12:00</span>
                        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">Dipilih</span>
                      </div>
                      <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-800 font-medium flex items-center justify-between">
                        <span>13:00 - 14:00</span>
                        <span className="text-[10px] text-emerald-700 font-bold">Tersedia</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Code Voucher Output Banner */}
                  <div className="p-4 rounded-2xl bg-[#fdf4f0] border border-[#e39774]/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Penerbitan Kode Bukti Sah
                      </span>
                      <div className="text-sm font-mono font-black text-[#326273]">
                        CHB-20261109-8421
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-white text-[#d58560] border border-[#e39774]/30 shadow-xs">
                      Tervalidasi Sistem
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Room Categories & Specifications Section */}
        <section id="fasilitas" aria-labelledby="fasilitas-heading" className="py-16 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-[#5c9ead] uppercase tracking-wider">
                Spesifikasi Fasilitas Hub
              </span>
              <h2 id="fasilitas-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Pilihan Ruang Sesuai Skala Kebutuhan Kegiatan
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Setiap ruangan dikelola secara terjadwal dengan tarif transparan dan kelengkapan fasilitas standar industri.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ROOM_SPECS.map((room, idx) => (
                <article
                  key={idx}
                  className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className={`h-2.5 ${room.stripeColor}`} aria-hidden="true" />
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${room.badgeStyle}`}>
                        {room.category}
                      </span>
                      <div className="flex items-center text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200/80 px-2.5 py-0.5 rounded-full">
                        <Users className="w-3.5 h-3.5 mr-1 text-slate-400" aria-hidden="true" />
                        <span>{room.capacity}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">
                      {room.name}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {room.description}
                    </p>

                    <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      {room.facilities.map((f, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#326273] shrink-0" aria-hidden="true" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Tarif Sewa</span>
                      <span className="text-base font-extrabold text-slate-900">
                        {room.rate} <span className="text-xs font-normal text-slate-500">{room.rateUnit}</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={onExploreCatalog}
                      className="text-xs font-bold text-[#326273] hover:underline flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-[#326273] rounded-md px-1 py-0.5"
                    >
                      <span>Cek Jadwal</span>
                      <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Standard Operational Procedure / Booking Flow Section */}
        <section id="alur-booking" aria-labelledby="alur-heading" className="py-16 bg-[#f8fafc] border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs font-bold text-[#5c9ead] uppercase tracking-wider">
                Alur Operasional
              </span>
              <h2 id="alur-heading" className="text-2xl font-extrabold text-slate-900">
                4 Langkah Pemesanan Ruangan
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2.5">
                <span className="w-8 h-8 rounded-lg bg-[#326273] text-white font-bold text-xs flex items-center justify-center">1</span>
                <h3 className="text-sm font-bold text-slate-900">Pilih Ruang & Tanggal</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pilih ruangan di katalog sesuai kapasitas peserta, lalu tentukan tanggal reservasi yang dituju.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2.5">
                <span className="w-8 h-8 rounded-lg bg-[#5c9ead] text-white font-bold text-xs flex items-center justify-center">2</span>
                <h3 className="text-sm font-bold text-slate-900">Pilih Slot Jam</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pilih slot hijau per jam (08:00 - 18:00 WIB), atau pilih opsi sewa harian (Daily) khusus akun Member.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2.5">
                <span className="w-8 h-8 rounded-lg bg-[#e39774] text-white font-bold text-xs flex items-center justify-center">3</span>
                <h3 className="text-sm font-bold text-slate-900">Lampirkan Dokumen</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Khusus pemesanan Event Space, unggah proposal PDF kegiatan (maks 2MB) untuk verifikasi pengelola.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2.5">
                <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">4</span>
                <h3 className="text-sm font-bold text-slate-900">Simpan Bukti Booking</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sistem langsung menerbitkan kode booking unik. Voucher resmi dapat dicetak atau diunduh kapan saja.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technical FAQ Accordion Section */}
        <section id="faq" aria-labelledby="faq-heading" className="py-16 bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-[#5c9ead] uppercase tracking-wider flex items-center justify-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" /> Tanya Jawab Teknis & Regulasi
              </span>
              <h2 id="faq-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Pertanyaan yang Sering Diajukan
              </h2>
            </div>

            <div className="space-y-3" role="region" aria-label="Accordion Pertanyaan">
              {FAQS.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                const questionId = `faq-q-${index}`;
                const answerId = `faq-a-${index}`;
                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden"
                  >
                    <button
                      type="button"
                      id={questionId}
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                      className="w-full p-4 sm:p-5 text-left font-bold text-slate-900 text-sm flex items-center justify-between gap-4 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-[#326273] focus-visible:outline-none"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#326273]' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>

                    {isOpen && (
                      <div
                        id={answerId}
                        role="region"
                        aria-labelledby={questionId}
                        className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white"
                      >
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <img src="/logo-icon.png" alt="Logo Kumpul-In" className="h-7 w-auto object-contain" aria-hidden="true" />
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-[#326273] text-sm leading-tight">Kumpul-In Hub</span>
              <span className="text-[10px] text-slate-400 font-medium">Sistem Reservasi Komunitas Terpadu</span>
            </div>
          </div>
          <p>© 2026 Kumpul-In Community Hub. Hak cipta dilindungi undang-undang.</p>
        </div>
      </footer>
    </div>
  );
}
