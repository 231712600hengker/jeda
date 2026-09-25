'use client';

import React from 'react';
import type { AlertRecord } from '@/types/jeda';
import { AlertTriangle, ShieldAlert, CheckCircle2, Download, Wind, HeartHandshake } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  alert: AlertRecord | null;
  onDismiss: () => void;
  onExportData: () => void;
  onOpenRelaxation?: () => void;
  onOpenSupport?: () => void;
}

export default function AlertModal({
  isOpen,
  alert,
  onDismiss,
  onExportData,
  onOpenRelaxation,
  onOpenSupport,
}: AlertModalProps) {
  if (!isOpen || !alert) return null;

  const isChronic = alert.alertType === 'chronic';
  const isQuickAlert = alert.alertData.source === 'quick';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d3748]/40 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div
        className={`bg-white border rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-[0_20px_35px_-10px_rgba(45,55,72,0.12),0_1px_3px_0_rgba(107,142,125,0.06)] text-[#2d3748] my-8 ${
          isChronic ? 'border-[#d98e73]' : 'border-[#e4e2df]'
        }`}
      >
        {/* Header Badge */}
        <div className="flex items-start gap-4 mb-5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              isChronic
                ? 'bg-[#f4ddd4] border-[#d98e73] text-[#a6634b]'
                : 'bg-[#ffe8cc] border-[#d98e73] text-[#b8630b]'
            }`}
          >
            {isChronic ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <div
              className={`text-xs font-semibold uppercase tracking-wider ${
                isChronic ? 'text-[#a6634b]' : 'text-[#b8630b]'
              }`}
            >
              {isChronic ? 'Peringatan Pola Berkepanjangan' : isQuickAlert ? 'Sinyal Check-in Ringkas' : 'Lonjakan Ketegangan Akut'}
            </div>
            <h3 className="text-xl font-bold text-[#2d3748] mt-0.5 tracking-tight font-serif">
              {isChronic ? 'Terdeteksi Pola Stagnasi & Keletihan' : isQuickAlert ? 'Sepertinya kamu sedang membutuhkan jeda.' : 'Tingkat Stres Meningkat Hari Ini'}
            </h3>
          </div>
        </div>

        {/* Technical Reason */}
        <div className="bg-[#fbf9f6] border border-[#e4e2df] rounded-2xl p-4 text-xs text-[#4a5568] mb-5 leading-relaxed">
          <div className="text-[11px] font-semibold text-[#6b8e7d] uppercase tracking-wider mb-1">
            Indikator Refleksi:
          </div>
          <p className="font-mono text-[#2d3748]">{alert.alertData.message}</p>
        </div>

        {/* Narrative & Suggestions per Serene Hearth Philosophy */}
        <div className="space-y-3.5 text-xs sm:text-sm text-[#4a5568] leading-relaxed mb-6 font-sans">
          {isChronic ? (
            <>
              <p>
                Sistem mengamati adanya kombinasi <strong>kelelahan yang menetap</strong> dan{' '}
                <strong>persepsi kemajuan skripsi yang tersendat</strong> dalam 5 hari terakhir.
              </p>
              <div className="bg-[#f4ddd4]/60 border border-[#d98e73]/60 rounded-2xl p-4 text-[#a6634b] space-y-1.5">
                <div className="font-bold text-[#a6634b]">Langkah yang Dianjurkan:</div>
                <ul className="list-disc pl-4 space-y-1 text-xs">
                  <li>Berikan dirimu izin untuk beristirahat penuh 1 hari tanpa membuka dokumen skripsi.</li>
                  <li>Urai masalah teknis menjadi langkah sangat kecil (misal: baca 1 abstrak hari ini).</li>
                  <li>Bicarakan kebuntuan dengan rekan seperjuangan atau manfaatkan bimbingan konseling kampus.</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <p>
                {isQuickAlert ? 'Dari check-in ringkasmu, stres atau energi sedang berada di titik yang berat. Tidak perlu menyelesaikan semuanya sekarang—ambil satu jeda kecil terlebih dahulu.' : 'Kondisi kecemasan atau kelelahanmu sedang berada di titik tinggi saat ini. Tubuh dan pikiranmu sedang memberi sinyal untuk melambat.'}
              </p>
              <div className="bg-[#e8efea] border border-[#c5ebd7] rounded-2xl p-4 text-[#2c4d3f] space-y-1.5">
                <div className="font-bold text-[#4a6b5b]">Saran Menenangkan:</div>
                <ul className="list-disc pl-4 space-y-1 text-xs">
                  <li>Tarik napas dalam-dalam, minum segelas air hangat, dan alihkan pandangan dari layar laptop.</li>
                  <li>Lakukan latihan pernapasan 4-7-8 untuk menyeimbangkan detak jantungmu.</li>
                </ul>
              </div>
            </>
          )}

          <p className="text-xs text-[#a0aec0] italic">
            Catatan ini hadir untuk memeluk prosesmu, bukan menilai performamu. Kamu yang memegang kendali atas langkah berikutnya.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-[#e4e2df]">
          {onOpenRelaxation && (
            <button
              type="button"
              onClick={() => {
                onDismiss();
                onOpenRelaxation();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#e8efea] hover:bg-[#c5ebd7] text-[#4a6b5b] text-xs font-semibold flex items-center justify-center gap-1.5 border border-[#c5ebd7] transition-all cursor-pointer"
            >
              <Wind className="w-3.5 h-3.5 text-[#6b8e7d]" />
              <span>Latihan Relaksasi</span>
            </button>
          )}

          {onOpenSupport && (
            <button type="button" onClick={onOpenSupport} className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-[#c5ebd7] bg-[#e8efea] text-[#4a6b5b] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer">
              <HeartHandshake className="w-3.5 h-3.5" /><span>Cari bantuan</span>
            </button>
          )}

          {isChronic && (
            <button
              type="button"
              onClick={onExportData}
              className="w-full sm:w-auto px-4 py-2.5 rounded-full border border-[#e4e2df] bg-[#f5f0eb] hover:bg-[#eae2d8] text-[#4a5568] hover:text-[#2d3748] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#6b8e7d]" />
              <span>Ekspor Data</span>
            </button>
          )}

          <button
            type="button"
            onClick={onDismiss}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-[#6b8e7d] hover:bg-[#4a6b5b] shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Saya Paham</span>
          </button>
        </div>
      </div>
    </div>
  );
}
