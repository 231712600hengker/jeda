// POST /api/checkins — Simpan atau perbarui check-in harian (1x per hari) + jalankan deteksi alert
// GET  /api/checkins — Ambil riwayat check-in user & status check-in hari ini
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { evaluateCheckinAlerts } from '@/lib/detection';
import { CheckinSchema } from '@/lib/validations';
import type { CheckinItem, AlertRecord } from '@/types/jeda';

// ─── POST /api/checkins ───────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Sesi tidak valid. Silakan login kembali.' }, { status: 401 });
    }

    if (!session.consentAgreed) {
      return NextResponse.json({ error: 'Informed consent belum disetujui.' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = CheckinSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return NextResponse.json(
        { error: `Validasi gagal: ${firstError.path.join('.')}: ${firstError.message}` },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const now = new Date();
    const checkinTime = now.toISOString();
    const checkinDate = checkinTime.split('T')[0];

    // ─── Periksa apakah sudah ada check-in hari ini (Aturan 1x per hari) ───
    const { data: existingCheckin } = await supabaseAdmin
      .from('checkins')
      .select('id')
      .eq('user_id', session.userId)
      .eq('checkin_date', checkinDate)
      .maybeSingle();

    let checkinId: string;
    const isUpdate = !!existingCheckin;

    if (existingCheckin) {
      // Perbarui (Upsert/Update) check-in hari ini jika sudah pernah diisi
      const { data: updatedRow, error: updateError } = await supabaseAdmin
        .from('checkins')
        .update({
          checkin_time: checkinTime,
          anxiety_q1: data.anxietyQ1,
          anxiety_q2: data.anxietyQ2,
          fatigue_mental: data.fatigueMental,
          fatigue_physical: data.fatiguePhysical,
          sleep_quantity: data.sleepQuantity,
          sleep_quality: data.sleepQuality,
          progress: data.progress,
          self_efficacy: data.selfEfficacy,
          note: data.note ?? null,
          updated_at: checkinTime,
        })
        .eq('id', existingCheckin.id)
        .select('id')
        .single();

      if (updateError || !updatedRow) {
        throw updateError ?? new Error('Gagal memperbarui check-in hari ini');
      }

      checkinId = updatedRow.id;

      // Hapus stressors lama untuk check-in ini sebelum insert yang baru
      await supabaseAdmin.from('checkin_stressors').delete().eq('checkin_id', checkinId);
    } else {
      // Simpan check-in baru untuk hari ini
      const { data: checkinRow, error: checkinError } = await supabaseAdmin
        .from('checkins')
        .insert({
          user_id: session.userId,
          checkin_date: checkinDate,
          checkin_time: checkinTime,
          anxiety_q1: data.anxietyQ1,
          anxiety_q2: data.anxietyQ2,
          fatigue_mental: data.fatigueMental,
          fatigue_physical: data.fatiguePhysical,
          sleep_quantity: data.sleepQuantity,
          sleep_quality: data.sleepQuality,
          progress: data.progress,
          self_efficacy: data.selfEfficacy,
          note: data.note ?? null,
        })
        .select('id')
        .single();

      if (checkinError || !checkinRow) {
        throw checkinError ?? new Error('Gagal menyimpan check-in');
      }

      checkinId = checkinRow.id;
    }

    // ─── Simpan stressors ─────────────────────────────────
    if (data.stressors.length > 0) {
      const stressorRows = data.stressors.map((cat) => ({
        checkin_id: checkinId,
        stressor_category: cat,
      }));
      const { error: stressorError } = await supabaseAdmin
        .from('checkin_stressors')
        .insert(stressorRows);
      if (stressorError) throw stressorError;
    }

    // ─── Update last_checkin_at di users ─────────────────
    await supabaseAdmin
      .from('users')
      .update({ last_checkin_at: checkinTime })
      .eq('id', session.userId);

    // ─── Ambil 4 check-in hari sebelumnya untuk deteksi kronis (5 hari unik) ──
    const { data: pastRows } = await supabaseAdmin
      .from('checkins')
      .select('anxiety_q1, anxiety_q2, fatigue_mental, fatigue_physical, progress, self_efficacy, checkin_time')
      .eq('user_id', session.userId)
      .neq('id', checkinId)
      .order('checkin_date', { ascending: false })
      .limit(4);

    const pastCheckins = (pastRows ?? []).map((r) => ({
      anxietyQ1: r.anxiety_q1,
      anxietyQ2: r.anxiety_q2,
      fatigueMental: r.fatigue_mental,
      fatiguePhysical: r.fatigue_physical,
      progress: r.progress,
      selfEfficacy: r.self_efficacy,
      checkinTime: r.checkin_time,
    }));

    // ─── Ambil alert kronis aktif (untuk suppression) ─────
    const { data: alertRows } = await supabaseAdmin
      .from('alerts')
      .select('alert_type, triggered_at, reviewed_at')
      .eq('user_id', session.userId)
      .eq('alert_type', 'chronic')
      .is('reviewed_at', null)
      .order('triggered_at', { ascending: false })
      .limit(5);

    const pastAlerts = (alertRows ?? []).map((r) => ({
      alertType: r.alert_type as 'acute' | 'chronic',
      triggeredAt: r.triggered_at,
      reviewedAt: r.reviewed_at,
    }));

    // ─── Jalankan deteksi alert ───────────────────────────
    const currentForDetection = {
      anxietyQ1: data.anxietyQ1,
      anxietyQ2: data.anxietyQ2,
      fatigueMental: data.fatigueMental,
      fatiguePhysical: data.fatiguePhysical,
      progress: data.progress,
      selfEfficacy: data.selfEfficacy,
      checkinTime,
    };

    const detection = evaluateCheckinAlerts(currentForDetection, pastCheckins, pastAlerts);

    const generatedAlerts: AlertRecord[] = [];

    // Simpan alert akut
    if (detection.isAcute && detection.acuteDetails) {
      const { data: acuteRow } = await supabaseAdmin
        .from('alerts')
        .insert({
          user_id: session.userId,
          alert_type: 'acute',
          triggered_at: checkinTime,
          alert_data: {
            anxietyScore: detection.acuteDetails.combinedAnxiety,
            fatigueScore: detection.acuteDetails.avgFatigue,
            message: detection.acuteDetails.reason,
          },
        })
        .select('id, alert_type, triggered_at, reviewed_at, alert_data')
        .single();

      if (acuteRow) {
        generatedAlerts.push({
          id: acuteRow.id,
          userId: session.userId,
          alertType: 'acute',
          triggeredAt: acuteRow.triggered_at,
          reviewedAt: acuteRow.reviewed_at,
          alertData: acuteRow.alert_data,
        });
      }
    }

    // Simpan alert kronis
    if (detection.isChronic && detection.chronicDetails) {
      const { data: chronicRow } = await supabaseAdmin
        .from('alerts')
        .insert({
          user_id: session.userId,
          alert_type: 'chronic',
          triggered_at: checkinTime,
          alert_data: {
            avgProgress5Days: detection.chronicDetails.avgProgress5Days,
            avgFatigue5Days: detection.chronicDetails.avgFatigue5Days,
            message: detection.chronicDetails.reason,
          },
        })
        .select('id, alert_type, triggered_at, reviewed_at, alert_data')
        .single();

      if (chronicRow) {
        generatedAlerts.push({
          id: chronicRow.id,
          userId: session.userId,
          alertType: 'chronic',
          triggeredAt: chronicRow.triggered_at,
          reviewedAt: chronicRow.reviewed_at,
          alertData: chronicRow.alert_data,
        });
      }
    }

    return NextResponse.json(
      {
        checkinId,
        checkinDate,
        isUpdate,
        alerts: generatedAlerts,
        detection,
      },
      { status: isUpdate ? 200 : 201 }
    );
  } catch (err) {
    console.error('[POST /api/checkins]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── GET /api/checkins ────────────────────────────────────

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
    const todayStr = new Date().toISOString().split('T')[0];

    // Ambil checkins dengan stressors (join manual)
    const { data: checkinRows, error } = await supabaseAdmin
      .from('checkins')
      .select(`
        id, user_id, checkin_date, checkin_time,
        anxiety_q1, anxiety_q2, fatigue_mental, fatigue_physical,
        sleep_quantity, sleep_quality, progress, self_efficacy, note,
        created_at,
        checkin_stressors(stressor_category)
      `)
      .eq('user_id', session.userId)
      .gte('checkin_date', limitDateStr)
      .order('checkin_date', { ascending: false });

    if (error) throw error;

    const checkins: CheckinItem[] = (checkinRows ?? []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      checkinDate: r.checkin_date,
      checkinTime: r.checkin_time,
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

    const todayCheckin = checkins.find((c) => c.checkinDate === todayStr) || null;
    const hasCheckedInToday = !!todayCheckin;

    return NextResponse.json({
      checkins,
      hasCheckedInToday,
      todayCheckin,
    });
  } catch (err) {
    console.error('[GET /api/checkins]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
