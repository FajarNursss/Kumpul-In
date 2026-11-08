import React from 'react';
import {
  Sparkles, Calendar, Clock, ShieldCheck, CheckCircle2, ArrowRight,
  Users, Building, Coffee, Wifi, Monitor, FileText, ChevronRight
} from 'lucide-react';

export default function LandingPage({ onExploreCatalog, onOpenAuth }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand with Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img
                src="/logo.jpg"
                alt="Logo Kumpul-In"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-xl shadow-md border border-slate-200/50"
              />
              <div>
                <span className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 tracking-tight">
                  Kumpul-In
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 uppercase tracking-wider">
                  Community Hub
                </span>
              </div>
            </div>

            {/* Menu Links */}
            <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
              <a href="#fitur" className="hover:text-blue-600 transition-colors">Fitur Unggulan</a>
              <a href="#fasilitas" className="hover:text-blue-600 transition-colors">Kategori Ruangan</a>
              <a href="#cara-kerja" className="hover:text-blue-600 transition-colors">Cara Reservasi</a>
              <button onClick={onExploreCatalog} className="hover:text-blue-600 transition-colors">
                Katalog Langsung
              </button>
            </nav>

            {/* Auth Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors"
              >
                Masuk
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5"
              >
                <span>Daftar Akun</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & Action */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold shadow-sm">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Sistem Reservasi Ruang Komunitas Real-Time</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Kumpul Lebih Mudah,{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700">
                  Tanpa Jadwal Bentrok.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Kumpul-In menyediakan transparansi ketersediaan ruang kerja komunal secara langsung. Pilih Open Desk, Meeting Pod, hingga Grand Hall Event Space dengan konfirmasi kode booking instan.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={onExploreCatalog}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-sm font-black bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 group"
                >
                  <span>Mulai Reservasi Sekarang</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onOpenAuth('login')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-sm font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm transition-all flex items-center justify-center space-x-2"
                >
                  <span>Coba Demo Cepat (1-Klik)</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <div className="text-lg sm:text-2xl font-black text-slate-900">100%</div>
                  <div className="text-[11px] text-slate-500 font-medium">Bebas Double Booking</div>
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-black text-slate-900">08:00-18:00</div>
                  <div className="text-[11px] text-slate-500 font-medium">Jam Operasional Penuh</div>
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-black text-slate-900">Instant</div>
                  <div className="text-[11px] text-slate-500 font-medium">Penerbitan Kode Booking</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 space-y-6">
                {/* Visual Header */}
                <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                  <img src="/logo.jpg" alt="Logo" className="w-12 h-12 object-contain rounded-2xl shadow-md border border-slate-100" />
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">Kumpul-In Hub</h4>
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Sistem Slot Aktif Real-Time
                    </span>
                  </div>
                </div>

                {/* Simulated Slot Preview */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Simulasi Slot Kalender
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center justify-between">
                      <span>09:00 - 10:00</span>
                      <span className="text-[10px] bg-emerald-200/60 px-1.5 py-0.5 rounded">Tersedia</span>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold flex items-center justify-between">
                      <span>10:00 - 11:00</span>
                      <span className="text-[10px] bg-rose-200/60 px-1.5 py-0.5 rounded">Terisi</span>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-between shadow-sm">
                      <span>11:00 - 12:00</span>
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Dipilih</span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center justify-between">
                      <span>13:00 - 14:00</span>
                      <span className="text-[10px] bg-emerald-200/60 px-1.5 py-0.5 rounded">Tersedia</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Code Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Kode Booking Diterbitkan</span>
                  <div className="text-base font-mono font-black text-blue-600">CHB-20261110-8491</div>
                  <p className="text-[11px] text-slate-500">Konfirmasi instan ke akun pengguna</p>
                </div>
              </div>

              {/* Background Glow */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Mengapa Kumpul-In?</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Dirancang untuk Menyelesaikan Masalah Reservasi Komunitas
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Menghilangkan prosedur pemesanan manual yang lambat dan rentan jadwal tumpang tindih.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Transparansi Ketersediaan Slot</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Slot waktu 08:00–18:00 terpampang jelas dengan pemisahan warna kontras (Hijau = Tersedia, Merah = Terisi) tanpa perlu konfirmasi manual berulang.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Anti Tabrakan Jadwal (Collision Guard)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Algoritma matematis di backend secara otomatis memvalidasi irisan jam dan langsung mengunci slot seketika agar tidak terjadi double booking.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-violet-300 hover:shadow-lg transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Fleksibilitas Sewa Per Jam & Harian</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pilih sewa fleksibel per jam untuk meja kerja atau sewa seharian penuh (*Daily*) untuk Grand Hall Event Space dengan lampiran proposal PDF.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities / Room Category Section */}
      <section id="fasilitas" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Kategori Ruangan</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Pilihan Ruang Sesuai Skala Kebutuhan Anda
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Mulai dari kebutuhan fokus individual hingga event gathering akbar komunitas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Open Desk */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="h-3 bg-emerald-500" />
              <div className="p-6 space-y-4">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Open Desk
                </span>
                <h3 className="text-xl font-bold text-slate-900">Meja Kerja Fokus</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ruang kerja personal dengan suasana hening, colokan listrik di setiap meja, dan akses Wi-Fi berkecepatan tinggi.
                </p>
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2"><Users className="w-4 h-4 text-emerald-600" /> Kapasitas 1 - 2 Orang</div>
                  <div className="flex items-center gap-2"><Wifi className="w-4 h-4 text-emerald-600" /> Internet Cepat 100 Mbps</div>
                  <div className="flex items-center gap-2"><Coffee className="w-4 h-4 text-emerald-600" /> Free Flow Air Minum & Kopi</div>
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Mulai Dari</span>
                  <span className="text-base font-extrabold text-slate-900">Rp 15.000 <span className="text-xs font-normal text-slate-500">/jam</span></span>
                </div>
                <button onClick={onExploreCatalog} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  Pilih <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Meeting Pod */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="h-3 bg-blue-600" />
              <div className="p-6 space-y-4">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Meeting Pod
                </span>
                <h3 className="text-xl font-bold text-slate-900">Ruang Diskusi Kedap Suara</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dilengkapi Smart TV display, white board, dan isolasi akustik untuk rapat tim, presentasi, dan interview.
                </p>
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2"><Users className="w-4 h-4 text-blue-600" /> Kapasitas 4 - 8 Orang</div>
                  <div className="flex items-center gap-2"><Monitor className="w-4 h-4 text-blue-600" /> Display Screen & HDMI</div>
                  <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-blue-600" /> Privasi Kedap Suara</div>
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Mulai Dari</span>
                  <span className="text-base font-extrabold text-slate-900">Rp 50.000 <span className="text-xs font-normal text-slate-500">/jam</span></span>
                </div>
                <button onClick={onExploreCatalog} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  Pilih <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Event Space */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="h-3 bg-purple-600" />
              <div className="p-6 space-y-4">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  Event Space
                </span>
                <h3 className="text-xl font-bold text-slate-900">Grand Hall Serbaguna</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Aula luas untuk seminar, workshop teknologi, dan meetup komunitas besar. Mendukung sewa seharian penuh (*Daily*).
                </p>
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2"><Users className="w-4 h-4 text-purple-600" /> Kapasitas s.d 50 Orang</div>
                  <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-purple-600" /> Wajib Lampirkan Proposal PDF</div>
                  <div className="flex items-center gap-2"><Building className="w-4 h-4 text-purple-600" /> Sound System & Projector</div>
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Mulai Dari</span>
                  <span className="text-base font-extrabold text-slate-900">Rp 350.000 <span className="text-xs font-normal text-slate-500">/jam</span></span>
                </div>
                <button onClick={onExploreCatalog} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  Pilih <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="cara-kerja" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Alur Reservasi</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              3 Langkah Mudah Menuju Ruang Kegiatan Anda
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center">1</span>
              <h4 className="text-base font-bold text-slate-900">Pilih Ruangan & Tanggal</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Filter katalog berdasarkan kapasitas peserta atau kategori ruangan yang diinginkan, lalu tentukan tanggal reservasi.
              </p>
            </div>

            <div className="relative p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center">2</span>
              <h4 className="text-base font-bold text-slate-900">Klik Slot Jam Kosong</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pilih slot jam hijau yang tersedia atau aktifkan mode harian (Daily) jika menggunakan akun Member.
              </p>
            </div>

            <div className="relative p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="w-10 h-10 rounded-xl bg-violet-600 text-white font-black text-sm flex items-center justify-center">3</span>
              <h4 className="text-base font-bold text-slate-900">Dapatkan Kode Booking Instan</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sistem menerbitkan kode unik (misal: CHB-20261110-8491) yang langsung tersimpan di riwayat reservasi Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <img src="/logo.jpg" alt="Logo" className="w-16 h-16 object-contain rounded-2xl mx-auto shadow-2xl border border-white/20" />
          <h2 className="text-2xl sm:text-4xl font-black">Siap Mengumpulkan Komunitasmu?</h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto">
            Daftar sekarang dan nikmati kemudahan reservasi ruang kerja komunal dengan kuota fleksibel dan transparansi jadwal seketika.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onExploreCatalog}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-sm font-black bg-white text-blue-700 hover:bg-blue-50 shadow-lg transition-all"
            >
              Buka Katalog Ruangan
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md transition-all"
            >
              Daftar Akun Baru
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <img src="/logo.jpg" alt="Logo" className="w-7 h-7 object-contain rounded-lg" />
            <span className="font-bold text-slate-800">Kumpul-In Community Hub</span>
          </div>
          <p>© 2026 Kumpul-In • Praktikum Rekayasa Perangkat Lunak (Bab 4: Agile & Scrum)</p>
        </div>
      </footer>
    </div>
  );
}
