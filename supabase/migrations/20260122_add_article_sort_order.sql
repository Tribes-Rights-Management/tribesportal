-- Add sort_order column to help_articles for manual ordering within categories
ALTER TABLE public.help_articles
ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

-- Create index for efficient sorting
CREATE INDEX IF NOT EXISTS idx_help_articles_sort_order
ON public.help_articles(category_id, sort_order, created_at);

-- Initialize existing articles with sort_order based on creation date within each category
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY created_at) * 10 as new_order
  FROM public.help_articles
)
UPDATE public.help_articles a
SET sort_order = r.new_order
FROM ranked r
WHERE a.id = r.id;

COMMENT ON COLUMN public.help_articles.sort_order IS 'Manual sort order within category. Lower numbers appear first.';
