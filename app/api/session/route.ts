import { supabaseAdmin } from '@/lib/server/supabase'
import { apiError, requireAnonymousUser } from '@/lib/server/request-auth'
import { createSession, enforceRateLimit, hashAnonymousCode, readJson, requestIp } from '@/lib/server/security'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { action, anonymousCode } = await readJson<{ action?: string; anonymousCode?: string }>(request, 2_048)
    if (action === 'create') {
      enforceRateLimit(`session:create:${requestIp(request)}`, 5, 10 * 60_000)
      const code = `JEDA-${crypto.randomUUID().toUpperCase()}`
      const { data, error } = await supabaseAdmin().from('users').insert({ anonymous_code_hash: hashAnonymousCode(code) }).select('id').single()
      if (error || !data) throw new Error('Gagal membuat kode anonim.')
      const response = NextResponse.json({ anonymousCode: code })
      response.cookies.set(createSession(data.id)); return response
    }

    if (action === 'login') {
      enforceRateLimit(`session:login:${requestIp(request)}`, 10, 10 * 60_000)
      const user = await requireAnonymousUser(anonymousCode)
      const response = NextResponse.json({ ok: true })
      response.cookies.set(createSession(user.id)); return response
    }
    return apiError(new Error('Aksi sesi tidak dikenal.'))
  } catch (error) {
    return apiError(error)
  }
}
