import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleAccess, Permission } from "@/hooks/useRoleAccess";
import { InstitutionalLoadingState, AccessRestrictedState } from "@/components/ui/institutional-states";

/**
 * MODULE PROTECTED ROUTE — DEFAULT DENY ACCESS CONTROL
 * 
 * Purpose: Gate access to first-class modules (Licensing, Portal)
 * based on explicit permission checks.
 * 
 * If user lacks permission:
 * - Surface is NOT rendered
 * - Redirect to appropriate page
 * - No "request access" prompts
 */

interface ModuleProtectedRouteProps {
  children: ReactNode;
  requiredPermission: Permission;
  fallbackPath?: string;
}

export function ModuleProtectedRoute({ 
  children, 
  requiredPermission,
  fallbackPath = "/auth/unauthorized"
}: ModuleProtectedRouteProps) {
  const { accessState, isPlatformAdmin } = useAuth();
  const { hasPermission } = useRoleAccess();
  const location = useLocation();

  // Loading state
  if (accessState === "loading") {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--platform-canvas)' }}
      >
        <InstitutionalLoadingState message="Loading data" />
      </div>
    );
  }

  // Unauthenticated - redirect to sign in
  if (accessState === "unauthenticated") {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  // No profile or suspended - redirect to error
  if (accessState === "no-profile" || accessState === "suspended-profile") {
    return <Navigate to="/auth/error" replace />;
  }

  // Suspended access
  if (accessState === "suspended-access") {
    return <Navigate to="/app/suspended" replace />;
  }

  // Platform admins have full access
  if (isPlatformAdmin) {
    return <>{children}</>;
  }

  // Pending approval or no access request
  if (accessState === "pending-approval" || accessState === "no-access-request") {
    return <Navigate to="/auth/unauthorized" replace />;
  }

  // Check specific permission - DEFAULT DENY
  if (!hasPermission(requiredPermission)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
