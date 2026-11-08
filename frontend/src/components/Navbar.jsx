import React from 'react';
import { User, Award, Shield, CalendarCheck, LogOut, Home } from 'lucide-react';

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
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onGoHome}>
            <img
              src="/logo.png"
              alt="Logo Kumpul-In"
              className="h-10 sm:h-12 w-auto object-contain"
            />
            <div className="border-l border-slate-200 pl-3">
              <span className="text-xl sm:text-2xl font-extrabold text-brand-dark tracking-tight">
                Kumpul-In
              </span>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">Community Hub & Coworking</p>
            </div>
          </div>

          {/* Navigation Links / Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={onGoHome}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-brand-dark hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <Home className="w-4 h-4 text-slate-400" />
              <span className="hidden md:inline">Beranda</span>
            </button>

            {isAdmin ? (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-brand-dark text-white shadow-sm'
                    : 'text-slate-600 hover:text-brand-dark hover:bg-slate-100'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Dashboard Admin</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'catalog'
                      ? 'bg-brand-dark text-white shadow-sm'
                      : 'text-slate-600 hover:text-brand-dark hover:bg-slate-100'
                  }`}
                >
                  Katalog Ruangan
                </button>

                {currentUser && (
                  <button
                    onClick={() => setActiveTab('my-bookings')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 ${
                      activeTab === 'my-bookings'
                        ? 'bg-brand-dark text-white shadow-sm'
                        : 'text-slate-600 hover:text-brand-dark hover:bg-slate-100'
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
                    <span className="text-slate-500">Kuota:</span>
                    <span className={`font-bold px-2 py-0.5 rounded-full ${
                      currentUser.booking_quota > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {currentUser.booking_quota} slot
                    </span>
                  </div>
                )}

                {/* Role Switcher Pill */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                  <button
                    onClick={() => onSwitchRole('guest')}
                    disabled={loadingUser}
                    className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg transition-all ${
                      currentUser.role === 'guest'
                        ? 'bg-white text-brand-dark shadow-sm font-bold'
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
                    className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg transition-all ${
                      currentUser.role === 'member'
                        ? 'bg-brand-teal text-white shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Beralih ke akun Member (Kuota 5, bisa sewa harian)"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Member</span>
                  </button>

                  <button
                    onClick={() => onSwitchRole('admin')}
                    disabled={loadingUser}
                    className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg transition-all ${
                      currentUser.role === 'admin'
                        ? 'bg-brand-dark text-white shadow-sm font-bold'
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
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Masuk
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-coral text-white hover:bg-brand-coralHover shadow-sm"
                >
                  Daftar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
