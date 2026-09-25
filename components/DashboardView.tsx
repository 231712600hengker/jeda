'use client';

import React, { useState, useMemo } from 'react';
import {
  CheckinItem,
  AlertRecord,
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
  Flame,
  CheckCircle2,
  Download,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
  ShieldAlert,
  Wind,
} from 'lucide-react';

interface DashboardViewProps {
  checkins: CheckinItem[];
  alerts: AlertRecord[];
  onOpenCheckin: () => void;
  onExportCSV: () => void;
  onReviewAlert: (alertId: string) => void;
  onLoadDemo: () => void;
  onOpenRelaxation?: () => void;
}

export default function DashboardView({
  checkins,
  alerts,
  onOpenCheckin,
  onExportCSV,
  onReviewAlert,
  onLoadDemo,
  onOpenRelaxation,
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
        nextMilestone: { target: 3, label: 'Langkah Awal' },
        streakProgressPercent: 0,
      };
    }

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
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = formatDateKey(yesterday);

    let streak = 0;
    let anchor = uniqueDates.has(todayKey) ? today : uniqueDates.has(yesterdayKey) ? yesterday : null;

    if (anchor) {
      const curr = new Date(anchor);
      while (uniqueDates.has(formatDateKey(curr))) {
        streak++;
        curr.setDate(curr.getDate() - 1);
      }
    }

    const active = uniqueDates.has(todayKey) || uniqueDates.has(yesterdayKey);

    // 7 hari terakhir
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const p7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const k = formatDateKey(d);
      p7.push({
        dateKey: k,
        dayName: dayNames[d.getDay()],
        dateNum: d.getDate(),
        isChecked: uniqueDates.has(k),
        isToday: k === todayKey,
      });
    }

    const milestones = [
      { target: 3, label: 'Langkah Awal' },
      { target: 7, label: 'Ritme 1 Minggu' },
      { target: 14, label: 'Konsistensi 2 Minggu' },
      { target: 21, label: 'Kebiasaan Baru' },
      { target: 30, label: 'Master Refleksi' },
    ];
    const nxt = milestones.find((m) => m.target > streak) || { target: streak + 10, label: 'Konsistensi Tinggi' };
    const pct = Math.min(100, Math.round((streak / nxt.target) * 100));

    return {
      streakDays: streak,
      isStreakActive: active,
      past7DaysStatus: p7,
      nextMilestone: nxt,
      streakProgressPercent: pct,
    };
  }, [checkins]);

  // Transform data untuk 4 Grafik Recharts
  const chartData = useMemo(() => {
    return filteredData.map((c) => {
      const d = new Date(c.checkinDate);
      const label = `${d.getDate()} ${d.toLocaleString('id-ID', { month: 'short' })}`;
      const combinedAnxiety = c.anxietyQ1 + c.anxietyQ2;
      const avgFatigue = (c.fatigueMental + c.fatiguePhysical) / 2;
      const avgProgress = (c.progress + c.selfEfficacy) / 2;

      return {
        date: label,
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
      return 'Data sedang terkumpul dengan baik. Lanjutkan refleksi harian untuk membentuk kurva tren yang bermakna.';
    }

    const last3 = filteredData.slice(-3);
    const avgFatigueLast3 = last3.reduce((acc, c) => acc + (c.fatigueMental + c.fatiguePhysical) / 2, 0) / 3;
    const avgProgLast3 = last3.reduce((acc, c) => acc + (c.progress + c.selfEfficacy) / 2, 0) / 3;
    const avgAnxietyLast3 = last3.reduce((acc, c) => acc + (c.anxietyQ1 + c.anxietyQ2), 0) / 3;

    if (avgProgLast3 <= 2.2 && avgFatigueLast3 >= 6.5) {
      return 'Dalam 3 hari terakhir teramati kelelahan yang cukup tinggi disertai hambatan pengerjaan. Sangat dianjurkan mengambil jeda sejenak, melangkah keluar ruangan, atau menyederhanakan target harian.';
    }
    if (avgAnxietyLast3 >= 4.0) {
      return 'Tingkat kecemasan Anda cenderung meningkat beberapa hari ini. Prioritaskan tidur malam yang cukup dan gunakan panduan napas 4-7-8 untuk meredakan ketegangan tubuh.';
    }
    if (avgProgLast3 >= 3.5 && avgFatigueLast3 <= 5.0) {
      return 'Kondisi Anda berada dalam ritme yang harmonis dan produktif. Terus rawat keseimbangan antara berkarya dan memberi jeda pada pikiran.';
    }
    return `Rata-rata kelelahan Anda pada periode ini adalah ${avgFatigueLast3.toFixed(1)}/10 dengan progres pengerjaan stabil (${avgProgLast3.toFixed(1)}/5).`;
  }, [filteredData]);

  // Peringatan aktif yang belum ditinjau
  const unreviewedAlerts = alerts.filter((a) => !a.reviewedAt);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-[#2d3748]">
      {/* Top Banner / Today Status (Serene Hearth Style) */}
      <div className="flex flex-col justify-between gap-5 rounded-3xl border border-[#e4e2df] bg-white p-5 shadow-[0_10px_25px_-5px_rgba(107,142,125,0.08),0_8px_10px_-6px_rgba(107,142,125,0.04)] md:flex-row md:items-center sm:p-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6b8e7d] uppercase tracking-wider">
            <span>Dasbor Refleksi Diri</span>
            <span aria-hidden="true">·</span>
            <span>Ruang Tenang</span>
          </div>
          <h2 className="text-2xl font-bold text-[#2d3748] tracking-tight font-serif">
            Pemantauan Ritme &amp; Progres Skripsi
          </h2>
          <p className="text-xs sm:text-sm text-[#4a5568] leading-relaxed max-w-xl">
            {hasCheckedInToday
              ? '✓ Anda sudah menyelesaikan check-in hari ini. Data di bawah ini telah diperbarui secara langsung.'
              : 'Anda belum mengisi check-in hari ini. Luangkan 2 menit untuk mencatat kondisi terbaru Anda.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!hasCheckedInToday && (
            <button
              onClick={onOpenCheckin}
              className="px-6 py-2.5 rounded-full bg-[#6b8e7d] hover:bg-[#4a6b5b] text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-[0_4px_14px_rgba(107,142,125,0.25)] transition-all cursor-pointer hover:scale-[1.015] active:scale-[0.98]"
            >
              <Clock className="w-4 h-4" />
              <span>Check-in Hari Ini</span>
            </button>
          )}

          {onOpenRelaxation && (
            <button
              onClick={onOpenRelaxation}
              className="px-5 py-2.5 rounded-full bg-[#e8efea] hover:bg-[#c5ebd7] text-[#4a6b5b] font-semibold text-xs sm:text-sm flex items-center gap-2 border border-[#c5ebd7] transition-all cursor-pointer active:scale-[0.98]"
              title="Buka Latihan Pernapasan & Grounding"
            >
              <Wind className="w-4 h-4 text-[#6b8e7d]" />
              <span>Latihan Relaksasi</span>
            </button>
          )}

          <button
            onClick={onExportCSV}
            className="px-4 py-2.5 rounded-full bg-[#f5f0eb] hover:bg-[#eae2d8] border border-[#e4e2df] text-[#4a5568] hover:text-[#2d3748] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Ekspor seluruh riwayat ke CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#6b8e7d]" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Unreviewed Alert Banner if any */}
      {unreviewedAlerts.length > 0 && (
        <div className="space-y-3">
          {unreviewedAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
                alert.alertType === 'chronic'
                  ? 'bg-[#f4ddd4] border-[#d98e73] text-[#a6634b]'
                  : 'bg-[#ffe8cc] border-[#d98e73] text-[#8b4513]'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {alert.alertType === 'chronic' ? (
                  <ShieldAlert className="w-6 h-6 text-[#a6634b] shrink-0 mt-0.5" />
                ) : (
                  <Flame className="w-6 h-6 text-[#d98e73] shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">
                    {alert.alertType === 'chronic'
                      ? 'Peringatan Pola Kronis (Stagnasi Berkelanjutan)'
                      : 'Peringatan Lonjakan Stres Akut'}
                  </div>
                  <div className="text-xs sm:text-sm mt-1 font-medium">{alert.alertData?.message || ''}</div>
                </div>
              </div>
              <button
                onClick={() => onReviewAlert(alert.id)}
                className="px-4 py-2 rounded-full bg-white/90 hover:bg-white text-xs font-semibold text-[#2d3748] shadow-sm whitespace-nowrap self-end sm:self-auto cursor-pointer border border-[#e4e2df] transition-all"
              >
                Tandai Sudah Ditinjau
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State / Prompt if no check-ins */}
      {checkins.length === 0 && (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#e4e2df] text-center space-y-4 shadow-[0_10px_25px_-5px_rgba(107,142,125,0.06)]">
          <div className="w-14 h-14 rounded-full bg-[#e8efea] border border-[#c5ebd7] text-[#4a6b5b] mx-auto flex items-center justify-center">
            <Info className="w-7 h-7 text-[#6b8e7d]" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-[#2d3748] font-serif">Mulai dengan Cek-in Pertamamu</h3>
            <p className="text-xs sm:text-sm text-[#4a5568] leading-relaxed">
              Luangkan 2 menit untuk memulai perjalanan refleksi mandiri, atau muat 30 hari data sampel untuk melihat cara kerja visualisasi tren.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenCheckin}
              className="px-6 py-3 rounded-full bg-[#6b8e7d] hover:bg-[#4a6b5b] text-white font-semibold text-xs sm:text-sm cursor-pointer shadow-[0_4px_14px_rgba(107,142,125,0.25)] transition-all hover:scale-[1.015]"
            >
              Mulai Check-in Pertama
            </button>
            <button
              onClick={onLoadDemo}
              className="px-5 py-3 rounded-full bg-[#f5f0eb] hover:bg-[#eae2d8] border border-[#e4e2df] text-xs sm:text-sm text-[#4a5568] font-medium flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#6b8e7d]" />
              <span>Muat 30 Hari Data Demo</span>
            </button>
          </div>
        </div>
      )}

      {/* Consistent Check-in Counter Section (Serene Hearth Warm Streak Tracker) */}
      {checkins.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl border border-[#e4e2df] bg-white p-5 shadow-[0_10px_25px_-5px_rgba(107,142,125,0.08),0_8px_10px_-6px_rgba(107,142,125,0.04)] sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
            {/* Left: Streak Counter & Status */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#d98e73] uppercase tracking-wider">
                <Flame className="w-4 h-4 text-[#d98e73]" />
                <span>Konsistensi Refleksi Harian</span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="font-serif text-5xl sm:text-6xl font-bold text-[#2d3748] tabular-nums tracking-tight">
                  {streakDays}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#4a5568]">
                    Hari Berturut-turut
                  </span>
                  <span className="text-xs text-[#a0aec0]">
                    Total {checkins.length} entri tercatat
                  </span>
                </div>
              </div>

              {/* Motivational message based on state */}
              <div className="text-xs sm:text-sm text-[#4a5568] pt-1 flex flex-wrap items-center gap-2">
                {hasCheckedInToday ? (
                  <span className="text-[#4a6b5b] font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#6b8e7d]" />
                    <span>Refleksi hari ini tuntas! Runtutan kebiasaanmu terjaga dengan indah.</span>
                  </span>
                ) : isStreakActive ? (
                  <span className="text-[#d98e73] font-medium flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#d98e73]" />
                    <span>
                      Runtutan masih aktif dari kemarin. Check-in hari ini agar streak bertambah menjadi{' '}
                      <strong className="text-[#2d3748] font-bold">{streakDays + 1} hari</strong>!
                    </span>
                  </span>
                ) : (
                  <span className="text-[#4a5568]">
                    Mulai ritme barumu hari ini. Refleksi rutin harian membantu menghadirkan ketenangan dalam proses skripsimu.
                  </span>
                )}

                {!hasCheckedInToday && (
                  <button
                    onClick={onOpenCheckin}
                    className="inline-flex items-center gap-1 px-3.5 py-1 rounded-full bg-[#6b8e7d] hover:bg-[#4a6b5b] text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    <span>Check-in Sekarang</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Right: 7-Day Mini Calendar Rhythm Tracker */}
            <div className="flex w-full min-w-0 flex-col gap-3 rounded-2xl border border-[#e4e2df] bg-[#fbf9f6] p-4 sm:p-5 lg:w-auto lg:min-w-[280px]">
              <div className="flex items-center justify-between text-xs text-[#4a5568]">
                <span className="font-semibold text-[#2d3748]">Ritme 7 Hari Terakhir</span>
                <span className="text-[11px] text-[#a0aec0]">
                  Target: <strong className="text-[#6b8e7d] font-semibold">{nextMilestone.target} Hari</strong>
                </span>
              </div>

              {/* 7 Day Pills */}
              <div className="grid grid-cols-7 gap-2">
                {past7DaysStatus.map((day) => (
                  <div
                    key={day.dateKey}
                    className="flex flex-col items-center gap-1"
                    title={`${day.dateKey}: ${day.isChecked ? 'Sudah check-in' : 'Belum check-in'}`}
                  >
                    <span className="text-[10px] text-[#a0aec0] capitalize">
                      {day.dayName}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-semibold transition-all ${
                        day.isChecked
                          ? 'bg-[#6b8e7d] text-white shadow-sm'
                          : day.isToday
                          ? 'bg-white border-2 border-[#d98e73] text-[#d98e73] animate-pulse'
                          : 'bg-white border border-[#e4e2df] text-[#a0aec0]'
                      }`}
                    >
                      {day.isChecked ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span className="tabular-nums">{day.dateNum}</span>
                      )}
                    </div>
                    {day.isToday && (
                      <span className="text-[9px] text-[#d98e73] font-medium -mt-0.5">
                        Hari Ini
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Milestone Progress Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] text-[#a0aec0]">
                  <span>{nextMilestone.label}</span>
                  <span className="font-mono text-[#6b8e7d] font-semibold">
                    {streakDays}/{nextMilestone.target} ({streakProgressPercent}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-[#eae2d8] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#6b8e7d] rounded-full transition-all duration-500"
                    style={{ width: `${streakProgressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4 Summary Cards (Serene Hearth Content Cards) */}
      {latestCheckin && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Kecemasan */}
          <div className="p-5 rounded-3xl bg-white border border-[#e4e2df] shadow-[0_10px_25px_-5px_rgba(107,142,125,0.06)] flex flex-col justify-between">
            <div>
              <div className="text-xs text-[#a0aec0] font-medium">Kecemasan Terakhir</div>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className="font-serif text-3xl font-bold text-[#2d3748] tabular-nums">
                  {latestCheckin.anxietyQ1 + latestCheckin.anxietyQ2}
                </span>
                <span className="text-xs text-[#a0aec0]">/ 6</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-[#4a5568] border-t border-[#e4e2df] pt-2.5 flex items-center justify-between">
              <span className="text-[11px]">Ambang Akut: 5</span>
              {latestCheckin.anxietyQ1 + latestCheckin.anxietyQ2 >= 5 ? (
                <span className="text-[#d98e73] font-semibold">Tinggi</span>
              ) : (
                <span className="text-[#4a6b5b] font-medium">Terkendali</span>
              )}
            </div>
          </div>

          {/* Card 2: Kelelahan */}
          <div className="p-5 rounded-3xl bg-white border border-[#e4e2df] shadow-[0_10px_25px_-5px_rgba(107,142,125,0.06)] flex flex-col justify-between">
            <div>
              <div className="text-xs text-[#a0aec0] font-medium">Rata-rata Kelelahan</div>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className="font-serif text-3xl font-bold text-[#2d3748] tabular-nums">
                  {((latestCheckin.fatigueMental + latestCheckin.fatiguePhysical) / 2).toFixed(1)}
                </span>
                <span className="text-xs text-[#a0aec0]">/ 10</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-[#4a5568] border-t border-[#e4e2df] pt-2.5 flex items-center justify-between">
              <span className="text-[11px]">M: {latestCheckin.fatigueMental} · F: {latestCheckin.fatiguePhysical}</span>
              {(latestCheckin.fatigueMental + latestCheckin.fatiguePhysical) / 2 >= 6 ? (
                <span className="text-[#d98e73] font-semibold">Waspada</span>
              ) : (
                <span className="text-[#4a6b5b] font-medium">Bugar</span>
              )}
            </div>
          </div>

          {/* Card 3: Progres & Efikasi */}
          <div className="p-5 rounded-3xl bg-white border border-[#e4e2df] shadow-[0_10px_25px_-5px_rgba(107,142,125,0.06)] flex flex-col justify-between">
            <div>
              <div className="text-xs text-[#a0aec0] font-medium">Progres &amp; Efikasi Diri</div>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className="font-serif text-3xl font-bold text-[#6b8e7d] tabular-nums">
                  {((latestCheckin.progress + latestCheckin.selfEfficacy) / 2).toFixed(1)}
                </span>
                <span className="text-xs text-[#a0aec0]">/ 5</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-[#4a5568] border-t border-[#e4e2df] pt-2.5 flex items-center justify-between">
              <span className="text-[11px]">Ambang Mandek: ≤ 2</span>
              {(latestCheckin.progress + latestCheckin.selfEfficacy) / 2 <= 2 ? (
                <span className="text-[#a6634b] font-semibold">Mandek</span>
              ) : (
                <span className="text-[#4a6b5b] font-medium">Bergerak</span>
              )}
            </div>
          </div>

          {/* Card 4: Tidur Semalam */}
          <div className="p-5 rounded-3xl bg-white border border-[#e4e2df] shadow-[0_10px_25px_-5px_rgba(107,142,125,0.06)] flex flex-col justify-between">
            <div>
              <div className="text-xs text-[#a0aec0] font-medium">Tidur Semalam</div>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-base font-bold text-[#2d3748]">
                  {latestCheckin.sleepQuantity}
                </span>
                <span className="text-xs text-[#6b8e7d] font-medium capitalize">
                  ({latestCheckin.sleepQuality})
                </span>
              </div>
            </div>
            <div className="mt-4 text-xs text-[#4a5568] border-t border-[#e4e2df] pt-2.5 flex items-center justify-between">
              <span className="text-[11px]">Refleksi:</span>
              <span className={hasCheckedInToday ? 'text-[#4a6b5b] font-medium' : 'text-[#d98e73] font-medium'}>
                {hasCheckedInToday ? '✓ Terisi' : '⏳ Belum'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Clinical Insight Box (Serene Hearth Breather Box Pattern) */}
      {checkins.length > 0 && (
        <div className="bg-[#e8efea] border-l-4 border-[#6b8e7d] p-5 rounded-2xl flex items-start gap-3.5 text-xs sm:text-sm leading-relaxed text-[#2c4d3f] shadow-sm">
          <Sparkles className="w-5 h-5 text-[#6b8e7d] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#2c4d3f]">Refleksi Pola: </span>
            {dynamicInsight}
          </div>
        </div>
      )}

      {/* Time Filter Controls */}
      {checkins.length > 0 && (
        <div className="flex items-center justify-between border-b border-[#e4e2df] pb-3">
          <div className="text-sm font-bold text-[#2d3748] font-serif">
            Grafik Perjalanan Refleksi ({chartData.length} Titik Data)
          </div>
          <div className="flex items-center gap-1 bg-[#f5f0eb] p-1 rounded-full border border-[#e4e2df]">
            {(['7', '14', '30'] as const).map((days) => (
              <button
                key={days}
                onClick={() => setDayFilter(days)}
                className={`px-3.5 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  dayFilter === days
                    ? 'bg-[#6b8e7d] text-white shadow-sm'
                    : 'text-[#4a5568] hover:text-[#2d3748]'
                }`}
              >
                {days} Hari
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4 Interactive Recharts Charts Grid (Serene Hearth Visual Styling) */}
      {checkins.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Kecemasan */}
          <div className="bg-white border border-[#e4e2df] rounded-3xl p-6 shadow-[0_10px_25px_-5px_rgba(107,142,125,0.06)] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#2d3748] font-serif">1. Naik Turun Rasa Cemas</h3>
                <p className="text-xs text-[#a0aec0]">
                  Skala kecemasan (0 - 6). Garis terracotta menandakan perlu perhatian khusus.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#a0aec0]">
                <span className="w-2.5 h-0.5 bg-[#6b8e7d] inline-block" />
                <span>Skor (0-6)</span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f0eb" />
                  <XAxis dataKey="date" stroke="#a0aec0" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 6]} stroke="#a0aec0" fontSize={10} tickLine={false} ticks={[0, 2, 4, 6]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e4e2df',
                      borderRadius: '16px',
                      fontSize: '11px',
                      boxShadow: '0 10px 25px -5px rgba(107, 142, 125, 0.12)',
                    }}
                    labelStyle={{ color: '#2d3748', fontWeight: 600 }}
                  />
                  <ReferenceLine
                    y={5}
                    stroke="#d98e73"
                    strokeDasharray="4 4"
                    label={{ value: 'Perlu Perhatian (5)', fill: '#d98e73', fontSize: 10, position: 'top' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="kecemasan"
                    stroke="#6b8e7d"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#4a6b5b' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Kelelahan */}
          <div className="bg-white border border-[#e4e2df] rounded-3xl p-6 shadow-[0_10px_25px_-5px_rgba(107,142,125,0.06)] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#2d3748] font-serif">2. Tingkat Kelelahan Mental &amp; Fisik</h3>
                <p className="text-xs text-[#a0aec0]">
                  Rata-rata energi pikiran &amp; fisik (1 - 10). Garis waspada menandakan butuh istirahat.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#a0aec0]">
                <span className="w-2.5 h-0.5 bg-[#d98e73] inline-block" />
                <span>Kelelahan (1-10)</span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fatigueGradSerene" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d98e73" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#d98e73" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f0eb" />
                  <XAxis dataKey="date" stroke="#a0aec0" fontSize={10} tickLine={false} />
                  <YAxis domain={[1, 10]} stroke="#a0aec0" fontSize={10} tickLine={false} ticks={[2, 4, 6, 8, 10]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e4e2df',
                      borderRadius: '16px',
                      fontSize: '11px',
                      boxShadow: '0 10px 25px -5px rgba(107, 142, 125, 0.12)',
                    }}
                    labelStyle={{ color: '#2d3748', fontWeight: 600 }}
                  />
                  <ReferenceLine
                    y={6}
                    stroke="#a6634b"
                    strokeDasharray="4 4"
                    label={{ value: 'Batas Waspada (6)', fill: '#a6634b', fontSize: 10, position: 'top' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="kelelahan"
                    stroke="#d98e73"
                    strokeWidth={2.5}
                    fill="url(#fatigueGradSerene)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Progres & Efikasi */}
          <div className="bg-white border border-[#e4e2df] rounded-3xl p-6 shadow-[0_10px_25px_-5px_rgba(107,142,125,0.06)] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#2d3748] font-serif">3. Kemajuan &amp; Keyakinan Diri</h3>
                <p className="text-xs text-[#a0aec0]">
                  Kepuasan langkah &amp; efikasi (1 - 5). Garis abu menandakan perlunya evaluasi target.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#a0aec0]">
                <span className="w-2.5 h-0.5 bg-[#4a6b5b] inline-block" />
                <span>Progres (1-5)</span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f0eb" />
                  <XAxis dataKey="date" stroke="#a0aec0" fontSize={10} tickLine={false} />
                  <YAxis domain={[1, 5]} stroke="#a0aec0" fontSize={10} tickLine={false} ticks={[1, 2, 3, 4, 5]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e4e2df',
                      borderRadius: '16px',
                      fontSize: '11px',
                      boxShadow: '0 10px 25px -5px rgba(107, 142, 125, 0.12)',
                    }}
                    labelStyle={{ color: '#2d3748', fontWeight: 600 }}
                  />
                  <ReferenceLine
                    y={2}
                    stroke="#a0aec0"
                    strokeDasharray="4 4"
                    label={{ value: 'Perlu Jeda / Bantuan (2)', fill: '#a0aec0', fontSize: 10, position: 'top' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="progres"
                    stroke="#4a6b5b"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#6b8e7d' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Distribusi Sumber Stres */}
          <div className="bg-white border border-[#e4e2df] rounded-3xl p-6 shadow-[0_10px_25px_-5px_rgba(107,142,125,0.06)] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#2d3748] font-serif">4. Faktor yang Sering Menguras Energi</h3>
                <p className="text-xs text-[#a0aec0]">
                  Frekuensi hal yang menjadi tantangan dalam {dayFilter} hari terakhir.
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f0eb" horizontal={false} />
                  <XAxis type="number" stroke="#a0aec0" fontSize={10} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#4a5568"
                    fontSize={10}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e4e2df',
                      borderRadius: '16px',
                      fontSize: '11px',
                      boxShadow: '0 10px 25px -5px rgba(107, 142, 125, 0.12)',
                    }}
                  />
                  <Bar dataKey="frekuensi" fill="#6b8e7d" radius={[0, 9999, 9999, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
