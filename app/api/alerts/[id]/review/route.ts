// POST /api/alerts/[id]/review — Tandai alert sebagai sudah ditinjau
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getSessionFromRequest } from '@/lib/auth/session';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Sesi tidak valid.' }, { status: 401 });
    }

    const { id: alertId } = await params;
    const reviewedAt = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('alerts')
      .update({ reviewed_at: reviewedAt })
      .eq('id', alertId)
      .eq('user_id', session.userId) // Pastikan hanya update milik user ini
      .select('id, reviewed_at')
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Alert tidak ditemukan atau sudah ditinjau.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ alertId: data.id, reviewedAt: data.reviewed_at });
  } catch (err) {
    console.error('[POST /api/alerts/[id]/review]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

