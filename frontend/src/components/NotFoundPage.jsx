import React from 'react';
import { Home, LayoutGrid, CalendarCheck, ArrowLeft, Search, HelpCircle, AlertCircle } from 'lucide-react';

export default function NotFoundPage({ onNavigate, currentPath = window.location.pathname + window.location.hash }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between font-sans selection:bg-[#326273] selection:text-white">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            onClick={() => onNavigate('landing')}
            className="flex items-center space-x-3 cursor-pointer py-1"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate('landing')}
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

          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#326273]"
          >
            <Home className="w-4 h-4 text-[#326273]" aria-hidden="true" />
            <span>Beranda Depan</span>
          </button>
        </div>
      </header>

      {/* Main 404 Hero Area */}
      <main className="max-w-3xl mx-auto px-4 py-16 sm:py-24 text-center space-y-8 flex-1 flex flex-col items-center justify-center">
        {/* Error Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#fdf4f0] border border-[#e39774]/40 text-[#d58560] text-xs font-bold animate-bounce-subtle">
          <AlertCircle className="w-4 h-4 text-[#e39774]" aria-hidden="true" />
          <span>Galat 404 • Tautan Tidak Valid</span>
        </div>

        {/* 404 Giant Number with Palette Aesthetic */}
        <div className="relative select-none">
          <div className="text-7xl sm:text-9xl font-black tracking-tighter text-[#326273]/15 leading-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl sm:text-6xl font-black text-[#326273] tracking-tight">
              Oops!
            </span>
          </div>
        </div>

        {/* Error Explanation */}
        <div className="space-y-3 max-w-lg">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Tautan atau URL fasilitas yang Anda tuju sepertinya salah ketik, tidak tersedia, atau sudah dipindahkan ke alamat baru:
          </p>
          <div className="p-3 bg-slate-100 rounded-xl font-mono text-xs text-rose-700 break-all border border-slate-200 inline-block max-w-full">
            {currentPath || '/unknown'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md pt-2">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-[#326273] text-white hover:bg-[#264c5a] shadow-sm transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[#326273]"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Kembali ke Beranda</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('catalog')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-[#e39774] text-white hover:bg-[#d58560] shadow-sm transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[#e39774]"
          >
            <LayoutGrid className="w-4 h-4" aria-hidden="true" />
            <span>Katalog Fasilitas</span>
          </button>
        </div>

        {/* Quick Suggestions */}
        <div className="pt-6 border-t border-slate-200 w-full max-w-md space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Kategori Fasilitas Kampus Terpopuler:
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {['Aula', 'Perpustakaan', 'Meeting Room', 'Ruang Belajar'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onNavigate('catalog', cat)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-[#326273] text-xs font-semibold text-slate-700 hover:text-[#326273] transition-colors shadow-xs"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Kumpul-In Kampus • Sistem Peminjaman Fasilitas & Ruang Kampus Terpadu. Seluruh hak cipta dilindungi.</p>
      </footer>
    </div>
  );
}
