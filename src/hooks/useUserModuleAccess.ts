import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type ModuleType = Database["public"]["Enums"]["module_type"];
type AccessLevel = Database["public"]["Enums"]["access_level"];

interface ModuleAccessRecord {
  id: string;
  module: ModuleType;
  access_level: AccessLevel;
  organization_id: string;
  user_id: string;
  granted_at: string;
  revoked_at: string | null;
}

interface UserModuleAccessResult {
  /** All module access records for the current user */
  moduleAccessRecords: ModuleAccessRecord[];
  /** Whether the user has any active access to the admin module */
  hasAdminAccess: boolean;
  /** Whether the user has any active access to the licensing module */
  hasLicensingAccess: boolean;
  /** Get access level for a specific module and organization */
  getAccessLevel: (module: ModuleType, organizationId?: string) => AccessLevel | null;
  /** Whether the data is still loading */
  isLoading: boolean;
  /** Any error that occurred */
  error: Error | null;
  /** Refetch the module access data */
  refetch: () => void;
}

/**
 * Hook to fetch and check user's module_access records from the database.
 * This is the source of truth for organization-scoped module permissions.
 * 
 * SAFETY: This hook never throws - it returns safe defaults when user is not authenticated
 * or when the query fails, preventing blank screen crashes.
 */
export function useUserModuleAccess(): UserModuleAccessResult {
  const { user, activeTenant } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["user-module-access", user?.id],
    queryFn: async () => {
      // Safety: if no user, return empty array (don't throw)
      if (!user?.id) return [];

      try {
        const { data, error } = await supabase
          .from("module_access")
          .select("id, module, access_level, organization_id, user_id, granted_at, revoked_at")
          .eq("user_id", user.id)
          .is("revoked_at", null);

        if (error) {
          console.error("[useUserModuleAccess] Query error:", error);
          return []; // Return empty array on error, don't crash
        }
        return (data || []) as ModuleAccessRecord[];
      } catch (err) {
        console.error("[useUserModuleAccess] Unexpected error:", err);
        return []; // Return empty array on exception, don't crash
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Always provide safe defaults
  const moduleAccessRecords = data || [];

  // Check if user has any active admin module access
  const hasAdminAccess = moduleAccessRecords.some(
    (record) => record.module === "admin" && !record.revoked_at
  );

  // Check if user has any active licensing module access
  const hasLicensingAccess = moduleAccessRecords.some(
    (record) => record.module === "licensing" && !record.revoked_at
  );

  // Get access level for a specific module and optionally organization
  const getAccessLevel = (module: ModuleType, organizationId?: string): AccessLevel | null => {
    const targetOrgId = organizationId || activeTenant?.tenant_id;
    
    const record = moduleAccessRecords.find(
      (r) =>
        r.module === module &&
        !r.revoked_at &&
        (targetOrgId ? r.organization_id === targetOrgId : true)
    );

    return record?.access_level || null;
  };

  return {
    moduleAccessRecords,
    hasAdminAccess,
    hasLicensingAccess,
    getAccessLevel,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
