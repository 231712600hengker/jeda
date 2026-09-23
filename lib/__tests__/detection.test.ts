import assert from 'node:assert';
import { evaluateCheckinAlerts } from '../detection';

console.log('--- Menjalankan Unit Test Deteksi Alert Jeda v2 ---');

// Skenario 1: Alert Akut (Kecemasan gabungan >= 5)
{
  const current = {
    anxietyQ1: 3,
    anxietyQ2: 2, // 3 + 2 = 5 (>= 5)
    fatigueMental: 5,
    fatiguePhysical: 4, // avg = 4.5 (< 8)
    progress: 3,
    selfEfficacy: 3,
    checkinTime: '2026-09-23T10:00:00.000Z',
  };
  const res = evaluateCheckinAlerts(current, [], []);
  assert.strictEqual(res.isAcute, true, 'Seharusnya trigger alert akut karena kecemasan = 5');
  assert.strictEqual(res.isChronic, false, 'Tidak boleh trigger alert kronis');
  console.log('✅ Skenario 1 (Akut - Cemas >= 5): LULUS');
}

// Skenario 2: Alert Akut (Rata-rata kelelahan >= 8)
{
  const current = {
    anxietyQ1: 1,
    anxietyQ2: 1, // 2 (< 5)
    fatigueMental: 9,
    fatiguePhysical: 7, // avg = 8.0 (>= 8)
    progress: 3,
    selfEfficacy: 3,
    checkinTime: '2026-09-23T10:00:00.000Z',
  };
  const res = evaluateCheckinAlerts(current, [], []);
  assert.strictEqual(res.isAcute, true, 'Seharusnya trigger alert akut karena kelelahan = 8');
  assert.strictEqual(res.isChronic, false, 'Tidak boleh trigger alert kronis');
  console.log('✅ Skenario 2 (Akut - Kelelahan >= 8): LULUS');
}

// Skenario 3: Kondisi Normal (Tanpa alert)
{
  const current = {
    anxietyQ1: 1,
    anxietyQ2: 1,
    fatigueMental: 4,
    fatiguePhysical: 5,
    progress: 4,
    selfEfficacy: 4,
    checkinTime: '2026-09-23T10:00:00.000Z',
  };
  const res = evaluateCheckinAlerts(current, [], []);
  assert.strictEqual(res.isAcute, false, 'Tidak boleh trigger akut');
  assert.strictEqual(res.isChronic, false, 'Tidak boleh trigger kronis');
  console.log('✅ Skenario 3 (Normal): LULUS');
}

// Skenario 4: Alert Kronis (5 hari progress <= 2 & fatigue >= 6)
{
  const past = [
    { anxietyQ1: 1, anxietyQ2: 1, fatigueMental: 7, fatiguePhysical: 7, progress: 2, selfEfficacy: 1, checkinTime: '2026-09-22T10:00:00.000Z' },
    { anxietyQ1: 1, anxietyQ2: 1, fatigueMental: 8, fatiguePhysical: 6, progress: 1, selfEfficacy: 2, checkinTime: '2026-09-21T10:00:00.000Z' },
    { anxietyQ1: 1, anxietyQ2: 1, fatigueMental: 7, fatiguePhysical: 7, progress: 2, selfEfficacy: 1, checkinTime: '2026-09-20T10:00:00.000Z' },
    { anxietyQ1: 1, anxietyQ2: 1, fatigueMental: 6, fatiguePhysical: 6, progress: 1, selfEfficacy: 1, checkinTime: '2026-09-19T10:00:00.000Z' },
  ];
  const current = {
    anxietyQ1: 1,
    anxietyQ2: 1,
    fatigueMental: 7,
    fatiguePhysical: 7, // avg 7
    progress: 1,
    selfEfficacy: 1, // avg 1
    checkinTime: '2026-09-23T10:00:00.000Z',
  };

  const res = evaluateCheckinAlerts(current, past, []);
  assert.strictEqual(res.isChronic, true, 'Seharusnya trigger alert kronis');
  console.log('✅ Skenario 4 (Kronis - 5 Hari Mandek & Lelah): LULUS');
}

// Skenario 5: Suppression Mechanism (Alert kronis belum ditinjau dalam 3 hari)
{
  const past = [
    { anxietyQ1: 1, anxietyQ2: 1, fatigueMental: 7, fatiguePhysical: 7, progress: 2, selfEfficacy: 1, checkinTime: '2026-09-22T10:00:00.000Z' },
    { anxietyQ1: 1, anxietyQ2: 1, fatigueMental: 8, fatiguePhysical: 6, progress: 1, selfEfficacy: 2, checkinTime: '2026-09-21T10:00:00.000Z' },
    { anxietyQ1: 1, anxietyQ2: 1, fatigueMental: 7, fatiguePhysical: 7, progress: 2, selfEfficacy: 1, checkinTime: '2026-09-20T10:00:00.000Z' },
    { anxietyQ1: 1, anxietyQ2: 1, fatigueMental: 6, fatiguePhysical: 6, progress: 1, selfEfficacy: 1, checkinTime: '2026-09-19T10:00:00.000Z' },
  ];
  const current = {
    anxietyQ1: 1,
    anxietyQ2: 1,
    fatigueMental: 7,
    fatiguePhysical: 7,
    progress: 1,
    selfEfficacy: 1,
    checkinTime: '2026-09-23T10:00:00.000Z',
  };

  // Ada alert kronis unreviewed 1 hari lalu
  const pastAlerts = [
    {
      alertType: 'chronic' as const,
      triggeredAt: '2026-09-22T10:00:00.000Z',
      reviewedAt: null,
    },
  ];

  const res = evaluateCheckinAlerts(current, past, pastAlerts);
  assert.strictEqual(res.isChronic, false, 'Seharusnya ditekan (suppressed) karena ada alert kronis belum ditinjau');
  console.log('✅ Skenario 5 (Peredaman / Suppression Alert Kronis): LULUS');
}

console.log('--- Semua 5 Skenario Deteksi Alert Sesuai PRD Appendix B Telah Terverifikasi! ---');

