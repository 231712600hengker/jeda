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

const JWT_SECRET = process.env.JWT_SECRET?.trim();
const COOKIE_NAME = 'jeda_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 hari

function getSecretKey(): Uint8Array {
  const isProduction = process.env.NODE_ENV === 'production';
  const secret = JWT_SECRET || (!isProduction ? 'jeda-dev-secret-key-for-local-tests-32b' : undefined);

  if (!secret || secret.length < 32) {
    if (isProduction) {
      throw new Error(
        'Missing or weak JWT_SECRET. Set JWT_SECRET to a random string with at least 32 characters in your deployment environment.'
      );
    }

    console.warn('Missing JWT_SECRET in non-production mode; using a local fallback secret for tests/dev only.');
    return new TextEncoder().encode('jeda-dev-secret-key-for-local-tests-32b');
  }

  return new TextEncoder().encode(secret);
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

