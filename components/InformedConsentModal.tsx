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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d3748]/40 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white border border-[#e4e2df] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-[0_20px_35px_-10px_rgba(45,55,72,0.12),0_1px_3px_0_rgba(107,142,125,0.06)] text-[#2d3748] my-8">
        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-[#e8efea] border border-[#c5ebd7] flex items-center justify-center text-[#4a6b5b]">
            <ShieldCheck className="w-6 h-6 text-[#6b8e7d]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2d3748] tracking-tight font-serif">
              Ruang Aman &amp; Kode Akses
            </h2>
            <p className="text-xs text-[#a0aec0]">Tiga hal penting sebelum check-in pertamamu</p>
          </div>
        </div>

        {/* Access Code Box */}
        <div className="bg-[#fbf9f6] border border-[#c5ebd7] rounded-2xl p-5 mb-5 text-center relative overflow-hidden shadow-inner">
          <div className="text-[11px] font-semibold text-[#4a6b5b] uppercase tracking-wider mb-1">
            Simpan Kode Akses Unik Anda
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-[#2d3748] tracking-widest my-1.5">
            {accessCode}
          </div>
          <p className="text-xs text-[#4a5568] mt-1 max-w-xs mx-auto leading-relaxed">
            Catat atau salin kode ini untuk masuk kembali dari perangkat ponsel maupun laptop Anda kapan saja.
          </p>

          <button
            type="button"
            onClick={handleCopy}
            className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white border border-[#e4e2df] text-[#4a5568] hover:text-[#2d3748] shadow-sm transition-all cursor-pointer active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#6b8e7d]" />
                <span className="text-[#4a6b5b]">Berhasil Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#6b8e7d]" />
                <span>Salin Kode Akses</span>
              </>
            )}
          </button>
        </div>

        {/* Consent remains before collection; it is intentionally concise at this decision point. */}
        <div className="bg-[#fbf9f6] border border-[#e4e2df] rounded-2xl p-4 text-xs text-[#4a5568] space-y-2 mb-5 leading-relaxed">
          <div className="font-bold text-[#2d3748]">Sebelum kamu mulai:</div>
          <p>
            <strong>Privat secara desain:</strong> Jeda tidak meminta nama, NIM, email, atau nomor HP. Riwayatmu hanya terhubung ke kode akses ini.
          </p>
          <p>
            <strong>Bukan layanan diagnosis:</strong> Jeda adalah ruang refleksi mandiri, bukan pengganti bantuan medis atau psikologis profesional.
          </p>
          <p>
            <strong>Kendalimu tetap penuh:</strong> kamu dapat mengunduh atau menghapus seluruh riwayat melalui Pengaturan kapan saja.
          </p>
        </div>

        {/* Checkbox agreement */}
        <label className="flex items-start gap-3 p-3 rounded-2xl bg-[#e8efea]/60 border border-[#c5ebd7] cursor-pointer mb-6 transition-colors">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-5 h-5 rounded-md mt-0.5 accent-[#6b8e7d] cursor-pointer"
          />
          <span className="text-xs text-[#2c4d3f] leading-relaxed">
            Saya telah membaca dan menyetujui ketentuan privasi di atas, serta memahami bahwa kode akses ini adalah satu-satunya kunci untuk membuka akun saya.
          </span>
        </label>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onDecline}
            className="w-full px-4 py-2.5 rounded-full text-xs font-semibold text-[#a0aec0] hover:text-[#4a5568] transition-colors cursor-pointer sm:w-auto"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={!agreed || isSubmitting}
            onClick={handleAgree}
            className="w-full px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-[#6b8e7d] hover:bg-[#4a6b5b] shadow-sm transition-all cursor-pointer disabled:opacity-40 active:scale-95 sm:w-auto"
          >
            {isSubmitting ? 'Menyiapkan...' : 'Mulai Perjalanan Refleksi'}
          </button>
        </div>
      </div>
    </div>
  );
}
