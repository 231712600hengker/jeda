-- ============================================================
-- Jeda v2.0 — Migrasi 005: Penanda Akun Uji (is_test)
--
-- Tujuan:
--   Memisahkan akun riset nyata dari akun demo/uji peneliti.
--   Tanpa penanda ini, data uji yang dibuat sebelum/sesudah
--   pengumpulan data riset dapat tercampur dalam analisis.
--
-- Cara penggunaan:
--   - Saat membuat akun untuk pengujian sistem, set is_test = true.
--   - Akun peserta riset nyata akan tetap is_test = false (default).
--   - Saat ekspor data untuk analisis, tambahkan WHERE is_test = false.
--
-- Jalankan query ini di SQL Editor Supabase Dashboard.
-- ============================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;

-- Index agar filter is_test pada query analitik lebih cepat
CREATE INDEX IF NOT EXISTS idx_users_is_test ON users(is_test) WHERE is_test = true;

-- Tandai semua akun yang dibuat SEBELUM tanggal mulai pengumpulan data resmi
-- sebagai akun uji. Ganti '2026-10-01' dengan tanggal sebenarnya.
-- CATATAN: Jalankan baris ini HANYA setelah memastikan tanggalnya benar.
-- UPDATE users SET is_test = true WHERE created_at < '2026-10-01 00:00:00+07';
