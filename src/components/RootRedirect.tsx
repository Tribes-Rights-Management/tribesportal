import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Smart redirect component for the root route.
 * Routes to appropriate destination based on access state.
 */
export default function RootRedirect() {
  const { accessState, activeContext, isPlatformAdmin } = useAuth();

  // Loading — predictable, not fast
  if (accessState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
        <p className="text-[14px] text-[#6B6B6B]">Loading data</p>
      </div>
    );
  }

  // Not authenticated
  if (accessState === "unauthenticated") {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // No profile or suspended profile
  if (accessState === "no-profile" || accessState === "suspended-profile") {
    return <Navigate to="/auth/error" replace />;
  }

  // Platform admin goes to admin dashboard
  if (isPlatformAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Route based on access state
  switch (accessState) {
    case "no-access-request":
      return <Navigate to="/auth/unauthorized" replace />;
    case "pending-approval":
      return <Navigate to="/auth/unauthorized" replace />;
    case "suspended-access":
      return <Navigate to="/app/suspended" replace />;
    case "active":
      // Redirect to active context dashboard
      if (activeContext) {
        return <Navigate to={`/app/${activeContext}`} replace />;
      }
      // Fallback
      return <Navigate to="/app/licensing" replace />;
    default:
      return <Navigate to="/auth/sign-in" replace />;
  }
}