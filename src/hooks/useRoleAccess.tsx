import React, { useMemo } from "react";
import { useAuth, PortalRole, PortalContext, PlatformRole } from "@/contexts/AuthContext";

/**
 * ROLE-BASED ACCESS HOOK — INSTITUTIONAL SURFACE PRUNING
 * 
 * Purpose: Enable strict role-based visibility. No decorative access.
 * No disabled buttons. No "request access" prompts.
 * 
 * Role hierarchy:
 * - Platform Administrator: Full platform visibility
 * - Organization Admin: Organization-scoped visibility
 * - Member / Viewer: Read-only, scoped surfaces only
 * 
 * Permission Namespaces:
 * - licensing.* : Licensing module permissions
 * - portal.* : Client Portal module permissions
 * - platform:* : Platform administration permissions
 * - tenant:* : Tenant-level permissions
 * - records:* : Record-level CRUD permissions
 */

export type Permission =
  // Platform-level permissions (platform_admin only)
  | "platform:admin"
  | "platform:manage_users"
  | "platform:manage_tenants"
  | "platform:view_audit_logs"
  | "platform:manage_security"
  // External auditor permissions (read-only)
  | "auditor:view_logs"
  | "auditor:view_licensing"
  | "auditor:view_agreements"
  | "auditor:view_disclosures"
  // Tenant-level permissions
  | "tenant:admin"
  | "tenant:manage_members"
  | "tenant:view_reports"
  // Context-level permissions (legacy)
  | "context:publishing"
  | "context:licensing"
  // Record-level permissions
  | "records:create"
  | "records:edit"
  | "records:delete"
  | "records:view"
  | "records:export"
  // ═══════════════════════════════════════════════════════════════════════════
  // LICENSING MODULE PERMISSIONS — DEFAULT DENY
  // ═══════════════════════════════════════════════════════════════════════════
  | "licensing.view"      // View licensing module and data
  | "licensing.manage"    // Create/edit licensing requests and agreements
  | "licensing.approve"   // Approve/reject licensing requests
  // ═══════════════════════════════════════════════════════════════════════════
  // CLIENT PORTAL MODULE PERMISSIONS — DEFAULT DENY
  // ═══════════════════════════════════════════════════════════════════════════
  | "portal.view"         // View client portal module
  | "portal.download"     // Download statements and documents
  | "portal.submit";      // Submit requests/data through portal

/**
 * Module definitions for route prefixes and permission namespaces
 */
export const MODULES = {
  licensing: {
    routePrefix: "/licensing",
    permissionNamespace: "licensing",
    navLabel: "Licensing",
    requiredPermission: "licensing.view" as Permission,
  },
  portal: {
    routePrefix: "/portal",
    permissionNamespace: "portal",
    navLabel: "Client Portal",
    requiredPermission: "portal.view" as Permission,
  },
  admin: {
    routePrefix: "/admin",
    permissionNamespace: "platform",
    navLabel: "Administration",
    requiredPermission: "platform:admin" as Permission,
  },
  auditor: {
    routePrefix: "/auditor",
    permissionNamespace: "auditor",
    navLabel: "Auditor Access",
    requiredPermission: "auditor:view_logs" as Permission,
  },
} as const;

interface RoleAccessResult {
  // Core checks
  isPlatformAdmin: boolean;
  isExternalAuditor: boolean;
  isTenantAdmin: boolean;
  isViewer: boolean;
  isMember: boolean;
  
  // Permission checks
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  
  // Context access
  canAccessContext: (context: PortalContext) => boolean;
  canAccessAdmin: boolean;
  canAccessAuditor: boolean;
  
  // Module access (new first-class modules)
  canAccessLicensing: boolean;
  canAccessPortal: boolean;
  
  // Surface visibility helpers
  shouldRenderSurface: (requiredPermission: Permission) => boolean;
  shouldRenderNavItem: (requiredPermission: Permission) => boolean;
  
  // Read-only mode (for auditors)
  isReadOnlyMode: boolean;
  
  // Navigation visibility
  visibleModules: Array<{ key: string; label: string; path: string }>;
}

/**
 * Role-based access hook for surface pruning
 * 
 * Usage:
 * const { hasPermission, shouldRenderSurface, visibleModules } = useRoleAccess();
 * 
 * // In components:
 * {shouldRenderSurface("licensing.view") && <LicensingSection />}
 */
export function useRoleAccess(): RoleAccessResult {
  const { 
    profile, 
    activeTenant, 
    isPlatformAdmin: authIsPlatformAdmin,
    canAccessContext: authCanAccessContext,
    hasPortalRole 
  } = useAuth();

  const result = useMemo(() => {
    // Core role checks
    const isPlatformAdmin = authIsPlatformAdmin;
    const isExternalAuditor = profile?.platform_role === 'external_auditor' && profile?.status === 'active';
    const isTenantAdmin = hasPortalRole("tenant_admin");
    const isMember = hasPortalRole("tenant_user");
    const isViewer = hasPortalRole("viewer");

    // Determine user's effective role tier for permission resolution
    // Role tiers: platform_admin > external_auditor (read-only) > tenant_admin > tenant_user > viewer
    const isOrgAdmin = isTenantAdmin;
    const isClient = isViewer || (!isPlatformAdmin && !isExternalAuditor && !isTenantAdmin && !isMember);

    // Read-only mode for external auditors (no action buttons)
    const isReadOnlyMode = isExternalAuditor;

    // Permission resolution based on role hierarchy with DEFAULT DENY
    const hasPermission = (permission: Permission): boolean => {
      // Platform admins have all permissions
      if (isPlatformAdmin) return true;

      // External auditors have specific read-only permissions
      if (isExternalAuditor) {
        switch (permission) {
          case "auditor:view_logs":
          case "auditor:view_licensing":
          case "auditor:view_agreements":
          case "auditor:view_disclosures":
          case "records:view":
            return true;
          default:
            return false; // External auditors can ONLY view, not create/edit/delete
        }
      }

      switch (permission) {
        // ═══════════════════════════════════════════════════════════════════════
        // PLATFORM-LEVEL PERMISSIONS — platform_admin only
        // ═══════════════════════════════════════════════════════════════════════
        case "platform:admin":
        case "platform:manage_users":
        case "platform:manage_tenants":
        case "platform:view_audit_logs":
        case "platform:manage_security":
          return false; // DEFAULT DENY for non-admins

        // ═══════════════════════════════════════════════════════════════════════
        // EXTERNAL AUDITOR PERMISSIONS — read-only
        // ═══════════════════════════════════════════════════════════════════════
        case "auditor:view_logs":
        case "auditor:view_licensing":
        case "auditor:view_agreements":
        case "auditor:view_disclosures":
          return false; // Only external auditors and platform admins

        // ═══════════════════════════════════════════════════════════════════════
        // TENANT-LEVEL PERMISSIONS
        // ═══════════════════════════════════════════════════════════════════════
        case "tenant:admin":
        case "tenant:manage_members":
          return isOrgAdmin;
        
        case "tenant:view_reports":
          return isOrgAdmin || isMember;

        // ═══════════════════════════════════════════════════════════════════════
        // CONTEXT ACCESS (legacy compatibility)
        // ═══════════════════════════════════════════════════════════════════════
        case "context:publishing":
          return authCanAccessContext("publishing");
        case "context:licensing":
          return authCanAccessContext("licensing");

        // ═══════════════════════════════════════════════════════════════════════
        // RECORD OPERATIONS
        // ═══════════════════════════════════════════════════════════════════════
        case "records:create":
        case "records:edit":
        case "records:delete":
          return isOrgAdmin || isMember;
        
        case "records:view":
        case "records:export":
          return isOrgAdmin || isMember || isViewer;

        // ═══════════════════════════════════════════════════════════════════════
        // LICENSING MODULE PERMISSIONS — DEFAULT DENY
        // ═══════════════════════════════════════════════════════════════════════
        case "licensing.view":
          // Platform Admin: YES
          // Org Admin: YES (if context allowed)
          // Client: NO
          return isOrgAdmin && authCanAccessContext("licensing");
        
        case "licensing.manage":
          // Platform Admin: YES
          // Org Admin: YES (if context allowed)
          // Client: NO
          return isOrgAdmin && authCanAccessContext("licensing");
        
        case "licensing.approve":
          // Platform Admin: YES
          // Org Admin: NO (requires platform-level approval)
          // Client: NO
          return false; // Only platform admins

        // ═══════════════════════════════════════════════════════════════════════
        // CLIENT PORTAL PERMISSIONS — DEFAULT DENY
        // ═══════════════════════════════════════════════════════════════════════
        case "portal.view":
          // Platform Admin: YES
          // Org Admin: YES (if context allowed)
          // Client: YES (if context allowed)
          return (isOrgAdmin || isMember || isViewer) && authCanAccessContext("publishing");
        
        case "portal.download":
          // Platform Admin: YES
          // Org Admin: YES
          // Client: YES
          return (isOrgAdmin || isMember || isViewer) && authCanAccessContext("publishing");
        
        case "portal.submit":
          // Platform Admin: YES
          // Org Admin: NO (clients submit, admins review)
          // Client: NO (readonly client role)
          return isMember && authCanAccessContext("publishing");

        default:
          return false; // DEFAULT DENY
      }
    };

    const hasAnyPermission = (permissions: Permission[]): boolean => {
      return permissions.some(hasPermission);
    };

    const hasAllPermissions = (permissions: Permission[]): boolean => {
      return permissions.every(hasPermission);
    };

    const canAccessContext = authCanAccessContext;
    const canAccessAdmin = isPlatformAdmin;
    const canAccessAuditor = isExternalAuditor || isPlatformAdmin;
    
    // First-class module access
    const canAccessLicensing = hasPermission("licensing.view");
    const canAccessPortal = hasPermission("portal.view");

    // Surface visibility: if no permission, surface is NOT rendered
    // No disabled buttons, no placeholders
    const shouldRenderSurface = (requiredPermission: Permission): boolean => {
      return hasPermission(requiredPermission);
    };

    const shouldRenderNavItem = (requiredPermission: Permission): boolean => {
      return hasPermission(requiredPermission);
    };

    // Build visible modules for navigation
    const visibleModules: Array<{ key: string; label: string; path: string }> = [];
    
    // External auditors only see their audit access
    if (isExternalAuditor) {
      visibleModules.push({
        key: "auditor",
        label: MODULES.auditor.navLabel,
        path: MODULES.auditor.routePrefix,
      });
    } else {
      if (canAccessPortal) {
        visibleModules.push({
          key: "portal",
          label: MODULES.portal.navLabel,
          path: MODULES.portal.routePrefix,
        });
      }
      
      if (canAccessLicensing) {
        visibleModules.push({
          key: "licensing",
          label: MODULES.licensing.navLabel,
          path: MODULES.licensing.routePrefix,
        });
      }
    }
    
    // Administration is only shown in dropdown, not primary nav
    // Platform admins see it in account menu

    return {
      isPlatformAdmin,
      isExternalAuditor,
      isTenantAdmin,
      isViewer,
      isMember,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      canAccessContext,
      canAccessAdmin,
      canAccessAuditor,
      canAccessLicensing,
      canAccessPortal,
      shouldRenderSurface,
      shouldRenderNavItem,
      isReadOnlyMode,
      visibleModules,
    };
  }, [
    authIsPlatformAdmin,
    hasPortalRole,
    authCanAccessContext,
    activeTenant,
    profile,
  ]);

  return result;
}

/**
 * Higher-order component for role-gated surfaces
 * 
 * Usage:
 * const AdminOnlySection = withPermission(MySection, "platform:admin");
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: Permission
): React.FC<P> {
  return function PermissionGated(props: P) {
    const { shouldRenderSurface } = useRoleAccess();
    
    if (!shouldRenderSurface(requiredPermission)) {
      return null;
    }
    
    return <Component {...props} />;
  };
}
