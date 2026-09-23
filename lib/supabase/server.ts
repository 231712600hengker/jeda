// ============================================================
// Supabase Server Client
// Menggunakan service_role_key — HANYA untuk API routes (server-side)
// JANGAN import file ini di komponen client ('use client')
// ============================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

/**
 * Supabase client dengan service_role key.
 * Bypass RLS — semua validasi user dilakukan di API route middleware.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

