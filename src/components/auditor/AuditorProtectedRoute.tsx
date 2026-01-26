import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isExternalAuditor, isPlatformOwner } from "@/lib/permissions";
import { InstitutionalLoadingState } from "@/components/ui/institutional-states";

/**
 * AUDITOR PROTECTED ROUTE — EXTERNAL AUDITOR ACCESS CONTROL
 * 
 * Purpose: Gate access to auditor routes (/auditor/*)
 * External auditors and platform admins can access (read-only for auditors).
 */

interface AuditorProtectedRouteProps {
  children: ReactNode;
}

export function AuditorProtectedRoute({ children }: AuditorProtectedRouteProps) {
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

  // Check auditor access (external_auditor or platform_admin)
  const canAccess = isExternalAuditor(profile) || isPlatformOwner(profile);
  
  if (!canAccess) {
    return <Navigate to="/workspaces" replace />;
  }

  return <>{children}</>;
}
