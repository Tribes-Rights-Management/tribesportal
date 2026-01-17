/**
 * DATA ROOM EXPORTS HOOKS
 * 
 * Provides access to formal, immutable disclosure packages
 * for audits, diligence, and compliance.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type DataRoomExportType = 
  | "authority_governance"
  | "contracts_amendments"
  | "billing_payments"
  | "licensing_activity"
  | "messaging_transcripts";

export type ExportStatus = "generating" | "completed" | "failed";

export interface ContentManifest {
  record_types: {
    type: string;
    count: number;
  }[];
  total_records: number;
  date_range: {
    start: string;
    end: string;
  };
}

export interface DataRoomExport {
  id: string;
  export_type: DataRoomExportType;
  title: string;
  description: string | null;
  scope_type: "platform" | "organization";
  organization_id: string | null;
  period_start: string;
  period_end: string;
  content_manifest: ContentManifest;
  file_url: string | null;
  file_hash: string | null;
  file_size_bytes: number | null;
  status: ExportStatus;
  completed_at: string | null;
  error_message: string | null;
  assigned_auditors: string[];
  access_expires_at: string | null;
  requested_by: string;
  requested_at: string;
  watermark: string;
  created_at: string;
}

export interface CreateExportParams {
  exportType: DataRoomExportType;
  title: string;
  description?: string;
  scopeType: "platform" | "organization";
  organizationId?: string;
  periodStart: string;
  periodEnd: string;
  assignedAuditors?: string[];
  accessExpiresAt?: string;
}

export interface DataRoomAccessLog {
  id: string;
  export_id: string;
  accessed_by: string;
  accessed_at: string;
  access_type: "view" | "download";
  ip_address: string | null;
  user_agent: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT TYPE METADATA
// ═══════════════════════════════════════════════════════════════════════════

export const EXPORT_TYPE_LABELS: Record<DataRoomExportType, string> = {
  authority_governance: "Authority & Governance Pack",
  contracts_amendments: "Contracts & Amendments Pack",
  billing_payments: "Billing & Payments Pack",
  licensing_activity: "Licensing Activity Pack",
  messaging_transcripts: "Messaging Transcripts Pack",
};

export const EXPORT_TYPE_DESCRIPTIONS: Record<DataRoomExportType, string> = {
  authority_governance: "Complete authority history, role assignments, and governance events",
  contracts_amendments: "All contracts with version history and amendments",
  billing_payments: "Invoice ledger, payment history, and refund records",
  licensing_activity: "Licensing requests, agreements, and usage records",
  messaging_transcripts: "Communication records within scope boundaries",
};

export const EXPORT_TYPE_RECORD_TYPES: Record<DataRoomExportType, string[]> = {
  authority_governance: ["authority_events", "role_assignments", "approval_decisions"],
  contracts_amendments: ["contracts", "amendments", "signatures"],
  billing_payments: ["invoices", "payments", "refunds", "payment_methods"],
  licensing_activity: ["licensing_requests", "licensing_agreements", "licenses"],
  messaging_transcripts: ["messages", "threads", "attachments"],
};

// ═══════════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch all data room exports (Platform Admin only)
 */
export function useDataRoomExports() {
  return useQuery({
    queryKey: ["data-room-exports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_room_exports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as DataRoomExport[];
    },
  });
}

/**
 * Fetch exports assigned to the current auditor
 */
export function useAuditorExports() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["auditor-exports", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("data_room_exports")
        .select("*")
        .contains("assigned_auditors", [user.id])
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as DataRoomExport[];
    },
    enabled: !!user?.id,
  });
}

/**
 * Fetch a single export by ID
 */
export function useDataRoomExport(exportId: string | undefined) {
  return useQuery({
    queryKey: ["data-room-export", exportId],
    queryFn: async () => {
      if (!exportId) return null;

      const { data, error } = await supabase
        .from("data_room_exports")
        .select("*")
        .eq("id", exportId)
        .single();

      if (error) throw error;
      return data as unknown as DataRoomExport;
    },
    enabled: !!exportId,
  });
}

/**
 * Fetch access log for an export
 */
export function useExportAccessLog(exportId: string | undefined) {
  return useQuery({
    queryKey: ["export-access-log", exportId],
    queryFn: async () => {
      if (!exportId) return [];

      const { data, error } = await supabase
        .from("data_room_access_log")
        .select("*")
        .eq("export_id", exportId)
        .order("accessed_at", { ascending: false });

      if (error) throw error;
      return data as DataRoomAccessLog[];
    },
    enabled: !!exportId,
  });
}

/**
 * Create a new data room export
 */
export function useCreateDataRoomExport() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: CreateExportParams) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Generate watermark
      const watermark = `CONFIDENTIAL - ${params.title} - Generated ${new Date().toISOString()}`;

      const { data, error } = await supabase
        .from("data_room_exports")
        .insert({
          export_type: params.exportType,
          title: params.title,
          description: params.description,
          scope_type: params.scopeType,
          organization_id: params.organizationId,
          period_start: params.periodStart,
          period_end: params.periodEnd,
          assigned_auditors: params.assignedAuditors || [],
          access_expires_at: params.accessExpiresAt,
          requested_by: user.id,
          watermark,
          content_manifest: {
            record_types: [],
            total_records: 0,
            date_range: {
              start: params.periodStart,
              end: params.periodEnd,
            },
          },
        })
        .select()
        .single();

      if (error) throw error;

      // Log the creation as an audit event
      await supabase.rpc("log_audit_event", {
        _action: "export_generated",
        _action_label: `Data room export created: ${params.title}`,
        _record_id: data.id,
        _record_type: "data_room_export",
        _details: {
          export_type: params.exportType,
          scope_type: params.scopeType,
          period_start: params.periodStart,
          period_end: params.periodEnd,
        },
      });

      return data as unknown as DataRoomExport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-room-exports"] });
    },
  });
}

/**
 * Log access to an export
 */
export function useLogExportAccess() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      exportId, 
      accessType 
    }: { 
      exportId: string; 
      accessType: "view" | "download"; 
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("data_room_access_log")
        .insert({
          export_id: exportId,
          accessed_by: user.id,
          access_type: accessType,
        });

      if (error) throw error;
    },
  });
}

/**
 * Update export status (for background processing)
 */
export function useUpdateExportStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      exportId,
      status,
      fileUrl,
      fileHash,
      fileSizeBytes,
      contentManifest,
      errorMessage,
    }: {
      exportId: string;
      status: ExportStatus;
      fileUrl?: string;
      fileHash?: string;
      fileSizeBytes?: number;
      contentManifest?: ContentManifest;
      errorMessage?: string;
    }) => {
      const updates: Record<string, unknown> = { status };

      if (status === "completed") {
        updates.completed_at = new Date().toISOString();
        if (fileUrl) updates.file_url = fileUrl;
        if (fileHash) updates.file_hash = fileHash;
        if (fileSizeBytes) updates.file_size_bytes = fileSizeBytes;
        if (contentManifest) updates.content_manifest = contentManifest;
      }

      if (status === "failed" && errorMessage) {
        updates.error_message = errorMessage;
      }

      const { error } = await supabase
        .from("data_room_exports")
        .update(updates)
        .eq("id", exportId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-room-exports"] });
    },
  });
}
