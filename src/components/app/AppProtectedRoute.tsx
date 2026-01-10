import { ReactNode, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth, PortalContext } from "@/contexts/AuthContext";

interface AppProtectedRouteProps {
  children: ReactNode;
  requiredContext?: PortalContext;
}

export function AppProtectedRoute({ children, requiredContext }: AppProtectedRouteProps) {
  const { 
    user, 
    loading, 
    activeTenant, 
    activeContext, 
    hasPendingApproval,
    canAccessContext,
    setActiveContext,
    isPlatformAdmin,
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle deep-linking: if user navigates to a context they have access to but isn't active
    if (requiredContext && activeContext !== requiredContext && canAccessContext(requiredContext)) {
      setActiveContext(requiredContext);
    }
  }, [requiredContext, activeContext, canAccessContext, setActiveContext]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-[15px] text-[#71717A]">Loading...</p>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  // Platform admins bypass tenant requirements
  if (isPlatformAdmin) {
    return <>{children}</>;
  }

  // Authenticated but no active membership (pending approval)
  if (hasPendingApproval) {
    return <Navigate to="/app/pending" replace />;
  }

  // No active tenant selected
  if (!activeTenant) {
    return <Navigate to="/app/pending" replace />;
  }

  // Check context access for specific routes
  if (requiredContext && !canAccessContext(requiredContext)) {
    // Redirect to the context they do have access to
    if (activeContext) {
      return <Navigate to={`/app/${activeContext}`} replace />;
    }
    return <Navigate to="/app/pending" replace />;
  }

  return <>{children}</>;
}
