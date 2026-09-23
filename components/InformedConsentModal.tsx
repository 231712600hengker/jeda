'use client';

import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, AlertCircle } from 'lucide-react';

interface InformedConsentModalProps {
  isOpen: boolean;
  accessCode: string;
  onAgree: () => Promise<void>;
  onDecline: () => void;
}

export default function InformedConsentModal({
  isOpen,
  accessCode,
  onAgree,
  onDecline,
}: InformedConsentModalProps) {
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(accessCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAgree = async () => {
    if (!agreed || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onAgree();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl text-slate-100 animate-fade-in my-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Persetujuan &amp; Kode Akses
            </h2>
            <p className="text-xs text-slate-400">Informed Consent Penggunaan Aplikasi Jeda</p>
          </div>
        </div>

        {/* Access Code Box */}
        <div className="bg-slate-950 border border-emerald-500/40 rounded-xl p-4 mb-5 text-center relative overflow-hidden">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            Simpan Kode Akses Anonim Anda
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-white tracking-wider my-1">
            {accessCode}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
            Catat atau salin kode ini untuk masuk kembali dari perangkat/browser mana pun.
          </p>

          <button
            type="button"
            onClick={handleCopy}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Tersalin ke Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Salin Kode Akses</span>
              </>
            )}
          </button>
        </div>

        {/* Consent Text */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2.5 leading-relaxed max-h-56 overflow-y-auto mb-5">
          <div className="font-semibold text-white">Saya memahami dan menyetujui bahwa:</div>
          <ul className="space-y-1.5 list-disc pl-4 text-slate-300">
            <li>Data yang saya isikan hanya untuk pemantauan pribadi dan kesadaran diri.</li>
            <li>Identitas saya sepenuhnya anonim tanpa nomor induk, email, atau nama lengkap.</li>
            <li>
              Peringatan stres yang muncul adalah indikasi reflektif berbasis ambang batas (EMA),
              bukan diagnosis psikologis klinis resmi.
            </li>
            <li>
              Data saya tidak dikirim secara otomatis ke pihak ketiga atau konselor kampus tanpa
              inisiatif saya sendiri.
            </li>
            <li>
              Saya dapat mengunduh rekaman data ini (ekspor CSV) kapan saja untuk dibawa ke konseling.
            </li>
            <li>
              Saya bebas berhenti dan menghapus seluruh data akun saya kapan saja di menu Pengaturan.
            </li>
          </ul>
        </div>

        {/* Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-slate-800/40 border border-transparent hover:border-slate-800 transition-all mb-6">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 mt-0.5"
          />
          <span className="text-xs text-slate-200 font-medium select-none leading-snug">
            Saya telah membaca, memahami, dan menyetujui ketentuan partisipasi anonim di atas.
          </span>
        </label>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onDecline}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!agreed || isSubmitting}
            onClick={handleAgree}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 transition-all"
          >
            {isSubmitting ? 'Memproses...' : 'Saya Setuju & Mulai'}
          </button>
        </div>
      </div>
    </div>
  );
}

