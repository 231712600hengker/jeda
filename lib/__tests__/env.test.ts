import { describe, it, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import { getSupabaseServerConfig } from '../supabase/server';

describe('Konfigurasi server untuk produksi', () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = 'production';
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it('menolak konfigurasi Supabase yang belum diisi', () => {
    assert.throws(
      () => getSupabaseServerConfig(),
      /NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY/
    );
  });

  after(() => {
    if (originalUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    else delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (originalServiceKey) process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceKey;
    else delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (originalNodeEnv) process.env.NODE_ENV = originalNodeEnv;
    else delete process.env.NODE_ENV;
  });
});
