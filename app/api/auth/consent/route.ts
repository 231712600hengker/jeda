// POST /api/auth/consent
// Tandai user telah setuju informed consent
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getSessionFromRequest, createSession } from '@/lib/auth/session';
import type { UserSession } from '@/types/jeda';

const ConsentSchema = z.object({
  agreed: z.literal(true, { errorMap: () => ({ message: 'Persetujuan wajib diberikan' }) }),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Sesi tidak valid. Silakan login kembali.' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ConsentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const now = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from('users')
      .update({
        consent_agreed: true,
        consent_agreed_at: now,
      })
      .eq('id', session.userId);

    if (error) throw error;

    // Perbarui session cookie dengan consent_agreed = true
    const updatedSession: UserSession = {
      ...session,
      consentAgreed: true,
    };
    await createSession(updatedSession);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[consent]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

