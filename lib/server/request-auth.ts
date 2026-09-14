import { supabaseAdmin } from './supabase'

export async function requireAnonymousUser(anonymousCode: unknown) {
  if (typeof anonymousCode !== 'string' || !/^JEDA-[A-F0-9-]{8,}$/i.test(anonymousCode.trim())) {
    throw new Error('Kode anonim tidak valid.')
  }

  const { data, error } = await supabaseAdmin()
    .from('users')
    .select('id, anonymous_code')
    .eq('anonymous_code', anonymousCode.trim().toUpperCase())
    .maybeSingle()

  if (error) throw new Error('Tidak dapat memverifikasi kode anonim.')
  if (!data) throw new Error('Kode anonim tidak ditemukan.')
  return data
}

export function apiError(error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : 'Permintaan tidak dapat diproses.'
  return Response.json({ error: message }, { status })
}
