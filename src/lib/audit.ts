import { supabase } from "@/integrations/supabase/client";

interface AuditLogParams {
  tenantId?: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
}

/**
 * Write an entry to the immutable audit log via Edge Function.
 * This ensures all audit writes go through the service role (append-only).
 */
export async function writeAuditLog(params: AuditLogParams): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("audit-log", {
      body: {
        tenant_id: params.tenantId,
        user_id: params.userId,
        action: params.action,
        resource_type: params.resourceType,
        resource_id: params.resourceId,
        details: params.details,
      },
    });

    if (error) {
      console.error("Audit log error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("Audit log exception:", err);
    return { success: false, error: "Failed to write audit log" };
  }
}

// Common audit actions
export const AuditActions = {
  // Auth
  USER_SIGNED_IN: "user_signed_in",
  USER_SIGNED_OUT: "user_signed_out",
  
  // User management
  USER_ROLE_CHANGED: "user_role_changed",
  USER_STATUS_CHANGED: "user_status_changed",
  USER_CREATED: "user_created",
  
  // Tenant management
  TENANT_CREATED: "tenant_created",
  TENANT_UPDATED: "tenant_updated",
  TENANT_MEMBERSHIP_CREATED: "tenant_membership_created",
  TENANT_MEMBERSHIP_UPDATED: "tenant_membership_updated",
  TENANT_MEMBERSHIP_REMOVED: "tenant_membership_removed",
  
  // Access provisioning
  MEMBERSHIP_APPROVED: "membership_approved",
  MEMBERSHIP_DENIED: "membership_denied",
  MEMBERSHIP_ROLE_CHANGED: "membership_role_changed",
  
  // Contact
  CONTACT_SUBMISSION_CREATED: "contact_submission_created",
  CONTACT_SUBMISSION_PROCESSED: "contact_submission_processed",
} as const;

export const ResourceTypes = {
  USER: "user",
  USER_ROLE: "user_role",
  TENANT: "tenant",
  TENANT_MEMBERSHIP: "tenant_membership",
  CONTACT_SUBMISSION: "contact_submission",
  SESSION: "session",
} as const;
