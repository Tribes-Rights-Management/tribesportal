-- Add user toggle preferences columns
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS notify_email_security_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notify_email_team_changes BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notify_email_workspace_invites BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notify_email_product_updates BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ui_compact_density BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ui_reduced_motion BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS security_reauth_for_sensitive BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS security_idle_timeout_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- Add check constraint for idle timeout minutes (already exists, just ensure valid values)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_preferences_idle_timeout_minutes_check'
  ) THEN
    ALTER TABLE public.user_preferences
      ADD CONSTRAINT user_preferences_idle_timeout_minutes_check
      CHECK (inactivity_timeout_minutes IN (15, 30, 60));
  END IF;
END $$;