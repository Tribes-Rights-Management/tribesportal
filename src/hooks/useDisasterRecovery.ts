/**
 * DISASTER RECOVERY & CONTINUITY HOOKS
 * 
 * Manages recovery events and backup manifests.
 * All operations are immutable and auditable.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type RecoveryEventType = Database["public"]["Enums"]["recovery_event_type"];

export interface RecoveryEvent {
  id: string;
  event_type: RecoveryEventType;
  initiated_by: string;
  target_tables: string[];
  backup_id: string | null;
  restore_point: string | null;
  status: string;
  details: Record<string, unknown>;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
}

export interface BackupManifest {
  id: string;
  backup_id: string;
  backup_type: string;
  tables_included: string[];
  record_counts: Record<string, number>;
  file_hash: string;
  file_size_bytes: number;
  created_by: string;
  created_at: string;
  verified_at: string | null;
  verified_by: string | null;
}

// Critical tables that require backup protection
export const CRITICAL_TABLES = [
  "audit_logs",
  "access_logs",
  "contracts",
  "invoices",
  "payments",
  "refunds",
  "user_profiles",
  "tenant_memberships",
  "tenants",
  "notifications",
  "escalation_events",
  "api_tokens",
  "api_access_logs",
  "data_room_exports",
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// RECOVERY EVENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch recovery events
 */
export function useRecoveryEvents(options?: { eventType?: RecoveryEventType; limit?: number }) {
  const { isPlatformAdmin } = useAuth();

  return useQuery({
    queryKey: ["recovery-events", options?.eventType, options?.limit],
    queryFn: async () => {
      let query = supabase
        .from("recovery_events")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(options?.limit || 50);

      if (options?.eventType) {
        query = query.eq("event_type", options.eventType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as RecoveryEvent[];
    },
    enabled: isPlatformAdmin,
  });
}

/**
 * Initiate an integrity check
 */
export function useInitiateIntegrityCheck() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tables?: string[]) => {
      if (!user) throw new Error("Not authenticated");

      const targetTables = tables || [...CRITICAL_TABLES];

      const { data, error } = await supabase
        .from("recovery_events")
        .insert({
          event_type: "integrity_check",
          initiated_by: user.id,
          target_tables: targetTables,
          status: "initiated",
          details: { check_type: "full" },
        })
        .select()
        .single();

      if (error) throw error;

      // Log the integrity check
      await supabase.rpc("log_audit_event", {
        _action: "record_created",
        _action_label: "Integrity check initiated",
        _record_id: data.id,
        _record_type: "recovery_event",
        _details: { tables: targetTables },
      });

      return data as unknown as RecoveryEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recovery-events"] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// BACKUP MANIFESTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch backup manifests
 */
export function useBackupManifests(options?: { limit?: number }) {
  const { isPlatformAdmin, profile } = useAuth();
  const isAuditor = profile?.platform_role === "external_auditor";

  return useQuery({
    queryKey: ["backup-manifests", options?.limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("backup_manifests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(options?.limit || 50);

      if (error) throw error;
      return data as unknown as BackupManifest[];
    },
    enabled: isPlatformAdmin || isAuditor,
  });
}

/**
 * Verify a backup manifest
 */
export function useVerifyBackup() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (manifestId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("backup_manifests")
        .update({
          verified_at: new Date().toISOString(),
          verified_by: user.id,
        })
        .eq("id", manifestId);

      if (error) throw error;

      // Log the verification
      await supabase.rpc("log_audit_event", {
        _action: "record_updated",
        _action_label: "Backup manifest verified",
        _record_id: manifestId,
        _record_type: "backup_manifest",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backup-manifests"] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTINUITY METRICS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get disaster recovery posture summary
 */
export function useRecoveryPosture() {
  const { isPlatformAdmin } = useAuth();

  return useQuery({
    queryKey: ["recovery-posture"],
    queryFn: async () => {
      // Get latest backup
      const { data: latestBackup } = await supabase
        .from("backup_manifests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      // Get latest integrity check
      const { data: latestCheck } = await supabase
        .from("recovery_events")
        .select("*")
        .eq("event_type", "integrity_check")
        .order("started_at", { ascending: false })
        .limit(1)
        .single();

      // Get any recent failures
      const { data: recentFailures, count: failureCount } = await supabase
        .from("recovery_events")
        .select("*", { count: "exact" })
        .eq("status", "failed")
        .gte("started_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Calculate RPO (time since last backup)
      const rpoHours = latestBackup
        ? (Date.now() - new Date(latestBackup.created_at).getTime()) / (1000 * 60 * 60)
        : null;

      return {
        latestBackup: latestBackup as unknown as BackupManifest | null,
        latestIntegrityCheck: latestCheck as unknown as RecoveryEvent | null,
        recentFailures: recentFailures as unknown as RecoveryEvent[],
        failureCount: failureCount || 0,
        rpoHours,
        rpoTarget: 24, // 24-hour RPO target
        rtoTarget: 4, // 4-hour RTO target
        isHealthy: rpoHours !== null && rpoHours <= 24 && failureCount === 0,
      };
    },
    enabled: isPlatformAdmin,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

export const EVENT_TYPE_LABELS: Record<RecoveryEventType, string> = {
  backup_created: "Backup Created",
  backup_verified: "Backup Verified",
  restore_initiated: "Restore Initiated",
  restore_completed: "Restore Completed",
  restore_failed: "Restore Failed",
  integrity_check: "Integrity Check",
};

export const EVENT_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  initiated: { bg: "bg-blue-500/20", text: "text-blue-600" },
  in_progress: { bg: "bg-amber-500/20", text: "text-amber-600" },
  completed: { bg: "bg-emerald-500/20", text: "text-emerald-600" },
  failed: { bg: "bg-destructive/20", text: "text-destructive" },
};
