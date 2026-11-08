import React from 'react';
import {
  Calendar, Clock, ShieldCheck, CheckCircle2, ArrowRight,
  Users, Building, Coffee, Wifi, Monitor, FileText, ChevronRight
} from 'lucide-react';

export default function LandingPage({ onExploreCatalog, onOpenAuth }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img
                src="/logo.png"
                alt="Logo Kumpul-In"
                className="h-10 sm:h-12 w-auto object-contain"
              />
              <div className="border-l border-slate-200 pl-3">
                <span className="text-xl sm:text-2xl font-black text-brand-dark tracking-tight">
                  Kumpul-In
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-tealLight text-brand-teal border border-brand-teal/30 uppercase tracking-wider">
                  Community Hub
                </span>
              </div>
            </div>

            {/* Menu Links */}
            <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
              <a href="#fitur" className="hover:text-brand-dark transition-colors">Kelebihan</a>
              <a href="#fasilitas" className="hover:text-brand-dark transition-colors">Pilihan Ruang</a>
              <a href="#cara-kerja" className="hover:text-brand-dark transition-colors">Alur Booking</a>
              <button onClick={onExploreCatalog} className="hover:text-brand-dark transition-colors">
                Katalog Lengkap
              </button>
            </nav>

            {/* Auth Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-brand-dark hover:bg-slate-100 transition-colors"
              >
                Masuk
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-brand-coral text-white hover:bg-brand-coralHover shadow-sm transition-all flex items-center space-x-1.5"
              >
                <span>Daftar Akun</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-24 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-tealLight border border-brand-teal/30 text-brand-dark text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-brand-teal" />
                <span>Sistem Reservasi Ruang Komunitas & Coworking</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Pesan Meja Kerja & Ruang Rapat Komunitas, <span className="text-brand-dark underline decoration-brand-coral decoration-wavy decoration-2">Tanpa Jadwal Bentrok</span>.
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Pilih meja fokus personal, meeting pod kedap suara, hingga aula gathering skala besar. Sistem memvalidasi ketersediaan jam secara transparan dengan penerbitan kode booking instan.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={onExploreCatalog}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-bold bg-brand-dark text-white hover:bg-brand-darkHover shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <span>Pilih Ruangan & Cek Slot</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onOpenAuth('login')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Akses Cepat Demo Praktikum</span>
                </button>
              </div>

              {/* Real Value Metrics */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-100 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-brand-dark">10 Slot</div>
                  <div className="text-[11px] text-slate-500 font-medium">08:00 - 18:00 WIB</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-brand-dark">100% Real-Time</div>
                  <div className="text-[11px] text-slate-500 font-medium">Kunci Otomatis Anti Bentrok</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-brand-coral">Instan</div>
                  <div className="text-[11px] text-slate-500 font-medium">Kode Booking CHB-***</div>
                </div>
              </div>
            </div>

            {/* Right Card: Authentic Clean Preview */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-slate-200 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Meeting Pod Alpha</h4>
                      <p className="text-[11px] text-slate-400">Kapasitas 4 Orang • Rp 50.000/jam</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Aktif
                  </span>
                </div>

                {/* Slot Preview */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Status Slot Jam Hari Ini:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/70 text-emerald-800 font-medium flex items-center justify-between">
                      <span>09:00 - 10:00</span>
                      <span className="text-[10px] text-emerald-700 font-bold">Tersedia</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50/70 text-rose-700 font-medium flex items-center justify-between">
                      <span>10:00 - 11:00</span>
                      <span className="text-[10px] text-rose-700 font-bold">Terisi</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-brand-dark bg-brand-dark text-white font-medium flex items-center justify-between shadow-sm">
                      <span>11:00 - 12:00</span>
                      <span className="text-[10px] text-brand-teal font-bold">Dipilih</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/70 text-emerald-800 font-medium flex items-center justify-between">
                      <span>13:00 - 14:00</span>
                      <span className="text-[10px] text-emerald-700 font-bold">Tersedia</span>
                    </div>
                  </div>
                </div>

                {/* Instant Booking Banner */}
                <div className="p-3.5 rounded-xl bg-brand-coralLight border border-brand-coral/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Penerbitan Bukti Instan</span>
                    <div className="text-sm font-mono font-bold text-brand-dark">CHB-20261110-8491</div>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-1 rounded bg-white text-brand-coral border border-brand-coral/30">
                    Terkonfirmasi
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-16 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-brand-teal uppercase tracking-wider">Kelebihan Sistem</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Bereskan Urusan Tempat Kerja Tanpa Konfirmasi Manual
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Dirancang untuk menghilangkan penumpukan jadwal dan kebingungan ketersediaan fasilitas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-tealLight text-brand-dark flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Transparansi Slot Waktu</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seluruh 10 slot operasional (08:00–18:00) ditampilkan apa adanya. Hijau berarti ruangan kosong dan langsung bisa dipesan.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-tealLight text-brand-dark flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Validasi Bentrok Otomatis</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Backend memverifikasi irisan waktu sebelum booking dicatat. Ketika satu pengguna berhasil memesan, slot otomatis terkunci bagi pengguna lain.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-coralLight text-brand-coral flex items-center justify-center font-bold">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Opsi Sewa Per Jam & Harian</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fleksibel per jam untuk meja fokus, atau sewa seharian penuh (*Daily*) untuk Grand Hall Event Space dengan lampiran proposal PDF.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Room Category Section */}
      <section id="fasilitas" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-brand-teal uppercase tracking-wider">Kategori Ruangan</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tiga Pilihan Ruang Sesuai Skala Kebutuhan
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Open Desk */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col justify-between">
              <div className="h-2 bg-brand-teal" />
              <div className="p-6 space-y-3">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-tealLight text-brand-dark border border-brand-teal/20">
                  Open Desk
                </span>
                <h3 className="text-lg font-bold text-slate-900">Meja Kerja Fokus</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ruang kerja ergonomis untuk individu atau partner berdua dengan colokan listrik dan Wi-Fi kencang.
                </p>
                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2"><Users className="w-4 h-4 text-brand-teal" /> Kapasitas 1 - 2 Orang</div>
                  <div className="flex items-center gap-2"><Wifi className="w-4 h-4 text-brand-teal" /> Wi-Fi High Speed</div>
                  <div className="flex items-center gap-2"><Coffee className="w-4 h-4 text-brand-teal" /> Free Flow Kopi & Air</div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">TARIF SEWA</span>
                  <span className="text-sm font-extrabold text-slate-900">Rp 15.000 <span className="text-xs font-normal text-slate-500">/jam</span></span>
                </div>
                <button onClick={onExploreCatalog} className="text-xs font-bold text-brand-dark hover:underline flex items-center gap-1">
                  Pilih <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Meeting Pod */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col justify-between">
              <div className="h-2 bg-brand-dark" />
              <div className="p-6 space-y-3">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-brand-dark border border-slate-200">
                  Meeting Pod
                </span>
                <h3 className="text-lg font-bold text-slate-900">Ruang Rapat Kedap Suara</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pod akustik tertutup dilengkapi TV display HDMI dan whiteboard untuk rapat tim atau interview.
                </p>
                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2"><Users className="w-4 h-4 text-brand-dark" /> Kapasitas 4 - 8 Orang</div>
                  <div className="flex items-center gap-2"><Monitor className="w-4 h-4 text-brand-dark" /> Smart TV & HDMI</div>
                  <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-brand-dark" /> Kedap Suara Ber-AC</div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">TARIF SEWA</span>
                  <span className="text-sm font-extrabold text-slate-900">Rp 50.000 <span className="text-xs font-normal text-slate-500">/jam</span></span>
                </div>
                <button onClick={onExploreCatalog} className="text-xs font-bold text-brand-dark hover:underline flex items-center gap-1">
                  Pilih <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Event Space */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col justify-between">
              <div className="h-2 bg-brand-coral" />
              <div className="p-6 space-y-3">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-coralLight text-brand-coral border border-brand-coral/20">
                  Event Space
                </span>
                <h3 className="text-lg font-bold text-slate-900">Grand Hall Serbaguna</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Aula luas untuk seminar komunitas atau workshop. Wajib menyertakan proposal kegiatan PDF.
                </p>
                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2"><Users className="w-4 h-4 text-brand-coral" /> Kapasitas s.d 50 Orang</div>
                  <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-brand-coral" /> Wajib Proposal PDF</div>
                  <div className="flex items-center gap-2"><Building className="w-4 h-4 text-brand-coral" /> Sound System Lengkap</div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">TARIF SEWA</span>
                  <span className="text-sm font-extrabold text-slate-900">Rp 350.000 <span className="text-xs font-normal text-slate-500">/jam</span></span>
                </div>
                <button onClick={onExploreCatalog} className="text-xs font-bold text-brand-dark hover:underline flex items-center gap-1">
                  Pilih <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="cara-kerja" className="py-16 bg-[#f8fafc] border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-brand-teal uppercase tracking-wider">Alur Singkat</span>
            <h2 className="text-2xl font-extrabold text-slate-900">3 Langkah Booking Ruangan</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2">
              <span className="w-8 h-8 rounded-lg bg-brand-dark text-white font-bold text-xs flex items-center justify-center">1</span>
              <h4 className="text-sm font-bold text-slate-900">Pilih Ruangan & Tanggal</h4>
              <p className="text-xs text-slate-500">Filter katalog sesuai kapasitas peserta, lalu pilih tanggal reservasi yang dituju.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2">
              <span className="w-8 h-8 rounded-lg bg-brand-teal text-white font-bold text-xs flex items-center justify-center">2</span>
              <h4 className="text-sm font-bold text-slate-900">Klik Slot Jam Kosong</h4>
              <p className="text-xs text-slate-500">Pilih slot hijau atau gunakan opsi sewa harian (Daily) jika menggunakan akun Member.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2">
              <span className="w-8 h-8 rounded-lg bg-brand-coral text-white font-bold text-xs flex items-center justify-center">3</span>
              <h4 className="text-sm font-bold text-slate-900">Terima Kode Booking Instan</h4>
              <p className="text-xs text-slate-500">Sistem langsung menerbitkan kode booking unik sebagai bukti reservasi sah.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <img src="/logo.png" alt="Logo" className="h-7 w-auto object-contain" />
            <span className="font-bold text-slate-800">Kumpul-In Community Hub</span>
          </div>
          <p>© 2026 Kumpul-In • Praktikum Rekayasa Perangkat Lunak (Bab 4: Agile & Scrum)</p>
        </div>
      </footer>
    </div>
  );
}
