// ============================================================
// Supabase Server Client
// Menggunakan service_role_key — HANYA untuk API routes (server-side)
// JANGAN import file ini di komponen client ('use client')
// ============================================================

import { createClient } from '@supabase/supabase-js';

export function getSupabaseServerConfig() {
  const isProduction = process.env.NODE_ENV === 'production';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    (!isProduction ? 'https://placeholder.supabase.co' : undefined);
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    (!isProduction ? 'placeholder-service-key' : undefined);

  const missing = [
    !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
    !supabaseServiceKey ? 'SUPABASE_SERVICE_ROLE_KEY' : null,
  ].filter(Boolean) as string[];

  if (missing.length > 0) {
    if (isProduction) {
      throw new Error(
        `Missing required environment variables for Supabase: ${missing.join(', ')}. ` +
          'Set them in your deployment environment (Vercel, Netlify, etc.) and restart the app.'
      );
    }

    console.warn(
      'Missing Supabase env vars in non-production mode; using placeholder values only for local/test runs.'
    );
  }

  return { supabaseUrl: supabaseUrl!, supabaseServiceKey: supabaseServiceKey! };
}

export function getSupabaseAdminClient() {
  const { supabaseUrl, supabaseServiceKey } = getSupabaseServerConfig();

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Supabase client dengan service_role key.
 * Bypass RLS — semua validasi user dilakukan di API route middleware.
 * Validasi konfigurasi dilakukan saat client digunakan, agar aplikasi dapat
 * memberi error yang jelas di production tanpa menggantikan env dengan placeholder.
 */
export const supabaseAdmin = new Proxy({} as ReturnType<typeof getSupabaseAdminClient>, {
  get(_target, prop, receiver) {
    const client = getSupabaseAdminClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

