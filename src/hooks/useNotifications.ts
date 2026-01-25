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

/**
 * NOTIFICATION INTERFACE
 * 
 * RETENTION SEMANTICS:
 * - acknowledged_at: User has SEEN the notification (does NOT stop escalations)
 * - resolved_at: The underlying EVENT has been COMPLETED (outcome-driven)
 * - requires_resolution: If true, notification remains active until action completes
 * - retention_category: Determines archival rules (critical categories never deleted)
 */
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
  acknowledged_at: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_type: string | null;
  requires_resolution: boolean;
  retention_category: string;
  archived_at: string | null;
  created_at: string;
}

export type ResolutionType = 'approved' | 'rejected' | 'completed' | 'cancelled' | 'expired';
export type RetentionCategory = 'standard' | 'critical_authority' | 'critical_financial' | 'critical_security';

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
 * ACKNOWLEDGMENT SEMANTICS
 * 
 * "Mark as read" = ACKNOWLEDGMENT ONLY
 * - User has seen and recognized the notification
 * - Does NOT imply action has been taken
 * - Does NOT stop escalation timers
 * - Escalations continue until RESOLUTION
 * 
 * Resolution is OUTCOME-DRIVEN (see useResolveNotification)
 */

/**
 * Mark notification as acknowledged (read)
 * This is NOT resolution - escalations continue
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ 
          read_at: new Date().toISOString(),
          acknowledged_at: new Date().toISOString(),
        })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

/**
 * Mark all notifications as acknowledged
 * Does NOT resolve any notifications
 */
export function useMarkAllNotificationsRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("notifications")
        .update({ 
          read_at: new Date().toISOString(),
          acknowledged_at: new Date().toISOString(),
        })
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
// RESOLUTION (Outcome-Driven Only)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get count of unresolved notifications requiring action
 * These cannot be dismissed until the underlying action completes
 */
export function useUnresolvedNotificationCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notifications", "unresolved-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .eq("requires_resolution", true)
        .is("resolved_at", null);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 30000,
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
  high: { bg: "bg-[var(--warning-bg)]", text: "text-[var(--warning-text)]" },
  critical: { bg: "bg-destructive/20", text: "text-destructive" },
};

/**
 * RETENTION RULES (Non-Negotiable)
 * 
 * Active Notifications:
 * - Remain visible until Acknowledged AND Resolved (if resolution required)
 * 
 * Resolved Notifications:
 * - Retained and visible (read-only) for 90 days
 * 
 * Archived Notifications:
 * - Moved to archive after 90 days
 * - Remain queryable for audit purposes
 * - NEVER deleted
 * 
 * Critical Categories (Never Deleted):
 * - Authority & access changes
 * - Financial events
 * - Escalations
 * - Security incidents
 */
export const RETENTION_CATEGORY_LABELS: Record<string, string> = {
  standard: "Standard Retention",
  critical_authority: "Authority Record (Never Deleted)",
  critical_financial: "Financial Record (Never Deleted)",
  critical_security: "Security Record (Never Deleted)",
};

/**
 * Determine if a notification can be dismissed from view
 * (still retained for audit, just hidden from active list)
 */
export function canDismissNotification(notification: Notification): boolean {
  // Escalated items cannot be dismissed until resolved
  if (notification.priority === "critical" || notification.priority === "high") {
    return notification.resolved_at !== null;
  }
  // Items requiring resolution cannot be dismissed
  if (notification.requires_resolution) {
    return notification.resolved_at !== null;
  }
  // Standard notifications can be dismissed after acknowledgment
  return notification.acknowledged_at !== null;
}
