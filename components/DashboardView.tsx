'use client';

import React, { useState, useMemo } from 'react';
import {
  CheckinItem,
  AlertRecord,
  StressorCategory,
} from '@/types/jeda';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Flame,
  BatteryCharging,
  Moon,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface DashboardViewProps {
  checkins: CheckinItem[];
  alerts: AlertRecord[];
  onOpenCheckin: () => void;
  onExportCSV: () => void;
  onReviewAlert: (alertId: string) => void;
  onLoadDemo: () => void;
}

export default function DashboardView({
  checkins,
  alerts,
  onOpenCheckin,
  onExportCSV,
  onReviewAlert,
  onLoadDemo,
}: DashboardViewProps) {
  const [dayFilter, setDayFilter] = useState<'7' | '14' | '30'>('30');

  // Urutkan checkin kronologis (lama ke baru) untuk grafik
  const chronological = useMemo(() => {
    return [...checkins].sort(
      (a, b) => new Date(a.checkinDate).getTime() - new Date(b.checkinDate).getTime()
    );
  }, [checkins]);

  // Filter berdasarkan hari
  const filteredData = useMemo(() => {
    const days = parseInt(dayFilter, 10);
    if (chronological.length <= days) return chronological;
    return chronological.slice(chronological.length - days);
  }, [chronological, dayFilter]);

  // Cek apakah hari ini sudah check-in
  const todayStr = new Date().toISOString().split('T')[0];
  const latestCheckin = checkins.length > 0 ? checkins[0] : null;
  const hasCheckedInToday = latestCheckin?.checkinDate === todayStr;

  // Hitung streak check-in yang presisi & tahan multi-checkin per hari
  const { streakDays, isStreakActive, past7DaysStatus, nextMilestone, streakProgressPercent } = useMemo(() => {
    if (checkins.length === 0) {
      return {
        streakDays: 0,
        isStreakActive: false,
        past7DaysStatus: [],
        nextMilestone: { target: 3, label: 'Fondasi Konsistensi' },
        streakProgressPercent: 0,
      };
    }

    // Ambil tanggal unik YYYY-MM-DD
    const uniqueDates = new Set(checkins.map((c) => c.checkinDate));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const formatDateKey = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const todayKey = formatDateKey(today);
    const checkedToday = uniqueDates.has(todayKey);

    // Kemarin
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = formatDateKey(yesterday);
    const checkedYesterday = uniqueDates.has(yesterdayKey);

    let streak = 0;
    // Jika hari ini sudah check-in, hitung mundur mulai dari hari ini (hari 0)
    // Jika belum check-in hari ini tetapi kemarin check-in, streak kemarin masih aktif!
    let checkDate = checkedToday ? new Date(today) : (checkedYesterday ? new Date(yesterday) : null);

    if (checkDate) {
      while (true) {
        const key = formatDateKey(checkDate);
        if (uniqueDates.has(key)) {
          streak++;
          // Mundur 1 hari
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Generate status 7 hari terakhir (6 hari lalu sampai hari ini) untuk mini weekly tracker
    const past7: {
      dateKey: string;
      dayName: string;
      dateNum: number;
      isToday: boolean;
      isChecked: boolean;
    }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = formatDateKey(d);
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
      past7.push({
        dateKey: key,
        dayName,
        dateNum: d.getDate(),
        isToday: i === 0,
        isChecked: uniqueDates.has(key),
      });
    }

    // Milestones konsistensi EMA skripsi
    const milestones = [
      { target: 3, label: 'Fondasi Pola Awal' },
      { target: 5, label: 'Ambang Evaluasi Kronis' },
      { target: 7, label: 'Siklus Mingguan Lengkap' },
      { target: 14, label: 'Stabilitas Data Menengah' },
      { target: 30, label: 'Dataset Longitudinal Emas' },
    ];

    const currentTarget = milestones.find((m) => streak < m.target) || {
      target: streak + 10,
      label: 'Konsistensi Luar Biasa',
    };

    const prevTarget = [...milestones].reverse().find((m) => streak >= m.target)?.target || 0;
    const progressRange = currentTarget.target - prevTarget;
    const currentProgress = streak - prevTarget;
    const progressPercent = Math.min(
      100,
      Math.max(0, Math.round((currentProgress / (progressRange || 1)) * 100))
    );

    return {
      streakDays: streak,
      isStreakActive: streak > 0,
      past7DaysStatus: past7,
      nextMilestone: currentTarget,
      streakProgressPercent: progressPercent,
    };
  }, [checkins]);

  // Data untuk Grafik 1 (Kecemasan) & Grafik 2 (Kelelahan) & Grafik 3 (Progres)
  const chartData = useMemo(() => {
    return filteredData.map((c) => {
      const combinedAnxiety = c.anxietyQ1 + c.anxietyQ2;
      const avgFatigue = Number(((c.fatigueMental + c.fatiguePhysical) / 2).toFixed(1));
      const avgProgress = Number(((c.progress + c.selfEfficacy) / 2).toFixed(1));

      // Format label tanggal (contoh: '12 Sep')
      const d = new Date(c.checkinDate);
      const dateLabel = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

      return {
        date: dateLabel,
        rawDate: c.checkinDate,
        kecemasan: combinedAnxiety,
        kelelahan: avgFatigue,
        progres: avgProgress,
        mental: c.fatigueMental,
        fisik: c.fatiguePhysical,
        tidurKuantitas: c.sleepQuantity,
        tidurKualitas: c.sleepQuality,
        acute: c.acuteAlertTriggered,
        chronic: c.chronicAlertTriggered,
      };
    });
  }, [filteredData]);

  // Data untuk Grafik 4 (Distribusi Sumber Stres)
  const stressorDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      'Beban Teknis': 0,
      'Bimbingan Dosen': 0,
      'Manajemen Waktu': 0,
      'Infrastruktur': 0,
      'Personal': 0,
    };

    filteredData.forEach((c) => {
      c.stressors.forEach((s) => {
        if (s === 'technical') counts['Beban Teknis']++;
        if (s === 'guidance_bureaucracy') counts['Bimbingan Dosen']++;
        if (s === 'time_management') counts['Manajemen Waktu']++;
        if (s === 'infrastructure') counts['Infrastruktur']++;
        if (s === 'personal') counts['Personal']++;
      });
    });

    return Object.entries(counts).map(([name, count]) => ({
      name,
      frekuensi: count,
    }));
  }, [filteredData]);

  // Insight Otomatis Berbasis Data
  const dynamicInsight = useMemo(() => {
    if (filteredData.length === 0) {
      return 'Mulai lakukan check-in harian untuk melihat pola dinamika stres dan progres skripsi Anda.';
    }
    if (filteredData.length < 3) {
      return 'Data sedang terkumpul. Lanjutkan check-in rutin selama beberapa hari untuk membentuk kurva tren yang akurat.';
    }

    const last3 = filteredData.slice(-3);
    const avgFatigueLast3 = last3.reduce((acc, c) => acc + (c.fatigueMental + c.fatiguePhysical) / 2, 0) / 3;
    const avgProgLast3 = last3.reduce((acc, c) => acc + (c.progress + c.selfEfficacy) / 2, 0) / 3;
    const avgAnxietyLast3 = last3.reduce((acc, c) => acc + (c.anxietyQ1 + c.anxietyQ2), 0) / 3;

    if (avgProgLast3 <= 2.2 && avgFatigueLast3 >= 6.5) {
      return 'Perhatian: Dalam 3 hari terakhir teramati kelelahan tinggi disertai stagnasi progres. Dianjurkan rehat kognitif atau konsultasi hambatan teknis.';
    }
    if (avgAnxietyLast3 >= 4.0) {
      return 'Tingkat kecemasan Anda cenderung tinggi beberapa hari ini. Prioritaskan tidur yang cukup dan jangan ragu berbagi cerita dengan rekan sebaya.';
    }
    if (avgProgLast3 >= 3.5 && avgFatigueLast3 <= 5.0) {
      return 'Kondisi Anda berada dalam ritme yang seimbang dan produktif. Pertahankan pola istirahat dan efikasi diri Anda.';
    }
    return `Rata-rata kelelahan Anda dalam periode ini adalah ${avgFatigueLast3.toFixed(1)}/10 dengan progres pengerjaan stabil (${avgProgLast3.toFixed(1)}/5).`;
  }, [filteredData]);

  // Peringatan aktif yang belum ditinjau
  const unreviewedAlerts = alerts.filter((a) => !a.reviewedAt);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-slate-100">
      {/* Top Banner / Today Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <span>Dasbor Evaluasi Diri</span>
            <span aria-hidden="true">·</span>
            <span>Ecological Momentary Assessment</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Pemantauan Stres &amp; Progres Skripsi
          </h2>
          <p className="text-xs text-slate-400">
            {hasCheckedInToday
              ? '✓ Anda sudah menyelesaikan check-in hari ini. Data di bawah ini telah diperbarui secara langsung.'
              : 'Anda belum mengisi check-in hari ini. Luangkan 2 menit untuk mencatat kondisi terbaru Anda.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {!hasCheckedInToday && (
            <button
              onClick={onOpenCheckin}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Check-in Sekarang</span>
            </button>
          )}

          <button
            onClick={onExportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Ekspor seluruh riwayat ke CSV untuk dokumentasi atau dibawa ke konseling"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Unreviewed Alert Banner if any */}
      {unreviewedAlerts.length > 0 && (
        <div className="space-y-2">
          {unreviewedAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                alert.alertType === 'chronic'
                  ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                  : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {alert.alertType === 'chronic' ? (
                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <Flame className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">
                    {alert.alertType === 'chronic'
                      ? 'Peringatan Pola Kronis (Stagnasi Berkelanjutan)'
                      : 'Peringatan Lonjakan Stres Akut'}
                  </div>
                  <div className="text-xs mt-0.5 text-slate-300">{alert.alertData?.message || ''}</div>
                </div>
              </div>
              <button
                onClick={() => onReviewAlert(alert.id)}
                className="px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 border border-slate-700 text-xs font-medium text-slate-200 whitespace-nowrap self-end sm:self-auto cursor-pointer"
              >
                Tandai Sudah Ditinjau
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State / Prompt if no check-ins */}
      {checkins.length === 0 && (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
            <Info className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-semibold text-white">Belum Ada Riwayat Check-in</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mulai isi formulir check-in pertama Anda hari ini, atau muat data sampel skripsi 30 hari
              untuk segera melihat cara kerja visualisasi tren dan deteksi dini.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenCheckin}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              Mulai Check-in Pertama
            </button>
            <button
              onClick={onLoadDemo}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs text-sky-400 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Muat 30 Hari Data Demo</span>
            </button>
          </div>
        </div>
      )}

      {/* Consistent Check-in Counter Section (Motivating Daily Streak Tracker) */}
      {checkins.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          {/* Subtle decorative background gradient */}
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            {/* Left: Streak Counter & Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                <Flame className="w-4 h-4 text-emerald-400" />
                <span>Konsistensi Check-in Harian (Consistent Check-in)</span>
              </div>

              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-4xl sm:text-5xl font-extrabold text-white tabular-nums tracking-tight">
                  {streakDays}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-200">
                    Hari Berturut-turut
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Total {checkins.length} check-in tercatat
                  </span>
                </div>
              </div>

              {/* Motivational message based on state */}
              <div className="text-xs text-slate-300 pt-1 flex flex-wrap items-center gap-2">
                {hasCheckedInToday ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Check-in hari ini tuntas! Runtutan konsistensi Anda aktif terjaga.</span>
                  </span>
                ) : isStreakActive ? (
                  <span className="text-amber-400 font-medium flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>
                      Runtutan masih aktif dari kemarin. Check-in hari ini agar streak naik menjadi{' '}
                      <strong className="text-white font-mono">{streakDays + 1} hari</strong>!
                    </span>
                  </span>
                ) : (
                  <span className="text-slate-400">
                    Mulai runtutan baru hari ini. Pengisian rutin harian memperkuat akurasi deteksi dini.
                  </span>
                )}

                {!hasCheckedInToday && (
                  <button
                    onClick={onOpenCheckin}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs shadow transition-colors cursor-pointer"
                  >
                    <span>Check-in Sekarang</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Right: 7-Day Mini Calendar Rhythm Tracker */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 sm:p-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-medium text-slate-300">Ritme 7 Hari Terakhir</span>
                <span>
                  Target:{' '}
                  <strong className="text-emerald-400 font-mono">
                    {nextMilestone.target} Hari
                  </strong>{' '}
                  ({nextMilestone.label})
                </span>
              </div>

              {/* 7 Circles */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {past7DaysStatus.map((day) => (
                  <div
                    key={day.dateKey}
                    className="flex flex-col items-center gap-1"
                    title={`${day.dateKey}: ${day.isChecked ? 'Sudah check-in' : 'Belum check-in'}`}
                  >
                    <span className="text-[10px] text-slate-400 capitalize">
                      {day.dayName}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-semibold transition-all ${
                        day.isChecked
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                          : day.isToday
                          ? 'bg-slate-900 border-2 border-dashed border-amber-400/80 text-amber-300 animate-pulse'
                          : 'bg-slate-900/60 border border-slate-800 text-slate-600'
                      }`}
                    >
                      {day.isChecked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="tabular-nums">{day.dateNum}</span>
                      )}
                    </div>
                    {day.isToday && (
                      <span className="text-[9px] text-amber-400 font-medium -mt-0.5">
                        Hari Ini
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Milestone Progress Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Progres menuju target</span>
                  <span className="font-mono text-emerald-400 tabular-nums">
                    {streakDays}/{nextMilestone.target} hari ({streakProgressPercent}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${streakProgressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4 Summary Cards (Single Elevation Depth) */}
      {latestCheckin && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Kecemasan */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Kecemasan Terakhir</div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-mono text-2xl font-bold text-white tabular-nums">
                  {latestCheckin.anxietyQ1 + latestCheckin.anxietyQ2}
                </span>
                <span className="text-xs text-slate-500">/ 6</span>
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
              <span>Ambang Akut: 5</span>
              {latestCheckin.anxietyQ1 + latestCheckin.anxietyQ2 >= 5 ? (
                <span className="text-amber-400 font-semibold">Tinggi</span>
              ) : (
                <span className="text-emerald-400">Terkendali</span>
              )}
            </div>
          </div>

          {/* Card 2: Kelelahan */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Rata-rata Kelelahan</div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-mono text-2xl font-bold text-white tabular-nums">
                  {((latestCheckin.fatigueMental + latestCheckin.fatiguePhysical) / 2).toFixed(1)}
                </span>
                <span className="text-xs text-slate-500">/ 10</span>
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
              <span>M: {latestCheckin.fatigueMental} · F: {latestCheckin.fatiguePhysical}</span>
              {(latestCheckin.fatigueMental + latestCheckin.fatiguePhysical) / 2 >= 6 ? (
                <span className="text-amber-400 font-semibold">Waspada</span>
              ) : (
                <span className="text-emerald-400">Bugar</span>
              )}
            </div>
          </div>

          {/* Card 3: Progres & Efikasi */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Progres &amp; Efikasi Diri</div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-mono text-2xl font-bold text-white tabular-nums">
                  {((latestCheckin.progress + latestCheckin.selfEfficacy) / 2).toFixed(1)}
                </span>
                <span className="text-xs text-slate-500">/ 5</span>
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
              <span>Ambang Stagnasi: ≤ 2</span>
              {(latestCheckin.progress + latestCheckin.selfEfficacy) / 2 <= 2 ? (
                <span className="text-rose-400 font-semibold">Mandek</span>
              ) : (
                <span className="text-emerald-400">Bergerak</span>
              )}
            </div>
          </div>

          {/* Card 4: Tidur Semalam */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Tidur Semalam</div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-lg font-bold text-white">
                  {latestCheckin.sleepQuantity}
                </span>
                <span className="text-xs text-emerald-400 capitalize">
                  ({latestCheckin.sleepQuality})
                </span>
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span>Konsistensi:</span>
                <strong className="text-emerald-400 font-mono tabular-nums">{streakDays} Hari</strong>
              </span>
              <span className={hasCheckedInToday ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                {hasCheckedInToday ? '✓ Terjaga' : '⏳ Hari ini belum'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Clinical Insight Box */}
      {checkins.length > 0 && (
        <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex items-start gap-3 text-xs leading-relaxed text-slate-300">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Evaluasi Tren EMA: </span>
            {dynamicInsight}
          </div>
        </div>
      )}

      {/* Time Filter Controls */}
      {checkins.length > 0 && (
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="text-sm font-semibold text-white">
            Grafik Pola Harian ({chartData.length} Titik Data)
          </div>
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {(['7', '14', '30'] as const).map((days) => (
              <button
                key={days}
                onClick={() => setDayFilter(days)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  dayFilter === days
                    ? 'bg-emerald-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {days} Hari
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4 Interactive Recharts Charts Grid */}
      {checkins.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Kecemasan */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">1. Tren Kecemasan Saat Ini</h3>
                <p className="text-[11px] text-slate-400">
                  Adaptasi GAD-2 Momentary (0 - 6). Ambang lonjakan akut pada nilai 5.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="w-2.5 h-0.5 bg-amber-400 inline-block" />
                <span>Skor (0-6)</span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 6]} stroke="#94a3b8" fontSize={10} tickLine={false} ticks={[0, 2, 4, 6]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
                  />
                  <ReferenceLine
                    y={5}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{ value: 'Ambang Akut (5)', fill: '#f59e0b', fontSize: 10, position: 'top' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="kecemasan"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#f59e0b' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Kelelahan */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">2. Tren Rata-rata Kelelahan</h3>
                <p className="text-[11px] text-slate-400">
                  Chalder Fatigue Scale (1 - 10). Ambang kelelahan kronis pada nilai 6.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="w-2.5 h-0.5 bg-rose-400 inline-block" />
                <span>Kelelahan (1-10)</span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fatigueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis domain={[1, 10]} stroke="#94a3b8" fontSize={10} tickLine={false} ticks={[2, 4, 6, 8, 10]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
                  />
                  <ReferenceLine
                    y={6}
                    stroke="#f43f5e"
                    strokeDasharray="4 4"
                    label={{ value: 'Ambang Kronis (6)', fill: '#f43f5e', fontSize: 10, position: 'top' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="kelelahan"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    fill="url(#fatigueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Progres & Efikasi */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">3. Tren Progres &amp; Efikasi Diri</h3>
                <p className="text-[11px] text-slate-400">
                  Skala Likert (1 - 5). Ambang stagnasi pengerjaan skripsi pada nilai ≤ 2.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" />
                <span>Progres (1-5)</span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis domain={[1, 5]} stroke="#94a3b8" fontSize={10} tickLine={false} ticks={[1, 2, 3, 4, 5]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
                  />
                  <ReferenceLine
                    y={2}
                    stroke="#38bdf8"
                    strokeDasharray="4 4"
                    label={{ value: 'Ambang Mandek (2)', fill: '#38bdf8', fontSize: 10, position: 'top' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="progres"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#10b981' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Distribusi Sumber Stres */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">4. Distribusi Sumber Stres</h3>
                <p className="text-[11px] text-slate-400">
                  Frekuensi kemunculan faktor pemicu stres dalam periode {dayFilter} hari.
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stressorDistribution}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 35, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#cbd5e1"
                    fontSize={10}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="frekuensi" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
