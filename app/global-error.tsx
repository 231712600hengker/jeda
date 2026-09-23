'use client';

import { AlertOctagon, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-2xl">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <AlertOctagon className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">
            Terjadi Kesalahan Sistem Kritis
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Aplikasi mengalami masalah pada struktur dasar tampilan.
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Muat Ulang Aplikasi
          </button>
        </div>
      </body>
    </html>
  );
}

