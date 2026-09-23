'use client';

import React, { useState } from 'react';
import type { UserSession } from '@/types/jeda';
import { X, Copy, Check, Download, LogOut, Trash2, BarChart2 } from 'lucide-react';
import { formatDateID } from '@/lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession | null;
  totalCheckins: number;
  firstCheckinDate: string | null;
  lastCheckinDate: string | null;
  onExportCSV: () => void;
  onLogout: () => void;
  onDeleteAccount: () => Promise<void>;
}

export default function SettingsModal({
  isOpen,
  onClose,
  session,
  totalCheckins,
  firstCheckinDate,
  lastCheckinDate,
  onExportCSV,
  onLogout,
  onDeleteAccount,
}: SettingsModalProps) {
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !session) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(session.accessCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDeleteAccount();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d3748]/40 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white border border-[#e4e2df] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-[0_20px_35px_-10px_rgba(45,55,72,0.12),0_1px_3px_0_rgba(107,142,125,0.06)] text-[#2d3748] my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e4e2df] pb-3.5 mb-5">
          <h2 className="text-xl font-bold text-[#2d3748] tracking-tight font-serif">Pengaturan Akun</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#a0aec0] hover:text-[#2d3748] hover:bg-[#f5f0eb] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 text-xs text-[#4a5568]">
          {/* Section 1: Access Code */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#a0aec0] uppercase tracking-wider">
              Kode Akses Anonim Anda
            </label>
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#fbf9f6] border border-[#e4e2df]">
              <span className="font-mono text-base font-bold text-[#2d3748] tracking-widest">
                {session.accessCode}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#e4e2df] hover:bg-[#f5f0eb] text-[#4a5568] hover:text-[#2d3748] text-xs font-semibold shadow-sm transition-colors cursor-pointer active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#6b8e7d]" />
                    <span className="text-[#4a6b5b]">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#6b8e7d]" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-[#a0aec0]">
              Gunakan kode ini untuk masuk kembali ke akun Anda dari ponsel maupun laptop lain.
            </p>
          </div>

          {/* Section 2: Statistics */}
          <div className="p-4 rounded-2xl bg-[#fbf9f6] border border-[#e4e2df] space-y-2.5">
            <div className="text-xs font-semibold text-[#2d3748] flex items-center gap-1.5 mb-1 font-serif">
              <BarChart2 className="w-4 h-4 text-[#6b8e7d]" />
              <span>Statistik Penggunaan</span>
            </div>
            <div className="flex justify-between text-[#4a5568]">
              <span>Total Check-in Tercatat:</span>
              <span className="font-mono font-bold text-[#2d3748]">{totalCheckins} kali</span>
            </div>
            {firstCheckinDate && (
              <div className="flex justify-between text-[#4a5568]">
                <span>Check-in Pertama:</span>
                <span className="text-[#2d3748] font-medium">{formatDateID(firstCheckinDate)}</span>
              </div>
            )}
            {lastCheckinDate && (
              <div className="flex justify-between text-[#4a5568]">
                <span>Check-in Terakhir:</span>
                <span className="text-[#2d3748] font-medium">{formatDateID(lastCheckinDate)}</span>
              </div>
            )}
          </div>

          {/* Section 3: Export Data */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#a0aec0] uppercase tracking-wider">
              Ekspor &amp; Portabilitas Data
            </label>
            <button
              type="button"
              onClick={onExportCSV}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#f5f0eb] hover:bg-[#eae2d8] border border-[#e4e2df] text-[#4a5568] hover:text-[#2d3748] font-semibold text-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#6b8e7d]" />
              <span>Unduh Riwayat Lengkap (Format CSV)</span>
            </button>
            <p className="text-[11px] text-[#a0aec0]">
              Format CSV dapat dibuka di Excel atau Google Sheets dan dibawa saat sesi konseling.
            </p>
          </div>

          {/* Section 4: Logout */}
          <div className="pt-2 border-t border-[#e4e2df]">
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#fbf9f6] hover:bg-[#f5f0eb] border border-[#e4e2df] text-[#4a5568] hover:text-[#2d3748] font-semibold text-xs transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-[#a0aec0]" />
              <span>Keluar dari Sesi Ini</span>
            </button>
          </div>

          {/* Section 5: Delete Account */}
          <div className="pt-2 border-t border-[#e4e2df]">
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-[#d98e73] hover:text-[#a6634b] hover:bg-[#f4ddd4]/40 text-xs font-medium transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Akun &amp; Seluruh Data Saya</span>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-[#f4ddd4]/60 border border-[#d98e73] space-y-2.5 animate-fade-in">
                <div className="text-[#a6634b] font-bold text-xs">
                  Konfirmasi Penghapusan Permanen
                </div>
                <p className="text-[11px] text-[#a6634b]/90 leading-relaxed">
                  Tindakan ini tidak dapat dibatalkan. Seluruh riwayat check-in, alert, dan kode akses Anda akan dihapus seketika dari server.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleDelete}
                    className="flex-1 py-2 px-3 rounded-full bg-[#d98e73] hover:bg-[#a6634b] text-white font-semibold text-xs shadow transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isDeleting ? 'Menghapus...' : 'Ya, Hapus Semuanya'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="py-2 px-4 rounded-full bg-white border border-[#e4e2df] text-[#4a5568] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
