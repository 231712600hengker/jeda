// GET /api/alerts — Ambil daftar alert user
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import type { AlertRecord } from '@/types/jeda';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Sesi tidak valid.' }, { status: 401 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get('status'); // 'unreviewed' | 'all'

    let query = supabaseAdmin
      .from('alerts')
      .select('id, user_id, alert_type, triggered_at, reviewed_at, alert_data')
      .eq('user_id', session.userId)
      .order('triggered_at', { ascending: false });

    if (status === 'unreviewed') {
      query = query.is('reviewed_at', null);
    }

    const { data, error } = await query;
    if (error) throw error;

    const alerts: AlertRecord[] = (data ?? []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      alertType: r.alert_type,
      triggeredAt: r.triggered_at,
      reviewedAt: r.reviewed_at,
      alertData: r.alert_data,
    }));

    return NextResponse.json({ alerts });
  } catch (err) {
    console.error('[GET /api/alerts]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

