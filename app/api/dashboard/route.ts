import { apiError, requireSessionUser } from '@/lib/server/request-auth'
import { supabaseAdmin } from '@/lib/server/supabase'
import { enforceRateLimit, readJson, requestIp } from '@/lib/server/security'

export async function POST(request: Request) {
  try {
    await readJson<Record<string, never>>(request, 512)
    const userId = requireSessionUser(request)
    enforceRateLimit(`dashboard:${requestIp(request)}:${userId}`, 60, 60_000)
    const [{ data: checkins, error: checkinError }, { data: alerts, error: alertError }] = await Promise.all([
      supabaseAdmin().from('checkins').select('*').eq('user_id', userId).order('checkin_date', { ascending: true }).limit(365),
      supabaseAdmin().from('alerts').select('*').eq('user_id', userId).eq('acknowledged', false).order('triggered_at', { ascending: false }).limit(100),
    ])
    if (checkinError || alertError) throw new Error('Data dashboard belum dapat dimuat.')
    const ids = (checkins ?? []).map((checkin) => checkin.id)
    const { data: stressors, error: stressorError } = ids.length
      ? await supabaseAdmin().from('checkin_stressors').select('*').in('checkin_id', ids)
      : { data: [], error: null }
    if (stressorError) throw new Error('Data pemicu belum dapat dimuat.')
    return Response.json({ checkins: checkins ?? [], alerts: alerts ?? [], stressors: stressors ?? [] })
  } catch (error) { return apiError(error) }
}
