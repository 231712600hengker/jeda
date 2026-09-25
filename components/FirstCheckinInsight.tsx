'use client';

import { Heart, Sparkles, Wind } from 'lucide-react';

interface FirstCheckinInsightProps {
  anxietyScore: number;
  fatigueScore: number;
  progressScore: number;
  onOpenRelaxation: () => void;
  onContinue: () => void;
}

/**
 * Feedback pertama adalah baseline, bukan kesimpulan klinis atau pola.
 * Pola baru ditampilkan setelah aplikasi memiliki beberapa check-in.
 */
export default function FirstCheckinInsight({
  anxietyScore,
  fatigueScore,
  progressScore,
  onOpenRelaxation,
  onContinue,
}: FirstCheckinInsightProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#2d3748]/40 p-4 backdrop-blur-sm animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="first-checkin-title"
        className="my-8 w-full max-w-lg rounded-3xl border border-[#e4e2df] bg-white p-6 text-[#2d3748] shadow-[0_20px_35px_-10px_rgba(45,55,72,0.18)] sm:p-8"
      >
        <div className="mb-5 flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#c5ebd7] bg-[#e8efea] text-[#4a6b5b]">
            <Heart className="h-6 w-6 fill-[#6b8e7d]/20" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6b8e7d]">Check-in pertama selesai</p>
            <h2 id="first-checkin-title" className="font-serif text-xl font-bold">Terima kasih sudah menyapa dirimu.</h2>
          </div>
        </div>

        <p className="mb-5 text-sm leading-relaxed text-[#4a5568]">
          Ini adalah baseline hari ini, bukan penilaian atas dirimu. Tidak ada yang perlu kamu perbaiki sekarang juga.
        </p>

        <div className="mb-5 grid grid-cols-3 gap-2.5 rounded-2xl border border-[#e4e2df] bg-[#fbf9f6] p-3 text-center">
          <div className="rounded-xl border border-[#e4e2df] bg-white p-2.5">
            <p className="text-[10px] text-[#a0aec0]">Cemas</p>
            <p className="mt-0.5 text-lg font-bold">{anxietyScore}<span className="text-xs text-[#a0aec0]">/6</span></p>
          </div>
          <div className="rounded-xl border border-[#e4e2df] bg-white p-2.5">
            <p className="text-[10px] text-[#a0aec0]">Lelah</p>
            <p className="mt-0.5 text-lg font-bold">{fatigueScore.toFixed(1)}<span className="text-xs text-[#a0aec0]">/10</span></p>
          </div>
          <div className="rounded-xl border border-[#e4e2df] bg-white p-2.5">
            <p className="text-[10px] text-[#a0aec0]">Progres</p>
            <p className="mt-0.5 text-lg font-bold text-[#4a6b5b]">{progressScore.toFixed(1)}<span className="text-xs text-[#a0aec0]">/5</span></p>
          </div>
        </div>

        <div className="mb-6 flex gap-3 rounded-2xl border border-[#c5ebd7] bg-[#e8efea]/70 p-4 text-xs leading-relaxed text-[#2c4d3f]">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#6b8e7d]" />
          <p><strong>Langkah berikutnya:</strong> cukup hadir lagi dua kali. Setelah tiga check-in, Jeda mulai membantu melihat perubahan kecil dengan lebih bermakna.</p>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onContinue} className="rounded-full px-5 py-2.5 text-xs font-semibold text-[#4a5568] transition-colors hover:text-[#2d3748]">
            Lihat dasbor
          </button>
          <button type="button" onClick={onOpenRelaxation} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6b8e7d] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#4a6b5b]">
            <Wind className="h-4 w-4" /> Ambil jeda 3 menit
          </button>
        </div>
      </div>
    </div>
  );
}
