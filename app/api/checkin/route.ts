import { apiError, requireAnonymousUser } from '@/lib/server/request-auth'
import { supabaseAdmin } from '@/lib/server/supabase'

function areConsecutiveDates(checkins: { checkin_date: string }[]) {
  return checkins.every((checkin, index) => index === checkins.length - 1 ||
    Math.round((new Date(`${checkin.checkin_date}T00:00:00`).getTime() - new Date(`${checkins[index + 1].checkin_date}T00:00:00`).getTime()) / 86_400_000) === 1)
}

export async function POST(request: Request) {
  try {
    const { anonymousCode, stressors = [], ...input } = await request.json()
    const user = await requireAnonymousUser(anonymousCode)
    const numericFields = ['anxiety_1', 'anxiety_2', 'fatigue_mental', 'fatigue_physical', 'progress_1', 'progress_2'] as const
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.checkin_date ?? '') || !Array.isArray(stressors) || numericFields.some((field) => !Number.isFinite(input[field]))) {
      throw new Error('Data check-in tidak valid.')
    }
    const { data: checkin, error } = await supabaseAdmin().from('checkins').insert({ ...input, user_id: user.id }).select().single()
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
    if (reasons.length) await supabaseAdmin().from('alerts').insert({ user_id: user.id, alert_type: 'akut', trigger_detail: { reason: reasons.join(', '), reasons, anxiety_score: anxietyScore, fatigue_avg: fatigueAverage, checkin_id: checkin.id } })

    const { data: recent } = await supabaseAdmin().from('checkins').select('checkin_date, progress_1, progress_2, fatigue_mental, fatigue_physical').eq('user_id', user.id).order('checkin_date', { ascending: false }).limit(5)
    if (recent?.length === 5 && areConsecutiveDates(recent)) {
      const avgProgress = recent.reduce((sum, item) => sum + (item.progress_1 + item.progress_2) / 2, 0) / recent.length
      const avgFatigue = recent.reduce((sum, item) => sum + (item.fatigue_mental + item.fatigue_physical) / 2, 0) / recent.length
      if (avgProgress <= 2 && avgFatigue >= 6) {
        const threeDaysAgo = new Date(Date.now() - 3 * 86_400_000).toISOString()
        const { data: existing } = await supabaseAdmin().from('alerts').select('id').eq('user_id', user.id).eq('alert_type', 'kronis').eq('acknowledged', false).gte('triggered_at', threeDaysAgo).limit(1)
        if (!existing?.length) {
          const reason = `Pola stagnasi 5 hari: progres rata-rata ${avgProgress.toFixed(1)}/5 dan kelelahan ${avgFatigue.toFixed(1)}/10`
          reasons.push(reason)
          await supabaseAdmin().from('alerts').insert({ user_id: user.id, alert_type: 'kronis', trigger_detail: { reason, reasons: [reason], avg_progress: avgProgress, avg_fatigue: avgFatigue, window_days: 5 } })
        }
      }
    }
    return Response.json({ reasons, anxietyScore, fatigueAverage })
  } catch (error) { return apiError(error) }
}
