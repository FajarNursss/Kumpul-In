import React from 'react';
import { Building2, User, Award, Shield, CalendarCheck, LogOut, LogIn, Sparkles, Home } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand with Image */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onGoHome}>
            <img
              src="/logo.jpg"
              alt="Logo Kumpul-In"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-xl shadow-sm border border-slate-200/60"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700">
                  Kumpul-In
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                  Hub
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Community Hub & Working Space</p>
            </div>
          </div>

          {/* Navigation Links / Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={onGoHome}
              className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <Home className="w-4 h-4 text-slate-400" />
              <span className="hidden md:inline">Beranda</span>
            </button>

            {isAdmin ? (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50'
                }`}
              >
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Dashboard Admin</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'catalog'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Katalog & Jadwal
                </button>

                {currentUser && (
                  <button
                    onClick={() => setActiveTab('my-bookings')}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 ${
                      activeTab === 'my-bookings'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <CalendarCheck className="w-4 h-4 text-blue-600" />
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
                    <span className="text-slate-500">Sisa Kuota:</span>
                    <span className={`font-black px-2 py-0.5 rounded-full ${
                      currentUser.booking_quota > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {currentUser.booking_quota} slot
                    </span>
                  </div>
                )}

                {/* Role Switcher Pill (Quick practical demo switcher) */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                  <button
                    onClick={() => onSwitchRole('guest')}
                    disabled={loadingUser}
                    className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg transition-all ${
                      currentUser.role === 'guest'
                        ? 'bg-white text-slate-900 shadow-sm font-bold'
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
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm font-bold'
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
                        ? 'bg-purple-700 text-white shadow-sm font-bold'
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
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Masuk
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
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
