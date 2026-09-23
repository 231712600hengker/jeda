'use client';

import React, { useState } from 'react';
import {
  CheckinItem,
  SleepQuantity,
  SleepQuality,
  StressorCategory,
  DetectionResult,
} from '@/types/jeda';
import {
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronLeft,
  Flame,
  Battery,
  Moon,
  TrendingUp,
  Tags,
  Edit3,
  Heart,
  Wind,
} from 'lucide-react';

interface CheckInFormProps {
  userId: string;
  onSave: (checkinData: Omit<CheckinItem, 'id' | 'createdAt'>) => Promise<DetectionResult>;
  onCancel: () => void;
  existingTodayCheckin?: CheckinItem | null;
  onOpenRelaxation?: () => void;
}

export default function CheckInForm({
  userId,
  onSave,
  onCancel,
  existingTodayCheckin,
  onOpenRelaxation,
}: CheckInFormProps) {
  // Mode edit jika user ingin mengubah entri hari ini
  const [isEditing, setIsEditing] = useState(false);
  const hasExistingCheckin = !!existingTodayCheckin;

  // Step state (0: Kecemasan, 1: Kelelahan, 2: Tidur, 3: Progres, 4: Sumber Stres)
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [anxietyQ1, setAnxietyQ1] = useState<number>(existingTodayCheckin?.anxietyQ1 ?? 1);
  const [anxietyQ2, setAnxietyQ2] = useState<number>(existingTodayCheckin?.anxietyQ2 ?? 1);
  const [fatigueMental, setFatigueMental] = useState<number>(existingTodayCheckin?.fatigueMental ?? 5);
  const [fatiguePhysical, setFatiguePhysical] = useState<number>(existingTodayCheckin?.fatiguePhysical ?? 5);
  const [sleepQuantity, setSleepQuantity] = useState<SleepQuantity>(
    existingTodayCheckin?.sleepQuantity ?? '6-7 jam'
  );
  const [sleepQuality, setSleepQuality] = useState<SleepQuality>(
    existingTodayCheckin?.sleepQuality ?? 'cukup'
  );
  const [progress, setProgress] = useState<number>(existingTodayCheckin?.progress ?? 3);
  const [selfEfficacy, setSelfEfficacy] = useState<number>(existingTodayCheckin?.selfEfficacy ?? 3);
  const [stressors, setStressors] = useState<StressorCategory[]>(
    existingTodayCheckin?.stressors ?? []
  );
  const [note, setNote] = useState<string>(existingTodayCheckin?.note ?? '');

  const steps = [
    { id: 0, title: 'Kecemasan Saat Ini', icon: Flame, desc: 'Adaptasi GAD-2 Momentary (0-3)' },
    { id: 1, title: 'Kelelahan Mental & Fisik', icon: Battery, desc: 'Chalder Fatigue Scale (1-10)' },
    { id: 2, title: 'Tidur Semalam', icon: Moon, desc: 'Durasi & Kualitas Istirahat' },
    { id: 3, title: 'Progres & Efikasi Skripsi', icon: TrendingUp, desc: 'Persepsi Kemajuan Hari Ini' },
    { id: 4, title: 'Sumber Stres Hari Ini', icon: Tags, desc: 'Pemetaan Hambatan Terbesar' },
  ];

  const handleToggleStressor = (cat: StressorCategory) => {
    if (stressors.includes(cat)) {
      setStressors(stressors.filter((s) => s !== cat));
    } else {
      setStressors([...stressors, cat]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const now = new Date();
    const checkinDate = now.toISOString().split('T')[0];
    const checkinTime = now.toISOString();

    const checkinPayload: Omit<CheckinItem, 'id' | 'createdAt'> = {
      userId,
      checkinDate,
      checkinTime,
      anxietyQ1,
      anxietyQ2,
      fatigueMental,
      fatiguePhysical,
      sleepQuantity,
      sleepQuality,
      progress,
      selfEfficacy,
      stressors,
      note,
    };

    try {
      await onSave(checkinPayload);
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── 1. TAMPILAN JIKA SUDAH CHECK-IN HARI INI (Serene Hearth Sanctuary) ───
  if (hasExistingCheckin && !isEditing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 animate-fade-in">
        <div className="bg-white border border-[#e4e2df] rounded-3xl p-6 sm:p-10 shadow-[0_10px_25px_-5px_rgba(107,142,125,0.08),0_8px_10px_-6px_rgba(107,142,125,0.04)] text-center">
          {/* Calming Warm Icon */}
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#e8efea] border border-[#c5ebd7] flex items-center justify-center text-[#4a6b5b] shadow-inner">
            <Heart className="w-8 h-8 fill-[#6b8e7d]/20 text-[#4a6b5b]" />
          </div>

          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-[#e8efea] text-[#4a6b5b] border border-[#c5ebd7] mb-3">
            Refleksi Hari Ini Selesai
          </span>

          <h2 className="text-2xl sm:text-3xl font-bold text-[#2d3748] mb-3 font-serif">
            Terima Kasih Sudah Hadir untuk Dirimu
          </h2>

          <p className="text-base sm:text-lg text-[#4a5568] max-w-lg mx-auto mb-8 leading-relaxed font-sans">
            &ldquo;Terima kasih sudah meluangkan waktu untuk dirimu hari ini. Istirahatlah, kamu sudah berjuang dengan baik hari ini.&rdquo;
          </p>

          {/* Today's Summary Card */}
          <div className="bg-[#fbf9f6] border border-[#e4e2df] rounded-2xl p-5 mb-8 text-left space-y-3">
            <div className="text-xs font-semibold text-[#4a5568] uppercase tracking-wider flex items-center justify-between border-b border-[#e4e2df] pb-2">
              <span>Ringkasan Refleksi Hari Ini</span>
              <span className="font-mono text-[#6b8e7d]">{existingTodayCheckin.checkinDate}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-1">
              <div className="p-3 bg-white rounded-xl border border-[#e4e2df]">
                <div className="text-[11px] text-[#a0aec0]">Cemas (0-6)</div>
                <div className="text-lg font-bold text-[#2d3748] mt-0.5">
                  {existingTodayCheckin.anxietyQ1 + existingTodayCheckin.anxietyQ2}/6
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#e4e2df]">
                <div className="text-[11px] text-[#a0aec0]">Lelah (1-10)</div>
                <div className="text-lg font-bold text-[#2d3748] mt-0.5">
                  {((existingTodayCheckin.fatigueMental + existingTodayCheckin.fatiguePhysical) / 2).toFixed(1)}
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#e4e2df]">
                <div className="text-[11px] text-[#a0aec0]">Tidur Semalam</div>
                <div className="text-xs font-semibold text-[#2d3748] mt-1.5">
                  {existingTodayCheckin.sleepQuantity}
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#e4e2df]">
                <div className="text-[11px] text-[#a0aec0]">Progres Skripsi</div>
                <div className="text-lg font-bold text-[#6b8e7d] mt-0.5">
                  {existingTodayCheckin.progress}/5
                </div>
              </div>
            </div>

            {existingTodayCheckin.note && (
              <div className="text-xs text-[#4a5568] bg-white p-3 rounded-xl border border-[#e4e2df] italic">
                &ldquo;{existingTodayCheckin.note}&rdquo;
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold text-[#4a5568] bg-[#f5f0eb] hover:bg-[#eae2d8] border border-[#e4e2df] transition-all cursor-pointer active:scale-[0.98]"
            >
              <Edit3 className="w-4 h-4 text-[#6b8e7d]" />
              <span>Perbarui Catatan / Jawaban Hari Ini</span>
            </button>

            {onOpenRelaxation && (
              <button
                onClick={onOpenRelaxation}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold text-white bg-[#6b8e7d] hover:bg-[#4a6b5b] shadow-[0_4px_16px_rgba(107,142,125,0.25)] transition-all cursor-pointer active:scale-[0.98]"
              >
                <Wind className="w-4 h-4" />
                <span>Butuh Jeda Sekarang (Latihan Napas &amp; Grounding)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── 2. TAMPILAN FORM PENGISIAN 9 ITEM (Serene Hearth Form) ───
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      {/* Banner mode edit jika memperbarui */}
      {isEditing && (
        <div className="mb-4 p-3.5 bg-[#e8efea] border border-[#c5ebd7] rounded-2xl flex items-center justify-between text-xs text-[#4a6b5b]">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-[#6b8e7d]" />
            <span>Sedang memperbarui catatan refleksi hari ini.</span>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-xs font-semibold text-[#2c4d3f] underline hover:no-underline cursor-pointer"
          >
            Batal Ubah
          </button>
        </div>
      )}

      {/* Main Form Container */}
      <div className="bg-white border border-[#e4e2df] rounded-3xl p-6 sm:p-8 shadow-[0_10px_25px_-5px_rgba(107,142,125,0.08),0_8px_10px_-6px_rgba(107,142,125,0.04)]">
        {/* Step Progress Indicators */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6b8e7d] font-sans">
              Langkah {currentStep + 1} dari {steps.length}
            </span>
            <span className="text-xs text-[#a0aec0] flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" /> &lt; 2 menit
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {steps.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStep
                    ? 'bg-[#6b8e7d]'
                    : idx < currentStep
                    ? 'bg-[#c5ebd7]'
                    : 'bg-[#eae2d8]'
                }`}
                title={s.title}
              />
            ))}
          </div>
        </div>

        {/* Step Header */}
        <div className="flex items-start gap-4 mb-6 pb-4 border-b border-[#e4e2df]">
          <div className="w-12 h-12 rounded-2xl bg-[#e8efea] border border-[#c5ebd7] flex items-center justify-center text-[#4a6b5b] shrink-0">
            {React.createElement(steps[currentStep].icon, { className: 'w-6 h-6' })}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2d3748] font-serif">
              {steps[currentStep].title}
            </h2>
            <p className="text-xs sm:text-sm text-[#4a5568] mt-0.5">
              {steps[currentStep].desc}
            </p>
          </div>
        </div>

        {/* ─── STEP 0: KECEMASAN (GAD-2) ─── */}
        {currentStep === 0 && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 bg-[#fbf9f6] border border-[#e4e2df] rounded-2xl text-xs text-[#4a5568] leading-relaxed">
              💡 <em>Refleksikan apa yang kamu rasakan secara spontan hari ini. Tidak ada jawaban yang salah.</em>
            </div>

            {/* Q1 */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[#2d3748] leading-snug">
                1. Merasa gugup, cemas, atau gelisah saat memikirkan skripsi?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { val: 0, label: 'Tidak sama sekali' },
                  { val: 1, label: 'Beberapa saat' },
                  { val: 2, label: 'Lebih dari separuh hari' },
                  { val: 3, label: 'Hampir sepanjang hari' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setAnxietyQ1(item.val)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      anxietyQ1 === item.val
                        ? 'bg-[#6b8e7d] border-[#4a6b5b] text-white shadow-md'
                        : 'bg-[#fbf9f6] border-[#e4e2df] text-[#4a5568] hover:bg-[#f5f0eb]'
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.val} — {item.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Q2 */}
            <div className="space-y-3 pt-2">
              <label className="block text-sm font-medium text-[#2d3748] leading-snug">
                2. Tidak mampu menghentikan atau mengendalikan rasa khawatir?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { val: 0, label: 'Tidak sama sekali' },
                  { val: 1, label: 'Beberapa saat' },
                  { val: 2, label: 'Lebih dari separuh hari' },
                  { val: 3, label: 'Hampir sepanjang hari' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setAnxietyQ2(item.val)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      anxietyQ2 === item.val
                        ? 'bg-[#6b8e7d] border-[#4a6b5b] text-white shadow-md'
                        : 'bg-[#fbf9f6] border-[#e4e2df] text-[#4a5568] hover:bg-[#f5f0eb]'
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.val} — {item.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 1: KELELAHAN (Chalder Fatigue Scale) ─── */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            {/* Mental Fatigue Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#2d3748]">
                  3. Tingkat Kelelahan Mental (Pikiran / Otak):
                </label>
                <span className="font-mono text-sm font-bold px-3 py-0.5 rounded-full bg-[#e8efea] text-[#4a6b5b]">
                  {fatigueMental} / 10
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={fatigueMental}
                onChange={(e) => setFatigueMental(Number(e.target.value))}
                className="w-full h-2.5 bg-[#eae2d8] rounded-full appearance-none cursor-pointer accent-[#6b8e7d]"
              />
              <div className="flex justify-between text-[11px] text-[#a0aec0]">
                <span>1 — Segar Bugar</span>
                <span>5 — Cukup Lelah</span>
                <span>10 — Otak Buntu / Habis Daya</span>
              </div>
            </div>

            {/* Physical Fatigue Slider */}
            <div className="space-y-3 pt-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#2d3748]">
                  4. Tingkat Kelelahan Fisik (Tubuh / Energi):
                </label>
                <span className="font-mono text-sm font-bold px-3 py-0.5 rounded-full bg-[#f4ddd4] text-[#a6634b]">
                  {fatiguePhysical} / 10
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={fatiguePhysical}
                onChange={(e) => setFatiguePhysical(Number(e.target.value))}
                className="w-full h-2.5 bg-[#eae2d8] rounded-full appearance-none cursor-pointer accent-[#d98e73]"
              />
              <div className="flex justify-between text-[11px] text-[#a0aec0]">
                <span>1 — Sangat Berenergi</span>
                <span>5 — Pegal Normal</span>
                <span>10 — Sangat Letih / Terkuras</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 2: TIDUR SEMALAM ─── */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            {/* Sleep Quantity */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[#2d3748]">
                5. Berapa perkiraan durasi tidur Anda semalam?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(['< 5 jam', '5-6 jam', '6-7 jam', '7-8 jam', '> 8 jam'] as SleepQuantity[]).map(
                  (qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setSleepQuantity(qty)}
                      className={`p-3 rounded-2xl text-center border text-xs font-semibold transition-all cursor-pointer ${
                        sleepQuantity === qty
                          ? 'bg-[#6b8e7d] border-[#4a6b5b] text-white shadow-md'
                          : 'bg-[#fbf9f6] border-[#e4e2df] text-[#4a5568] hover:bg-[#f5f0eb]'
                      }`}
                    >
                      {qty}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Sleep Quality */}
            <div className="space-y-3 pt-3">
              <label className="block text-sm font-medium text-[#2d3748]">
                6. Bagaimana kualitas tidur semalam saat bangun?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { val: 'buruk' as SleepQuality, label: 'Buruk', desc: 'Sering terbangun / tidak nyenyak' },
                  { val: 'cukup' as SleepQuality, label: 'Cukup', desc: 'Biasa saja, cukup istirahat' },
                  { val: 'baik' as SleepQuality, label: 'Baik', desc: 'Nyenyak dan terasa pulih' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setSleepQuality(item.val)}
                    className={`p-3.5 rounded-2xl text-center border transition-all cursor-pointer ${
                      sleepQuality === item.val
                        ? 'bg-[#6b8e7d] border-[#4a6b5b] text-white shadow-md'
                        : 'bg-[#fbf9f6] border-[#e4e2df] text-[#4a5568] hover:bg-[#f5f0eb]'
                    }`}
                  >
                    <div className="text-sm font-bold capitalize">{item.label}</div>
                    <div className={`text-[11px] mt-1 ${sleepQuality === item.val ? 'text-white/80' : 'text-[#a0aec0]'}`}>
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 3: PROGRES & EFIKASI SKRIPSI ─── */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            {/* Progress Likert */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#2d3748]">
                  7. Kepuasan atas progres pengerjaan skripsi hari ini:
                </label>
                <span className="font-mono text-sm font-bold px-3 py-0.5 rounded-full bg-[#e8efea] text-[#4a6b5b]">
                  {progress} / 5
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { val: 1, label: 'Sangat Sedikit / Nihil' },
                  { val: 2, label: 'Kurang Puas' },
                  { val: 3, label: 'Ada Kemajuan' },
                  { val: 4, label: 'Memuaskan' },
                  { val: 5, label: 'Sangat Signifikan' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setProgress(item.val)}
                    className={`p-2.5 rounded-2xl text-center border transition-all cursor-pointer ${
                      progress === item.val
                        ? 'bg-[#6b8e7d] border-[#4a6b5b] text-white shadow-md'
                        : 'bg-[#fbf9f6] border-[#e4e2df] text-[#4a5568] hover:bg-[#f5f0eb]'
                    }`}
                  >
                    <div className="text-sm font-bold">{item.val}</div>
                    <div className={`text-[10px] mt-0.5 line-clamp-2 ${progress === item.val ? 'text-white/80' : 'text-[#a0aec0]'}`}>
                      {item.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Self-Efficacy Likert */}
            <div className="space-y-3 pt-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#2d3748]">
                  8. Keyakinan mampu menyelesaikan target esok hari:
                </label>
                <span className="font-mono text-sm font-bold px-3 py-0.5 rounded-full bg-[#f4ddd4] text-[#a6634b]">
                  {selfEfficacy} / 5
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { val: 1, label: 'Sangat Pesimis' },
                  { val: 2, label: 'Ragu-ragu' },
                  { val: 3, label: 'Cukup Yakin' },
                  { val: 4, label: 'Yakin' },
                  { val: 5, label: 'Sangat Percaya Diri' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setSelfEfficacy(item.val)}
                    className={`p-2.5 rounded-2xl text-center border transition-all cursor-pointer ${
                      selfEfficacy === item.val
                        ? 'bg-[#d98e73] border-[#a6634b] text-white shadow-md'
                        : 'bg-[#fbf9f6] border-[#e4e2df] text-[#4a5568] hover:bg-[#f5f0eb]'
                    }`}
                  >
                    <div className="text-sm font-bold">{item.val}</div>
                    <div className={`text-[10px] mt-0.5 line-clamp-2 ${selfEfficacy === item.val ? 'text-white/80' : 'text-[#a0aec0]'}`}>
                      {item.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 4: SUMBER STRES (Multi-choice) ─── */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[#2d3748]">
                9. Sumber hambatan atau stres terbesar hari ini (pilih semua yang relevan):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    cat: 'technical' as StressorCategory,
                    title: 'Beban Teknis & Kognitif',
                    desc: 'Analisis data rumit, coding bug, penulisan bab sulit.',
                  },
                  {
                    cat: 'guidance_bureaucracy' as StressorCategory,
                    title: 'Bimbingan & Birokrasi Dosen',
                    desc: 'Dosen sulit ditemui, revisi tiada henti, administrasi.',
                  },
                  {
                    cat: 'time_management' as StressorCategory,
                    title: 'Manajemen Waktu & Prokrastinasi',
                    desc: 'Deadline menumpuk, menunda-nunda, sulit fokus.',
                  },
                  {
                    cat: 'infrastructure' as StressorCategory,
                    title: 'Lingkungan & Fasilitas',
                    desc: 'Koneksi internet lambat, ruang belajar kurang kondusif.',
                  },
                  {
                    cat: 'personal' as StressorCategory,
                    title: 'Personal & Ekspektasi',
                    desc: 'Keluarga, finansial, membandingkan diri dengan teman.',
                  },
                ].map((item) => {
                  const isSelected = stressors.includes(item.cat);
                  return (
                    <button
                      key={item.cat}
                      type="button"
                      onClick={() => handleToggleStressor(item.cat)}
                      className={`p-3.5 rounded-2xl text-left border flex items-start gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#e8efea] border-[#6b8e7d] text-[#2c4d3f] shadow-sm'
                          : 'bg-[#fbf9f6] border-[#e4e2df] text-[#4a5568] hover:bg-[#f5f0eb]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center shrink-0 border transition-all ${
                          isSelected
                            ? 'bg-[#6b8e7d] border-[#6b8e7d] text-white'
                            : 'border-[#a0aec0] bg-white'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#2d3748]">{item.title}</div>
                        <div className="text-[11px] text-[#4a5568] mt-0.5 leading-snug">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional reflection note */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-medium text-[#2d3748]">
                Catatan refleksi bebas hari ini (opsional):
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Bagikan apa saja yang berkecamuk di pikiranmu hari ini..."
                rows={2}
                className="w-full px-4 py-3 bg-[#fbf9f6] border border-[#e4e2df] rounded-2xl text-xs text-[#2d3748] placeholder:text-[#a0aec0] focus:outline-none focus:border-[#6b8e7d] focus:ring-2 focus:ring-[#6b8e7d]/10 resize-none"
              />
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between border-t border-[#e4e2df] pt-6 mt-8">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#4a5568] hover:text-[#2d3748] bg-[#f5f0eb] hover:bg-[#eae2d8] border border-[#e4e2df] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#a0aec0] hover:text-[#4a5568] transition-colors cursor-pointer"
            >
              Batal
            </button>
          )}

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-[#6b8e7d] hover:bg-[#4a6b5b] shadow-[0_4px_14px_rgba(107,142,125,0.25)] flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.015] active:scale-[0.98]"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-7 py-2.5 rounded-full text-xs font-semibold text-white bg-[#6b8e7d] hover:bg-[#4a6b5b] shadow-[0_6px_20px_rgba(107,142,125,0.3)] flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 hover:scale-[1.015] active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Menyimpan...'
                  : isEditing
                  ? 'Perbarui Refleksi Hari Ini'
                  : 'Selesaikan Refleksi Hari Ini'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
