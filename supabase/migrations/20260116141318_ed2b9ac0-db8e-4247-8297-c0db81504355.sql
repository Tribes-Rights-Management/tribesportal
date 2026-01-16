-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 8 (Part 2): External Auditor helper function and RLS policies
-- Purpose: Allow third parties to inspect records without influencing the system
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Create helper function to check if user is external auditor
CREATE OR REPLACE FUNCTION public.is_external_auditor(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = _user_id
      AND platform_role = 'external_auditor'
      AND status = 'active'
  )
$$;

-- 2. Grant audit_logs SELECT access to external auditors
-- (They can view immutable activity logs)
CREATE POLICY "External auditors can view audit logs"
ON public.audit_logs
FOR SELECT
USING (is_external_auditor(auth.uid()));

-- 3. Grant licensing_requests SELECT access to external auditors
CREATE POLICY "External auditors can view licensing requests"
ON public.licensing_requests
FOR SELECT
USING (is_external_auditor(auth.uid()));

-- 4. Grant licensing_agreements SELECT access to external auditors
CREATE POLICY "External auditors can view licensing agreements"
ON public.licensing_agreements
FOR SELECT
USING (is_external_auditor(auth.uid()));

-- 5. Grant access_logs SELECT access to external auditors
CREATE POLICY "External auditors can view access logs"
ON public.access_logs
FOR SELECT
USING (is_external_auditor(auth.uid()));

-- 6. Grant tenants SELECT access to external auditors (for context)
CREATE POLICY "External auditors can view tenants"
ON public.tenants
FOR SELECT
USING (is_external_auditor(auth.uid()));

-- 7. Grant user_profiles SELECT access to external auditors (limited, for actor identification)
CREATE POLICY "External auditors can view user profiles"
ON public.user_profiles
FOR SELECT
USING (is_external_auditor(auth.uid()));

-- NOTE: External auditors have NO INSERT, UPDATE, DELETE permissions on any table
-- The existing RLS structure already prevents this as we're only adding SELECT policies