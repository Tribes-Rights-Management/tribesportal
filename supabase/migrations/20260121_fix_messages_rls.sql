-- ═══════════════════════════════════════════════════════════════════════════
-- FIX: Secure the messages table
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ═══════════════════════════════════════════════════════════════════════════

-- First, ensure RLS is enabled
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop any existing overly-permissive policies
DROP POLICY IF EXISTS "Allow public insert" ON public.messages;
DROP POLICY IF EXISTS "Allow authenticated read" ON public.messages;
DROP POLICY IF EXISTS "Allow authenticated select" ON public.messages;
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can read messages" ON public.messages;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.messages;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.messages;
DROP POLICY IF EXISTS "Enable update for all users" ON public.messages;

-- ═══════════════════════════════════════════════════════════════════════════
-- NEW SECURE POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. PUBLIC INSERT: Allow anyone (including anonymous) to submit contact messages
--    This is needed for the public Help Center contact form
CREATE POLICY "Public can submit messages"
ON public.messages
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 2. ADMIN/STAFF SELECT: Only users who can manage help can read messages
--    Uses the existing can_manage_help() function from your schema
CREATE POLICY "Help managers can read messages"
ON public.messages
FOR SELECT
TO authenticated
USING (
  public.can_manage_help(auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- 3. ADMIN/STAFF UPDATE: Only help managers can update message status
CREATE POLICY "Help managers can update messages"
ON public.messages
FOR UPDATE
TO authenticated
USING (
  public.can_manage_help(auth.uid())
  OR public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  public.can_manage_help(auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- 4. NO DELETE: Messages should be retained for audit trail
--    (No delete policy = no one can delete)

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICATION: Check that policies are correct
-- ═══════════════════════════════════════════════════════════════════════════

-- Run this to verify:
-- SELECT * FROM pg_policies WHERE tablename = 'messages';
