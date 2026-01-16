-- Add correlation_id to licensing_requests
ALTER TABLE public.licensing_requests 
ADD COLUMN correlation_id TEXT;

-- Add correlation_id to licensing_agreements
ALTER TABLE public.licensing_agreements 
ADD COLUMN correlation_id TEXT;

-- Add correlation_id to audit_logs
ALTER TABLE public.audit_logs 
ADD COLUMN correlation_id TEXT;

-- Add correlation_id to access_logs
ALTER TABLE public.access_logs 
ADD COLUMN correlation_id TEXT;

-- Create indexes for correlation lookups
CREATE INDEX idx_licensing_requests_correlation ON public.licensing_requests(correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX idx_licensing_agreements_correlation ON public.licensing_agreements(correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX idx_audit_logs_correlation ON public.audit_logs(correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX idx_access_logs_correlation ON public.access_logs(correlation_id) WHERE correlation_id IS NOT NULL;

-- Create helper function to generate correlation IDs
CREATE OR REPLACE FUNCTION public.generate_correlation_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _timestamp TEXT;
  _random TEXT;
BEGIN
  -- Format: CORR-YYYYMMDD-HHMMSS-XXXXXXXX
  _timestamp := to_char(now() AT TIME ZONE 'UTC', 'YYYYMMDD-HH24MISS');
  _random := upper(substr(md5(random()::text), 1, 8));
  RETURN 'CORR-' || _timestamp || '-' || _random;
END;
$$;

-- Create function to link records with same correlation
CREATE OR REPLACE FUNCTION public.get_correlation_chain(_correlation_id TEXT)
RETURNS TABLE (
  event_type TEXT,
  event_id UUID,
  event_timestamp TIMESTAMPTZ,
  actor TEXT,
  action TEXT,
  record_type TEXT,
  record_id UUID,
  tenant_id UUID,
  details JSONB
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only platform admins and external auditors can view correlation chains
  IF NOT (is_platform_admin(auth.uid()) OR is_external_auditor(auth.uid())) THEN
    RETURN;
  END IF;

  RETURN QUERY
  -- Licensing requests
  SELECT 
    'licensing_request'::TEXT as event_type,
    lr.id as event_id,
    lr.created_at as event_timestamp,
    COALESCE(lr.requester_email, 'System') as actor,
    'Submitted'::TEXT as action,
    'licensing_request'::TEXT as record_type,
    lr.id as record_id,
    lr.tenant_id,
    jsonb_build_object(
      'work_title', lr.work_title,
      'status', lr.status,
      'usage_type', lr.usage_type
    ) as details
  FROM public.licensing_requests lr
  WHERE lr.correlation_id = _correlation_id
  
  UNION ALL
  
  -- Licensing agreements
  SELECT 
    'licensing_agreement'::TEXT as event_type,
    la.id as event_id,
    la.created_at as event_timestamp,
    'System'::TEXT as actor,
    'Executed'::TEXT as action,
    'licensing_agreement'::TEXT as record_type,
    la.id as record_id,
    la.tenant_id,
    jsonb_build_object(
      'agreement_title', la.agreement_title,
      'status', la.status,
      'effective_date', la.effective_date
    ) as details
  FROM public.licensing_agreements la
  WHERE la.correlation_id = _correlation_id
  
  UNION ALL
  
  -- Audit log entries
  SELECT 
    'audit_event'::TEXT as event_type,
    al.id as event_id,
    al.created_at as event_timestamp,
    COALESCE(al.actor_email, al.actor_type) as actor,
    al.action_label as action,
    COALESCE(al.record_type, 'system') as record_type,
    al.record_id,
    al.tenant_id,
    al.details
  FROM public.audit_logs al
  WHERE al.correlation_id = _correlation_id
  
  ORDER BY event_timestamp ASC;
END;
$$;

-- Add comments
COMMENT ON COLUMN public.licensing_requests.correlation_id IS 'Links related records across the platform for audit trail purposes';
COMMENT ON COLUMN public.licensing_agreements.correlation_id IS 'Links related records across the platform for audit trail purposes';
COMMENT ON COLUMN public.audit_logs.correlation_id IS 'Links related records across the platform for audit trail purposes';
COMMENT ON FUNCTION public.generate_correlation_id IS 'Generates a unique correlation ID for linking related platform events';
COMMENT ON FUNCTION public.get_correlation_chain IS 'Returns all events linked by a correlation ID in chronological order';