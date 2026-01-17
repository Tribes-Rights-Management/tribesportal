/**
 * NOTIFICATIONS & ESCALATION HOOKS
 * 
 * Provides notification management that respects authority boundaries.
 * Notifications are append-only and generate audit events.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type NotificationType = Database["public"]["Enums"]["notification_type"];
export type NotificationPriority = Database["public"]["Enums"]["notification_priority"];
export type EscalationStatus = Database["public"]["Enums"]["escalation_status"];

export interface Notification {
  id: string;
  recipient_id: string;
  tenant_id: string | null;
  notification_type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  metadata: Record<string, unknown>;
  record_type: string | null;
  record_id: string | null;
  correlation_id: string | null;
  read_at: string | null;
  created_at: string;
}

export interface EscalationRule {
  id: string;
  notification_type: NotificationType;
  priority: NotificationPriority;
  sla_minutes: number;
  escalation_target_role: string;
  tenant_id: string | null;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EscalationEvent {
  id: string;
  notification_id: string;
  escalation_rule_id: string;
  original_recipient_id: string;
  escalated_to_role: string;
  escalated_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  status: EscalationStatus;
  notes: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// USER NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch current user's notifications
 */
export function useUserNotifications(options?: { unreadOnly?: boolean }) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notifications", "user", user?.id, options?.unreadOnly],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("notifications")
        .select("*")
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (options?.unreadOnly) {
        query = query.is("read_at", null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Notification[];
    },
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

/**
 * Get unread notification count
 */
export function useUnreadNotificationCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notifications", "unread-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .is("read_at", null);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
}

/**
 * Mark notification as read
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

/**
 * Mark all notifications as read
 */
export function useMarkAllNotificationsRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("recipient_id", user.id)
        .is("read_at", null);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// ESCALATION RULES (Platform Executives only)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch escalation rules
 */
export function useEscalationRules() {
  const { isPlatformAdmin } = useAuth();

  return useQuery({
    queryKey: ["escalation-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("escalation_rules")
        .select("*")
        .order("notification_type", { ascending: true });

      if (error) throw error;
      return data as unknown as EscalationRule[];
    },
    enabled: isPlatformAdmin,
  });
}

/**
 * Create or update escalation rule
 */
export function useUpsertEscalationRule() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rule: Omit<EscalationRule, "id" | "created_by" | "created_at" | "updated_at">) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("escalation_rules")
        .upsert({
          notification_type: rule.notification_type,
          priority: rule.priority,
          sla_minutes: rule.sla_minutes,
          escalation_target_role: rule.escalation_target_role,
          tenant_id: rule.tenant_id,
          is_active: rule.is_active,
          created_by: user.id,
        } as unknown as Database["public"]["Tables"]["escalation_rules"]["Insert"], {
          onConflict: "notification_type,priority,tenant_id",
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as EscalationRule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escalation-rules"] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// ESCALATION EVENTS (Platform view)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch escalation events
 */
export function useEscalationEvents(options?: { status?: EscalationStatus }) {
  const { isPlatformAdmin } = useAuth();

  return useQuery({
    queryKey: ["escalation-events", options?.status],
    queryFn: async () => {
      let query = supabase
        .from("escalation_events")
        .select(`
          *,
          notification:notifications(*)
        `)
        .order("escalated_at", { ascending: false })
        .limit(100);

      if (options?.status) {
        query = query.eq("status", options.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: isPlatformAdmin,
  });
}

/**
 * Resolve an escalation
 */
export function useResolveEscalation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ escalationId, notes }: { escalationId: string; notes?: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("escalation_events")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
          notes,
        })
        .eq("id", escalationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escalation-events"] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  authority_change_proposal: "Authority Change",
  licensing_request: "Licensing Request",
  payment_failure: "Payment Failed",
  refund_initiated: "Refund Initiated",
  approval_timeout: "Approval Timeout",
  security_event: "Security Event",
  export_completed: "Export Completed",
  membership_change: "Membership Change",
};

export const PRIORITY_STYLES: Record<NotificationPriority, { bg: string; text: string }> = {
  low: { bg: "bg-muted", text: "text-muted-foreground" },
  normal: { bg: "bg-secondary", text: "text-secondary-foreground" },
  high: { bg: "bg-amber-500/20", text: "text-amber-600" },
  critical: { bg: "bg-destructive/20", text: "text-destructive" },
};
