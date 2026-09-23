'use client';

import React, { useState, useEffect } from 'react';
import { X, Wind, Eye, Hand, Volume2, Sparkles, RefreshCw, Play, Pause, Heart } from 'lucide-react';

interface RelaxationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'breathing' | 'grounding';
}

export default function RelaxationModal({
  isOpen,
  onClose,
  defaultTab = 'breathing',
}: RelaxationModalProps) {
  const [activeTab, setActiveTab] = useState<'breathing' | 'grounding'>(defaultTab);

  // ─── 4-7-8 Breathing State ───
  // cycle: 'inhale' (4s), 'hold' (7s), 'exhale' (8s)
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [secondsRemaining, setSecondsRemaining] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab);
  }, [defaultTab, isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isOpen && isBreathingActive) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Transition phase
            if (breathPhase === 'inhale') {
              setBreathPhase('hold');
              return 7;
            } else if (breathPhase === 'hold') {
              setBreathPhase('exhale');
              return 8;
            } else {
              setBreathPhase('inhale');
              setCyclesCompleted((c) => c + 1);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, isBreathingActive, breathPhase]);

  const handleResetBreathing = () => {
    setIsBreathingActive(false);
    setBreathPhase('inhale');
    setSecondsRemaining(4);
    setCyclesCompleted(0);
  };

  // ─── 5-4-3-2-1 Grounding State ───
  const [groundingStep, setGroundingStep] = useState(0);
  const groundingSteps = [
    {
      num: 5,
      sense: 'Penglihatan (Melihat)',
      icon: Eye,
      title: 'Sebutkan 5 hal yang bisa kamu LIHAT di sekitarmu',
      desc: 'Bisa berupa pola dinding, pantulan cahaya di meja, warna pulpen, daun tanaman di luar jendela, atau bayangan buku.',
      hint: 'Lihat dengan saksama tanpa menilai. Sadari keberadaannya di ruang ini.',
    },
    {
      num: 4,
      sense: 'Sentuhan (Sensasi Fisik)',
      icon: Hand,
      title: 'Rasakan 4 hal yang menyentuh TUBUHMU saat ini',
      desc: 'Sentuhan telapak kaki di lantai, tekstur baju di kulit, punggung yang bersandar di kursi, atau udara sejuk di lenganmu.',
      hint: 'Fokuskan perhatian pada sensasi fisik yang nyata dan membuatmu tertopang aman.',
    },
    {
      num: 3,
      sense: 'Pendengaran (Mendengar)',
      icon: Volume2,
      title: 'Dengarkan 3 SUARA yang ada di sekelilingmu',
      desc: 'Deru pendingin ruangan/kipas, suara kendaraan di kejauhan, desau angin, atau ketukan detak jam.',
      hint: 'Biarkan suara itu datang dan pergi tanpa berusaha menganalisisnya.',
    },
    {
      num: 2,
      sense: 'Penciuman (Membau)',
      icon: Wind,
      title: 'Kenali 2 AROMA yang bisa kamu hirup sekarang',
      desc: 'Aroma kopi, wangi sabun pakaian, udara segar hujan, atau aroma kertas buku skripsimu.',
      hint: 'Jika sulit mencium aroma sekitar, bayangkan aroma favorit yang paling menenangkan hatimu.',
    },
    {
      num: 1,
      sense: 'Afirmasi Diri (Merasakan Kedamaian)',
      icon: Heart,
      title: 'Ucapkan 1 hal baik untuk DIRIMU sendiri',
      desc: '"Aku sudah berusaha semampuku hari ini. Tidak apa-apa untuk melambat dan bernapas sejenak."',
      hint: 'Letakkan tangan di dada, rasakan detak jantungmu yang tenang, dan beri dirimu pelukan hangat.',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d3748]/40 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white border border-[#e4e2df] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-[0_20px_35px_-10px_rgba(45,55,72,0.12),0_1px_3px_0_rgba(107,142,125,0.06)] text-[#2d3748] relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#a0aec0] hover:text-[#2d3748] hover:bg-[#f5f0eb] transition-colors cursor-pointer"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#e8efea] border border-[#c5ebd7] flex items-center justify-center text-[#4a6b5b]">
            <Wind className="w-5 h-5 text-[#6b8e7d]" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#6b8e7d]">
              Ruang Tenang &amp; Sadar Diri
            </div>
            <h2 className="text-xl font-bold text-[#2d3748] font-serif">
              Butuh Jeda Sejenak?
            </h2>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-full bg-[#f5f0eb] border border-[#e4e2df] mb-6">
          <button
            onClick={() => setActiveTab('breathing')}
            className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'breathing'
                ? 'bg-[#6b8e7d] text-white shadow-sm'
                : 'text-[#4a5568] hover:text-[#2d3748]'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Pernapasan 4-7-8</span>
          </button>
          <button
            onClick={() => setActiveTab('grounding')}
            className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'grounding'
                ? 'bg-[#6b8e7d] text-white shadow-sm'
                : 'text-[#4a5568] hover:text-[#2d3748]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Grounding 5-4-3-2-1</span>
          </button>
        </div>

        {/* ─── TAB 1: 4-7-8 BREATHING ─── */}
        {activeTab === 'breathing' && (
          <div className="text-center space-y-6">
            <p className="text-xs sm:text-sm text-[#4a5568] leading-relaxed max-w-sm mx-auto">
              Teknik pernapasan ini membantu menenangkan sistem saraf parasimpatis, meredakan ketegangan dada, dan memperlambat detak jantung saat cemas.
            </p>

            {/* Visual Breathing Circle */}
            <div className="py-6 flex flex-col items-center justify-center">
              <div className="relative w-44 h-44 flex items-center justify-center">
                {/* Pulsing Back Ring */}
                <div
                  className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                    breathPhase === 'inhale'
                      ? 'scale-110 bg-[#c5ebd7]/50 border-2 border-[#6b8e7d]'
                      : breathPhase === 'hold'
                      ? 'scale-105 bg-[#e8efea] border-2 border-[#4a6b5b]'
                      : 'scale-90 bg-[#f5f0eb] border-2 border-[#d98e73]'
                  }`}
                />

                {/* Inner Core */}
                <div className="relative z-10 flex flex-col items-center">
                  <span className="font-mono text-3xl font-extrabold text-[#2d3748]">
                    {isBreathingActive ? secondsRemaining : '4-7-8'}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#4a6b5b] mt-1">
                    {!isBreathingActive
                      ? 'Siap Melangkah'
                      : breathPhase === 'inhale'
                      ? 'Tarik Napas'
                      : breathPhase === 'hold'
                      ? 'Tahan'
                      : 'Hembuskan'}
                  </span>
                </div>
              </div>

              {/* Phase Guidance Text */}
              <div className="mt-4 text-xs font-medium text-[#4a5568]">
                {!isBreathingActive ? (
                  <span>Duduk rileks, tegakkan punggung, lalu tekan Mulai saat siap.</span>
                ) : breathPhase === 'inhale' ? (
                  <span className="text-[#4a6b5b] font-semibold">Tarik napas perlahan lewat hidung (4 detik)</span>
                ) : breathPhase === 'hold' ? (
                  <span className="text-[#2c4d3f] font-semibold">Tahan napas dengan tenang (7 detik)</span>
                ) : (
                  <span className="text-[#d98e73] font-semibold">Keluarkan napas perlahan lewat mulut (8 detik)</span>
                )}
              </div>

              {cyclesCompleted > 0 && (
                <div className="text-[11px] text-[#a0aec0] mt-1 font-mono">
                  Siklus selesai: {cyclesCompleted} putaran
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsBreathingActive((prev) => !prev)}
                className="px-6 py-2.5 rounded-full font-semibold text-xs sm:text-sm text-white bg-[#6b8e7d] hover:bg-[#4a6b5b] shadow-[0_4px_14px_rgba(107,142,125,0.25)] flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                {isBreathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isBreathingActive ? 'Jeda' : cyclesCompleted > 0 ? 'Lanjutkan' : 'Mulai Latihan'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetBreathing}
                className="p-2.5 rounded-full text-[#4a5568] hover:text-[#2d3748] bg-[#f5f0eb] hover:bg-[#eae2d8] border border-[#e4e2df] transition-colors cursor-pointer"
                title="Reset Latihan"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── TAB 2: 5-4-3-2-1 GROUNDING ─── */}
        {activeTab === 'grounding' && (
          <div className="space-y-6">
            <p className="text-xs sm:text-sm text-[#4a5568] leading-relaxed">
              Grounding membantu pikiranmu yang sedang mengembara atau panik untuk kembali berlabuh pada saat ini (<em>here and now</em>) melalui kelima indra.
            </p>

            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-2">
              {groundingSteps.map((step, idx) => (
                <button
                  key={step.num}
                  onClick={() => setGroundingStep(idx)}
                  className={`w-8 h-8 rounded-full text-xs font-bold font-mono transition-all cursor-pointer ${
                    groundingStep === idx
                      ? 'bg-[#6b8e7d] text-white shadow-sm scale-110'
                      : idx < groundingStep
                      ? 'bg-[#c5ebd7] text-[#2c4d3f]'
                      : 'bg-[#f5f0eb] text-[#a0aec0]'
                  }`}
                >
                  {step.num}
                </button>
              ))}
            </div>

            {/* Active Grounding Card */}
            <div className="bg-[#fbf9f6] border border-[#e4e2df] rounded-2xl p-5 space-y-3 animate-fade-in">
              <div className="flex items-center gap-2.5 text-[#6b8e7d]">
                {React.createElement(groundingSteps[groundingStep].icon, { className: 'w-5 h-5' })}
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Langkah {5 - groundingStep} · {groundingSteps[groundingStep].sense}
                </span>
              </div>

              <h3 className="text-base font-bold text-[#2d3748] font-serif leading-snug">
                {groundingSteps[groundingStep].title}
              </h3>

              <p className="text-xs text-[#4a5568] leading-relaxed">
                {groundingSteps[groundingStep].desc}
              </p>

              <div className="p-3 bg-white rounded-xl border border-[#e4e2df] text-[11px] text-[#4a6b5b] italic">
                💡 {groundingSteps[groundingStep].hint}
              </div>
            </div>

            {/* Navigation for Grounding */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                disabled={groundingStep === 0}
                onClick={() => setGroundingStep((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-full text-xs font-semibold text-[#4a5568] hover:text-[#2d3748] bg-[#f5f0eb] hover:bg-[#eae2d8] border border-[#e4e2df] transition-colors cursor-pointer disabled:opacity-40"
              >
                Sebelumnya
              </button>

              {groundingStep < groundingSteps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setGroundingStep((prev) => prev + 1)}
                  className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-[#6b8e7d] hover:bg-[#4a6b5b] shadow-sm transition-all cursor-pointer"
                >
                  Langkah Berikutnya
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-[#6b8e7d] hover:bg-[#4a6b5b] shadow-sm transition-all cursor-pointer"
                >
                  Selesai &amp; Kembali
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

