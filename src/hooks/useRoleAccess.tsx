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
 */

export type Permission =
  // Platform-level permissions (platform_admin only)
  | "platform:admin"
  | "platform:manage_users"
  | "platform:manage_tenants"
  | "platform:view_audit_logs"
  | "platform:manage_security"
  // Tenant-level permissions
  | "tenant:admin"
  | "tenant:manage_members"
  | "tenant:view_reports"
  // Context-level permissions
  | "context:publishing"
  | "context:licensing"
  // Record-level permissions
  | "records:create"
  | "records:edit"
  | "records:delete"
  | "records:view"
  | "records:export";

interface RoleAccessResult {
  // Core checks
  isPlatformAdmin: boolean;
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
  
  // Surface visibility helpers
  shouldRenderSurface: (requiredPermission: Permission) => boolean;
  shouldRenderNavItem: (requiredPermission: Permission) => boolean;
}

/**
 * Role-based access hook for surface pruning
 * 
 * Usage:
 * const { hasPermission, shouldRenderSurface } = useRoleAccess();
 * 
 * // In components:
 * {shouldRenderSurface("platform:admin") && <AdminSection />}
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
    const isTenantAdmin = hasPortalRole("tenant_admin");
    const isMember = hasPortalRole("tenant_user");
    const isViewer = hasPortalRole("viewer");

    // Permission resolution based on role hierarchy
    const hasPermission = (permission: Permission): boolean => {
      // Platform admins have all permissions
      if (isPlatformAdmin) return true;

      switch (permission) {
        // Platform-level: admin only
        case "platform:admin":
        case "platform:manage_users":
        case "platform:manage_tenants":
        case "platform:view_audit_logs":
        case "platform:manage_security":
          return isPlatformAdmin;

        // Tenant-level: tenant_admin or above
        case "tenant:admin":
        case "tenant:manage_members":
          return isTenantAdmin;
        
        case "tenant:view_reports":
          return isTenantAdmin || isMember;

        // Context access
        case "context:publishing":
          return authCanAccessContext("publishing");
        case "context:licensing":
          return authCanAccessContext("licensing");

        // Record operations
        case "records:create":
        case "records:edit":
        case "records:delete":
          return isTenantAdmin || isMember;
        
        case "records:view":
        case "records:export":
          return isTenantAdmin || isMember || isViewer;

        default:
          return false;
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

    // Surface visibility: if no permission, surface is NOT rendered
    // No disabled buttons, no placeholders
    const shouldRenderSurface = (requiredPermission: Permission): boolean => {
      return hasPermission(requiredPermission);
    };

    const shouldRenderNavItem = (requiredPermission: Permission): boolean => {
      return hasPermission(requiredPermission);
    };

    return {
      isPlatformAdmin,
      isTenantAdmin,
      isViewer,
      isMember,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      canAccessContext,
      canAccessAdmin,
      shouldRenderSurface,
      shouldRenderNavItem,
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
