/**
 * CENTRALIZED PERMISSION HELPERS — SINGLE SOURCE OF TRUTH
 * 
 * This file provides all permission checks for the Tribes platform.
 * Use these helpers everywhere instead of inline role checks.
 * 
 * Architecture:
 * - Platform roles: platform_admin, platform_user, external_auditor
 * - Org roles: org_owner, org_admin, org_staff, org_client
 * - Module access: admin, licensing (from module_access table)
 */

import type { UserProfile } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type ModuleType = Database["public"]["Enums"]["module_type"];

// ═══════════════════════════════════════════════════════════════════════════
// PLATFORM-LEVEL PERMISSIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if user is a Platform Owner (executive access to everything)
 */
export function isPlatformOwner(profile: UserProfile | null): boolean {
  return profile?.platform_role === "platform_admin" && profile?.status === "active";
}

/**
 * Check if user is Platform Staff (internal operations team)
 */
export function isPlatformStaff(profile: UserProfile | null): boolean {
  return profile?.platform_role === "platform_user" && profile?.status === "active";
}

/**
 * Check if user is External Auditor (read-only access)
 */
export function isExternalAuditor(profile: UserProfile | null): boolean {
  return profile?.platform_role === "external_auditor" && profile?.status === "active";
}

/**
 * Check if user can access System Console (/console)
 * Only platform_admin (platform owner) can access
 */
export function canAccessConsole(profile: UserProfile | null): boolean {
  return isPlatformOwner(profile);
}

/**
 * Check if user can READ Help content (all authenticated users)
 */
export function canReadHelp(profile: UserProfile | null): boolean {
  return profile?.status === "active";
}

/**
 * Check if user can MANAGE Help content (create/edit/delete)
 * Only platform_admin or platform_user with can_manage_help capability
 */
export function canManageHelp(profile: UserProfile | null): boolean {
  if (!profile || profile.status !== "active") return false;
  if (profile.platform_role === "platform_admin") return true;
  if (profile.platform_role === "platform_user" && profile.can_manage_help) return true;
  return false;
}

// ═══════════════════════════════════════════════════════════════════════════
// ORGANIZATION-LEVEL PERMISSIONS
// ═══════════════════════════════════════════════════════════════════════════

interface OrgMembership {
  tenant_id: string;
  status: string;
  org_role?: string;
  role?: string;
}

/**
 * Check if user is an admin (owner or admin) of a specific organization
 */
export function isOrgAdmin(
  memberships: OrgMembership[],
  orgId: string
): boolean {
  const membership = memberships.find(m => m.tenant_id === orgId && m.status === "active");
  if (!membership) return false;
  return membership.org_role === "org_owner" || membership.org_role === "org_admin";
}

/**
 * Check if user is the owner of a specific organization
 */
export function isOrgOwner(
  memberships: OrgMembership[],
  orgId: string
): boolean {
  const membership = memberships.find(m => m.tenant_id === orgId && m.status === "active");
  return membership?.org_role === "org_owner";
}

/**
 * Check if user has an active membership in a specific organization
 */
export function isActiveMember(
  memberships: OrgMembership[],
  orgId: string
): boolean {
  return memberships.some(m => m.tenant_id === orgId && m.status === "active");
}

// ═══════════════════════════════════════════════════════════════════════════
// MODULE ACCESS PERMISSIONS
// ═══════════════════════════════════════════════════════════════════════════

interface ModuleAccessRecord {
  organization_id: string;
  module: ModuleType;
  access_level: string;
  revoked_at: string | null;
}

/**
 * Check if user can access a specific module for a specific organization
 * Returns true if:
 * 1. User is platform_admin (platform owner), OR
 * 2. User has explicit module_access record for this org + module
 */
export function canAccessOrgModule(
  profile: UserProfile | null,
  moduleAccess: ModuleAccessRecord[],
  orgId: string,
  module: ModuleType
): boolean {
  // Platform admins have access to all modules
  if (isPlatformOwner(profile)) return true;

  // Check for explicit module_access record
  return moduleAccess.some(
    ma =>
      ma.organization_id === orgId &&
      ma.module === module &&
      ma.revoked_at === null
  );
}

/**
 * Check if user can access Admin module for any organization they belong to
 */
export function hasAdminModuleAccess(
  profile: UserProfile | null,
  moduleAccess: ModuleAccessRecord[]
): boolean {
  if (isPlatformOwner(profile)) return true;
  return moduleAccess.some(ma => ma.module === "admin" && ma.revoked_at === null);
}

/**
 * Check if user can access Licensing module for any organization they belong to
 */
export function hasLicensingModuleAccess(
  profile: UserProfile | null,
  moduleAccess: ModuleAccessRecord[]
): boolean {
  if (isPlatformOwner(profile)) return true;
  return moduleAccess.some(ma => ma.module === "licensing" && ma.revoked_at === null);
}

// ═══════════════════════════════════════════════════════════════════════════
// COMBINED ACCESS CHECKS (for /workspaces tile visibility)
// ═══════════════════════════════════════════════════════════════════════════

export interface WorkspaceAccess {
  canAccessSystemConsole: boolean;
  canAccessHelpWorkstation: boolean;
  canAccessTribesAdmin: boolean;
  canAccessTribesLicensing: boolean;
}

/**
 * Get all workspace access flags for a user
 */
export function getWorkspaceAccess(
  profile: UserProfile | null,
  moduleAccess: ModuleAccessRecord[]
): WorkspaceAccess {
  return {
    canAccessSystemConsole: canAccessConsole(profile),
    canAccessHelpWorkstation: canManageHelp(profile),
    canAccessTribesAdmin: hasAdminModuleAccess(profile, moduleAccess),
    canAccessTribesLicensing: hasLicensingModuleAccess(profile, moduleAccess),
  };
}
