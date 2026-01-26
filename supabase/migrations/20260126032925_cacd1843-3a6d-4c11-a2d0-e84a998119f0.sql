-- ═══════════════════════════════════════════════════════════════════════════
-- MULTI-TENANT INVITATION & MODULE ACCESS SYSTEM
-- ═══════════════════════════════════════════════════════════════════════════

-- 1) Create new enums for organization roles and module access
-- ═══════════════════════════════════════════════════════════════════════════

-- Organization-level roles (different from platform roles)
CREATE TYPE public.org_role AS ENUM (
  'org_owner',     -- Full control of the organization
  'org_admin',     -- Can manage members and settings
  'org_staff',     -- Internal staff with operational access
  'org_client'     -- External client with limited access
);

-- Module types that can be granted access to
CREATE TYPE public.module_type AS ENUM (
  'admin',         -- Tribes Admin module (publishing/portal)
  'licensing'      -- Licensing module
);

-- Access levels within a module
CREATE TYPE public.access_level AS ENUM (
  'viewer',        -- Read-only access
  'editor',        -- Can create/edit records
  'manager',       -- Can manage workflows
  'approver'       -- Can approve/reject items
);

-- Invitation status
CREATE TYPE public.invitation_status AS ENUM (
  'pending',
  'accepted',
  'expired',
  'revoked'
);

-- 2) Create module_access table
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE public.module_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module module_type NOT NULL,
  access_level access_level NOT NULL DEFAULT 'viewer',
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Each user can only have one access record per module per org
  UNIQUE(organization_id, user_id, module)
);

-- Create index for common queries
CREATE INDEX idx_module_access_user ON public.module_access(user_id);
CREATE INDEX idx_module_access_org ON public.module_access(organization_id);
CREATE INDEX idx_module_access_module ON public.module_access(module);

-- Enable RLS
ALTER TABLE public.module_access ENABLE ROW LEVEL SECURITY;

-- 3) Create invitations table
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  org_role org_role NOT NULL DEFAULT 'org_client',
  
  -- Module access grants (booleans + access levels)
  grant_admin_module BOOLEAN NOT NULL DEFAULT false,
  grant_licensing_module BOOLEAN NOT NULL DEFAULT false,
  admin_access_level access_level,
  licensing_access_level access_level,
  
  -- Token for secure acceptance
  token TEXT NOT NULL UNIQUE,
  
  -- Status tracking
  status invitation_status NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  accepted_by_user_id UUID REFERENCES auth.users(id),
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_org ON public.invitations(organization_id);
CREATE INDEX idx_invitations_email ON public.invitations(invited_email);
CREATE INDEX idx_invitations_status ON public.invitations(status);

-- Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- 4) Add org_role column to tenant_memberships
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.tenant_memberships 
ADD COLUMN IF NOT EXISTS org_role org_role DEFAULT 'org_client';

-- 5) Security definer functions for permission checks
-- ═══════════════════════════════════════════════════════════════════════════

-- Check if user is org owner or admin for a specific organization
CREATE OR REPLACE FUNCTION public.is_org_admin(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_memberships
    WHERE user_id = _user_id
      AND tenant_id = _org_id
      AND status = 'active'
      AND org_role IN ('org_owner', 'org_admin')
  )
$$;

-- Check if user is org owner for a specific organization
CREATE OR REPLACE FUNCTION public.is_org_owner(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_memberships
    WHERE user_id = _user_id
      AND tenant_id = _org_id
      AND status = 'active'
      AND org_role = 'org_owner'
  )
$$;

-- Check if user has access to a specific module
CREATE OR REPLACE FUNCTION public.has_module_access(_user_id UUID, _module module_type)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.module_access
    WHERE user_id = _user_id
      AND module = _module
      AND revoked_at IS NULL
  ) OR is_platform_admin(_user_id)
$$;

-- Check if user has specific access level to a module in an org
CREATE OR REPLACE FUNCTION public.has_module_access_level(_user_id UUID, _org_id UUID, _module module_type, _level access_level)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.module_access
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND module = _module
      AND revoked_at IS NULL
      AND (
        access_level = _level
        OR (_level = 'viewer' AND access_level IN ('viewer', 'editor', 'manager', 'approver'))
        OR (_level = 'editor' AND access_level IN ('editor', 'manager', 'approver'))
        OR (_level = 'manager' AND access_level IN ('manager', 'approver'))
      )
  ) OR is_platform_admin(_user_id)
$$;

-- Get user's organizations (for org switcher)
CREATE OR REPLACE FUNCTION public.get_user_organizations(_user_id UUID)
RETURNS TABLE(
  org_id UUID,
  org_name TEXT,
  org_slug TEXT,
  user_org_role org_role,
  has_admin_module BOOLEAN,
  has_licensing_module BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    t.id as org_id,
    t.name as org_name,
    t.slug as org_slug,
    tm.org_role as user_org_role,
    EXISTS(SELECT 1 FROM public.module_access ma WHERE ma.user_id = _user_id AND ma.organization_id = t.id AND ma.module = 'admin' AND ma.revoked_at IS NULL) as has_admin_module,
    EXISTS(SELECT 1 FROM public.module_access ma WHERE ma.user_id = _user_id AND ma.organization_id = t.id AND ma.module = 'licensing' AND ma.revoked_at IS NULL) as has_licensing_module
  FROM public.tenant_memberships tm
  JOIN public.tenants t ON t.id = tm.tenant_id
  WHERE tm.user_id = _user_id
    AND tm.status = 'active'
  ORDER BY t.name
$$;

-- 6) RLS Policies for module_access
-- ═══════════════════════════════════════════════════════════════════════════

-- Users can view their own module access
CREATE POLICY "Users can view own module access"
ON public.module_access
FOR SELECT
USING (user_id = auth.uid());

-- Platform admins can view all module access
CREATE POLICY "Platform admins can view all module access"
ON public.module_access
FOR SELECT
USING (is_platform_admin(auth.uid()));

-- Org admins can view module access for their org
CREATE POLICY "Org admins can view org module access"
ON public.module_access
FOR SELECT
USING (is_org_admin(auth.uid(), organization_id));

-- Platform admins and org admins can insert module access
CREATE POLICY "Admins can insert module access"
ON public.module_access
FOR INSERT
WITH CHECK (
  is_platform_admin(auth.uid()) 
  OR is_org_admin(auth.uid(), organization_id)
);

-- Platform admins and org admins can update module access
CREATE POLICY "Admins can update module access"
ON public.module_access
FOR UPDATE
USING (
  is_platform_admin(auth.uid()) 
  OR is_org_admin(auth.uid(), organization_id)
);

-- Platform admins and org admins can delete module access
CREATE POLICY "Admins can delete module access"
ON public.module_access
FOR DELETE
USING (
  is_platform_admin(auth.uid()) 
  OR is_org_admin(auth.uid(), organization_id)
);

-- 7) RLS Policies for invitations
-- ═══════════════════════════════════════════════════════════════════════════

-- Platform admins can view all invitations
CREATE POLICY "Platform admins can view all invitations"
ON public.invitations
FOR SELECT
USING (is_platform_admin(auth.uid()));

-- Org admins can view invitations for their org
CREATE POLICY "Org admins can view org invitations"
ON public.invitations
FOR SELECT
USING (is_org_admin(auth.uid(), organization_id));

-- Users can view invitations sent to their email
CREATE POLICY "Users can view invitations to their email"
ON public.invitations
FOR SELECT
USING (
  invited_email = (SELECT email FROM public.user_profiles WHERE user_id = auth.uid())
);

-- Platform admins and org admins can create invitations
CREATE POLICY "Admins can create invitations"
ON public.invitations
FOR INSERT
WITH CHECK (
  is_platform_admin(auth.uid()) 
  OR is_org_admin(auth.uid(), organization_id)
);

-- Platform admins and org admins can update invitations (revoke, etc)
CREATE POLICY "Admins can update invitations"
ON public.invitations
FOR UPDATE
USING (
  is_platform_admin(auth.uid()) 
  OR is_org_admin(auth.uid(), organization_id)
);

-- 8) Update tenants RLS to allow org members to read their org
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Platform admins can view all tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can view their own tenant" ON public.tenants;

-- Platform admins can view all tenants
CREATE POLICY "Platform admins can view all tenants"
ON public.tenants
FOR SELECT
USING (is_platform_admin(auth.uid()));

-- Users can view tenants they are members of
CREATE POLICY "Members can view their tenants"
ON public.tenants
FOR SELECT
USING (
  id IN (
    SELECT tenant_id FROM public.tenant_memberships
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- 9) Update timestamp trigger for new tables
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TRIGGER update_module_access_updated_at
  BEFORE UPDATE ON public.module_access
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_invitations_updated_at
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 10) Grant my user platform_admin role (if not already)
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE public.user_profiles 
SET platform_role = 'platform_admin', status = 'active'
WHERE email = 'adam@tribesassets.com';