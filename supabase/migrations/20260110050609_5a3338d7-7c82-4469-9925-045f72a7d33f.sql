-- =====================================================
-- TRIBES ENTERPRISE SECURITY UPLIFT MIGRATION
-- Multi-tenant foundation, audit logging, data catalog
-- =====================================================

-- STEP 1: Create new enums for multi-tenancy
CREATE TYPE public.tenant_status AS ENUM ('active', 'suspended');
CREATE TYPE public.membership_role AS ENUM ('admin', 'member', 'viewer');
CREATE TYPE public.membership_status AS ENUM ('active', 'suspended', 'invited');
CREATE TYPE public.classification_level AS ENUM ('public', 'internal', 'confidential', 'restricted');
CREATE TYPE public.retention_class AS ENUM ('transient', 'short_term', 'standard', 'long_term', 'permanent');
CREATE TYPE public.sensitivity_tag AS ENUM ('none', 'pii', 'financial', 'credentials', 'proprietary');

-- =====================================================
-- STEP 2: TENANTS TABLE
-- =====================================================
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status tenant_status NOT NULL DEFAULT 'active',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Create default development tenant
INSERT INTO public.tenants (id, legal_name, slug, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Tenant', 'default', 'active');

-- =====================================================
-- STEP 3: TENANT MEMBERSHIPS TABLE
-- =====================================================
CREATE TABLE public.tenant_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  membership_role membership_role NOT NULL DEFAULT 'member',
  status membership_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id)
);

ALTER TABLE public.tenant_memberships ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: IMMUTABLE AUDIT LOG TABLE
-- =====================================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audit logs are append-only: no UPDATE or DELETE policies
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create index for efficient querying
CREATE INDEX idx_audit_logs_tenant_created ON public.audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_logs_user_created ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- =====================================================
-- STEP 5: CONTACT SUBMISSIONS (service-role only)
-- =====================================================
CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT NOT NULL,
  source TEXT DEFAULT 'website',
  ip_address INET,
  user_agent TEXT,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 6: DATA CATALOG TABLES (Governance)
-- =====================================================
CREATE TABLE public.data_catalog_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_schema TEXT NOT NULL DEFAULT 'public',
  table_name TEXT NOT NULL,
  description TEXT,
  owner TEXT,
  classification_level classification_level NOT NULL DEFAULT 'internal',
  retention_class retention_class NOT NULL DEFAULT 'standard',
  contains_pii BOOLEAN DEFAULT false,
  legal_hold BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (table_schema, table_name)
);

ALTER TABLE public.data_catalog_tables ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.data_catalog_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_schema TEXT NOT NULL DEFAULT 'public',
  table_name TEXT NOT NULL,
  column_name TEXT NOT NULL,
  description TEXT,
  sensitivity_tag sensitivity_tag NOT NULL DEFAULT 'none',
  is_encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (table_schema, table_name, column_name)
);

ALTER TABLE public.data_catalog_columns ENABLE ROW LEVEL SECURITY;

-- Populate data catalog with existing tables
INSERT INTO public.data_catalog_tables (table_name, description, owner, classification_level, contains_pii) VALUES
  ('user_profiles', 'User profile information and account status', 'platform', 'confidential', true),
  ('user_roles', 'User platform-level role assignments', 'platform', 'restricted', false),
  ('tenants', 'Tenant organizations in the platform', 'platform', 'internal', false),
  ('tenant_memberships', 'User membership within tenants', 'platform', 'confidential', false),
  ('audit_logs', 'Immutable audit trail of all sensitive actions', 'platform', 'restricted', true),
  ('contact_submissions', 'Contact form submissions from website', 'platform', 'confidential', true),
  ('data_catalog_tables', 'Metadata catalog of database tables', 'platform', 'internal', false),
  ('data_catalog_columns', 'Metadata catalog of database columns', 'platform', 'internal', false);

INSERT INTO public.data_catalog_columns (table_name, column_name, description, sensitivity_tag) VALUES
  ('user_profiles', 'email', 'User email address', 'pii'),
  ('user_profiles', 'id', 'User unique identifier', 'pii'),
  ('contact_submissions', 'email', 'Contact email address', 'pii'),
  ('contact_submissions', 'name', 'Contact name', 'pii'),
  ('contact_submissions', 'ip_address', 'Submission IP address', 'pii'),
  ('audit_logs', 'ip_address', 'Action IP address', 'pii'),
  ('audit_logs', 'user_id', 'Acting user identifier', 'pii');

-- =====================================================
-- STEP 7: SOFT DELETE COLUMNS ON SENSITIVE TABLES
-- =====================================================
ALTER TABLE public.user_profiles 
  ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN deletion_eligible_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN legal_hold BOOLEAN DEFAULT false;

ALTER TABLE public.tenants
  ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN deletion_eligible_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN legal_hold BOOLEAN DEFAULT false;

ALTER TABLE public.tenant_memberships
  ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- STEP 8: SECURITY DEFINER FUNCTIONS
-- =====================================================

-- Check if user is a platform admin
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- Check if user has active membership in a tenant
CREATE OR REPLACE FUNCTION public.has_tenant_access(_user_id UUID, _tenant_id UUID)
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
      AND deleted_at IS NULL
  )
$$;

-- Check if user is admin within a tenant
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
      AND membership_role = 'admin'
      AND status = 'active'
      AND deleted_at IS NULL
  )
$$;

-- Get user's active tenant IDs
CREATE OR REPLACE FUNCTION public.get_user_tenant_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id
  FROM public.tenant_memberships
  WHERE user_id = _user_id
    AND status = 'active'
    AND deleted_at IS NULL
$$;

-- =====================================================
-- STEP 9: RLS POLICIES - TENANTS
-- =====================================================

-- Platform admins can see all tenants
CREATE POLICY "Platform admins can view all tenants"
ON public.tenants
FOR SELECT
USING (public.is_platform_admin(auth.uid()));

-- Users can see tenants they are members of
CREATE POLICY "Users can view their tenants"
ON public.tenants
FOR SELECT
USING (
  id IN (SELECT public.get_user_tenant_ids(auth.uid()))
);

-- Only platform admins can create tenants
CREATE POLICY "Platform admins can create tenants"
ON public.tenants
FOR INSERT
WITH CHECK (public.is_platform_admin(auth.uid()));

-- Only platform admins can update tenants
CREATE POLICY "Platform admins can update tenants"
ON public.tenants
FOR UPDATE
USING (public.is_platform_admin(auth.uid()));

-- =====================================================
-- STEP 10: RLS POLICIES - TENANT MEMBERSHIPS
-- =====================================================

-- Platform admins can view all memberships
CREATE POLICY "Platform admins can view all memberships"
ON public.tenant_memberships
FOR SELECT
USING (public.is_platform_admin(auth.uid()));

-- Users can view memberships in their tenants
CREATE POLICY "Users can view memberships in their tenants"
ON public.tenant_memberships
FOR SELECT
USING (
  tenant_id IN (SELECT public.get_user_tenant_ids(auth.uid()))
);

-- Users can view their own memberships
CREATE POLICY "Users can view their own memberships"
ON public.tenant_memberships
FOR SELECT
USING (user_id = auth.uid());

-- Platform admins or tenant admins can create memberships
CREATE POLICY "Admins can create memberships"
ON public.tenant_memberships
FOR INSERT
WITH CHECK (
  public.is_platform_admin(auth.uid())
  OR public.is_tenant_admin(auth.uid(), tenant_id)
);

-- Platform admins or tenant admins can update memberships (not their own)
CREATE POLICY "Admins can update memberships"
ON public.tenant_memberships
FOR UPDATE
USING (
  (public.is_platform_admin(auth.uid()) OR public.is_tenant_admin(auth.uid(), tenant_id))
  AND user_id != auth.uid()
);

-- =====================================================
-- STEP 11: RLS POLICIES - AUDIT LOGS (append-only)
-- =====================================================

-- Platform admins can read all audit logs
CREATE POLICY "Platform admins can read all audit logs"
ON public.audit_logs
FOR SELECT
USING (public.is_platform_admin(auth.uid()));

-- Users can read audit logs for their tenants
CREATE POLICY "Users can read tenant audit logs"
ON public.audit_logs
FOR SELECT
USING (
  tenant_id IN (SELECT public.get_user_tenant_ids(auth.uid()))
);

-- NO INSERT/UPDATE/DELETE policies for authenticated users
-- Audit logs are written ONLY via service role (Edge Functions)

-- =====================================================
-- STEP 12: RLS POLICIES - CONTACT SUBMISSIONS
-- =====================================================

-- Only platform admins can read contact submissions
CREATE POLICY "Platform admins can read contact submissions"
ON public.contact_submissions
FOR SELECT
USING (public.is_platform_admin(auth.uid()));

-- Only platform admins can update (mark as processed)
CREATE POLICY "Platform admins can update contact submissions"
ON public.contact_submissions
FOR UPDATE
USING (public.is_platform_admin(auth.uid()));

-- NO INSERT policy for authenticated users
-- Contact submissions are written ONLY via service role (Edge Functions)

-- =====================================================
-- STEP 13: RLS POLICIES - DATA CATALOG (admin only)
-- =====================================================

-- Only platform admins can view data catalog
CREATE POLICY "Platform admins can view data catalog tables"
ON public.data_catalog_tables
FOR SELECT
USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can manage data catalog tables"
ON public.data_catalog_tables
FOR ALL
USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can view data catalog columns"
ON public.data_catalog_columns
FOR SELECT
USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can manage data catalog columns"
ON public.data_catalog_columns
FOR ALL
USING (public.is_platform_admin(auth.uid()));

-- =====================================================
-- STEP 14: UPDATE TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tenant_memberships_updated_at
  BEFORE UPDATE ON public.tenant_memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_catalog_tables_updated_at
  BEFORE UPDATE ON public.data_catalog_tables
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_catalog_columns_updated_at
  BEFORE UPDATE ON public.data_catalog_columns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();