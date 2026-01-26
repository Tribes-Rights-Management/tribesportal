import { useAuth } from "@/contexts/AuthContext";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { useUserModuleAccess } from "@/hooks/useUserModuleAccess";

/**
 * MODULE ACCESS HELPERS — CENTRALIZED PERMISSION CHECKS
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * Single source of truth for module visibility on Modules Home.
 * These helpers determine which tiles are shown to each user.
 * 
 * PERMISSION HIERARCHY:
 * 1. Platform admins → full access to all modules
 * 2. Module access records → explicit grants via invitations
 * 3. Legacy role-based access → fallback for existing users
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface ModuleAccess {
  /** System Console — platform_admin only */
  canAccessSystemConsole: boolean;
  /** Help Workstation — platform_admin OR (platform_user + can_manage_help) */
  canAccessHelpWorkstation: boolean;
  /** Tribes Licensing — platform_admin OR users with licensing module access */
  canAccessTribesLicensing: boolean;
  /** Tribes Admin — platform_admin OR users with admin module access */
  canAccessTribesAdmin: boolean;
  /** Whether access data is still loading */
  isLoading: boolean;
}

export function useModuleAccess(): ModuleAccess {
  const { profile, isPlatformAdmin } = useAuth();
  const { 
    canAccessAdmin,
    canAccessHelp,
    canAccessLicensing,
    canAccessPortal,
    isExternalAuditor,
  } = useRoleAccess();
  
  // Check module_access table for explicit grants
  const { hasAdminAccess, hasLicensingAccess, isLoading } = useUserModuleAccess();

  // System Console: Only platform admins (external auditors have their own /auditor route)
  const canAccessSystemConsole = (canAccessAdmin && !isExternalAuditor) || isPlatformAdmin;

  // Help Workstation: Platform admins OR platform_user with can_manage_help capability
  const canAccessHelpWorkstation = isPlatformAdmin || 
    (profile?.platform_role === 'platform_user' && profile?.can_manage_help === true);

  // Tribes Licensing: Platform admins OR users with licensing module access (from module_access table)
  // Falls back to legacy role-based check if no explicit module_access records
  const canAccessTribesLicensing = isPlatformAdmin || hasLicensingAccess || canAccessLicensing;

  // Tribes Admin: Platform admins OR users with admin module access (from module_access table)
  // Falls back to legacy role-based check if no explicit module_access records
  const canAccessTribesAdmin = isPlatformAdmin || hasAdminAccess || canAccessPortal;

  return {
    canAccessSystemConsole,
    canAccessHelpWorkstation,
    canAccessTribesLicensing,
    canAccessTribesAdmin,
    isLoading,
  };
}
