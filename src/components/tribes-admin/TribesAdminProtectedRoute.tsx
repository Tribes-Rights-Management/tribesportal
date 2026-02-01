import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { InstitutionalLoadingState } from "@/components/ui/institutional-states";

/**
 * TRIBES ADMIN PROTECTED ROUTE — AUTHENTICATED USER ACCESS
 * 
 * Gates access to the Tribes Admin workstation (song catalog management).
 * 
 * Access requires:
 * 1. Active authentication with profile
 * 
 * Future: Add role-based access control for specific permissions
 */

interface TribesAdminProtectedRouteProps {
  children: ReactNode;
}

export function TribesAdminProtectedRoute({ children }: TribesAdminProtectedRouteProps) {
  const { accessState } = useAuth();

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

  // Unauthenticated
  if (accessState === "unauthenticated") {
    return <Navigate to="/sign-in" replace />;
  }

  // No profile or suspended
  if (accessState === "no-profile" || accessState === "suspended-profile") {
    return <Navigate to="/auth/error" replace />;
  }

  // Allow all authenticated users for now
  return <>{children}</>;
}
