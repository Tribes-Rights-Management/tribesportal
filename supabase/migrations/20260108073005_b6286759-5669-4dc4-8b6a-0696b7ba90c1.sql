-- Fix overly permissive RLS policies

-- Drop the permissive policies
DROP POLICY IF EXISTS "Anyone can insert contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "System can insert audit log" ON public.audit_log;

-- Create more secure policies
-- Contact submissions: require some rate limiting context (use service role for public submissions)
CREATE POLICY "Service role can insert contact submissions"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

-- Audit log: only service role or admins can insert
CREATE POLICY "Service role or admins can insert audit log"
  ON public.audit_log FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR public.has_role(auth.uid(), 'admin'));