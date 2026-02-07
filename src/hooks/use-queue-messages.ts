import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * QUEUE MESSAGES HOOKS
 * Threaded messaging for song queue items.
 */

export interface QueueMessage {
  id: string;
  queue_id: string;
  sender_id: string;
  sender_role: "staff" | "client";
  message: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  sender_name?: string;
  sender_email?: string;
}

/** Fetch messages for a queue item */
export function useQueueMessages(queueId: string | undefined) {
  return useQuery({
    queryKey: ["queue-messages", queueId],
    queryFn: async () => {
      if (!queueId) return [];
      const { data, error } = await supabase
        .from("song_queue_messages")
        .select("*")
        .eq("queue_id", queueId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Resolve sender names
      const senderIds = [...new Set((data || []).map(m => m.sender_id))];
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("user_id, email, full_name")
        .in("user_id", senderIds);

      const profileMap = new Map(
        (profiles || []).map((p: any) => [p.user_id, { name: p.full_name || p.email, email: p.email }])
      );

      return (data || []).map(m => ({
        ...m,
        sender_name: profileMap.get(m.sender_id)?.name || "Unknown",
        sender_email: profileMap.get(m.sender_id)?.email || "",
      })) as QueueMessage[];
    },
    enabled: !!queueId,
  });
}

/** Get unread message count for a queue item */
export function useQueueMessageCount(queueId: string | undefined) {
  return useQuery({
    queryKey: ["queue-messages", "count", queueId],
    queryFn: async () => {
      if (!queueId) return 0;
      const { count, error } = await supabase
        .from("song_queue_messages")
        .select("*", { count: "exact", head: true })
        .eq("queue_id", queueId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!queueId,
  });
}

/** Send a message on a queue item */
export function useSendQueueMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ queueId, message, isInternal, senderRole }: {
      queueId: string;
      message: string;
      isInternal?: boolean;
      senderRole: "staff" | "client";
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("song_queue_messages")
        .insert({
          queue_id: queueId,
          sender_id: user.id,
          sender_role: senderRole,
          message,
          is_internal: isInternal || false,
        } as any);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["queue-messages", variables.queueId] });
    },
  });
}
