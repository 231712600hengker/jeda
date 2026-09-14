import { supabaseAdmin } from '@/lib/server/supabase'
import { apiError, requireAnonymousUser } from '@/lib/server/request-auth'

export async function POST(request: Request) {
  try {
    const { action, anonymousCode } = await request.json()
    if (action === 'create') {
      const code = `JEDA-${crypto.randomUUID().toUpperCase()}`
      const { data, error } = await supabaseAdmin().from('users').insert({ anonymous_code: code }).select('anonymous_code').single()
      if (error || !data) throw new Error('Gagal membuat kode anonim.')
      return Response.json({ anonymousCode: data.anonymous_code })
    }

    if (action === 'login') {
      const user = await requireAnonymousUser(anonymousCode)
      return Response.json({ anonymousCode: user.anonymous_code })
    }
    return apiError(new Error('Aksi sesi tidak dikenal.'))
  } catch (error) {
    return apiError(error)
  }
}
