-- =====================================================
-- MULTI-TENANT SAAS: SQL HELPER FUNCTIONS + RLS POLICIES
-- Single source of truth for authorization
-- =====================================================

-- 1) HELPER FUNCTION: is_platform_user (platform_owner or platform_staff)
-- Returns true if user has platform-level access
CREATE OR REPLACE FUNCTION public.is_platform_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE user_id = _user_id
      AND platform_role IN ('platform_admin')
      AND status = 'active'
  )
$$;

-- 2) HELPER FUNCTION: is_org_member
-- Returns true if user is an active member of the organization
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_memberships
    WHERE user_id = _user_id
      AND tenant_id = _org_id
      AND status = 'active'
  )
$$;

-- Note: is_org_admin and is_org_owner already exist from previous migrations

-- 3) Update module_access RLS policies to use helper functions
-- First drop any existing policies
DROP POLICY IF EXISTS "Platform users can view all module access" ON public.module_access;
DROP POLICY IF EXISTS "Org admins can manage module access" ON public.module_access;
DROP POLICY IF EXISTS "Users can view own module access" ON public.module_access;
DROP POLICY IF EXISTS "Platform admins can manage module access" ON public.module_access;

-- SELECT: Platform users see all; org members see their org's records; users see own
CREATE POLICY "module_access_select"
ON public.module_access FOR SELECT
USING (
  is_platform_user(auth.uid())
  OR is_org_member(auth.uid(), organization_id)
  OR user_id = auth.uid()
);

-- INSERT/UPDATE/DELETE: Platform users can manage all; org admins can manage their org
CREATE POLICY "module_access_insert"
ON public.module_access FOR INSERT
WITH CHECK (
  is_platform_user(auth.uid())
  OR is_org_admin(auth.uid(), organization_id)
);

CREATE POLICY "module_access_update"
ON public.module_access FOR UPDATE
USING (
  is_platform_user(auth.uid())
  OR is_org_admin(auth.uid(), organization_id)
);

CREATE POLICY "module_access_delete"
ON public.module_access FOR DELETE
USING (
  is_platform_user(auth.uid())
  OR is_org_admin(auth.uid(), organization_id)
);

-- 4) Update invitations RLS policies
DROP POLICY IF EXISTS "Platform users can view all invitations" ON public.invitations;
DROP POLICY IF EXISTS "Org admins can manage invitations" ON public.invitations;
DROP POLICY IF EXISTS "Users can view invitations sent to them" ON public.invitations;
DROP POLICY IF EXISTS "Platform admins can manage invitations" ON public.invitations;

-- SELECT: Platform users see all; org admins see their org; invited users see their invitation
CREATE POLICY "invitations_select"
ON public.invitations FOR SELECT
USING (
  is_platform_user(auth.uid())
  OR is_org_admin(auth.uid(), organization_id)
  OR invited_email = (SELECT email FROM public.user_profiles WHERE user_id = auth.uid())
);

-- INSERT: Platform users or org admins only
CREATE POLICY "invitations_insert"
ON public.invitations FOR INSERT
WITH CHECK (
  is_platform_user(auth.uid())
  OR is_org_admin(auth.uid(), organization_id)
);

-- UPDATE: Platform users or org admins only
CREATE POLICY "invitations_update"
ON public.invitations FOR UPDATE
USING (
  is_platform_user(auth.uid())
  OR is_org_admin(auth.uid(), organization_id)
);

-- DELETE: Platform users or org admins only
CREATE POLICY "invitations_delete"
ON public.invitations FOR DELETE
USING (
  is_platform_user(auth.uid())
  OR is_org_admin(auth.uid(), organization_id)
);

-- 5) Update tenant_memberships RLS policies
DROP POLICY IF EXISTS "Users can view own memberships" ON public.tenant_memberships;
DROP POLICY IF EXISTS "Org admins can view org memberships" ON public.tenant_memberships;
DROP POLICY IF EXISTS "Platform admins can view all memberships" ON public.tenant_memberships;
DROP POLICY IF EXISTS "Platform admins can manage memberships" ON public.tenant_memberships;
DROP POLICY IF EXISTS "Org admins can manage org memberships" ON public.tenant_memberships;

-- SELECT: Platform users see all; users see own; org members see their org
CREATE POLICY "memberships_select"
ON public.tenant_memberships FOR SELECT
USING (
  is_platform_user(auth.uid())
  OR user_id = auth.uid()
  OR is_org_member(auth.uid(), tenant_id)
);

-- INSERT: Platform users or org admins
CREATE POLICY "memberships_insert"
ON public.tenant_memberships FOR INSERT
WITH CHECK (
  is_platform_user(auth.uid())
  OR is_org_admin(auth.uid(), tenant_id)
);

-- UPDATE: Platform users or org admins
CREATE POLICY "memberships_update"
ON public.tenant_memberships FOR UPDATE
USING (
  is_platform_user(auth.uid())
  OR is_org_admin(auth.uid(), tenant_id)
);

-- DELETE: Platform users or org admins
CREATE POLICY "memberships_delete"
ON public.tenant_memberships FOR DELETE
USING (
  is_platform_user(auth.uid())
  OR is_org_admin(auth.uid(), tenant_id)
);

-- 6) Update tenants (organizations) RLS policies
DROP POLICY IF EXISTS "Platform admins can view all tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can view their tenant" ON public.tenants;
DROP POLICY IF EXISTS "Platform admins can manage tenants" ON public.tenants;

-- SELECT: Platform users see all; org members see their org
CREATE POLICY "tenants_select"
ON public.tenants FOR SELECT
USING (
  is_platform_user(auth.uid())
  OR is_org_member(auth.uid(), id)
);

-- INSERT/UPDATE/DELETE: Platform users only (org creation is platform-level)
CREATE POLICY "tenants_insert"
ON public.tenants FOR INSERT
WITH CHECK (is_platform_user(auth.uid()));

CREATE POLICY "tenants_update"
ON public.tenants FOR UPDATE
USING (is_platform_user(auth.uid()));

CREATE POLICY "tenants_delete"
ON public.tenants FOR DELETE
USING (is_platform_user(auth.uid()));

-- 7) Representative business data table policies (licensing_requests as example)
-- These patterns should be applied to all org-scoped business data tables

DROP POLICY IF EXISTS "Platform admins can view all requests" ON public.licensing_requests;
DROP POLICY IF EXISTS "Users can view own tenant requests" ON public.licensing_requests;
DROP POLICY IF EXISTS "Users can create requests for own tenant" ON public.licensing_requests;
DROP POLICY IF EXISTS "Platform admins can manage all requests" ON public.licensing_requests;

CREATE POLICY "licensing_requests_select"
ON public.licensing_requests FOR SELECT
USING (
  is_platform_user(auth.uid())
  OR is_org_member(auth.uid(), tenant_id)
);

CREATE POLICY "licensing_requests_insert"
ON public.licensing_requests FOR INSERT
WITH CHECK (
  is_platform_user(auth.uid())
  OR is_org_member(auth.uid(), tenant_id)
);

CREATE POLICY "licensing_requests_update"
ON public.licensing_requests FOR UPDATE
USING (
  is_platform_user(auth.uid())
  OR is_org_admin(auth.uid(), tenant_id)
);

CREATE POLICY "licensing_requests_delete"
ON public.licensing_requests FOR DELETE
USING (
  is_platform_user(auth.uid())
  OR is_org_admin(auth.uid(), tenant_id)
);