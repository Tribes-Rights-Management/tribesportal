-- ============================================
-- WORLD-CLASS RLS HELPER FUNCTIONS
-- ============================================

-- 1) Is the current user an ACTIVE member of this tenant?
CREATE OR REPLACE FUNCTION public.is_active_member(p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_memberships m
    WHERE m.tenant_id = p_tenant_id
      AND m.user_id = auth.uid()
      AND m.status = 'active'
      AND m.deleted_at IS NULL
  );
$$;

-- 2) Does the current user have a specific portal role in this tenant?
CREATE OR REPLACE FUNCTION public.has_tenant_role(p_tenant_id uuid, p_role portal_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_memberships m
    JOIN public.membership_roles mr ON mr.membership_id = m.id
    WHERE m.tenant_id = p_tenant_id
      AND m.user_id = auth.uid()
      AND m.status = 'active'
      AND m.deleted_at IS NULL
      AND mr.role = p_role
  );
$$;

-- 3) Does the current user have any role in a set for this tenant?
CREATE OR REPLACE FUNCTION public.has_any_tenant_role(p_tenant_id uuid, p_roles portal_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_memberships m
    JOIN public.membership_roles mr ON mr.membership_id = m.id
    WHERE m.tenant_id = p_tenant_id
      AND m.user_id = auth.uid()
      AND m.status = 'active'
      AND m.deleted_at IS NULL
      AND mr.role = ANY(p_roles)
  );
$$;

-- 4) Can the current user approve/manage memberships for this tenant?
CREATE OR REPLACE FUNCTION public.can_manage_memberships(p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    public.is_platform_admin(auth.uid())
    OR public.has_any_tenant_role(p_tenant_id, ARRAY['tenant_owner', 'internal_admin']::portal_role[]);
$$;

-- ============================================
-- UPDATE TENANT_MEMBERSHIPS POLICIES
-- ============================================

-- Drop existing policies that we'll replace
DROP POLICY IF EXISTS "Admins can create memberships" ON public.tenant_memberships;
DROP POLICY IF EXISTS "Admins can update memberships" ON public.tenant_memberships;

-- Users can read their own memberships (any status - needed to see pending state)
-- Already exists: "Users can view their own memberships"

-- Tenant owners/internal_admin can read all memberships for their tenant
CREATE POLICY "Membership managers can view tenant memberships"
ON public.tenant_memberships
FOR SELECT
USING (
  public.can_manage_memberships(tenant_id)
);

-- Only tenant_owner/internal_admin/platform_admin can INSERT memberships (invites)
CREATE POLICY "Membership managers can create memberships"
ON public.tenant_memberships
FOR INSERT
WITH CHECK (
  public.can_manage_memberships(tenant_id)
);

-- Only tenant_owner/internal_admin/platform_admin can UPDATE membership status
CREATE POLICY "Membership managers can update memberships"
ON public.tenant_memberships
FOR UPDATE
USING (
  public.can_manage_memberships(tenant_id)
  AND user_id <> auth.uid() -- Cannot modify your own membership
)
WITH CHECK (
  public.can_manage_memberships(tenant_id)
);

-- Only platform admins can delete memberships (soft delete preferred)
CREATE POLICY "Platform admins can delete memberships"
ON public.tenant_memberships
FOR DELETE
USING (
  public.is_platform_admin(auth.uid())
);

-- ============================================
-- UPDATE MEMBERSHIP_ROLES POLICIES  
-- ============================================

-- Drop existing policies that we'll enhance
DROP POLICY IF EXISTS "Tenant owners can manage their tenant's membership roles" ON public.membership_roles;

-- Membership managers can manage roles for their tenant
CREATE POLICY "Membership managers can manage roles"
ON public.membership_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_memberships tm
    WHERE tm.id = membership_roles.membership_id
      AND public.can_manage_memberships(tm.tenant_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tenant_memberships tm
    WHERE tm.id = membership_roles.membership_id
      AND public.can_manage_memberships(tm.tenant_id)
  )
);