/**
 * READ-ONLY API TOKEN HOOKS
 * 
 * Manages API tokens for external system access.
 * Tokens are scope-bound, time-bound, and auditable.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ApiTokenScope = Database["public"]["Enums"]["api_token_scope"];
export type ApiTokenStatus = Database["public"]["Enums"]["api_token_status"];

export interface ApiToken {
  id: string;
  name: string;
  description: string | null;
  token_hash: string;
  scope: ApiTokenScope;
  tenant_id: string | null;
  granted_by: string;
  granted_to_email: string;
  status: ApiTokenStatus;
  expires_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
  revoked_by: string | null;
  created_at: string;
}

export interface ApiAccessLog {
  id: string;
  token_id: string;
  endpoint: string;
  method: string;
  scope_type: string;
  tenant_id: string | null;
  response_status: number;
  response_time_ms: number | null;
  ip_address: string | null;
  user_agent: string | null;
  accessed_at: string;
}

export interface CreateTokenParams {
  name: string;
  description?: string;
  scope: ApiTokenScope;
  tenant_id?: string;
  granted_to_email: string;
  expires_in_days: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// TOKEN MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch all API tokens (Platform admins only)
 */
export function useApiTokens(options?: { status?: ApiTokenStatus; tenantId?: string }) {
  const { isPlatformAdmin } = useAuth();

  return useQuery({
    queryKey: ["api-tokens", options?.status, options?.tenantId],
    queryFn: async () => {
      let query = supabase
        .from("api_tokens")
        .select("*")
        .order("created_at", { ascending: false });

      if (options?.status) {
        query = query.eq("status", options.status);
      }

      if (options?.tenantId) {
        query = query.eq("tenant_id", options.tenantId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as ApiToken[];
    },
    enabled: isPlatformAdmin,
  });
}

/**
 * Create a new API token
 */
export function useCreateApiToken() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateTokenParams) => {
      if (!user) throw new Error("Not authenticated");

      // Generate a secure token
      const tokenBytes = new Uint8Array(32);
      crypto.getRandomValues(tokenBytes);
      const rawToken = Array.from(tokenBytes)
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

      // Hash the token for storage
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(rawToken));
      const tokenHash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + params.expires_in_days);

      const { data, error } = await supabase
        .from("api_tokens")
        .insert({
          name: params.name,
          description: params.description,
          token_hash: tokenHash,
          scope: params.scope,
          tenant_id: params.tenant_id,
          granted_by: user.id,
          granted_to_email: params.granted_to_email,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Log the token creation
      await supabase.rpc("log_audit_event", {
        _action: "record_created",
        _action_label: `API token created: ${params.name}`,
        _record_id: data.id,
        _record_type: "api_token",
        _details: {
          scope: params.scope,
          granted_to: params.granted_to_email,
          expires_at: expiresAt.toISOString(),
        },
      });

      // Return both the stored token and the raw token (only shown once)
      return {
        token: data as unknown as ApiToken,
        rawToken: `tribes_${rawToken}`,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-tokens"] });
    },
  });
}

/**
 * Revoke an API token
 */
export function useRevokeApiToken() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tokenId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("api_tokens")
        .update({
          status: "revoked",
          revoked_at: new Date().toISOString(),
          revoked_by: user.id,
        })
        .eq("id", tokenId);

      if (error) throw error;

      // Log the revocation
      await supabase.rpc("log_audit_event", {
        _action: "access_revoked",
        _action_label: "API token revoked",
        _record_id: tokenId,
        _record_type: "api_token",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-tokens"] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// ACCESS LOGS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch API access logs
 */
export function useApiAccessLogs(options?: { tokenId?: string; limit?: number }) {
  const { isPlatformAdmin, profile } = useAuth();
  const isAuditor = profile?.platform_role === "external_auditor";

  return useQuery({
    queryKey: ["api-access-logs", options?.tokenId, options?.limit],
    queryFn: async () => {
      let query = supabase
        .from("api_access_logs")
        .select(`
          *,
          token:api_tokens(name, scope, granted_to_email)
        `)
        .order("accessed_at", { ascending: false })
        .limit(options?.limit || 100);

      if (options?.tokenId) {
        query = query.eq("token_id", options.tokenId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: isPlatformAdmin || isAuditor,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

export const SCOPE_LABELS: Record<ApiTokenScope, string> = {
  platform_read: "Platform (Read-Only)",
  organization_read: "Organization (Read-Only)",
};

export const STATUS_STYLES: Record<ApiTokenStatus, { bg: string; text: string }> = {
  active: { bg: "bg-emerald-500/20", text: "text-emerald-600" },
  revoked: { bg: "bg-destructive/20", text: "text-destructive" },
  expired: { bg: "bg-muted", text: "text-muted-foreground" },
};
