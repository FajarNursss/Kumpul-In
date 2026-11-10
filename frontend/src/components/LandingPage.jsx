import React, { useState } from 'react';
import {
  Clock, ShieldCheck, ArrowRight,
  Users, Building, Coffee, Wifi, Monitor, FileText, ChevronRight,
  Sparkles, CheckCircle2, Calendar, HelpCircle, ChevronDown, Check,
  Layers, Award, Shield, User, LogOut, PhoneCall, ExternalLink, Menu, X, GraduationCap, BookOpen
} from 'lucide-react';

const ROOM_SPECS = [
  {
    category: 'Aula',
    name: 'Aula Kampus & Graha Nusantara',
    capacity: 'Hingga 300 Orang',
    statusBadge: 'Bebas Biaya (Civitas)',
    stripeColor: 'bg-[#e39774]',
    badgeStyle: 'bg-[#fdf4f0] text-[#d58560] border-[#e39774]/40',
    description: 'Aula serbaguna skala besar untuk perhelatan akbar, seminar nasional, sidang senat, dan pelantikan ormawa.',
    facilities: [
      'Sound system pro & dual wireless mic',
      'Panggung utama & podium resmi',
      'Layar proyektor besar & AC sentral',
      'Wajib melampirkan proposal kegiatan PDF',
    ],
  },
  {
    category: 'Perpustakaan',
    name: 'Ruang Diskusi Perpustakaan',
    capacity: '4 - 10 Orang',
    statusBadge: 'Bebas Biaya (Civitas)',
    stripeColor: 'bg-[#5c9ead]',
    badgeStyle: 'bg-[#eef6f8] text-[#326273] border-[#5c9ead]/40',
    description: 'Ruang diskusi kelompok dan bilik riset digital di lingkungan perpustakaan yang hening dan kondusif.',
    facilities: [
      'Akses koleksi jurnal digital internasional',
      'Koneksi Wi-Fi Eduroam kampus cepat',
      'Magnetic whiteboard + spidol diskusi',
      'Ruangan ber-AC & bebas kebisingan',
    ],
  },
  {
    category: 'Meeting Room',
    name: 'Meeting Room Dosen & Ormawa',
    capacity: '8 - 20 Orang',
    statusBadge: 'Bebas Biaya (Civitas)',
    stripeColor: 'bg-[#326273]',
    badgeStyle: 'bg-slate-100 text-[#326273] border-slate-200',
    description: 'Ruang rapat formal representatif untuk rapat koordinasi dosen, senat fakultas, BEM, dan Himpunan Mahasiswa.',
    facilities: [
      'Smart TV Display 65" & Video Conference Cam',
      'Meja konferensi ergonomis & koneksi LAN',
      'Glass whiteboard untuk notulensi visual',
      'Stopkontak modular di setiap kursi rapat',
    ],
  },
  {
    category: 'Ruang Belajar',
    name: 'Smart Classroom & Belajar Mandiri',
    capacity: '1 - 30 Orang',
    statusBadge: 'Bebas Biaya (Civitas)',
    stripeColor: 'bg-emerald-600',
    badgeStyle: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    description: 'Bilik belajar mandiri berpartisi dan smart classroom interaktif untuk fokus studi, asistensi, dan pengerjaan tugas akhir.',
    facilities: [
      'Smart board interaktif terhubung tablet',
      'Meja belajar sekat personal & lampu LED',
      'Stopkontak personal & pendingin ruangan',
      'Bebas gangguan untuk produktivitas akademik',
    ],
  },
];

const FAQS = [
  {
    q: 'Bagaimana sistem Kumpul-In mencegah jadwal peminjaman bentrok (Double Booking)?',
    a: 'Sistem Kumpul-In menerapkan validasi interval matematis ketat di tingkat database: (start_baru < end_terdaftar) && (end_baru > start_terdaftar). Validasi ini dibungkus dalam Database Atomic Transaction (DB::transaction). Apabila dua civitas mengajukan peminjaman pada detik yang sama, sistem memastikan hanya transaksi pertama yang diterima dan jadwal terkunci secara otomatis.',
  },
  {
    q: 'Apakah peminjaman fasilitas ruangan di kampus dikenakan biaya?',
    a: 'Tidak. Seluruh fasilitas (Aula, Perpustakaan, Meeting Room, Ruang Belajar) disediakan bebas biaya (Gratis) bagi civitas akademika kampus (Mahasiswa, Dosen, Tenaga Kependidikan, dan Ormawa) untuk keperluan akademik, penelitian, dan kegiatan kemahasiswaan resmi.',
  },
  {
    q: 'Mengapa peminjaman Aula kampus mewajibkan unggah proposal PDF?',
    a: 'Aula kampus merupakan fasilitas berkapasitas besar. Biro Sarana Prasarana Kampus perlu memverifikasi susunan kegiatan, penanggung jawab, serta izin pimpinan kampus melalui dokumen proposal kegiatan resmi berformat PDF sebelum peminjaman disetujui.',
  },
  {
    q: 'Berapa banyak kuota peminjaman yang dimiliki setiap mahasiswa?',
    a: 'Setiap akun mahasiswa mendapatkan kuota awal sebanyak 5 slot peminjaman aktif. Kuota akan otomatis dipulihkan kembali setelah sesi peminjaman selesai atau jika reservasi dibatalkan oleh Biro Sarana Kampus.',
  },
];

export default function LandingPage({ onExploreCatalog, onOpenAuth, currentUser, onLogout }) {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-[#326273] selection:text-white">
      {/* System Status Topbar */}
      <div className="bg-[#326273] text-white py-2 px-4 text-center text-xs font-semibold tracking-wide flex items-center justify-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" aria-hidden="true" />
        <span>Sistem Informasi Peminjaman Fasilitas & Ruang Kampus Terpadu</span>
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo */}
            <a
              href="#main-content"
              className="flex items-center space-x-3 cursor-pointer py-1 focus-visible:ring-2 focus-visible:ring-[#326273] focus-visible:outline-none rounded-xl"
              aria-label="Kumpul-In Kampus Beranda"
            >
              <img
                src="/logo-icon.png"
                alt="Logo Kumpul-In"
                className="h-10 sm:h-11 w-auto object-contain hover:opacity-95 transition-opacity"
              />
              <div className="flex flex-col select-none">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl font-black text-[#326273] tracking-tight leading-none">
                    Kumpul-In
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#e39774]/20 text-[#d58560] uppercase tracking-wider">
                    Kampus
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-[#5c9ead] tracking-normal leading-tight mt-0.5">
                  Sistem Peminjaman Fasilitas Kampus
                </span>
              </div>
            </a>

            {/* Desktop Menu Links - Strictly Smooth Scroll-Down Anchors */}
            <nav className="hidden md:flex items-center space-x-7 text-sm font-semibold text-slate-600" aria-label="Menu Navigasi Halaman">
              <a
                href="#hero"
                className="hover:text-[#326273] transition-colors focus-visible:ring-2 focus-visible:ring-[#326273] rounded-md px-1 py-0.5"
              >
                Beranda
              </a>
              <a
                href="#fasilitas"
                className="hover:text-[#326273] transition-colors focus-visible:ring-2 focus-visible:ring-[#326273] rounded-md px-1 py-0.5"
              >
                Pilihan Fasilitas
              </a>
              <a
                href="#alur-booking"
                className="hover:text-[#326273] transition-colors focus-visible:ring-2 focus-visible:ring-[#326273] rounded-md px-1 py-0.5"
              >
                Alur Peminjaman
              </a>
              <a
                href="#faq"
                className="hover:text-[#326273] transition-colors focus-visible:ring-2 focus-visible:ring-[#326273] rounded-md px-1 py-0.5"
              >
                Tanya Jawab (FAQ)
              </a>
            </nav>

            {/* Action Buttons: Portal Peminjaman & Auth (Page Transitions) */}
            <div className="hidden sm:flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => onExploreCatalog()}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#326273] text-white hover:bg-[#264c5a] shadow-sm transition-all flex items-center space-x-1.5 focus-visible:ring-2 focus-visible:ring-[#326273]"
              >
                <span>Portal Peminjaman</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>

              {currentUser ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 bg-slate-100 py-1.5 px-3 rounded-2xl border border-slate-200 text-xs">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold ${
                        currentUser.role === 'admin' ? 'bg-[#326273]' : 'bg-[#5c9ead]'
                      }`}
                    >
                      {currentUser.role === 'admin' ? (
                        <Shield className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        <User className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                    </div>
                    <div className="flex flex-col text-left leading-none">
                      <span className="font-bold text-slate-800 max-w-[120px] truncate">
                        {currentUser.name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {currentUser.role === 'admin' ? 'Biro Sarana (Admin)' : 'Civitas Mahasiswa'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onLogout}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors focus-visible:ring-2 focus-visible:ring-rose-500"
                    title="Keluar dari akun"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenAuth('login')}
                    className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-[#326273] hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-[#326273]"
                  >
                    Masuk
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenAuth('register')}
                    className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#e39774] text-white hover:bg-[#d58560] shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-[#e39774]"
                  >
                    Daftar
                  </button>
                </>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex sm:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Buka menu navigasi"
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#326273]"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
            <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
              <a
                href="#hero"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                Beranda
              </a>
              <a
                href="#fasilitas"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                Pilihan Fasilitas
              </a>
              <a
                href="#alur-booking"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                Alur Peminjaman
              </a>
              <a
                href="#faq"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                Tanya Jawab (FAQ)
              </a>
            </nav>
            <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onExploreCatalog();
                }}
                className="w-full py-2.5 rounded-xl text-center text-xs font-bold bg-[#326273] text-white shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Buka Portal Peminjaman</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              {currentUser ? (
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold ${
                        currentUser.role === 'admin' ? 'bg-[#326273]' : 'bg-[#5c9ead]'
                      }`}
                    >
                      {currentUser.role === 'admin' ? (
                        <Shield className="w-3.5 h-3.5" />
                      ) : (
                        <User className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{currentUser.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {currentUser.role === 'admin' ? 'Biro Sarana (Admin)' : 'Civitas Mahasiswa'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="px-2.5 py-1 rounded-lg text-rose-600 bg-rose-50 text-xs font-bold"
                  >
                    Keluar
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAuth('login');
                    }}
                    className="w-full py-2 rounded-xl text-center text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
                  >
                    Masuk Portal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAuth('register');
                    }}
                    className="w-full py-2 rounded-xl text-center text-xs font-bold bg-[#e39774] text-white shadow-sm hover:bg-[#d58560]"
                  >
                    Daftar Akun
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Body */}
      <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
        {/* Hero Section */}
        <section id="hero" aria-labelledby="hero-heading" className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#eef6f8] border border-[#5c9ead]/40 text-[#326273] text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#5c9ead]" aria-hidden="true" />
                  <span>Portal Peminjaman Fasilitas Kampus Terpadu Real-Time</span>
                </div>

                <h1 id="hero-heading" className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  Peminjaman Aula, Perpustakaan, Meeting Room, & Ruang Belajar, <span className="text-[#326273]">Bebas Jadwal Bentrok</span>.
                </h1>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Layanan terpadu bagi civitas akademika untuk meminjam ruang kuliah, diskusi kelompok di perpustakaan, rapat kepengurusan ormawa, hingga aula serbaguna kampus. Validasi slot waktu instan anti bentrok tanpa dipungut biaya.
                </p>

                {/* Primary CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onExploreCatalog}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-bold bg-[#326273] text-white hover:bg-[#264c5a] shadow-md transition-all flex items-center justify-center space-x-2 focus-visible:ring-2 focus-visible:ring-[#326273] focus-visible:outline-none"
                  >
                    <span>Buka Katalog Fasilitas Kampus</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenAuth('login')}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center space-x-2 focus-visible:ring-2 focus-visible:ring-[#326273] focus-visible:outline-none"
                  >
                    <GraduationCap className="w-4 h-4 text-[#e39774]" aria-hidden="true" />
                    <span>Masuk Portal Mahasiswa</span>
                  </button>
                </div>

                {/* Technical System Specs */}
                <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-100 max-w-lg mx-auto lg:mx-0 text-left">
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-[#326273]">10 Sesi</div>
                    <div className="text-[11px] text-slate-500 font-medium">08:00 - 18:00 WIB</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-[#326273]">Bebas Biaya</div>
                    <div className="text-[11px] text-slate-500 font-medium">Civitas Akademika</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-[#e39774]">Format Bukti</div>
                    <div className="text-[11px] text-slate-500 font-medium">KMP-YYYYMMDD-***</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Preview Card */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-slate-200 space-y-5">
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <img src="/logo-icon.png" alt="" className="h-8 w-auto object-contain" aria-hidden="true" />
                      <div>
                        <h2 className="font-extrabold text-slate-900 text-sm">Ruang Diskusi Perpustakaan Lt. 2</h2>
                        <p className="text-[11px] text-slate-500">Kapasitas 8 Orang • Bebas Biaya (Civitas)</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Tersedia Siap Pakai
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
                        <span className="text-[10px] text-emerald-700 font-bold">Kosong</span>
                      </div>
                      <div className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/70 text-rose-700 font-medium flex items-center justify-between">
                        <span>10:00 - 11:00</span>
                        <span className="text-[10px] text-rose-700 font-bold">Terpakai</span>
                      </div>
                      <div className="p-2.5 rounded-xl border border-[#326273] bg-[#326273] text-white font-medium flex items-center justify-between shadow-xs">
                        <span>11:00 - 12:00</span>
                        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">Dipilih</span>
                      </div>
                      <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-800 font-medium flex items-center justify-between">
                        <span>13:00 - 14:00</span>
                        <span className="text-[10px] text-emerald-700 font-bold">Kosong</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Code Voucher Output Banner */}
                  <div className="p-4 rounded-2xl bg-[#fdf4f0] border border-[#e39774]/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Surat Bukti Peminjaman Kampus
                      </span>
                      <div className="text-sm font-mono font-black text-[#326273]">
                        KMP-20261109-8421
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-white text-[#d58560] border border-[#e39774]/30 shadow-xs">
                      Tervalidasi Resmi
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
                Fasilitas Ruang Kampus
              </span>
              <h2 id="fasilitas-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Pilihan Ruang Sesuai Skala Kegiatan Akademik
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Tersedia empat kategori fasilitas kampus yang siap dipinjam oleh civitas akademika tanpa pungutan biaya.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

                    <h3 className="text-base font-bold text-slate-900">
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
                      <span className="text-[10px] text-emerald-700 block font-bold uppercase">Status Layanan</span>
                      <span className="text-xs font-extrabold text-slate-900">
                        {room.statusBadge}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onExploreCatalog(room.category)}
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
                Alur Peminjaman
              </span>
              <h2 id="alur-heading" className="text-2xl font-extrabold text-slate-900">
                4 Langkah Peminjaman Fasilitas Kampus
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2.5">
                <span className="w-8 h-8 rounded-lg bg-[#326273] text-white font-bold text-xs flex items-center justify-center">1</span>
                <h3 className="text-sm font-bold text-slate-900">Pilih Fasilitas & Tanggal</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pilih ruangan (Aula, Perpustakaan, Meeting Room, Ruang Belajar) dan tanggal peminjaman.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2.5">
                <span className="w-8 h-8 rounded-lg bg-[#5c9ead] text-white font-bold text-xs flex items-center justify-center">2</span>
                <h3 className="text-sm font-bold text-slate-900">Pilih Sesi Jam / Seharian</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pilih sesi per jam yang kosong (08:00 - 18:00 WIB), atau opsi seharian penuh untuk kegiatan ormawa.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2.5">
                <span className="w-8 h-8 rounded-lg bg-[#e39774] text-white font-bold text-xs flex items-center justify-center">3</span>
                <h3 className="text-sm font-bold text-slate-900">Unggah Proposal (Khusus Aula)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Khusus peminjaman Aula kampus, lampirkan dokumen proposal atau surat izin ormawa format PDF.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2.5">
                <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">4</span>
                <h3 className="text-sm font-bold text-slate-900">Terima Bukti Peminjaman</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sistem langsung menerbitkan bukti peminjaman sah berformat kode unik yang dapat dicetak atau diunduh.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technical FAQ Accordion Section */}
        <section id="faq" aria-labelledby="faq-heading" className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-[#5c9ead] uppercase tracking-wider">
                Pusat Informasi
              </span>
              <h2 id="faq-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Pertanyaan yang Sering Diajukan (FAQ)
              </h2>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 overflow-hidden bg-white transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? -1 : idx)}
                    className="w-full p-5 text-left flex items-center justify-between space-x-4 hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-[#326273] focus-visible:outline-none"
                    aria-expanded={openFaqIndex === idx}
                  >
                    <span className="font-bold text-slate-900 text-sm">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        openFaqIndex === idx ? 'rotate-180 text-[#326273]' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {openFaqIndex === idx && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
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
              <span className="font-extrabold text-[#326273] text-sm leading-tight">Kumpul-In Kampus</span>
              <span className="text-[10px] text-slate-400 font-medium">Sistem Peminjaman Fasilitas Kampus Terpadu</span>
            </div>
          </div>
          <p>© 2026 Kumpul-In Kampus. Hak cipta dilindungi undang-undang.</p>
        </div>
      </footer>
    </div>
  );
}
