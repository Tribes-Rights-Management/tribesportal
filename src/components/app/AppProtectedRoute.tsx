import { ReactNode, useEffect, useRef } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth, PortalContext } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AppProtectedRouteProps {
  children: ReactNode;
  requiredContext?: PortalContext;
}

export function AppProtectedRoute({ children, requiredContext }: AppProtectedRouteProps) {
  const { 
    accessState,
    activeTenant, 
    activeContext, 
    canAccessContext,
    setActiveContext,
    isPlatformAdmin,
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const hasAutoSwitched = useRef(false);

  useEffect(() => {
    // Handle deep-linking: if user navigates to a context they have access to but isn't active
    if (
      requiredContext && 
      activeContext !== requiredContext && 
      canAccessContext(requiredContext) &&
      !hasAutoSwitched.current
    ) {
      hasAutoSwitched.current = true;
      setActiveContext(requiredContext);
      
      // Show subtle notification about context switch
      const contextLabel = requiredContext === "licensing" ? "Licensing" : "Publishing";
      toast.info(`Switched to ${contextLabel} mode`, {
        duration: 2000,
        position: "bottom-center",
      });
    }
  }, [requiredContext, activeContext, canAccessContext, setActiveContext]);

  // Reset auto-switch flag when location changes
  useEffect(() => {
    hasAutoSwitched.current = false;
  }, [location.pathname]);

  // Handle loading state — predictable, not fast
  if (accessState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-[14px] text-muted-foreground">Loading data</p>
      </div>
    );
  }

  // Not authenticated
  if (accessState === "unauthenticated") {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  // No profile or suspended profile
  if (accessState === "no-profile" || accessState === "suspended-profile") {
    return <Navigate to="/auth/error" replace />;
  }

  // Platform admins bypass tenant requirements
  if (isPlatformAdmin) {
    return <>{children}</>;
  }

  // Route based on access state
  switch (accessState) {
    case "no-access-request":
      return <Navigate to="/auth/unauthorized" replace />;
    case "pending-approval":
      return <Navigate to="/auth/unauthorized" replace />;
    case "suspended-access":
      return <Navigate to="/app/suspended" replace />;
  }

  // No active tenant selected (shouldn't happen if active, but safety check)
  if (!activeTenant) {
    return <Navigate to="/auth/unauthorized" replace />;
  }

  // Check context access for specific routes
  if (requiredContext && !canAccessContext(requiredContext)) {
    // User tried to access a context they don't have permission for
    // Show notification and redirect to their allowed context
    if (activeContext) {
      const requestedLabel = requiredContext === "licensing" ? "Licensing" : "Publishing";
      toast.error(`${requestedLabel} access not available`, {
        description: "You've been redirected to your available portal.",
        duration: 3000,
        position: "bottom-center",
      });
      return <Navigate to={`/app/${activeContext}`} replace />;
    }
    return <Navigate to="/auth/unauthorized" replace />;
  }

  return <>{children}</>;
}