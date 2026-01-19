-- Add can_manage_help capability to user_profiles
-- This is a company-scoped capability, not a role
-- Only users with internal platform roles AND this capability can manage Help content

-- 1) Add capability column to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS can_manage_help boolean NOT NULL DEFAULT false;

-- 2) Create security definer function to check Help management access
-- Requires: platform_admin OR (internal role AND can_manage_help = true)
CREATE OR REPLACE FUNCTION public.can_manage_help_content(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = _user_id
      AND status = 'active'
      AND (
        -- Platform admins always have access
        platform_role = 'platform_admin'
        OR (
          -- Internal roles with explicit capability
          platform_role IN ('platform_admin', 'platform_user')
          AND can_manage_help = true
        )
      )
  )
$$;

-- 3) Drop existing overly-permissive RLS policies on articles
DROP POLICY IF EXISTS "help__articles_manage_auth" ON public.articles;
DROP POLICY IF EXISTS "help__articles_select_published" ON public.articles;
DROP POLICY IF EXISTS "help__articles_update_stats" ON public.articles;

-- 4) Create proper RLS policies for articles
-- Public read for published articles (Help frontend)
CREATE POLICY "help__articles_select_published"
ON public.articles
FOR SELECT
USING (published = true);

-- Manage (INSERT/UPDATE/DELETE) only for users with Help capability
CREATE POLICY "help__articles_manage"
ON public.articles
FOR ALL
USING (public.can_manage_help_content(auth.uid()))
WITH CHECK (public.can_manage_help_content(auth.uid()));

-- 5) Drop existing overly-permissive RLS policies on categories
DROP POLICY IF EXISTS "help__categories_manage_auth" ON public.categories;
DROP POLICY IF EXISTS "help__categories_select_public" ON public.categories;

-- 6) Create proper RLS policies for categories
-- Public read for categories (Help frontend)
CREATE POLICY "help__categories_select_public"
ON public.categories
FOR SELECT
USING (true);

-- Manage only for users with Help capability
CREATE POLICY "help__categories_manage"
ON public.categories
FOR ALL
USING (public.can_manage_help_content(auth.uid()))
WITH CHECK (public.can_manage_help_content(auth.uid()));