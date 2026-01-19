-- HELP ARTICLE APPROVALS — DORMANT INFRASTRUCTURE
-- 
-- PURPOSE: Preparatory schema for future approval workflow
-- STATUS: INACTIVE — Do not activate without explicit instruction
-- 
-- This adds optional approval metadata fields to help_article_versions.
-- Publishing proceeds immediately regardless of these fields.
-- No enforcement, no blocking, no approval queue.
--
-- AUTHORITY MODEL (when activated):
-- - Platform Executives are approvers
-- - Tribes Admins are authors
-- - No cross-org approvals

-- Add optional approval metadata fields to help_article_versions
ALTER TABLE public.help_article_versions
ADD COLUMN IF NOT EXISTS requires_approval boolean NOT NULL DEFAULT false;

ALTER TABLE public.help_article_versions
ADD COLUMN IF NOT EXISTS approved_at timestamptz NULL;

ALTER TABLE public.help_article_versions
ADD COLUMN IF NOT EXISTS approved_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add approval_notes for future use (audit trail)
ALTER TABLE public.help_article_versions
ADD COLUMN IF NOT EXISTS approval_notes text NULL;

-- Index for future approval queries (dormant)
CREATE INDEX IF NOT EXISTS idx_help_article_versions_requires_approval 
ON public.help_article_versions(requires_approval) 
WHERE requires_approval = true;

-- Comment on columns for documentation
COMMENT ON COLUMN public.help_article_versions.requires_approval IS 
  'DORMANT: When true, version should require approval before publishing. NOT ENFORCED.';

COMMENT ON COLUMN public.help_article_versions.approved_at IS 
  'DORMANT: Timestamp of approval. NOT ENFORCED — publishing proceeds regardless.';

COMMENT ON COLUMN public.help_article_versions.approved_by IS 
  'DORMANT: User ID of approver. NOT ENFORCED — publishing proceeds regardless.';

COMMENT ON COLUMN public.help_article_versions.approval_notes IS 
  'DORMANT: Optional notes from approver. NOT ENFORCED.';