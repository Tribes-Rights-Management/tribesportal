import { useAuth } from "@/contexts/AuthContext";
import { useRoleAccess } from "@/hooks/useRoleAccess";

/**
 * MODULE ACCESS HELPERS — CENTRALIZED PERMISSION CHECKS
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * Single source of truth for module visibility on Modules Home.
 * These helpers determine which tiles are shown to each user.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface ModuleAccess {
  /** System Console — platform_admin only */
  canAccessSystemConsole: boolean;
  /** Help Workstation — platform_admin OR (platform_user + can_manage_help) */
  canAccessHelpWorkstation: boolean;
  /** Tribes Licensing — platform_admin OR users with licensing.view permission */
  canAccessTribesLicensing: boolean;
  /** Tribes Admin — platform_admin OR users with portal.view permission */
  canAccessTribesAdmin: boolean;
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

  // System Console: Only platform admins (external auditors have their own /auditor route)
  const canAccessSystemConsole = canAccessAdmin && !isExternalAuditor;

  // Help Workstation: Platform admins OR platform_user with can_manage_help capability
  const canAccessHelpWorkstation = isPlatformAdmin || 
    (profile?.platform_role === 'platform_user' && profile?.can_manage_help === true);

  // Tribes Licensing: Platform admins OR users with licensing.view permission
  const canAccessTribesLicensing = isPlatformAdmin || canAccessLicensing;

  // Tribes Admin: Platform admins OR users with portal.view permission
  const canAccessTribesAdmin = isPlatformAdmin || canAccessPortal;

  return {
    canAccessSystemConsole,
    canAccessHelpWorkstation,
    canAccessTribesLicensing,
    canAccessTribesAdmin,
  };
}
