import { useAuth } from "@/contexts/AuthContext";
import { useUserModuleAccess } from "./useUserModuleAccess";
import { 
  canAccessConsole, 
  canManageHelp,
} from "@/lib/permissions";

/**
 * MODULE ACCESS HOOK — WORKSPACE TILE GATING
 * 
 * Determines which workstations/modules are visible to the current user.
 * Uses the centralized permission helpers from lib/permissions.ts.
 * 
 * Access hierarchy:
 * 1. Platform admins (platform_owner): Access to everything
 * 2. Module access grants: From module_access table (organization-scoped)
 * 3. Legacy role-based: Fallback for backward compatibility
 * 
 * SAFETY: This hook never throws - it returns safe defaults when auth is loading
 * or queries fail, preventing blank screen crashes on /workspaces.
 */

interface ModuleAccess {
  canAccessSystemConsole: boolean;
  canAccessHelpWorkstation: boolean;
  canAccessTribesLicensing: boolean;
  canAccessTribesAdmin: boolean;
  isLoading: boolean;
  hasError: boolean;
}

export function useModuleAccess(): ModuleAccess {
  const { profile, isPlatformAdmin, activeTenant, loading: authLoading } = useAuth();
  
  // Check module_access table for explicit grants
  // This hook is safe and won't throw
  const { hasAdminAccess, hasLicensingAccess, moduleAccessRecords, isLoading: moduleLoading, error } = useUserModuleAccess();

  // Combined loading state
  const isLoading = authLoading || moduleLoading;

  // For org-scoped modules, check if user has access for the ACTIVE organization
  // Safety: handle case where activeTenant is null gracefully
  const hasAdminForActiveOrg = moduleAccessRecords.some(
    (record) => 
      record.module === "admin" && 
      !record.revoked_at &&
      (activeTenant ? record.organization_id === activeTenant.tenant_id : true)
  );

  const hasLicensingForActiveOrg = moduleAccessRecords.some(
    (record) => 
      record.module === "licensing" && 
      !record.revoked_at &&
      (activeTenant ? record.organization_id === activeTenant.tenant_id : true)
  );

  // System Console: Only platform admins (platform owner)
  // Safety: canAccessConsole handles null profile gracefully
  const canAccessSystemConsole = canAccessConsole(profile);

  // Help Workstation: Platform admins OR platform_user with can_manage_help capability
  // Safety: canManageHelp handles null profile gracefully
  const canAccessHelpWorkstation = canManageHelp(profile);

  // Tribes Licensing: Platform admins OR users with licensing module access for active org
  const canAccessTribesLicensing = isPlatformAdmin || hasLicensingForActiveOrg || hasLicensingAccess;

  // Tribes Admin: Platform admins OR users with admin module access for active org
  const canAccessTribesAdmin = isPlatformAdmin || hasAdminForActiveOrg || hasAdminAccess;

  return {
    canAccessSystemConsole,
    canAccessHelpWorkstation,
    canAccessTribesLicensing,
    canAccessTribesAdmin,
    isLoading,
    hasError: !!error,
  };
}
