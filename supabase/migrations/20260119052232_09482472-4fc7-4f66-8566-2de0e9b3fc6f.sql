BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
-- HELP BACKEND SCHEMA + RLS
-- ═══════════════════════════════════════════════════════════════════════════

-- 1) Capability gate (company-level)
-- Note: can_manage_help already exists on user_profiles, but we're creating 
-- a dedicated capabilities table for cleaner separation

CREATE TABLE IF NOT EXISTS public.platform_user_capabilities (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  can_manage_help boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NULL REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid NULL REFERENCES auth.users(id)
);

ALTER TABLE public.platform_user_capabilities ENABLE ROW LEVEL SECURITY;

-- Helper: can_manage_help (check capabilities table OR platform admin)
CREATE OR REPLACE FUNCTION public.can_manage_help(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.platform_user_capabilities c
    WHERE c.user_id = _user_id
      AND c.can_manage_help = true
  ) OR public.is_platform_admin(_user_id)
$$;

-- RLS: only platform admins manage capabilities; users can read their own row
DROP POLICY IF EXISTS "capabilities_read_self_or_admin" ON public.platform_user_capabilities;
CREATE POLICY "capabilities_read_self_or_admin"
ON public.platform_user_capabilities
FOR SELECT
USING (auth.uid() = user_id OR public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "capabilities_admin_write" ON public.platform_user_capabilities;
CREATE POLICY "capabilities_admin_write"
ON public.platform_user_capabilities
FOR INSERT
WITH CHECK (public.is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "capabilities_admin_update" ON public.platform_user_capabilities;
CREATE POLICY "capabilities_admin_update"
ON public.platform_user_capabilities
FOR UPDATE
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

-- 2) Help enums (idempotent)
DO $$ BEGIN
  CREATE TYPE public.help_article_status AS ENUM ('draft','published','archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.help_visibility AS ENUM ('public','internal');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3) Categories
CREATE TABLE IF NOT EXISTS public.help_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NULL REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid NULL REFERENCES auth.users(id)
);

ALTER TABLE public.help_categories ENABLE ROW LEVEL SECURITY;

-- 4) Articles
CREATE TABLE IF NOT EXISTS public.help_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text NULL,
  body_md text NOT NULL,
  category_id uuid NULL REFERENCES public.help_categories(id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  status public.help_article_status NOT NULL DEFAULT 'draft',
  visibility public.help_visibility NOT NULL DEFAULT 'public',
  version integer NOT NULL DEFAULT 1,
  published_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NULL REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid NULL REFERENCES auth.users(id)
);

ALTER TABLE public.help_articles ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_help_articles_status ON public.help_articles(status);
CREATE INDEX IF NOT EXISTS idx_help_articles_category ON public.help_articles(category_id);

-- 5) Revisions (append-only history)
CREATE TABLE IF NOT EXISTS public.help_article_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.help_articles(id) ON DELETE CASCADE,
  version integer NOT NULL,
  title text NOT NULL,
  summary text NULL,
  body_md text NOT NULL,
  status public.help_article_status NOT NULL,
  visibility public.help_visibility NOT NULL,
  actor_user_id uuid NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(article_id, version)
);

ALTER TABLE public.help_article_revisions ENABLE ROW LEVEL SECURITY;

-- 6) updated_at trigger helper (idempotent)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_help_categories_updated_at ON public.help_categories;
CREATE TRIGGER trg_help_categories_updated_at
BEFORE UPDATE ON public.help_categories
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_help_articles_updated_at ON public.help_articles;
CREATE TRIGGER trg_help_articles_updated_at
BEFORE UPDATE ON public.help_articles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_platform_capabilities_updated_at ON public.platform_user_capabilities;
CREATE TRIGGER trg_platform_capabilities_updated_at
BEFORE UPDATE ON public.platform_user_capabilities
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7) Append revision on insert/update (immutable history)
CREATE OR REPLACE FUNCTION public.append_help_revision()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v integer;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v := 1;
  ELSE
    -- If content fields changed, increment version
    IF (NEW.title IS DISTINCT FROM OLD.title)
      OR (NEW.summary IS DISTINCT FROM OLD.summary)
      OR (NEW.body_md IS DISTINCT FROM OLD.body_md)
      OR (NEW.status IS DISTINCT FROM OLD.status)
      OR (NEW.visibility IS DISTINCT FROM OLD.visibility)
      OR (NEW.category_id IS DISTINCT FROM OLD.category_id)
    THEN
      v := OLD.version + 1;
      NEW.version := v;
    ELSE
      v := NEW.version;
    END IF;
  END IF;

  -- Only write a revision if insert OR relevant fields changed
  IF TG_OP = 'INSERT' OR v <> COALESCE(OLD.version, 0) THEN
    INSERT INTO public.help_article_revisions (
      article_id, version, title, summary, body_md, status, visibility, actor_user_id
    ) VALUES (
      NEW.id, v, NEW.title, NEW.summary, NEW.body_md, NEW.status, NEW.visibility, auth.uid()
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_help_articles_append_revision ON public.help_articles;
CREATE TRIGGER trg_help_articles_append_revision
BEFORE INSERT OR UPDATE ON public.help_articles
FOR EACH ROW EXECUTE FUNCTION public.append_help_revision();

-- 8) RLS Policies

-- Categories: help managers only
DROP POLICY IF EXISTS "help_categories_select" ON public.help_categories;
CREATE POLICY "help_categories_select"
ON public.help_categories FOR SELECT
USING (public.can_manage_help(auth.uid()));

DROP POLICY IF EXISTS "help_categories_insert" ON public.help_categories;
CREATE POLICY "help_categories_insert"
ON public.help_categories FOR INSERT
WITH CHECK (public.can_manage_help(auth.uid()));

DROP POLICY IF EXISTS "help_categories_update" ON public.help_categories;
CREATE POLICY "help_categories_update"
ON public.help_categories FOR UPDATE
USING (public.can_manage_help(auth.uid()))
WITH CHECK (public.can_manage_help(auth.uid()));

DROP POLICY IF EXISTS "help_categories_delete" ON public.help_categories;
CREATE POLICY "help_categories_delete"
ON public.help_categories FOR DELETE
USING (public.can_manage_help(auth.uid()));

-- Articles: help managers only (backend is private; public site uses separate frontend later)
DROP POLICY IF EXISTS "help_articles_select" ON public.help_articles;
CREATE POLICY "help_articles_select"
ON public.help_articles FOR SELECT
USING (public.can_manage_help(auth.uid()));

DROP POLICY IF EXISTS "help_articles_insert" ON public.help_articles;
CREATE POLICY "help_articles_insert"
ON public.help_articles FOR INSERT
WITH CHECK (public.can_manage_help(auth.uid()));

DROP POLICY IF EXISTS "help_articles_update" ON public.help_articles;
CREATE POLICY "help_articles_update"
ON public.help_articles FOR UPDATE
USING (public.can_manage_help(auth.uid()))
WITH CHECK (public.can_manage_help(auth.uid()));

DROP POLICY IF EXISTS "help_articles_delete" ON public.help_articles;
CREATE POLICY "help_articles_delete"
ON public.help_articles FOR DELETE
USING (public.can_manage_help(auth.uid()));

-- Revisions: read-only; inserts only occur via trigger; no update/delete policies
DROP POLICY IF EXISTS "help_revisions_select" ON public.help_article_revisions;
CREATE POLICY "help_revisions_select"
ON public.help_article_revisions FOR SELECT
USING (public.can_manage_help(auth.uid()));

DROP POLICY IF EXISTS "help_revisions_insert" ON public.help_article_revisions;
CREATE POLICY "help_revisions_insert"
ON public.help_article_revisions FOR INSERT
WITH CHECK (public.can_manage_help(auth.uid()));

COMMIT;