-- ═══════════════════════════════════════════════════════════════════════════
-- BILLING ↔ CONTRACTS LINEAGE SCHEMA
-- Financial + Legal Integrity: Every dollar traces to a governing agreement
-- ═══════════════════════════════════════════════════════════════════════════

-- Contract Status Enum
DO $$ BEGIN
  CREATE TYPE contract_status AS ENUM ('draft', 'active', 'amended', 'terminated', 'expired');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Invoice Status Enum
DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM ('draft', 'open', 'paid', 'void', 'uncollectible');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Payment Status Enum
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded', 'partially_refunded');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Refund Reason Enum
DO $$ BEGIN
  CREATE TYPE refund_reason AS ENUM ('duplicate', 'fraudulent', 'requested_by_customer', 'service_not_provided', 'other');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Data Room Export Type Enum
DO $$ BEGIN
  CREATE TYPE data_room_export_type AS ENUM (
    'authority_governance',
    'contracts_amendments',
    'billing_payments',
    'licensing_activity',
    'messaging_transcripts'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- CONTRACTS TABLE (Governing Agreements)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Contract Identity
  contract_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Versioning (immutable lineage)
  version INTEGER NOT NULL DEFAULT 1,
  version_hash TEXT NOT NULL, -- SHA-256 of contract content for integrity
  parent_contract_id UUID REFERENCES public.contracts(id), -- For amendments
  
  -- Status & Dates
  status contract_status NOT NULL DEFAULT 'draft',
  effective_date DATE,
  expiration_date DATE,
  terminated_at TIMESTAMPTZ,
  
  -- Document Reference
  document_url TEXT,
  
  -- Audit
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Correlation
  correlation_id TEXT,
  
  CONSTRAINT contracts_number_tenant_unique UNIQUE (tenant_id, contract_number, version)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- INVOICES TABLE (Must reference a contract)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Contract Lineage (MANDATORY)
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE RESTRICT,
  contract_version_hash TEXT NOT NULL, -- Snapshot of contract version at invoice time
  
  -- Invoice Identity
  invoice_number TEXT NOT NULL,
  status invoice_status NOT NULL DEFAULT 'draft',
  
  -- Amounts
  subtotal_amount INTEGER NOT NULL, -- In cents
  tax_amount INTEGER NOT NULL DEFAULT 0,
  total_amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Dates
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  voided_at TIMESTAMPTZ,
  
  -- Description
  description TEXT,
  notes TEXT,
  
  -- External Provider Reference (Stripe, etc.)
  provider_invoice_id TEXT,
  
  -- Audit
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Correlation
  correlation_id TEXT,
  
  CONSTRAINT invoices_number_tenant_unique UNIQUE (tenant_id, invoice_number)
);

-- Invoice Line Items
CREATE TABLE IF NOT EXISTS public.invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_amount INTEGER NOT NULL, -- In cents
  amount INTEGER NOT NULL, -- quantity * unit_amount
  
  -- Reference to licensed item if applicable
  license_id UUID,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- PAYMENTS TABLE (Must reference an invoice)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Invoice Lineage (MANDATORY)
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE RESTRICT,
  
  -- Payment Details
  amount INTEGER NOT NULL, -- In cents
  currency TEXT NOT NULL DEFAULT 'USD',
  status payment_status NOT NULL DEFAULT 'pending',
  
  -- Payment Method
  payment_method_type TEXT, -- card, bank_account, etc.
  payment_method_last4 TEXT,
  
  -- External Provider Reference
  provider_payment_id TEXT,
  provider_charge_id TEXT,
  
  -- Timestamps
  processed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Correlation
  correlation_id TEXT
);

-- ═══════════════════════════════════════════════════════════════════════════
-- REFUNDS TABLE (Must trace back through payment → invoice → contract)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Payment Lineage (MANDATORY)
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE RESTRICT,
  
  -- Refund Details
  amount INTEGER NOT NULL, -- In cents
  currency TEXT NOT NULL DEFAULT 'USD',
  reason refund_reason NOT NULL,
  reason_description TEXT,
  
  -- Status
  status payment_status NOT NULL DEFAULT 'pending',
  
  -- External Provider Reference
  provider_refund_id TEXT,
  
  -- Authority (Platform Executive only)
  issued_by UUID NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Correlation
  correlation_id TEXT
);

-- ═══════════════════════════════════════════════════════════════════════════
-- DATA ROOM EXPORTS TABLE
-- Formal, immutable disclosure packages
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.data_room_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Export Definition
  export_type data_room_export_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Scope
  scope_type TEXT NOT NULL CHECK (scope_type IN ('platform', 'organization')),
  organization_id UUID REFERENCES public.tenants(id),
  
  -- Time Bounds
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Content Manifest (list of included record types and counts)
  content_manifest JSONB NOT NULL DEFAULT '{}',
  
  -- Generated File
  file_url TEXT,
  file_hash TEXT, -- SHA-256 for integrity
  file_size_bytes BIGINT,
  
  -- Status
  status disclosure_export_status NOT NULL DEFAULT 'generating',
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Access Control
  assigned_auditors UUID[] DEFAULT '{}',
  access_expires_at TIMESTAMPTZ,
  
  -- Audit Trail
  requested_by UUID NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  watermark TEXT NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Data Room Access Log (who accessed what)
CREATE TABLE IF NOT EXISTS public.data_room_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  export_id UUID NOT NULL REFERENCES public.data_room_exports(id) ON DELETE CASCADE,
  
  accessed_by UUID NOT NULL,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  access_type TEXT NOT NULL CHECK (access_type IN ('view', 'download')),
  ip_address INET,
  user_agent TEXT
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SEARCH INDEX TABLES (Scope-Safe Discovery)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.search_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Entity Reference
  entity_type TEXT NOT NULL, -- 'contract', 'invoice', 'payment', 'member', 'organization'
  entity_id UUID NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id), -- NULL for platform-level entities
  
  -- Searchable Content
  title TEXT NOT NULL,
  subtitle TEXT,
  content_summary TEXT, -- Indexed for full-text search
  
  -- Metadata
  entity_status TEXT,
  entity_date TIMESTAMPTZ,
  
  -- Search Vector
  search_vector TSVECTOR,
  
  -- Audit
  indexed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT search_index_entity_unique UNIQUE (entity_type, entity_id)
);

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_search_index_vector ON public.search_index USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_search_index_tenant ON public.search_index (tenant_id);
CREATE INDEX IF NOT EXISTS idx_search_index_type ON public.search_index (entity_type);

-- Search Query Log (metadata only, not content)
CREATE TABLE IF NOT EXISTS public.search_query_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID NOT NULL,
  scope_type TEXT NOT NULL CHECK (scope_type IN ('platform', 'organization')),
  scope_id UUID, -- tenant_id if org scope
  
  -- Query Metadata (not the actual query content for privacy)
  query_length INTEGER NOT NULL,
  result_count INTEGER NOT NULL,
  entity_types_searched TEXT[] NOT NULL,
  
  -- Timing
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_ms INTEGER
);

-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGERS FOR UPDATED_AT
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- SEARCH VECTOR UPDATE FUNCTION
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.subtitle, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.content_summary, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER search_index_vector_update
  BEFORE INSERT OR UPDATE ON public.search_index
  FOR EACH ROW
  EXECUTE FUNCTION update_search_vector();

-- ═══════════════════════════════════════════════════════════════════════════
-- AUTO-GENERATE CORRELATION IDS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TRIGGER auto_generate_contracts_correlation_id
  BEFORE INSERT ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_correlation_id();

CREATE TRIGGER auto_generate_invoices_correlation_id
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_correlation_id();

CREATE TRIGGER auto_generate_payments_correlation_id
  BEFORE INSERT ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_correlation_id();

CREATE TRIGGER auto_generate_refunds_correlation_id
  BEFORE INSERT ON public.refunds
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_correlation_id();

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_room_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_room_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_query_log ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════
-- CONTRACTS RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Platform admins can view all contracts
CREATE POLICY "Platform admins can view all contracts"
ON public.contracts FOR SELECT
USING (is_platform_admin(auth.uid()));

-- Platform admins can manage all contracts
CREATE POLICY "Platform admins can manage contracts"
ON public.contracts FOR ALL
USING (is_platform_admin(auth.uid()))
WITH CHECK (is_platform_admin(auth.uid()));

-- Tenant admins can view their org contracts
CREATE POLICY "Tenant admins can view org contracts"
ON public.contracts FOR SELECT
USING (is_tenant_admin(auth.uid(), tenant_id));

-- Tenant members can view their org contracts
CREATE POLICY "Tenant members can view contracts"
ON public.contracts FOR SELECT
USING (is_active_member(auth.uid(), tenant_id));

-- External auditors can view contracts
CREATE POLICY "External auditors can view contracts"
ON public.contracts FOR SELECT
USING (is_external_auditor(auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════════
-- INVOICES RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Platform admins can view all invoices
CREATE POLICY "Platform admins can view all invoices"
ON public.invoices FOR SELECT
USING (is_platform_admin(auth.uid()));

-- Platform admins can manage invoices
CREATE POLICY "Platform admins can manage invoices"
ON public.invoices FOR ALL
USING (is_platform_admin(auth.uid()))
WITH CHECK (is_platform_admin(auth.uid()));

-- Tenant admins can view their org invoices
CREATE POLICY "Tenant admins can view org invoices"
ON public.invoices FOR SELECT
USING (is_tenant_admin(auth.uid(), tenant_id));

-- Tenant members can view their org invoices
CREATE POLICY "Tenant members can view invoices"
ON public.invoices FOR SELECT
USING (is_active_member(auth.uid(), tenant_id));

-- External auditors can view invoices
CREATE POLICY "External auditors can view invoices"
ON public.invoices FOR SELECT
USING (is_external_auditor(auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════════
-- INVOICE LINE ITEMS RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Access through invoice relationship
CREATE POLICY "Access line items through invoice"
ON public.invoice_line_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_id
    AND (
      is_platform_admin(auth.uid()) OR
      is_tenant_admin(auth.uid(), i.tenant_id) OR
      is_active_member(auth.uid(), i.tenant_id) OR
      is_external_auditor(auth.uid())
    )
  )
);

-- Platform admins can manage line items
CREATE POLICY "Platform admins can manage line items"
ON public.invoice_line_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_id
    AND is_platform_admin(auth.uid())
  )
);

-- ═══════════════════════════════════════════════════════════════════════════
-- PAYMENTS RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Platform admins can view all payments
CREATE POLICY "Platform admins can view all payments"
ON public.payments FOR SELECT
USING (is_platform_admin(auth.uid()));

-- Platform admins can manage payments
CREATE POLICY "Platform admins can manage payments"
ON public.payments FOR ALL
USING (is_platform_admin(auth.uid()))
WITH CHECK (is_platform_admin(auth.uid()));

-- Tenant admins can view their org payments
CREATE POLICY "Tenant admins can view org payments"
ON public.payments FOR SELECT
USING (is_tenant_admin(auth.uid(), tenant_id));

-- Tenant members can view their org payments
CREATE POLICY "Tenant members can view payments"
ON public.payments FOR SELECT
USING (is_active_member(auth.uid(), tenant_id));

-- External auditors can view payments
CREATE POLICY "External auditors can view payments"
ON public.payments FOR SELECT
USING (is_external_auditor(auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════════
-- REFUNDS RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Only platform admins can view and manage refunds
CREATE POLICY "Platform admins can view refunds"
ON public.refunds FOR SELECT
USING (is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can issue refunds"
ON public.refunds FOR INSERT
WITH CHECK (is_platform_admin(auth.uid()));

-- External auditors can view refunds
CREATE POLICY "External auditors can view refunds"
ON public.refunds FOR SELECT
USING (is_external_auditor(auth.uid()));

-- No updates or deletes allowed on refunds (immutable)

-- ═══════════════════════════════════════════════════════════════════════════
-- DATA ROOM EXPORTS RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Platform admins can manage data room exports
CREATE POLICY "Platform admins can manage data room exports"
ON public.data_room_exports FOR ALL
USING (is_platform_admin(auth.uid()))
WITH CHECK (is_platform_admin(auth.uid()));

-- External auditors can view assigned exports
CREATE POLICY "Auditors can view assigned exports"
ON public.data_room_exports FOR SELECT
USING (
  is_external_auditor(auth.uid()) AND
  auth.uid() = ANY(assigned_auditors) AND
  status = 'completed' AND
  (access_expires_at IS NULL OR access_expires_at > now())
);

-- ═══════════════════════════════════════════════════════════════════════════
-- DATA ROOM ACCESS LOG RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Platform admins can view access logs
CREATE POLICY "Platform admins can view data room access logs"
ON public.data_room_access_log FOR SELECT
USING (is_platform_admin(auth.uid()));

-- Users can log their own access
CREATE POLICY "Users can log data room access"
ON public.data_room_access_log FOR INSERT
WITH CHECK (accessed_by = auth.uid());

-- ═══════════════════════════════════════════════════════════════════════════
-- SEARCH INDEX RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Platform admins can search all
CREATE POLICY "Platform admins can search all"
ON public.search_index FOR SELECT
USING (is_platform_admin(auth.uid()));

-- Platform admins can manage index
CREATE POLICY "Platform admins can manage search index"
ON public.search_index FOR ALL
USING (is_platform_admin(auth.uid()))
WITH CHECK (is_platform_admin(auth.uid()));

-- Tenant admins can search their org
CREATE POLICY "Tenant admins can search org"
ON public.search_index FOR SELECT
USING (tenant_id IS NOT NULL AND is_tenant_admin(auth.uid(), tenant_id));

-- Tenant members can search their org (limited types)
CREATE POLICY "Tenant members can search org"
ON public.search_index FOR SELECT
USING (
  tenant_id IS NOT NULL AND 
  is_active_member(auth.uid(), tenant_id) AND
  entity_type IN ('invoice', 'payment', 'contract')
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SEARCH QUERY LOG RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Platform admins can view all search logs
CREATE POLICY "Platform admins can view search logs"
ON public.search_query_log FOR SELECT
USING (is_platform_admin(auth.uid()));

-- Users can log their own searches
CREATE POLICY "Users can log searches"
ON public.search_query_log FOR INSERT
WITH CHECK (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- Get full lineage for a payment
CREATE OR REPLACE FUNCTION public.get_payment_lineage(p_payment_id UUID)
RETURNS TABLE (
  payment_id UUID,
  payment_amount INTEGER,
  payment_status payment_status,
  invoice_id UUID,
  invoice_number TEXT,
  invoice_amount INTEGER,
  contract_id UUID,
  contract_number TEXT,
  contract_version INTEGER,
  contract_version_hash TEXT,
  organization_id UUID,
  organization_name TEXT
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id as payment_id,
    p.amount as payment_amount,
    p.status as payment_status,
    i.id as invoice_id,
    i.invoice_number,
    i.total_amount as invoice_amount,
    c.id as contract_id,
    c.contract_number,
    c.version as contract_version,
    c.version_hash as contract_version_hash,
    t.id as organization_id,
    t.name as organization_name
  FROM public.payments p
  JOIN public.invoices i ON p.invoice_id = i.id
  JOIN public.contracts c ON i.contract_id = c.id
  JOIN public.tenants t ON c.tenant_id = t.id
  WHERE p.id = p_payment_id
    AND (
      is_platform_admin(auth.uid()) OR
      is_tenant_admin(auth.uid(), t.id) OR
      is_active_member(auth.uid(), t.id) OR
      is_external_auditor(auth.uid())
    )
$$;

-- Scope-safe search function
CREATE OR REPLACE FUNCTION public.search_entities(
  p_query TEXT,
  p_scope_type TEXT,
  p_tenant_id UUID DEFAULT NULL,
  p_entity_types TEXT[] DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  entity_type TEXT,
  entity_id UUID,
  title TEXT,
  subtitle TEXT,
  entity_status TEXT,
  entity_date TIMESTAMPTZ,
  rank REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_is_platform_admin BOOLEAN;
  v_query_id UUID;
  v_start_time TIMESTAMPTZ;
  v_result_count INTEGER;
BEGIN
  v_user_id := auth.uid();
  v_is_platform_admin := is_platform_admin(v_user_id);
  v_start_time := clock_timestamp();
  
  -- Scope validation
  IF p_scope_type = 'platform' AND NOT v_is_platform_admin THEN
    RAISE EXCEPTION 'Unauthorized: platform scope requires platform admin';
  END IF;
  
  IF p_scope_type = 'organization' AND p_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Organization scope requires tenant_id';
  END IF;
  
  IF p_scope_type = 'organization' AND NOT (
    v_is_platform_admin OR 
    is_tenant_admin(v_user_id, p_tenant_id) OR 
    is_active_member(v_user_id, p_tenant_id)
  ) THEN
    RAISE EXCEPTION 'Unauthorized: no access to organization';
  END IF;
  
  -- Execute search and return results
  RETURN QUERY
  SELECT 
    si.entity_type,
    si.entity_id,
    si.title,
    si.subtitle,
    si.entity_status,
    si.entity_date,
    ts_rank(si.search_vector, websearch_to_tsquery('english', p_query)) as rank
  FROM public.search_index si
  WHERE 
    si.search_vector @@ websearch_to_tsquery('english', p_query)
    AND (
      (p_scope_type = 'platform' AND v_is_platform_admin) OR
      (p_scope_type = 'organization' AND si.tenant_id = p_tenant_id)
    )
    AND (p_entity_types IS NULL OR si.entity_type = ANY(p_entity_types))
  ORDER BY rank DESC
  LIMIT p_limit;
  
  -- Log search query (metadata only)
  GET DIAGNOSTICS v_result_count = ROW_COUNT;
  
  INSERT INTO public.search_query_log (
    user_id, scope_type, scope_id, query_length, result_count, 
    entity_types_searched, duration_ms
  ) VALUES (
    v_user_id, p_scope_type, p_tenant_id, length(p_query), v_result_count,
    COALESCE(p_entity_types, ARRAY['all']),
    EXTRACT(MILLISECONDS FROM clock_timestamp() - v_start_time)::INTEGER
  );
END;
$$;