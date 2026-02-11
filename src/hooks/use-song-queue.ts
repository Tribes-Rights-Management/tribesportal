import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Json } from "@/integrations/supabase/types";

/**
 * SONG QUEUE HOOKS
 * Shared data hooks for song queue across /rights (staff) and /admin (client).
 */

export interface QueueItem {
  id: string;
  status: string;
  submitted_at: string;
  submitted_by: string;
  client_account_id: string;
  client_name?: string;
  submitted_data: any;
  current_data: any;
  admin_notes: string | null;
  approved_song_id: string | null;
  rejection_reason: string | null;
  revision_request: string | null;
  revision_requested_at: string | null;
  revision_submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  updated_at: string;
  submitter_email?: string;
  message_count?: number;
}

/** Batch-resolve submitter names from user_profiles */
async function resolveSubmitterNames(submitterIds: string[]): Promise<Record<string, string>> {
  const unique = [...new Set(submitterIds.filter(Boolean))];
  if (unique.length === 0) return {};

  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("user_id, full_name, email")
    .in("user_id", unique);

  if (!profiles) return {};
  return Object.fromEntries(
    profiles.map((p: any) => [p.user_id, p.full_name || p.email || "Unknown"])
  );
}

/** Map raw queue rows + submitter lookup into QueueItem[] */
function mapQueueItems(items: any[], submitterMap: Record<string, string>): QueueItem[] {
  return items.map((item: any) => ({
    ...item,
    client_name: item.client_accounts?.name || submitterMap[item.submitted_by] || "Unknown",
  })) as QueueItem[];
}

const QUEUE_SELECT = `
  id, status, submitted_at, submitted_by, client_account_id,
  submitted_data, current_data, admin_notes, approved_song_id,
  rejection_reason, revision_request, revision_requested_at,
  revision_submitted_at, reviewed_at, reviewed_by, updated_at,
  client_accounts!song_queue_client_account_id_fkey(name)
`;

const QUEUE_SELECT_CLIENT = `
  id, status, submitted_at, submitted_by, client_account_id,
  submitted_data, current_data, approved_song_id,
  revision_request, revision_requested_at, revision_submitted_at,
  updated_at,
  client_accounts!song_queue_client_account_id_fkey(name)
`;

const QUEUE_SELECT_DETAIL = `
  id, status, submitted_at, submitted_by, client_account_id,
  submitted_data, current_data, admin_notes, approved_song_id,
  rejection_reason, revision_request, revision_requested_at,
  revision_requested_by, revision_submitted_at, reviewed_at,
  reviewed_by, updated_at,
  client_accounts!song_queue_client_account_id_fkey(name)
`;

/** Fetch all queue items (staff view — all clients) */
export function useStaffQueue(statusFilter?: string) {
  return useQuery({
    queryKey: ["song-queue", "staff", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("song_queue")
        .select(QUEUE_SELECT)
        .order("submitted_at", { ascending: false });

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter as any);
      }

      const { data, error } = await query;
      if (error) throw error;

      const items = data || [];
      const submitterMap = await resolveSubmitterNames(items.map((i: any) => i.submitted_by));
      return mapQueueItems(items, submitterMap);
    },
  });
}

/** Fetch queue items for the current client user */
export function useClientQueue() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["song-queue", "client", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("song_queue")
        .select(QUEUE_SELECT_CLIENT)
        .eq("submitted_by", user.id)
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      const items = data || [];
      const submitterMap = await resolveSubmitterNames(items.map((i: any) => i.submitted_by));
      return mapQueueItems(items, submitterMap);
    },
    enabled: !!user?.id,
  });
}

/** Fetch a single queue item by ID */
export function useQueueItem(queueId: string | undefined) {
  return useQuery({
    queryKey: ["song-queue", "item", queueId],
    queryFn: async () => {
      if (!queueId) return null;
      const { data, error } = await supabase
        .from("song_queue")
        .select(QUEUE_SELECT_DETAIL)
        .eq("id", queueId)
        .single();

      if (error) throw error;
      const d = data as any;
      const submitterMap = await resolveSubmitterNames([d.submitted_by]);
      return {
        ...data,
        client_name: d.client_accounts?.name || submitterMap[d.submitted_by] || "Unknown",
      } as QueueItem;
    },
    enabled: !!queueId,
  });
}

/** Get queue stats for overview dashboards */
export function useQueueStats() {
  return useQuery({
    queryKey: ["song-queue", "stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("song_queue")
        .select("status");

      if (error) throw error;
      const items = data || [];
      return {
        total: items.length,
        submitted: items.filter(i => i.status === "submitted" || i.status === "pending").length,
        in_review: items.filter(i => i.status === "in_review").length,
        needs_revision: items.filter(i => i.status === "needs_revision").length,
        approved: items.filter(i => i.status === "approved").length,
        rejected: items.filter(i => i.status === "rejected").length,
      };
    },
  });
}

/** Update queue item status (staff only) */
export function useUpdateQueueStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ queueId, status, notes, rejectionReason, revisionRequest }: {
      queueId: string;
      status: string;
      notes?: string;
      rejectionReason?: string;
      revisionRequest?: string;
    }) => {
      const updates: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === "in_review") {
        updates.reviewed_by = user?.id;
      }
      if (status === "approved") {
        updates.reviewed_at = new Date().toISOString();
        updates.reviewed_by = user?.id;
      }
      if (status === "rejected") {
        updates.reviewed_at = new Date().toISOString();
        updates.reviewed_by = user?.id;
        updates.rejection_reason = rejectionReason || null;
      }
      if (status === "needs_revision") {
        updates.revision_request = revisionRequest || null;
        updates.revision_requested_at = new Date().toISOString();
        updates.revision_requested_by = user?.id;
      }
      if (notes !== undefined) {
        updates.admin_notes = notes;
      }

      const { error } = await supabase
        .from("song_queue")
        .update(updates)
        .eq("id", queueId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["song-queue"] });
    },
  });
}
