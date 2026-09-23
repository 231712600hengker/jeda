'use client';

import React from 'react';
import type { AlertRecord } from '@/types/jeda';
import { AlertTriangle, ShieldAlert, CheckCircle2, Download, ArrowRight } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  alert: AlertRecord | null;
  onDismiss: () => void;
  onExportData: () => void;
}

export default function AlertModal({
  isOpen,
  alert,
  onDismiss,
  onExportData,
}: AlertModalProps) {
  if (!isOpen || !alert) return null;

  const isChronic = alert.alertType === 'chronic';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        className={`bg-slate-900 border rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl text-slate-100 animate-fade-in my-8 ${
          isChronic ? 'border-rose-700/70 shadow-rose-950/40' : 'border-amber-600/70 shadow-amber-950/40'
        }`}
      >
        {/* Header Badge */}
        <div className="flex items-start gap-3.5 mb-5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              isChronic
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
            }`}
          >
            {isChronic ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <div
              className={`text-xs font-bold uppercase tracking-wider ${
                isChronic ? 'text-rose-400' : 'text-amber-400'
              }`}
            >
              {isChronic ? 'Deteksi Pola Kronis' : 'Deteksi Lonjakan Stres Akut'}
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5 tracking-tight">
              {isChronic ? 'Pola Stagnasi & Kelelahan Berkelanjutan' : 'Peningkatan Intensitas Stres Hari Ini'}
            </h3>
          </div>
        </div>

        {/* Technical Reason */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-300 mb-5 leading-relaxed">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Indikator yang Terdeteksi:
          </div>
          <p className="font-mono text-slate-200">{alert.alertData.message}</p>
        </div>

        {/* Narrative & Suggestions per PRD 5.4 */}
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed mb-6">
          {isChronic ? (
            <>
              <p>
                Sistem mendeteksi bahwa Anda telah mengalami <strong>kelelahan tinggi yang berkelanjutan</strong>{' '}
                sembari <strong>progres pengerjaan skripsi terasa mandek</strong> dalam beberapa hari terakhir.
              </p>
              <p className="text-slate-400">
                Ini adalah pola penting untuk diperhatikan, karena dapat mengindikasikan awal dari{' '}
                <span className="text-rose-300 font-semibold">burnout akademik</span>.
              </p>
              <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-3 text-rose-200/90 space-y-1">
                <div className="font-semibold text-rose-300">Saran Langkah Selanjutnya:</div>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                  <li>Identifikasi hambatan nyata (kesulitan metodologi, revisi dosen, atau kelelahan kognitif).</li>
                  <li>Diskusikan bersama rekan sebaya atau jadwalkan sesi bimbingan untuk mencari jalan keluar.</li>
                  <li>Pertimbangkan berkonsultasi ke Layanan Bimbingan &amp; Konseling Kampus.</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <p>
                Sistem mendeteksi tingkat kecemasan atau kelelahan yang cukup tinggi pada saat ini.
              </p>
              <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-3 text-amber-200/90 space-y-1">
                <div className="font-semibold text-amber-300">Saran Menenangkan:</div>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                  <li>Luangkan waktu untuk istirahat sejenak atau aktivitas relaksasi pernapasan.</li>
                  <li>Berbagi cerita dengan teman dekat atau keluarga untuk mengurangi beban mental.</li>
                  <li>Hindari memaksakan pengerjaan analisis saat pikiran sedang jenuh.</li>
                </ul>
              </div>
            </>
          )}

          <p className="text-[11px] text-slate-400 italic">
            Laporan ini hanya untuk kesadaran diri Anda sendiri. Anda yang menentukan langkah selanjutnya.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
          {isChronic && (
            <button
              type="button"
              onClick={onExportData}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Ekspor Data Saya</span>
            </button>
          )}

          <button
            type="button"
            onClick={onDismiss}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-950 transition-all flex items-center justify-center gap-1.5 shadow-lg ${
              isChronic
                ? 'bg-rose-400 hover:bg-rose-300 shadow-rose-500/20'
                : 'bg-amber-400 hover:bg-amber-300 shadow-amber-500/20'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Saya Paham</span>
          </button>
        </div>
      </div>
    </div>
  );
}

