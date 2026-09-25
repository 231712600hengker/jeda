-- Quick check-ins intentionally store only the two answers provided.
-- This prevents unasked fields from being filled with misleading defaults.
ALTER TABLE checkins
  ADD COLUMN IF NOT EXISTS checkin_type VARCHAR(10) NOT NULL DEFAULT 'full'
    CHECK (checkin_type IN ('full', 'quick')),
  ADD COLUMN IF NOT EXISTS quick_stress INT CHECK (quick_stress BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS quick_energy INT CHECK (quick_energy BETWEEN 1 AND 10);

ALTER TABLE checkins
  ALTER COLUMN anxiety_q1 DROP NOT NULL,
  ALTER COLUMN anxiety_q2 DROP NOT NULL,
  ALTER COLUMN fatigue_mental DROP NOT NULL,
  ALTER COLUMN fatigue_physical DROP NOT NULL,
  ALTER COLUMN progress DROP NOT NULL,
  ALTER COLUMN self_efficacy DROP NOT NULL;

ALTER TABLE checkins
  ADD CONSTRAINT checkins_payload_matches_type CHECK (
    (checkin_type = 'full' AND anxiety_q1 IS NOT NULL AND anxiety_q2 IS NOT NULL
      AND fatigue_mental IS NOT NULL AND fatigue_physical IS NOT NULL
      AND progress IS NOT NULL AND self_efficacy IS NOT NULL
      AND quick_stress IS NULL AND quick_energy IS NULL)
    OR
    (checkin_type = 'quick' AND quick_stress IS NOT NULL AND quick_energy IS NOT NULL
      AND anxiety_q1 IS NULL AND anxiety_q2 IS NULL AND fatigue_mental IS NULL
      AND fatigue_physical IS NULL AND progress IS NULL AND self_efficacy IS NULL)
  );
