import { apiError, requireSessionUser } from '@/lib/server/request-auth'
import { supabaseAdmin } from '@/lib/server/supabase'
import { enforceRateLimit, readJson, requestIp } from '@/lib/server/security'

function validWeekStart(value: unknown) { return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) }

export async function POST(request: Request) {
  try {
    const { weekStart } = await readJson<{ weekStart?: string }>(request, 1_024)
    const userId = requireSessionUser(request); enforceRateLimit(`reflection:read:${requestIp(request)}:${userId}`, 30, 60_000)
    if (!validWeekStart(weekStart)) throw new Error('Minggu refleksi tidak valid.')
    const { data, error } = await supabaseAdmin().from('weekly_reflections').select('reflection').eq('user_id', userId).eq('week_start', weekStart).maybeSingle()
    if (error) throw new Error('Refleksi belum dapat dimuat.')
    return Response.json({ reflection: data?.reflection ?? '' })
  } catch (error) { return apiError(error) }
}

export async function PUT(request: Request) {
  try {
    const { weekStart, reflection } = await readJson<{ weekStart?: string; reflection?: string }>(request, 8_192)
    const userId = requireSessionUser(request); enforceRateLimit(`reflection:write:${requestIp(request)}:${userId}`, 20, 60_000)
    if (!validWeekStart(weekStart) || typeof reflection !== 'string' || !reflection.trim() || reflection.length > 2000) throw new Error('Refleksi tidak valid.')
    const { error } = await supabaseAdmin().from('weekly_reflections').upsert({ user_id: userId, week_start: weekStart, reflection: reflection.trim(), updated_at: new Date().toISOString() }, { onConflict: 'user_id,week_start' })
    if (error) throw new Error('Refleksi belum dapat disimpan.')
    return Response.json({ ok: true })
  } catch (error) { return apiError(error) }
}
