
-- ═══════════════════════════════════════════════════════════════
-- 1. Extend song_queue_status enum with 'submitted' and 'in_review'
-- ═══════════════════════════════════════════════════════════════
ALTER TYPE song_queue_status ADD VALUE IF NOT EXISTS 'submitted' BEFORE 'pending';
ALTER TYPE song_queue_status ADD VALUE IF NOT EXISTS 'in_review' AFTER 'pending';

-- ═══════════════════════════════════════════════════════════════
-- 2. Create song_queue_messages table
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.song_queue_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID NOT NULL REFERENCES public.song_queue(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('staff', 'client')),
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_queue_messages_queue ON public.song_queue_messages(queue_id);
CREATE INDEX IF NOT EXISTS idx_queue_messages_created ON public.song_queue_messages(queue_id, created_at);

COMMENT ON TABLE public.song_queue_messages IS 
  'Threaded messages between Tribes staff and clients, attached to song queue items.';

-- ═══════════════════════════════════════════════════════════════
-- 3. Enable RLS
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.song_queue_messages ENABLE ROW LEVEL SECURITY;

-- Staff (company_users) can see all messages
CREATE POLICY "Staff can view all queue messages"
  ON public.song_queue_messages FOR SELECT
  USING (is_company_user(auth.uid()));

-- Staff can insert messages
CREATE POLICY "Staff can insert queue messages"
  ON public.song_queue_messages FOR INSERT
  WITH CHECK (is_company_user(auth.uid()));

-- Staff can update messages (edit their own)
CREATE POLICY "Staff can update own queue messages"
  ON public.song_queue_messages FOR UPDATE
  USING (is_company_user(auth.uid()) AND sender_id = auth.uid());

-- Clients can see non-internal messages on their own queue items
CREATE POLICY "Clients can view their queue messages"
  ON public.song_queue_messages FOR SELECT
  USING (
    is_internal = false
    AND queue_id IN (
      SELECT id FROM public.song_queue 
      WHERE submitted_by = auth.uid()
    )
  );

-- Clients can insert messages on their own queue items
CREATE POLICY "Clients can respond to their queue messages"
  ON public.song_queue_messages FOR INSERT
  WITH CHECK (
    sender_role = 'client'
    AND sender_id = auth.uid()
    AND queue_id IN (
      SELECT id FROM public.song_queue 
      WHERE submitted_by = auth.uid()
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- 4. Trigger for updated_at
-- ═══════════════════════════════════════════════════════════════
CREATE TRIGGER update_song_queue_messages_updated_at
  BEFORE UPDATE ON public.song_queue_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
