// ============================================================
// Jeda v2.0 — Deteksi Pola Otomatis
// 
// Referensi: Saragih & Situngkir (2022), GIAT: Teknologi untuk Masyarakat
// Logic diport dari jeda-omega (sudah sesuai PRD Appendix B)
// Perubahan: field names disesuaikan dengan CheckinItem interface v2
// ============================================================

import type { CheckinItem, AlertRecord, DetectionResult } from '@/types/jeda';

// ─── TIPE INPUT UNTUK DETEKSI ─────────────────────────────

type CheckinForDetection = Pick<
  CheckinItem,
  | 'anxietyQ1'
  | 'anxietyQ2'
  | 'fatigueMental'
  | 'fatiguePhysical'
  | 'progress'
  | 'selfEfficacy'
  | 'checkinTime'
>;

// ─── FUNGSI UTAMA ─────────────────────────────────────────

/**
 * Evaluasi apakah check-in terbaru memicu alert akut dan/atau kronis.
 *
 * @param currentCheckin  - Data check-in yang baru saja disubmit
 * @param pastCheckins    - Riwayat checkin sebelumnya (terurut dari terbaru ke terlama)
 * @param pastAlerts      - Riwayat alert (untuk suppression mechanism kronis)
 */
export function evaluateCheckinAlerts(
  currentCheckin: CheckinForDetection,
  pastCheckins: CheckinForDetection[],
  pastAlerts: Pick<AlertRecord, 'alertType' | 'triggeredAt' | 'reviewedAt'>[] = []
): DetectionResult {
  // ─── 1. ALERT AKUT ──────────────────────────────────────
  //
  // PRD 5.4:
  //   IF (skor_kecemasan_gabungan >= 5) OR (rata_rata_kelelahan >= 8) → AKUT
  //   skor_kecemasan_gabungan = item[0] + item[1]  (range 0-6)
  //   rata_rata_kelelahan = (item[2] + item[3]) / 2  (range 1-10)

  const combinedAnxiety = currentCheckin.anxietyQ1 + currentCheckin.anxietyQ2;
  const avgFatigue =
    (currentCheckin.fatigueMental + currentCheckin.fatiguePhysical) / 2;

  const isAcute = combinedAnxiety >= 5 || avgFatigue >= 8;

  let acuteReason = '';
  if (isAcute) {
    const reasons: string[] = [];
    if (combinedAnxiety >= 5) {
      reasons.push(
        `Skor kecemasan gabungan ${combinedAnxiety}/6 (ambang batas: ≥ 5)`
      );
    }
    if (avgFatigue >= 8) {
      reasons.push(
        `Rata-rata kelelahan ${avgFatigue.toFixed(1)}/10 (ambang batas: ≥ 8)`
      );
    }
    acuteReason = reasons.join(' dan ');
  }

  // ─── 2. ALERT KRONIS ────────────────────────────────────
  //
  // PRD 5.4:
  //   IF (last_5_checkins_exist
  //       AND rata_rata_progres_5hari <= 2
  //       AND rata_rata_kelelahan_5hari >= 6
  //       AND no_chronic_alert_in_last_3_days_or_previous_reviewed) → KRONIS
  //
  //   rata_rata_progres_5hari  = (item[6] + item[7]) / 2 dari 5 check-in terakhir
  //   rata_rata_kelelahan_5hari = (item[2] + item[3]) / 2 dari 5 check-in terakhir

  const recentHistory: CheckinForDetection[] = [currentCheckin, ...pastCheckins].slice(0, 5);
  let isChronic = false;
  let avgProgress5Days = 0;
  let avgFatigue5Days = 0;
  let chronicReason = '';

  if (recentHistory.length >= 5) {
    avgProgress5Days =
      recentHistory.reduce((acc, c) => acc + (c.progress + c.selfEfficacy) / 2, 0) /
      recentHistory.length;

    avgFatigue5Days =
      recentHistory.reduce(
        (acc, c) => acc + (c.fatigueMental + c.fatiguePhysical) / 2,
        0
      ) / recentHistory.length;

    const conditionMet = avgProgress5Days <= 2.0 && avgFatigue5Days >= 6.0;

    if (conditionMet) {
      // Suppression mechanism: jangan trigger kronis baru jika ada kronis
      // yang belum ditinjau dalam 3 hari terakhir
      const now = new Date(currentCheckin.checkinTime).getTime();
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

      const hasRecentUnreviewedChronic = pastAlerts.some((alert) => {
        if (alert.alertType !== 'chronic') return false;
        const alertTime = new Date(alert.triggeredAt).getTime();
        return now - alertTime < threeDaysMs && !alert.reviewedAt;
      });

      if (!hasRecentUnreviewedChronic) {
        isChronic = true;
        chronicReason =
          `Rata-rata progres 5 hari: ${avgProgress5Days.toFixed(1)}/5 (ambang: ≤ 2) ` +
          `dan rata-rata kelelahan 5 hari: ${avgFatigue5Days.toFixed(1)}/10 (ambang: ≥ 6)`;
      }
    }
  }

  return {
    isAcute,
    acuteDetails: isAcute
      ? { combinedAnxiety, avgFatigue, reason: acuteReason }
      : undefined,
    isChronic,
    chronicDetails: isChronic
      ? { avgProgress5Days, avgFatigue5Days, reason: chronicReason }
      : undefined,
  };
}

