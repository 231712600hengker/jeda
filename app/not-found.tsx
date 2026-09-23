import Link from 'next/link';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-blue-400 border border-slate-700 mb-3">
          404 — Halaman Tidak Ditemukan
        </span>

        <h1 className="text-2xl font-bold text-slate-100 mb-3">
          Sepertinya Anda Tersesat
        </h1>

        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Halaman yang Anda cari tidak tersedia atau alamat URL telah dipindahkan.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg active:scale-95"
        >
          <Home className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

