'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Clock, LineChart, KeyRound, LogIn, ChevronLeft, HeartHandshake } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 flex flex-col items-center justify-center text-center">
      {/* Top Badge: Serene Hearth Style */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e8efea] border border-[#c5ebd7] text-[#4a6b5b] text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-[#6b8e7d]" />
        <span>Ruang Refleksi Mahasiswa Skripsi</span>
      </div>

      {/* Main Title & Hero Copy */}
      <h1 className="text-3xl sm:text-5xl font-bold text-[#2d3748] tracking-tight leading-tight sm:leading-tight mb-5 max-w-2xl font-serif">
        Rehat Sejenak, Sadari Ritme &amp; Langkah Skripsimu Secara{' '}
        <span className="text-[#4a6b5b] underline decoration-[#c5ebd7] decoration-wavy decoration-2 underline-offset-8">
          Anonim
        </span>
      </h1>

      <p className="text-base sm:text-lg text-[#4a5568] max-w-xl mb-10 leading-relaxed font-sans">
        Jeda adalah ruang hening yang aman dan bebas penghakiman. Luangkan 2 menit setiap hari
        untuk menyapa diri, mengenali rasa lelah, dan merawat semangat skripsimu dengan penuh kasih.
      </p>

      {/* Error Banner */}
      {errorMessage && (
        <div className="w-full max-w-md mb-6 p-4 rounded-2xl bg-[#f4ddd4]/80 border border-[#d98e73] text-[#a6634b] text-xs font-medium animate-fade-in text-left">
          {errorMessage}
        </div>
      )}

      {/* Actions Section */}
      {mode === 'landing' ? (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mb-16 animate-fade-in">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleStartNewClick}
            className="w-full sm:w-auto flex-1 px-8 py-3.5 rounded-full font-semibold text-sm text-white bg-[#6b8e7d] hover:bg-[#4a6b5b] shadow-[0_10px_25px_-5px_rgba(107,142,125,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 hover:scale-[1.015] active:scale-[0.98]"
          >
            <span>{isLoading ? 'Menyiapkan Ruang...' : 'Mulai Ruang Refleksi'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full font-medium text-sm text-[#4a5568] hover:text-[#2d3748] bg-[#f5f0eb] hover:bg-[#eae2d8] border border-[#e4e2df] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <KeyRound className="w-4 h-4 text-[#6b8e7d]" />
            <span>Punya Kode Akses</span>
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleLoginSubmit}
          className="w-full max-w-md bg-white border border-[#e4e2df] rounded-3xl p-6 sm:p-8 mb-16 text-left animate-fade-in shadow-[0_10px_25px_-5px_rgba(107,142,125,0.08),0_8px_10px_-6px_rgba(107,142,125,0.04)]"
        >
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-semibold text-[#2d3748]">Masukkan Kode Akses Anda:</label>
            <button
              type="button"
              onClick={() => {
                setMode('landing');
                setErrorMessage(null);
              }}
              className="text-xs text-[#4a5568] hover:text-[#2d3748] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={loginCode}
              onChange={(e) => setLoginCode(e.target.value.toUpperCase())}
              placeholder="Contoh: K7M2P9X4"
              autoFocus
              className="w-full px-4 py-3 rounded-2xl bg-[#fbf9f6] border border-[#e4e2df] font-mono text-base tracking-widest text-[#2d3748] placeholder:text-[#a0aec0] focus:outline-none focus:border-[#6b8e7d] focus:ring-2 focus:ring-[#6b8e7d]/10 uppercase text-center"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-full font-semibold text-sm text-white bg-[#6b8e7d] hover:bg-[#4a6b5b] shadow-[0_4px_16px_rgba(107,142,125,0.25)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Memvalidasi...' : 'Masuk ke Ruang Dasbor'}</span>
            </button>
          </div>
          <p className="text-xs text-[#a0aec0] mt-3.5 text-center leading-relaxed">
            Kode unik Anda tersimpan aman — dapat diakses kapan pun dari ponsel maupun laptop.
          </p>
        </form>
      )}

      {/* 3 Core Value Pillars (Serene Hearth Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full text-left">
        <div className="p-6 rounded-3xl bg-white border border-[#e4e2df] shadow-[0_10px_25px_-5px_rgba(107,142,125,0.06)] hover:shadow-[0_14px_28px_-4px_rgba(107,142,125,0.1)] transition-all">
          <div className="w-10 h-10 rounded-2xl bg-[#e8efea] border border-[#c5ebd7] flex items-center justify-center text-[#4a6b5b] mb-4">
            <Clock className="w-5 h-5 text-[#6b8e7d]" />
          </div>
          <h3 className="text-base font-semibold text-[#2d3748] mb-1.5 font-serif">1 Kali Refleksi Tiap Hari</h3>
          <p className="text-xs sm:text-sm text-[#4a5568] leading-relaxed">
            Pertanyaan sederhana dan ringkas (&lt; 2 menit). Mengajakmu menyapa diri sejenak di tengah padatnya hari tanpa rasa terbebani.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#e4e2df] shadow-[0_10px_25px_-5px_rgba(107,142,125,0.06)] hover:shadow-[0_14px_28px_-4px_rgba(107,142,125,0.1)] transition-all">
          <div className="w-10 h-10 rounded-2xl bg-[#f5f0eb] border border-[#eae2d8] flex items-center justify-center text-[#d98e73] mb-4">
            <LineChart className="w-5 h-5 text-[#d98e73]" />
          </div>
          <h3 className="text-base font-semibold text-[#2d3748] mb-1.5 font-serif">Mengenali Ritme &amp; Pola</h3>
          <p className="text-xs sm:text-sm text-[#4a5568] leading-relaxed">
            Membantumu melihat keterkaitan antara tidur, rasa cemas, dan kemajuan skripsi melalui grafik yang menenangkan mata.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#e4e2df] shadow-[0_10px_25px_-5px_rgba(107,142,125,0.06)] hover:shadow-[0_14px_28px_-4px_rgba(107,142,125,0.1)] transition-all">
          <div className="w-10 h-10 rounded-2xl bg-[#f4ddd4] border border-[#f4ddd4] flex items-center justify-center text-[#a6634b] mb-4">
            <HeartHandshake className="w-5 h-5 text-[#a6634b]" />
          </div>
          <h3 className="text-base font-semibold text-[#2d3748] mb-1.5 font-serif">Pengingat Lembut Saat Lelah</h3>
          <p className="text-xs sm:text-sm text-[#4a5568] leading-relaxed">
            Menemani saat kamu merasa buntu dan menyediakan panduan pernapasan serta relaksasi grounding kapan pun kamu butuh jeda.
          </p>
        </div>
      </div>

      {/* Guide Link Button */}
      <div className="mt-12">
        <button
          onClick={onOpenGuide}
          className="text-xs sm:text-sm text-[#6b8e7d] hover:text-[#4a6b5b] font-medium underline underline-offset-4 transition-colors cursor-pointer"
        >
          Pelajari panduan dan cara kerja Jeda →
        </button>
      </div>
    </div>
  );
}
