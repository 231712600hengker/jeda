import { apiError, requireAnonymousUser } from '@/lib/server/request-auth'
import { supabaseAdmin } from '@/lib/server/supabase'

export async function POST(request: Request) {
  try {
    const { anonymousCode, weekStart } = await request.json()
    const user = await requireAnonymousUser(anonymousCode)
    if (typeof weekStart !== 'string') throw new Error('Minggu refleksi tidak valid.')
    const { data, error } = await supabaseAdmin().from('weekly_reflections').select('reflection').eq('user_id', user.id).eq('week_start', weekStart).maybeSingle()
    if (error) throw new Error('Refleksi belum dapat dimuat.')
    return Response.json({ reflection: data?.reflection ?? '' })
  } catch (error) { return apiError(error) }
}

export async function PUT(request: Request) {
  try {
    const { anonymousCode, weekStart, reflection } = await request.json()
    const user = await requireAnonymousUser(anonymousCode)
    if (typeof weekStart !== 'string' || typeof reflection !== 'string' || !reflection.trim() || reflection.length > 2000) throw new Error('Refleksi tidak valid.')
    const { error } = await supabaseAdmin().from('weekly_reflections').upsert({ user_id: user.id, week_start: weekStart, reflection: reflection.trim(), updated_at: new Date().toISOString() }, { onConflict: 'user_id,week_start' })
    if (error) throw new Error('Refleksi belum dapat disimpan.')
    return Response.json({ ok: true })
  } catch (error) { return apiError(error) }
}
