import React, { useState } from 'react';
import {
  LayoutGrid, CalendarCheck, Shield, Home, LogOut,
  User, GraduationCap, Clock, ChevronRight, X,
  Building2, History, Users
} from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export default function Sidebar({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
  onGoHome,
  mobileOpen,
  setMobileOpen,
}) {
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const isAdmin = currentUser?.role === 'admin';

  // Navigation items dynamically structured by role
  // For Admin: Dashboard -> Pratinjau Katalog -> Kelola Fasilitas -> Kelola Pengguna -> Riwayat Peminjaman (di paling bawah)
  const navItems = isAdmin
    ? [
        {
          id: 'admin',
          label: 'Dashboard Admin',
          description: 'Ringkasan & statistik sarana',
          icon: Shield,
        },
        {
          id: 'catalog',
          label: 'Pratinjau Katalog',
          description: 'Lihat transparansi slot publik',
          icon: LayoutGrid,
        },
        {
          id: 'admin-rooms',
          label: 'Kelola Fasilitas',
          description: 'Daftar & status ruangan',
          icon: Building2,
        },
        {
          id: 'admin-users',
          label: 'Kelola Pengguna',
          description: 'Manajemen akun civitas & kuota',
          icon: Users,
        },
        {
          id: 'admin-bookings',
          label: 'Riwayat Peminjaman',
          description: 'Log aktivitas & reservasi',
          icon: History,
        },
      ]
    : [
        {
          id: 'catalog',
          label: 'Katalog Fasilitas',
          description: 'Pilihan ruang & ketersediaan slot',
          icon: LayoutGrid,
        },
        {
          id: 'my-bookings',
          label: 'Peminjaman Saya',
          description: 'Jadwal & surat bukti peminjaman',
          icon: CalendarCheck,
        },
      ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (setMobileOpen) setMobileOpen(false);
  };

  const handleHomeClick = () => {
    onGoHome();
    if (setMobileOpen) setMobileOpen(false);
  };

  const sidebarContent = (
    <aside className="w-72 bg-white h-full flex flex-col justify-between border-r border-slate-200 select-none">
      {/* Brand & System Identity */}
      <div className="p-5 border-b border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <div
            tabIndex={0}
            role="button"
            aria-label="Kembali ke Beranda Depan"
            onClick={handleHomeClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleHomeClick();
            }}
            className="flex items-center space-x-3 cursor-pointer py-0.5 rounded-xl focus-visible:ring-2 focus-visible:ring-[#326273] focus-visible:outline-none"
          >
            <img
              src="/logo-icon.png"
              alt="Logo Kumpul-In"
              className="h-10 w-auto object-contain hover:opacity-95 transition-opacity"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-[#326273] tracking-tight leading-none">
                  Kumpul-In
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#e39774]/20 text-[#d58560] uppercase tracking-wider">
                  Kampus
                </span>
              </div>
              <span className="text-[10px] font-semibold text-[#5c9ead] tracking-normal leading-tight mt-0.5">
                Sistem Peminjaman Fasilitas
              </span>
            </div>
          </div>

          {/* Close Button for Mobile Drawer */}
          {setMobileOpen && (
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Tutup menu navigasi"
              className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Active User Profile Card */}
        {currentUser && (
          <div className="p-3.5 rounded-2xl bg-[#eef6f8]/80 border border-[#5c9ead]/30 space-y-2.5">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs ${
                  isAdmin ? 'bg-[#326273]' : 'bg-[#5c9ead]'
                }`}
              >
                {isAdmin ? (
                  <Shield className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <GraduationCap className="w-5 h-5" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {currentUser.name}
                </div>
                <div className="text-[11px] font-semibold text-[#326273] flex items-center gap-1">
                  <span>{isAdmin ? 'Biro Sarana (Admin)' : 'Civitas Mahasiswa'}</span>
                </div>
              </div>
            </div>

            {/* Quota Indicator for Mahasiswa (Hidden for Admin) */}
            {!isAdmin && (
              <div className="pt-2 border-t border-[#5c9ead]/20 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#5c9ead]" /> Sisa Kuota Aktif:
                </span>
                <span
                  className={`font-black px-2 py-0.5 rounded-full ${
                    currentUser.booking_quota > 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {currentUser.booking_quota} / 5 Slot
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        <div className="space-y-1.5">
          <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {isAdmin ? 'Panel Kendali Biro Sarana' : 'Menu Peminjaman'}
          </span>

          <nav className="space-y-1" aria-label="Menu Navigasi Sidebar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full group p-3 rounded-2xl text-left transition-all flex items-center justify-between focus-visible:ring-2 focus-visible:ring-[#326273] focus-visible:outline-none ${
                    isActive
                      ? 'bg-[#326273] text-white shadow-md shadow-[#326273]/20 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-[#326273]'
                      }`}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold leading-tight truncate">
                        {item.label}
                      </div>
                      <div
                        className={`text-[10px] leading-tight truncate mt-0.5 ${
                          isActive ? 'text-slate-200' : 'text-slate-400'
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isActive
                        ? 'text-white translate-x-0.5'
                        : 'text-slate-300 group-hover:text-slate-500'
                    }`}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Public Landing Link */}
        <div className="space-y-1.5 pt-4 border-t border-slate-100">
          <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Halaman Depan
          </span>

          <button
            type="button"
            onClick={handleHomeClick}
            className="w-full p-2.5 rounded-2xl text-left text-xs font-semibold text-slate-600 hover:text-[#326273] hover:bg-slate-100 transition-colors flex items-center space-x-3 focus-visible:ring-2 focus-visible:ring-[#326273]"
            title="Kembali ke Beranda Informasi Kampus"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
              <Home className="w-4 h-4 text-[#5c9ead]" aria-hidden="true" />
            </div>
            <span>← Beranda Informasi</span>
          </button>
        </div>
      </div>

      {/* Sidebar Footer & Logout */}
      <div className="p-4 border-t border-slate-200 space-y-3 bg-slate-50/50">
        <button
          type="button"
          onClick={() => setIsLogoutConfirmOpen(true)}
          className="w-full py-2.5 px-3 rounded-2xl text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-all flex items-center justify-center space-x-2 focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          <span>Keluar dari Akun</span>
        </button>

        <div className="text-center text-[10px] text-slate-400">
          Kumpul-In Kampus • Biro Sarana Terpadu
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={isLogoutConfirmOpen}
        title="Konfirmasi Keluar Akun"
        description={`Apakah Anda yakin ingin keluar dari akun ${currentUser?.name || ''}? Anda harus masuk kembali untuk mengakses sistem.`}
        confirmText="Ya, Keluar Akun"
        cancelText="Batal"
        variant="danger"
        icon={LogOut}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={() => {
          setIsLogoutConfirmOpen(false);
          if (setMobileOpen) setMobileOpen(false);
          onLogout();
        }}
      />
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block shrink-0 sticky top-0 h-screen z-30">
        {sidebarContent}
      </div>

      {/* Mobile Off-canvas Drawer */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 md:hidden flex"
        >
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div className="relative flex-1 flex max-w-xs w-full shadow-2xl animate-slide-right z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
