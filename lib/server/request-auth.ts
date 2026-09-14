import { supabaseAdmin } from './supabase'
import { getSessionUserId } from './security'

export async function requireAnonymousUser(anonymousCode: unknown) {
  if (typeof anonymousCode !== 'string' || !/^JEDA-[A-F0-9-]{8,}$/i.test(anonymousCode.trim())) {
    throw new Error('Kode anonim tidak valid.')
  }

  const { hashAnonymousCode } = await import('./security')
  const { data, error } = await supabaseAdmin()
    .from('users')
    .select('id')
    .eq('anonymous_code_hash', hashAnonymousCode(anonymousCode))
    .maybeSingle()

  if (error) throw new Error('Tidak dapat memverifikasi kode anonim.')
  if (!data) throw new Error('Kode anonim tidak ditemukan.')
  return data
}

export function requireSessionUser(request: Request) {
  const userId = getSessionUserId(request)
  if (!userId) throw Object.assign(new Error('Sesi tidak valid atau telah berakhir.'), { status: 401 })
  return userId
}

export function apiError(error: unknown, status = 400) {
  if (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') status = error.status
  const message = error instanceof Error ? error.message : 'Permintaan tidak dapat diproses.'
  return Response.json({ error: message }, { status })
}
