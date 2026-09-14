import { apiError, requireAnonymousUser } from '@/lib/server/request-auth'
import { supabaseAdmin } from '@/lib/server/supabase'

export async function POST(request: Request) {
  try {
    const { anonymousCode } = await request.json()
    const user = await requireAnonymousUser(anonymousCode)
    const [{ data: checkins, error: checkinError }, { data: alerts, error: alertError }] = await Promise.all([
      supabaseAdmin().from('checkins').select('*').eq('user_id', user.id).order('checkin_date', { ascending: true }),
      supabaseAdmin().from('alerts').select('*').eq('user_id', user.id).eq('acknowledged', false).order('triggered_at', { ascending: false }),
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
