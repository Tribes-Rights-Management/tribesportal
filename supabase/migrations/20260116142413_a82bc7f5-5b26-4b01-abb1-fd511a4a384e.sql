-- Create disclosure export type enum
CREATE TYPE public.disclosure_export_type AS ENUM (
  'licensing_activity',
  'approval_history', 
  'agreement_registry'
);

-- Create disclosure export status enum
CREATE TYPE public.disclosure_export_status AS ENUM (
  'generating',
  'completed',
  'failed'
);

-- Create disclosure_exports table
CREATE TABLE public.disclosure_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  export_type disclosure_export_type NOT NULL,
  status disclosure_export_status NOT NULL DEFAULT 'generating',
  generated_by UUID NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  watermark TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  parameters JSONB NOT NULL DEFAULT '{}',
  record_count INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.disclosure_exports ENABLE ROW LEVEL SECURITY;

-- Platform admins can do everything
CREATE POLICY "Platform admins can manage disclosure exports"
ON public.disclosure_exports
FOR ALL
USING (is_platform_admin(auth.uid()))
WITH CHECK (is_platform_admin(auth.uid()));

-- External auditors can view completed exports only
CREATE POLICY "External auditors can view completed exports"
ON public.disclosure_exports
FOR SELECT
USING (
  is_external_auditor(auth.uid()) 
  AND status = 'completed'
);

-- Create index for faster queries
CREATE INDEX idx_disclosure_exports_type ON public.disclosure_exports(export_type);
CREATE INDEX idx_disclosure_exports_status ON public.disclosure_exports(status);
CREATE INDEX idx_disclosure_exports_generated_at ON public.disclosure_exports(generated_at DESC);

-- Add comment for documentation
COMMENT ON TABLE public.disclosure_exports IS 'Regulatory disclosure export packs with locked schemas. Exports are immutable once generated.';