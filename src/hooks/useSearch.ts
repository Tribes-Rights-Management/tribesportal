/**
 * SCOPE-SAFE SEARCH HOOKS
 * 
 * Provides search functionality that respects authority boundaries.
 * Search never reveals records outside the user's authorized scope.
 */

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type SearchEntityType = 
  | "contract" 
  | "invoice" 
  | "payment" 
  | "member" 
  | "organization"
  | "all";

export type SearchScopeType = "platform" | "organization";

export interface SearchResult {
  entity_type: string;
  entity_id: string;
  title: string;
  subtitle: string | null;
  entity_status: string | null;
  entity_date: string | null;
  rank: number;
}

export interface SearchParams {
  query: string;
  scopeType: SearchScopeType;
  tenantId?: string;
  entityTypes?: SearchEntityType[];
  limit?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Main search hook with scope awareness
 */
export function useSearch() {
  const { activeTenant, profile } = useAuth();
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);

  const {
    data: results,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["search", searchParams],
    queryFn: async () => {
      if (!searchParams || !searchParams.query.trim()) {
        return [];
      }

      const { data, error } = await supabase.rpc("search_entities", {
        p_query: searchParams.query,
        p_scope_type: searchParams.scopeType,
        p_tenant_id: searchParams.tenantId || null,
        p_entity_types: searchParams.entityTypes?.filter(t => t !== "all") || null,
        p_limit: searchParams.limit || 20,
      });

      if (error) throw error;
      return data as SearchResult[];
    },
    enabled: !!searchParams && !!searchParams.query.trim(),
  });

  const search = useCallback((params: Omit<SearchParams, "tenantId"> & { tenantId?: string }) => {
    // Auto-set tenant ID for org scope if not provided
    const tenantId = params.scopeType === "organization" 
      ? params.tenantId || activeTenant?.tenant_id 
      : undefined;

    setSearchParams({
      ...params,
      tenantId,
    });
  }, [activeTenant]);

  const clearSearch = useCallback(() => {
    setSearchParams(null);
  }, []);

  // Determine available scopes based on user role
  const isPlatformAdmin = profile?.platform_role === "platform_admin";
  const availableScopes: SearchScopeType[] = isPlatformAdmin 
    ? ["platform", "organization"] 
    : ["organization"];

  // Determine available entity types based on scope and role
  const getAvailableEntityTypes = useCallback((scope: SearchScopeType): SearchEntityType[] => {
    if (scope === "platform") {
      return ["organization", "member", "contract", "invoice", "payment"];
    }
    // Org members get limited types
    const isOrgAdmin = activeTenant?.role === "tenant_admin";
    if (isOrgAdmin) {
      return ["member", "contract", "invoice", "payment"];
    }
    return ["contract", "invoice", "payment"];
  }, [activeTenant]);

  return {
    results: results || [],
    isLoading,
    error,
    search,
    clearSearch,
    currentParams: searchParams,
    availableScopes,
    getAvailableEntityTypes,
    isPlatformAdmin,
    activeTenantId: activeTenant?.tenant_id,
    activeTenantName: activeTenant?.tenant_name,
  };
}

/**
 * Quick search for a specific entity type within org scope
 */
export function useQuickSearch(entityType: SearchEntityType) {
  const { activeTenant } = useAuth();
  const tenantId = activeTenant?.tenant_id;

  const quickSearch = useMutation({
    mutationFn: async (query: string) => {
      if (!query.trim() || !tenantId) return [];

      const { data, error } = await supabase.rpc("search_entities", {
        p_query: query,
        p_scope_type: "organization",
        p_tenant_id: tenantId,
        p_entity_types: entityType === "all" ? null : [entityType],
        p_limit: 10,
      });

      if (error) throw error;
      return data as SearchResult[];
    },
  });

  return quickSearch;
}

/**
 * Get search suggestions based on recent searches
 * (For future implementation)
 */
export function useSearchSuggestions() {
  // Placeholder for future implementation
  return {
    suggestions: [],
    isLoading: false,
  };
}
