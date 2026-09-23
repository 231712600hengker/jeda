'use client';

import React, { useState } from 'react';
import type { UserSession } from '@/types/jeda';
import { X, Copy, Check, Download, LogOut, Trash2, Shield, Calendar, BarChart2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100 animate-fade-in my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">Pengaturan Akun</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5 text-xs">
          {/* Section 1: Access Code */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Kode Akses Anonim Anda
            </label>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-mono text-base font-bold text-emerald-400 tracking-wider">
                {session.accessCode}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              Gunakan kode ini untuk masuk kembali ke akun Anda dari browser atau perangkat lain.
            </p>
          </div>

          {/* Section 2: Statistics */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
              <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Statistik Penggunaan</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Total Check-in Tercatat:</span>
              <span className="font-mono font-semibold text-white">{totalCheckins} kali</span>
            </div>
            {firstCheckinDate && (
              <div className="flex justify-between text-slate-400">
                <span>Check-in Pertama:</span>
                <span className="text-slate-200">{formatDateID(firstCheckinDate)}</span>
              </div>
            )}
            {lastCheckinDate && (
              <div className="flex justify-between text-slate-400">
                <span>Check-in Terakhir:</span>
                <span className="text-slate-200">{formatDateID(lastCheckinDate)}</span>
              </div>
            )}
          </div>

          {/* Section 3: Export Data */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Ekspor &amp; Dokumentasi
            </label>
            <button
              type="button"
              onClick={() => {
                onExportCSV();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Unduh Riwayat Lengkap (Format CSV)</span>
            </button>
            <p className="text-[10px] text-slate-500">
              Format CSV dapat dibuka di Excel atau Google Sheets dan dibawa saat sesi konseling.
            </p>
          </div>

          {/* Section 4: Logout */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-medium transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span>Keluar dari Sesi Ini</span>
            </button>
          </div>

          {/* Section 5: Delete Account */}
          <div className="pt-2 border-t border-slate-800/80">
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Akun &amp; Seluruh Data Saya</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/80 space-y-2.5 animate-fade-in">
                <div className="text-rose-200 font-semibold text-xs">
                  Konfirmasi Penghapusan Permanen
                </div>
                <p className="text-[11px] text-rose-300/80 leading-snug">
                  Tindakan ini tidak dapat dibatalkan. Seluruh riwayat check-in, alert, dan kode akses
                  Anda akan dihapus seketika dari server Supabase.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleDelete}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? 'Menghapus...' : 'Ya, Hapus Semuanya'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
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

