
-- =====================================================
-- TRIBES ACCESS MANAGEMENT SCHEMA
-- =====================================================

-- 1) ENUMS
-- =====================================================
CREATE TYPE public.membership_status AS ENUM ('pending', 'active', 'denied', 'revoked', 'suspended');
CREATE TYPE public.platform_role AS ENUM ('platform_admin', 'platform_user');
CREATE TYPE public.portal_role AS ENUM ('tenant_admin', 'tenant_user', 'viewer');
CREATE TYPE public.portal_context AS ENUM ('publishing', 'licensing');
CREATE TYPE public.access_request_status AS ENUM ('pending', 'processed');

-- 2) TENANTS TABLE
-- =====================================================
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 3) USER PROFILES TABLE
-- =====================================================
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  platform_role public.platform_role NOT NULL DEFAULT 'platform_user',
  status public.membership_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 4) TENANT MEMBERSHIPS TABLE
-- =====================================================
CREATE TABLE public.tenant_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  status public.membership_status NOT NULL DEFAULT 'pending',
  role public.portal_role NOT NULL DEFAULT 'tenant_user',
  allowed_contexts public.portal_context[] NOT NULL DEFAULT '{}',
  default_context public.portal_context,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, tenant_id)
);

ALTER TABLE public.tenant_memberships ENABLE ROW LEVEL SECURITY;

-- 5) ACCESS REQUESTS TABLE
-- =====================================================
CREATE TABLE public.access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  tenant_hint TEXT,
  message TEXT,
  status public.access_request_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SECURITY DEFINER HELPER FUNCTIONS
-- =====================================================

-- Check if user is a platform admin with active status
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE user_id = _user_id
      AND platform_role = 'platform_admin'
      AND status = 'active'
  )
$$;

-- Check if user has an active membership in a tenant
CREATE OR REPLACE FUNCTION public.is_active_member(_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_memberships
    WHERE user_id = _user_id
      AND tenant_id = _tenant_id
      AND status = 'active'
  )
$$;

-- Check if user is a tenant admin for a specific tenant
CREATE OR REPLACE FUNCTION public.is_tenant_admin(_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_memberships
    WHERE user_id = _user_id
      AND tenant_id = _tenant_id
      AND role = 'tenant_admin'
      AND status = 'active'
  )
$$;

-- Check if user has any active membership
CREATE OR REPLACE FUNCTION public.has_active_membership(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_memberships
    WHERE user_id = _user_id
      AND status = 'active'
  )
$$;

-- Check if user can access a specific context in a tenant
CREATE OR REPLACE FUNCTION public.can_access_context(_user_id UUID, _tenant_id UUID, _context public.portal_context)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_memberships
    WHERE user_id = _user_id
      AND tenant_id = _tenant_id
      AND status = 'active'
      AND _context = ANY(allowed_contexts)
  )
$$;

-- Get user's contexts for a tenant
CREATE OR REPLACE FUNCTION public.get_user_contexts(_user_id UUID, _tenant_id UUID)
RETURNS public.portal_context[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(allowed_contexts, '{}')
  FROM public.tenant_memberships
  WHERE user_id = _user_id
    AND tenant_id = _tenant_id
    AND status = 'active'
$$;

-- =====================================================
-- RLS POLICIES: TENANTS
-- =====================================================

-- Platform admins can do everything
CREATE POLICY "Platform admins can manage tenants"
ON public.tenants
FOR ALL
USING (public.is_platform_admin(auth.uid()));

-- Active members can view their tenant
CREATE POLICY "Members can view their tenant"
ON public.tenants
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_memberships
    WHERE tenant_memberships.tenant_id = tenants.id
      AND tenant_memberships.user_id = auth.uid()
      AND tenant_memberships.status = 'active'
  )
);

-- =====================================================
-- RLS POLICIES: USER PROFILES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.user_profiles
FOR SELECT
USING (user_id = auth.uid());

-- Users can update their own profile (except platform_role and status)
CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Platform admins can view all profiles
CREATE POLICY "Platform admins can view all profiles"
ON public.user_profiles
FOR SELECT
USING (public.is_platform_admin(auth.uid()));

-- Platform admins can update all profiles
CREATE POLICY "Platform admins can update all profiles"
ON public.user_profiles
FOR UPDATE
USING (public.is_platform_admin(auth.uid()));

-- Platform admins can insert profiles
CREATE POLICY "Platform admins can insert profiles"
ON public.user_profiles
FOR INSERT
WITH CHECK (public.is_platform_admin(auth.uid()) OR user_id = auth.uid());

-- =====================================================
-- RLS POLICIES: TENANT MEMBERSHIPS
-- =====================================================

-- Users can view their own memberships
CREATE POLICY "Users can view own memberships"
ON public.tenant_memberships
FOR SELECT
USING (user_id = auth.uid());

-- Platform admins can manage all memberships
CREATE POLICY "Platform admins can manage memberships"
ON public.tenant_memberships
FOR ALL
USING (public.is_platform_admin(auth.uid()));

-- Tenant admins can view members in their tenant
CREATE POLICY "Tenant admins can view tenant members"
ON public.tenant_memberships
FOR SELECT
USING (
  public.is_tenant_admin(auth.uid(), tenant_id)
);

-- =====================================================
-- RLS POLICIES: ACCESS REQUESTS
-- =====================================================

-- Users can view their own access requests
CREATE POLICY "Users can view own access requests"
ON public.access_requests
FOR SELECT
USING (user_id = auth.uid());

-- Users can create access requests
CREATE POLICY "Users can create access requests"
ON public.access_requests
FOR INSERT
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Platform admins can manage all access requests
CREATE POLICY "Platform admins can manage access requests"
ON public.access_requests
FOR ALL
USING (public.is_platform_admin(auth.uid()));

-- =====================================================
-- TRIGGERS: AUTO-UPDATE updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tenant_memberships_updated_at
  BEFORE UPDATE ON public.tenant_memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- TRIGGER: AUTO-CREATE PROFILE ON USER SIGNUP
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, full_name, platform_role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    'platform_user',
    'pending'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_status ON public.user_profiles(status);
CREATE INDEX idx_tenant_memberships_user_id ON public.tenant_memberships(user_id);
CREATE INDEX idx_tenant_memberships_tenant_id ON public.tenant_memberships(tenant_id);
CREATE INDEX idx_tenant_memberships_status ON public.tenant_memberships(status);
CREATE INDEX idx_access_requests_status ON public.access_requests(status);
CREATE INDEX idx_access_requests_user_id ON public.access_requests(user_id);
