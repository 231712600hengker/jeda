import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CheckinSchema, LoginSchema, ConsentSchema } from '../validations';

describe('Validasi Skema Zod JEDA v2', () => {
  describe('LoginSchema', () => {
    it('Menerima access code yang valid', () => {
      const valid = LoginSchema.safeParse({ accessCode: 'ABC123XY' });
      assert.strictEqual(valid.success, true);
      if (valid.success) {
        assert.strictEqual(valid.data.accessCode, 'ABC123XY');
      }
    });

    it('Mengubah access code menjadi uppercase otomatis', () => {
      const valid = LoginSchema.safeParse({ accessCode: 'abc123xy' });
      assert.strictEqual(valid.success, true);
      if (valid.success) {
        assert.strictEqual(valid.data.accessCode, 'ABC123XY');
      }
    });

    it('Menolak string kosong', () => {
      const invalid = LoginSchema.safeParse({ accessCode: '   ' });
      assert.strictEqual(invalid.success, false);
    });
  });

  describe('ConsentSchema', () => {
    it('Lolos jika agreed bernilai true', () => {
      const valid = ConsentSchema.safeParse({ agreed: true });
      assert.strictEqual(valid.success, true);
    });

    it('Gagal jika agreed bernilai false', () => {
      const invalid = ConsentSchema.safeParse({ agreed: false });
      assert.strictEqual(invalid.success, false);
    });
  });

  describe('CheckinSchema', () => {
    const validPayload = {
      checkinType: 'full' as const,
      anxietyQ1: 1,
      anxietyQ2: 2,
      fatigueMental: 6,
      fatiguePhysical: 5,
      sleepQuantity: '6-7 jam',
      sleepQuality: 'cukup',
      progress: 3,
      selfEfficacy: 4,
      stressors: ['technical', 'time_management'],
      note: 'Hari ini mengerjakan bab 4 metodologi.',
    };

    it('Lolos pada payload check-in 9 item yang lengkap dan valid', () => {
      const result = CheckinSchema.safeParse(validPayload);
      assert.strictEqual(result.success, true);
    });

    it('Menolak nilai anxiety di luar batas 0-3', () => {
      const invalidUpper = CheckinSchema.safeParse({ ...validPayload, anxietyQ1: 4 });
      assert.strictEqual(invalidUpper.success, false);

      const invalidLower = CheckinSchema.safeParse({ ...validPayload, anxietyQ2: -1 });
      assert.strictEqual(invalidLower.success, false);
    });

    it('Menolak nilai fatigue di luar batas 1-10', () => {
      const invalidLower = CheckinSchema.safeParse({ ...validPayload, fatigueMental: 0 });
      assert.strictEqual(invalidLower.success, false);

      const invalidUpper = CheckinSchema.safeParse({ ...validPayload, fatiguePhysical: 11 });
      assert.strictEqual(invalidUpper.success, false);
    });

    it('Menolak kategori stressor yang tidak terdaftar', () => {
      const invalidStressor = CheckinSchema.safeParse({
        ...validPayload,
        stressors: ['invalid_stressor_category'],
      });
      assert.strictEqual(invalidStressor.success, false);
    });

    it('Menolak note yang melebihi 500 karakter', () => {
      const tooLongNote = 'a'.repeat(501);
      const invalidNote = CheckinSchema.safeParse({ ...validPayload, note: tooLongNote });
      assert.strictEqual(invalidNote.success, false);
    });

    it('menerima quick check-in hanya dengan stres dan energi', () => {
      const result = CheckinSchema.safeParse({ checkinType: 'quick', quickStress: 7, quickEnergy: 3 });
      assert.strictEqual(result.success, true);
    });
  });
});
