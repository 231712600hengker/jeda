import { describe, it } from 'node:test';
import assert from 'node:assert';
import { signSessionToken, verifyToken } from '../auth/session';
import type { UserSession } from '@/types/jeda';

describe('Manajemen Sesi JWT (lib/auth/session)', () => {
  const dummySession: UserSession = {
    userId: '11111111-2222-3333-4444-555555555555',
    accessCode: 'TEST1234',
    consentAgreed: true,
    createdAt: '2026-09-23T10:00:00.000Z',
    lastCheckinAt: null,
  };

  it('Berhasil menandatangani (sign) dan memverifikasi token yang valid', async () => {
    const token = await signSessionToken(dummySession);
    assert.ok(typeof token === 'string', 'Token harus berupa string');
    assert.ok(token.split('.').length === 3, 'JWT harus memiliki 3 bagian (header.payload.signature)');

    const verified = await verifyToken(token);
    assert.ok(verified !== null, 'Token valid harus berhasil di-decode');
    assert.strictEqual(verified.userId, dummySession.userId);
    assert.strictEqual(verified.accessCode, dummySession.accessCode);
    assert.strictEqual(verified.consentAgreed, true);
  });

  it('Menolak token yang rusak atau dipalsukan', async () => {
    const token = await signSessionToken(dummySession);
    // Ubah satu karakter di signature
    const tamperedToken = token.slice(0, -4) + 'XXXX';

    const verified = await verifyToken(tamperedToken);
    assert.strictEqual(verified, null, 'Token yang dimanipulasi harus ditolak (null)');
  });

  it('Menolak token kosong atau string acak non-JWT', async () => {
    const invalid1 = await verifyToken('');
    const invalid2 = await verifyToken('random-invalid-string');

    assert.strictEqual(invalid1, null);
    assert.strictEqual(invalid2, null);
  });
});

