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
    <div className="min-h-screen bg-[#fbf9f6] text-[#2d3748] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-[#e4e2df] rounded-3xl p-6 sm:p-8 shadow-[0_20px_35px_-10px_rgba(45,55,72,0.1)] text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#f4ddd4] border border-[#d98e73] flex items-center justify-center text-[#d98e73]">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-bold text-[#2d3748] mb-2 font-serif">
          Terjadi Kesalahan Tak Terduga
        </h2>
        <p className="text-xs sm:text-sm text-[#4a5568] mb-6 leading-relaxed">
          Sistem mengalami sedikit kendala saat memuat data. Tenang, data refleksi Anda yang telah tersimpan tetap aman.
        </p>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mb-6 p-3 bg-[#f4ddd4]/50 border border-[#d98e73]/60 rounded-2xl text-left overflow-x-auto text-xs font-mono text-[#a6634b]">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#6b8e7d] hover:bg-[#4a6b5b] text-white rounded-full text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
          <a
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#f5f0eb] hover:bg-[#eae2d8] text-[#4a5568] hover:text-[#2d3748] rounded-full text-xs sm:text-sm font-semibold transition-all border border-[#e4e2df]"
          >
            <Home className="w-4 h-4" />
            Kembali ke Beranda
          </a>
        </div>
      </div>
    </div>
  );
}
