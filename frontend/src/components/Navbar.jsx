import React, { useState } from 'react';
import { User, Award, Shield, CalendarCheck, LogOut, Home, Menu, X, LayoutGrid } from 'lucide-react';

export default function Navbar({
  currentUser,
  onSwitchRole,
  activeTab,
  setActiveTab,
  loadingUser,
  onOpenAuth,
  onLogout,
  onGoHome,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo Brand */}
          <div
            tabIndex={0}
            role="button"
            aria-label="Kembali ke Beranda Kumpul-In"
            className="flex items-center space-x-3 cursor-pointer py-1 focus-visible:ring-2 focus-visible:ring-[#326273] focus-visible:outline-none rounded-xl"
            onClick={onGoHome}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onGoHome();
            }}
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
          </div>

          {/* Desktop Navigation Links / Tabs */}
          <nav className="hidden md:flex items-center space-x-1 sm:space-x-2" aria-label="Navigasi Menu Utama">
            <button
              type="button"
              onClick={onGoHome}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:text-[#326273] hover:bg-slate-100 transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#326273]"
              title="Kembali ke Beranda Informasi Kampus"
            >
              <Home className="w-4 h-4 text-[#5c9ead]" aria-hidden="true" />
              <span>← Beranda Depan</span>
            </button>

            {isAdmin ? (
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#326273] ${
                  activeTab === 'admin'
                    ? 'bg-[#326273] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#326273] hover:bg-slate-100'
                }`}
              >
                <Shield className="w-4 h-4" aria-hidden="true" />
                <span>Dashboard Admin</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('catalog')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#326273] ${
                    activeTab === 'catalog'
                      ? 'bg-[#326273] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#326273] hover:bg-slate-100'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" aria-hidden="true" />
                  <span>Katalog Fasilitas</span>
                </button>

                {currentUser && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('my-bookings')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 focus-visible:ring-2 focus-visible:ring-[#326273] ${
                      activeTab === 'my-bookings'
                        ? 'bg-[#326273] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#326273] hover:bg-slate-100'
                    }`}
                  >
                    <CalendarCheck className="w-4 h-4" aria-hidden="true" />
                    <span>Peminjaman Saya</span>
                  </button>
                )}
              </>
            )}
          </nav>

          {/* User Controls & Simulation */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {currentUser ? (
              <>
                {/* Quota Badge (For Non-Admin) */}
                {!isAdmin && (
                  <div
                    className="hidden lg:flex items-center space-x-2 text-xs bg-slate-100 border border-slate-200 rounded-full px-3 py-1"
                    aria-label={`Sisa kuota reservasi aktif ${currentUser.booking_quota} slot`}
                  >
                    <span className="text-slate-400">Kuota:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full ${
                        currentUser.booking_quota > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {currentUser.booking_quota} slot
                    </span>
                  </div>
                )}

                {/* Role Switcher Pill */}
                <div
                  role="group"
                  aria-label="Pilih Role Pengguna Demo"
                  className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold"
                >
                  <button
                    type="button"
                    onClick={() => onSwitchRole('mahasiswa')}
                    disabled={loadingUser}
                    aria-pressed={currentUser.role === 'mahasiswa' || currentUser.role === 'member'}
                    className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-[#326273] ${
                      currentUser.role === 'mahasiswa' || currentUser.role === 'member'
                        ? 'bg-[#326273] text-white shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Beralih ke akun Mahasiswa (Kuota 5 slot)"
                  >
                    <User className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="hidden sm:inline">Mahasiswa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSwitchRole('admin')}
                    disabled={loadingUser}
                    aria-pressed={currentUser.role === 'admin'}
                    className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-[#326273] ${
                      currentUser.role === 'admin'
                        ? 'bg-[#326273] text-white shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Beralih ke akun Biro Sarana / Admin"
                  >
                    <Shield className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="hidden sm:inline">Biro Sarana</span>
                  </button>
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={onLogout}
                  aria-label="Keluar dari akun"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors focus-visible:ring-2 focus-visible:ring-rose-500"
                  title="Keluar / Logout"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-[#326273]"
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#e39774] text-white hover:bg-[#d58560] shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-[#326273]"
                >
                  Daftar
                </button>
              </div>
            )}

            {/* Mobile Navigation Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 md:hidden focus-visible:ring-2 focus-visible:ring-[#326273]"
              aria-label={mobileMenuOpen ? 'Tutup navigasi mobile' : 'Buka navigasi mobile'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Bar */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 shadow-lg">
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onGoHome();
              }}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 text-left flex items-center gap-2"
            >
              <Home className="w-4 h-4 text-slate-400" aria-hidden="true" />
              <span>Beranda</span>
            </button>

            {isAdmin ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveTab('admin');
                }}
                className="p-2.5 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 text-left flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-[#326273]" aria-hidden="true" />
                <span>Dashboard Admin</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setActiveTab('catalog');
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 text-left flex items-center gap-2"
                >
                  <LayoutGrid className="w-4 h-4 text-[#326273]" aria-hidden="true" />
                  <span>Katalog Ruangan</span>
                </button>

                {currentUser && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setActiveTab('my-bookings');
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 text-left flex items-center gap-2"
                  >
                    <CalendarCheck className="w-4 h-4 text-[#326273]" aria-hidden="true" />
                    <span>Reservasi Saya</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
