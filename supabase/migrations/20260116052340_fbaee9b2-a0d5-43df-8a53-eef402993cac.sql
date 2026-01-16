-- Fix RLS policies for audit_logs and access_logs
-- The INSERT policies need to be restricted to authenticated users only
-- Service role bypasses RLS anyway, so these policies are for application-level inserts

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Service role can insert access logs" ON public.access_logs;

-- Create restricted insert policies
-- Authenticated users can insert audit logs (the helper function runs as SECURITY DEFINER)
CREATE POLICY "Authenticated users can insert via helper function"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (
  -- Only allow inserts where actor_id matches current user (or is null for system)
  (actor_id = auth.uid() OR actor_id IS NULL)
);

-- Authenticated users can insert access logs for their own actions
CREATE POLICY "Authenticated users can log their own access"
ON public.access_logs
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
);