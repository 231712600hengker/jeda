import Link from 'next/link';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#2d3748] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-[#e4e2df] rounded-3xl p-8 text-center shadow-[0_20px_35px_-10px_rgba(45,55,72,0.1)]">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#e8efea] border border-[#c5ebd7] flex items-center justify-center text-[#4a6b5b]">
          <Compass className="w-8 h-8" />
        </div>

        <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-[#e8efea] text-[#4a6b5b] border border-[#c5ebd7] mb-3">
          404 — Halaman Tidak Ditemukan
        </span>

        <h1 className="text-2xl font-bold text-[#2d3748] mb-3 font-serif">
          Ruang yang Dicari Belum Tersedia
        </h1>

        <p className="text-xs sm:text-sm text-[#4a5568] mb-6 leading-relaxed">
          Halaman yang Anda tuju mungkin telah berpindah alamat atau belum tersedia.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#6b8e7d] hover:bg-[#4a6b5b] text-white rounded-full text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
