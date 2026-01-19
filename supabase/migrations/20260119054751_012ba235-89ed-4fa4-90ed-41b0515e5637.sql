-- HELP ARTICLE VERSIONING: APPEND-ONLY IMMUTABLE SYSTEM
-- This migration restructures help articles to use pointer-based versioning
-- where all content lives in an append-only versions table.

-- Step 1: Create the new help_article_versions table
CREATE TABLE IF NOT EXISTS public.help_article_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL,
  title text NOT NULL,
  summary text,
  body_md text NOT NULL,
  category_id uuid REFERENCES public.help_categories(id) ON DELETE SET NULL,
  visibility public.help_visibility NOT NULL DEFAULT 'public',
  tags text[] NOT NULL DEFAULT '{}',
  status public.help_article_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add foreign key after table exists (will add after altering help_articles)
-- This allows the article to reference versions

-- Step 2: Add version pointer columns to help_articles
-- First check if columns exist, if not add them
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'help_articles' 
    AND column_name = 'current_version_id'
  ) THEN
    ALTER TABLE public.help_articles ADD COLUMN current_version_id uuid;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'help_articles' 
    AND column_name = 'published_version_id'
  ) THEN
    ALTER TABLE public.help_articles ADD COLUMN published_version_id uuid;
  END IF;
END $$;

-- Step 3: Add foreign key constraint from help_article_versions to help_articles
ALTER TABLE public.help_article_versions 
  ADD CONSTRAINT fk_help_article_versions_article 
  FOREIGN KEY (article_id) REFERENCES public.help_articles(id) ON DELETE CASCADE;

-- Step 4: Add foreign key constraints for version pointers
ALTER TABLE public.help_articles 
  ADD CONSTRAINT fk_help_articles_current_version 
  FOREIGN KEY (current_version_id) REFERENCES public.help_article_versions(id);

ALTER TABLE public.help_articles 
  ADD CONSTRAINT fk_help_articles_published_version 
  FOREIGN KEY (published_version_id) REFERENCES public.help_article_versions(id);

-- Step 5: Migrate existing articles to versions table
-- For each article, create a version record and update the pointers
DO $$
DECLARE
  art RECORD;
  new_version_id uuid;
BEGIN
  FOR art IN SELECT * FROM public.help_articles LOOP
    -- Create version from current article data
    INSERT INTO public.help_article_versions (
      article_id, title, summary, body_md, category_id, visibility, tags, status, created_at, created_by
    ) VALUES (
      art.id, art.title, art.summary, art.body_md, art.category_id, art.visibility, art.tags, art.status, art.created_at, art.created_by
    ) RETURNING id INTO new_version_id;
    
    -- Update article with version pointers
    UPDATE public.help_articles SET 
      current_version_id = new_version_id,
      published_version_id = CASE WHEN art.status = 'published' THEN new_version_id ELSE NULL END
    WHERE id = art.id;
  END LOOP;
END $$;

-- Step 6: Enable RLS on versions table
ALTER TABLE public.help_article_versions ENABLE ROW LEVEL SECURITY;

-- Step 7: RLS Policies for help_article_versions
-- Only users with can_manage_help can insert versions (append-only)
CREATE POLICY "Help managers can insert versions"
ON public.help_article_versions
FOR INSERT
TO authenticated
WITH CHECK (
  public.can_manage_help(auth.uid()) 
  OR public.is_platform_admin(auth.uid())
);

-- Help managers can read all versions
CREATE POLICY "Help managers can read versions"
ON public.help_article_versions
FOR SELECT
TO authenticated
USING (
  public.can_manage_help(auth.uid()) 
  OR public.is_platform_admin(auth.uid())
);

-- NO UPDATE policy - versions are immutable
-- NO DELETE policy - versions cannot be deleted

-- Step 8: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_help_article_versions_article_id 
ON public.help_article_versions(article_id);

CREATE INDEX IF NOT EXISTS idx_help_article_versions_created_at 
ON public.help_article_versions(created_at DESC);

-- Step 9: Drop the old trigger that modifies articles in-place
DROP TRIGGER IF EXISTS trg_help_articles_append_revision ON public.help_articles;
DROP FUNCTION IF EXISTS public.append_help_revision();

-- Step 10: Create function to create a new version (append-only)
CREATE OR REPLACE FUNCTION public.create_help_article_version(
  _article_id uuid,
  _title text,
  _summary text,
  _body_md text,
  _category_id uuid,
  _visibility public.help_visibility,
  _tags text[],
  _status public.help_article_status DEFAULT 'draft'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_version_id uuid;
BEGIN
  -- Verify caller can manage help
  IF NOT (public.can_manage_help(auth.uid()) OR public.is_platform_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Unauthorized: cannot manage help content';
  END IF;

  -- Insert new version
  INSERT INTO public.help_article_versions (
    article_id, title, summary, body_md, category_id, visibility, tags, status, created_by
  ) VALUES (
    _article_id, _title, _summary, _body_md, _category_id, _visibility, _tags, _status, auth.uid()
  ) RETURNING id INTO new_version_id;

  -- Update article's current_version_id pointer
  UPDATE public.help_articles 
  SET current_version_id = new_version_id,
      updated_at = now(),
      updated_by = auth.uid()
  WHERE id = _article_id;

  RETURN new_version_id;
END;
$$;

-- Step 11: Create function to publish a specific version
CREATE OR REPLACE FUNCTION public.publish_help_article_version(
  _article_id uuid,
  _version_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller can manage help
  IF NOT (public.can_manage_help(auth.uid()) OR public.is_platform_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Unauthorized: cannot manage help content';
  END IF;

  -- Verify version belongs to article
  IF NOT EXISTS (
    SELECT 1 FROM public.help_article_versions 
    WHERE id = _version_id AND article_id = _article_id
  ) THEN
    RAISE EXCEPTION 'Version does not belong to this article';
  END IF;

  -- Update article's published_version_id and status
  UPDATE public.help_articles 
  SET published_version_id = _version_id,
      status = 'published',
      published_at = now(),
      updated_at = now(),
      updated_by = auth.uid()
  WHERE id = _article_id;

  RETURN true;
END;
$$;

-- Step 12: Create function to archive an article (not versions)
CREATE OR REPLACE FUNCTION public.archive_help_article(
  _article_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller can manage help
  IF NOT (public.can_manage_help(auth.uid()) OR public.is_platform_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Unauthorized: cannot manage help content';
  END IF;

  -- Archive the article reference, not versions
  UPDATE public.help_articles 
  SET status = 'archived',
      updated_at = now(),
      updated_by = auth.uid()
  WHERE id = _article_id;

  RETURN true;
END;
$$;

-- Step 13: Create helper function to get article with current version data
CREATE OR REPLACE FUNCTION public.get_help_article_with_version(
  _article_id uuid
)
RETURNS TABLE (
  id uuid,
  slug text,
  status public.help_article_status,
  current_version_id uuid,
  published_version_id uuid,
  created_at timestamptz,
  published_at timestamptz,
  updated_at timestamptz,
  updated_by uuid,
  -- Current version fields
  title text,
  summary text,
  body_md text,
  category_id uuid,
  visibility public.help_visibility,
  tags text[],
  version_created_at timestamptz,
  version_created_by uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    a.id,
    a.slug,
    a.status,
    a.current_version_id,
    a.published_version_id,
    a.created_at,
    a.published_at,
    a.updated_at,
    a.updated_by,
    v.title,
    v.summary,
    v.body_md,
    v.category_id,
    v.visibility,
    v.tags,
    v.created_at as version_created_at,
    v.created_by as version_created_by
  FROM public.help_articles a
  LEFT JOIN public.help_article_versions v ON v.id = a.current_version_id
  WHERE a.id = _article_id;
$$;