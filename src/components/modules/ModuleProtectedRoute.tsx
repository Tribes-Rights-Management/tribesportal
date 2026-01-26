import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserModuleAccess } from "@/hooks/useUserModuleAccess";
import { 
  isPlatformOwner, 
  canAccessOrgModule,
  hasAdminModuleAccess,
  hasLicensingModuleAccess 
} from "@/lib/permissions";
import { InstitutionalLoadingState } from "@/components/ui/institutional-states";
import type { Database } from "@/integrations/supabase/types";

type ModuleType = Database["public"]["Enums"]["module_type"];

/**
 * MODULE PROTECTED ROUTE — UNIFIED ACCESS CONTROL
 * 
 * Purpose: Gate access to first-class modules (Licensing, Admin)
 * based on module_access table and centralized permission helpers.
 * 
 * Access hierarchy:
 * 1. Platform admins: Full access to everything
 * 2. Module access grants: From module_access table (org-scoped)
 * 
 * If user lacks permission:
 * - Surface is NOT rendered
 * - Redirect to /workspaces
 */

interface ModuleProtectedRouteProps {
  children: ReactNode;
  /** The module to check access for */
  requiredModule: ModuleType;
  /** Optional fallback path (defaults to /workspaces) */
  fallbackPath?: string;
}

export function ModuleProtectedRoute({ 
  children, 
  requiredModule,
  fallbackPath = "/workspaces"
}: ModuleProtectedRouteProps) {
  const { accessState, profile, activeTenant } = useAuth();
  const { moduleAccessRecords, isLoading } = useUserModuleAccess();
  const location = useLocation();

  // Loading state
  if (accessState === "loading" || isLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--platform-canvas)' }}
      >
        <InstitutionalLoadingState message="Verifying access" />
      </div>
    );
  }

  // Unauthenticated - redirect to sign in
  if (accessState === "unauthenticated") {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // No profile or suspended - redirect to error
  if (accessState === "no-profile" || accessState === "suspended-profile") {
    return <Navigate to="/auth/error" replace />;
  }

  // Suspended access
  if (accessState === "suspended-access") {
    return <Navigate to="/app/suspended" replace />;
  }

  // Platform admins have full access to all modules
  if (isPlatformOwner(profile)) {
    return <>{children}</>;
  }

  // Pending approval or no access request
  if (accessState === "pending-approval" || accessState === "no-access-request") {
    return <Navigate to="/auth/unauthorized" replace />;
  }

  // Check module access based on active org context
  const moduleAccessForCheck = moduleAccessRecords.map(r => ({
    organization_id: r.organization_id,
    module: r.module,
    access_level: r.access_level,
    revoked_at: r.revoked_at,
  }));

  // If no active tenant, check if user has ANY access to this module
  if (!activeTenant) {
    const hasAnyAccess = requiredModule === "admin" 
      ? hasAdminModuleAccess(profile, moduleAccessForCheck)
      : hasLicensingModuleAccess(profile, moduleAccessForCheck);
    
    if (!hasAnyAccess) {
      return <Navigate to={fallbackPath} replace />;
    }
    return <>{children}</>;
  }

  // Check specific org + module access - DEFAULT DENY
  const hasAccess = canAccessOrgModule(
    profile,
    moduleAccessForCheck,
    activeTenant.tenant_id,
    requiredModule
  );

  if (!hasAccess) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
