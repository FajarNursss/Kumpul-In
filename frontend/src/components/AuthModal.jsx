import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Award, Shield, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { authService } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, defaultMode = 'login' }) {
  const [mode, setMode] = useState(defaultMode); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('guest'); // 'guest' | 'member'
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
      const msg = err.response?.data?.message || 'Terjadi kesalahan pada sistem.';
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
      setErrorMessage('Gagal quick login demo.');
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
    >
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="" className="h-10 w-auto object-contain" aria-hidden="true" />
            <div>
              <h2 id="auth-modal-title" className="text-lg font-bold text-slate-900">
                {mode === 'login' ? 'Masuk ke Kumpul-In' : 'Daftar Akun Baru'}
              </h2>
              <p className="text-xs text-slate-500">Sistem Reservasi Community Hub</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela masuk"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-[#326273] focus-visible:outline-none"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="bg-slate-50 p-4 border-b border-slate-200/80">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Akses Cepat Demo Praktikum:
          </span>
          <div className="grid grid-cols-3 gap-2 text-xs font-bold">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('admin')}
              className="px-2.5 py-1.5 rounded-xl bg-[#326273] text-white hover:bg-[#264c5a] transition-colors flex items-center justify-center gap-1 shadow-sm font-bold focus-visible:ring-2 focus-visible:ring-[#326273]"
            >
              <Shield className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('member')}
              className="px-2.5 py-1.5 rounded-xl bg-[#5c9ead] text-white hover:bg-[#4d8b99] transition-colors flex items-center justify-center gap-1 shadow-sm font-bold focus-visible:ring-2 focus-visible:ring-[#326273]"
            >
              <Award className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Member</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('guest')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-200 text-slate-800 hover:bg-slate-300 transition-colors flex items-center justify-center gap-1 shadow-sm font-bold focus-visible:ring-2 focus-visible:ring-[#326273]"
            >
              <User className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Guest</span>
            </button>
          </div>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-5">
          {/* Tabs Mode */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(''); }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMessage(''); }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Daftar Akun
            </button>
          </div>

          {errorMessage && (
            <div role="alert" className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" aria-hidden="true" />
              <div>{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label htmlFor="auth-name" className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" aria-hidden="true" />
                  <input
                    id="auth-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Budi Santoso"
                    className="w-full text-xs rounded-xl border-slate-200 pl-9 pr-3 py-2 bg-slate-50 focus:border-[#326273] focus:ring-1 focus:ring-[#326273]"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" aria-hidden="true" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="budi@example.com"
                  className="w-full text-xs rounded-xl border-slate-200 pl-9 pr-3 py-2 bg-slate-50 focus:border-[#326273] focus:ring-1 focus:ring-[#326273]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" aria-hidden="true" />
                <input
                  id="auth-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full text-xs rounded-xl border-slate-200 pl-9 pr-3 py-2 bg-slate-50 focus:border-[#326273] focus:ring-1 focus:ring-[#326273]"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">Pilih Peran Akun</span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <label className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                    role === 'guest' ? 'border-[#326273] bg-[#eef6f8] text-[#326273] ring-1 ring-[#326273]' : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Guest</span>
                      <input
                        type="radio"
                        name="auth-role"
                        value="guest"
                        checked={role === 'guest'}
                        onChange={() => setRole('guest')}
                        className="text-[#326273] focus:ring-[#326273]"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">Kuota 2 slot, per jam</span>
                  </label>

                  <label className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                    role === 'member' ? 'border-[#5c9ead] bg-[#eef6f8] text-[#326273] ring-1 ring-[#5c9ead]' : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Member</span>
                      <input
                        type="radio"
                        name="auth-role"
                        value="member"
                        checked={role === 'member'}
                        onChange={() => setRole('member')}
                        className="text-[#326273] focus:ring-[#326273]"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">Kuota 10 slot & sewa harian</span>
                  </label>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#326273] text-white hover:bg-[#264c5a] shadow-md disabled:opacity-50 transition-all flex items-center justify-center space-x-2 focus-visible:ring-2 focus-visible:ring-[#326273] focus-visible:outline-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun'}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
