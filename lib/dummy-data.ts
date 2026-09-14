import { SLEEP_QUALITY_OPTIONS } from './constants'
import type { Checkin } from './types'

export function createDemoCheckins(): Checkin[] {
  const pattern = [[2, 2, 7, 6, 2, 2], [2, 1, 6, 5, 3, 3], [3, 2, 8, 7, 1, 2], [1, 1, 5, 4, 4, 4], [2, 2, 6, 6, 3, 3], [1, 0, 4, 3, 4, 5], [0, 1, 3, 4, 5, 4]]
  return pattern.map(([anxiety_1, anxiety_2, fatigue_mental, fatigue_physical, progress_1, progress_2], index) => {
    const date = new Date(); date.setDate(date.getDate() - (pattern.length - 1 - index))
    return { id: `demo-${index}`, user_id: 'demo', checkin_date: date.toISOString().split('T')[0], anxiety_1, anxiety_2, fatigue_mental, fatigue_physical, sleep_quantity: index === 3 ? '4-6 Jam' : '6-8 Jam', sleep_quality: index === 3 ? SLEEP_QUALITY_OPTIONS[0] : SLEEP_QUALITY_OPTIONS[1], progress_1, progress_2 }
  })
}
