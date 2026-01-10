import { Navigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";

/**
 * Smart redirect component for the root route.
 * Redirects authenticated users to their role-appropriate dashboard.
 * Redirects unauthenticated users to sign-in.
 */
export default function RootRedirect() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Not authenticated - go to sign in
  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // Authenticated but no profile - account not provisioned
  if (!profile) {
    return <Navigate to="/auth/error" replace />;
  }

  // Account suspended
  if (profile.status !== "active") {
    return <Navigate to="/auth/error" replace />;
  }

  // Redirect based on role
  const roleRoutes: Record<UserRole, string> = {
    admin: "/admin",
    client: "/dashboard",
    licensing: "/licensing",
  };

  return <Navigate to={roleRoutes[profile.role]} replace />;
}
