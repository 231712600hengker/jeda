'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-red-500/20 rounded-2xl p-6 shadow-2xl text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-bold text-slate-100 mb-2">
          Terjadi Kesalahan Tak Terduga
        </h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Sistem mengalami kendala saat memuat data. Tenang, data check-in Anda yang telah tersimpan tetap aman.
        </p>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mb-6 p-3 bg-red-950/40 border border-red-900/50 rounded-lg text-left overflow-x-auto text-xs font-mono text-red-300">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
          <a
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-all border border-slate-700"
          >
            <Home className="w-4 h-4" />
            Kembali ke Beranda
          </a>
        </div>
      </div>
    </div>
  );
}

