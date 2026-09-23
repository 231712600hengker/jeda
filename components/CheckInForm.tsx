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
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Flame,
  Battery,
  Moon,
  TrendingUp,
  Tags,
} from 'lucide-react';

interface CheckInFormProps {
  userId: string;
  onSave: (checkinData: Omit<CheckinItem, 'id' | 'createdAt'>) => Promise<DetectionResult>;
  onCancel: () => void;
  existingTodayCheckin?: CheckinItem | null;
}

export default function CheckInForm({
  userId,
  onSave,
  onCancel,
  existingTodayCheckin,
}: CheckInFormProps) {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAnxietyLabel = (val: number) => {
    switch (val) {
      case 0:
        return 'Tidak sama sekali (0)';
      case 1:
        return 'Ringan / Sedikit (1)';
      case 2:
        return 'Sedang / Cukup mengganggu (2)';
      case 3:
        return 'Berat / Sangat terasa (3)';
      default:
        return `${val}`;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              <Clock className="w-3.5 h-3.5" />
              <span>EMA Check-in &lt; 2 Menit</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">
              Catatan Kondisi Hari Ini
            </h2>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Langkah</span>
            <div className="font-mono text-sm font-semibold text-emerald-400">
              {currentStep + 1} / {steps.length}
            </div>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-5 gap-1.5 mb-8">
          {steps.map((st, i) => (
            <button
              key={st.id}
              onClick={() => setCurrentStep(i)}
              className="h-1.5 rounded-full transition-all cursor-pointer"
              style={{
                backgroundColor:
                  i <= currentStep ? '#10B981' : 'rgba(51, 65, 85, 0.4)',
              }}
              title={st.title}
            />
          ))}
        </div>

        {/* Step 0: Kecemasan (GAD-2 Adaptation) */}
        {currentStep === 0 && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-300">
              💡 <strong>Prinsip Momentary Assessment:</strong> Jawab berdasarkan apa yang Anda rasakan{' '}
              <em>pada saat ini</em> (bukan rata-rata minggu lalu).
            </div>

            {/* Q1 */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-200">
                1. Merasa gugup, cemas, atau gelisah saat ini:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAnxietyQ1(val)}
                    className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                      anxietyQ1 === val
                        ? 'bg-emerald-500/20 border-emerald-500 text-white ring-1 ring-emerald-500'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="font-mono text-sm font-bold text-emerald-400 mb-1">{val}</div>
                    <div className="text-[11px] leading-snug">
                      {val === 0 && 'Tidak sama sekali'}
                      {val === 1 && 'Ringan'}
                      {val === 2 && 'Sedang'}
                      {val === 3 && 'Berat'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Q2 */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-200">
                2. Merasa tidak mampu menghentikan atau mengendalikan rasa khawatir saat ini:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAnxietyQ2(val)}
                    className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                      anxietyQ2 === val
                        ? 'bg-emerald-500/20 border-emerald-500 text-white ring-1 ring-emerald-500'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="font-mono text-sm font-bold text-emerald-400 mb-1">{val}</div>
                    <div className="text-[11px] leading-snug">
                      {val === 0 && 'Tidak sama sekali'}
                      {val === 1 && 'Ringan'}
                      {val === 2 && 'Sedang'}
                      {val === 3 && 'Berat'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <span>Skor Kecemasan Gabungan:</span>
              <span className="font-mono font-bold text-slate-200 tabular-nums">
                {anxietyQ1 + anxietyQ2} / 6
                {anxietyQ1 + anxietyQ2 >= 5 && (
                  <span className="text-amber-400 ml-2">⚠️ Mendekati ambang lonjakan akut</span>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Step 1: Kelelahan Mental & Fisik (Chalder Fatigue Scale) */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-300">
              💡 Nilai dari skala <strong>1 (sangat segar/bertenaga)</strong> sampai{' '}
              <strong>10 (sangat lelah luar biasa/terkuras)</strong>.
            </div>

            {/* Q3: Mental Fatigue */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-200">
                  3. Tingkat kelelahan kognitif / mental hari ini:
                </label>
                <span className="font-mono text-base font-bold text-emerald-400 tabular-nums">
                  {fatigueMental} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={fatigueMental}
                onChange={(e) => setFatigueMental(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>1 - Pikiran jernih & segar</span>
                <span>5 - Cukup lelah</span>
                <span>10 - Otak buntu & terkuras</span>
              </div>
            </div>

            {/* Q4: Physical Fatigue */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-200">
                  4. Tingkat kelelahan fisik tubuh hari ini:
                </label>
                <span className="font-mono text-base font-bold text-emerald-400 tabular-nums">
                  {fatiguePhysical} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={fatiguePhysical}
                onChange={(e) => setFatiguePhysical(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>1 - Bugar & berenergi</span>
                <span>5 - Agak letih</span>
                <span>10 - Sangat lelah fisik</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
              <span>Rata-rata Kelelahan:</span>
              <span className="font-mono font-bold text-slate-200 tabular-nums">
                {((fatigueMental + fatiguePhysical) / 2).toFixed(1)} / 10
              </span>
            </div>
          </div>
        )}

        {/* Step 2: Tidur Semalam (PSQI Adaptasi) */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-300">
              💡 Gangguan tidur seringkali menjadi indikator awal yang menyertai akumulasi stres skripsi.
            </div>

            {/* Q5: Kuantitas Tidur */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-200">
                5. Berapa durasi tidur Anda semalam?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(['< 5 jam', '5-6 jam', '6-7 jam', '7-8 jam', '> 8 jam'] as SleepQuantity[]).map(
                  (val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSleepQuantity(val)}
                      className={`p-3 rounded-xl border text-xs font-medium text-center transition-all ${
                        sleepQuantity === val
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                      }`}
                    >
                      {val}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Q6: Kualitas Tidur */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-200">
                6. Bagaimana kualitas tidur Anda semalam?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'buruk', label: 'Buruk', desc: 'Sering terbangun / gelisah' },
                  { id: 'cukup', label: 'Cukup', desc: 'Tidur lumayan nyenyak' },
                  { id: 'baik', label: 'Baik', desc: 'Nyenyak & bangun segar' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSleepQuality(item.id as SleepQuality)}
                    className={`p-3 rounded-xl border text-xs text-left transition-all ${
                      sleepQuality === item.id
                        ? 'bg-emerald-500/20 border-emerald-500 text-white ring-1 ring-emerald-500'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="font-semibold text-emerald-400 capitalize mb-0.5">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-400">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Progres & Efikasi Skripsi (Custom konteks skripsi) */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-300">
              💡 Digunakan untuk mendeteksi pola stagnasi berkelanjutan sebelum memicu kelelahan kronis.
            </div>

            {/* Q7: Progres */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-200">
                7. Progres pengerjaan skripsi yang Anda rasakan hari ini:
              </label>
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {[
                  { val: 1, label: 'Sangat Mandek', short: 'Buntu' },
                  { val: 2, label: 'Sedikit Progres', short: 'Lambat' },
                  { val: 3, label: 'Cukup Progres', short: 'Sedang' },
                  { val: 4, label: 'Lancar / Baik', short: 'Lancar' },
                  { val: 5, label: 'Sangat Produktif', short: 'Optimal' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setProgress(item.val)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      progress === item.val
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="font-mono text-base font-bold text-white mb-0.5">{item.val}</div>
                    <div className="text-[10px] leading-tight text-slate-400">{item.short}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Q8: Efikasi Diri */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-200">
                8. Keyakinan diri bahwa skripsi dapat diselesaikan sesuai target:
              </label>
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {[
                  { val: 1, label: 'Sangat Ragu', short: 'Pesimis' },
                  { val: 2, label: 'Kurang Yakin', short: 'Ragu' },
                  { val: 3, label: 'Netral', short: 'Cukup' },
                  { val: 4, label: 'Yakin', short: 'Optimis' },
                  { val: 5, label: 'Sangat Yakin', short: 'Mantap' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setSelfEfficacy(item.val)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selfEfficacy === item.val
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="font-mono text-base font-bold text-white mb-0.5">{item.val}</div>
                    <div className="text-[10px] leading-tight text-slate-400">{item.short}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
              <span>Rata-rata Progres & Efikasi:</span>
              <span className="font-mono font-bold text-slate-200 tabular-nums">
                {((progress + selfEfficacy) / 2).toFixed(1)} / 5
              </span>
            </div>
          </div>
        )}

        {/* Step 4: Sumber Stres Hari Ini (Multi-Choice) */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                9. Sumber stres yang Anda rasakan hari ini:
              </label>
              <p className="text-xs text-slate-400 mb-3">
                Dapat dipilih lebih dari satu kategori yang relevan:
              </p>

              <div className="space-y-2">
                {[
                  {
                    id: 'technical' as StressorCategory,
                    title: 'Beban teknis/kognitif',
                    desc: 'Riset, metodologi, pengolahan/analisis data, menulis bab skripsi',
                  },
                  {
                    id: 'guidance_bureaucracy' as StressorCategory,
                    title: 'Bimbingan & birokrasi',
                    desc: 'Proses bimbingan, revisi dosen, administrasi kampus / fakultas',
                  },
                  {
                    id: 'time_management' as StressorCategory,
                    title: 'Manajemen waktu',
                    desc: 'Deadline mendesak, kebingungan prioritas, prokrastinasi',
                  },
                  {
                    id: 'infrastructure' as StressorCategory,
                    title: 'Infrastruktur & lingkungan',
                    desc: 'Tempat kerja, koneksi internet, akses jurnal/buku referensi, lab',
                  },
                  {
                    id: 'personal' as StressorCategory,
                    title: 'Personal & kesehatan',
                    desc: 'Hubungan keluarga/teman, kesehatan fisik, masalah personal',
                  },
                ].map((item) => {
                  const isSelected = stressors.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggleStressor(item.id)}
                      className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500/60 text-slate-100 ring-1 ring-emerald-500/50'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                            : 'border-slate-700 bg-slate-900'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{item.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional reflection note */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-medium text-slate-300">
                Catatan refleksi singkat hari ini (opsional):
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Contoh: Bab 4 baru selesai babak analisis regresi, dosen belum balas email revisi..."
                rows={2}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-6 mt-8">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Batal
            </button>
          )}

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Mengevaluasi & Menyimpan...' : 'Simpan Check-in Hari Ini'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
