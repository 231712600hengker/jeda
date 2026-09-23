'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Clock, LineChart, KeyRound, LogIn, ChevronLeft } from 'lucide-react';

interface LandingHeroProps {
  onStartNew: () => Promise<void>;
  onLogin: (code: string) => Promise<void>;
  onOpenGuide: () => void;
}

export default function LandingHero({ onStartNew, onLogin, onOpenGuide }: LandingHeroProps) {
  const [mode, setMode] = useState<'landing' | 'login'>('landing');
  const [loginCode, setLoginCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStartNewClick = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await onStartNew();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginCode.trim()) {
      setErrorMessage('Harap masukkan kode akses Anda.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await onLogin(loginCode.trim());
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal masuk. Periksa kembali kode Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 flex flex-col items-center justify-center text-center">
      {/* Top Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Ecological Momentary Assessment (EMA)</span>
      </div>

      {/* Main Title & Hero Copy */}
      <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight sm:leading-tight mb-4 max-w-2xl">
        Pantau Ritme Stres &amp; Progres Skripsimu Secara{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
          Anonim
        </span>
      </h1>

      <p className="text-sm sm:text-base text-slate-400 max-w-xl mb-8 leading-relaxed">
        Jeda membantu mahasiswa tingkat akhir merekam kondisi kecemasan, kelelahan, kualitas tidur,
        dan kemajuan tugas akhir setiap hari tanpa recall bias, mendeteksi pola kelelahan kronis
        sebelum memicu burnout.
      </p>

      {/* Error Banner */}
      {errorMessage && (
        <div className="w-full max-w-sm mb-6 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-medium animate-fade-in">
          {errorMessage}
        </div>
      )}

      {/* Actions Section */}
      {mode === 'landing' ? (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm mb-12 animate-fade-in">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleStartNewClick}
            className="w-full sm:w-auto flex-1 px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm text-slate-950 bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <span>{isLoading ? 'Membuat Kode...' : 'Mulai Baru (Anonim)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-xl font-medium text-xs sm:text-sm text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-slate-400" />
            <span>Masuk Kembali</span>
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleLoginSubmit}
          className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-12 text-left animate-fade-in shadow-xl"
        >
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-slate-200">Masukkan Kode Akses Anda:</label>
            <button
              type="button"
              onClick={() => {
                setMode('landing');
                setErrorMessage(null);
              }}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={loginCode}
              onChange={(e) => setLoginCode(e.target.value.toUpperCase())}
              placeholder="Contoh: JD-A7F2K9"
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm tracking-wider text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 uppercase"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl font-semibold text-xs text-slate-950 bg-emerald-500 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Memvalidasi...' : 'Masuk ke Dasbor'}</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-2.5 text-center">
            Kode tersimpan di cloud database — dapat digunakan lintas browser &amp; perangkat.
          </p>
        </form>
      )}

      {/* 3 Core Value Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left mt-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">&lt; 2 Menit Per Hari</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            9 item teradaptasi dari GAD-2, Chalder Fatigue Scale, dan PSQI yang dirancang ringkas
            untuk evaluasi harian saat itu juga (momentary).
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-3">
            <LineChart className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">Dasbor Visualisasi Tren</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            4 grafik interaktif memantau dinamika cemas, kelelahan fisik-mental, progres skripsi,
            dan pemetaan kategori sumber hambatan terbesar.
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">Deteksi Pola Akut vs Kronis</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Algoritma otomatis membedakan lonjakan stres situasional dari pola keletihan kronis
            5-hari (stagnasi pengerjaan skripsi).
          </p>
        </div>
      </div>

      {/* Guide Link Button */}
      <div className="mt-10">
        <button
          onClick={onOpenGuide}
          className="text-xs text-slate-400 hover:text-emerald-400 underline underline-offset-4 transition-colors"
        >
          Pelajari instrumen &amp; metodologi penelitian Jeda →
        </button>
      </div>
    </div>
  );
}

