-- 1. Create new role enum for membership-scoped roles
CREATE TYPE public.portal_role AS ENUM (
  'tenant_owner',
  'publishing_admin', 
  'licensing_user',
  'read_only',
  'internal_admin'
);

-- 2. Create context enum
CREATE TYPE public.portal_context AS ENUM (
  'licensing',
  'publishing'
);

-- 3. Create membership_roles table (one membership can have multiple roles)
CREATE TABLE public.membership_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID NOT NULL REFERENCES public.tenant_memberships(id) ON DELETE CASCADE,
  role portal_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (membership_id, role)
);

-- 4. Create context_permissions table (maps roles to allowed contexts)
CREATE TABLE public.context_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role portal_role NOT NULL,
  context portal_context NOT NULL,
  allowed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (role, context)
);

-- 5. Add default context/tenant preferences to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN default_tenant_id UUID REFERENCES public.tenants(id),
ADD COLUMN default_context portal_context;

-- 6. Enable RLS on new tables
ALTER TABLE public.membership_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.context_permissions ENABLE ROW LEVEL SECURITY;

-- 7. Security definer function: get roles for a membership
CREATE OR REPLACE FUNCTION public.get_membership_roles(_membership_id uuid)
RETURNS SETOF portal_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.membership_roles WHERE membership_id = _membership_id
$$;

-- 8. Security definer function: check if user has specific portal role for a tenant
CREATE OR REPLACE FUNCTION public.has_portal_role(_user_id uuid, _tenant_id uuid, _role portal_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_memberships tm
    JOIN public.membership_roles mr ON mr.membership_id = tm.id
    WHERE tm.user_id = _user_id
      AND tm.tenant_id = _tenant_id
      AND tm.status = 'active'
      AND tm.deleted_at IS NULL
      AND mr.role = _role
  )
$$;

-- 9. Security definer function: get available contexts for a user in a tenant
CREATE OR REPLACE FUNCTION public.get_user_contexts(_user_id uuid, _tenant_id uuid)
RETURNS SETOF portal_context
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT cp.context
  FROM public.tenant_memberships tm
  JOIN public.membership_roles mr ON mr.membership_id = tm.id
  JOIN public.context_permissions cp ON cp.role = mr.role AND cp.allowed = true
  WHERE tm.user_id = _user_id
    AND tm.tenant_id = _tenant_id
    AND tm.status = 'active'
    AND tm.deleted_at IS NULL
$$;

-- 10. Security definer function: check if user can access a specific context
CREATE OR REPLACE FUNCTION public.can_access_context(_user_id uuid, _tenant_id uuid, _context portal_context)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_memberships tm
    JOIN public.membership_roles mr ON mr.membership_id = tm.id
    JOIN public.context_permissions cp ON cp.role = mr.role
    WHERE tm.user_id = _user_id
      AND tm.tenant_id = _tenant_id
      AND tm.status = 'active'
      AND tm.deleted_at IS NULL
      AND cp.context = _context
      AND cp.allowed = true
  )
$$;

-- 11. RLS policies for membership_roles
CREATE POLICY "Platform admins can manage membership roles"
ON public.membership_roles
FOR ALL
USING (is_platform_admin(auth.uid()));

CREATE POLICY "Tenant owners can manage their tenant's membership roles"
ON public.membership_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_memberships tm
    WHERE tm.id = membership_roles.membership_id
    AND has_portal_role(auth.uid(), tm.tenant_id, 'tenant_owner')
  )
);

CREATE POLICY "Users can view their own membership roles"
ON public.membership_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_memberships tm
    WHERE tm.id = membership_roles.membership_id
    AND tm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view membership roles in their tenants"
ON public.membership_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_memberships tm
    WHERE tm.id = membership_roles.membership_id
    AND tm.tenant_id IN (SELECT get_user_tenant_ids(auth.uid()))
  )
);

-- 12. RLS policies for context_permissions (read-only, reference data)
CREATE POLICY "Anyone authenticated can read context permissions"
ON public.context_permissions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Platform admins can manage context permissions"
ON public.context_permissions
FOR ALL
USING (is_platform_admin(auth.uid()));

-- 13. Seed default context permissions
INSERT INTO public.context_permissions (role, context, allowed) VALUES
  ('tenant_owner', 'licensing', true),
  ('tenant_owner', 'publishing', true),
  ('publishing_admin', 'licensing', true),
  ('publishing_admin', 'publishing', true),
  ('licensing_user', 'licensing', true),
  ('licensing_user', 'publishing', false),
  ('read_only', 'licensing', true),
  ('read_only', 'publishing', true),
  ('internal_admin', 'licensing', true),
  ('internal_admin', 'publishing', true);

-- 14. Create index for performance
CREATE INDEX idx_membership_roles_membership_id ON public.membership_roles(membership_id);
CREATE INDEX idx_context_permissions_role ON public.context_permissions(role);