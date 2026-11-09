import React from 'react';
import { AlertOctagon, RefreshCw, Home, ChevronDown } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between font-sans selection:bg-[#326273] selection:text-white">
          {/* Header */}
          <header className="bg-white border-b border-slate-200 py-4 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src="/logo-icon.png"
                  alt="Logo Kumpul-In"
                  className="h-10 w-auto object-contain"
                />
                <div className="flex flex-col">
                  <span className="text-lg font-black text-[#326273] leading-none">
                    Kumpul-In <span className="text-xs text-[#d58560]">KAMPUS</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    Sistem Peminjaman Fasilitas Kampus
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Error Card */}
          <main className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-3xl bg-[#fdf4f0] text-[#e39774] border border-[#e39774]/40 flex items-center justify-center mx-auto shadow-sm">
              <AlertOctagon className="w-8 h-8" aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Terjadi Kendala Teknis Sementara
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                Sistem mendeteksi kendala pada antarmuka. Data sesi Anda aman. Silakan muat ulang halaman untuk melanjutkan.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto flex-1 py-3 px-5 rounded-xl text-xs sm:text-sm font-bold bg-[#326273] text-white hover:bg-[#264c5a] shadow-sm transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[#326273]"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                <span>Muat Ulang Halaman</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto flex-1 py-3 px-5 rounded-xl text-xs sm:text-sm font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[#326273]"
              >
                <Home className="w-4 h-4 text-[#326273]" aria-hidden="true" />
                <span>Kembali ke Beranda</span>
              </button>
            </div>

            {/* Error detail accordion for debug */}
            {this.state.error && (
              <div className="w-full max-w-md pt-4 text-left">
                <button
                  type="button"
                  onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                  className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1 mx-auto"
                >
                  <span>Detail Teknis Galat</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${this.state.showDetails ? 'rotate-180' : ''}`} />
                </button>
                {this.state.showDetails && (
                  <pre className="mt-2 p-3 bg-slate-900 text-slate-100 rounded-xl text-[10px] font-mono overflow-x-auto max-h-40 border border-slate-700">
                    {this.state.error.toString()}
                  </pre>
                )}
              </div>
            )}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
            <p>© 2026 Kumpul-In Kampus • Sistem Peminjaman Fasilitas & Ruang Kampus Terpadu.</p>
          </footer>
        </div>
      );
    }

    return this.props.children;
  }
}
