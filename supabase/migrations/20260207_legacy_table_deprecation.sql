-- ============================================================================
-- SCHEMA CLEANUP MIGRATION: Legacy Table Deprecation
-- 
-- Purpose: Mark legacy tables as deprecated, migrate missing columns to
-- canonical tables, and update the one page that still queries legacy tables.
--
-- Legacy tables affected:
--   articles        → superseded by help_articles
--   categories      → superseded by help_categories  
--   messages        → superseded by support_tickets + ticket_messages
--   searches        → superseded by search_query_log
--   chat_conversations → deprecated (widget era)
--   chat_messages      → deprecated (widget era)
--   widget_settings    → deprecated (widget era)
--
-- Strategy: Do NOT drop tables yet. Add deprecation comments, migrate
-- any missing columns to canonical tables.
-- ============================================================================

-- ============================================================================
-- STEP 1: Add missing analytics columns to help_articles
-- (migrating helpful_count and not_helpful_count from legacy 'articles')
-- ============================================================================

ALTER TABLE public.help_articles 
  ADD COLUMN IF NOT EXISTS helpful_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS not_helpful_count integer DEFAULT 0;

COMMENT ON COLUMN public.help_articles.helpful_count IS 'Count of "helpful" votes. Migrated from legacy articles table.';
COMMENT ON COLUMN public.help_articles.not_helpful_count IS 'Count of "not helpful" votes. Migrated from legacy articles table.';

-- ============================================================================
-- STEP 2: Add search_query tracking to support_tickets
-- (migrating search context from legacy 'messages')
-- ============================================================================

ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS search_query text,
  ADD COLUMN IF NOT EXISTS searched_articles jsonb;

COMMENT ON COLUMN public.support_tickets.search_query IS 'Search query that led to this ticket (if user searched before submitting). Migrated from legacy messages table.';
COMMENT ON COLUMN public.support_tickets.searched_articles IS 'Articles shown to user before they submitted this ticket. Migrated from legacy messages table.';

-- ============================================================================
-- STEP 3: Mark all legacy tables with deprecation comments
-- ============================================================================

COMMENT ON TABLE public.articles IS 
  'DEPRECATED — Superseded by help_articles. From help widget era (migration 1). Do NOT use for new features. Drop candidate after data migration.';

COMMENT ON TABLE public.categories IS 
  'DEPRECATED — Superseded by help_categories. From help widget era (migration 1). Do NOT use for new features. Drop candidate after data migration.';

COMMENT ON TABLE public.messages IS 
  'DEPRECATED — Superseded by support_tickets + ticket_messages. From help widget contact form era. Do NOT use for new features. Drop candidate after data migration.';

COMMENT ON TABLE public.searches IS 
  'DEPRECATED — Superseded by search_query_log. From help widget search tracking. Do NOT use for new features. Drop candidate.';

COMMENT ON TABLE public.chat_conversations IS 
  'DEPRECATED — From help widget AI chat era. Do NOT use for new features. Drop candidate.';

COMMENT ON TABLE public.chat_messages IS 
  'DEPRECATED — From help widget AI chat era. Do NOT use for new features. Drop candidate.';

COMMENT ON TABLE public.widget_settings IS 
  'DEPRECATED — From help widget era. Not used by current Help Workstation. Drop candidate.';

-- ============================================================================
-- STEP 4: Migrate existing analytics data from articles → help_articles
-- (Only if there are matching articles by slug)
-- ============================================================================

UPDATE public.help_articles ha
SET 
  helpful_count = COALESCE(a.helpful_count, 0),
  not_helpful_count = COALESCE(a.not_helpful_count, 0)
FROM public.articles a
WHERE ha.slug = a.slug
  AND (a.helpful_count > 0 OR a.not_helpful_count > 0);

-- ============================================================================
-- STEP 5: Verify migration
-- ============================================================================

SELECT 'Legacy tables marked as deprecated' AS status;
SELECT 'help_articles now has helpful_count and not_helpful_count columns' AS status;
SELECT 'support_tickets now has search_query and searched_articles columns' AS status;

-- Show data migration results
SELECT 
  'Articles analytics migrated' AS status,
  COUNT(*) FILTER (WHERE helpful_count > 0 OR not_helpful_count > 0) AS articles_with_votes,
  COUNT(*) AS total_help_articles
FROM public.help_articles;

-- ============================================================================
-- POST-MIGRATION: After applying this SQL, also:
-- 1. Regenerate Supabase types (types.ts)
-- 2. Update HelpAnalyticsPage.tsx to query help_articles + support_tickets
-- 3. Deploy and verify
-- 4. In a future migration: DROP legacy tables after confirming no traffic
-- ============================================================================
