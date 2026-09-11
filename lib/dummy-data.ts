import { supabase } from './supabase'
import { SLEEP_QUALITY_OPTIONS, SLEEP_QUANTITY_OPTIONS } from './constants'

export async function generateDummyCheckins(userId: string, days = 7) {
  const sleepQuantities = ['4-6 Jam', '6-8 Jam', '6-8 Jam', '< 4 Jam', '6-8 Jam', '> 8 Jam', '4-6 Jam']
  const sleepQualities = ['Cukup', 'Sangat nyenyak', 'Cukup', 'Sering terbangun atau gelisah', 'Cukup', 'Sangat nyenyak', 'Cukup']
  const samplePattern = [
    { a1: 2, a2: 2, fm: 7, fp: 6, p1: 2, p2: 2, stressors: ['teknis', 'manajemen_waktu'] },
    { a1: 2, a2: 1, fm: 6, fp: 5, p1: 3, p2: 3, stressors: ['teknis'] },
    { a1: 3, a2: 2, fm: 8, fp: 7, p1: 1, p2: 2, stressors: ['bimbingan', 'manajemen_waktu'] },
    { a1: 1, a2: 1, fm: 5, fp: 4, p1: 4, p2: 4, stressors: ['personal'] },
    { a1: 2, a2: 2, fm: 6, fp: 6, p1: 3, p2: 3, stressors: ['teknis', 'infrastruktur'] },
    { a1: 1, a2: 0, fm: 4, fp: 3, p1: 4, p2: 5, stressors: [] },
    { a1: 0, a2: 1, fm: 3, fp: 4, p1: 5, p2: 4, stressors: ['manajemen_waktu'] },
  ]

  const today = new Date()
  const createdCheckins = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]

    const pattern = samplePattern[(days - 1 - i) % samplePattern.length]

    const { data: checkin, error: checkinErr } = await supabase
      .from('checkins')
      .insert({
        user_id: userId,
        checkin_date: dateStr,
        anxiety_1: pattern.a1,
        anxiety_2: pattern.a2,
        fatigue_mental: pattern.fm,
        fatigue_physical: pattern.fp,
        sleep_quantity: sleepQuantities[i % sleepQuantities.length] ?? SLEEP_QUANTITY_OPTIONS[2],
        sleep_quality: sleepQualities[i % sleepQualities.length] ?? SLEEP_QUALITY_OPTIONS[1],
        progress_1: pattern.p1,
        progress_2: pattern.p2,
      })
      .select()
      .single()

    if (checkinErr) {
      console.warn(`Gagal insert dummy untuk tanggal ${dateStr}:`, checkinErr.message)
      continue
    }

    if (checkin && pattern.stressors.length > 0) {
      await supabase.from('checkin_stressors').insert(
        pattern.stressors.map((category) => ({
          checkin_id: checkin.id,
          category,
        }))
      )
    }

    createdCheckins.push(checkin)
  }

  return createdCheckins
}
