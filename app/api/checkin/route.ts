import { apiError, requireSessionUser } from '@/lib/server/request-auth'
import { supabaseAdmin } from '@/lib/server/supabase'
import { enforceRateLimit, readJson, requestIp } from '@/lib/server/security'
import { SLEEP_QUALITY_OPTIONS, SLEEP_QUANTITY_OPTIONS, STRESSOR_OPTIONS } from '@/lib/constants'

type CheckinRequest = { checkin_date?: unknown; anxiety_1?: unknown; anxiety_2?: unknown; fatigue_mental?: unknown; fatigue_physical?: unknown; sleep_quantity?: unknown; sleep_quality?: unknown; progress_1?: unknown; progress_2?: unknown; stressors?: unknown }
const stressorValues = new Set(STRESSOR_OPTIONS.map((option) => option.value))
const sleepQuantities = new Set(SLEEP_QUANTITY_OPTIONS)
const sleepQualities = new Set(SLEEP_QUALITY_OPTIONS)
const isIntIn = (value: unknown, min: number, max: number) => typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max
function isIsoDate(value: unknown) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number); const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

function areConsecutiveDates(checkins: { checkin_date: string }[]) {
  return checkins.every((checkin, index) => index === checkins.length - 1 ||
    Math.round((new Date(`${checkin.checkin_date}T00:00:00`).getTime() - new Date(`${checkins[index + 1].checkin_date}T00:00:00`).getTime()) / 86_400_000) === 1)
}

export async function POST(request: Request) {
  try {
    const input = await readJson<CheckinRequest>(request, 8_192)
    const userId = requireSessionUser(request); enforceRateLimit(`checkin:${requestIp(request)}:${userId}`, 20, 60_000)
    const stressors = input.stressors ?? []
    if (!isIsoDate(input.checkin_date) || !isIntIn(input.anxiety_1, 0, 3) || !isIntIn(input.anxiety_2, 0, 3) || !isIntIn(input.fatigue_mental, 1, 10) || !isIntIn(input.fatigue_physical, 1, 10) || !isIntIn(input.progress_1, 1, 5) || !isIntIn(input.progress_2, 1, 5) || typeof input.sleep_quantity !== 'string' || !sleepQuantities.has(input.sleep_quantity) || typeof input.sleep_quality !== 'string' || !sleepQualities.has(input.sleep_quality) || !Array.isArray(stressors) || stressors.length > 12 || new Set(stressors).size !== stressors.length || !stressors.every((value) => typeof value === 'string' && stressorValues.has(value))) {
      throw new Error('Data check-in tidak valid.')
    }
    const checkinInput = { user_id: userId, checkin_date: input.checkin_date, anxiety_1: input.anxiety_1, anxiety_2: input.anxiety_2, fatigue_mental: input.fatigue_mental, fatigue_physical: input.fatigue_physical, sleep_quantity: input.sleep_quantity, sleep_quality: input.sleep_quality, progress_1: input.progress_1, progress_2: input.progress_2 }
    const { data: checkin, error } = await supabaseAdmin().from('checkins').insert(checkinInput).select().single()
    if (error || !checkin) throw new Error('Check-in belum dapat disimpan.')
    if (stressors.length) {
      const { error: stressorError } = await supabaseAdmin().from('checkin_stressors').insert(stressors.map((category: string) => ({ checkin_id: checkin.id, category })))
      if (stressorError) throw new Error('Pemicu belum dapat disimpan.')
    }

    const anxietyScore = checkin.anxiety_1 + checkin.anxiety_2
    const fatigueAverage = (checkin.fatigue_mental + checkin.fatigue_physical) / 2
    const reasons = [
      ...(anxietyScore >= 5 ? [`Kecemasan tinggi: skor ${anxietyScore}/6`] : []),
      ...(fatigueAverage >= 8 ? [`Kelelahan tinggi: rata-rata ${fatigueAverage}/10`] : []),
    ]
    if (reasons.length) await supabaseAdmin().from('alerts').insert({ user_id: userId, alert_type: 'akut', trigger_detail: { reason: reasons.join(', '), reasons, anxiety_score: anxietyScore, fatigue_avg: fatigueAverage, checkin_id: checkin.id } })

    const { data: recent } = await supabaseAdmin().from('checkins').select('checkin_date, progress_1, progress_2, fatigue_mental, fatigue_physical').eq('user_id', userId).order('checkin_date', { ascending: false }).limit(5)
    if (recent?.length === 5 && areConsecutiveDates(recent)) {
      const avgProgress = recent.reduce((sum, item) => sum + (item.progress_1 + item.progress_2) / 2, 0) / recent.length
      const avgFatigue = recent.reduce((sum, item) => sum + (item.fatigue_mental + item.fatigue_physical) / 2, 0) / recent.length
      if (avgProgress <= 2 && avgFatigue >= 6) {
        const threeDaysAgo = new Date(Date.now() - 3 * 86_400_000).toISOString()
        const { data: existing } = await supabaseAdmin().from('alerts').select('id').eq('user_id', userId).eq('alert_type', 'kronis').eq('acknowledged', false).gte('triggered_at', threeDaysAgo).limit(1)
        if (!existing?.length) {
          const reason = `Pola stagnasi 5 hari: progres rata-rata ${avgProgress.toFixed(1)}/5 dan kelelahan ${avgFatigue.toFixed(1)}/10`
          reasons.push(reason)
          await supabaseAdmin().from('alerts').insert({ user_id: userId, alert_type: 'kronis', trigger_detail: { reason, reasons: [reason], avg_progress: avgProgress, avg_fatigue: avgFatigue, window_days: 5 } })
        }
      }
    }
    return Response.json({ reasons, anxietyScore, fatigueAverage })
  } catch (error) { return apiError(error) }
}
