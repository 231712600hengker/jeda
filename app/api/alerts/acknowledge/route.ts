import { apiError, requireSessionUser } from '@/lib/server/request-auth'
import { supabaseAdmin } from '@/lib/server/supabase'
import { enforceRateLimit, readJson, requestIp } from '@/lib/server/security'

export async function POST(request: Request) {
  try {
    const { alertId } = await readJson<{ alertId?: string }>(request, 512)
    const userId = requireSessionUser(request); enforceRateLimit(`alert:${requestIp(request)}:${userId}`, 30, 60_000)
    if (typeof alertId !== 'string' || !/^[0-9a-f-]{36}$/i.test(alertId)) throw new Error('Alert tidak valid.')
    const { data, error } = await supabaseAdmin().from('alerts').update({ acknowledged: true }).eq('id', alertId).eq('user_id', userId).select('id').maybeSingle()
    if (error) throw new Error('Alert belum dapat diperbarui.')
    if (!data) throw Object.assign(new Error('Alert tidak ditemukan.'), { status: 404 })
    return Response.json({ ok: true })
  } catch (error) { return apiError(error) }
}
