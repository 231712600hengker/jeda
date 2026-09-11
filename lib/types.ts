export interface Checkin {
  id: string
  user_id: string
  checkin_date: string
  anxiety_1: number
  anxiety_2: number
  fatigue_mental: number
  fatigue_physical: number
  sleep_quantity: string
  sleep_quality: string
  progress_1: number
  progress_2: number
  created_at?: string
}

export interface CheckinStressor {
  id?: string
  checkin_id: string
  category: string
  created_at?: string
}

export interface ChartDataPoint {
  date: string
  displayDate: string
  totalAnxiety: number
  anxiety1: number
  anxiety2: number
  fatigueMental: number
  fatiguePhysical: number
  progressMeaningful: number
  progressNextStep: number
  sleepQuantity: string
  sleepQuality: string
}

export interface StressorCount {
  category: string
  label: string
  count: number
}

export interface AlertRecord {
  id?: string
  user_id: string
  alert_type: 'akut' | 'kronis'
  triggered_at?: string
  trigger_detail: {
    reason?: string
    reasons?: string[]
    anxiety_score?: number
    fatigue_avg?: number
    checkin_id?: string
    [key: string]: unknown
  }
  acknowledged?: boolean
}

