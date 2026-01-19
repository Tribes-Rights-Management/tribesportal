import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useHelpAccess } from "@/hooks/useHelpAccess";
import { InstitutionalLoadingState } from "@/components/ui/institutional-states";

/**
 * HELP PROTECTED ROUTE — COMPANY-SCOPED INTERNAL TOOL
 * 
 * Gates access to the Help backend (article/category management).
 * 
 * Access requires:
 * 1. Active authentication with profile
 * 2. Internal platform role (platform_admin or platform_user)
 * 3. can_manage_help capability = true
 * 
 * This surface is:
 * - Company-scoped (NOT workspace-scoped)
 * - Inaccessible to external users (licensing, portal, auditors)
 * - Clearly labeled as an internal company tool
 */

interface HelpProtectedRouteProps {
  children: ReactNode;
}

export function HelpProtectedRoute({ children }: HelpProtectedRouteProps) {
  const { accessState } = useAuth();
  const { canManageHelp, loading } = useHelpAccess();

  // Loading state
  if (accessState === "loading" || loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--platform-canvas)' }}
      >
        <InstitutionalLoadingState message="Verifying access" />
      </div>
    );
  }

  // Unauthenticated
  if (accessState === "unauthenticated") {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // No profile or suspended
  if (accessState === "no-profile" || accessState === "suspended-profile") {
    return <Navigate to="/auth/error" replace />;
  }

  // Check Help capability
  if (!canManageHelp) {
    return <Navigate to="/app/restricted" replace />;
  }

  return <>{children}</>;
}
