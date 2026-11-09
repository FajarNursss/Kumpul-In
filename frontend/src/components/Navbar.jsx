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
          {/* Logo Brand: Single Clean Display */}
          <div className="flex items-center cursor-pointer py-1" onClick={onGoHome}>
            <img
              src="/logo.png"
              alt="Kumpul-In Community Hub"
              className="h-9 sm:h-11 w-auto object-contain hover:opacity-95 transition-opacity"
            />
          </div>

          {/* Desktop Navigation Links / Tabs */}
          <nav className="hidden md:flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={onGoHome}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#326273] hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <Home className="w-4 h-4 text-slate-400" />
              <span>Beranda</span>
            </button>

            {isAdmin ? (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-[#326273] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#326273] hover:bg-slate-100'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Dashboard Admin</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'catalog'
                      ? 'bg-[#326273] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#326273] hover:bg-slate-100'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>Katalog Ruangan</span>
                </button>

                {currentUser && (
                  <button
                    onClick={() => setActiveTab('my-bookings')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 ${
                      activeTab === 'my-bookings'
                        ? 'bg-[#326273] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#326273] hover:bg-slate-100'
                    }`}
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Reservasi Saya</span>
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
                  <div className="hidden lg:flex items-center space-x-2 text-xs bg-slate-100 border border-slate-200 rounded-full px-3 py-1">
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
                <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
                  <button
                    onClick={() => onSwitchRole('guest')}
                    disabled={loadingUser}
                    className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl transition-all ${
                      currentUser.role === 'guest'
                        ? 'bg-white text-[#326273] shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Beralih ke akun Guest (Kuota 2, hanya per jam)"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Guest</span>
                  </button>

                  <button
                    onClick={() => onSwitchRole('member')}
                    disabled={loadingUser}
                    className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl transition-all ${
                      currentUser.role === 'member'
                        ? 'bg-[#5c9ead] text-white shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Beralih ke akun Member (Kuota 10, bisa sewa harian)"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Member</span>
                  </button>

                  <button
                    onClick={() => onSwitchRole('admin')}
                    disabled={loadingUser}
                    className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl transition-all ${
                      currentUser.role === 'admin'
                        ? 'bg-[#326273] text-white shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Beralih ke akun Admin (Kelola seluruh reservasi & ruangan)"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Admin</span>
                  </button>
                </div>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Keluar / Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Masuk
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#e39774] text-white hover:bg-[#d58560] shadow-xs transition-all"
                >
                  Daftar
                </button>
              </div>
            )}

            {/* Mobile Navigation Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Bar */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 shadow-lg">
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onGoHome();
              }}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 text-left flex items-center gap-2"
            >
              <Home className="w-4 h-4 text-slate-400" />
              <span>Beranda</span>
            </button>

            {isAdmin ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveTab('admin');
                }}
                className="p-2.5 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 text-left flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-[#326273]" />
                <span>Dashboard Admin</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setActiveTab('catalog');
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 text-left flex items-center gap-2"
                >
                  <LayoutGrid className="w-4 h-4 text-[#326273]" />
                  <span>Katalog Ruangan</span>
                </button>

                {currentUser && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setActiveTab('my-bookings');
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 text-left flex items-center gap-2"
                  >
                    <CalendarCheck className="w-4 h-4 text-[#326273]" />
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
