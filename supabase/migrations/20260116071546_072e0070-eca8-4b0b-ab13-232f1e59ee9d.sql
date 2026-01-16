-- =========================================================
-- TRIBES PHASE 7: MODULE TABLES + RLS (TENANT-ISOLATED)
-- Adapted for existing schema with portal_role, portal_context
-- =========================================================

-- ----------------------------
-- 0) NEW ENUMS FOR MODULE STATUSES
-- ----------------------------
DO $$ BEGIN
  CREATE TYPE public.licensing_request_status AS ENUM (
    'draft', 'submitted', 'under_review', 'approved', 'rejected', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.agreement_status AS ENUM (
    'draft', 'active', 'expired', 'terminated'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ----------------------------
-- 1) LICENSING MODULE TABLES
-- ----------------------------
CREATE TABLE IF NOT EXISTS public.licensing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  -- Requester identity
  requester_user_id UUID NULL,
  requester_email TEXT NULL,
  -- Request details
  work_title TEXT NULL,
  usage_type TEXT NULL,              -- e.g., "recording", "sync", "print"
  territory TEXT NULL,
  term_description TEXT NULL,
  notes TEXT NULL,
  status public.licensing_request_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.licensing_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  request_id UUID NULL REFERENCES public.licensing_requests(id) ON DELETE SET NULL,
  agreement_title TEXT NOT NULL,
  status public.agreement_status NOT NULL DEFAULT 'draft',
  effective_date DATE NULL,
  end_date DATE NULL,
  document_url TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------
-- 2) CLIENT PORTAL MODULE TABLES
-- ----------------------------
CREATE TABLE IF NOT EXISTS public.portal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  document_type TEXT NULL,            -- e.g., "contract", "schedule", "tax_form"
  document_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.portal_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  statement_period TEXT NOT NULL,     -- e.g., "2026-Q1"
  statement_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.portal_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  agreement_title TEXT NOT NULL,
  status public.agreement_status NOT NULL DEFAULT 'active',
  document_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------
-- 3) UPDATED_AT TRIGGERS
-- ----------------------------
DROP TRIGGER IF EXISTS trg_licensing_requests_updated_at ON public.licensing_requests;
CREATE TRIGGER trg_licensing_requests_updated_at
  BEFORE UPDATE ON public.licensing_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_licensing_agreements_updated_at ON public.licensing_agreements;
CREATE TRIGGER trg_licensing_agreements_updated_at
  BEFORE UPDATE ON public.licensing_agreements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ----------------------------
-- 4) ENABLE RLS ON NEW TABLES
-- ----------------------------
ALTER TABLE public.licensing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licensing_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_agreements ENABLE ROW LEVEL SECURITY;

-- ----------------------------
-- 5) ADDITIONAL RLS HELPER: Check licensing context access
-- ----------------------------
CREATE OR REPLACE FUNCTION public.can_access_licensing_context(_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_memberships
    WHERE user_id = auth.uid()
      AND tenant_id = _tenant_id
      AND status = 'active'
      AND 'licensing' = ANY(allowed_contexts)
  )
$$;

CREATE OR REPLACE FUNCTION public.can_access_publishing_context(_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_memberships
    WHERE user_id = auth.uid()
      AND tenant_id = _tenant_id
      AND status = 'active'
      AND 'publishing' = ANY(allowed_contexts)
  )
$$;

-- ----------------------------
-- 6) LICENSING MODULE RLS POLICIES
-- Platform admins: full access
-- Tenant admins with licensing context: full access
-- Active members with licensing context: read-only
-- ----------------------------

-- licensing_requests: SELECT
CREATE POLICY "Platform admins can view all licensing requests"
  ON public.licensing_requests FOR SELECT
  USING (is_platform_admin(auth.uid()));

CREATE POLICY "Tenant members with licensing context can view requests"
  ON public.licensing_requests FOR SELECT
  USING (can_access_licensing_context(tenant_id));

-- licensing_requests: INSERT
CREATE POLICY "Platform admins can create licensing requests"
  ON public.licensing_requests FOR INSERT
  WITH CHECK (is_platform_admin(auth.uid()));

CREATE POLICY "Tenant admins with licensing context can create requests"
  ON public.licensing_requests FOR INSERT
  WITH CHECK (is_tenant_admin(auth.uid(), tenant_id) AND can_access_licensing_context(tenant_id));

-- licensing_requests: UPDATE
CREATE POLICY "Platform admins can update licensing requests"
  ON public.licensing_requests FOR UPDATE
  USING (is_platform_admin(auth.uid()));

CREATE POLICY "Tenant admins with licensing context can update requests"
  ON public.licensing_requests FOR UPDATE
  USING (is_tenant_admin(auth.uid(), tenant_id) AND can_access_licensing_context(tenant_id));

-- licensing_requests: DELETE
CREATE POLICY "Platform admins can delete licensing requests"
  ON public.licensing_requests FOR DELETE
  USING (is_platform_admin(auth.uid()));

CREATE POLICY "Tenant admins with licensing context can delete requests"
  ON public.licensing_requests FOR DELETE
  USING (is_tenant_admin(auth.uid(), tenant_id) AND can_access_licensing_context(tenant_id));

-- licensing_agreements: SELECT
CREATE POLICY "Platform admins can view all licensing agreements"
  ON public.licensing_agreements FOR SELECT
  USING (is_platform_admin(auth.uid()));

CREATE POLICY "Tenant members with licensing context can view agreements"
  ON public.licensing_agreements FOR SELECT
  USING (can_access_licensing_context(tenant_id));

-- licensing_agreements: INSERT
CREATE POLICY "Platform admins can create licensing agreements"
  ON public.licensing_agreements FOR INSERT
  WITH CHECK (is_platform_admin(auth.uid()));

CREATE POLICY "Tenant admins with licensing context can create agreements"
  ON public.licensing_agreements FOR INSERT
  WITH CHECK (is_tenant_admin(auth.uid(), tenant_id) AND can_access_licensing_context(tenant_id));

-- licensing_agreements: UPDATE
CREATE POLICY "Platform admins can update licensing agreements"
  ON public.licensing_agreements FOR UPDATE
  USING (is_platform_admin(auth.uid()));

CREATE POLICY "Tenant admins with licensing context can update agreements"
  ON public.licensing_agreements FOR UPDATE
  USING (is_tenant_admin(auth.uid(), tenant_id) AND can_access_licensing_context(tenant_id));

-- licensing_agreements: DELETE
CREATE POLICY "Platform admins can delete licensing agreements"
  ON public.licensing_agreements FOR DELETE
  USING (is_platform_admin(auth.uid()));

CREATE POLICY "Tenant admins with licensing context can delete agreements"
  ON public.licensing_agreements FOR DELETE
  USING (is_tenant_admin(auth.uid(), tenant_id) AND can_access_licensing_context(tenant_id));

-- ----------------------------
-- 7) CLIENT PORTAL MODULE RLS POLICIES
-- Platform admins: full access
-- Tenant admins with publishing context: full access
-- Active members with publishing context: read-only
-- ----------------------------

-- portal_documents: SELECT
CREATE POLICY "Platform admins can view all portal documents"
  ON public.portal_documents FOR SELECT
  USING (is_platform_admin(auth.uid()));

CREATE POLICY "Tenant members with publishing context can view documents"
  ON public.portal_documents FOR SELECT
  USING (can_access_publishing_context(tenant_id));

-- portal_documents: INSERT/UPDATE/DELETE (admin only)
CREATE POLICY "Platform admins can manage portal documents"
  ON public.portal_documents FOR ALL
  USING (is_platform_admin(auth.uid()))
  WITH CHECK (is_platform_admin(auth.uid()));

CREATE POLICY "Tenant admins with publishing context can manage documents"
  ON public.portal_documents FOR ALL
  USING (is_tenant_admin(auth.uid(), tenant_id) AND can_access_publishing_context(tenant_id))
  WITH CHECK (is_tenant_admin(auth.uid(), tenant_id) AND can_access_publishing_context(tenant_id));

-- portal_statements: SELECT
CREATE POLICY "Platform admins can view all portal statements"
  ON public.portal_statements FOR SELECT
  USING (is_platform_admin(auth.uid()));

CREATE POLICY "Tenant members with publishing context can view statements"
  ON public.portal_statements FOR SELECT
  USING (can_access_publishing_context(tenant_id));

-- portal_statements: INSERT/UPDATE/DELETE (admin only)
CREATE POLICY "Platform admins can manage portal statements"
  ON public.portal_statements FOR ALL
  USING (is_platform_admin(auth.uid()))
  WITH CHECK (is_platform_admin(auth.uid()));

CREATE POLICY "Tenant admins with publishing context can manage statements"
  ON public.portal_statements FOR ALL
  USING (is_tenant_admin(auth.uid(), tenant_id) AND can_access_publishing_context(tenant_id))
  WITH CHECK (is_tenant_admin(auth.uid(), tenant_id) AND can_access_publishing_context(tenant_id));

-- portal_agreements: SELECT
CREATE POLICY "Platform admins can view all portal agreements"
  ON public.portal_agreements FOR SELECT
  USING (is_platform_admin(auth.uid()));

CREATE POLICY "Tenant members with publishing context can view portal agreements"
  ON public.portal_agreements FOR SELECT
  USING (can_access_publishing_context(tenant_id));

-- portal_agreements: INSERT/UPDATE/DELETE (admin only)
CREATE POLICY "Platform admins can manage portal agreements"
  ON public.portal_agreements FOR ALL
  USING (is_platform_admin(auth.uid()))
  WITH CHECK (is_platform_admin(auth.uid()));

CREATE POLICY "Tenant admins with publishing context can manage portal agreements"
  ON public.portal_agreements FOR ALL
  USING (is_tenant_admin(auth.uid(), tenant_id) AND can_access_publishing_context(tenant_id))
  WITH CHECK (is_tenant_admin(auth.uid(), tenant_id) AND can_access_publishing_context(tenant_id));

-- =========================================================
-- END PHASE 7
-- =========================================================