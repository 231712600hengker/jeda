import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'

const SESSION_COOKIE = 'jeda_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30

function secret(name: 'ANONYMOUS_CODE_HMAC_SECRET' | 'SESSION_SECRET') {
  const value = process.env[name]
  if (!value || value.length < 32) throw new Error(`${name} wajib diisi dengan secret minimal 32 karakter.`)
  return value
}

export function hashAnonymousCode(code: string) {
  return createHmac('sha256', secret('ANONYMOUS_CODE_HMAC_SECRET')).update(code.trim().toUpperCase()).digest('hex')
}

function sign(value: string) { return createHmac('sha256', secret('SESSION_SECRET')).update(value).digest('base64url') }

export function createSession(userId: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  const value = `v1.${userId}.${expiresAt}`
  return { name: SESSION_COOKIE, value: `${value}.${sign(value)}`, options: { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge: SESSION_TTL_SECONDS } }
}

export function getSessionUserId(request: Request) {
  const cookie = request.headers.get('cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1)
  if (!cookie) return null
  const [version, userId, expiresAt, signature] = cookie.split('.')
  const value = `${version}.${userId}.${expiresAt}`
  if (version !== 'v1' || !/^[0-9a-f-]{36}$/i.test(userId ?? '') || !/^\d+$/.test(expiresAt ?? '') || Number(expiresAt) < Math.floor(Date.now() / 1000) || !signature) return null
  const expected = sign(value)
  if (expected.length !== signature.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return null
  return userId
}

export function clearSession() { return { name: SESSION_COOKIE, value: '', options: { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge: 0 } } }

const buckets = new Map<string, { count: number; resetAt: number }>()
export function enforceRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now(); const current = buckets.get(key)
  if (!current || current.resetAt <= now) { buckets.set(key, { count: 1, resetAt: now + windowMs }); return }
  if (current.count >= limit) throw Object.assign(new Error('Terlalu banyak permintaan. Coba lagi beberapa saat.'), { status: 429 })
  current.count += 1
}

export function requestIp(request: Request) { return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown' }

export async function readJson<T>(request: Request, maxBytes = 16_384): Promise<T> {
  const length = Number(request.headers.get('content-length') ?? 0)
  if (length > maxBytes) throw Object.assign(new Error('Payload terlalu besar.'), { status: 413 })
  try { return await request.json() as T } catch { throw new Error('JSON tidak valid.') }
}
