import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Award, Shield, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, defaultMode = 'login' }) {
  const [mode, setMode] = useState(defaultMode); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member'); // 'guest' | 'member'
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setMode(defaultMode);
    setErrorMessage('');
  }, [defaultMode, isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      let res;
      if (mode === 'login') {
        res = await authService.login(email, password);
      } else {
        res = await authService.register({ name, email, password, role });
      }

      if (res.success) {
        onAuthSuccess(res.data.user);
        onClose();
      } else {
        setErrorMessage(res.message || 'Gagal memproses autentikasi.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Terjadi kesalahan pada sistem. Periksa kembali data Anda.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (targetRole) => {
    setErrorMessage('');
    setLoading(true);
    try {
      const res = await authService.quickLogin(targetRole);
      if (res.success) {
        onAuthSuccess(res.data.user);
        onClose();
      }
    } catch (err) {
      setErrorMessage('Gagal masuk cepat sebagai ' + targetRole);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col transition-all transform scale-100">
        {/* Sleek Top Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/logo-icon.png"
              alt="Logo Kumpul-In"
              className="h-10 w-auto object-contain"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-[#326273] tracking-tight leading-none">
                  Kumpul-In
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#e39774]/20 text-[#d58560] uppercase tracking-wider">
                  Hub
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 mt-0.5">
                Sistem Reservasi Ruang Komunitas
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela autentikasi"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-[#326273] focus-visible:outline-none"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Segmented Control Mode Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`py-2.5 rounded-xl transition-all duration-200 text-center ${
                mode === 'login'
                  ? 'bg-white text-[#326273] shadow-sm font-extrabold'
                  : 'hover:text-slate-900 text-slate-500'
              }`}
            >
              Masuk ke Akun
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`py-2.5 rounded-xl transition-all duration-200 text-center ${
                mode === 'register'
                  ? 'bg-white text-[#326273] shadow-sm font-extrabold'
                  : 'hover:text-slate-900 text-slate-500'
              }`}
            >
              Daftar Akun Baru
            </button>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-start gap-2.5 animate-shake"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" aria-hidden="true" />
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="auth-name"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" aria-hidden="true" />
                  <input
                    id="auth-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full text-xs rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 bg-slate-50/70 focus:bg-white focus:border-[#326273] focus:ring-2 focus:ring-[#326273]/20 transition-all outline-none text-slate-900"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" aria-hidden="true" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full text-xs rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 bg-slate-50/70 focus:bg-white focus:border-[#326273] focus:ring-2 focus:ring-[#326273]/20 transition-all outline-none text-slate-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="auth-password"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" aria-hidden="true" />
                <input
                  id="auth-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full text-xs rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 bg-slate-50/70 focus:bg-white focus:border-[#326273] focus:ring-2 focus:ring-[#326273]/20 transition-all outline-none text-slate-900"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tipe Keanggotaan
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <label
                    className={`p-3.5 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                      role === 'member'
                        ? 'border-[#326273] bg-[#eef6f8] text-[#326273] ring-1 ring-[#326273]'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-[#5c9ead]" aria-hidden="true" />
                        Member
                      </span>
                      <input
                        type="radio"
                        name="auth-role"
                        value="member"
                        checked={role === 'member'}
                        onChange={() => setRole('member')}
                        className="text-[#326273] focus:ring-[#326273]"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1.5 font-medium leading-snug">
                      10 kuota slot & prioritas booking harian
                    </span>
                  </label>

                  <label
                    className={`p-3.5 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                      role === 'guest'
                        ? 'border-[#326273] bg-[#eef6f8] text-[#326273] ring-1 ring-[#326273]'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                        Guest
                      </span>
                      <input
                        type="radio"
                        name="auth-role"
                        value="guest"
                        checked={role === 'guest'}
                        onChange={() => setRole('guest')}
                        className="text-[#326273] focus:ring-[#326273]"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1.5 font-medium leading-snug">
                      2 kuota slot untuk reservasi per jam
                    </span>
                  </label>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-[#326273] text-white hover:bg-[#264c5a] shadow-md hover:shadow-lg disabled:opacity-50 transition-all duration-200 flex items-center justify-center space-x-2 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#326273] focus-visible:outline-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Masuk ke Sistem' : 'Daftar Sekarang'}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          {/* Discreet Quick Login Helper for Testing / Demo */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400">
                Akses Cepat Pengujian:
              </span>
              <span className="text-[10px] text-slate-400">1-Klik Langsung Masuk</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin('admin')}
                className="px-2 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
              >
                <Shield className="w-3 h-3 text-[#326273]" aria-hidden="true" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin('member')}
                className="px-2 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
              >
                <Award className="w-3 h-3 text-[#5c9ead]" aria-hidden="true" />
                <span>Member</span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin('guest')}
                className="px-2 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
              >
                <User className="w-3 h-3 text-slate-400" aria-hidden="true" />
                <span>Guest</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
