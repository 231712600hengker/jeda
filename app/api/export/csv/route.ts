// GET /api/export/csv — Export semua check-in user sebagai file CSV
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getSessionFromRequest } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Sesi tidak valid.' }, { status: 401 });
    }

    // Ambil semua checkins + stressors user
    const { data: rows, error } = await supabaseAdmin
      .from('checkins')
      .select(`
        id, checkin_date, checkin_time,
        anxiety_q1, anxiety_q2, fatigue_mental, fatigue_physical,
        sleep_quantity, sleep_quality, progress, self_efficacy, note,
        created_at,
        checkin_stressors(stressor_category)
      `)
      .eq('user_id', session.userId)
      .order('checkin_date', { ascending: true });

    if (error) throw error;

    // Ambil alerts untuk kolom peringatan
    const { data: alertRows } = await supabaseAdmin
      .from('alerts')
      .select('alert_type, triggered_at')
      .eq('user_id', session.userId)
      .order('triggered_at', { ascending: true });

    const alertsByDate: Record<string, { acute: boolean; chronic: boolean }> = {};
    (alertRows ?? []).forEach((a) => {
      const date = a.triggered_at.split('T')[0];
      if (!alertsByDate[date]) alertsByDate[date] = { acute: false, chronic: false };
      if (a.alert_type === 'acute') alertsByDate[date].acute = true;
      if (a.alert_type === 'chronic') alertsByDate[date].chronic = true;
    });

    const exportDate = new Date().toISOString();
    const dateTag = exportDate.split('T')[0];

    // ─── Header komentar CSV (sesuai PRD 5.6) ────────────
    const headerComment = [
      `# Ekspor Data Aplikasi Jeda`,
      `# Tanggal Export: ${exportDate}`,
      `# Kode Akses: ${session.accessCode}`,
      `# Catatan: Data ini adalah riwayat check-in pribadi Anda.`,
      `# Dapat dibawa ke sesi konseling untuk diskusi berbasis data.`,
      `# Referensi: Saragih & Situngkir (2022), GIAT: Teknologi untuk Masyarakat`,
    ].join('\n');

    // ─── Header kolom CSV (sesuai PRD 5.6) ───────────────
    const columns = [
      'Timestamp',
      'Tanggal',
      'Kecemasan_1',
      'Kecemasan_2',
      'Kecemasan_Gabungan',
      'Kelelahan_Mental',
      'Kelelahan_Fisik',
      'Kelelahan_Rata2',
      'Tidur_Kuantitas',
      'Tidur_Kualitas',
      'Progres',
      'Efikasi_Diri',
      'Progres_Rata2',
      'Sumber_Stres',
      'Peringatan_Akut',
      'Peringatan_Kronis',
      'Catatan',
    ];

    // ─── Baris data ───────────────────────────────────────
    const dataRows = (rows ?? []).map((r) => {
      const stressors = (r.checkin_stressors ?? [])
        .map((s: { stressor_category: string }) => s.stressor_category)
        .join(';');

      const combinedAnxiety = r.anxiety_q1 + r.anxiety_q2;
      const avgFatigue = ((r.fatigue_mental + r.fatigue_physical) / 2).toFixed(1);
      const avgProgress = ((r.progress + r.self_efficacy) / 2).toFixed(1);

      const dateAlerts = alertsByDate[r.checkin_date] ?? { acute: false, chronic: false };

      const cells = [
        r.checkin_time,
        r.checkin_date,
        r.anxiety_q1,
        r.anxiety_q2,
        combinedAnxiety,
        r.fatigue_mental,
        r.fatigue_physical,
        avgFatigue,
        `"${r.sleep_quantity ?? ''}"`,
        r.sleep_quality ?? '',
        r.progress,
        r.self_efficacy,
        avgProgress,
        `"${stressors}"`,
        dateAlerts.acute ? 'Ya' : 'Tidak',
        dateAlerts.chronic ? 'Ya' : 'Tidak',
        r.note ? `"${r.note.replace(/"/g, '""')}"` : '',
      ];

      return cells.join(',');
    });

    const csvContent = [
      headerComment,
      columns.join(','),
      ...dataRows,
    ].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="jeda_${session.accessCode}_${dateTag}.csv"`,
      },
    });
  } catch (err) {
    console.error('[GET /api/export/csv]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

