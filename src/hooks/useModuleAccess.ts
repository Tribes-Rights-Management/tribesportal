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
 */

interface ModuleAccess {
  canAccessSystemConsole: boolean;
  canAccessHelpWorkstation: boolean;
  canAccessTribesLicensing: boolean;
  canAccessTribesAdmin: boolean;
  isLoading: boolean;
}

export function useModuleAccess(): ModuleAccess {
  const { profile, isPlatformAdmin, activeTenant } = useAuth();
  
  // Check module_access table for explicit grants
  const { hasAdminAccess, hasLicensingAccess, moduleAccessRecords, isLoading } = useUserModuleAccess();

  // For org-scoped modules, check if user has access for the ACTIVE organization
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
  const canAccessSystemConsole = canAccessConsole(profile);

  // Help Workstation: Platform admins OR platform_user with can_manage_help capability
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
  };
}
