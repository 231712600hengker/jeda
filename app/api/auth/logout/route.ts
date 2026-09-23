// POST /api/auth/logout
// Hapus session cookie
import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth/session';

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[logout]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

