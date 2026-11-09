import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Lock, User, Shield, ArrowRight, Loader2, AlertCircle, CheckCircle2, GraduationCap, Check } from 'lucide-react';
import { authService } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, defaultMode = 'login' }) {
  const [mode, setMode] = useState(defaultMode); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const passwordInputRef = useRef(null);

  useEffect(() => {
    setMode(defaultMode);
    setErrorMessage('');
    setSuccessMessage('');
  }, [defaultMode, isOpen]);

  // Close on Escape key & prevent body scrolling
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (mode === 'register') {
      if (name.trim().length < 3) {
        setErrorMessage('Nama lengkap mahasiswa minimal 3 karakter.');
        return;
      }
      if (!email.includes('@') || !email.includes('.')) {
        setErrorMessage('Format email tidak valid.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Kata sandi minimal 6 karakter.');
        return;
      }
      if (password !== passwordConfirmation) {
        setErrorMessage('Konfirmasi kata sandi tidak cocok.');
        return;
      }

      setLoading(true);
      try {
        const res = await authService.register({
          name: name.trim(),
          email: email.trim(),
          password,
          password_confirmation: passwordConfirmation,
          role: 'mahasiswa',
        });

        if (res.success) {
          // Direct newly registered user to Login modal as requested
          setSuccessMessage('Pendaftaran Berhasil! Akun mahasiswa Anda telah terdaftar. Silakan masukkan kata sandi untuk masuk.');
          setMode('login');
          setPassword('');
          setPasswordConfirmation('');
          // Focus password field after switching to login
          setTimeout(() => {
            passwordInputRef.current?.focus();
          }, 150);
        } else {
          setErrorMessage(res.message || 'Gagal mendaftar akun.');
        }
      } catch (err) {
        setErrorMessage(err.customMessage || err.response?.data?.message || 'Gagal mendaftar akun.');
      } finally {
        setLoading(false);
      }
    } else {
      // Login Mode
      if (!email || !password) {
        setErrorMessage('Harap isi alamat email dan kata sandi.');
        return;
      }

      setLoading(true);
      try {
        const res = await authService.login(email.trim(), password);
        if (res.success) {
          onAuthSuccess(res.data.user);
          onClose();
        } else {
          setErrorMessage(res.message || 'Gagal masuk ke portal.');
        }
      } catch (err) {
        setErrorMessage(err.customMessage || err.response?.data?.message || 'Email atau kata sandi tidak sesuai.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleQuickLogin = async (targetRole) => {
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);
    try {
      const res = await authService.quickLogin(targetRole);
      if (res.success) {
        onAuthSuccess(res.data.user);
        onClose();
      }
    } catch (err) {
      setErrorMessage(err.customMessage || 'Gagal masuk cepat sebagai ' + targetRole);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col transition-all my-auto relative animate-scale-in">
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
                  Kampus
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#5c9ead] mt-0.5">
                Sistem Peminjaman Fasilitas Kampus
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
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
                setSuccessMessage('');
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
                setSuccessMessage('');
              }}
              className={`py-2.5 rounded-xl transition-all duration-200 text-center ${
                mode === 'register'
                  ? 'bg-white text-[#326273] shadow-sm font-extrabold'
                  : 'hover:text-slate-900 text-slate-500'
              }`}
            >
              Daftar Mahasiswa
            </button>
          </div>

          {/* Success Message Banner (When user just registered, directed to login) */}
          {successMessage && (
            <div
              role="status"
              className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-start gap-2.5 animate-fade-in"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" aria-hidden="true" />
              <div className="leading-relaxed font-semibold">{successMessage}</div>
            </div>
          )}

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
                  Nama Lengkap Mahasiswa / Civitas <span className="text-rose-500">*</span>
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
                Email Kampus / Pribadi <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" aria-hidden="true" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mahasiswa@kampus.ac.id"
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
                  Kata Sandi <span className="text-rose-500">*</span>
                </label>
                {mode === 'login' && (
                  <span className="text-[11px] text-slate-400">Min. 6 karakter</span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" aria-hidden="true" />
                <input
                  ref={passwordInputRef}
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
                <label
                  htmlFor="auth-password-confirmation"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Ulangi Kata Sandi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" aria-hidden="true" />
                  <input
                    id="auth-password-confirmation"
                    type="password"
                    required
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="Ketik ulang kata sandi yang sama"
                    className="w-full text-xs rounded-xl border border-slate-200 pl-10 pr-8 py-2.5 bg-slate-50/70 focus:bg-white focus:border-[#326273] focus:ring-2 focus:ring-[#326273]/20 transition-all outline-none text-slate-900"
                  />
                  {passwordConfirmation && (
                    <div className="absolute right-3 top-3">
                      {password === passwordConfirmation ? (
                        <Check className="w-4 h-4 text-emerald-600" aria-label="Cocok" />
                      ) : (
                        <X className="w-4 h-4 text-rose-500" aria-label="Tidak cocok" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div className="p-3.5 rounded-2xl bg-[#eef6f8] border border-[#5c9ead]/40 flex items-start gap-2.5 text-xs text-[#326273]">
                <GraduationCap className="w-4 h-4 shrink-0 mt-0.5 text-[#326273]" aria-hidden="true" />
                <p className="leading-relaxed">
                  Pendaftaran terbuka untuk seluruh <strong>Civitas Akademika Kampus</strong>. Setelah mendaftar, Anda akan diarahkan ke form masuk untuk memulai peminjaman ruangan.
                </p>
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
                  <span>{mode === 'login' ? 'Masuk ke Portal Kampus' : 'Daftar Akun Mahasiswa'}</span>
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
              <span className="text-[10px] text-slate-400">1-Klik Masuk</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin('mahasiswa')}
                className="px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <GraduationCap className="w-3.5 h-3.5 text-[#5c9ead]" aria-hidden="true" />
                <span>Mahasiswa (Civitas)</span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin('admin')}
                className="px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Shield className="w-3.5 h-3.5 text-[#326273]" aria-hidden="true" />
                <span>Biro Sarana (Admin)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
