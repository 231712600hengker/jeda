-- ============================================================
-- Jeda v2.0 — Row-Level Security Policies
-- Referensi PRD section 6.4
-- ============================================================
-- ARSITEKTUR KEAMANAN:
-- - API routes menggunakan SUPABASE_SERVICE_ROLE_KEY → bypass RLS
--   (aman karena validasi user_id dilakukan di auth middleware API)
-- - anon key tidak boleh digunakan langsung dari client untuk mutasi
-- - Policy di bawah sebagai lapisan tambahan jika ada direct DB access
-- ============================================================

-- Enable RLS pada semua tabel
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_stressors ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- ─── USERS ────────────────────────────────────────────────
-- Tidak ada akses baca/tulis via anon key untuk tabel users
-- Semua operasi users dilakukan server-side via service_role

-- ─── CHECKINS ─────────────────────────────────────────────
-- Tidak ada akses langsung via anon key
-- Semua operasi checkins dilakukan server-side via service_role

-- ─── CHECKIN_STRESSORS ────────────────────────────────────
-- Tidak ada akses langsung via anon key

-- ─── ALERTS ───────────────────────────────────────────────
-- Tidak ada akses langsung via anon key

-- Catatan: Jika di masa depan ingin implementasi Realtime Subscriptions
-- (agar dashboard update otomatis), tambahkan policy SELECT:
--
-- CREATE POLICY "Service role bypass"
--   ON checkins
--   USING (true)
--   WITH CHECK (true);
-- 
-- Dan batasi via app.current_user_id yang di-set dari server.

