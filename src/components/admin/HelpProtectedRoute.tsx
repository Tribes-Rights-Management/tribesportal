import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useHelpManagement } from "@/hooks/useHelpManagement";
import { InstitutionalLoadingState } from "@/components/ui/institutional-states";

/**
 * HELP PROTECTED ROUTE — SYSTEM CONSOLE
 * 
 * Gates access to Help management pages within System Console.
 * 
 * Access requires:
 * - Active authentication
 * - platform_admin OR can_manage_help capability
 * 
 * This is company-scoped, NOT organization/tenant-scoped.
 */

interface HelpProtectedRouteProps {
  children: ReactNode;
}

export function HelpProtectedRoute({ children }: HelpProtectedRouteProps) {
  const { accessState, isPlatformAdmin } = useAuth();
  const { canManageHelp, accessLoading } = useHelpManagement();

  // Loading state
  if (accessState === "loading" || accessLoading) {
    return (
      <div 
        className="min-h-full flex items-center justify-center py-16"
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

  // No access — show clean restricted page within System Console context
  if (!isPlatformAdmin && !canManageHelp) {
    return (
      <div 
        className="min-h-full flex items-center justify-center py-16 px-4"
        style={{ backgroundColor: 'var(--platform-canvas)' }}
      >
        <div className="text-center max-w-md">
          <h2 
            className="text-[18px] font-medium mb-2"
            style={{ color: 'var(--platform-text)' }}
          >
            Access restricted
          </h2>
          <p 
            className="text-[13px]"
            style={{ color: 'var(--platform-text-muted)' }}
          >
            You don't have permission to manage Help content. Contact a platform administrator to request access.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
