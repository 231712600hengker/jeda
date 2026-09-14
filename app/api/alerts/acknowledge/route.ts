import { apiError, requireAnonymousUser } from '@/lib/server/request-auth'
import { supabaseAdmin } from '@/lib/server/supabase'

export async function POST(request: Request) {
  try {
    const { anonymousCode, alertId } = await request.json()
    const user = await requireAnonymousUser(anonymousCode)
    if (typeof alertId !== 'string') throw new Error('Alert tidak valid.')
    const { error } = await supabaseAdmin().from('alerts').update({ acknowledged: true }).eq('id', alertId).eq('user_id', user.id)
    if (error) throw new Error('Alert belum dapat diperbarui.')
    return Response.json({ ok: true })
  } catch (error) { return apiError(error) }
}
