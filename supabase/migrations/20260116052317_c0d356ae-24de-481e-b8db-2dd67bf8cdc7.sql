-- ═══════════════════════════════════════════════════════════════════════════
-- AUDIT TRAIL TABLE — WHO, WHAT, WHEN
-- 
-- Comprehensive tracking for all sensitive actions.
-- Audit logs are immutable — no updates or deletes allowed.
-- ═══════════════════════════════════════════════════════════════════════════

-- Create enum for audit action types
CREATE TYPE public.audit_action AS ENUM (
  'record_created',
  'record_updated',
  'record_approved',
  'record_rejected',
  'access_granted',
  'access_revoked',
  'export_generated',
  'document_uploaded',
  'document_removed',
  'login',
  'logout',
  'record_viewed'
);

-- Create the audit_logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Actor information
  actor_id UUID,  -- NULL for system actions
  actor_email TEXT,  -- Denormalized for historical accuracy
  actor_type TEXT NOT NULL DEFAULT 'user' CHECK (actor_type IN ('user', 'system')),
  
  -- Action details
  action audit_action NOT NULL,
  action_label TEXT NOT NULL,  -- Human-readable action description
  
  -- Affected record (optional)
  record_id UUID,
  record_type TEXT,  -- e.g., 'work', 'agreement', 'license'
  
  -- Tenant context
  tenant_id UUID REFERENCES public.tenants(id),
  
  -- Additional details (JSON for flexibility)
  details JSONB DEFAULT '{}',
  
  -- IP and user agent (for access logging)
  ip_address INET,
  user_agent TEXT,
  
  -- Immutable timestamp
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_record_id ON public.audit_logs(record_id);
CREATE INDEX idx_audit_logs_tenant_id ON public.audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_record_type ON public.audit_logs(record_type);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only platform admins can view audit logs
-- Audit logs are write-only for the system, read-only for admins
CREATE POLICY "Platform admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (is_platform_admin(auth.uid()));

-- Tenant admins can view their tenant's audit logs
CREATE POLICY "Tenant admins can view tenant audit logs"
ON public.audit_logs
FOR SELECT
USING (is_tenant_admin(auth.uid(), tenant_id));

-- System can insert audit logs (via service role)
-- Note: Inserts will happen via edge functions using service role key
CREATE POLICY "Service role can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);

-- NO UPDATE OR DELETE POLICIES — audit logs are immutable

-- ═══════════════════════════════════════════════════════════════════════════
-- ACCESS LOGS TABLE — SILENT BUT COMPLETE
-- 
-- Track access to sensitive records without surfacing noise in the UI.
-- For governance, not UX feedback.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE public.access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Who accessed
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  
  -- What was accessed
  record_id UUID NOT NULL,
  record_type TEXT NOT NULL,
  access_type TEXT NOT NULL CHECK (access_type IN ('view', 'download', 'export')),
  
  -- Context
  tenant_id UUID REFERENCES public.tenants(id),
  
  -- Timestamp
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_access_logs_user_id ON public.access_logs(user_id);
CREATE INDEX idx_access_logs_record_id ON public.access_logs(record_id);
CREATE INDEX idx_access_logs_tenant_id ON public.access_logs(tenant_id);
CREATE INDEX idx_access_logs_accessed_at ON public.access_logs(accessed_at DESC);

-- Enable RLS
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Only platform admins can view access logs
CREATE POLICY "Platform admins can view access logs"
ON public.access_logs
FOR SELECT
USING (is_platform_admin(auth.uid()));

-- Tenant admins can view their tenant's access logs
CREATE POLICY "Tenant admins can view tenant access logs"
ON public.access_logs
FOR SELECT
USING (is_tenant_admin(auth.uid(), tenant_id));

-- System can insert (via service role)
CREATE POLICY "Service role can insert access logs"
ON public.access_logs
FOR INSERT
WITH CHECK (true);

-- NO UPDATE OR DELETE — access logs are immutable

-- ═══════════════════════════════════════════════════════════════════════════
-- HELPER FUNCTION: Log audit event
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.log_audit_event(
  _action audit_action,
  _action_label TEXT,
  _record_id UUID DEFAULT NULL,
  _record_type TEXT DEFAULT NULL,
  _tenant_id UUID DEFAULT NULL,
  _details JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _actor_id UUID;
  _actor_email TEXT;
  _log_id UUID;
BEGIN
  -- Get current user info
  _actor_id := auth.uid();
  
  SELECT email INTO _actor_email
  FROM public.user_profiles
  WHERE user_id = _actor_id;
  
  -- Insert audit log
  INSERT INTO public.audit_logs (
    actor_id,
    actor_email,
    actor_type,
    action,
    action_label,
    record_id,
    record_type,
    tenant_id,
    details
  ) VALUES (
    _actor_id,
    _actor_email,
    CASE WHEN _actor_id IS NULL THEN 'system' ELSE 'user' END,
    _action,
    _action_label,
    _record_id,
    _record_type,
    _tenant_id,
    _details
  )
  RETURNING id INTO _log_id;
  
  RETURN _log_id;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- HELPER FUNCTION: Log access event
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.log_access_event(
  _record_id UUID,
  _record_type TEXT,
  _access_type TEXT,
  _tenant_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _user_email TEXT;
  _log_id UUID;
BEGIN
  _user_id := auth.uid();
  
  SELECT email INTO _user_email
  FROM public.user_profiles
  WHERE user_id = _user_id;
  
  INSERT INTO public.access_logs (
    user_id,
    user_email,
    record_id,
    record_type,
    access_type,
    tenant_id
  ) VALUES (
    _user_id,
    COALESCE(_user_email, 'unknown'),
    _record_id,
    _record_type,
    _access_type,
    _tenant_id
  )
  RETURNING id INTO _log_id;
  
  RETURN _log_id;
END;
$$;