// POST /api/auth/login
// Validasi kode akses dan buat session (httpOnly cookie)
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createSession } from '@/lib/auth/session';
import type { UserSession } from '@/types/jeda';

// ─── Simple in-memory rate limiter ────────────────────────────────────────────
// Membatasi percobaan login: max 5 per IP per 60 detik.
// Catatan: bersifat per-instance (cocok untuk single-instance/serverless cold start).
// Untuk multi-instance / edge, ganti dengan Redis atau Upstash.
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60_000; // 60 detik

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true; // dalam batas
  }
  if (entry.count >= MAX_ATTEMPTS) return false; // melebihi batas
  entry.count++;
  return true;
}

// ─── Pesan error yang seragam ─────────────────────────────────────────────────
// Sengaja tidak membedakan "kode tidak ada" vs "kode salah" untuk mencegah
// enumeration attack (menebak apakah kode tertentu terdaftar).
const GENERIC_LOGIN_ERROR = 'Kode akses tidak valid. Periksa kembali atau buat kode baru.';

const LoginSchema = z.object({
  accessCode: z.string().min(1, 'Kode akses wajib diisi').trim().toUpperCase(),
});

export async function POST(req: NextRequest) {
  try {
    // ─── Rate limit berdasarkan IP ─────────────────────────────────────────
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.' },
        { status: 429 }
      );
    }

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
      // Kembalikan pesan yang sama apapun penyebabnya (tidak membedakan "tidak ada" vs "salah")
      return NextResponse.json(
        { error: GENERIC_LOGIN_ERROR },
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
