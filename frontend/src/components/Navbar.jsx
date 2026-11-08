import React from 'react';
import { Building2, User, Award, RefreshCw, CalendarCheck } from 'lucide-react';

export default function Navbar({ currentUser, onSwitchRole, activeTab, setActiveTab, loadingUser }) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('catalog')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Kumpul-In
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Community Hub
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'catalog'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Katalog & Jadwal
            </button>
            <button
              onClick={() => setActiveTab('my-bookings')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'my-bookings'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Reservasi Saya</span>
            </button>
          </nav>

          {/* User Simulation & Quota */}
          <div className="flex items-center space-x-3">
            {currentUser && (
              <div className="hidden md:flex items-center space-x-2 text-xs bg-slate-100 border border-slate-200 rounded-full px-3 py-1">
                <span className="text-slate-500">Kuota Reservasi:</span>
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
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
              <button
                onClick={() => onSwitchRole('guest')}
                disabled={loadingUser}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  currentUser?.role === 'guest'
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Beralih ke akun Guest (Kuota 2, hanya per jam)"
              >
                <User className="w-3.5 h-3.5" />
                <span>Guest</span>
              </button>

              <button
                onClick={() => onSwitchRole('member')}
                disabled={loadingUser}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  currentUser?.role === 'member'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Beralih ke akun Member (Kuota 5, bisa sewa harian)"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Member</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
