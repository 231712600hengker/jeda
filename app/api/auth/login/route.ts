// POST /api/auth/login
// Validasi kode akses dan buat session (httpOnly cookie)
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createSession } from '@/lib/auth/session';
import type { UserSession } from '@/types/jeda';

const LoginSchema = z.object({
  accessCode: z.string().min(1, 'Kode akses wajib diisi').trim().toUpperCase(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { accessCode } = parsed.data;

    // Cari user dengan kode akses ini
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, access_code, consent_agreed, consent_agreed_at, created_at, last_checkin_at')
      .eq('access_code', accessCode)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Kode akses tidak ditemukan. Periksa kembali atau buat kode baru.' },
        { status: 404 }
      );
    }

    // Buat session JWT dan simpan ke httpOnly cookie
    const session: UserSession = {
      userId: user.id,
      accessCode: user.access_code,
      consentAgreed: user.consent_agreed,
      createdAt: user.created_at,
      lastCheckinAt: user.last_checkin_at,
    };

    await createSession(session);

    return NextResponse.json({
      userId: user.id,
      accessCode: user.access_code,
      consentAgreed: user.consent_agreed,
      lastCheckinAt: user.last_checkin_at,
    });
  } catch (err) {
    console.error('[login]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

