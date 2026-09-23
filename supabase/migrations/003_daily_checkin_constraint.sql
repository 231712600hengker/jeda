-- ============================================================
-- Migration 003: Daily Check-in Unique Constraint
-- Memastikan 1 entri check-in per user per tanggal (Daily Diary)
-- ============================================================

-- Jika terdapat duplikat tanggal sebelumnya, simpan yang paling baru
DELETE FROM checkins a USING checkins b
WHERE a.user_id = b.user_id
  AND a.checkin_date = b.checkin_date
  AND a.created_at < b.created_at;

-- Buat UNIQUE CONSTRAINT pada pasangan (user_id, checkin_date)
ALTER TABLE checkins 
DROP CONSTRAINT IF EXISTS unique_user_checkin_date;

ALTER TABLE checkins 
ADD CONSTRAINT unique_user_checkin_date UNIQUE (user_id, checkin_date);

