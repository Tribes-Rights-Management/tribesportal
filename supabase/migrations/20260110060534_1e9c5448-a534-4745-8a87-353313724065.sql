-- ============================================
-- TRIBES WORLD-CLASS TENANT RLS MODEL
-- Complete implementation with all templates
-- ============================================

-- ============================================
-- PART 1: LICENSING TABLES (Template L)
-- ============================================

-- License Requests table
CREATE TABLE IF NOT EXISTS public.license_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  requester_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'denied', 'cancelled')),
  work_ids uuid[] DEFAULT '{}',
  usage_type text,
  territory text,
  term_start date,
  term_end date,
  fee_proposed numeric(12,2),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Licenses table (issued licenses)
CREATE TABLE IF NOT EXISTS public.licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  license_request_id uuid REFERENCES public.license_requests(id),
  licensee_name text NOT NULL,
  licensee_email text,
  work_ids uuid[] DEFAULT '{}',
  usage_type text NOT NULL,
  territory text NOT NULL DEFAULT 'Worldwide',
  term_start date NOT NULL,
  term_end date,
  fee numeric(12,2),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'expired', 'terminated', 'suspended')),
  document_url text,
  notes text,
  issued_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on Licensing tables
ALTER TABLE public.license_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- Template L: License Requests policies
CREATE POLICY "license_requests_select_active_member"
ON public.license_requests FOR SELECT
USING (public.is_active_member(tenant_id));

CREATE POLICY "license_requests_insert_licensing_roles"
ON public.license_requests FOR INSERT
WITH CHECK (
  public.has_any_tenant_role(tenant_id, ARRAY['licensing_user', 'publishing_admin', 'tenant_owner', 'internal_admin']::portal_role[])
);

CREATE POLICY "license_requests_update_admin_roles"
ON public.license_requests FOR UPDATE
USING (
  public.has_any_tenant_role(tenant_id, ARRAY['publishing_admin', 'tenant_owner', 'internal_admin']::portal_role[])
)
WITH CHECK (
  public.has_any_tenant_role(tenant_id, ARRAY['publishing_admin', 'tenant_owner', 'internal_admin']::portal_role[])
);

CREATE POLICY "license_requests_delete_internal"
ON public.license_requests FOR DELETE
USING (
  public.has_any_tenant_role(tenant_id, ARRAY['tenant_owner', 'internal_admin']::portal_role[])
);

-- Template L: Licenses policies
CREATE POLICY "licenses_select_active_member"
ON public.licenses FOR SELECT
USING (public.is_active_member(tenant_id));

CREATE POLICY "licenses_insert_admin_roles"
ON public.licenses FOR INSERT
WITH CHECK (
  public.has_any_tenant_role(tenant_id, ARRAY['publishing_admin', 'tenant_owner', 'internal_admin']::portal_role[])
);

CREATE POLICY "licenses_update_admin_roles"
ON public.licenses FOR UPDATE
USING (
  public.has_any_tenant_role(tenant_id, ARRAY['publishing_admin', 'tenant_owner', 'internal_admin']::portal_role[])
)
WITH CHECK (
  public.has_any_tenant_role(tenant_id, ARRAY['publishing_admin', 'tenant_owner', 'internal_admin']::portal_role[])
);

CREATE POLICY "licenses_delete_internal"
ON public.licenses FOR DELETE
USING (
  public.has_any_tenant_role(tenant_id, ARRAY['tenant_owner', 'internal_admin']::portal_role[])
);

-- ============================================
-- PART 2: PUBLISHING TABLES (Template P)
-- ============================================

-- Works / Compositions table
CREATE TABLE IF NOT EXISTS public.works (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  title text NOT NULL,
  alternate_titles text[],
  iswc text,
  duration_seconds integer,
  language text,
  genre text,
  release_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived', 'disputed')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Splits / Ownership table
CREATE TABLE IF NOT EXISTS public.splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  work_id uuid NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  party_name text NOT NULL,
  party_role text NOT NULL CHECK (party_role IN ('writer', 'publisher', 'administrator', 'sub_publisher')),
  ownership_percentage numeric(5,2) NOT NULL CHECK (ownership_percentage >= 0 AND ownership_percentage <= 100),
  ipi_number text,
  pro_affiliation text,
  effective_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Registrations table
CREATE TABLE IF NOT EXISTS public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  work_id uuid NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  society_code text NOT NULL,
  registration_number text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'registered', 'rejected', 'withdrawn')),
  submitted_at timestamptz,
  confirmed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Statements table
CREATE TABLE IF NOT EXISTS public.statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  period_start date NOT NULL,
  period_end date NOT NULL,
  source text NOT NULL,
  gross_amount numeric(14,2) NOT NULL DEFAULT 0,
  net_amount numeric(14,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'finalized', 'paid')),
  document_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  statement_id uuid REFERENCES public.statements(id),
  payee_name text NOT NULL,
  amount numeric(14,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  payment_method text,
  reference_number text,
  paid_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on Publishing tables
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Helper: Publishing-capable roles (not licensing-only users)
CREATE OR REPLACE FUNCTION public.has_publishing_access(p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_any_tenant_role(p_tenant_id, ARRAY['publishing_admin', 'tenant_owner', 'internal_admin', 'read_only']::portal_role[]);
$$;

-- Template P: Works policies
CREATE POLICY "works_select_publishing_roles"
ON public.works FOR SELECT
USING (public.has_publishing_access(tenant_id));

CREATE POLICY "works_insert_publishing_admin"
ON public.works FOR INSERT
WITH CHECK (
  public.has_any_tenant_role(tenant_id, ARRAY['publishing_admin', 'tenant_owner', 'internal_admin']::portal_role[])
);

CREATE POLICY "works_update_publishing_admin"
ON public.works FOR UPDATE
USING (
  public.has_any_tenant_role(tenant_id, ARRAY['publishing_admin', 'tenant_owner', 'internal_admin']::portal_role[])
)
WITH CHECK (
  public.has_any_tenant_role(tenant_id, ARRAY['publishing_admin', 'tenant_owner', 'internal_admin']::portal_role[])
);

CREATE POLICY "works_delete_owner_internal"
ON public.works FOR DELETE
USING (
  public.has_any_tenant_role(tenant_id, ARRAY['tenant_owner', 'internal_admin']::portal_role[])
);

-- Template P: Splits policies
CREATE POLICY "splits_select_publishing_roles"
ON public.splits FOR SELECT
USING (public.has_publishing_access(tenant_id));

CREATE POLICY "splits_insert_publishing_admin"
ON public.splits FOR INSERT
WITH CHECK (
  public.has_any_tenant_role(tenant_id, ARRAY['publishing_admin', 'tenant_owner', 'internal_admin']::portal_role[])
);

CREATE POLICY "splits_update_publishing_admin"
ON public.splits FOR UPDATE
USING (
  public.has_any_tenant_role(tenant_id, ARRAY['publishing_admin', 'tenant_owner', 'internal_admin']::portal_role[])
)
WITH CHECK (
  public.has_any_tenant_role(tenant_id, ARRAY['publishing_admin', 'tenant_owner', 'internal_admin']::portal_role[])
);

CREATE POLICY "splits_delete_owner_internal"
ON public.splits FOR DELETE
USING (
  public.has_any_tenant_role(tenant_id, ARRAY['tenant_owner', 'internal_admin']::portal_role[])
);

-- Template P: Registrations policies
CREATE POLICY "registrations_select_publishing_roles"
ON public.registrations FOR SELECT
USING (public.has_publishing_access(tenant_id));

CREATE POLICY "registrations_insert_publishing_admin"
ON public.registrations FOR INSERT
WITH CHECK (
  public.has_any_tenant_role(tenant_id, ARRAY['publishing_admin', 'tenant_owner', 'internal_admin']::portal_role[])
);

CREATE POLICY "registrations_update_publishing_admin"
ON public.registrations FOR UPDATE
USING (
  public.has_any_tenant_role(tenant_id, ARRAY['publishing_admin', 'tenant_owner', 'internal_admin']::portal_role[])
)
WITH CHECK (
  public.has_any_tenant_role(tenant_id, ARRAY['publishing_admin', 'tenant_owner', 'internal_admin']::portal_role[])
);

CREATE POLICY "registrations_delete_owner_internal"
ON public.registrations FOR DELETE
USING (
  public.has_any_tenant_role(tenant_id, ARRAY['tenant_owner', 'internal_admin']::portal_role[])
);

-- Template P: Statements policies
CREATE POLICY "statements_select_publishing_roles"
ON public.statements FOR SELECT
USING (public.has_publishing_access(tenant_id));

CREATE POLICY "statements_insert_publishing_admin"
ON public.statements FOR INSERT
WITH CHECK (
  public.has_any_tenant_role(tenant_id, ARRAY['publishing_admin', 'tenant_owner', 'internal_admin']::portal_role[])
);

CREATE POLICY "statements_update_publishing_admin"
ON public.statements FOR UPDATE
USING (
  public.has_any_tenant_role(tenant_id, ARRAY['publishing_admin', 'tenant_owner', 'internal_admin']::portal_role[])
)
WITH CHECK (
  public.has_any_tenant_role(tenant_id, ARRAY['publishing_admin', 'tenant_owner', 'internal_admin']::portal_role[])
);

CREATE POLICY "statements_delete_owner_internal"
ON public.statements FOR DELETE
USING (
  public.has_any_tenant_role(tenant_id, ARRAY['tenant_owner', 'internal_admin']::portal_role[])
);

-- Template P: Payments policies
CREATE POLICY "payments_select_publishing_roles"
ON public.payments FOR SELECT
USING (public.has_publishing_access(tenant_id));

CREATE POLICY "payments_insert_publishing_admin"
ON public.payments FOR INSERT
WITH CHECK (
  public.has_any_tenant_role(tenant_id, ARRAY['publishing_admin', 'tenant_owner', 'internal_admin']::portal_role[])
);

CREATE POLICY "payments_update_publishing_admin"
ON public.payments FOR UPDATE
USING (
  public.has_any_tenant_role(tenant_id, ARRAY['publishing_admin', 'tenant_owner', 'internal_admin']::portal_role[])
)
WITH CHECK (
  public.has_any_tenant_role(tenant_id, ARRAY['publishing_admin', 'tenant_owner', 'internal_admin']::portal_role[])
);

CREATE POLICY "payments_delete_owner_internal"
ON public.payments FOR DELETE
USING (
  public.has_any_tenant_role(tenant_id, ARRAY['tenant_owner', 'internal_admin']::portal_role[])
);

-- ============================================
-- PART 3: SHARED TABLES (Template S)
-- ============================================

-- Documents table (shared across contexts)
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  title text NOT NULL,
  description text,
  document_type text NOT NULL DEFAULT 'general' CHECK (document_type IN ('contract', 'license', 'statement', 'tax', 'correspondence', 'general')),
  file_url text,
  file_size_bytes bigint,
  mime_type text,
  context text CHECK (context IN ('licensing', 'publishing', 'shared')),
  related_entity_type text,
  related_entity_id uuid,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tenant Notes table
CREATE TABLE IF NOT EXISTS public.tenant_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  author_id uuid NOT NULL,
  title text,
  content text NOT NULL,
  visibility text NOT NULL DEFAULT 'internal' CHECK (visibility IN ('internal', 'shared')),
  pinned boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on Shared tables
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_notes ENABLE ROW LEVEL SECURITY;

-- Template S: Documents policies
CREATE POLICY "documents_select_active_member"
ON public.documents FOR SELECT
USING (public.is_active_member(tenant_id));

CREATE POLICY "documents_insert_privileged"
ON public.documents FOR INSERT
WITH CHECK (
  public.has_any_tenant_role(tenant_id, ARRAY['publishing_admin', 'tenant_owner', 'internal_admin']::portal_role[])
);

CREATE POLICY "documents_update_privileged"
ON public.documents FOR UPDATE
USING (
  public.has_any_tenant_role(tenant_id, ARRAY['publishing_admin', 'tenant_owner', 'internal_admin']::portal_role[])
)
WITH CHECK (
  public.has_any_tenant_role(tenant_id, ARRAY['publishing_admin', 'tenant_owner', 'internal_admin']::portal_role[])
);

CREATE POLICY "documents_delete_owner_internal"
ON public.documents FOR DELETE
USING (
  public.has_any_tenant_role(tenant_id, ARRAY['tenant_owner', 'internal_admin']::portal_role[])
);

-- Template S: Tenant Notes policies
CREATE POLICY "tenant_notes_select_active_member"
ON public.tenant_notes FOR SELECT
USING (public.is_active_member(tenant_id));

CREATE POLICY "tenant_notes_insert_privileged"
ON public.tenant_notes FOR INSERT
WITH CHECK (
  public.has_any_tenant_role(tenant_id, ARRAY['publishing_admin', 'tenant_owner', 'internal_admin']::portal_role[])
);

CREATE POLICY "tenant_notes_update_privileged"
ON public.tenant_notes FOR UPDATE
USING (
  public.has_any_tenant_role(tenant_id, ARRAY['publishing_admin', 'tenant_owner', 'internal_admin']::portal_role[])
)
WITH CHECK (
  public.has_any_tenant_role(tenant_id, ARRAY['publishing_admin', 'tenant_owner', 'internal_admin']::portal_role[])
);

CREATE POLICY "tenant_notes_delete_owner_internal"
ON public.tenant_notes FOR DELETE
USING (
  public.has_any_tenant_role(tenant_id, ARRAY['tenant_owner', 'internal_admin']::portal_role[])
);

-- ============================================
-- PART 4: UPDATE TRIGGERS
-- ============================================

-- Add updated_at triggers to all new tables
CREATE TRIGGER update_license_requests_updated_at
  BEFORE UPDATE ON public.license_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_licenses_updated_at
  BEFORE UPDATE ON public.licenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_works_updated_at
  BEFORE UPDATE ON public.works
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_splits_updated_at
  BEFORE UPDATE ON public.splits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_statements_updated_at
  BEFORE UPDATE ON public.statements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tenant_notes_updated_at
  BEFORE UPDATE ON public.tenant_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- PART 5: CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_license_requests_tenant ON public.license_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_licenses_tenant ON public.licenses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_works_tenant ON public.works(tenant_id);
CREATE INDEX IF NOT EXISTS idx_splits_tenant ON public.splits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_splits_work ON public.splits(work_id);
CREATE INDEX IF NOT EXISTS idx_registrations_tenant ON public.registrations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_registrations_work ON public.registrations(work_id);
CREATE INDEX IF NOT EXISTS idx_statements_tenant ON public.statements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant ON public.payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_documents_tenant ON public.documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_notes_tenant ON public.tenant_notes(tenant_id);