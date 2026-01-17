-- ═══════════════════════════════════════════════════════════════════════════
-- OPERATIONAL SAFETY & CONTINUITY LAYER
-- Phase 1: Notifications & Escalation
-- Phase 2: Read-Only API Access
-- Phase 3: Disaster Recovery Posture
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- ENUMS
-- ═══════════════════════════════════════════════════════════════════════════

-- Notification types
CREATE TYPE public.notification_type AS ENUM (
  'authority_change_proposal',
  'licensing_request',
  'payment_failure',
  'refund_initiated',
  'approval_timeout',
  'security_event',
  'export_completed',
  'membership_change'
);

-- Notification priority
CREATE TYPE public.notification_priority AS ENUM (
  'low',
  'normal',
  'high',
  'critical'
);

-- Escalation status
CREATE TYPE public.escalation_status AS ENUM (
  'pending',
  'escalated',
  'resolved',
  'expired'
);

-- API token scope
CREATE TYPE public.api_token_scope AS ENUM (
  'platform_read',
  'organization_read'
);

-- API token status
CREATE TYPE public.api_token_status AS ENUM (
  'active',
  'revoked',
  'expired'
);

-- Recovery event type
CREATE TYPE public.recovery_event_type AS ENUM (
  'backup_created',
  'backup_verified',
  'restore_initiated',
  'restore_completed',
  'restore_failed',
  'integrity_check'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 1: NOTIFICATIONS & ESCALATION
-- ═══════════════════════════════════════════════════════════════════════════

-- Notifications table (append-only)
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id),
  notification_type public.notification_type NOT NULL,
  priority public.notification_priority NOT NULL DEFAULT 'normal',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  record_type TEXT,
  record_id UUID,
  correlation_id TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Escalation rules (configured by Platform Executives)
CREATE TABLE public.escalation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type public.notification_type NOT NULL,
  priority public.notification_priority NOT NULL,
  sla_minutes INTEGER NOT NULL DEFAULT 60,
  escalation_target_role public.platform_role NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(notification_type, priority, tenant_id)
);

-- Escalation events (tracks when escalation occurs)
CREATE TABLE public.escalation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES public.notifications(id),
  escalation_rule_id UUID NOT NULL REFERENCES public.escalation_rules(id),
  original_recipient_id UUID NOT NULL,
  escalated_to_role public.platform_role NOT NULL,
  escalated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  status public.escalation_status NOT NULL DEFAULT 'escalated',
  notes TEXT
);

-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 2: READ-ONLY API ACCESS
-- ═══════════════════════════════════════════════════════════════════════════

-- API tokens table
CREATE TABLE public.api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  token_hash TEXT NOT NULL UNIQUE,
  scope public.api_token_scope NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id),
  granted_by UUID NOT NULL,
  granted_to_email TEXT NOT NULL,
  status public.api_token_status NOT NULL DEFAULT 'active',
  expires_at TIMESTAMPTZ NOT NULL,
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- API access logs (immutable audit trail)
CREATE TABLE public.api_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID NOT NULL REFERENCES public.api_tokens(id),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  scope_type TEXT NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id),
  response_status INTEGER NOT NULL,
  response_time_ms INTEGER,
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 3: DISASTER RECOVERY POSTURE
-- ═══════════════════════════════════════════════════════════════════════════

-- Recovery events (immutable log of all DR activities)
CREATE TABLE public.recovery_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type public.recovery_event_type NOT NULL,
  initiated_by UUID NOT NULL,
  target_tables TEXT[] NOT NULL,
  backup_id TEXT,
  restore_point TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'initiated',
  details JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

-- Backup manifests (tracks what was backed up)
CREATE TABLE public.backup_manifests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id TEXT NOT NULL UNIQUE,
  backup_type TEXT NOT NULL,
  tables_included TEXT[] NOT NULL,
  record_counts JSONB NOT NULL,
  file_hash TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ,
  verified_by UUID
);

-- ═══════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX idx_notifications_tenant ON public.notifications(tenant_id);
CREATE INDEX idx_notifications_type ON public.notifications(notification_type);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications(recipient_id) WHERE read_at IS NULL;

CREATE INDEX idx_escalation_events_notification ON public.escalation_events(notification_id);
CREATE INDEX idx_escalation_events_status ON public.escalation_events(status);

CREATE INDEX idx_api_tokens_status ON public.api_tokens(status);
CREATE INDEX idx_api_tokens_tenant ON public.api_tokens(tenant_id);
CREATE INDEX idx_api_access_logs_token ON public.api_access_logs(token_id);
CREATE INDEX idx_api_access_logs_accessed ON public.api_access_logs(accessed_at DESC);

CREATE INDEX idx_recovery_events_type ON public.recovery_events(event_type);
CREATE INDEX idx_recovery_events_started ON public.recovery_events(started_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

-- Escalation rules updated_at trigger
CREATE TRIGGER update_escalation_rules_updated_at
  BEFORE UPDATE ON public.escalation_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Prevent notification deletion (append-only)
CREATE OR REPLACE FUNCTION public.prevent_notification_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Notifications are append-only and cannot be deleted';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER prevent_notification_delete_trigger
  BEFORE DELETE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_notification_delete();

-- Prevent recovery events modification (immutable)
CREATE OR REPLACE FUNCTION public.prevent_recovery_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Recovery events are immutable and cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER prevent_recovery_update_trigger
  BEFORE UPDATE ON public.recovery_events
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_recovery_modification();

CREATE TRIGGER prevent_recovery_delete_trigger
  BEFORE DELETE ON public.recovery_events
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_recovery_modification();

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_manifests ENABLE ROW LEVEL SECURITY;

-- NOTIFICATIONS: Users see their own notifications
CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT
  USING (recipient_id = auth.uid());

-- Platform admins see all notifications
CREATE POLICY "Platform admins view all notifications"
  ON public.notifications FOR SELECT
  USING (is_platform_admin(auth.uid()));

-- System can insert notifications
CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Users can mark their notifications as read
CREATE POLICY "Users can mark notifications read"
  ON public.notifications FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- ESCALATION RULES: Platform admins only
CREATE POLICY "Platform admins manage escalation rules"
  ON public.escalation_rules FOR ALL
  USING (is_platform_admin(auth.uid()));

-- ESCALATION EVENTS: Platform admins view all
CREATE POLICY "Platform admins view escalation events"
  ON public.escalation_events FOR SELECT
  USING (is_platform_admin(auth.uid()));

-- API TOKENS: Platform admins manage all, org admins manage org tokens
CREATE POLICY "Platform admins manage all API tokens"
  ON public.api_tokens FOR ALL
  USING (is_platform_admin(auth.uid()));

CREATE POLICY "Org admins view org API tokens"
  ON public.api_tokens FOR SELECT
  USING (tenant_id IS NOT NULL AND is_tenant_admin(auth.uid(), tenant_id));

-- API ACCESS LOGS: Platform admins and auditors only
CREATE POLICY "Platform admins view API logs"
  ON public.api_access_logs FOR SELECT
  USING (is_platform_admin(auth.uid()) OR is_external_auditor(auth.uid()));

-- RECOVERY EVENTS: Platform admins only
CREATE POLICY "Platform admins manage recovery events"
  ON public.recovery_events FOR ALL
  USING (is_platform_admin(auth.uid()));

-- BACKUP MANIFESTS: Platform admins and auditors
CREATE POLICY "Platform admins manage backup manifests"
  ON public.backup_manifests FOR ALL
  USING (is_platform_admin(auth.uid()));

CREATE POLICY "Auditors view backup manifests"
  ON public.backup_manifests FOR SELECT
  USING (is_external_auditor(auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- Create notification with audit logging
CREATE OR REPLACE FUNCTION public.create_notification(
  _recipient_id UUID,
  _notification_type notification_type,
  _title TEXT,
  _message TEXT,
  _priority notification_priority DEFAULT 'normal',
  _tenant_id UUID DEFAULT NULL,
  _record_type TEXT DEFAULT NULL,
  _record_id UUID DEFAULT NULL,
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
BEGIN
  INSERT INTO public.notifications (
    recipient_id, notification_type, title, message, priority,
    tenant_id, record_type, record_id, correlation_id, metadata
  ) VALUES (
    _recipient_id, _notification_type, _title, _message, _priority,
    _tenant_id, _record_type, _record_id, _correlation_id, _metadata
  )
  RETURNING id INTO _notification_id;

  -- Log the notification creation
  PERFORM log_audit_event(
    'record_created'::audit_action,
    'Notification created: ' || _title,
    _notification_id,
    'notification',
    _tenant_id,
    jsonb_build_object(
      'notification_type', _notification_type,
      'priority', _priority,
      'recipient_id', _recipient_id
    )
  );

  RETURN _notification_id;
END;
$$;

-- Check for pending escalations
CREATE OR REPLACE FUNCTION public.check_escalations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _escalated_count INTEGER := 0;
  _notification RECORD;
  _rule RECORD;
BEGIN
  -- Find unread notifications past their SLA
  FOR _notification IN
    SELECT n.*, er.id as rule_id, er.escalation_target_role
    FROM public.notifications n
    JOIN public.escalation_rules er 
      ON er.notification_type = n.notification_type
      AND er.priority = n.priority
      AND er.is_active = true
      AND (er.tenant_id IS NULL OR er.tenant_id = n.tenant_id)
    WHERE n.read_at IS NULL
      AND n.created_at < now() - (er.sla_minutes || ' minutes')::INTERVAL
      AND NOT EXISTS (
        SELECT 1 FROM public.escalation_events ee
        WHERE ee.notification_id = n.id
      )
  LOOP
    -- Create escalation event
    INSERT INTO public.escalation_events (
      notification_id, escalation_rule_id, original_recipient_id, escalated_to_role
    ) VALUES (
      _notification.id, _notification.rule_id, _notification.recipient_id, _notification.escalation_target_role
    );
    
    _escalated_count := _escalated_count + 1;
  END LOOP;

  RETURN _escalated_count;
END;
$$;

-- Validate API token and log access
CREATE OR REPLACE FUNCTION public.validate_api_token(
  _token_hash TEXT,
  _endpoint TEXT,
  _method TEXT
)
RETURNS TABLE(
  is_valid BOOLEAN,
  token_id UUID,
  scope api_token_scope,
  tenant_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _token RECORD;
BEGIN
  SELECT * INTO _token
  FROM public.api_tokens t
  WHERE t.token_hash = _token_hash
    AND t.status = 'active'
    AND t.expires_at > now();

  IF _token.id IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::api_token_scope, NULL::UUID;
    RETURN;
  END IF;

  -- Update last used
  UPDATE public.api_tokens SET last_used_at = now() WHERE id = _token.id;

  RETURN QUERY SELECT true, _token.id, _token.scope, _token.tenant_id;
END;
$$;