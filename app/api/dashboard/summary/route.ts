// GET /api/dashboard/summary — Data agregat untuk dashboard
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { formatDateShort, getTodayString } from '@/lib/utils';
import type { CheckinItem, ApiDashboardSummary } from '@/types/jeda';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Sesi tidak valid.' }, { status: 401 });
    }

    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get('days') ?? '30', 10);
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - days);
    const limitDateStr = limitDate.toISOString().split('T')[0];

    // ─── Ambil semua checkins dalam period ───────────────
    const { data: rows, error } = await supabaseAdmin
      .from('checkins')
      .select(`
        id, user_id, checkin_date, checkin_time,
        checkin_type, quick_stress, quick_energy, anxiety_q1, anxiety_q2, fatigue_mental, fatigue_physical,
        sleep_quantity, sleep_quality, progress, self_efficacy, note,
        created_at,
        checkin_stressors(stressor_category)
      `)
      .eq('user_id', session.userId)
      .gte('checkin_date', limitDateStr)
      .order('checkin_date', { ascending: true });

    if (error) throw error;

    const checkins: CheckinItem[] = (rows ?? []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      checkinDate: r.checkin_date,
      checkinTime: r.checkin_time,
      checkinType: r.checkin_type ?? 'full', quickStress: r.quick_stress ?? undefined, quickEnergy: r.quick_energy ?? undefined,
      anxietyQ1: r.anxiety_q1,
      anxietyQ2: r.anxiety_q2,
      fatigueMental: r.fatigue_mental,
      fatiguePhysical: r.fatigue_physical,
      sleepQuantity: r.sleep_quantity,
      sleepQuality: r.sleep_quality,
      progress: r.progress,
      selfEfficacy: r.self_efficacy,
      note: r.note ?? undefined,
      stressors: (r.checkin_stressors ?? []).map(
        (s: { stressor_category: string }) => s.stressor_category as import('@/types/jeda').StressorCategory
      ),
      createdAt: r.created_at,
    }));

    const fullCheckins = checkins.filter((checkin) => checkin.checkinType === 'full') as Array<CheckinItem & Required<Pick<CheckinItem, 'anxietyQ1' | 'anxietyQ2' | 'fatigueMental' | 'fatiguePhysical' | 'progress' | 'selfEfficacy'>>>;
    const latestCheckin = checkins.length > 0 ? checkins[checkins.length - 1] : null;

    // ─── Tren data untuk grafik ───────────────────────────
    const anxietyTrend = fullCheckins.map((c) => ({
      date: formatDateShort(c.checkinDate),
      rawDate: c.checkinDate,
      value: c.anxietyQ1 + c.anxietyQ2,
    }));

    const fatigueTrend = fullCheckins.map((c) => ({
      date: formatDateShort(c.checkinDate),
      rawDate: c.checkinDate,
      value: Number(((c.fatigueMental + c.fatiguePhysical) / 2).toFixed(1)),
    }));

    const progressTrend = fullCheckins.map((c) => ({
      date: formatDateShort(c.checkinDate),
      rawDate: c.checkinDate,
      value: Number(((c.progress + c.selfEfficacy) / 2).toFixed(1)),
    }));

    // ─── Distribusi sumber stres ──────────────────────────
    const stressorCounts: Record<string, number> = {
      technical: 0,
      guidance_bureaucracy: 0,
      time_management: 0,
      infrastructure: 0,
      personal: 0,
    };
    checkins.forEach((c) => {
      c.stressors.forEach((s) => {
        if (s in stressorCounts) stressorCounts[s]++;
      });
    });

    // ─── Streak hitung ────────────────────────────────────
    const uniqueDates = new Set(checkins.map((c) => c.checkinDate));
    const today = getTodayString();

    let streak = 0;
    const checkDateObj = new Date(today + 'T00:00:00');
    
    while (true) {
      const y = checkDateObj.getFullYear();
      const m = String(checkDateObj.getMonth() + 1).padStart(2, '0');
      const d = String(checkDateObj.getDate()).padStart(2, '0');
      const key = `${y}-${m}-${d}`;
      
      if (uniqueDates.has(key)) {
        streak++;
        checkDateObj.setDate(checkDateObj.getDate() - 1);
      } else {
        break;
      }
    }

    // ─── Total checkins (semua waktu) ─────────────────────
    const { count: totalCheckins } = await supabaseAdmin
      .from('checkins')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.userId);

    // ─── Dynamic insight ──────────────────────────────────
    let insights = 'Mulai lakukan check-in harian untuk melihat pola dinamika stres dan progres skripsi Anda.';

    if (fullCheckins.length >= 3) {
      const last3 = fullCheckins.slice(-3);
      const avgFatLast3 = last3.reduce((acc, c) => acc + (c.fatigueMental + c.fatiguePhysical) / 2, 0) / 3;
      const avgProgLast3 = last3.reduce((acc, c) => acc + (c.progress + c.selfEfficacy) / 2, 0) / 3;
      const avgAnxLast3 = last3.reduce((acc, c) => acc + c.anxietyQ1 + c.anxietyQ2, 0) / 3;

      if (avgProgLast3 <= 2.2 && avgFatLast3 >= 6.5) {
        insights = 'Perhatian: Dalam 3 hari terakhir teramati kelelahan tinggi disertai stagnasi progres. Dianjurkan rehat kognitif atau konsultasi hambatan teknis.';
      } else if (avgAnxLast3 >= 4.0) {
        insights = 'Tingkat kecemasan Anda cenderung tinggi beberapa hari ini. Prioritaskan tidur yang cukup dan jangan ragu berbagi cerita dengan rekan sebaya.';
      } else if (avgProgLast3 >= 3.5 && avgFatLast3 <= 5.0) {
        insights = 'Kondisi Anda berada dalam ritme yang seimbang dan produktif. Pertahankan pola istirahat dan efikasi diri Anda.';
      } else {
        insights = `Rata-rata kelelahan Anda dalam periode ini adalah ${avgFatLast3.toFixed(1)}/10 dengan progres pengerjaan stabil (${avgProgLast3.toFixed(1)}/5).`;
      }
    } else if (fullCheckins.length > 0) {
      insights = 'Data sedang terkumpul. Lanjutkan check-in rutin selama beberapa hari untuk membentuk kurva tren yang akurat.';
    }

    const summary: ApiDashboardSummary = {
      latestCheckin,
      trends: {
        anxiety: anxietyTrend,
        fatigue: fatigueTrend,
        progress: progressTrend,
        stressorsDistribution: stressorCounts,
      },
      streak,
      totalCheckins: totalCheckins ?? 0,
      insights,
    };

    return NextResponse.json(summary);
  } catch (err) {
    console.error('[GET /api/dashboard/summary]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
