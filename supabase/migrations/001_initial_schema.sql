-- ============================================================
-- Jeda v2.0 — Initial Schema
-- Referensi PRD section 6.2
-- Saragih & Situngkir (2022), GIAT: Teknologi untuk Masyarakat
-- ============================================================

-- ─── 1. USERS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_code      VARCHAR(20) UNIQUE NOT NULL,
  consent_agreed   BOOLEAN NOT NULL DEFAULT false,
  consent_agreed_at TIMESTAMP,
  created_at       TIMESTAMP DEFAULT now(),
  last_checkin_at  TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_access_code ON users(access_code);

-- ─── 2. CHECKINS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS checkins (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  checkin_date     DATE NOT NULL,
  checkin_time     TIMESTAMP NOT NULL,

  -- 9 Item EMA Data (sesuai PRD 5.3)
  anxiety_q1       INT NOT NULL CHECK (anxiety_q1 BETWEEN 0 AND 3),   -- GAD-2 adaptasi, 0-3
  anxiety_q2       INT NOT NULL CHECK (anxiety_q2 BETWEEN 0 AND 3),   -- GAD-2 adaptasi, 0-3
  fatigue_mental   INT NOT NULL CHECK (fatigue_mental BETWEEN 1 AND 10),  -- Chalder, 1-10
  fatigue_physical INT NOT NULL CHECK (fatigue_physical BETWEEN 1 AND 10), -- Chalder, 1-10
  sleep_quantity   VARCHAR(20),  -- '< 5 jam' | '5-6 jam' | '6-7 jam' | '7-8 jam' | '> 8 jam'
  sleep_quality    VARCHAR(20),  -- 'buruk' | 'cukup' | 'baik'
  progress         INT NOT NULL CHECK (progress BETWEEN 1 AND 5),     -- Likert 1-5
  self_efficacy    INT NOT NULL CHECK (self_efficacy BETWEEN 1 AND 5), -- Likert 1-5
  note             TEXT,  -- Catatan refleksi opsional (tidak dalam PRD, tapi berguna)

  created_at       TIMESTAMP DEFAULT now(),
  updated_at       TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON checkins(user_id, checkin_date DESC);
CREATE INDEX IF NOT EXISTS idx_checkins_created   ON checkins(created_at DESC);

-- ─── 3. CHECKIN_STRESSORS ─────────────────────────────────
-- Sumber stres multi-choice (item 9 dari instrumen)
CREATE TABLE IF NOT EXISTS checkin_stressors (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkin_id       UUID NOT NULL REFERENCES checkins(id) ON DELETE CASCADE,
  stressor_category VARCHAR(50) NOT NULL,
  -- Nilai valid: 'technical' | 'guidance_bureaucracy' | 'time_management' | 'infrastructure' | 'personal'
  created_at       TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stressors_checkin ON checkin_stressors(checkin_id);

-- ─── 4. ALERTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  alert_type   VARCHAR(20) NOT NULL CHECK (alert_type IN ('acute', 'chronic')),
  triggered_at TIMESTAMP NOT NULL,
  reviewed_at  TIMESTAMP,   -- NULL = belum ditinjau user
  alert_data   JSONB,       -- Trigger conditions (anxiety_score, fatigue_avg, dll)
  created_at   TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alerts_user_type ON alerts(user_id, alert_type, triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_unreviewed ON alerts(user_id, reviewed_at) WHERE reviewed_at IS NULL;

