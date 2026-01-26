import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessConsole, isExternalAuditor } from "@/lib/permissions";
import { InstitutionalLoadingState } from "@/components/ui/institutional-states";

/**
 * CONSOLE PROTECTED ROUTE — PLATFORM-LEVEL ACCESS CONTROL
 * 
 * Purpose: Gate access to System Console (/console)
 * Only platform_admin (platform owner) can access.
 * External auditors get read-only access.
 */

interface ConsoleProtectedRouteProps {
  children: ReactNode;
}

export function ConsoleProtectedRoute({ children }: ConsoleProtectedRouteProps) {
  const { accessState, profile } = useAuth();
  const location = useLocation();

  // Loading state
  if (accessState === "loading") {
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

  // Check console access (platform_admin or external_auditor for read-only)
  const canAccess = canAccessConsole(profile) || isExternalAuditor(profile);
  
  if (!canAccess) {
    return <Navigate to="/workspaces" replace />;
  }

  return <>{children}</>;
}
