-- ═══════════════════════════════════════════════════════════════════════════
-- NOTIFICATION RETENTION & RESOLUTION SEMANTICS
-- 
-- RULES:
-- 1. Notifications are governed records with strict retention
-- 2. Acknowledgment (read_at) ≠ Resolution (resolved_at)
-- 3. Resolution is outcome-driven, not user-driven
-- 4. Critical notifications are never deleted
-- 5. Archived notifications remain queryable for audit
-- ═══════════════════════════════════════════════════════════════════════════

-- Add resolution and retention columns to notifications
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS resolved_by UUID DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS resolution_type TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS requires_resolution BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS retention_category TEXT NOT NULL DEFAULT 'standard';

-- Add comment explaining retention semantics
COMMENT ON COLUMN public.notifications.acknowledged_at IS 'When user acknowledged (saw) the notification - does NOT stop escalations';
COMMENT ON COLUMN public.notifications.resolved_at IS 'When the underlying event was resolved - outcome-driven, not user-driven';
COMMENT ON COLUMN public.notifications.resolved_by IS 'User who resolved the underlying event (may differ from recipient)';
COMMENT ON COLUMN public.notifications.resolution_type IS 'How resolved: approved, rejected, completed, cancelled, expired';
COMMENT ON COLUMN public.notifications.requires_resolution IS 'If true, notification remains active until underlying action completes';
COMMENT ON COLUMN public.notifications.archived_at IS 'When notification was archived (90 days after resolution)';
COMMENT ON COLUMN public.notifications.retention_category IS 'standard, critical_authority, critical_financial, critical_security - critical never deleted';

-- Create enum for resolution types
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_resolution_type') THEN
    CREATE TYPE public.notification_resolution_type AS ENUM (
      'approved',
      'rejected', 
      'completed',
      'cancelled',
      'expired'
    );
  END IF;
END $$;

-- Create notification_archive table for long-term retention
CREATE TABLE IF NOT EXISTS public.notification_archive (
  id UUID PRIMARY KEY,
  recipient_id UUID NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id),
  notification_type public.notification_type NOT NULL,
  priority public.notification_priority NOT NULL DEFAULT 'normal',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  record_type TEXT,
  record_id TEXT,
  correlation_id TEXT,
  read_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  resolution_type TEXT,
  requires_resolution BOOLEAN NOT NULL DEFAULT false,
  retention_category TEXT NOT NULL DEFAULT 'standard',
  created_at TIMESTAMPTZ NOT NULL,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on archive
ALTER TABLE public.notification_archive ENABLE ROW LEVEL SECURITY;

-- Archive is read-only for all users
CREATE POLICY "Users can view their own archived notifications"
  ON public.notification_archive
  FOR SELECT
  USING (auth.uid() = recipient_id);

CREATE POLICY "Platform admins can view all archived notifications"
  ON public.notification_archive
  FOR SELECT
  USING (public.is_platform_admin(auth.uid()));

-- Prevent any modifications to archive (immutable)
CREATE POLICY "No updates to archived notifications"
  ON public.notification_archive
  FOR UPDATE
  USING (false);

CREATE POLICY "No deletes from notification archive"
  ON public.notification_archive
  FOR DELETE
  USING (false);

-- Function to resolve a notification (outcome-driven)
CREATE OR REPLACE FUNCTION public.resolve_notification(
  _notification_id UUID,
  _resolution_type TEXT,
  _resolved_by UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _notification RECORD;
BEGIN
  -- Get the notification
  SELECT * INTO _notification FROM public.notifications WHERE id = _notification_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Already resolved
  IF _notification.resolved_at IS NOT NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update the notification
  UPDATE public.notifications
  SET 
    resolved_at = now(),
    resolved_by = _resolved_by,
    resolution_type = _resolution_type
  WHERE id = _notification_id;
  
  -- Log audit event
  PERFORM public.log_audit_event(
    'record_updated',
    'Notification resolved',
    jsonb_build_object(
      'notification_id', _notification_id,
      'resolution_type', _resolution_type
    ),
    _notification_id::TEXT,
    'notification',
    _notification.tenant_id
  );
  
  RETURN TRUE;
END;
$$;

-- Function to archive old resolved notifications
CREATE OR REPLACE FUNCTION public.archive_old_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _archived_count INTEGER;
BEGIN
  -- Move resolved notifications older than 90 days to archive
  WITH archived AS (
    INSERT INTO public.notification_archive (
      id, recipient_id, tenant_id, notification_type, priority,
      title, message, metadata, record_type, record_id, correlation_id,
      read_at, acknowledged_at, resolved_at, resolved_by, resolution_type,
      requires_resolution, retention_category, created_at, archived_at
    )
    SELECT 
      id, recipient_id, tenant_id, notification_type, priority,
      title, message, metadata, record_type, record_id, correlation_id,
      read_at, acknowledged_at, resolved_at, resolved_by, resolution_type,
      requires_resolution, retention_category, created_at, now()
    FROM public.notifications
    WHERE resolved_at IS NOT NULL
      AND resolved_at < now() - INTERVAL '90 days'
      AND archived_at IS NULL
    RETURNING id
  )
  SELECT COUNT(*) INTO _archived_count FROM archived;
  
  -- Mark as archived in main table
  UPDATE public.notifications
  SET archived_at = now()
  WHERE resolved_at IS NOT NULL
    AND resolved_at < now() - INTERVAL '90 days'
    AND archived_at IS NULL;
  
  RETURN _archived_count;
END;
$$;

-- Update create_notification to set requires_resolution based on type
CREATE OR REPLACE FUNCTION public.create_notification(
  _recipient_id UUID,
  _title TEXT,
  _message TEXT,
  _notification_type public.notification_type,
  _priority public.notification_priority DEFAULT 'normal',
  _tenant_id UUID DEFAULT NULL,
  _record_type TEXT DEFAULT NULL,
  _record_id TEXT DEFAULT NULL,
  _correlation_id TEXT DEFAULT NULL,
  _metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _notification_id UUID;
  _requires_resolution BOOLEAN;
  _retention_category TEXT;
BEGIN
  -- Determine if notification requires resolution based on type
  _requires_resolution := CASE _notification_type
    WHEN 'authority_change_proposal' THEN true
    WHEN 'licensing_request' THEN true
    WHEN 'payment_failure' THEN true
    WHEN 'approval_timeout' THEN true
    WHEN 'refund_initiated' THEN true
    ELSE false
  END;
  
  -- Determine retention category
  _retention_category := CASE _notification_type
    WHEN 'authority_change_proposal' THEN 'critical_authority'
    WHEN 'membership_change' THEN 'critical_authority'
    WHEN 'payment_failure' THEN 'critical_financial'
    WHEN 'refund_initiated' THEN 'critical_financial'
    WHEN 'security_event' THEN 'critical_security'
    ELSE 'standard'
  END;
  
  INSERT INTO public.notifications (
    recipient_id, title, message, notification_type, priority,
    tenant_id, record_type, record_id, correlation_id, metadata,
    requires_resolution, retention_category
  ) VALUES (
    _recipient_id, _title, _message, _notification_type, _priority,
    _tenant_id, _record_type, _record_id, _correlation_id, _metadata,
    _requires_resolution, _retention_category
  )
  RETURNING id INTO _notification_id;
  
  RETURN _notification_id;
END;
$$;

-- Index for efficient archival queries
CREATE INDEX IF NOT EXISTS idx_notifications_archive_candidates 
  ON public.notifications (resolved_at, archived_at) 
  WHERE resolved_at IS NOT NULL AND archived_at IS NULL;

-- Index for retention category queries
CREATE INDEX IF NOT EXISTS idx_notifications_retention 
  ON public.notifications (retention_category, created_at);