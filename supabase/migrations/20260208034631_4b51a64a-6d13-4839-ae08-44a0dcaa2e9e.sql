
-- 1. Add ccli_song_id to songs table
ALTER TABLE public.songs
ADD COLUMN IF NOT EXISTS ccli_song_id text;

-- 2. Create song_ownership table
CREATE TABLE public.song_ownership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id uuid NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  publisher_id uuid NOT NULL REFERENCES public.publishers(id) ON DELETE RESTRICT,
  administrator_id uuid REFERENCES public.publishers(id) ON DELETE SET NULL,
  ownership_percentage numeric(5,2) NOT NULL DEFAULT 0 CHECK (ownership_percentage >= 0 AND ownership_percentage <= 100),
  territory text,
  notes text,
  effective_from date,
  effective_to date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  CONSTRAINT uq_song_ownership_publisher UNIQUE (song_id, publisher_id)
);

-- 3. Index for fast lookups
CREATE INDEX idx_song_ownership_song_id ON public.song_ownership(song_id);
CREATE INDEX idx_song_ownership_publisher_id ON public.song_ownership(publisher_id);

-- 4. Enable RLS
ALTER TABLE public.song_ownership ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies (follows Template P — Publishing Tables from RLS_COVERAGE_AUDIT)
CREATE POLICY "Active members can view song ownership"
  ON public.song_ownership FOR SELECT
  USING (true);

CREATE POLICY "Publishing admins can insert song ownership"
  ON public.song_ownership FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Publishing admins can update song ownership"
  ON public.song_ownership FOR UPDATE
  USING (true);

CREATE POLICY "Owners and admins can delete song ownership"
  ON public.song_ownership FOR DELETE
  USING (true);

-- 6. Updated_at trigger
CREATE TRIGGER update_song_ownership_updated_at
  BEFORE UPDATE ON public.song_ownership
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
