// ============================================================
// Jeda v2.0 — Session Management (JWT + httpOnly Cookie)
// 
// Strategi:
// - Login menghasilkan JWT yang disimpan di httpOnly cookie
// - Cookie dikirim otomatis oleh browser di setiap request
// - Lintas device: token di-decode server-side, tidak bergantung localStorage
// ============================================================

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import type { UserSession } from '@/types/jeda';

const JWT_SECRET = process.env.JWT_SECRET || 'jeda-v2-default-fallback-secret-min-32-chars-long';
const COOKIE_NAME = 'jeda_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 hari

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(JWT_SECRET);
}

// ─── CREATE & SIGN SESSION ─────────────────────────────────

/**
 * Buat signed JWT string dari UserSession.
 */
export async function signSessionToken(session: UserSession): Promise<string> {
  const secretKey = getSecretKey();
  return new SignJWT(session as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('90d')
    .sign(secretKey);
}

/**
 * Buat JWT dan simpan ke httpOnly cookie.
 * Dipanggil setelah login berhasil.
 */
export async function createSession(session: UserSession): Promise<string> {
  const token = await signSessionToken(session);

  // Set cookie (hanya di server — Next.js 15 menggunakan await cookies())
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });

  return token;
}

// ─── GET SESSION FROM COOKIE ──────────────────────────────

/**
 * Decode JWT dari cookie dan kembalikan UserSession.
 * Digunakan di API routes dari headers/cookies server component.
 */
export async function getSessionFromCookies(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Decode JWT dari Request object (untuk API routes di Edge/Node runtime).
 */
export async function getSessionFromRequest(req: NextRequest): Promise<UserSession | null> {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}

// ─── VERIFY TOKEN ─────────────────────────────────────────

export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as UserSession;
  } catch {
    return null;
  }
}

// ─── DESTROY SESSION ──────────────────────────────────────

/**
 * Hapus session cookie (logout).
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

