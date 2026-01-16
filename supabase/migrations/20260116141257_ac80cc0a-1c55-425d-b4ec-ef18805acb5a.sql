-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 8 (Part 1): Add external_auditor to platform_role enum
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TYPE public.platform_role ADD VALUE IF NOT EXISTS 'external_auditor';