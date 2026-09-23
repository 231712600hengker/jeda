// ============================================================
// Jeda v2.0 — TypeScript Types
// Sesuai PRD 6.2 schema + komponen frontend
// ============================================================

// ─── ENUMS / LITERAL TYPES ────────────────────────────────

export type SleepQuantity = '< 5 jam' | '5-6 jam' | '6-7 jam' | '7-8 jam' | '> 8 jam';
export type SleepQuality = 'buruk' | 'cukup' | 'baik';
export type AlertType = 'acute' | 'chronic';

export type StressorCategory =
  | 'technical'             // Beban teknis/kognitif (riset, analisis data, menulis)
  | 'guidance_bureaucracy'  // Bimbingan & birokrasi (proses bimbingan, administrasi)
  | 'time_management'       // Manajemen waktu (deadline, prioritas, prokrastinasi)
  | 'infrastructure'        // Infrastruktur & lingkungan (tempat kerja, akses sumber daya)
  | 'personal';             // Personal (keluarga, pertemanan, kesehatan)

// ─── CORE DATA TYPES ──────────────────────────────────────

/**
 * Data check-in 9 item — representasi row `checkins` + `checkin_stressors`
 * dari Supabase (sudah di-join & di-map ke camelCase)
 */
export interface CheckinItem {
  id: string;
  userId: string;
  checkinDate: string;   // YYYY-MM-DD
  checkinTime: string;   // ISO 8601

  // 9 Item EMA
  anxietyQ1: number;     // 0-3, GAD-2 adaptasi
  anxietyQ2: number;     // 0-3, GAD-2 adaptasi
  fatigueMental: number; // 1-10, Chalder Fatigue Scale
  fatiguePhysical: number; // 1-10, Chalder Fatigue Scale
  sleepQuantity: SleepQuantity;
  sleepQuality: SleepQuality;
  progress: number;      // 1-5, Likert
  selfEfficacy: number;  // 1-5, Likert
  stressors: StressorCategory[];

  note?: string;
  acuteAlertTriggered?: boolean;
  chronicAlertTriggered?: boolean;
  createdAt: string;
}

export interface AlertRecord {
  id: string;
  userId: string;
  alertType: AlertType;
  triggeredAt: string;   // ISO 8601
  reviewedAt: string | null;
  alertData: {
    anxietyScore?: number;
    fatigueScore?: number;
    avgProgress5Days?: number;
    avgFatigue5Days?: number;
    message: string;
  };
}

/**
 * Session user — disimpan sebagai JWT payload
 */
export interface UserSession {
  userId: string;       // UUID dari tabel users
  accessCode: string;   // e.g. "JD-A7F2K9"
  consentAgreed: boolean;
  createdAt: string;
  lastCheckinAt?: string | null;
}

// ─── DETECTION TYPES ──────────────────────────────────────

export interface DetectionResult {
  isAcute: boolean;
  acuteDetails?: {
    combinedAnxiety: number;
    avgFatigue: number;
    reason: string;
  };
  isChronic: boolean;
  chronicDetails?: {
    avgProgress5Days: number;
    avgFatigue5Days: number;
    reason: string;
  };
}

// ─── API RESPONSE TYPES ───────────────────────────────────

export interface ApiGenerateCodeResponse {
  accessCode: string;
  userId: string;
}

export interface ApiLoginResponse {
  userId: string;
  accessCode: string;
  consentAgreed: boolean;
  lastCheckinAt: string | null;
}

export interface ApiCheckinPostResponse {
  checkinId: string;
  checkinDate?: string;
  isUpdate?: boolean;
  alerts: AlertRecord[];
  detection?: DetectionResult;
}

export interface ApiCheckinGetResponse {
  checkins: CheckinItem[];
  hasCheckedInToday: boolean;
  todayCheckin: CheckinItem | null;
}

export interface ApiDashboardSummary {
  latestCheckin: CheckinItem | null;
  trends: {
    anxiety: TrendPoint[];
    fatigue: TrendPoint[];
    progress: TrendPoint[];
    stressorsDistribution: Record<string, number>;
  };
  streak: number;
  totalCheckins: number;
  insights: string;
}

export interface TrendPoint {
  date: string;      // formatted label
  rawDate: string;   // YYYY-MM-DD
  value: number;
}

// ─── DASHBOARD CHART DATA ─────────────────────────────────

export interface ChartDataPoint {
  date: string;
  rawDate: string;
  kecemasan: number;
  kelelahan: number;
  progres: number;
  tidurKuantitas: SleepQuantity;
  tidurKualitas: SleepQuality;
}

export interface StressorDistributionPoint {
  name: string;
  frekuensi: number;
}

