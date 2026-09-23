// DELETE /api/user — Hapus akun dan semua data user (CASCADE di DB)
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getSessionFromRequest, destroySession } from '@/lib/auth/session';

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Sesi tidak valid.' }, { status: 401 });
    }

    // DELETE user → CASCADE otomatis hapus checkins, stressors, alerts
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', session.userId);

    if (error) throw error;

    // Hapus session cookie
    await destroySession();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/user]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

