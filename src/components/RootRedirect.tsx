import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Smart redirect component for the root route.
 * Redirects to appropriate dashboard based on auth state and context.
 */
export default function RootRedirect() {
  const { user, profile, loading, isPlatformAdmin, activeContext, hasPendingApproval } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-[15px] text-[#71717A]">Loading...</p>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // No profile or suspended
  if (!profile || profile.status !== "active") {
    return <Navigate to="/auth/error" replace />;
  }

  // Platform admin goes to admin dashboard
  if (isPlatformAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Pending approval
  if (hasPendingApproval) {
    return <Navigate to="/app/pending" replace />;
  }

  // Redirect to active context dashboard
  if (activeContext) {
    return <Navigate to={`/app/${activeContext}`} replace />;
  }

  // Fallback
  return <Navigate to="/app/licensing" replace />;
}
