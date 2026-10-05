import { describe, it } from 'node:test';
import assert from 'node:assert';
import { evaluateCheckinAlerts, evaluateQuickCheckinAlert } from '../detection';

describe('Sistem Deteksi Alert JEDA (PRD Appendix B)', () => {
  it('Skenario 1: Memicu Alert Akut jika Kecemasan gabungan >= 5', () => {
    const current = {
      anxietyQ1: 3,
      anxietyQ2: 2, // total = 5 (>= 5)
      fatigueMental: 5,
      fatiguePhysical: 4, // avg = 4.5
      progress: 3,
      selfEfficacy: 3,
      checkinTime: '2026-09-23T10:00:00.000Z',
      checkinDate: '2026-09-23',
    };
    const res = evaluateCheckinAlerts(current, [], []);
    assert.strictEqual(res.isAcute, true, 'Seharusnya trigger alert akut karena kecemasan = 5');
    assert.strictEqual(res.isChronic, false, 'Tidak boleh trigger alert kronis');
    assert.ok(res.acuteDetails?.reason.includes('kecemasan gabungan 5/6'));
  });

  it('Skenario 2: Memicu Alert Akut jika Rata-rata Kelelahan >= 8', () => {
    const current = {
      anxietyQ1: 1,
      anxietyQ2: 1, // total = 2 (< 5)
      fatigueMental: 9,
      fatiguePhysical: 7, // avg = 8.0 (>= 8)
      progress: 3,
      selfEfficacy: 3,
      checkinTime: '2026-09-23T10:00:00.000Z',
      checkinDate: '2026-09-23',
    };
    const res = evaluateCheckinAlerts(current, [], []);
    assert.strictEqual(res.isAcute, true, 'Seharusnya trigger alert akut karena kelelahan = 8');
    assert.strictEqual(res.isChronic, false, 'Tidak boleh trigger alert kronis');
    assert.ok(res.acuteDetails?.reason.includes('Rata-rata kelelahan 8.0/10'));
  });

  it('Skenario 3: Kondisi Normal tidak memicu alert akut maupun kronis', () => {
    const current = {
      anxietyQ1: 1,
      anxietyQ2: 1,
      fatigueMental: 4,
      fatiguePhysical: 5,
      progress: 4,
      selfEfficacy: 4,
      checkinTime: '2026-09-23T10:00:00.000Z',
      checkinDate: '2026-09-23',
    };
    const res = evaluateCheckinAlerts(current, [], []);
    assert.strictEqual(res.isAcute, false, 'Tidak boleh trigger akut');
    assert.strictEqual(res.isChronic, false, 'Tidak boleh trigger kronis');
    assert.strictEqual(res.acuteDetails, undefined);
    assert.strictEqual(res.chronicDetails, undefined);
  });

  it('Skenario 4: Memicu Alert Kronis jika 5 hari berturut-turut progress <= 2 & fatigue >= 6', () => {
    const past = [
      { anxietyQ1: 1, anxietyQ2: 1, fatigueMental: 7, fatiguePhysical: 7, progress: 2, selfEfficacy: 1, checkinTime: '2026-09-22T10:00:00.000Z', checkinDate: '2026-09-22' },
      { anxietyQ1: 1, anxietyQ2: 1, fatigueMental: 8, fatiguePhysical: 6, progress: 1, selfEfficacy: 2, checkinTime: '2026-09-21T10:00:00.000Z', checkinDate: '2026-09-21' },
      { anxietyQ1: 1, anxietyQ2: 1, fatigueMental: 7, fatiguePhysical: 7, progress: 2, selfEfficacy: 1, checkinTime: '2026-09-20T10:00:00.000Z', checkinDate: '2026-09-20' },
      { anxietyQ1: 1, anxietyQ2: 1, fatigueMental: 6, fatiguePhysical: 6, progress: 1, selfEfficacy: 1, checkinTime: '2026-09-19T10:00:00.000Z', checkinDate: '2026-09-19' },
    ];
    const current = {
      anxietyQ1: 1,
      anxietyQ2: 1,
      fatigueMental: 7,
      fatiguePhysical: 7, // avg 7
      progress: 1,
      selfEfficacy: 1,
      checkinTime: '2026-09-23T10:00:00.000Z',
      checkinDate: '2026-09-23',
    };

    const res = evaluateCheckinAlerts(current, past, []);
    assert.strictEqual(res.isChronic, true, 'Seharusnya trigger alert kronis');
    assert.ok(res.chronicDetails?.reason.includes('Rata-rata progres 5 hari'));
  });

  it('Skenario 5: Mekanisme Peredaman (Suppression) jika ada alert kronis belum ditinjau dalam 3 hari', () => {
    const past = [
      { anxietyQ1: 1, anxietyQ2: 1, fatigueMental: 7, fatiguePhysical: 7, progress: 2, selfEfficacy: 1, checkinTime: '2026-09-22T10:00:00.000Z', checkinDate: '2026-09-22' },
      { anxietyQ1: 1, anxietyQ2: 1, fatigueMental: 8, fatiguePhysical: 6, progress: 1, selfEfficacy: 2, checkinTime: '2026-09-21T10:00:00.000Z', checkinDate: '2026-09-21' },
      { anxietyQ1: 1, anxietyQ2: 1, fatigueMental: 7, fatiguePhysical: 7, progress: 2, selfEfficacy: 1, checkinTime: '2026-09-20T10:00:00.000Z', checkinDate: '2026-09-20' },
      { anxietyQ1: 1, anxietyQ2: 1, fatigueMental: 6, fatiguePhysical: 6, progress: 1, selfEfficacy: 1, checkinTime: '2026-09-19T10:00:00.000Z', checkinDate: '2026-09-19' },
    ];
    const current = {
      anxietyQ1: 1,
      anxietyQ2: 1,
      fatigueMental: 7,
      fatiguePhysical: 7,
      progress: 1,
      selfEfficacy: 1,
      checkinTime: '2026-09-23T10:00:00.000Z',
      checkinDate: '2026-09-23',
    };

    // Alert kronis unreviewed 1 hari yang lalu
    const pastAlerts = [
      {
        alertType: 'chronic' as const,
        triggeredAt: '2026-09-22T10:00:00.000Z',
        reviewedAt: null,
      },
    ];

    const res = evaluateCheckinAlerts(current, past, pastAlerts);
    assert.strictEqual(res.isChronic, false, 'Seharusnya suppressed karena ada alert kronis aktif');
  });

  it('check-in ringkas memicu alert akut tanpa memicu alert kronis', () => {
    const res = evaluateQuickCheckinAlert(9, 2);
    assert.strictEqual(res.isAcute, true);
    assert.strictEqual(res.isChronic, false);
    assert.strictEqual(res.acuteDetails?.source, 'quick');
  });

  it('Skenario 7: 5 check-in dengan nilai memenuhi syarat kronis TAPI berselang-seling hari → tidak kronis', () => {
    // Tanggal: 23, 21, 19, 17, 15 Sep (loncat 2 hari setiap kali — bukan berturut-turut)
    const past = [
      { anxietyQ1: 1, anxietyQ2: 1, fatigueMental: 7, fatiguePhysical: 7, progress: 2, selfEfficacy: 1, checkinTime: '2026-09-21T10:00:00.000Z', checkinDate: '2026-09-21' },
      { anxietyQ1: 1, anxietyQ2: 1, fatigueMental: 8, fatiguePhysical: 6, progress: 1, selfEfficacy: 2, checkinTime: '2026-09-19T10:00:00.000Z', checkinDate: '2026-09-19' },
      { anxietyQ1: 1, anxietyQ2: 1, fatigueMental: 7, fatiguePhysical: 7, progress: 2, selfEfficacy: 1, checkinTime: '2026-09-17T10:00:00.000Z', checkinDate: '2026-09-17' },
      { anxietyQ1: 1, anxietyQ2: 1, fatigueMental: 6, fatiguePhysical: 6, progress: 1, selfEfficacy: 1, checkinTime: '2026-09-15T10:00:00.000Z', checkinDate: '2026-09-15' },
    ];
    const current = {
      anxietyQ1: 1,
      anxietyQ2: 1,
      fatigueMental: 7,
      fatiguePhysical: 7,
      progress: 1,
      selfEfficacy: 1,
      checkinTime: '2026-09-23T10:00:00.000Z',
      checkinDate: '2026-09-23',
    };

    const res = evaluateCheckinAlerts(current, past, []);
    assert.strictEqual(
      res.isChronic,
      false,
      '5 check-in yang berselang-seling seharusnya TIDAK memicu alert kronis (harus 5 hari berturut-turut)'
    );
  });

  it('Skenario 8: check-in dini hari WIB (01:00 WIB = 18:00 UTC kemarin) tetap terhitung hari WIB yang benar', () => {
    // Simulasi: Pengguna check-in pukul 01:00 WIB setiap malam.
    // UTC time tercatat 18:00 hari SEBELUMNYA.
    // Tapi checkinDate (WIB) tetap benar → harus trigger kronis.
    const past = [
      { anxietyQ1: 1, anxietyQ2: 1, fatigueMental: 7, fatiguePhysical: 7, progress: 2, selfEfficacy: 1, checkinTime: '2026-09-23T18:00:00.000Z', checkinDate: '2026-09-24' }, // 24 Sep WIB
      { anxietyQ1: 1, anxietyQ2: 1, fatigueMental: 8, fatiguePhysical: 6, progress: 1, selfEfficacy: 2, checkinTime: '2026-09-22T18:00:00.000Z', checkinDate: '2026-09-23' }, // 23 Sep WIB
      { anxietyQ1: 1, anxietyQ2: 1, fatigueMental: 7, fatiguePhysical: 7, progress: 2, selfEfficacy: 1, checkinTime: '2026-09-21T18:00:00.000Z', checkinDate: '2026-09-22' }, // 22 Sep WIB
      { anxietyQ1: 1, anxietyQ2: 1, fatigueMental: 6, fatiguePhysical: 6, progress: 1, selfEfficacy: 1, checkinTime: '2026-09-20T18:00:00.000Z', checkinDate: '2026-09-21' }, // 21 Sep WIB
    ];
    const current = {
      anxietyQ1: 1,
      anxietyQ2: 1,
      fatigueMental: 7,
      fatiguePhysical: 7, // avg 7
      progress: 1,
      selfEfficacy: 1,
      checkinTime: '2026-09-24T18:00:00.000Z', // 25 Sep 01:00 WIB
      checkinDate: '2026-09-25', // 25 Sep WIB
    };

    const res = evaluateCheckinAlerts(current, past, []);
    assert.strictEqual(res.isChronic, true, 'Seharusnya trigger alert kronis meskipun UTC menunjukkan hari berbeda');
  });
});
